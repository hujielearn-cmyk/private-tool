import React, { useState } from 'react';
import { StockCandidate } from '../types/quant';
import { 
  Compass, 
  Flame, 
  Layers, 
  Activity, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  GitCommit,
  BookOpen
} from 'lucide-react';

interface BehaviorLabViewProps {
  candidates: StockCandidate[];
  onSelectStock: (stock: StockCandidate) => void;
}

export const BehaviorLabView: React.FC<BehaviorLabViewProps> = ({
  candidates,
  onSelectStock,
}) => {
  const [selectedRuleTab, setSelectedRuleTab] = useState<'RADAR' | 'STATE_MACHINE' | 'GOLDEN_TRIANGLE' | 'CANDLE_RULES'>('RADAR');

  const behavioralRules = [
    { id: 'BH-01', name: 'RVOL20 放量异动', cond: '当日成交量 / 过去20日均量 >= 1.8x', border: '长停牌、复牌设专属基准', status: 'CANDIDATE' },
    { id: 'BH-02', name: '疑似初始吸纳 (ACC_NEW)', cond: '低位/整理 + 连续多日量能异常 + 价格承接', border: '破位加速或资金流冲突判 UNKNOWN', status: 'CANDIDATE' },
    { id: 'BH-03', name: '疑似加仓 (ACC_ADD)', cond: '必须已有历史吸纳候选状态，回踩后再次放量承接', border: '无早先吸纳事件不得判加仓', status: 'CANDIDATE' },
    { id: 'BH-04', name: '疑似派发候选', cond: '前期涨幅大 + 持续放量滞涨 + 相对强弱恶化', border: '健康换手与基本面重估为竞争解释', status: 'CANDIDATE' },
    { id: 'BH-05', name: '全市场情绪温度计', cond: '广度/活跃/风险特征滚动分位标准化加权 (0-100)', border: '高热不等于低风险，参数需 OOS 验证', status: 'MONITOR' },
    { id: 'BR-M02', name: '均线黄金三角 (GT-MA)', cond: 'MA5/10/20 有序交叉并形成多头排列发散', border: '时间顺序严格不可偷看后验拐点', status: 'CLASSIC' },
    { id: 'BR-P01', name: '收敛三角突破 (GT-TRIANGLE)', cond: '上下边界收敛压缩，放量向上突破上边界', border: '历史边界只能用当时确认的拐点，防事后画线', status: 'CLASSIC' },
  ];

  const stateMachineStages = [
    { stage: 'S0_PREPARE', title: '准备期 (S0)', desc: '无显著异动，成交清淡，跟踪观察', count: 1820 },
    { stage: 'S1_CONSOLIDATE', title: '低量盘整 (S1)', desc: '振幅收敛，量能处于历史低分位数 (惜售代理)', count: 840 },
    { stage: 'S2_ACCUMULATION', title: '疑似吸纳建仓 (S2)', desc: '连续多日量能异常放大，价格显现下档承接 (ACC_NEW)', count: 48 },
    { stage: 'S3_TREND_UP', title: '趋势上行与加仓 (S3)', desc: '均线发散，回踩不破支撑，量能有序配合 (ACC_ADD)', count: 32 },
    { stage: 'S4_DIVERGENCE', title: '高位分歧 (S4)', desc: '高换手率，宽日内振幅，多空剧烈博弈', count: 16 },
    { stage: 'S5_DISTRIBUTION', title: '疑似滞涨派发 (S5)', desc: '放量滞涨，大单流出，相对强弱恶化', count: 24 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">
                市场行为、情绪与经典技术分析实验台 (09章 / Alpha 候选源)
              </span>
              <span className="font-mono text-xs text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800/60">
                假说驱动 · 客观形态与资金动机严格分离
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              《日本蜡烛图技术》《金融市场技术分析》《股市操练大全》《炒股的智慧》仅提供假设来源，不承诺必然获利
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedRuleTab('RADAR')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                selectedRuleTab === 'RADAR' ? 'bg-slate-800 text-cyan-400 shadow-sm font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              量能异动雷达
            </button>
            <button
              onClick={() => setSelectedRuleTab('STATE_MACHINE')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                selectedRuleTab === 'STATE_MACHINE' ? 'bg-slate-800 text-cyan-400 shadow-sm font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              S0-S5 周期状态机
            </button>
            <button
              onClick={() => setSelectedRuleTab('GOLDEN_TRIANGLE')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                selectedRuleTab === 'GOLDEN_TRIANGLE' ? 'bg-slate-800 text-cyan-400 shadow-sm font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              黄金三角双定义
            </button>
            <button
              onClick={() => setSelectedRuleTab('CANDLE_RULES')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                selectedRuleTab === 'CANDLE_RULES' ? 'bg-slate-800 text-cyan-400 shadow-sm font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              候选规则目录
            </button>
          </div>
        </div>

        {/* Sentiment Meter Snapshot (BH-05) */}
        <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="text-slate-400 flex items-center justify-between">
              <span>全市场情绪温度 (BH-05)</span>
              <Flame className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">
              68.4 / 100
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">温和偏热 · 风险偏好指数 62%</div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="text-slate-400 flex items-center justify-between">
              <span>RVOL20 异动标的总数</span>
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
              142 支标的
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">放量倍数 &gt;= 1.8x (主板)</div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="text-slate-400 flex items-center justify-between">
              <span>疑似吸纳候选 (ACC_NEW)</span>
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              48 支标的
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">低位整理 + 连续量能承接</div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="text-slate-400 flex items-center justify-between">
              <span>疑似高位派发 (BH-04)</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-xl font-bold font-mono text-rose-400 mt-1">
              24 支标的
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">放量滞涨 · 纳入风控黑名单</div>
          </div>
        </div>
      </div>

      {/* Main Content Area based on Tab */}
      {selectedRuleTab === 'RADAR' && (
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>日度量能异动扫描榜单 (VolumeAnomalyEvent / BH-01)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                严禁将单日放量直接等于机构建仓 · 必须提供价格响应与资金方向双重证据
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">沪深主板候选</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                  <th className="py-2.5 px-3 font-medium">标的 / 行业</th>
                  <th className="py-2.5 px-2 font-medium text-right">最新价 / 涨跌</th>
                  <th className="py-2.5 px-2 font-medium text-right">RVOL20 倍数</th>
                  <th className="py-2.5 px-2 font-medium text-right">60日成交额分位</th>
                  <th className="py-2.5 px-3 font-medium">推断行为阶段</th>
                  <th className="py-2.5 px-3 font-medium">竞争解释假说</th>
                  <th className="py-2.5 px-3.5 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {candidates.map((stock) => (
                  <tr key={stock.code} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-sans">
                      <div className="font-semibold text-slate-200">{stock.name}</div>
                      <div className="font-mono text-[11px] text-slate-400">{stock.code} · {stock.industry}</div>
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <div className="text-slate-200">¥{stock.price.toFixed(2)}</div>
                      <div className={`text-[10px] ${stock.changePercent >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <span className={`font-bold ${stock.rvol20 >= 2.0 ? 'text-cyan-400' : 'text-slate-300'}`}>
                        {stock.rvol20.toFixed(2)}x
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-300">
                      {stock.amountPercentile.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                        {stock.stage}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-400 text-[11px] max-w-xs truncate">
                      {stock.signalLabel}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-sans">
                      <button
                        onClick={() => onSelectStock(stock)}
                        className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                      >
                        透视证据
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedRuleTab === 'STATE_MACHINE' && (
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-emerald-400" />
              <span>S0~S5 个股价格行为周期状态机 (BR-R02 / 7.3节)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              客观观察事实 → 竞争假说推断 · 允许状态跳转与失效回退，禁止直接断言真实机构增持
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stateMachineStages.map((st) => (
              <div key={st.stage} className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{st.title}</span>
                  <span className="font-mono text-cyan-400 font-bold">{st.count} 标的</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">{st.desc}</p>
                <div className="pt-1 border-t border-slate-800/80 font-mono text-[10px] text-slate-500">
                  状态标签: {st.stage}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedRuleTab === 'GOLDEN_TRIANGLE' && (
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>黄金三角概念双定义与时点防偷看隔离 (BR-M02 &amp; BR-P01)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              明确区分“均线交叉发散型”与“收敛三角突破型”，禁止事后画线，拐点只能使用当时确认日
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Definition A */}
            <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 text-sm">定义 1: 均线黄金三角 (GT-MA / BR-M02)</span>
                <span className="font-mono text-[11px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                  GoldenMAEvent
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                MA5、MA10、MA20 三条移动平均线在整理末期有序金叉并形成多头排列（MA5 &gt; MA10 &gt; MA20）。
              </p>
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800 space-y-1 text-[11px]">
                <div className="font-semibold text-emerald-400">时点确认约束：</div>
                <div className="text-slate-300">
                  事件 recognized_at 必须为最后一个金叉发生且收盘确认的交易日，不得向前回溯。
                </div>
              </div>
            </div>

            {/* Definition B */}
            <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 text-sm">定义 2: 收敛三角突破 (GT-TRIANGLE / BR-P01)</span>
                <span className="font-mono text-[11px] text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800/60">
                  TriangleBreakEvent
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                价格高点连线与低点连线呈现收敛形态，日内振幅逐步压缩至滚动样本低分位数，随后出现放量突破上轨。
              </p>
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800 space-y-1 text-[11px]">
                <div className="font-semibold text-amber-400">防事后画线约束：</div>
                <div className="text-slate-300">
                  历史上下边界只能使用当时已确认的波段高低拐点计算，严禁未来行情已知后重绘完美三角形。
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedRuleTab === 'CANDLE_RULES' && (
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>经典技术文献规则与可执行候选目录 (07章 / 7.2节)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              文献思想作为待检验候选假说 · 必须具备显式版本与否决条件
            </p>
          </div>

          <div className="space-y-2.5">
            {behavioralRules.map((r) => (
              <div key={r.id} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-400">{r.id}</span>
                    <span className="font-semibold text-slate-200">{r.name}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {r.status}
                  </span>
                </div>
                <div className="font-mono text-slate-300 text-[11px]">判定条件: {r.cond}</div>
                <div className="text-slate-500 text-[11px]">反证/边界: {r.border}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
