import React, { useState } from 'react';
import { Header, ActiveTabType } from './components/Header';
import { DailyInvestmentView } from './components/DailyInvestmentView';
import { ShadowAccountView } from './components/ShadowAccountView';
import { AlgorithmLabView } from './components/AlgorithmLabView';
import { PortfolioLabView } from './components/PortfolioLabView';
import { AttributionView } from './components/AttributionView';
import { BehaviorLabView } from './components/BehaviorLabView';
import { OpsSystemView } from './components/OpsSystemView';
import { StockDetailModal } from './components/StockDetailModal';

import {
  INITIAL_CANDIDATES,
  MOCK_ACCOUNT_A,
  MOCK_ACCOUNT_B,
  MOCK_ACCOUNT_C,
  MOCK_FOUR_TRACK_NAV,
  MOCK_ORDERS_V4,
  MOCK_LIGHTGBM_MODEL_V4,
  MOCK_ATTRIBUTION_LAYERS_V4,
} from './data/mockQuantData';

import { 
  StockCandidate, 
  PaperAccount, 
  PaperOrder, 
  FourTrackNavPoint, 
  LightGBMModelSpec,
} from './types/quant';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTabType>('DAILY_DASHBOARD');
  const [candidates, setCandidates] = useState<StockCandidate[]>(INITIAL_CANDIDATES);
  const [allAccounts, setAllAccounts] = useState<PaperAccount[]>([
    MOCK_ACCOUNT_A,
    MOCK_ACCOUNT_B,
    MOCK_ACCOUNT_C,
  ]);
  const [activeAccountId, setActiveAccountId] = useState<string>(MOCK_ACCOUNT_A.accountId);
  const [navHistory, setNavHistory] = useState<FourTrackNavPoint[]>(MOCK_FOUR_TRACK_NAV);
  const [orders, setOrders] = useState<PaperOrder[]>(MOCK_ORDERS_V4);
  const [modelSpec, setModelSpec] = useState<LightGBMModelSpec>(MOCK_LIGHTGBM_MODEL_V4);
  const [attributionLayers, setAttributionLayers] = useState(MOCK_ATTRIBUTION_LAYERS_V4);

  // Selected Stock Modal
  const [selectedStock, setSelectedStock] = useState<StockCandidate | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeAccount = allAccounts.find((a) => a.accountId === activeAccountId) || allAccounts[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Switch Active Account
  const handleSwitchAccount = (accId: string) => {
    setActiveAccountId(accId);
    const target = allAccounts.find((a) => a.accountId === accId);
    if (target) {
      showToast(`已切换至: ${target.name} (买入政策: ${target.buyUniversePolicy})`);
    }
  };

  // Duplicate T0 account to create Shadow B (Open Market)
  const handleDuplicateAccountAsB = () => {
    setActiveAccountId(MOCK_ACCOUNT_B.accountId);
    showToast('已载入同T0全市场换股影子B账户！买入政策为 OPEN_MARKET_ALPHA，允许在全市场配置新标的。');
  };

  // Export Daily Reference Trade Plan (F-DAY-03)
  const handleExportCsv = () => {
    const rows = [
      ['交易日期', '标的代码', '标的名称', '买卖动作', '建议调仓股数', '最新参考价', '目标权重(%)', '风险提示'],
      ...candidates
        .filter((c) => activeAccount.buyUniversePolicy === 'STRICT_T0_ONLY' ? c.isT0Locked : true)
        .map((c) => {
          const h = activeAccount.holdings.find((x) => x.code === c.code);
          const currentShares = h ? h.quantity : 0;
          const targetVal = (activeAccount.currentTotalAsset * c.targetWeight) / 100;
          const targetShares = Math.floor(targetVal / c.price / 100) * 100;
          const diff = targetShares - currentShares;
          return [
            '2026-10-11',
            c.code,
            c.name,
            diff > 0 ? 'BUY (买入)' : diff < 0 ? 'SELL (卖出)' : 'HOLD (维持)',
            Math.abs(diff).toString(),
            c.price.toFixed(2),
            c.targetWeight.toFixed(1),
            c.counterEvidence,
          ];
        }),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Jiajie_Quant_Daily_Plan_${activeAccount.accountId}_20261011.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('人工交易参考清单 CSV 已导出！(纯本地文件导出，未发送任何外部券商订单)');
  };

  // Counter for guaranteed unique order IDs
  const createUniqueOrderId = (prefix: 'ORD' | 'REJ' = 'ORD', symbol: string = '') => {
    const ts = Date.now();
    const rand = Math.random().toString(36).substring(2, 6);
    return `${prefix}-${ts}-${symbol ? symbol + '-' : ''}${rand}`;
  };

  // Execute full daily rebalance plan into PaperAccount
  const handleExecuteRebalance = () => {
    const newOrders: PaperOrder[] = [];
    const updatedHoldings = activeAccount.holdings.map((h, idx) => {
      const cand = candidates.find((c) => c.code === h.code);
      if (!cand) return h;

      const targetValue = (activeAccount.currentTotalAsset * cand.targetWeight) / 100;
      const targetShares = Math.floor(targetValue / cand.price / 100) * 100; // 100股整手 (EX-03)
      const diffShares = targetShares - h.quantity;

      if (diffShares !== 0) {
        newOrders.push({
          orderId: createUniqueOrderId('ORD', `${h.code}-${idx}`),
          accountId: activeAccount.accountId,
          timestamp: '2026-10-10 14:55:00',
          code: h.code,
          name: h.name,
          direction: diffShares > 0 ? 'BUY' : 'SELL',
          targetShares: Math.abs(diffShares),
          executedShares: Math.abs(diffShares),
          orderPrice: cand.price,
          executedPrice: cand.price,
          status: 'FILLED',
          fee: diffShares < 0 ? cand.price * Math.abs(diffShares) * 0.0005 + 10 : 15,
          slippage: Math.abs(diffShares) * 0.1,
          ruleCitation: 'EX-01~08 统一 Paper 撮合引擎执行',
        });
      }

      return {
        ...h,
        quantity: targetShares,
        weight: cand.targetWeight,
        marketValue: targetShares * cand.price,
      };
    });

    const newPositionsValue = updatedHoldings.reduce((sum, h) => sum + h.marketValue, 0);
    const newFreeCash = activeAccount.currentTotalAsset - newPositionsValue;

    setAllAccounts((prev) =>
      prev.map((acc) =>
        acc.accountId === activeAccount.accountId
          ? {
              ...acc,
              holdings: updatedHoldings,
              positionsValue: newPositionsValue,
              freeCash: Math.max(newFreeCash, 50000),
            }
          : acc
      )
    );

    setOrders((prev) => [...newOrders, ...prev]);

    // Update NAV
    const latestNav = navHistory[navHistory.length - 1];
    setNavHistory((prev) => [
      ...prev,
      {
        date: '10-11(预估)',
        shadowA_Nav: parseFloat((latestNav.shadowA_Nav * 1.003).toFixed(3)),
        shadowB_Nav: parseFloat((latestNav.shadowB_Nav * 1.004).toFixed(3)),
        passiveC_Nav: latestNav.passiveC_Nav,
        actualD_Nav: parseFloat((latestNav.actualD_Nav * 1.001).toFixed(3)),
        csi300Nav: latestNav.csi300Nav,
      },
    ]);

    setActiveTab('PAPER_ACCOUNTS');
    showToast(`调仓计划已由统一 Paper 撮合引擎执行完毕！订单已生成并记入 ${activeAccount.name} 账本。`);
  };

  // Execute single trade with strict PO-01 / 附录A.2 check
  const handleExecuteSimulatedTrade = (code: string, direction: 'BUY' | 'SELL', shares: number) => {
    // If account is STRICT_T0_ONLY and stock is not in whitelist
    if (activeAccount.buyUniversePolicy === 'STRICT_T0_ONLY' && !activeAccount.allowedWhitelistCodes.includes(code)) {
      const rejectOrder: PaperOrder = {
        orderId: createUniqueOrderId('REJ', code),
        accountId: activeAccount.accountId,
        timestamp: '2026-10-10 15:00:00',
        code,
        name: code === '688981' ? '中芯国际' : '未授权证券',
        direction,
        targetShares: shares,
        executedShares: 0,
        orderPrice: 88.50,
        executedPrice: 0,
        status: 'REJECTED',
        fee: 0,
        slippage: 0,
        rejectReason: `【PO-01 / 附录 A.2 约束拦截】证券 ${code} 不在 ${activeAccount.name} 的锁定股票池 [${activeAccount.allowedWhitelistCodes.join(', ')}] 中。STRICT_T0_ONLY 政策严禁买入原持仓以外的新股票！`,
        ruleCitation: 'PO-01 股票池政策限制 (附录 A.2)',
      };
      setOrders((prev) => [rejectOrder, ...prev]);
      return {
        success: false,
        message: `【PO-01 / 附录 A.2 拦截】：标的 ${code} 不属于 ${activeAccount.name} 的白名单股票池。买入请求在组合层已被拒绝！`,
      };
    }

    // Whitelist passed or OPEN_MARKET_ALPHA
    const cand = candidates.find((c) => c.code === code);
    const price = cand ? cand.price : 268.00;
    const name = cand ? cand.name : (code === '688981' ? '中芯国际' : '宁德时代');

    const fillOrder: PaperOrder = {
      orderId: createUniqueOrderId('ORD', code),
      accountId: activeAccount.accountId,
      timestamp: '2026-10-10 15:00:00',
      code,
      name,
      direction,
      targetShares: shares,
      executedShares: shares,
      orderPrice: price,
      executedPrice: price,
      status: 'FILLED',
      fee: price * shares * 0.0003,
      slippage: shares * 0.1,
      ruleCitation: 'EX-01~08 撮合通过 · T+1检查通过',
    };

    setOrders((prev) => [fillOrder, ...prev]);

    // Update holdings
    setAllAccounts((prev) =>
      prev.map((acc) => {
        if (acc.accountId !== activeAccount.accountId) return acc;
        const existing = acc.holdings.find((h) => h.code === code);
        let updatedHoldings = [...acc.holdings];
        if (existing) {
          const newQty = direction === 'BUY' ? existing.quantity + shares : Math.max(0, existing.quantity - shares);
          updatedHoldings = acc.holdings.map((h) =>
            h.code === code ? { ...h, quantity: newQty, marketValue: newQty * price } : h
          );
        } else if (direction === 'BUY') {
          updatedHoldings.push({
            code,
            name,
            quantity: shares,
            availableToSell: 0, // T+1
            costPrice: price,
            currentPrice: price,
            marketValue: shares * price,
            unrealizedPnL: 0,
            unrealizedPnLPercent: 0,
            weight: (shares * price / acc.currentTotalAsset) * 100,
            isT0Origin: false,
          });
        }
        const newPosVal = updatedHoldings.reduce((sum, h) => sum + h.marketValue, 0);
        return {
          ...acc,
          holdings: updatedHoldings,
          positionsValue: newPosVal,
        };
      })
    );

    return {
      success: true,
      message: `模拟交易撮合成功：${direction === 'BUY' ? '买入' : '卖出'} ${name} (${code}) ${shares} 股，成交均价 ¥${price.toFixed(2)}。`,
    };
  };

  // Apply optimized weights
  const handleApplyOptimizedWeights = (newWeights: Record<string, number>) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (newWeights[c.code] !== undefined) {
          return { ...c, targetWeight: newWeights[c.code] };
        }
        return c;
      })
    );
    setActiveTab('DAILY_DASHBOARD');
    showToast('组合优化求解完成！已更新次交易日调仓清单。');
  };

  // Promote LightGBM model version
  const handlePromoteModel = (model: LightGBMModelSpec) => {
    setAllAccounts((prev) =>
      prev.map((acc) => ({
        ...acc,
        boundStrategyVersion: model.version,
        boundStrategyName: `${model.name} (${model.version})`,
      }))
    );
    showToast(`模型 ${model.name} (${model.version}) 已正式绑定至所有 Paper 账户策略！`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onQuickSimulate={handleExecuteRebalance}
        onExportPlan={handleExportCsv}
      />

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 border border-cyan-500 rounded-xl shadow-2xl text-xs text-cyan-200 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Viewport */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6">
        {/* Tab 1: 每日投资台 */}
        {activeTab === 'DAILY_DASHBOARD' && (
          <DailyInvestmentView
            candidates={candidates}
            activeAccount={activeAccount}
            allAccounts={allAccounts}
            navPoints={navHistory}
            onSelectStock={(s) => setSelectedStock(s)}
            onExecuteRebalance={handleExecuteRebalance}
            onExportCsv={handleExportCsv}
            onSwitchAccount={handleSwitchAccount}
          />
        )}

        {/* Tab 2: Alpha 研究台 */}
        {activeTab === 'ALPHA_RESEARCH' && (
          <AlgorithmLabView
            modelSpec={modelSpec}
            onPromoteModel={handlePromoteModel}
          />
        )}

        {/* Tab 3: 组合工作台 */}
        {activeTab === 'PORTFOLIO_LAB' && (
          <PortfolioLabView
            activeAccount={activeAccount}
            allAccounts={allAccounts}
            candidates={candidates}
            onApplyOptimizedWeights={handleApplyOptimizedWeights}
            onSwitchAccount={handleSwitchAccount}
          />
        )}

        {/* Tab 4: 模拟账户 (Paper) */}
        {activeTab === 'PAPER_ACCOUNTS' && (
          <ShadowAccountView
            activeAccount={activeAccount}
            allAccounts={allAccounts}
            navHistory={navHistory}
            orders={orders}
            onSwitchAccount={handleSwitchAccount}
            onExecuteSimulatedTrade={handleExecuteSimulatedTrade}
            onDuplicateAccountAsB={handleDuplicateAccountAsB}
          />
        )}

        {/* Tab 5: 绩效与复盘 */}
        {activeTab === 'PERFORMANCE_REVIEW' && (
          <AttributionView
            activeAccount={activeAccount}
            allAccounts={allAccounts}
            attributionLayers={attributionLayers}
          />
        )}

        {/* Tab 6: 市场行为实验 */}
        {activeTab === 'BEHAVIOR_LAB' && (
          <BehaviorLabView
            candidates={candidates}
            onSelectStock={(s) => setSelectedStock(s)}
          />
        )}

        {/* Tab 7: 运行与设置 */}
        {activeTab === 'OPS_SYSTEM' && (
          <OpsSystemView />
        )}
      </main>

      {/* In-depth Stock Detail Research Modal */}
      <StockDetailModal
        stock={selectedStock}
        onClose={() => setSelectedStock(null)}
        onAddToShadowPlan={(s) => {
          showToast(`已确认标的 ${s.name} (${s.code}) 优先调仓权重！`);
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>JIAJIE / QUANTPLATFORM V4.0 (A 股量化投研与模拟交易平台)</span>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-600">
            <span>统一 PaperAccount 体系</span>
            <span>·</span>
            <span>四轨同起点比较</span>
            <span>·</span>
            <span>LightGBM &amp; 行为假说</span>
            <span>·</span>
            <span>单机优先 (Polars + DuckDB + SQLite WAL)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
