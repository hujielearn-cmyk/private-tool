import React from 'react';
import { StockCandidate } from '../types/quant';
import { X, CheckCircle2, AlertTriangle, ShieldAlert, ArrowUpRight, ArrowDownRight, Layers, FileText } from 'lucide-react';

interface StockDetailModalProps {
  stock: StockCandidate | null;
  onClose: () => void;
  onAddToShadowPlan?: (stock: StockCandidate) => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({
  stock,
  onClose,
  onAddToShadowPlan,
}) => {
  if (!stock) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white tracking-tight">{stock.name}</span>
                <span className="font-mono text-sm text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                  {stock.code}
                </span>
                <span className="text-xs text-slate-400">
                  {stock.industry}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                <span>时点: 2026-10-10 15:00:00</span>
                <span>·</span>
                <span>周期阶段: {stock.stage}</span>
                <span>·</span>
                <span className={stock.isT0Locked ? 'text-emerald-400' : 'text-amber-400'}>
                  {stock.isT0Locked ? 'T0原持仓标的' : 'T0原持仓外'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-950/60 rounded-lg border border-slate-800">
            <div>
              <div className="text-xs text-slate-400">收盘价格</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                ¥{stock.price.toFixed(2)}
              </div>
              <div className={`text-xs font-mono flex items-center gap-0.5 ${stock.changePercent >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {stock.changePercent >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400">20日量能放大 (RVOL)</div>
              <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">
                {stock.rvol20.toFixed(2)}x
              </div>
              <div className="text-xs text-slate-400">分位数 {stock.amountPercentile.toFixed(1)}%</div>
            </div>

            <div>
              <div className="text-xs text-slate-400">LightGBM 预测得分</div>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                {stock.predictedScore.toFixed(1)}
              </div>
              <div className="text-xs text-slate-400">预期5日收益 +{stock.expectedReturn5D.toFixed(2)}%</div>
            </div>

            <div>
              <div className="text-xs text-slate-400">目标组合权重</div>
              <div className="text-lg font-bold font-mono text-indigo-300 mt-0.5">
                {stock.targetWeight.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-400">{stock.inHolding ? '已在持仓中' : '未持仓'}</div>
            </div>
          </div>

          {/* Exclusion Warning if not tradable */}
          {stock.exclusionReason && (
            <div className="p-3.5 bg-amber-950/30 border border-amber-800/60 rounded-lg flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-amber-300 text-xs">交易约束拦截提示</div>
                <div className="text-xs text-amber-200/90 mt-0.5 leading-relaxed">
                  {stock.exclusionReason}
                </div>
              </div>
            </div>
          )}

          {/* Behavioral Hypothesis & Competitive Interpretation */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>行为假说与多级证据链 (BH-01~04 / 09章)</span>
            </div>

            <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">当前判定假说</span>
                <span className="text-xs font-mono text-cyan-300 px-2 py-0.5 bg-cyan-950/80 rounded border border-cyan-800/80">
                  {stock.signalLabel}
                </span>
              </div>

              {/* Evidence Tree */}
              <div className="space-y-2">
                {stock.evidenceList.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2 bg-slate-900/60 rounded border border-slate-800/80 text-xs">
                    {item.status === 'SUPPORT' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : item.status === 'CONTRADICT' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    ) : (
                      <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-slate-300 font-medium">{item.ruleId}</span>
                        <span className="font-mono text-slate-400">{item.value}</span>
                      </div>
                      <div className="text-slate-400 mt-0.5">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Invalidation Condition (证伪与失效边界) */}
          <div className="p-4 bg-slate-800/30 border border-slate-800 rounded-lg space-y-2">
            <div className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>假说证伪与失效条件 (BA-02 / 可证伪性要求)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {stock.counterEvidence}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {stock.supportConditions.map((cond, i) => (
                <span key={i} className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  前提条件 {i + 1}: {cond}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <div className="text-xs text-slate-500 font-mono">
            严格遵守 PIT 时间语义 · 严禁未来信息泄漏
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              关闭
            </button>
            {stock.isT0Locked && onAddToShadowPlan && (
              <button
                onClick={() => {
                  onAddToShadowPlan(stock);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-medium text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors font-semibold"
              >
                加入影子账户调仓计划
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
