import React from 'react';
import { SaranaLV } from '../types';
import { CalendarDays } from 'lucide-react';

interface WeeklyPmReportCardProps {
  vehicles: SaranaLV[];
}

export const WeeklyPmReportCard: React.FC<WeeklyPmReportCardProps> = ({ vehicles }) => {
  const totalVehicles = vehicles.length;

  // Real-time current date
  const now = new Date();

  // Find Monday (00:00:00) and Sunday (23:59:59.999) of the current week
  // Sunday = 0, Monday = 1, Tuesday = 2, ..., Saturday = 6
  const currentDay = now.getDay();
  const diffToMonday = (currentDay + 6) % 7; // days back to Monday

  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  // Month names for English display
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const weekLabel = `${monthNames[monday.getMonth()]} ${monday.getDate()} – ${monthNames[sunday.getMonth()]} ${sunday.getDate()}, ${sunday.getFullYear()}`;

  // Check which units have completed PM during the CURRENT week (Mon 00:00 to Sun 23:59)
  // Every Monday, this automatically resets to 0% because previous week's dates are prior to Monday
  const completedCount = vehicles.filter((v) => {
    if (v.pmStatus === 'OVERDUE') return false;

    const dateStr = v.pmDoneDate || v.lastPmDate;
    if (!dateStr) return false;

    const parts = dateStr.split('-');
    if (parts.length !== 3) return false;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return false;

    // Use noon local time to avoid timezone boundary issues
    const pmDate = new Date(y, m, d, 12, 0, 0);
    return pmDate.getTime() >= monday.getTime() && pmDate.getTime() <= sunday.getTime();
  }).length;

  const pendingCount = Math.max(0, totalVehicles - completedCount);
  const compliancePercentage = totalVehicles > 0 ? Math.round((completedCount / totalVehicles) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 mb-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Section Header & Period (Clean Minimalist) */}
        <div>
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block mb-1">
            WEEKLY PM REPORT
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            PM compliance this week
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Period: <span className="font-semibold text-slate-800">{weekLabel}</span>
          </p>
        </div>

        {/* Right: Metrics Numbers (Crisp Black Styling) */}
        <div className="flex items-center gap-6 sm:gap-8 self-start md:self-center">
          {/* Unit Completed */}
          <div className="text-left sm:text-right">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {completedCount}
              <span className="text-slate-400 font-semibold text-base sm:text-lg">/{totalVehicles}</span>
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              UNITS CLEARED
            </div>
          </div>

          <div className="h-9 w-px bg-slate-200 hidden xs:block"></div>

          {/* Pending PM */}
          <div className="text-left sm:text-right">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {pendingCount}
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              PENDING PM
            </div>
          </div>

          <div className="h-9 w-px bg-slate-200 hidden xs:block"></div>

          {/* Compliance Percentage */}
          <div className="text-left sm:text-right">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {compliancePercentage}%
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              COMPLIANCE
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar & Schedule Indicator in Clean Professional English */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-500 mb-1.5 font-medium">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Weekly inspection compliance target: 100% Light Vehicle Fleet</span>
          </span>
          <span className="font-semibold text-slate-700">
            {completedCount} of {totalVehicles} units cleared this week
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              compliancePercentage === 100
                ? 'bg-emerald-500'
                : compliancePercentage > 50
                ? 'bg-blue-500'
                : compliancePercentage > 0
                ? 'bg-blue-600'
                : 'bg-slate-300'
            }`}
            style={{ width: `${Math.max(compliancePercentage, 2)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
