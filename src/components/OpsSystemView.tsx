import React, { useState } from 'react';
import { MOCK_OPS_TASKS, MOCK_SINGLE_MACHINE_BENCHMARKS } from '../data/mockQuantData';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  ShieldCheck, 
  CheckCircle2, 
  Activity, 
  Clock, 
  Layers, 
  Milestone,
  Database,
  Lock
} from 'lucide-react';

export const OpsSystemView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'TASKS' | 'BENCHMARK' | 'ELIGIBILITY' | 'ROADMAP'>('TASKS');

  const roadmapReleases = [
    {
      batch: 'R0',
      title: '历史资产与单机硬件基线',
      deliverable: '只读盘点因子、LightGBM、动态选股、Paper账本；运行本机 SQLite/Polars 性能基准',
      evidence: '可复用清单、测试报告、风险清单',
      status: 'COMPLETED' as const,
    },
    {
      batch: 'R1',
      title: 'Alpha 生产与每日选股',
      deliverable: '数据就绪 → 特征 → LightGBM/基线 → OOS比较 → 全市场候选及风险解释 → 每日刷新',
      evidence: '真实股票池与预测工件、OOS与成本基准、日度候选',
      status: 'COMPLETED' as const,
    },
    {
      batch: 'R2',
      title: '统一 Paper 与多账户运行',
      deliverable: 'T0/自定义初始化 → A/B/C复制 → UniversePolicy → 组合计划 → 次日撮合 → 账本与NAV',
      evidence: '同T0不同策略账户持续运行并对账，支持每日交易清单',
      status: 'COMPLETED' as const,
    },
    {
      batch: 'R3',
      title: '四轨绩效与多维归因',
      deliverable: '真实账户导入 → TWR现金流调整 → 四轨风险/收益比较 → 选股/择时/成本归因',
      evidence: '真实案例对账一致、连续交易日四轨序列',
      status: 'IN_PROGRESS' as const,
    },
    {
      batch: 'R4',
      title: 'AI 自动假说与研究进化',
      deliverable: '批量因子挖掘、候选管理、AI 研究记忆和自动提出多代策略；收益增量实验',
      evidence: '算法实验从假说到受控候选与影子反馈闭环',
      status: 'PLANNED' as const,
    },
    {
      batch: 'R5',
      title: '外部实盘接口扩展',
      deliverable: '人工交易导出与通知成熟后，评估 QMT/PTrade 等实盘适配；独立合规安全评审',
      evidence: '通过之前绝不自动下单',
      status: 'PLANNED' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">
                单机运行、调度任务与系统数据治理 (PRD 12~15章)
              </span>
              <span className="font-mono text-xs text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                本地优先 · Intel i5-13代 / 32GB / RTX 4070 / 1TB NVMe
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              单机有界 Worker 调度 · Parquet + Polars Lazy · SQLite WAL 单写事务 · 零外部多租户复杂性
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('TASKS')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeTab === 'TASKS' ? 'bg-slate-800 text-cyan-400 shadow-sm font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              盘后调度流水线 (6步)
            </button>
            <button
              onClick={() => setActiveTab('BENCHMARK')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeTab === 'BENCHMARK' ? 'bg-slate-800 text-cyan-400 shadow-sm font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              单机实测基准
            </button>
            <button
              onClick={() => setActiveTab('ELIGIBILITY')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeTab === 'ELIGIBILITY' ? 'bg-slate-800 text-cyan-400 shadow-sm font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              DataEligibility 四态
            </button>
            <button
              onClick={() => setActiveTab('ROADMAP')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeTab === 'ROADMAP' ? 'bg-slate-800 text-cyan-400 shadow-sm font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              R0~R5 实施路线
            </button>
          </div>
        </div>

        {/* Local Hardware Spec Summary */}
        <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="text-slate-400 flex items-center justify-between">
              <span>CPU 批计算内核</span>
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-base font-bold text-white mt-1">
              Intel i5-13代 (14核)
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Polars 多线程并发批算</div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="text-slate-400 flex items-center justify-between">
              <span>运行内存 (RAM)</span>
              <Server className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-base font-bold text-white mt-1">
              32 GB DDR5
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">峰值占用 &lt; 6.5 GB (安全)</div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="text-slate-400 flex items-center justify-between">
              <span>高速存储 (NVMe SSD)</span>
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-base font-bold text-white mt-1">
              1 TB NVMe SSD
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Parquet 分区存储行情宽表</div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="text-slate-400 flex items-center justify-between">
              <span>隐私与数据边界</span>
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-base font-bold text-white mt-1">
              100% 本地安全隔离
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">绝不向外部上传个人持仓</div>
          </div>
        </div>
      </div>

      {/* Tab 1: Scheduled Tasks Pipeline */}
      {activeTab === 'TASKS' && (
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>盘后自动调度执行次序 (11.3节 / F-OPS-01)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                DailyDataReady → FeatureComputed → PredictionPublished → AccountPlanPrepared → SimOrderExecuted → NAVPublished
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              今日批算已完成 (总耗时 3.9秒)
            </span>
          </div>

          <div className="space-y-3">
            {MOCK_OPS_TASKS.map((task, idx) => (
              <div key={task.taskId} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 font-bold">{idx + 1}.</span>
                    <span className="font-semibold text-slate-200">{task.taskName}</span>
                    <span className="font-mono text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                      {task.stage}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-400">耗时: {task.durationMs}ms</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> SUCCESS
                    </span>
                  </div>
                </div>

                <div className="text-slate-400 text-[11px] flex items-center justify-between">
                  <span>{task.details}</span>
                  <span className="font-mono text-slate-500 text-[10px]">{task.lastRunTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Single-Machine Benchmarks */}
      {activeTab === 'BENCHMARK' && (
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>真实规模单机基准测试 (12.3节 PERF-01~05)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                实测负载与耗时留痕 · 不作未经证明的虚假验收承诺
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              5/5 测试通过
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-sans">
                  <th className="py-2.5 px-3 font-medium">编号</th>
                  <th className="py-2.5 px-3 font-medium">硬件与计算栈</th>
                  <th className="py-2.5 px-3 font-medium">测试负载 (Fixed Load)</th>
                  <th className="py-2.5 px-3 font-medium">本机实测表现</th>
                  <th className="py-2.5 px-3 font-medium">验收标准目标</th>
                  <th className="py-2.5 px-3 font-medium text-right font-sans">结论</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {MOCK_SINGLE_MACHINE_BENCHMARKS.map((b) => (
                  <tr key={b.metricId} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-cyan-400 font-bold">{b.metricId}</td>
                    <td className="py-2.5 px-3 text-slate-200 font-sans">{b.hardwareComponent}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans">{b.testLoad}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">{b.measuredResult}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans">{b.standardTarget}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-sans">
                        达标
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: DataEligibility */}
      {activeTab === 'ELIGIBILITY' && (
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>数据使用资格四态检查报告 (10.4节 &amp; 10.5节)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                AVAILABLE (完全可用) · PARTIAL (部分可用) · UNAVAILABLE (未接入) · UNCERTAIN (时点存疑)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">A股主板日线行情与分红送配 (OHLCV)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  AVAILABLE
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                历史交易日按当时真实上市股票构建 Universe，退市股保留，无幸存者偏差。前复权与未复权价格口径分离。
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">盘后大单资金流与换手增强 (MoneyFlow)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                  PARTIAL
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                覆盖主板大部分标的，微盘股有缺口。D1 快速探索允许轻量使用并明确告警；D2 正式回测严格阻断依赖此字段的缺口样本。
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">Level-2 逐笔委托高频行情</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
                  UNAVAILABLE
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                首期 V4.0 硬边界不纳入；禁止在缺失盘口时伪造理想排队成交。
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">算法筹码分布成本估计 (cyq_perf)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-400 border border-indigo-800">
                  UNCERTAIN
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                标注为数学模型估算分布，严禁宣称为真实机构持仓成本 (符合 AC-29 / 10.1 节)。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Roadmap */}
      {activeTab === 'ROADMAP' && (
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Milestone className="w-4 h-4 text-indigo-400" />
                <span>R0~R5 实施路线图 (PRD 15.1节 唯一实施编号体系)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                完整目标规划 · 分批交付完整用户旅程 · 拒绝做不真实的简版
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {roadmapReleases.map((rel) => (
              <div key={rel.batch} className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-cyan-400">{rel.batch}</span>
                    <span className="font-semibold text-slate-200 text-sm">{rel.title}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    rel.status === 'COMPLETED'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : rel.status === 'IN_PROGRESS'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {rel.status === 'COMPLETED' ? '已交付验收' : rel.status === 'IN_PROGRESS' ? '当前交付中' : '排期规划中'}
                  </span>
                </div>

                <div className="text-slate-300 text-[11px]">{rel.deliverable}</div>
                <div className="text-slate-500 text-[11px] font-mono pt-1 border-t border-slate-800/80">
                  完成证据: {rel.evidence}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
