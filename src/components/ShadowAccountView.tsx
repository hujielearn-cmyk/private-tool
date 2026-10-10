import React, { useState } from 'react';
import { 
  PaperAccount, 
  FourTrackNavPoint, 
  PaperOrder 
} from '../types/quant';
import { 
  ShieldCheck, 
  Lock, 
  TrendingUp, 
  FileSpreadsheet, 
  Check, 
  X, 
  ArrowUpRight, 
  AlertOctagon,
  RefreshCw,
  SlidersHorizontal,
  Info,
  Copy
} from 'lucide-react';

interface ShadowAccountViewProps {
  activeAccount: PaperAccount;
  allAccounts: PaperAccount[];
  navHistory: FourTrackNavPoint[];
  orders: PaperOrder[];
  onSwitchAccount: (accId: string) => void;
  onExecuteSimulatedTrade: (code: string, direction: 'BUY' | 'SELL', shares: number) => { success: boolean; message: string };
  onDuplicateAccountAsB: () => void;
}

export const ShadowAccountView: React.FC<ShadowAccountViewProps> = ({
  activeAccount,
  allAccounts,
  navHistory,
  orders,
  onSwitchAccount,
  onExecuteSimulatedTrade,
  onDuplicateAccountAsB,
}) => {
  const [showT0Wizard, setShowT0Wizard] = useState(false);
  const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean; reason: string; rule: string } | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Test trading an outside stock
  const handleTestOutsideStock = () => {
    const res = onExecuteSimulatedTrade('688981', 'BUY', 500);
    if (!res.success) {
      setRejectionModal({
        isOpen: true,
        reason: res.message,
        rule: 'PO-01 / 附录 A.2 股票池政策限制',
      });
    } else {
      setSuccessToast(res.message);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  // Test trading a valid whitelist stock
  const handleTestValidTrade = () => {
    const res = onExecuteSimulatedTrade('300750', 'BUY', 200);
    if (res.success) {
      setSuccessToast(res.message);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  // SVG Chart Dimensions
  const chartWidth = 760;
  const chartHeight = 220;
  const padding = { top: 20, right: 30, bottom: 30, left: 45 };
  const innerW = chartWidth - padding.left - padding.right;
  const innerH = chartHeight - padding.top - padding.bottom;

  const allNavs = navHistory.flatMap((d) => [d.shadowA_Nav, d.shadowB_Nav, d.passiveC_Nav, d.actualD_Nav, d.csi300Nav]);
  const minNav = Math.min(...allNavs) * 0.995;
  const maxNav = Math.max(...allNavs) * 1.005;

  const getX = (idx: number) => padding.left + (idx / (navHistory.length - 1)) * innerW;
  const getY = (val: number) => padding.top + innerH - ((val - minNav) / (maxNav - minNav)) * innerH;

  const shadowAPath = navHistory.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.shadowA_Nav)}`).join(' ');
  const shadowBPath = navHistory.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.shadowB_Nav)}`).join(' ');
  const passiveCPath = navHistory.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.passiveC_Nav)}`).join(' ');
  const actualDPath = navHistory.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.actualD_Nav)}`).join(' ');
  const csiPath = navHistory.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.csi300Nav)}`).join(' ');

  return (
    <div className="space-y-6">
      {/* Toast */}
      {successToast && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-700 rounded-lg flex items-center justify-between text-xs text-emerald-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Account Switcher & Role Ribbon */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-lg font-bold text-white tracking-tight">
                {activeAccount.name}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                {activeAccount.status}
              </span>
              <span className="font-mono text-xs text-slate-400">
                (ID: {activeAccount.accountId})
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2.5">
              <span>AccountGroup: {activeAccount.accountGroupId}</span>
              <span>·</span>
              <span>买入政策: <strong className="text-cyan-400 font-mono">{activeAccount.buyUniversePolicy}</strong></span>
              <span>·</span>
              <span>绑定策略: {activeAccount.boundStrategyName}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Account Switch Dropdown */}
            <select
              value={activeAccount.accountId}
              onChange={(e) => onSwitchAccount(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
            >
              {allAccounts.map((acc) => (
                <option key={acc.accountId} value={acc.accountId}>
                  切换至: {acc.name}
                </option>
              ))}
            </select>

            <button
              onClick={onDuplicateAccountAsB}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700"
              title="同T0一键复制生成全市场换股影子B账户"
            >
              <Copy className="w-3.5 h-3.5 text-indigo-400" />
              <span>同T0复制影子B (全市场)</span>
            </button>

            <button
              onClick={() => setShowT0Wizard(true)}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>T0 快照对账</span>
            </button>

            <button
              onClick={handleTestOutsideStock}
              className="px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/80 rounded-lg transition-colors flex items-center gap-1.5"
              title="测试附录 A.2: 尝试买入非T0标的 688981 中芯国际"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>测试股票池约束拦截 (附录A.2)</span>
            </button>

            <button
              onClick={handleTestValidTrade}
              className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>模拟白名单撮合</span>
            </button>
          </div>
        </div>

        {/* Balance Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4 text-xs">
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="text-slate-400">当前总资产 (NAV)</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">
              ¥{activeAccount.currentTotalAsset.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] font-mono text-emerald-400 mt-0.5 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" />
              <span>+{activeAccount.totalPnL.toLocaleString()} (+{activeAccount.totalPnLPercent.toFixed(2)}%)</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="text-slate-400">持仓总市值</div>
            <div className="text-xl font-bold font-mono text-cyan-300 mt-0.5">
              ¥{activeAccount.positionsValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              仓位 {((activeAccount.positionsValue / activeAccount.currentTotalAsset) * 100).toFixed(1)}%
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="text-slate-400">可用现金余额</div>
            <div className="text-xl font-bold font-mono text-emerald-300 mt-0.5">
              ¥{activeAccount.freeCash.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              现金缓冲 {((activeAccount.freeCash / activeAccount.currentTotalAsset) * 100).toFixed(1)}%
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="text-slate-400">相对被动C超额 (Alpha)</div>
            <div className="text-xl font-bold font-mono text-rose-400 mt-0.5">
              +{activeAccount.benchmarkExcess.toFixed(2)}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              同 T0 起点公平基准
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="text-slate-400">买入许可范围 (UniversePolicy)</div>
            <div className="text-base font-bold font-mono text-indigo-300 mt-1 flex items-center gap-1">
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>{activeAccount.buyUniversePolicy === 'STRICT_T0_ONLY' ? `${activeAccount.allowedWhitelistCodes.length} 支锁定` : '全市场开放'}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              {activeAccount.buyUniversePolicy === 'STRICT_T0_ONLY' ? activeAccount.allowedWhitelistCodes.join(' · ') : '沪深主板合格股票池'}
            </div>
          </div>
        </div>
      </div>

      {/* 4-Track NAV Comparison Chart (07章 7.3节) */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>同一 T0 衍生四轨同起点比较净值曲线 (7.3节 / AccountGroup)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              同T0初始资产(¥1,000,000) · 采用统一 PaperLedger 引擎 · 外部真实资金流用 TWR 调整
            </p>
          </div>

          {/* 4-Track Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-cyan-400 rounded-full" />
              <span className="text-cyan-300 font-semibold">轨道A 影子A (+5.8%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-indigo-400 rounded-full" />
              <span className="text-indigo-300 font-semibold">轨道B 影子B (+7.3%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-emerald-400 rounded-full" />
              <span className="text-emerald-300">轨道C 被动持有 (+3.5%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-amber-400 rounded-full" />
              <span className="text-amber-300">轨道D 真实实盘 (+4.1%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-slate-500 rounded-full" />
              <span className="text-slate-400">沪深300 (+2.0%)</span>
            </div>
          </div>
        </div>

        {/* SVG NAV Chart */}
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto min-w-[620px] select-none">
            {/* Grid lines */}
            {[1.00, 1.02, 1.04, 1.06, 1.08].map((tick) => {
              const y = getY(tick);
              return (
                <g key={tick}>
                  <line x1={padding.left} y1={y} x2={chartWidth - padding.right} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                  <text x={padding.left - 8} y={y + 4} fill="#64748b" fontSize="10" textAnchor="end" fontFamily="monospace">
                    {tick.toFixed(2)}
                  </text>
                </g>
              );
            })}

            {/* Dates */}
            {navHistory.filter((_, idx) => idx % 2 === 0).map((d) => {
              const idx = navHistory.indexOf(d);
              const x = getX(idx);
              return (
                <text key={d.date} x={x} y={chartHeight - 8} fill="#64748b" fontSize="10" textAnchor="middle" fontFamily="monospace">
                  {d.date}
                </text>
              );
            })}

            {/* Baseline CSI300 */}
            <path d={csiPath} fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 4" />

            {/* Track C: Passive hold */}
            <path d={passiveCPath} fill="none" stroke="#10b981" strokeWidth="1.8" />

            {/* Track D: Actual real account */}
            <path d={actualDPath} fill="none" stroke="#f59e0b" strokeWidth="2" />

            {/* Track A: Shadow A (Strict T0) */}
            <path d={shadowAPath} fill="none" stroke="#06b6d4" strokeWidth="2.5" />

            {/* Track B: Shadow B (Open Market) */}
            <path d={shadowBPath} fill="none" stroke="#818cf8" strokeWidth="2.5" />

            {/* End points */}
            <circle cx={getX(navHistory.length - 1)} cy={getY(navHistory[navHistory.length - 1].shadowB_Nav)} r="4" fill="#818cf8" />
            <circle cx={getX(navHistory.length - 1)} cy={getY(navHistory[navHistory.length - 1].shadowA_Nav)} r="4" fill="#06b6d4" />
            <circle cx={getX(navHistory.length - 1)} cy={getY(navHistory[navHistory.length - 1].actualD_Nav)} r="3.5" fill="#f59e0b" />
            <circle cx={getX(navHistory.length - 1)} cy={getY(navHistory[navHistory.length - 1].passiveC_Nav)} r="3.5" fill="#10b981" />
          </svg>
        </div>

        {/* Four-Track Research Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 text-xs">
          <div className="p-2.5 bg-slate-950/60 rounded border border-cyan-900/40">
            <span className="font-semibold text-cyan-300">回答问题 A: </span>
            <span className="text-slate-400">管理原持仓比不动好多少？影子A较被动持有高出 +2.34% 超额。</span>
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded border border-indigo-900/40">
            <span className="font-semibold text-indigo-300">回答问题 B: </span>
            <span className="text-slate-400">全市场新股选择是否增益？影子B较影子A高出 +1.42% 收益。</span>
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded border border-emerald-900/40">
            <span className="font-semibold text-emerald-300">回答问题 C: </span>
            <span className="text-slate-400">主动择时是否创造价值？被动C作为客观零调仓基线对照。</span>
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded border border-amber-900/40">
            <span className="font-semibold text-amber-300">回答问题 D: </span>
            <span className="text-slate-400">真实自主投资相较影子表现？实盘自主操作获得 +4.12%，略低于量化影子。</span>
          </div>
        </div>
      </div>

      {/* Holdings & Order Ledger Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Holdings Table */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>{activeAccount.name} 持仓清单</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                可卖股数遵守 A 股 T+1 约束 (EX-02) · 100 股整手 (EX-03)
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">{activeAccount.holdings.length} 支标的</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                  <th className="py-2.5 px-3 font-medium">标的</th>
                  <th className="py-2.5 px-2 font-medium text-right">持仓/可卖(T+1)</th>
                  <th className="py-2.5 px-2 font-medium text-right">成本/现价</th>
                  <th className="py-2.5 px-2 font-medium text-right">市值/盈亏</th>
                  <th className="py-2.5 px-3 font-medium text-right">当前权重</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {activeAccount.holdings.map((lot) => (
                  <tr key={lot.code} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-sans">
                      <div className="font-semibold text-slate-100">{lot.name}</div>
                      <div className="font-mono text-[11px] text-slate-400">
                        {lot.code} {lot.isT0Origin ? '· T0原股' : '· 新增换股'}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <div className="text-slate-200">{lot.quantity} 股</div>
                      <div className="text-[10px] text-emerald-400">可卖: {lot.availableToSell} 股</div>
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <div className="text-slate-400">¥{lot.costPrice.toFixed(2)}</div>
                      <div className="text-slate-200 font-semibold">¥{lot.currentPrice.toFixed(2)}</div>
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <div className="text-slate-200">¥{lot.marketValue.toLocaleString()}</div>
                      <div className={`text-[10px] ${lot.unrealizedPnL >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {lot.unrealizedPnL >= 0 ? '+' : ''}{lot.unrealizedPnL.toLocaleString()} ({lot.unrealizedPnLPercent.toFixed(1)}%)
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="font-semibold text-indigo-300">{lot.weight.toFixed(1)}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Paper Orders & Ledger */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>统一 Paper 模拟交易流水 (8.1节 EX-01~08)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                统一订单撮合 · 佣金与印花税按日生效 · 订单幂等不重复扣款
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">{orders.length} 笔订单</span>
          </div>

          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {orders.map((ord, idx) => (
              <div
                key={`${ord.orderId}-${idx}`}
                className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                  ord.status === 'FILLED'
                    ? 'bg-slate-950/70 border-slate-800'
                    : 'bg-rose-950/20 border-rose-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-400">{ord.timestamp}</span>
                    <span className="font-semibold text-slate-200">{ord.name} ({ord.code})</span>
                  </div>
                  <div>
                    {ord.status === 'FILLED' ? (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ord.direction === 'BUY'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        已成交 {ord.direction === 'BUY' ? '买入' : '卖出'} {ord.executedShares} 股
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-900/80 text-rose-200 border border-rose-700">
                        订单已拒绝 (REJECTED)
                      </span>
                    )}
                  </div>
                </div>

                {ord.status === 'FILLED' ? (
                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                    <div>成交价: ¥{ord.executedPrice.toFixed(2)}</div>
                    <div>税费: ¥{ord.fee.toFixed(2)}</div>
                    <div>滑点: ¥{ord.slippage.toFixed(2)}</div>
                  </div>
                ) : (
                  <div className="p-2 bg-rose-950/40 rounded text-[11px] text-rose-300 border border-rose-800/50 mt-1">
                    {ord.rejectReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rejection Modal for Outside Stock Testing */}
      {rejectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-rose-800 rounded-xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-950 rounded-lg text-rose-400 border border-rose-800">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white">订单硬门拦截：股票池政策冲突</h3>
                <div className="text-xs font-mono text-rose-400 mt-0.5">
                  规则依据: {rejectionModal.rule}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
              <p>{rejectionModal.reason}</p>
              <div className="p-2 bg-slate-900 rounded border border-slate-800 text-[11px] text-slate-400">
                <strong>PRD V4.0 核心设计规范 (PO-01 &amp; 7.6节)：</strong>
                <br />
                影子A账户采用 <code className="text-cyan-400">STRICT_T0_ONLY</code>，只允许在 T0 初始股票池内择时加减仓（即使卖光至0股仍可买回）；严禁买入全市场新标的。若需全市场换股，请切换至<strong>影子B (OPEN_MARKET_ALPHA)</strong> 账户执行。
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setRejectionModal(null)}
                className="px-4 py-2 text-xs font-medium text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg font-semibold transition-colors"
              >
                确认拦截已生效
              </button>
            </div>
          </div>
        </div>
      )}

      {/* T0 Wizard Modal */}
      {showT0Wizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">真实持仓 T0 快照对账向导 (7.4节 / F-ACC-01)</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  券商CSV/XLSX导入 → 份额与金额逐行对账 → 冻结 T0 初始锚点 → 衍生同组 A/B/C
                </p>
              </div>
              <button onClick={() => setShowT0Wizard(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between font-semibold text-slate-200">
                  <span>券商原始导出快照</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-mono">
                    <Check className="w-3.5 h-3.5" /> 华泰证券已核验
                  </span>
                </div>
                <div className="text-slate-400 text-[11px] font-mono">
                  快照时点: 2026-09-01 15:00:00 · 总资产 ¥1,000,000.00
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between font-semibold text-slate-200">
                  <span>同 T0 衍生四轨配置</span>
                  <span className="text-cyan-400 font-mono">AccountGroup 已锁定</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <div className="font-semibold text-cyan-300">影子A (原股受限)</div>
                    <div className="text-slate-400 mt-0.5">STRICT_T0_ONLY</div>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <div className="font-semibold text-indigo-300">影子B (全市场)</div>
                    <div className="text-slate-400 mt-0.5">OPEN_MARKET_ALPHA</div>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <div className="font-semibold text-emerald-300">被动C (基准持有)</div>
                    <div className="text-slate-400 mt-0.5">BUY_AND_HOLD</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-500 font-mono">
                初始 NAV 同为 1.000 · 独立演进不篡改
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowT0Wizard(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    setShowT0Wizard(false);
                    setSuccessToast('T0 快照对账成功！同起点四轨账户已锁定并激活。');
                    setTimeout(() => setSuccessToast(null), 3000);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg"
                >
                  确认并冻结 T0 锚点
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
