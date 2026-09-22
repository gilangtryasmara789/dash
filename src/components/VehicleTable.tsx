import React from 'react';
import { SaranaLV, PMStatus } from '../types';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Car,
  User,
  MapPin,
  FileEdit,
  ExternalLink,
  ShieldCheck,
  Calendar
} from 'lucide-react';

interface VehicleTableProps {
  vehicles: SaranaLV[];
  onOpenQuickPm: (vehicle: SaranaLV) => void;
  onOpenEdit: (vehicle: SaranaLV) => void;
  onOpenDetail: (vehicle: SaranaLV) => void;
}

export const VehicleTable: React.FC<VehicleTableProps> = ({
  vehicles,
  onOpenQuickPm,
  onOpenEdit,
  onOpenDetail,
}) => {
  const getStatusBadge = (status: PMStatus) => {
    switch (status) {
      case 'SUDAH_PM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Sudah PM
          </span>
        );
      case 'DUE_SOON':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Jatuh Tempo Segera
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Overdue PM
          </span>
        );
      case 'BELUM_PM':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Wrench className="w-3.5 h-3.5 text-slate-500" />
            Belum PM
          </span>
        );
    }
  };

  const getOperationalBadge = (status: string) => {
    switch (status) {
      case 'OPERASIONAL':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Operasional
          </span>
        );
      case 'STANDBY':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Standby
          </span>
        );
      case 'BREAKDOWN':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Breakdown
          </span>
        );
      case 'IN_PM':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Sedang PM
          </span>
        );
      default:
        return <span className="text-[11px] text-slate-500">{status}</span>;
    }
  };

  const calculateDaysRemaining = (dueDateStr: string) => {
    if (!dueDateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (vehicles.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Tidak ada unit sarana LV yang sesuai</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Coba ubah kata kunci pencarian atau reset filter untuk menampilkan semua unit.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[960px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
              <th className="py-3.5 px-4">No. Lambung</th>
              <th className="py-3.5 px-4">Kendaraan & Penanggung Jawab</th>
              <th className="py-3.5 px-4">KM Saat Ini / Target PM</th>
              <th className="py-3.5 px-4">Jadwal PM (Terakhir & Jatuh Tempo)</th>
              <th className="py-3.5 px-4">Status PM</th>
              <th className="py-3.5 px-4">Kondisi Unit</th>
              <th className="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {vehicles.map((vehicle) => {
              const daysRemaining = calculateDaysRemaining(vehicle.nextPmDueDate);
              const nextKm = vehicle.nextPmDueKmHm || (vehicle.currentKmHm + 5000);
              const lastKm = vehicle.lastPmKmHm || 0;
              const interval = vehicle.pmIntervalKm || 5000;
              const kmRemaining = nextKm - vehicle.currentKmHm;
              
              // Hitung % progress pemakaian KM menuju PM berikutnya
              const kmProgress = interval > 0
                ? Math.min(100, Math.max(0, Math.round(((vehicle.currentKmHm - lastKm) / interval) * 100)))
                : 0;

              const effectivePmStatus = vehicle.pmStatus || vehicle.statusPm || 'SCHEDULED';

              return (
                <tr
                  key={vehicle.id}
                  id={`vehicle-row-${vehicle.noLambung.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  className="hover:bg-slate-50/60 transition-colors group"
                >
                  {/* No Lambung */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-9 rounded-sm shrink-0 ${
                          (effectivePmStatus as string) === 'SUDAH_PM' || effectivePmStatus === 'DONE'
                            ? 'bg-emerald-500'
                            : (effectivePmStatus as string) === 'DUE_SOON'
                            ? 'bg-amber-500'
                            : effectivePmStatus === 'OVERDUE'
                            ? 'bg-rose-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      <div>
                        <span className="font-bold text-sm text-slate-900 block tracking-tight">
                          {vehicle.noLambung}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                          {vehicle.noPolisi || 'No Plat'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Kendaraan & Driver */}
                  <td className="py-3.5 px-4 align-top max-w-[220px]">
                    <p className="font-semibold text-slate-800 truncate" title={vehicle.tipeKendaraan}>
                      {vehicle.tipeKendaraan}
                    </p>
                    <div className="flex items-center gap-1.5 text-slate-500 mt-1 truncate">
                      <User className="w-3 text-slate-400 shrink-0" />
                      <span className="truncate">{vehicle.driver || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate text-slate-600 font-medium">{vehicle.department}</span>
                      <span>•</span>
                      <span className="truncate">{vehicle.lokasi}</span>
                    </div>
                  </td>

                  {/* KM Monitoring */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="font-bold text-slate-900">
                          {vehicle.currentKmHm.toLocaleString()} KM
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          / {nextKm.toLocaleString()} KM
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            kmProgress >= 100
                              ? 'bg-rose-500'
                              : kmProgress >= 85
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${kmProgress}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Interval: {interval.toLocaleString()} KM</span>
                        <span
                          className={`font-semibold ${
                            kmRemaining < 0
                              ? 'text-rose-600'
                              : kmRemaining <= 500
                              ? 'text-amber-600'
                              : 'text-slate-600'
                          }`}
                        >
                          {kmRemaining < 0
                            ? `Over ${Math.abs(kmRemaining).toLocaleString()} KM`
                            : `Sisa ${kmRemaining.toLocaleString()} KM`}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Jadwal PM */}
                  <td className="py-3.5 px-4 align-top">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-600">
                        <span className="text-slate-400">Terakhir:</span>
                        <span className="font-medium text-slate-800">
                          {vehicle.lastPmDate || '-'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-800 font-semibold mt-0.5">
                        <span className="text-slate-400 font-normal">Jatuh Tempo:</span>
                        <span>{vehicle.nextPmDueDate || '-'}</span>
                      </div>

                      {daysRemaining !== null && (
                        <div className="mt-1">
                          {daysRemaining < 0 ? (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-sm">
                              Terlewat {Math.abs(daysRemaining)} hari
                            </span>
                          ) : daysRemaining <= 7 ? (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-sm">
                              Sisa {daysRemaining} hari lagi
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500">
                              Sisa {daysRemaining} hari
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status PM */}
                  <td className="py-3.5 px-4 align-top">
                    {getStatusBadge(effectivePmStatus)}
                    {vehicle.lastInspector && (
                      <p className="text-[10px] text-slate-400 mt-1 truncate">
                        Tech: {vehicle.lastInspector}
                      </p>
                    )}
                  </td>

                  {/* Kondisi Unit */}
                  <td className="py-3.5 px-4 align-top">
                    {getOperationalBadge(vehicle.statusOperasi)}
                    {vehicle.catatan && (
                      <p
                        className="text-[11px] text-slate-500 mt-1 truncate max-w-[150px]"
                        title={vehicle.catatan}
                      >
                        {vehicle.catatan}
                      </p>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 align-top text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Check PM Selesai */}
                      <button
                        id={`btn-pm-check-${vehicle.noLambung.toLowerCase()}`}
                        type="button"
                        onClick={() => onOpenQuickPm(vehicle)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer border border-emerald-200 hover:border-transparent"
                        title="Catat Pelaksanaan PM Check"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Check PM</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        id={`btn-edit-${vehicle.noLambung.toLowerCase()}`}
                        type="button"
                        onClick={() => onOpenEdit(vehicle)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Data Unit"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                      </button>

                      {/* Detail Button */}
                      <button
                        id={`btn-detail-${vehicle.noLambung.toLowerCase()}`}
                        type="button"
                        onClick={() => onOpenDetail(vehicle)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Lihat Detail"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <span>Menampilkan {vehicles.length} unit sarana LV</span>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Sudah PM
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Jatuh Tempo Segera
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Overdue PM
          </span>
        </div>
      </div>
    </div>
  );
};
