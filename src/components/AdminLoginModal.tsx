import React, { useState } from 'react';
import { SaranaLV } from '../types';
import {
  Lock,
  Unlock,
  X,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Search,
  Truck,
  Layers,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  isAdmin: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  onLogout: () => void;
  vehicles: SaranaLV[];
  onOpenAddVehicle: () => void;
  onRequestDeleteVehicle: (vehicle: SaranaLV) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  isAdmin,
  onClose,
  onLoginSuccess,
  onLogout,
  vehicles,
  onOpenAddVehicle,
  onRequestDeleteVehicle,
}) => {
  if (!isOpen) return null;

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [searchUnit, setSearchUnit] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admincm') {
      setError(false);
      setPassword('');
      onLoginSuccess();
    } else {
      setError(true);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError(false);
    onClose();
  };

  const filteredVehicles = vehicles.filter((v) => {
    if (!searchUnit.trim()) return true;
    const q = searchUnit.toLowerCase().trim();
    return (
      v.noLambung.toLowerCase().includes(q) ||
      v.noPolisi.toLowerCase().includes(q) ||
      v.tipeKendaraan.toLowerCase().includes(q) ||
      v.driver.toLowerCase().includes(q) ||
      v.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className={`bg-white rounded-2xl shadow-2xl w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 ${
        isAdmin ? 'max-w-xl' : 'max-w-sm'
      }`}>
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs ${
              isAdmin ? 'bg-emerald-600' : 'bg-slate-900'
            }`}>
              {isAdmin ? <Unlock className="w-4 h-4 text-white" /> : <Lock className="w-4 h-4 text-amber-400" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isAdmin ? 'Fleet Administrator Console' : 'Fleet Administrator Authentication'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isAdmin ? 'Manage Fleet Register & Decommissioning' : 'Light Vehicle Fleet Control · Coal Mining'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5">
          {isAdmin ? (
            /* ADMIN LOGGED-IN VIEW: MANAGE (ADD / DELETE) VEHICLES */
            <div className="space-y-4">
              {/* Status Banner */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">
                      Administrator Session Active
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      Full authorization to register new vehicles or decommission fleet assets.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    handleClose();
                  }}
                  className="px-3 py-1.5 text-[11px] font-bold text-rose-700 hover:text-rose-800 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Exit Admin
                </button>
              </div>

              {/* Action: Add New Vehicle Button */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                  <Layers className="w-4 h-4 text-slate-500" />
                  <span>Active Fleet Assets ({vehicles.length} units)</span>
                </div>
                <button
                  type="button"
                  id="admin-add-vehicle-btn"
                  onClick={() => {
                    handleClose();
                    onOpenAddVehicle();
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>+ Register New Vehicle</span>
                </button>
              </div>

              {/* Quick Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search vehicle to decommission (Fleet ID, Model, PIC)..."
                  value={searchUnit}
                  onChange={(e) => setSearchUnit(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>

              {/* Vehicle List with Delete/Remove Action */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100">
                {filteredVehicles.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No vehicles matching search criteria.
                  </div>
                ) : (
                  filteredVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="p-3 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                          <Truck className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-900">
                              {vehicle.noLambung}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-200/80 text-slate-700 rounded font-medium">
                              {vehicle.noPolisi || 'N/A'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate max-w-xs">
                            {vehicle.tipeKendaraan} · {vehicle.department} ({vehicle.driver || 'No PIC'})
                          </p>
                        </div>
                      </div>

                      {/* Action: Delete / Reduce Vehicle */}
                      <button
                        type="button"
                        onClick={() => onRequestDeleteVehicle(vehicle)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-transparent rounded-lg transition-colors cursor-pointer shrink-0"
                        title={`Decommission vehicle ${vehicle.noLambung}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Decommission</span>
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Close Console
                </button>
              </div>
            </div>
          ) : (
            /* ADMIN LOGIN FORM */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Kata Sandi Administrator
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan kata sandi admin..."
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(false);
                    }}
                    className={`w-full pl-3 pr-10 py-2.5 text-xs border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      error
                        ? 'border-red-400 bg-red-50/30 focus:ring-red-200 focus:border-red-500 text-red-900'
                        : 'border-slate-300 bg-slate-50/50 focus:bg-white focus:ring-slate-900/10 focus:border-slate-900 text-slate-900'
                    }`}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {error && (
                  <span className="text-[11px] text-red-600 mt-1.5 flex items-center gap-1.5 font-medium animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Kata sandi tidak sesuai. Silakan coba lagi.
                  </span>
                )}
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-1/3 py-2.5 px-3 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Masuk Admin</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
