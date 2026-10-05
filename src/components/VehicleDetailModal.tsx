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
  Trash2,
} from 'lucide-react';

interface VehicleDetailModalProps {
  vehicle: SaranaLV | null;
  isOpen: boolean;
  isAdmin?: boolean;
  onClose: () => void;
  onOpenConfirmObligation: (item: VehicleObligationItem) => void;
  onEditVehicle: (vehicle: SaranaLV) => void;
  onRequestDelete?: (vehicle: SaranaLV) => void;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  isOpen,
  isAdmin,
  onClose,
  onOpenConfirmObligation,
  onEditVehicle,
  onRequestDelete,
}) => {
  if (!isOpen || !vehicle) return null;

  const pmDiff = calculateDaysDiff(vehicle.nextPmDueDate);
  const commDiff = calculateDaysDiff(vehicle.commissioningDueDate);
  const fuelDiff = calculateDaysDiff(vehicle.fuelDueDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-xs shrink-0">
              <Truck className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">{vehicle.noLambung}</h3>
                <span className="text-[11px] sm:text-xs font-mono font-semibold text-slate-700 bg-slate-200/90 px-1.5 py-0.5 rounded-md">
                  {vehicle.noPolisi || '-'}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {vehicle.statusOperasi}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate mt-0.5">
                {vehicle.tipeKendaraan} · {vehicle.department}
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs overflow-y-auto flex-1">
          {/* Driver & Location Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 p-3 sm:p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                Designated Operator
              </span>
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1 truncate">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{vehicle.driver || '-'}</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                Location / Pit
              </span>
              <span className="font-semibold text-slate-700 text-xs flex items-center gap-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{vehicle.lokasi}</span>
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                Current Odometer
              </span>
              <span className="font-semibold text-slate-700 text-xs flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{vehicle.currentKmHm.toLocaleString('en-US')} KM</span>
              </span>
            </div>
          </div>

          {/* 3 Obligations Status Cards */}
          <div className="space-y-2.5 sm:space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Fleet Compliance & Obligation Matrix
            </h4>

            {/* 1. PM Check Card */}
            <div className="p-3 sm:p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
              <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Wrench className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">
                      PM Inspection (7-Day Cycle)
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md border ${
                        pmDiff.daysDiff < 0 || pmDiff.hTag === 'H-1'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {pmDiff.hTag}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Last: {formatFriendlyDate(vehicle.lastPmDate)} · Due:{' '}
                    <span className="font-semibold text-slate-700">
                      {formatFriendlyDate(vehicle.nextPmDueDate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="self-end sm:self-auto shrink-0">
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
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  {vehicle.pmStatus === 'DONE' ? '✓ PM Done' : 'Record PM'}
                </button>
              </div>
            </div>

            {/* 2. Commissioning Card */}
            <div className="p-3 sm:p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
              <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">
                      KPC Commissioning Safety Pass
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md border ${
                        commDiff.daysDiff < 0 || commDiff.hTag === 'H-1'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {commDiff.hTag}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Cert: {vehicle.commissioningCertificateNo || '-'} · Valid:{' '}
                    <span className="font-semibold text-slate-700">
                      {formatFriendlyDate(vehicle.commissioningDueDate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="self-end sm:self-auto shrink-0">
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
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  {vehicle.commissioningStatus === 'DONE' ? '✓ Certified' : 'Renew Clearance'}
                </button>
              </div>
            </div>

            {/* 3. Fuel Expiry Card */}
            <div className="p-3 sm:p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
              <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Fuel className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">
                      Fuel Expiry & Allocation
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md border ${
                        fuelDiff.daysDiff < 0 || fuelDiff.hTag === 'H-1'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {fuelDiff.hTag}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Quota: {vehicle.fuelQuota || 'Active'} · Valid:{' '}
                    <span className="font-semibold text-slate-700">
                      {formatFriendlyDate(vehicle.fuelDueDate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="self-end sm:self-auto shrink-0">
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
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  {vehicle.fuelStatus === 'DONE' ? '✓ Fuel Valid' : 'Renew Quota'}
                </button>
              </div>
            </div>
          </div>

          {/* Catatan Remarks */}
          {vehicle.catatan && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
              <span className="font-bold text-slate-800 block mb-0.5 text-[11px]">
                Field Remarks & Logs:
              </span>
              <p className="text-xs">{vehicle.catatan}</p>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditVehicle(vehicle);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Asset Details</span>
              </button>

              {isAdmin && onRequestDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRequestDelete(vehicle);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-transparent rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Decommission Vehicle</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
