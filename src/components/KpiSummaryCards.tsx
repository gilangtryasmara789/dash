import React from 'react';
import { AlertCircle, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { VehicleObligationItem } from '../types';

interface KpiSummaryCardsProps {
  obligations: VehicleObligationItem[];
  activeFilterTab: string;
  onSelectTab: (tab: 'ALL' | 'OVERDUE' | 'TODAY' | 'TOMORROW' | 'UPCOMING') => void;
}

export const KpiSummaryCards: React.FC<KpiSummaryCardsProps> = ({
  obligations,
  activeFilterTab,
  onSelectTab,
}) => {
  // Calculate counts based on current obligations
  const overdueCount = obligations.filter(
    (o) => o.status === 'OVERDUE' || (o.status !== 'DONE' && o.daysDiff < 0)
  ).length;

  const dueTodayCount = obligations.filter(
    (o) => o.status !== 'DONE' && o.daysDiff === 0
  ).length;

  const dueTomorrowCount = obligations.filter(
    (o) => o.status !== 'DONE' && o.daysDiff === 1
  ).length;

  const upcomingCount = obligations.filter(
    (o) => o.status !== 'DONE' && o.daysDiff > 1 && o.daysDiff <= 30
  ).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-6">
      {/* 1. Overdue Card */}
      <button
        type="button"
        onClick={() => onSelectTab(activeFilterTab === 'OVERDUE' ? 'ALL' : 'OVERDUE')}
        className={`text-left p-3 sm:p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-xs flex items-center justify-between group hover:border-red-300 ${
          activeFilterTab === 'OVERDUE'
            ? 'border-red-500 ring-2 ring-red-100 bg-red-50/20'
            : 'border-slate-200/90'
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0 group-hover:scale-105 transition-transform">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold text-slate-800 truncate">Overdue</div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate hidden xs:block">Needs action</div>
          </div>
        </div>
        <div className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight shrink-0 pl-1">
          {overdueCount}
        </div>
      </button>

      {/* 2. Due Today Card */}
      <button
        type="button"
        onClick={() => onSelectTab(activeFilterTab === 'TODAY' ? 'ALL' : 'TODAY')}
        className={`text-left p-3 sm:p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-xs flex items-center justify-between group hover:border-amber-300 ${
          activeFilterTab === 'TODAY'
            ? 'border-amber-500 ring-2 ring-amber-100 bg-amber-50/20'
            : 'border-slate-200/90'
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 group-hover:scale-105 transition-transform">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold text-slate-800 truncate">Due today</div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate hidden xs:block">Monitor now</div>
          </div>
        </div>
        <div className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight shrink-0 pl-1">
          {dueTodayCount}
        </div>
      </button>

      {/* 3. Due Tomorrow Card */}
      <button
        type="button"
        onClick={() => onSelectTab(activeFilterTab === 'TOMORROW' ? 'ALL' : 'TOMORROW')}
        className={`text-left p-3 sm:p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-xs flex items-center justify-between group hover:border-indigo-300 ${
          activeFilterTab === 'TOMORROW'
            ? 'border-indigo-500 ring-2 ring-indigo-100 bg-indigo-50/20'
            : 'border-slate-200/90'
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-105 transition-transform">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold text-slate-800 truncate">Tomorrow</div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate hidden xs:block">H-1 reminder</div>
          </div>
        </div>
        <div className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight shrink-0 pl-1">
          {dueTomorrowCount}
        </div>
      </button>

      {/* 4. Upcoming Card */}
      <button
        type="button"
        onClick={() => onSelectTab(activeFilterTab === 'UPCOMING' ? 'ALL' : 'UPCOMING')}
        className={`text-left p-3 sm:p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-xs flex items-center justify-between group hover:border-emerald-300 ${
          activeFilterTab === 'UPCOMING'
            ? 'border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/20'
            : 'border-slate-200/90'
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold text-slate-800 truncate">Upcoming</div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate hidden xs:block">Next 30 days</div>
          </div>
        </div>
        <div className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight shrink-0 pl-1">
          {upcomingCount}
        </div>
      </button>
    </div>
  );
};
