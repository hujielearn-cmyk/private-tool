import React, { useState } from 'react';
import { StockCandidate, PaperAccount, FourTrackNavPoint } from '../types/quant';
import { 
  TrendingUp, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldCheck, 
  Download,
  SendHorizontal,
  CheckCircle2,
  Clock,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

interface DailyInvestmentViewProps {
  candidates: StockCandidate[];
  activeAccount: PaperAccount;
  allAccounts: PaperAccount[];
  navPoints: FourTrackNavPoint[];
  onSelectStock: (stock: StockCandidate) => void;
  onExecuteRebalance: () => void;
  onExportCsv: () => void;
  onSwitchAccount: (accId: string) => void;
}

export const DailyInvestmentView: React.FC<DailyInvestmentViewProps> = ({
  candidates,
  activeAccount,
  allAccounts,
  navPoints,
  onSelectStock,
  onExecuteRebalance,
  onExportCsv,
  onSwitchAccount,
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'WHITELIST_ONLY' | 'TOP_SCORE' | 'EXCLUDED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const latestNav = navPoints[navPoints.length - 1];

  const filteredCandidates = candidates.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.includes(searchQuery) ||
      item.industry.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterMode === 'WHITELIST_ONLY') return item.isT0Locked;
    if (filterMode === 'TOP_SCORE') return item.predictedScore >= 75;
    if (filterMode === 'EXCLUDED') return !!item.exclusionReason;
    return true;
  });

  // Calculate planned next-day rebalance orders based on active account
  const plannedRebalanceOrders = candidates
    .filter((candidate) => {
      if (activeAccount.buyUniversePolicy === 'STRICT_T0_ONLY') {
        return candidate.isT0Locked;
      }
      return candidate.targetWeight > 0 || candidate.inHolding;
    })
    .map((candidate) => {
      const currentHolding = activeAccount.holdings.find((h) => h.code === candidate.code);
      const currentShares = currentHolding ? currentHolding.quantity : 0;
      const currentWeight = currentHolding ? currentHolding.weight : 0;
      const targetWeight = candidate.targetWeight;
      const targetValue = (activeAccount.currentTotalAsset * targetWeight) / 100;
      const targetShares = Math.floor(targetValue / candidate.price / 100) * 100; // 100股整数倍 (EX-03)
      const diffShares = targetShares - currentShares;

      return {
        code: candidate.code,
        name: candidate.name,
        price: candidate.price,
        currentShares,
        currentWeight,
        targetShares,
        targetWeight,
        diffShares,
        direction: diffShares > 0 ? ('BUY' as const) : diffShares < 0 ? ('SELL' as const) : ('HOLD' as const),
        estimatedAmount: Math.abs(diffShares) * candidate.price,
        availableToSell: currentHolding ? currentHolding.availableToSell : 0,
      };
    });

  return (
    <div className="space-y-6">
      {/* Top Banner: Market Status & Four-Track Summary Strip */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">
                每日投资决策与盘后选股工作台 (UJ-01 / F-DAY-01)
              </span>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                LightGBM v4.0 · 盘后已完成
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2.5">
              <span>决策时点: 2026-10-10 15:30 盘后批算</span>
              <span>·</span>
              <span>执行窗口: 次交易日 09:30~15:00 模拟撮合 (EX-01~08)</span>
              <span>·</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> PIT 数据已冻结
              </span>
            </div>
          </div>

          {/* Account Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">当前操作账户:</span>
            <select
              value={activeAccount.accountId}
              onChange={(e) => onSwitchAccount(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
            >
              {allAccounts.map((acc) => (
                <option key={acc.accountId} value={acc.accountId}>
                  {acc.name} ({acc.buyUniversePolicy})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Four-Track Summary Cards (同T0四轨净值摘要) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-950/70 rounded-lg border border-cyan-900/50">
            <div className="flex items-center justify-between text-slate-400">
              <span>轨道A: 影子A (原股受限)</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
            </div>
            <div className="text-lg font-bold font-mono text-cyan-400 mt-1">
              {latestNav.shadowA_Nav.toFixed(3)} (+5.8%)
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">STRICT_T0 · 超额 +2.34%</div>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-lg border border-indigo-900/50">
            <div className="flex items-center justify-between text-slate-400">
              <span>轨道B: 影子B (全市场)</span>
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
            </div>
            <div className="text-lg font-bold font-mono text-indigo-300 mt-1">
              {latestNav.shadowB_Nav.toFixed(3)} (+7.3%)
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">OPEN_MARKET · 超额 +3.76%</div>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-lg border border-emerald-900/50">
            <div className="flex items-center justify-between text-slate-400">
              <span>轨道C: 被动持有基准</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
              {latestNav.passiveC_Nav.toFixed(3)} (+3.5%)
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">BUY_AND_HOLD · 无调仓</div>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-lg border border-amber-900/50">
            <div className="flex items-center justify-between text-slate-400">
              <span>轨道D: 真实券商实盘</span>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <div className="text-lg font-bold font-mono text-amber-400 mt-1">
              {latestNav.actualD_Nav.toFixed(3)} (+4.1%)
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">TWR 现金流调整 · 只读对照</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Candidates, Right Next-Day Actionable Plan */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2 Cols: Candidate Stocks Table */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterMode === 'ALL'
                    ? 'bg-slate-800 text-cyan-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                全部候选 ({candidates.length})
              </button>
              <button
                onClick={() => setFilterMode('WHITELIST_ONLY')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterMode === 'WHITELIST_ONLY'
                    ? 'bg-slate-800 text-cyan-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                T0 原持仓白名单 ({candidates.filter((c) => c.isT0Locked).length})
              </button>
              <button
                onClick={() => setFilterMode('TOP_SCORE')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterMode === 'TOP_SCORE'
                    ? 'bg-slate-800 text-cyan-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                高分优先 (&gt;75分)
              </button>
              <button
                onClick={() => setFilterMode('EXCLUDED')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterMode === 'EXCLUDED'
                    ? 'bg-slate-800 text-cyan-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                风控拦截标的
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="搜索代码 / 名称 / 行业..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48 sm:w-60"
              />
            </div>
          </div>

          {/* Candidates Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                    <th className="py-3 px-3.5 font-medium">标的 / 行业</th>
                    <th className="py-3 px-3 font-medium text-right">最新价 / 涨跌</th>
                    <th className="py-3 px-3 font-medium text-right">RVOL20 (BH-01)</th>
                    <th className="py-3 px-3 font-medium text-right">LightGBM 预测分</th>
                    <th className="py-3 px-3 font-medium">行为信号与周期</th>
                    <th className="py-3 px-3 font-medium text-right">目标权重</th>
                    <th className="py-3 px-3 font-medium text-center">池政策约束</th>
                    <th className="py-3 px-3.5 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredCandidates.map((stock) => (
                    <tr
                      key={stock.code}
                      onClick={() => onSelectStock(stock)}
                      className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    >
                      {/* Name & Code */}
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors">
                          {stock.name}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{stock.code}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-500 truncate max-w-[100px]">{stock.industry}</span>
                        </div>
                      </td>

                      {/* Price & Change */}
                      <td className="py-3 px-3 text-right font-mono">
                        <div className="font-medium text-slate-200">
                          ¥{stock.price.toFixed(2)}
                        </div>
                        <div className={`text-[11px] flex items-center justify-end gap-0.5 ${stock.changePercent >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </div>
                      </td>

                      {/* RVOL20 */}
                      <td className="py-3 px-3 text-right font-mono">
                        <span className={`font-semibold ${stock.rvol20 >= 1.8 ? 'text-cyan-400' : 'text-slate-400'}`}>
                          {stock.rvol20.toFixed(2)}x
                        </span>
                        <div className="text-[10px] text-slate-500">
                          {stock.amountPercentile.toFixed(0)}%分位
                        </div>
                      </td>

                      {/* Score */}
                      <td className="py-3 px-3 text-right font-mono">
                        <div className={`font-bold ${stock.predictedScore >= 80 ? 'text-emerald-400' : stock.predictedScore >= 70 ? 'text-cyan-300' : 'text-slate-400'}`}>
                          {stock.predictedScore.toFixed(1)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          +{stock.expectedReturn5D.toFixed(1)}% (5D)
                        </div>
                      </td>

                      {/* Signal */}
                      <td className="py-3 px-3">
                        <div className="inline-block text-[11px] font-medium text-slate-200 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                          {stock.signalLabel}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {stock.stage}
                        </div>
                      </td>

                      {/* Weight */}
                      <td className="py-3 px-3 text-right font-mono">
                        <div className="font-semibold text-indigo-300">
                          {stock.targetWeight > 0 ? `${stock.targetWeight.toFixed(1)}%` : '-'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {stock.inHolding ? '已持仓' : '未持仓'}
                        </div>
                      </td>

                      {/* Policy restriction */}
                      <td className="py-3 px-3 text-center">
                        {stock.isT0Locked ? (
                          <span className="text-[11px] text-emerald-400 font-medium bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50">
                            T0 原持仓
                          </span>
                        ) : activeAccount.buyUniversePolicy === 'OPEN_MARKET_ALPHA' ? (
                          <span className="text-[11px] text-cyan-300 font-medium bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/50">
                            全市场开放可买
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-400 font-medium bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50" title={stock.exclusionReason}>
                            影子A受限拦截
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStock(stock);
                          }}
                          className="px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded text-xs transition-colors"
                        >
                          证据卡片
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Actionable Next-Day Rebalance Plan (F-DAY-02) */}
        <div className="space-y-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>次交易日调仓清单 (F-DAY-02)</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  账户: <strong className="text-slate-200">{activeAccount.name}</strong>
                </p>
              </div>

              <button
                onClick={onExportCsv}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="导出人工参考交易清单 CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* Orders Summary List */}
            <div className="space-y-2.5">
              {plannedRebalanceOrders.map((order) => (
                <div
                  key={order.code}
                  className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-200">{order.name}</span>
                      <span className="font-mono text-[11px] text-slate-400">{order.code}</span>
                    </div>
                    <div>
                      {order.direction === 'BUY' ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
                          买入 +{order.diffShares} 股
                        </span>
                      ) : order.direction === 'SELL' ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          卖出 {order.diffShares} 股
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                          维持持仓不变
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-[11px] font-mono">
                    <div>
                      <div className="text-slate-500">当前持仓</div>
                      <div className="text-slate-300">{order.currentShares} 股 ({order.currentWeight.toFixed(1)}%)</div>
                    </div>
                    <div>
                      <div className="text-slate-500">目标持仓</div>
                      <div className="text-cyan-300">{order.targetShares} 股 ({order.targetWeight.toFixed(1)}%)</div>
                    </div>
                    <div>
                      <div className="text-slate-500">预估现金影响</div>
                      <div className="text-slate-300">
                        {order.diffShares !== 0 ? `¥${(Math.abs(order.diffShares) * order.price).toLocaleString()}` : '¥0'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Fee & Cash Impact */}
            <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span className="font-sans">预估印花税 (0.05% 仅卖出):</span>
                <span className="text-slate-300">¥18.40</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span className="font-sans">佣金 (万2.5) + 滑点估算:</span>
                <span className="text-slate-300">¥46.50</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span className="font-sans">调仓后预留现金储备:</span>
                <span className="text-emerald-400 font-bold">¥{activeAccount.freeCash.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={onExecuteRebalance}
              className="w-full py-2.5 px-4 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 active:scale-95"
            >
              <SendHorizontal className="w-4 h-4" />
              <span>执行该计划并驱动 Paper 统一模拟撮合</span>
            </button>
            <p className="text-[10px] text-slate-500 text-center">
              * 计划不等于成交；次日将严格按 A 股 T+1、涨跌停、100股整手与现金约束执行撮合。
            </p>
          </div>

          {/* Export Notice */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs space-y-2">
            <div className="flex items-center justify-between font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                <span>人工交易清单导出 (F-DAY-03)</span>
              </span>
              <button
                onClick={onExportCsv}
                className="text-cyan-400 hover:underline text-[11px] font-mono"
              >
                下载 CSV
              </button>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              支持纯本地导出非委托性质的人工参考清单，包含代码、目标股数、建议价格区间与风险提醒，未授权前系统绝不连接 Broker 实盘自动下单。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
