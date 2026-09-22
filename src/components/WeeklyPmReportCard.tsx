import React from 'react';
import { SaranaLV } from '../types';
import { ShieldAlert, CheckCircle, Wrench, CalendarDays } from 'lucide-react';

interface WeeklyPmReportCardProps {
  vehicles: SaranaLV[];
}

export const WeeklyPmReportCard: React.FC<WeeklyPmReportCardProps> = ({ vehicles }) => {
  const totalVehicles = vehicles.length;

  // In weekly mandatory PM, check who has completed PM this current week / within last 7 days
  const completedCount = vehicles.filter((v) => {
    // If pmStatus is DONE or if lastPmDate was within last 7 days
    if (v.pmStatus === 'DONE') return true;
    if (!v.lastPmDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastPm = new Date(v.lastPmDate);
    lastPm.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today.getTime() - lastPm.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7 && v.pmStatus !== 'OVERDUE';
  }).length;

  const pendingCount = totalVehicles - completedCount;
  const compliancePercentage = totalVehicles > 0 ? Math.round((completedCount / totalVehicles) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 mb-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Section Header & Description */}
        <div>
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block mb-1">
            WEEKLY PM REPORT
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>PM compliance this week</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Wajib 7 Hari Sekali
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-lg">
            Summary of units that have and haven't completed PM check this week.
          </p>
        </div>

        {/* Right: Metrics Numbers */}
        <div className="flex items-center gap-6 sm:gap-8 self-start md:self-center">
          {/* Unit Completed */}
          <div className="text-left sm:text-right">
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {completedCount}
              <span className="text-slate-400 font-semibold text-base sm:text-lg">/{totalVehicles}</span>
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              UNIT COMPLETED
            </div>
          </div>

          <div className="h-9 w-px bg-slate-200 hidden xs:block"></div>

          {/* Pending PM */}
          <div className="text-left sm:text-right">
            <div className={`text-xl sm:text-2xl font-extrabold ${pendingCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
              {pendingCount}
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              PENDING PM
            </div>
          </div>

          <div className="h-9 w-px bg-slate-200 hidden xs:block"></div>

          {/* Compliance Percentage */}
          <div className="text-left sm:text-right">
            <div className={`text-xl sm:text-2xl font-extrabold ${compliancePercentage >= 80 ? 'text-emerald-600' : compliancePercentage > 0 ? 'text-blue-600' : 'text-slate-500'}`}>
              {compliancePercentage}%
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              COMPLIANCE
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar & Schedule Indicator */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
            <span>Target Kepatuhan Siklus Mingguan: 100% Seluruh Sarana LV</span>
          </span>
          <span className="font-semibold text-slate-700">
            {completedCount} dari {totalVehicles} unit selesai diinspeksi
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
                ? 'bg-amber-500'
                : 'bg-slate-300'
            }`}
            style={{ width: `${Math.max(compliancePercentage, 2)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
