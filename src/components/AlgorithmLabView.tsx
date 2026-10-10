import React, { useState } from 'react';
import { LightGBMModelSpec } from '../types/quant';
import { 
  Cpu, 
  BarChart3, 
  Layers, 
  CheckCircle2, 
  Play, 
  Sliders, 
  ShieldCheck, 
  GitBranch, 
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface AlgorithmLabViewProps {
  modelSpec: LightGBMModelSpec;
  onPromoteModel: (model: LightGBMModelSpec) => void;
}

export const AlgorithmLabView: React.FC<AlgorithmLabViewProps> = ({
  modelSpec,
  onPromoteModel,
}) => {
  const [activeLoop, setActiveLoop] = useState<'FAST_D1' | 'SLOW_D2'>('SLOW_D2');
  const [taskType, setTaskType] = useState<'RANKER' | 'REGRESSOR' | 'CLASSIFIER'>(modelSpec.taskType);
  const [learningRate, setLearningRate] = useState(modelSpec.learningRate);
  const [numLeaves, setNumLeaves] = useState(modelSpec.numLeaves);
  const [nEstimators, setNEstimators] = useState(modelSpec.nEstimators);
  const [isTraining, setIsTraining] = useState(false);
  const [trainProgress, setTrainProgress] = useState(100);
  const [showPromoteSuccess, setShowPromoteSuccess] = useState(false);

  // Trigger training simulation
  const handleStartTraining = () => {
    setIsTraining(true);
    setTrainProgress(15);
    setTimeout(() => setTrainProgress(45), 400);
    setTimeout(() => setTrainProgress(80), 800);
    setTimeout(() => {
      setTrainProgress(100);
      setIsTraining(false);
    }, 1200);
  };

  const decileReturns = [
    { decile: 'Q1(低分)', returnPct: -2.8 },
    { decile: 'Q2', returnPct: -1.4 },
    { decile: 'Q3', returnPct: -0.5 },
    { decile: 'Q4', returnPct: 0.6 },
    { decile: 'Q5', returnPct: 1.2 },
    { decile: 'Q6', returnPct: 1.9 },
    { decile: 'Q7', returnPct: 2.7 },
    { decile: 'Q8', returnPct: 3.6 },
    { decile: 'Q9', returnPct: 4.5 },
    { decile: 'Q10(高分)', returnPct: 6.2 },
  ];

  return (
    <div className="space-y-6">
      {/* Loop Mode & Research Header */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">
                量化算法与 LightGBM 模型研究工坊 (J02 / FR-11 / FR-17)
              </span>
              <span className="font-mono text-xs text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                LightGBM 4.2.0 · Polars 向量化内核
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              支持特征工程、截面排序/回归任务、滚动Walk-forward验证与严格样本外 (OOS) 独立评价
            </p>
          </div>

          {/* Dual Loop Switcher (3.6节 Fast/Slow 执行模式) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveLoop('FAST_D1')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeLoop === 'FAST_D1'
                  ? 'bg-slate-800 text-amber-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Fast Loop (D1 快速探索与粗筛)
            </button>
            <button
              onClick={() => setActiveLoop('SLOW_D2')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeLoop === 'SLOW_D2'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Slow Loop (D2 确定性正式验证与PIT)
            </button>
          </div>
        </div>

        {/* Current Loop Policy Warning */}
        <div className="pt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {activeLoop === 'SLOW_D2'
                ? '正式模式协议：强制启用 PIT 时间截点隔离、无幸存者偏差股票池快照、扣除 0.1% 单边交易成本模型。'
                : '探索模式：允许批量参数扫描与快速 IC 计算，此模式下产生的指标禁止直接标记为正式可投资策略。'}
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">
            规范依据: BR-FS-01 ~ BR-FS-05
          </span>
        </div>
      </div>

      {/* Main Grid: Left Model Config, Right OOS Metrics & Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Model Parameters & Training Controls */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>算法模型超参数与训练协议 (ALG-04)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              可替换模型契约 · 训练/验证集严格时间隔离
            </p>
          </div>

          {/* Task Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">预测任务类型 (Task Type)</label>
            <div className="grid grid-cols-3 gap-2">
              {(['RANKER', 'REGRESSOR', 'CLASSIFIER'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTaskType(t)}
                  className={`py-1.5 text-xs font-mono font-medium rounded-lg border transition-colors ${
                    taskType === t
                      ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-slate-500">
              * 首推 Ranker 截面排序目标，直接优化多空 IC 秩相关系数
            </div>
          </div>

          {/* Hyperparameters Sliders */}
          <div className="space-y-4 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">学习率 (learning_rate)</span>
                <span className="font-mono text-cyan-400 font-bold">{learningRate}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.10"
                step="0.01"
                value={learningRate}
                onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">叶子节点数 (num_leaves)</span>
                <span className="font-mono text-cyan-400 font-bold">{numLeaves}</span>
              </div>
              <input
                type="range"
                min="15"
                max="63"
                step="2"
                value={numLeaves}
                onChange={(e) => setNumLeaves(parseInt(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">弱学习器迭代数 (n_estimators)</span>
                <span className="font-mono text-cyan-400 font-bold">{nEstimators}</span>
              </div>
              <input
                type="range"
                min="100"
                max="600"
                step="50"
                value={nEstimators}
                onChange={(e) => setNEstimators(parseInt(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Training Window Details */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs space-y-1.5">
            <div className="text-slate-400">训练截面区间:</div>
            <div className="font-mono text-slate-200 text-[11px]">{modelSpec.trainWindow}</div>
            <div className="text-slate-400 pt-1">严格独立OOS样本外区间:</div>
            <div className="font-mono text-emerald-400 text-[11px]">{modelSpec.oosWindow}</div>
          </div>

          {/* Training Action Button */}
          <button
            onClick={handleStartTraining}
            disabled={isTraining}
            className="w-full py-2.5 px-4 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40"
          >
            {isTraining ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>滚动训练中 ({trainProgress}%)...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>开始滚动训练与 OOS 验证</span>
              </>
            )}
          </button>

          {/* Promotion Button */}
          <button
            onClick={() => {
              onPromoteModel(modelSpec);
              setShowPromoteSuccess(true);
              setTimeout(() => setShowPromoteSuccess(false), 3000);
            }}
            className="w-full py-2 px-3 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700/80 flex items-center justify-center gap-1.5"
          >
            <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
            <span>申请晋级为正式 StrategyVersion</span>
          </button>

          {showPromoteSuccess && (
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-700 rounded text-xs text-emerald-300 text-center animate-in fade-in">
              已成功冻结为正式可绑定的策略版本！可供影子账户消费。
            </div>
          )}
        </div>

        {/* Right 2 Cols: OOS Evaluation Metrics & Feature Importance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top: OOS Performance Dashboard */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span>样本外 (OOS) 独立验证指标 (FR-12-06 / ALG-07)</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  严禁将训练集拟合指标当作真实投资收益 · 包含换手与衰减惩罚
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                {modelSpec.metrics.status}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <div className="text-slate-400">OOS RankIC</div>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                  {modelSpec.metrics.oosRankIC.toFixed(3)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  训练IC: {modelSpec.metrics.trainIC.toFixed(3)} (衰减可控)
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <div className="text-slate-400">信息比率 (ICIR)</div>
                <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">
                  {modelSpec.metrics.oosICIR.toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">&gt; 2.0 达优级标准</div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <div className="text-slate-400">样本外 Sharpe</div>
                <div className="text-xl font-bold font-mono text-indigo-300 mt-0.5">
                  {modelSpec.metrics.sharpeOOS.toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">最大回撤 {modelSpec.metrics.maxDrawdownOOS}%</div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <div className="text-slate-400">预测校准误差</div>
                <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
                  {modelSpec.metrics.calibError.toFixed(3)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">无严重概率偏倚</div>
              </div>
            </div>

            {/* Decile Return Monotonicity Bar Chart */}
            <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  多空十分位分层收益单调性 (Decile Return Spread)
                </span>
                <span className="text-[11px] font-mono text-cyan-400">
                  Q10-Q1 净利差: +9.0%
                </span>
              </div>

              <div className="h-28 flex items-end justify-between gap-2 pt-4 px-2">
                {decileReturns.map((item) => {
                  const isPositive = item.returnPct >= 0;
                  const heightPct = Math.min(Math.abs(item.returnPct) * 12, 90);
                  return (
                    <div key={item.decile} className="flex-1 flex flex-col items-center h-full justify-end">
                      <div className="text-[10px] font-mono mb-1 text-slate-400">
                        {item.returnPct > 0 ? `+${item.returnPct}%` : `${item.returnPct}%`}
                      </div>
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t transition-all ${
                          item.decile === 'Q10(高分)'
                            ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-sm shadow-cyan-500/50'
                            : isPositive
                            ? 'bg-slate-700 hover:bg-slate-600'
                            : 'bg-rose-950/80 border border-rose-800'
                        }`}
                      />
                      <div className="text-[9px] font-mono text-slate-500 mt-1 whitespace-nowrap">
                        {item.decile}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Feature Importance Table / Gain Ranking */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>特征重要度排序 (Feature Importance Gain &amp; Split)</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  行为量能与动量特征贡献度领先 · 经特征漂移与共线性治理
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">{modelSpec.features.length} 核心因子</span>
            </div>

            <div className="space-y-2.5 text-xs">
              {modelSpec.features.map((feat) => {
                const maxGain = 1500;
                const gainPct = (feat.importanceGain / maxGain) * 100;
                return (
                  <div key={feat.name} className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{feat.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                          {feat.category}
                        </span>
                      </div>
                      <div className="font-mono text-slate-300 flex items-center gap-3">
                        <span>IC: <strong className="text-cyan-400">{feat.ic.toFixed(3)}</strong></span>
                        <span>Split: {feat.importanceSplit}次</span>
                        <span className="text-emerald-400 font-semibold">Gain: {feat.importanceGain.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${gainPct}%` }}
                        className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
