import React, { useState, useEffect } from 'react';
import { VehicleObligationItem, SaranaLV } from '../types';
import { addDays, formatFriendlyDate } from '../services/googleSheetsService';
import {
  X,
  Wrench,
  ShieldCheck,
  Fuel,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

interface ConfirmObligationModalProps {
  item: VehicleObligationItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedVehicle: SaranaLV) => void;
}

export const ConfirmObligationModal: React.FC<ConfirmObligationModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !item) return null;

  const vehicle = item.vehicle;
  const todayStr = new Date().toISOString().slice(0, 10);

  // Form states
  const [completionDate, setCompletionDate] = useState(todayStr);
  const [scheduleTime, setScheduleTime] = useState(item.scheduleTime || '20:00');
  const [inspectorNotes, setInspectorNotes] = useState('');
  
  // Specific fields
  const [certNo, setCertNo] = useState(vehicle.commissioningCertificateNo || `CMS-KPC-2026-${vehicle.noLambung.replace(/\D/g, '')}`);
  const [fuelQuota, setFuelQuota] = useState(vehicle.fuelQuota || '250 L / Bulan (Kupon Aktif)');
  
  // PM Checklists
  const [checklist, setChecklist] = useState({
    oliMesin: true,
    remDanKopling: true,
    bautRodaBan: true,
    apar: true,
    radioRigDanRotator: true,
  });

  const nextWeeklyPmDate = addDays(completionDate, 7);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let updatedVehicle: SaranaLV = { ...vehicle };

    if (item.obligationType === 'PM_CHECK') {
      updatedVehicle = {
        ...vehicle,
        lastPmDate: completionDate,
        nextPmDueDate: nextWeeklyPmDate,
        pmStatus: 'DONE',
        pmDoneDate: completionDate,
        pmScheduleTime: scheduleTime,
        catatan: inspectorNotes
          ? `${inspectorNotes} (PM Mingguan selesai: ${completionDate})`
          : vehicle.catatan,
      };
    } else if (item.obligationType === 'COMMISSIONING') {
      // Typically valid for 6 months or 1 year
      const nextCommDue = addDays(completionDate, 180);
      updatedVehicle = {
        ...vehicle,
        lastCommissioningDate: completionDate,
        commissioningDueDate: nextCommDue,
        commissioningStatus: 'DONE',
        commissioningDoneDate: completionDate,
        commissioningCertificateNo: certNo,
        commissioningScheduleTime: scheduleTime,
        catatan: inspectorNotes || vehicle.catatan,
      };
    } else if (item.obligationType === 'FUEL_EXPIRY') {
      // Typically valid for 30 days
      const nextFuelDue = addDays(completionDate, 30);
      updatedVehicle = {
        ...vehicle,
        lastFuelRenewDate: completionDate,
        fuelDueDate: nextFuelDue,
        fuelStatus: 'DONE',
        fuelDoneDate: completionDate,
        fuelScheduleTime: scheduleTime,
        fuelQuota,
        catatan: inspectorNotes || vehicle.catatan,
      };
    }

    onSave(updatedVehicle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              {item.obligationType === 'COMMISSIONING' ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : item.obligationType === 'FUEL_EXPIRY' ? (
                <Fuel className="w-5 h-5 text-amber-400" />
              ) : (
                <Wrench className="w-5 h-5 text-blue-400" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Konfirmasi {item.obligationName}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {vehicle.noLambung} · {vehicle.tipeKendaraan} ({vehicle.driver})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Policy Highlight Banner for Weekly PM Check */}
          {item.obligationType === 'PM_CHECK' && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Ketentuan PM Check Sarana LV:</span> Wajib diinspeksi rutin{' '}
                <span className="font-semibold underline">1 minggu sekali (tiap 7 hari)</span>.
                Tanggal jatuh tempo berikutnya otomatis diperbarui ke:{' '}
                <span className="font-bold text-blue-700">{formatFriendlyDate(nextWeeklyPmDate)}</span>.
              </div>
            </div>
          )}

          {/* Date & Time fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Selesai
              </label>
              <input
                type="date"
                required
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jam Inspeksi
              </label>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Obligation Specific Inputs */}
          {item.obligationType === 'COMMISSIONING' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                No. Sertifikat / Stiker Commissioning KPC
              </label>
              <input
                type="text"
                required
                value={certNo}
                onChange={(e) => setCertNo(e.target.value)}
                placeholder="CMS-KPC-2026-..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Masa berlaku kelayakan unit masuk tambang diperpanjang 6 bulan ke depan.
              </span>
            </div>
          )}

          {item.obligationType === 'FUEL_EXPIRY' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alokasi / Kupon BBM Tambang
              </label>
              <input
                type="text"
                required
                value={fuelQuota}
                onChange={(e) => setFuelQuota(e.target.value)}
                placeholder="250 L / Bulan"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Masa aktif kupon BBM diperbarui untuk siklus 30 hari berikutnya.
              </span>
            </div>
          )}

          {/* PM Checklist Items */}
          {item.obligationType === 'PM_CHECK' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
              <span className="text-xs font-bold text-slate-800 block">
                Checklist Item Inspeksi Mingguan:
              </span>
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.oliMesin}
                  onChange={(e) => setChecklist({ ...checklist, oliMesin: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Level oli mesin, minyak rem, air radiator & filter udara</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.remDanKopling}
                  onChange={(e) => setChecklist({ ...checklist, remDanKopling: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Fungsi rem kaki, handbrake, dan pedal kopling normal</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.bautRodaBan}
                  onChange={(e) => setChecklist({ ...checklist, bautRodaBan: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Alur ketebalan ban min. 50% & torsi baut roda aman</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.apar}
                  onChange={(e) => setChecklist({ ...checklist, apar: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>APAR 6kg bertekanan baik & kotak P3K lengkap</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.radioRigDanRotator}
                  onChange={(e) => setChecklist({ ...checklist, radioRigDanRotator: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Radio RIG frekuensi tambang, lampu rotator & buggy whip aktif</span>
              </label>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan / Hasil Pemeriksaan (Opsional)
            </label>
            <textarea
              rows={2}
              value={inspectorNotes}
              onChange={(e) => setInspectorNotes(e.target.value)}
              placeholder="Unit siap operasional lapangan tanpa kendala..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Simpan & Tandai Selesai</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
