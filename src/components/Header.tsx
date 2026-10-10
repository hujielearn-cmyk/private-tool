import React from 'react';
import { Play, ShieldCheck, Download } from 'lucide-react';

export type ActiveTabType = 
  | 'DAILY_DASHBOARD' 
  | 'ALPHA_RESEARCH' 
  | 'PORTFOLIO_LAB' 
  | 'PAPER_ACCOUNTS' 
  | 'PERFORMANCE_REVIEW' 
  | 'BEHAVIOR_LAB' 
  | 'OPS_SYSTEM';

interface HeaderProps {
  activeTab: ActiveTabType;
  onTabChange: (tab: ActiveTabType) => void;
  onQuickSimulate: () => void;
  onExportPlan: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onQuickSimulate,
  onExportPlan,
}) => {
  const navItems: { key: ActiveTabType; label: string }[] = [
    { key: 'DAILY_DASHBOARD', label: '每日投资台' },
    { key: 'ALPHA_RESEARCH', label: 'Alpha 研究台' },
    { key: 'PORTFOLIO_LAB', label: '组合工作台' },
    { key: 'PAPER_ACCOUNTS', label: '模拟账户 (Paper)' },
    { key: 'PERFORMANCE_REVIEW', label: '绩效与复盘' },
    { key: 'BEHAVIOR_LAB', label: '市场行为实验' },
    { key: 'OPS_SYSTEM', label: '运行与设置' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-slate-950 text-base shadow-sm">
            J
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-white whitespace-nowrap leading-none">
              JIAJIE QUANTPLATFORM
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-1.5 leading-none">
              <span>PRD V4.0</span>
              <span>·</span>
              <span>A股量化投研与模拟交易平台</span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/80 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Market status & Primary actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden xl:flex flex-col text-right">
            <div className="text-xs font-mono font-medium text-slate-300 flex items-center justify-end gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>2026-10-10 盘后批算</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Parquet + Polars · 单机优先
            </div>
          </div>

          <button
            onClick={onExportPlan}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700/80 whitespace-nowrap"
            title="导出下一交易日人工交易参考清单 (CSV/XLSX)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出清单 (F-DAY-03)</span>
          </button>

          <button
            onClick={onQuickSimulate}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-cyan-950 whitespace-nowrap active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>模拟调仓撮合</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar fallback */}
      <div className="lg:hidden flex items-center gap-1 px-4 py-2 bg-slate-950/80 border-t border-slate-800/80 overflow-x-auto text-xs">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onTabChange(item.key)}
            className={`px-2.5 py-1 rounded text-xs whitespace-nowrap shrink-0 ${
              activeTab === item.key
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                : 'text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
