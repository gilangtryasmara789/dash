import React, { useState } from 'react';
import { Lock, Unlock, X, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  isAdmin: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  onLogout: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  isAdmin,
  onClose,
  onLoginSuccess,
  onLogout,
}) => {
  if (!isOpen) return null;

  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123' || password === 'kpc2026' || password.length >= 4) {
      setError(false);
      onLoginSuccess();
      onClose();
    } else {
      setError(true);
    }
  };

  const handleQuickDemoLogin = () => {
    onLoginSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              {isAdmin ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-rose-400" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isAdmin ? 'Admin Mode Aktif' : 'Otentikasi Admin LV'}
              </h3>
              <p className="text-[11px] text-slate-500">Fleet Controller Coal Mining</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {isAdmin ? (
            <div className="text-center py-2 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Anda login sebagai Admin Fleet</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hak akses penuh untuk menambah unit, mengubah jadwal PM, dan konfigurasi Google Sheet.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full py-2 px-3 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
              >
                Keluar dari Admin Mode
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-600">
                Masukkan kata sandi supervisor atau pengawas lapangan untuk mengelola data unit sarana LV.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  placeholder="Masukkan kata sandi (demo: admin123)"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  className={`w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 ${
                    error
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-slate-300 focus:ring-blue-200 focus:border-blue-500'
                  }`}
                  autoFocus
                />
                {error && (
                  <span className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Kata sandi salah. Gunakan: admin123
                  </span>
                )}
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  className="w-full py-2 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  Masuk Admin
                </button>

                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  className="w-full py-2 px-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Login Cepat (Demo Mode)
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
