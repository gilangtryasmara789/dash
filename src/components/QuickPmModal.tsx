import React, { useState } from 'react';
import { SaranaLV } from '../types';
import { ShieldCheck, X, Check, Wrench, AlertCircle } from 'lucide-react';

interface QuickPmModalProps {
  vehicle: SaranaLV | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVehicle: SaranaLV) => Promise<void>;
}

export const QuickPmModal: React.FC<QuickPmModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onSubmit,
}) => {
  if (!isOpen || !vehicle) return null;

  const todayStr = new Date().toISOString().slice(0, 10);
  
  // Hitung tanggal 30 hari ke depan untuk next PM
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 30);
  const defaultNextDueDate = nextMonth.toISOString().slice(0, 10);

  const [tanggalPm, setTanggalPm] = useState(todayStr);
  const [kmSaatPm, setKmSaatPm] = useState<number>(vehicle.currentKmHm);
  const [tipePm, setTipePm] = useState('PM 5.000 KM');
  const [mekanik, setMekanik] = useState(vehicle.lastInspector || 'Agus Purnomo (Plant Tech)');
  const [catatan, setCatatan] = useState('Servis berkala selesai, kondisi siap operasi.');
  const [intervalKm, setIntervalKm] = useState<number>(vehicle.pmIntervalKm || 5000);
  const [nextDueDate, setNextDueDate] = useState(defaultNextDueDate);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mandatory Safety checklist
  const [checks, setChecks] = useState({
    oliMesin: true,
    sistemRem: true,
    kondisiBan: true,
    apar: true,
    radioKomunikasi: true,
    rotatorDanFlag: true,
  });

  const handleCheckbox = (key: keyof typeof checks) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const nextDueKm = kmSaatPm + intervalKm;

      const updatedVehicle: SaranaLV = {
        ...vehicle,
        currentKmHm: kmSaatPm,
        lastPmDate: tanggalPm,
        lastPmKmHm: kmSaatPm,
        nextPmDueDate: nextDueDate,
        nextPmDueKmHm: nextDueKm,
        pmIntervalKm: intervalKm,
        pmStatus: 'DONE',
        statusPm: 'SUDAH_PM',
        statusOperasi: 'OPERASIONAL',
        lastInspector: mekanik,
        catatan: `${tipePm} (${tanggalPm}): ${catatan}`,
      };

      await onSubmit(updatedVehicle);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Formulir PM Check — {vehicle.noLambung}
              </h3>
              <p className="text-xs text-slate-500">
                {vehicle.tipeKendaraan} • Plat: {vehicle.noPolisi || '-'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Status Unit Info Banner */}
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-slate-500 block">Departemen / PIC:</span>
              <span className="font-semibold text-slate-800">{vehicle.department} • {vehicle.driver || 'Pool'}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Odometer Terakhir:</span>
              <span className="font-bold text-blue-700 text-sm">{vehicle.currentKmHm.toLocaleString()} KM</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Tanggal Pelaksanaan PM */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal PM Selesai <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={tanggalPm}
                onChange={(e) => setTanggalPm(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* KM Saat PM */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                KM / HM Saat PM <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                value={kmSaatPm}
                onChange={(e) => setKmSaatPm(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Tipe PM */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tipe Servis PM</label>
              <select
                value={tipePm}
                onChange={(e) => setTipePm(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="PM 5.000 KM">PM 5.000 KM (Minor Service)</option>
                <option value="PM 10.000 KM">PM 10.000 KM (Standard Service)</option>
                <option value="PM 20.000 KM">PM 20.000 KM (Major Service)</option>
                <option value="PM 40.000 KM">PM 40.000 KM (Full Overhaul Check)</option>
                <option value="PM 250 HM">PM 250 HM (Alat Tambang/Site)</option>
                <option value="PM 500 HM">PM 500 HM</option>
                <option value="PM P2H Perbaikan">PM P2H / Perbaikan Khusus</option>
              </select>
            </div>

            {/* Mekanik / Pengawas */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Mekanik / Inspector <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={mekanik}
                onChange={(e) => setMekanik(e.target.value)}
                placeholder="Contoh: Agus Purnomo (Plant Tech)"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Checklist Wajib PM */}
          <div className="pt-2">
            <label className="block font-semibold text-slate-800 mb-2">
              Item Inspeksi & Checklist Keselamatan Sarana:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checks.oliMesin}
                  onChange={() => handleCheckbox('oliMesin')}
                  className="rounded-sm text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Ganti Oli Mesin & Filter Oli</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checks.sistemRem}
                  onChange={() => handleCheckbox('sistemRem')}
                  className="rounded-sm text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Kondisi Kampas & Minyak Rem</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checks.kondisiBan}
                  onChange={() => handleCheckbox('kondisiBan')}
                  className="rounded-sm text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Tekanan & Alur Ban (Min. 5mm)</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checks.apar}
                  onChange={() => handleCheckbox('apar')}
                  className="rounded-sm text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>APAR 6Kg & Tanggal Kedaluwarsa</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checks.radioKomunikasi}
                  onChange={() => handleCheckbox('radioKomunikasi')}
                  className="rounded-sm text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Radio RIG VHF/UHF Tambang</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checks.rotatorDanFlag}
                  onChange={() => handleCheckbox('rotatorDanFlag')}
                  className="rounded-sm text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Rotator & Buggy Whip (Safety Flag)</span>
              </label>
            </div>
          </div>

          {/* Pengaturan Jadwal PM Berikutnya */}
          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900">Jadwal PM Berikutnya (Otomatis)</span>
              <span className="text-[11px] text-emerald-700">Target +{intervalKm.toLocaleString()} KM</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-emerald-800 font-medium mb-1">
                  Jatuh Tempo Tanggal:
                </label>
                <input
                  type="date"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-slate-800 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-emerald-800 font-medium mb-1">
                  Interval KM Servis:
                </label>
                <input
                  type="number"
                  value={intervalKm}
                  onChange={(e) => setIntervalKm(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-slate-800 text-xs"
                />
              </div>
            </div>
            <p className="text-[11px] text-emerald-700">
              Target KM berikutnya dihitung: <strong>{(kmSaatPm + intervalKm).toLocaleString()} KM</strong>
            </p>
          </div>

          {/* Catatan / Keterangan */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Catatan Inspeksi & Rekomendasi Tambahan
            </label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Kondisi rem baik, wiper depan baru diganti, unit siap operasi."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Menyimpan ke Sheet...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Selesai & Update Status PM</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
