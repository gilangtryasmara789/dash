import React from 'react';
import {
  VehicleObligationItem,
  ObligationType,
  SaranaLV,
} from '../types';
import { formatFriendlyDate } from '../services/googleSheetsService';
import {
  Search,
  Truck,
  ShieldCheck,
  Fuel,
  Wrench,
  Clock,
  Check,
  Send,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface ObligationsRegisterProps {
  obligations: VehicleObligationItem[];
  allObligationsCount: number;
  pmCount: number;
  commCount: number;
  fuelCount: number;
  completedCount?: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedType: 'ALL' | ObligationType;
  onSelectType: (type: 'ALL' | ObligationType) => void;
  selectedStatusTab: 'ALL' | 'OVERDUE' | 'TODAY' | 'TOMORROW' | 'UPCOMING' | 'COMPLETED';
  onSelectStatusTab: (tab: 'ALL' | 'OVERDUE' | 'TODAY' | 'TOMORROW' | 'UPCOMING' | 'COMPLETED') => void;
  onConfirmObligation: (item: VehicleObligationItem) => void;
  onViewVehicleDetail: (vehicle: SaranaLV) => void;
}

export const ObligationsRegister: React.FC<ObligationsRegisterProps> = ({
  obligations,
  allObligationsCount,
  pmCount,
  commCount,
  fuelCount,
  completedCount = 0,
  searchQuery,
  onSearchChange,
  selectedType,
  onSelectType,
  selectedStatusTab,
  onSelectStatusTab,
  onConfirmObligation,
  onViewVehicleDetail,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs mb-8">
      {/* 1. Header with Title & Search Input */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block mb-1">
            REMINDER REGISTER
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Vehicle obligations
          </h2>
        </div>

        {/* Search Input matching user's screenshot */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search unit, plate, type..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* 2. Filter Pills & Subtabs Bar */}
      <div className="px-5 sm:px-6 pt-4 pb-2 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Obligation Type Pills with exact counts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {/* ALL */}
          <button
            type="button"
            onClick={() => onSelectType('ALL')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedType === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>All</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedType === 'ALL' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {allObligationsCount}
            </span>
          </button>

          {/* PM Check (Wajib tiap minggu) */}
          <button
            type="button"
            onClick={() => onSelectType('PM_CHECK')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedType === 'PM_CHECK'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-slate-400" />
            <span>PM Check</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedType === 'PM_CHECK' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {pmCount}
            </span>
          </button>

          {/* Commissioning */}
          <button
            type="button"
            onClick={() => onSelectType('COMMISSIONING')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedType === 'COMMISSIONING'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Commissioning</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedType === 'COMMISSIONING' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {commCount}
            </span>
          </button>

          {/* Fuel Expiry */}
          <button
            type="button"
            onClick={() => onSelectType('FUEL_EXPIRY')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedType === 'FUEL_EXPIRY'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Fuel className="w-3.5 h-3.5 text-slate-400" />
            <span>Fuel Expiry</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedType === 'FUEL_EXPIRY' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {fuelCount}
            </span>
          </button>
        </div>

        {/* Subtabs matching user screenshot with Completed tab */}
        <div className="flex items-center gap-4 text-xs font-semibold border-b sm:border-b-0 border-slate-200 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: 'All reminders' },
            { id: 'OVERDUE', label: 'Overdue' },
            { id: 'TODAY', label: 'Today' },
            { id: 'TOMORROW', label: 'Tomorrow' },
            { id: 'UPCOMING', label: 'Upcoming' },
            { id: 'COMPLETED', label: `Completed (${completedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectStatusTab(tab.id as any)}
              className={`pb-1 transition-colors cursor-pointer relative whitespace-nowrap ${
                selectedStatusTab === tab.id
                  ? 'text-red-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
              {selectedStatusTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 3. The Obligations Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4 sm:px-6">VEHICLE</th>
              <th className="py-3 px-4 sm:px-6">OBLIGATION</th>
              <th className="py-3 px-4 sm:px-6">DUE DATE</th>
              <th className="py-3 px-4 sm:px-6">SCHEDULE</th>
              <th className="py-3 px-4 sm:px-6">STATUS</th>
              <th className="py-3 px-4 sm:px-6 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {obligations.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CheckCircle2 className="w-8 h-8 text-slate-300" />
                    <span className="font-semibold text-slate-600 text-sm">
                      No vehicle obligations matching current filter
                    </span>
                    <span className="text-xs text-slate-400">
                      Try adjusting your search query or switching active filter tabs above
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              obligations.map((item) => {
                const isDone = item.status === 'DONE';
                const isOverdue = item.status === 'OVERDUE' || (!isDone && item.daysDiff < 0);

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* VEHICLE */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onViewVehicleDetail(item.vehicle)}
                          className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors shrink-0 cursor-pointer"
                          title="View Vehicle Asset Details"
                        >
                          <Truck className="w-4 h-4" />
                        </button>
                        <div>
                          <button
                            type="button"
                            onClick={() => onViewVehicleDetail(item.vehicle)}
                            className="font-bold text-slate-900 hover:text-blue-600 text-sm tracking-tight text-left block cursor-pointer"
                          >
                            {item.noLambung}
                          </button>
                          <div className="text-[11px] text-slate-500 uppercase tracking-tight mt-0.5">
                            {item.tipeKendaraan} · {item.department}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* OBLIGATION */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-2">
                        {item.obligationType === 'COMMISSIONING' ? (
                          <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : item.obligationType === 'FUEL_EXPIRY' ? (
                          <Fuel className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <Wrench className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                          {item.obligationName}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 uppercase tracking-wider pl-6 mt-0.5">
                        {item.driver}
                      </div>
                    </td>

                    {/* DUE DATE */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        {formatFriendlyDate(item.dueDate)}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {item.doneDate ? `Done ${item.doneDate}` : 'Scheduled'}
                      </div>
                    </td>

                    {/* SCHEDULE */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 text-xs font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{item.scheduleTime}</span>
                        </span>

                        {/* H-TAG Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            item.hTag === 'H-1' || item.hTag === 'Today' || item.hTag === 'Overdue'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {item.hTag}
                        </span>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="py-3.5 px-4 sm:px-6">
                      {isDone ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                          DONE
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-300">
                          OVERDUE
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                          SCHEDULED
                        </span>
                      )}
                    </td>

                    {/* ACTION */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      {isDone ? (
                        <button
                          type="button"
                          onClick={() => onConfirmObligation(item)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Done</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onConfirmObligation(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
                        >
                          <Send className="w-3 h-3 text-teal-600" />
                          <span>Confirm</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
