import React from 'react';
import { SaranaLV } from '../types';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteVehicleModalProps {
  vehicle: SaranaLV | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (vehicleId: string) => void;
}

export const DeleteVehicleModal: React.FC<DeleteVehicleModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-rose-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-rose-100 flex items-center justify-between bg-rose-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Kurangkan Unit dari Armada</h3>
              <p className="text-[11px] text-slate-500">Konfirmasi Penghapusan Sarana LV</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin mengurangkan / menghapus unit sarana berikut dari sistem monitoring? Tindakan ini akan menghapus jadwal PM, izin commissioning, dan kupon BBM unit tersebut.
          </p>

          {/* Vehicle Card Preview */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900">{vehicle.noLambung}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-md font-semibold">
                  {vehicle.noPolisi || '-'}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md">
                {vehicle.statusOperasi}
              </span>
            </div>
            <div className="text-xs text-slate-600 grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-200/70">
              <div>
                <span className="text-[10px] text-slate-400 block">Tipe Kendaraan:</span>
                <span className="font-medium">{vehicle.tipeKendaraan}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Departemen:</span>
                <span className="font-medium">{vehicle.department}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Driver / PIC:</span>
                <span className="font-medium">{vehicle.driver || '-'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Lokasi:</span>
                <span className="font-medium">{vehicle.lokasi || 'Sangatta'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmDelete(vehicle.id);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Ya, Kurangkan Unit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
