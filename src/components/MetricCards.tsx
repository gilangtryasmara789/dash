import React from 'react';
import { SaranaLV, PMStatus } from '../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  Truck, 
  Wrench 
} from 'lucide-react';

interface MetricCardsProps {
  vehicles: SaranaLV[];
  activeFilter: string;
  onFilterChange: (status: string) => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  vehicles,
  activeFilter,
  onFilterChange,
}) => {
  const total = vehicles.length;
  const sudahPm = vehicles.filter((v) => v.statusPm === 'SUDAH_PM').length;
  const belumPm = vehicles.filter((v) => v.statusPm === 'BELUM_PM').length;
  const overdue = vehicles.filter((v) => v.statusPm === 'OVERDUE').length;
  const dueSoon = vehicles.filter((v) => v.statusPm === 'DUE_SOON').length;
  const breakdownOrInPm = vehicles.filter(
    (v) => v.statusOperasi === 'BREAKDOWN' || v.statusOperasi === 'IN_PM'
  ).length;

  const complianceRate = total > 0 ? Math.round((sudahPm / total) * 100) : 0;

  const cards = [
    {
      id: 'ALL',
      title: 'Total Sarana LV',
      count: total,
      subtext: `${total - breakdownOrInPm} unit aktif operasi`,
      icon: Truck,
      color: 'blue',
      borderColor: 'border-blue-200 hover:border-blue-400',
      activeBorder: 'border-blue-500 ring-2 ring-blue-100',
      bgColor: 'bg-blue-50/50',
      iconBg: 'bg-blue-600 text-white',
      badge: 'Armada LV',
    },
    {
      id: 'SUDAH_PM',
      title: 'Sudah PM Check',
      count: sudahPm,
      subtext: `Kepatuhan ${complianceRate}% dari armada`,
      icon: CheckCircle2,
      color: 'emerald',
      borderColor: 'border-emerald-200 hover:border-emerald-400',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-100',
      bgColor: 'bg-emerald-50/50',
      iconBg: 'bg-emerald-600 text-white',
      badge: `${complianceRate}% Compliant`,
    },
    {
      id: 'DUE_SOON',
      title: 'Jatuh Tempo Segera',
      count: dueSoon,
      subtext: 'Dalam 7 hari / <500 KM',
      icon: Clock,
      color: 'amber',
      borderColor: 'border-amber-200 hover:border-amber-400',
      activeBorder: 'border-amber-500 ring-2 ring-amber-100',
      bgColor: 'bg-amber-50/50',
      iconBg: 'bg-amber-500 text-white',
      badge: 'Perlu Jadwal',
    },
    {
      id: 'OVERDUE',
      title: 'Overdue / Lewat Tempo',
      count: overdue,
      subtext: 'Wajib ditarik untuk servis',
      icon: ShieldAlert,
      color: 'rose',
      borderColor: 'border-rose-200 hover:border-rose-400',
      activeBorder: 'border-rose-500 ring-2 ring-rose-100',
      bgColor: 'bg-rose-50/50',
      iconBg: 'bg-rose-600 text-white',
      badge: overdue > 0 ? 'Tindakan Kritis' : 'Aman',
      hasAlert: overdue > 0,
    },
    {
      id: 'BELUM_PM',
      title: 'Belum PM / Masuk Bay',
      count: belumPm + overdue,
      subtext: `${breakdownOrInPm} unit sedang perbaikan`,
      icon: Wrench,
      color: 'slate',
      borderColor: 'border-slate-200 hover:border-slate-400',
      activeBorder: 'border-slate-500 ring-2 ring-slate-100',
      bgColor: 'bg-slate-50/50',
      iconBg: 'bg-slate-700 text-white',
      badge: 'Pending PM',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.id;

        return (
          <button
            key={card.id}
            id={`metric-card-${card.id.toLowerCase()}`}
            type="button"
            onClick={() => onFilterChange(isActive && card.id !== 'ALL' ? 'ALL' : card.id)}
            className={`text-left p-4 rounded-xl border transition-all duration-200 bg-white shadow-xs hover:shadow-sm cursor-pointer relative overflow-hidden ${
              isActive ? card.activeBorder : card.borderColor
            }`}
          >
            {card.hasAlert && (
              <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
              </span>
            )}

            <div className="flex items-center justify-between mb-2.5">
              <div className={`p-2 rounded-lg ${card.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  card.id === 'OVERDUE' && card.count > 0
                    ? 'bg-rose-100 text-rose-800'
                    : card.id === 'SUDAH_PM'
                    ? 'bg-emerald-100 text-emerald-800'
                    : card.id === 'DUE_SOON'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {card.badge}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {card.count}
              </span>
              <span className="text-xs font-medium text-slate-500">unit</span>
            </div>

            <p className="text-xs font-semibold text-slate-800 mt-1 truncate">{card.title}</p>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">{card.subtext}</p>
          </button>
        );
      })}
    </div>
  );
};
