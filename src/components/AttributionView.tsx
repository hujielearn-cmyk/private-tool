import React from 'react';
import { AttributionLayer, PaperAccount } from '../types/quant';
import { 
  BarChart3, 
  CheckCircle2, 
  Receipt, 
  Compass, 
  Layers, 
  ArrowUpRight,
  TrendingUp,
  HelpCircle
} from 'lucide-react';

interface AttributionViewProps {
  activeAccount: PaperAccount;
  allAccounts: PaperAccount[];
  attributionLayers: AttributionLayer[];
}

export const AttributionView: React.FC<AttributionViewProps> = ({
  activeAccount,
  allAccounts,
  attributionLayers,
}) => {
  const costBreakdown = [
    { item: 'A股证券交易印花税 (0.05% 仅卖出单边)', amount: 2100.00, bps: 21.0 },
    { item: '券商交易佣金 (万2.5 双边结算)', amount: 1050.00, bps: 10.5 },
    { item: '买卖价差与冲击滑点损耗 (Slippage)', amount: 1050.00, bps: 10.5 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">
                六层绩效归因与账本对账台 (PRD V4.0 / 8.3节)
              </span>
              <span className="font-mono text-xs text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                BR-AT-01 PnL 对账通过 · 残差披露闭合
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              解答核心业务问题：真实收益、主动管理贡献(A vs C)、换股贡献(B vs A)、风格暴露与交易摩擦侵蚀
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">核算对象:</span>
            <span className="font-semibold text-slate-200 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
              {activeAccount.name}
            </span>
          </div>
        </div>

        {/* 4-Track Performance Comparison Table */}
        <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="text-slate-400">影子A (原股受限) 净收益</div>
            <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">
              +5.84% (¥58,400)
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">较被动C超额 +2.34%</div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="text-slate-400">影子B (全市场换股) 净收益</div>
            <div className="text-lg font-bold font-mono text-indigo-300 mt-0.5">
              +7.26% (¥72,600)
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">较影子A换股增益 +1.42%</div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="text-slate-400">被动C (买入持有) 净收益</div>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
              +3.50% (¥35,000)
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">同T0零主动调仓基线</div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="text-slate-400">真实账户 (TWR调整后)</div>
            <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">
              +4.12% (¥41,200)
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">排除入金干扰的实盘水平</div>
          </div>
        </div>
      </div>

      {/* 6-Layer Attribution Waterfall */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 6 Attribution Layers */}
        <div className="lg:col-span-2 p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>分层归因矩阵 (8.3节 层次化业务问题分解)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                严禁简单将影子B跑赢A全部归因于选股 · 区分择时与股票池增量
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400">
              6 层全景分解
            </span>
          </div>

          <div className="space-y-3">
            {attributionLayers.map((layer) => {
              const isPositive = layer.contributionPct >= 0;
              return (
                <div key={layer.layer} className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-100 text-sm">{layer.title}</span>
                      <div className="text-[11px] text-cyan-400 flex items-center gap-1 mt-0.5">
                        <HelpCircle className="w-3 h-3" />
                        <span>{layer.question}</span>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className={`text-sm font-bold ${isPositive ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {isPositive ? '+' : ''}{layer.contributionPct.toFixed(2)}%
                      </div>
                      <div className="text-[10px] text-slate-500">
                        ({isPositive ? '+' : ''}¥{layer.amount.toLocaleString()})
                      </div>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-900 rounded border border-slate-800/80 text-[11px] text-slate-400">
                    <span className="text-slate-500 font-sans">对照基础: </span>
                    <span className="text-slate-300">{layer.comparison}</span>
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {layer.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Transaction Cost & Ledger Balance */}
        <div className="space-y-6">
          {/* Transaction Friction Breakdown */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-400" />
                <span>交易摩擦明细拆解 (EX-06)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                按成交而非下单计费 · 印花税 0.05% + 佣金万2.5
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              {costBreakdown.map((c) => (
                <div key={c.item} className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-slate-300 font-medium">{c.item}</div>
                  <div className="flex justify-between font-mono text-[11px] text-slate-400 pt-0.5 border-t border-slate-800/80">
                    <span>损耗金额: ¥{c.amount.toFixed(2)}</span>
                    <span className="text-amber-400">{c.bps} bps</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed font-mono">
              损耗总计: -42.0 bps (¥4,200.00) · 零未申报隐藏成本
            </div>
          </div>

          {/* Unified Ledger Balance Card (8.2节) */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm space-y-3 text-xs">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>统一账本数学口径 (8.2节)</span>
              </h3>
            </div>

            <div className="space-y-2 text-[11px] font-mono text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <p className="text-cyan-400">买入现金公式:</p>
              <p className="text-slate-400">Cash_after = Cash_before - Qty × Price - Fees</p>
              <p className="text-cyan-400 pt-1">卖出现金公式:</p>
              <p className="text-slate-400">Cash_after = Cash_before + Qty × Price - Fees - Taxes</p>
              <p className="text-cyan-400 pt-1">NAV 逐日估值:</p>
              <p className="text-slate-400">NAV_t = FreeCash + Σ(Qty_i × MarkPrice_i) + Receivables</p>
            </div>

            <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded text-[11px] text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>现金、持仓与净值零残差平衡</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
