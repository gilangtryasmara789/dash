import React from 'react';
import { SaranaLV, VehicleObligationItem } from '../types';
import { formatFriendlyDate, calculateDaysDiff } from '../services/googleSheetsService';
import {
  X,
  Truck,
  Calendar,
  Gauge,
  User,
  MapPin,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Wrench,
  Fuel,
  CheckCircle2,
  Edit,
} from 'lucide-react';

interface VehicleDetailModalProps {
  vehicle: SaranaLV | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenConfirmObligation: (item: VehicleObligationItem) => void;
  onEditVehicle: (vehicle: SaranaLV) => void;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onOpenConfirmObligation,
  onEditVehicle,
}) => {
  if (!isOpen || !vehicle) return null;

  const pmDiff = calculateDaysDiff(vehicle.nextPmDueDate);
  const commDiff = calculateDaysDiff(vehicle.commissioningDueDate);
  const fuelDiff = calculateDaysDiff(vehicle.fuelDueDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-xs">
              <Truck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">{vehicle.noLambung}</h3>
                <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-200/90 px-2 py-0.5 rounded-md">
                  {vehicle.noPolisi || '-'}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {vehicle.statusOperasi}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {vehicle.tipeKendaraan} · {vehicle.department}
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

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Driver & Location Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                Driver / PIC
              </span>
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {vehicle.driver || '-'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                Lokasi Operasi
              </span>
              <span className="font-semibold text-slate-700 text-xs flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {vehicle.lokasi}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                Odometer (KM/HM)
              </span>
              <span className="font-semibold text-slate-700 text-xs flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-slate-400" />
                {vehicle.currentKmHm.toLocaleString('id-ID')} KM
              </span>
            </div>
          </div>

          {/* 3 Obligations Status Cards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Status 3 Kewajiban Utama Sarana LV
            </h4>

            {/* 1. PM Check Card */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">
                      PM Check (Wajib 7 Hari)
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded-md border ${
                        pmDiff.daysDiff < 0 || pmDiff.hTag === 'H-1'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {pmDiff.hTag}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Terakhir: {formatFriendlyDate(vehicle.lastPmDate)} · Jatuh tempo:{' '}
                    <span className="font-semibold text-slate-700">
                      {formatFriendlyDate(vehicle.nextPmDueDate)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    onOpenConfirmObligation({
                      id: `${vehicle.id}_PM_CHECK`,
                      vehicleId: vehicle.id,
                      noLambung: vehicle.noLambung,
                      noPolisi: vehicle.noPolisi,
                      tipeKendaraan: vehicle.tipeKendaraan,
                      department: vehicle.department,
                      driver: vehicle.driver,
                      obligationType: 'PM_CHECK',
                      obligationName: 'PM Check',
                      dueDate: vehicle.nextPmDueDate,
                      doneDate: vehicle.pmDoneDate,
                      scheduleTime: vehicle.pmScheduleTime || '20:00',
                      status: vehicle.pmStatus,
                      daysDiff: pmDiff.daysDiff,
                      hTag: pmDiff.hTag,
                      vehicle,
                    });
                  }}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  {vehicle.pmStatus === 'DONE' ? '✓ Sudah PM' : 'Update PM'}
                </button>
              </div>
            </div>

            {/* 2. Commissioning Card */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">
                      Commissioning KPC
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded-md border ${
                        commDiff.daysDiff < 0 || commDiff.hTag === 'H-1'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {commDiff.hTag}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Sertifikat: {vehicle.commissioningCertificateNo || '-'} · Berlaku s/d:{' '}
                    <span className="font-semibold text-slate-700">
                      {formatFriendlyDate(vehicle.commissioningDueDate)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    onOpenConfirmObligation({
                      id: `${vehicle.id}_COMMISSIONING`,
                      vehicleId: vehicle.id,
                      noLambung: vehicle.noLambung,
                      noPolisi: vehicle.noPolisi,
                      tipeKendaraan: vehicle.tipeKendaraan,
                      department: vehicle.department,
                      driver: vehicle.driver,
                      obligationType: 'COMMISSIONING',
                      obligationName: 'Commissioning',
                      dueDate: vehicle.commissioningDueDate,
                      doneDate: vehicle.commissioningDoneDate,
                      scheduleTime: vehicle.commissioningScheduleTime || '20:00',
                      status: vehicle.commissioningStatus,
                      daysDiff: commDiff.daysDiff,
                      hTag: commDiff.hTag,
                      vehicle,
                    });
                  }}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  {vehicle.commissioningStatus === 'DONE' ? '✓ Valid' : 'Update Comm'}
                </button>
              </div>
            </div>

            {/* 3. Fuel Expiry Card */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Fuel className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">
                      Fuel Expiry (Kupon BBM)
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded-md border ${
                        fuelDiff.daysDiff < 0 || fuelDiff.hTag === 'H-1'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {fuelDiff.hTag}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Alokasi: {vehicle.fuelQuota || '250 L/Bulan'} · Jatuh tempo:{' '}
                    <span className="font-semibold text-slate-700">
                      {formatFriendlyDate(vehicle.fuelDueDate)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    onOpenConfirmObligation({
                      id: `${vehicle.id}_FUEL_EXPIRY`,
                      vehicleId: vehicle.id,
                      noLambung: vehicle.noLambung,
                      noPolisi: vehicle.noPolisi,
                      tipeKendaraan: vehicle.tipeKendaraan,
                      department: vehicle.department,
                      driver: vehicle.driver,
                      obligationType: 'FUEL_EXPIRY',
                      obligationName: 'Fuel Expiry',
                      dueDate: vehicle.fuelDueDate,
                      doneDate: vehicle.fuelDoneDate,
                      scheduleTime: vehicle.fuelScheduleTime || '20:00',
                      status: vehicle.fuelStatus,
                      daysDiff: fuelDiff.daysDiff,
                      hTag: fuelDiff.hTag,
                      vehicle,
                    });
                  }}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  {vehicle.fuelStatus === 'DONE' ? '✓ Kupon Aktif' : 'Update BBM'}
                </button>
              </div>
            </div>
          </div>

          {/* Catatan Remarks */}
          {vehicle.catatan && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
              <span className="font-bold text-slate-800 block mb-0.5 text-[11px]">
                Catatan Lapangan:
              </span>
              <p className="text-xs">{vehicle.catatan}</p>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditVehicle(vehicle);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Data Lengkap</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
