import React, { useState, useEffect } from 'react';
import { SaranaLV, OperationalStatus, ObligationStatus } from '../types';
import { addDays, calculateDaysDiff } from '../services/googleSheetsService';
import {
  Truck,
  X,
  Save,
  Wrench,
  ShieldCheck,
  Fuel,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  FileEdit,
} from 'lucide-react';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicle: SaranaLV, isEdit: boolean) => Promise<void>;
  editVehicle: SaranaLV | null;
  existingDepartments: string[];
  onRequestDelete?: (vehicle: SaranaLV) => void;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editVehicle,
  existingDepartments,
  onRequestDelete,
}) => {
  if (!isOpen) return null;

  const isEdit = !!editVehicle;
  const todayStr = new Date().toISOString().slice(0, 10);

  // Basic Info States
  const [noLambung, setNoLambung] = useState('');
  const [noPolisi, setNoPolisi] = useState('');
  const [tipeKendaraan, setTipeKendaraan] = useState('TOYOTA HILUX 4X4');
  const [department, setDepartment] = useState('COAL MINING');
  const [driver, setDriver] = useState('');
  const [lokasi, setLokasi] = useState('Sangatta Site');
  const [currentKmHm, setCurrentKmHm] = useState(30000);
  const [statusOperasi, setStatusOperasi] = useState<OperationalStatus>('OPERASIONAL');
  const [catatan, setCatatan] = useState('');

  // 1. Weekly PM Check States
  const [lastPmDate, setLastPmDate] = useState(todayStr);
  const [nextPmDueDate, setNextPmDueDate] = useState(addDays(todayStr, 7));
  const [pmStatus, setPmStatus] = useState<ObligationStatus>('SCHEDULED');

  // 2. Commissioning States
  const [lastCommDate, setLastCommDate] = useState(todayStr);
  const [commDueDate, setCommDueDate] = useState(addDays(todayStr, 180));
  const [certNo, setCertNo] = useState('');
  const [commStatus, setCommStatus] = useState<ObligationStatus>('SCHEDULED');

  // 3. Fuel Expiry States
  const [lastFuelDate, setLastFuelDate] = useState(todayStr);
  const [fuelDueDate, setFuelDueDate] = useState(addDays(todayStr, 30));
  const [fuelQuota, setFuelQuota] = useState('250 L / Bulan');
  const [fuelStatus, setFuelStatus] = useState<ObligationStatus>('SCHEDULED');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state whenever editVehicle or isOpen changes
  useEffect(() => {
    if (editVehicle) {
      setNoLambung(editVehicle.noLambung || '');
      setNoPolisi(editVehicle.noPolisi || '');
      setTipeKendaraan(editVehicle.tipeKendaraan || 'TOYOTA HILUX 4X4');
      setDepartment(editVehicle.department || 'COAL MINING');
      setDriver(editVehicle.driver || '');
      setLokasi(editVehicle.lokasi || 'Sangatta Site');
      setCurrentKmHm(editVehicle.currentKmHm ?? 30000);
      setStatusOperasi(editVehicle.statusOperasi || 'OPERASIONAL');
      setCatatan(editVehicle.catatan || '');

      // PM
      setLastPmDate(editVehicle.lastPmDate || todayStr);
      setNextPmDueDate(editVehicle.nextPmDueDate || addDays(todayStr, 7));
      setPmStatus(editVehicle.pmStatus || 'SCHEDULED');

      // Commissioning
      setLastCommDate(editVehicle.lastCommissioningDate || todayStr);
      setCommDueDate(editVehicle.commissioningDueDate || addDays(todayStr, 180));
      setCertNo(editVehicle.commissioningCertificateNo || '');
      setCommStatus(editVehicle.commissioningStatus || 'SCHEDULED');

      // Fuel
      setLastFuelDate(editVehicle.lastFuelRenewDate || todayStr);
      setFuelDueDate(editVehicle.fuelDueDate || addDays(todayStr, 30));
      setFuelQuota(editVehicle.fuelQuota || '250 L / Bulan');
      setFuelStatus(editVehicle.fuelStatus || 'SCHEDULED');
    } else {
      // Default reset for new vehicle
      setNoLambung('');
      setNoPolisi('');
      setTipeKendaraan('TOYOTA HILUX 4X4');
      setDepartment('COAL MINING');
      setDriver('');
      setLokasi('Sangatta Site');
      setCurrentKmHm(30000);
      setStatusOperasi('OPERASIONAL');
      setCatatan('');

      setLastPmDate(todayStr);
      setNextPmDueDate(addDays(todayStr, 7));
      setPmStatus('SCHEDULED');

      setLastCommDate(todayStr);
      setCommDueDate(addDays(todayStr, 180));
      setCertNo('');
      setCommStatus('SCHEDULED');

      setLastFuelDate(todayStr);
      setFuelDueDate(addDays(todayStr, 30));
      setFuelQuota('250 L / Bulan');
      setFuelStatus('SCHEDULED');
    }
  }, [editVehicle, isOpen, todayStr]);

  // Quick Action Handlers for PM
  const handleQuickPmPlus7 = () => {
    const base = lastPmDate || todayStr;
    setNextPmDueDate(addDays(base, 7));
  };

  const handleQuickPmTodayDone = () => {
    setLastPmDate(todayStr);
    setNextPmDueDate(addDays(todayStr, 7));
    setPmStatus('DONE');
  };

  // Quick Action Handlers for Commissioning
  const handleQuickComm180 = () => {
    const base = lastCommDate || todayStr;
    setCommDueDate(addDays(base, 180));
  };

  const handleQuickComm365 = () => {
    const base = lastCommDate || todayStr;
    setCommDueDate(addDays(base, 365));
  };

  const handleQuickCommTodayDone = () => {
    setLastCommDate(todayStr);
    setCommDueDate(addDays(todayStr, 180));
    setCommStatus('DONE');
  };

  // Quick Action Handlers for Fuel
  const handleQuickFuel30 = () => {
    const base = lastFuelDate || todayStr;
    setFuelDueDate(addDays(base, 30));
  };

  const handleQuickFuelTodayDone = () => {
    setLastFuelDate(todayStr);
    setFuelDueDate(addDays(todayStr, 30));
    setFuelStatus('DONE');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noLambung.trim()) return;

    setIsSubmitting(true);

    try {
      // Determine final statuses respecting manual settings
      let finalPmStatus = pmStatus;
      const pmDiff = calculateDaysDiff(nextPmDueDate);
      if (pmStatus !== 'DONE' && pmDiff.daysDiff < 0) {
        finalPmStatus = 'OVERDUE';
      }

      let finalCommStatus = commStatus;
      const commDiff = calculateDaysDiff(commDueDate);
      if (commStatus !== 'DONE' && commDiff.daysDiff < 0) {
        finalCommStatus = 'OVERDUE';
      }

      let finalFuelStatus = fuelStatus;
      const fuelDiff = calculateDaysDiff(fuelDueDate);
      if (fuelStatus !== 'DONE' && fuelDiff.daysDiff < 0) {
        finalFuelStatus = 'OVERDUE';
      }

      const vehicleData: SaranaLV = {
        id: editVehicle?.id || `lv-${Date.now()}`,
        noLambung: noLambung.toUpperCase().trim(),
        noPolisi: noPolisi.toUpperCase().trim(),
        tipeKendaraan: tipeKendaraan.trim(),
        department: department.trim(),
        driver: driver.trim(),
        lokasi: lokasi.trim(),
        currentKmHm: Number(currentKmHm) || 0,
        statusOperasi,
        catatan: catatan.trim(),
        rowNumber: editVehicle?.rowNumber,

        // 1. PM Check
        lastPmDate,
        nextPmDueDate,
        pmStatus: finalPmStatus,
        pmDoneDate: finalPmStatus === 'DONE' ? lastPmDate : '',
        pmScheduleTime: '20:00',

        // 2. Commissioning
        lastCommissioningDate: lastCommDate,
        commissioningDueDate: commDueDate,
        commissioningStatus: finalCommStatus,
        commissioningDoneDate: finalCommStatus === 'DONE' ? lastCommDate : '',
        commissioningCertificateNo: certNo.trim() || `CMS-KPC-2026-${noLambung.replace(/\D/g, '')}`,
        commissioningScheduleTime: '20:00',

        // 3. Fuel Expiry
        lastFuelRenewDate: lastFuelDate,
        fuelDueDate: fuelDueDate,
        fuelStatus: finalFuelStatus,
        fuelDoneDate: finalFuelStatus === 'DONE' ? lastFuelDate : '',
        fuelQuota: fuelQuota.trim(),
        fuelScheduleTime: '20:00',
      };

      await onSave(vehicleData, isEdit);
      onClose();
    } catch (err) {
      console.error('Error submitting vehicle form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 my-auto">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0">
              {isEdit ? <FileEdit className="w-5 h-5 text-emerald-400" /> : <Truck className="w-5 h-5 text-emerald-400" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {isEdit ? `Edit Armada & Jadwal (${editVehicle.noLambung})` : 'Tambah Armada Baru'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                {isEdit
                  ? 'Update tanggal manual Commissioning, Fuel, PM, serta spesifikasi armada'
                  : 'Daftarkan sarana operasional baru ke Cloud Firestore'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Section 1: Identitas Sarana LV */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-slate-500" />
              <span>1. Identitas Sarana LV & PIC</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No Lambung (Fleet ID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LV-001"
                  value={noLambung}
                  onChange={(e) => setNoLambung(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No Polisi (Plat Nomor)
                </label>
                <input
                  type="text"
                  placeholder="e.g. KT 8492 GA"
                  value={noPolisi}
                  onChange={(e) => setNoPolisi(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipe / Model Kendaraan
                </label>
                <input
                  type="text"
                  placeholder="e.g. TOYOTA HILUX 4X4 DC"
                  value={tipeKendaraan}
                  onChange={(e) => setTipeKendaraan(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Departemen Pengguna
                </label>
                <input
                  type="text"
                  placeholder="e.g. COAL MINING"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Driver / Penanggung Jawab (PIC)
                </label>
                <input
                  type="text"
                  placeholder="e.g. BUDI SANTOSO"
                  value={driver}
                  onChange={(e) => setDriver(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lokasi / Pit Area
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pit Sangatta South"
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Commissioning KPC (MANUAL DATE UPDATE) */}
          <div className="bg-emerald-50/60 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/60 pb-2">
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>2. Izin Kelayakan Site Commissioning KPC</span>
              </h4>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-emerald-700 font-semibold">Update Cepat:</span>
                <button
                  type="button"
                  onClick={handleQuickCommTodayDone}
                  className="px-2 py-0.5 text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-md transition-colors cursor-pointer"
                  title="Tandai lulus commissioning hari ini (+6 bulan berlaku)"
                >
                  ✓ Lulus Hari Ini
                </button>
                <button
                  type="button"
                  onClick={handleQuickComm180}
                  className="px-2 py-0.5 text-[10px] font-semibold bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer"
                >
                  +6 Bulan
                </button>
                <button
                  type="button"
                  onClick={handleQuickComm365}
                  className="px-2 py-0.5 text-[10px] font-semibold bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer"
                >
                  +1 Tahun
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Terakhir Lulus
                </label>
                <input
                  type="date"
                  value={lastCommDate}
                  onChange={(e) => setLastCommDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jatuh Tempo (Due Date) <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={commDueDate}
                  onChange={(e) => setCommDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-emerald-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Commissioning
                </label>
                <select
                  value={commStatus}
                  onChange={(e) => setCommStatus(e.target.value as ObligationStatus)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold"
                >
                  <option value="DONE">✓ DONE (Lulus & Aktif)</option>
                  <option value="SCHEDULED">SCHEDULED (Dijadwalkan)</option>
                  <option value="OVERDUE">⚠ OVERDUE (Kadaluarsa)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Sertifikat / Stiker Commissioning
              </label>
              <input
                type="text"
                placeholder="e.g. CMS-KPC-2026-012"
                value={certNo}
                onChange={(e) => setCertNo(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Section 3: Fuel Expiry / Kupon BBM (MANUAL DATE UPDATE) */}
          <div className="bg-amber-50/60 border border-amber-200/90 rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-2">
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <Fuel className="w-4 h-4 text-amber-600" />
                <span>3. Otorisasi Kupon & Bahan Bakar (Fuel Expiry)</span>
              </h4>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-amber-700 font-semibold">Update Cepat:</span>
                <button
                  type="button"
                  onClick={handleQuickFuelTodayDone}
                  className="px-2 py-0.5 text-[10px] font-bold bg-amber-600 text-white hover:bg-amber-700 rounded-md transition-colors cursor-pointer"
                  title="Tandai kupon BBM telah diperbarui hari ini (+30 hari berlaku)"
                >
                  ✓ Perpanjang Hari Ini
                </button>
                <button
                  type="button"
                  onClick={handleQuickFuel30}
                  className="px-2 py-0.5 text-[10px] font-semibold bg-white text-amber-800 border border-amber-300 hover:bg-amber-100 rounded-md transition-colors cursor-pointer"
                >
                  +30 Hari
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Terakhir Isi / Perpanjang
                </label>
                <input
                  type="date"
                  value={lastFuelDate}
                  onChange={(e) => setLastFuelDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jatuh Tempo Kupon (Due Date) <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={fuelDueDate}
                  onChange={(e) => setFuelDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-bold text-amber-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Kupon Fuel
                </label>
                <select
                  value={fuelStatus}
                  onChange={(e) => setFuelStatus(e.target.value as ObligationStatus)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-semibold"
                >
                  <option value="DONE">✓ DONE (Kupon Aktif / Valid)</option>
                  <option value="SCHEDULED">SCHEDULED (Dijadwalkan)</option>
                  <option value="OVERDUE">⚠ OVERDUE (Expired / Habis)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alokasi Kuota Bahan Bakar
              </label>
              <input
                type="text"
                placeholder="e.g. 250 L / Bulan (Kupon Aktif)"
                value={fuelQuota}
                onChange={(e) => setFuelQuota(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Section 4: PM Check Mingguan (7 Hari) */}
          <div className="bg-blue-50/60 border border-blue-200/90 rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/60 pb-2">
              <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-blue-600" />
                <span>4. Siklus PM Check Mingguan (Interval Wajib 7 Hari)</span>
              </h4>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-blue-700 font-semibold">Update Cepat:</span>
                <button
                  type="button"
                  onClick={handleQuickPmTodayDone}
                  className="px-2 py-0.5 text-[10px] font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors cursor-pointer"
                  title="Tandai PM selesai hari ini (+7 hari berikutnya)"
                >
                  ✓ PM Selesai Hari Ini
                </button>
                <button
                  type="button"
                  onClick={handleQuickPmPlus7}
                  className="px-2 py-0.5 text-[10px] font-semibold bg-white text-blue-800 border border-blue-300 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                >
                  +7 Hari
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Terakhir PM Selesai
                </label>
                <input
                  type="date"
                  value={lastPmDate}
                  onChange={(e) => {
                    setLastPmDate(e.target.value);
                    setNextPmDueDate(addDays(e.target.value, 7));
                  }}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jatuh Tempo PM (7 Hari) <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={nextPmDueDate}
                  onChange={(e) => setNextPmDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-blue-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status PM Check
                </label>
                <select
                  value={pmStatus}
                  onChange={(e) => setPmStatus(e.target.value as ObligationStatus)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                >
                  <option value="DONE">✓ DONE (Sudah PM)</option>
                  <option value="SCHEDULED">SCHEDULED (Dijadwalkan)</option>
                  <option value="OVERDUE">⚠ OVERDUE (Terlambat)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Kondisi Operasional & Odometer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kondisi Operasional Unit
              </label>
              <select
                value={statusOperasi}
                onChange={(e) => setStatusOperasi(e.target.value as OperationalStatus)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
              >
                <option value="OPERASIONAL">OPERASIONAL (Siap Pakai Tambang)</option>
                <option value="STANDBY">STANDBY (Cadangan Pool)</option>
                <option value="BREAKDOWN">BREAKDOWN (Dalam Perbaikan Workshop)</option>
                <option value="IN_PM">IN_PM (Sedang Servis PM)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Odometer Saat Ini (KM / HM)
              </label>
              <input
                type="number"
                value={currentKmHm}
                onChange={(e) => setCurrentKmHm(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan / Log Pemeliharaan
            </label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Tambahkan catatan khusus, riwayat servis, atau instruksi kerja..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
            <div>
              {isEdit && editVehicle && onRequestDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRequestDelete(editVehicle);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-transparent rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Armada</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-emerald-400" />
                <span>{isEdit ? 'Simpan Pembaruan Armada' : 'Daftarkan Armada Baru'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
