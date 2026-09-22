import React, { useState, useEffect } from 'react';
import { SaranaLV, OperationalStatus, ObligationStatus } from '../types';
import { addDays, calculateDaysDiff } from '../services/googleSheetsService';
import { Truck, X, Save, Wrench, ShieldCheck, Fuel, Info } from 'lucide-react';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicle: SaranaLV, isEdit: boolean) => Promise<void>;
  editVehicle: SaranaLV | null;
  existingDepartments: string[];
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editVehicle,
  existingDepartments,
}) => {
  if (!isOpen) return null;

  const isEdit = !!editVehicle;
  const todayStr = new Date().toISOString().slice(0, 10);

  // Basic Info
  const [noLambung, setNoLambung] = useState(editVehicle?.noLambung || '');
  const [noPolisi, setNoPolisi] = useState(editVehicle?.noPolisi || '');
  const [tipeKendaraan, setTipeKendaraan] = useState(
    editVehicle?.tipeKendaraan || 'TOYOTA AVANZA'
  );
  const [department, setDepartment] = useState(
    editVehicle?.department || 'COAL MINING'
  );
  const [driver, setDriver] = useState(editVehicle?.driver || '');
  const [lokasi, setLokasi] = useState(editVehicle?.lokasi || 'Sangatta Site');
  const [currentKmHm, setCurrentKmHm] = useState(editVehicle?.currentKmHm || 30000);
  const [statusOperasi, setStatusOperasi] = useState<OperationalStatus>(
    editVehicle?.statusOperasi || 'OPERASIONAL'
  );
  const [catatan, setCatatan] = useState(editVehicle?.catatan || '');

  // 1. Weekly PM Check (Wajib seminggu sekali / 7 hari)
  const [lastPmDate, setLastPmDate] = useState(
    editVehicle?.lastPmDate || todayStr
  );
  const [nextPmDueDate, setNextPmDueDate] = useState(
    editVehicle?.nextPmDueDate || addDays(todayStr, 7)
  );

  // 2. Commissioning
  const [lastCommDate, setLastCommDate] = useState(
    editVehicle?.lastCommissioningDate || '2026-03-15'
  );
  const [commDueDate, setCommDueDate] = useState(
    editVehicle?.commissioningDueDate || '2026-09-30'
  );
  const [certNo, setCertNo] = useState(
    editVehicle?.commissioningCertificateNo || ''
  );

  // 3. Fuel Expiry
  const [lastFuelDate, setLastFuelDate] = useState(
    editVehicle?.lastFuelRenewDate || '2026-08-30'
  );
  const [fuelDueDate, setFuelDueDate] = useState(
    editVehicle?.fuelDueDate || '2026-09-30'
  );
  const [fuelQuota, setFuelQuota] = useState(
    editVehicle?.fuelQuota || '250 L / Bulan'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-calculate weekly PM due date (+7 days) when last PM date changes
  const handleLastPmDateChange = (val: string) => {
    setLastPmDate(val);
    setNextPmDueDate(addDays(val, 7));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Calculate PM status
      const pmDiff = calculateDaysDiff(nextPmDueDate);
      let pmStatus: ObligationStatus = 'SCHEDULED';
      if (pmDiff.daysDiff < 0) pmStatus = 'OVERDUE';
      else if (pmDiff.daysDiff <= 7 && editVehicle?.pmStatus === 'DONE') pmStatus = 'DONE';

      // Calculate Comm status
      const commDiff = calculateDaysDiff(commDueDate);
      let commStatus: ObligationStatus = 'SCHEDULED';
      if (commDiff.daysDiff < 0) commStatus = 'OVERDUE';
      else if (editVehicle?.commissioningStatus === 'DONE') commStatus = 'DONE';

      // Calculate Fuel status
      const fuelDiff = calculateDaysDiff(fuelDueDate);
      let fuelStatus: ObligationStatus = 'SCHEDULED';
      if (fuelDiff.daysDiff < 0) fuelStatus = 'OVERDUE';
      else if (editVehicle?.fuelStatus === 'DONE') fuelStatus = 'DONE';

      const vehicleData: SaranaLV = {
        id: editVehicle?.id || `lv-${Date.now()}`,
        noLambung: noLambung.toUpperCase().trim(),
        noPolisi: noPolisi.toUpperCase().trim(),
        tipeKendaraan: tipeKendaraan.trim(),
        department: department.trim(),
        driver: driver.trim(),
        lokasi: lokasi.trim(),
        currentKmHm: Number(currentKmHm),
        statusOperasi,
        catatan: catatan.trim(),
        rowNumber: editVehicle?.rowNumber,

        // PM
        lastPmDate,
        nextPmDueDate,
        pmStatus,
        pmDoneDate: pmStatus === 'DONE' ? lastPmDate : undefined,
        pmScheduleTime: '20:00',

        // Comm
        lastCommissioningDate: lastCommDate,
        commissioningDueDate: commDueDate,
        commissioningStatus: commStatus,
        commissioningCertificateNo: certNo.trim() || `CMS-KPC-2026-${noLambung.replace(/\D/g, '')}`,
        commissioningScheduleTime: '20:00',

        // Fuel
        lastFuelRenewDate: lastFuelDate,
        fuelDueDate: fuelDueDate,
        fuelStatus: fuelStatus,
        fuelQuota: fuelQuota.trim(),
        fuelScheduleTime: '20:00',
      };

      await onSave(vehicleData, isEdit);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Truck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEdit ? `Edit Sarana LV (${editVehicle.noLambung})` : 'Pendaftaran Unit Sarana LV Baru'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Sistem Pemantauan PM Mingguan, Commissioning, & Fuel Expiry
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Identitas Sarana LV */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-slate-500" />
              <span>1. Identitas Sarana LV</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Lambung <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: LV-007"
                  value={noLambung}
                  onChange={(e) => setNoLambung(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Polisi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: KT 8107 SG"
                  value={noPolisi}
                  onChange={(e) => setNoPolisi(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipe Kendaraan
                </label>
                <input
                  type="text"
                  required
                  list="vehicleTypesList"
                  placeholder="Contoh: TOYOTA AVANZA"
                  value={tipeKendaraan}
                  onChange={(e) => setTipeKendaraan(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <datalist id="vehicleTypesList">
                  <option value="TOYOTA AVANZA" />
                  <option value="MITSUBISHI TRITON" />
                  <option value="TOYOTA HILUX 4X4" />
                  <option value="TOYOTA LAND CRUISER" />
                  <option value="MITSUBISHI PAJERO SPORT" />
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Departemen / Divisi
                </label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Driver / PIC Penanggung Jawab
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: BUDI SANTOSO"
                  value={driver}
                  onChange={(e) => setDriver(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lokasi Operasional / Pit
                </label>
                <input
                  type="text"
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Kewajiban PM Check (Wajib Mingguan 7 Hari) */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-blue-600" />
              <span>2. Siklus PM Check (Wajib Tiap 1 Minggu)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal PM Terakhir
                </label>
                <input
                  type="date"
                  required
                  value={lastPmDate}
                  onChange={(e) => handleLastPmDateChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Jatuh Tempo PM (7 Hari)</span>
                  <span className="text-[10px] text-blue-700 font-semibold bg-blue-100 px-1.5 py-0.2 rounded">
                    Otomatis +7 Hari
                  </span>
                </label>
                <input
                  type="date"
                  required
                  value={nextPmDueDate}
                  onChange={(e) => setNextPmDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Commissioning & Fuel Expiry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Commissioning Box */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>3. Commissioning KPC</span>
              </h4>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jatuh Tempo Commissioning
                </label>
                <input
                  type="date"
                  required
                  value={commDueDate}
                  onChange={(e) => setCommDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No. Sertifikat Commissioning
                </label>
                <input
                  type="text"
                  placeholder="CMS-KPC-2026-..."
                  value={certNo}
                  onChange={(e) => setCertNo(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Fuel Expiry Box */}
            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5 text-amber-600" />
                <span>4. Fuel Expiry (Kupon BBM)</span>
              </h4>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jatuh Tempo Fuel Expiry
                </label>
                <input
                  type="date"
                  required
                  value={fuelDueDate}
                  onChange={(e) => setFuelDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kuota BBM Bulanan
                </label>
                <input
                  type="text"
                  value={fuelQuota}
                  onChange={(e) => setFuelQuota(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Operasional & Catatan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Operasi
              </label>
              <select
                value={statusOperasi}
                onChange={(e) => setStatusOperasi(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="OPERASIONAL">OPERASIONAL (Siap Pakai)</option>
                <option value="STANDBY">STANDBY (Cadangan Pool)</option>
                <option value="BREAKDOWN">BREAKDOWN (Dalam Perbaikan)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                KM / HM Saat Ini
              </label>
              <input
                type="number"
                value={currentKmHm}
                onChange={(e) => setCurrentKmHm(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan / Remarks
            </label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan kondisi unit atau riwayat servis..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
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
              <span>{isEdit ? 'Simpan Perubahan' : 'Daftarkan Sarana LV'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
