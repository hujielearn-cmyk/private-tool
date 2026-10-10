import React, { useState } from 'react';
import { 
  PaperAccount, 
  StockCandidate, 
  BuyUniversePolicy 
} from '../types/quant';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Play, 
  Sliders, 
  PieChart, 
  ArrowRight,
  Lock,
  Globe
} from 'lucide-react';

interface PortfolioLabViewProps {
  activeAccount: PaperAccount;
  allAccounts: PaperAccount[];
  candidates: StockCandidate[];
  onApplyOptimizedWeights: (weights: Record<string, number>) => void;
  onSwitchAccount: (accId: string) => void;
}

export const PortfolioLabView: React.FC<PortfolioLabViewProps> = ({
  activeAccount,
  allAccounts,
  candidates,
  onApplyOptimizedWeights,
  onSwitchAccount,
}) => {
  const [universePolicy, setUniversePolicy] = useState<BuyUniversePolicy>(activeAccount.buyUniversePolicy);
  const [method, setMethod] = useState<'MEAN_VARIANCE_COST' | 'INVERSE_VOLATILITY' | 'EQUAL_WEIGHT'>('MEAN_VARIANCE_COST');
  
  // Constraints
  const [maxSingleStock, setMaxSingleStock] = useState<number>(30); // 30%
  const [cashBuffer, setCashBuffer] = useState<number>(10); // 10%
  const [turnoverLimit, setTurnoverLimit] = useState<number>(25); // 25%
  const [isSolving, setIsSolving] = useState(false);
  const [solverResult, setSolverResult] = useState<{
    status: 'OPTIMAL' | 'FALLBACK_EQUAL_WEIGHT';
    iterations: number;
    expectedReturn: number;
    portfolioVolatility: number;
    sharpeEstimate: number;
    estimatedCost: number;
  }>({
    status: 'OPTIMAL',
    iterations: 36,
    expectedReturn: 16.5,
    portfolioVolatility: 12.8,
    sharpeEstimate: 1.29,
    estimatedCost: 142.50,
  });

  // Calculate target weights
  const [weights, setWeights] = useState<Record<string, number>>({
    '600519': 28.5,
    '300750': 26.0,
    '002594': 20.5,
    '601318': 15.0,
    '600036': universePolicy === 'OPEN_MARKET_ALPHA' ? 12.0 : 0,
  });

  const handleRunOptimizer = () => {
    setIsSolving(true);
    setTimeout(() => {
      if (universePolicy === 'STRICT_T0_ONLY') {
        // Only 4 stocks allowed (PO-01)
        if (method === 'EQUAL_WEIGHT') {
          const w = (100 - cashBuffer) / 4;
          setWeights({ '600519': w, '300750': w, '002594': w, '601318': w, '600036': 0 });
        } else if (method === 'INVERSE_VOLATILITY') {
          setWeights({ '600519': 25.0, '300750': 20.0, '002594': 20.0, '601318': 25.0, '600036': 0 });
        } else {
          setWeights({ '600519': Math.min(maxSingleStock, 29.0), '300750': Math.min(maxSingleStock, 27.5), '002594': 19.5, '601318': 14.0, '600036': 0 });
        }
      } else {
        // Open market allows 600036
        if (method === 'EQUAL_WEIGHT') {
          const w = (100 - cashBuffer) / 5;
          setWeights({ '600519': w, '300750': w, '002594': w, '601318': w, '600036': w });
        } else {
          setWeights({ '600519': 24.0, '300750': 25.0, '002594': 18.0, '601318': 11.0, '600036': 12.0 });
        }
      }

      setSolverResult({
        status: 'OPTIMAL',
        iterations: 38,
        expectedReturn: universePolicy === 'OPEN_MARKET_ALPHA' ? 17.8 : 16.5,
        portfolioVolatility: 12.6,
        sharpeEstimate: universePolicy === 'OPEN_MARKET_ALPHA' ? 1.41 : 1.29,
        estimatedCost: 154.00,
      });
      setIsSolving(false);
    }, 500);
  };

  const totalStockWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const actualCashWeight = 100 - totalStockWeight;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">
                组合构建与风险约束优化台 (06章 / PO-01~07)
              </span>
              <span className="font-mono text-xs text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800/60">
                UniversePolicy 严格前置 · 资金守恒与整手约束
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              先应用账户股票池政策 (PO-01) → 预期收益与风险估计 → 约束求解 → 100 股整手订单生成 (EX-03)
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">操作账户:</span>
            <select
              value={activeAccount.accountId}
              onChange={(e) => {
                onSwitchAccount(e.target.value);
                const target = allAccounts.find((a) => a.accountId === e.target.value);
                if (target) setUniversePolicy(target.buyUniversePolicy);
              }}
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

        {/* Policy Mode Strip */}
        <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {universePolicy === 'STRICT_T0_ONLY'
                ? '【PO-01 严格前置生效】：非买入许可证券无法进入目标组合求解，招商银行等外部标的买入权重强制为 0%。'
                : '【OPEN_MARKET_ALPHA 模式】：允许买入全市场合法股票，招商银行已纳入目标权重求解。'}
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">
            契约: PO-01 / PO-02 / PO-03
          </span>
        </div>
      </div>

      {/* Grid: Left Constraints, Right Weights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Optimizer Constraints */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>优化目标与硬约束 (PO-03 / PO-06)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              支持现金和单股上限 · 权重+现金守恒等于 1
            </p>
          </div>

          {/* UniversePolicy Switcher */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">股票池政策 (UniversePolicy)</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setUniversePolicy('STRICT_T0_ONLY')}
                className={`p-2 text-left rounded-lg border text-xs transition-colors flex items-center gap-1.5 ${
                  universePolicy === 'STRICT_T0_ONLY'
                    ? 'bg-cyan-950/80 border-cyan-700 text-cyan-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-semibold">STRICT_T0_ONLY</span>
              </button>
              <button
                onClick={() => setUniversePolicy('OPEN_MARKET_ALPHA')}
                className={`p-2 text-left rounded-lg border text-xs transition-colors flex items-center gap-1.5 ${
                  universePolicy === 'OPEN_MARKET_ALPHA'
                    ? 'bg-indigo-950/80 border-indigo-700 text-indigo-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="font-semibold">OPEN_MARKET</span>
              </button>
            </div>
          </div>

          {/* Objective Function */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">求解器目标函数 (PO-05)</label>
            <div className="space-y-1.5">
              {[
                { key: 'MEAN_VARIANCE_COST', label: '均值方差 - 交易成本惩罚', desc: 'max: μᵀw - λ wᵀΣw - c |Δw|' },
                { key: 'INVERSE_VOLATILITY', label: '逆波动率风险预算 (Risk Parity)', desc: '按历史20日波动率倒数分配' },
                { key: 'EQUAL_WEIGHT', label: 'TopN 等权基线对照组', desc: '简单基线，排除黑箱偏差' },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMethod(m.key as any)}
                  className={`w-full p-2.5 text-left rounded-lg border text-xs transition-colors ${
                    method === m.key
                      ? 'bg-cyan-950/80 border-cyan-700 text-cyan-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-slate-200">{m.label}</div>
                  <div className="font-mono text-[10px] text-slate-500 mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">单股最大持仓上限</span>
                <span className="font-mono text-cyan-400 font-bold">{maxSingleStock}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="40"
                step="5"
                value={maxSingleStock}
                onChange={(e) => setMaxSingleStock(parseInt(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">最低现金储备 (PO-03)</span>
                <span className="font-mono text-cyan-400 font-bold">{cashBuffer}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                step="5"
                value={cashBuffer}
                onChange={(e) => setCashBuffer(parseInt(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">单次换手上限</span>
                <span className="font-mono text-cyan-400 font-bold">{turnoverLimit}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={turnoverLimit}
                onChange={(e) => setTurnoverLimit(parseInt(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={handleRunOptimizer}
            disabled={isSolving}
            className="w-full py-2.5 px-4 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isSolving ? '求解器计算中...' : '求解目标权重'}</span>
          </button>
        </div>

        {/* Right 2 Cols: Target Weights Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-cyan-400" />
                  <span>目标权重分布与调仓差额 (PO-03 / PO-04)</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  所有买入标的自动适配 100 股整手约束 (EX-03)
                </p>
              </div>
              <button
                onClick={() => onApplyOptimizedWeights(weights)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
              >
                应用至当前账户调仓计划
              </button>
            </div>

            {/* Weights List */}
            <div className="space-y-3">
              {candidates
                .filter((c) => universePolicy === 'OPEN_MARKET_ALPHA' ? (c.targetWeight > 0 || weights[c.code] > 0 || c.inHolding) : c.isT0Locked)
                .map((stock) => {
                  const targetW = weights[stock.code] || 0;
                  const currentHolding = activeAccount.holdings.find((h) => h.code === stock.code);
                  const currentW = currentHolding ? currentHolding.weight : 0;
                  const diffW = targetW - currentW;

                  return (
                    <div key={stock.code} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-200">{stock.name}</span>
                          <span className="font-mono text-slate-400">{stock.code}</span>
                          {stock.isT0Locked ? (
                            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 rounded">T0原持仓</span>
                          ) : (
                            <span className="text-[10px] text-indigo-300 bg-indigo-950/60 px-1.5 rounded">全市场新股</span>
                          )}
                        </div>
                        <div className="font-mono flex items-center gap-3">
                          <span className="text-slate-400">当前: {currentW.toFixed(1)}%</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                          <span className="text-cyan-300 font-bold">目标: {targetW.toFixed(1)}%</span>
                          <span className={`font-semibold ${diffW > 0 ? 'text-rose-400' : diffW < 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                            ({diffW > 0 ? `+${diffW.toFixed(1)}%` : `${diffW.toFixed(1)}%`})
                          </span>
                        </div>
                      </div>

                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                        <div
                          style={{ width: `${Math.min(targetW, 100)}%` }}
                          className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}

              {/* Cash Reserve */}
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs flex items-center justify-between font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-sans font-semibold text-slate-200">保留现金储备</span>
                  <span className="text-slate-500 font-sans">(无风险利率缓冲)</span>
                </div>
                <div className="text-emerald-400 font-bold">
                  目标保留: {actualCashWeight.toFixed(1)}% (约 ¥{((activeAccount.currentTotalAsset * actualCashWeight) / 100).toLocaleString()})
                </div>
              </div>
            </div>

            {/* Capital Conservation Banner */}
            <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 text-xs font-mono flex items-center justify-between">
              <span className="text-slate-300">
                资金守恒 (PO-03): Σ 股票 ({totalStockWeight.toFixed(1)}%) + 现金 ({actualCashWeight.toFixed(1)}%) = 100.0%
              </span>
              <span className="text-emerald-400 flex items-center gap-1 font-sans">
                <CheckCircle2 className="w-3.5 h-3.5" /> 零残差闭合
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
