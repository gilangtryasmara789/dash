import React from 'react';
import { KpcLogo } from './KpcLogo';
import { GoogleSheetsConfig } from '../types';
import { User } from 'firebase/auth';
import {
  Lock,
  Unlock,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  Plus,
  Cloud,
  LogOut,
} from 'lucide-react';

interface HeaderProps {
  isAdmin: boolean;
  onOpenAdminModal: () => void;
  config: GoogleSheetsConfig;
  token: string | null;
  isSyncing: boolean;
  onRefresh: () => void;
  onOpenSheetModal: () => void;
  onOpenAddVehicle: () => void;
  firebaseUser?: User | null;
  onSignInGoogle?: () => void;
  onSignOutGoogle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAdmin,
  onOpenAdminModal,
  config,
  token,
  isSyncing,
  onRefresh,
  onOpenSheetModal,
  onOpenAddVehicle,
  firebaseUser,
  onSignInGoogle,
  onSignOutGoogle,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Left: KPC Logo, System Name & Live Badge */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            {/* KPC Brand */}
            <div className="h-8 sm:h-11 flex items-center shrink-0">
              <KpcLogo className="h-7 sm:h-10" />
            </div>

            {/* Mobile Live Dot Indicator */}
            <div className="sm:hidden flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-semibold text-emerald-700">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span>Live</span>
            </div>

            {/* Title Separator */}
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            <div className="hidden sm:flex items-center gap-2.5">
              <span className="text-sm sm:text-base font-semibold text-slate-800 tracking-tight">
                Coal Mining · LV Fleet Operations
              </span>

              {/* Live Cloud Monitoring Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[11px] font-medium shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Live Cloud Sync</span>
              </div>
            </div>
          </div>

          {/* Right: Cloud Auth, Google Sheets & Admin Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Google Sheets Status */}
            {config.spreadsheetId ? (
              <div className="hidden md:flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-xl transition-colors">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <button
                  type="button"
                  onClick={onOpenSheetModal}
                  className="text-left text-xs max-w-[140px] truncate cursor-pointer"
                  title={`Google Sheet: ${config.spreadsheetName || 'Connected'}`}
                >
                  <span className="text-[10px] text-slate-400 block leading-tight font-medium">Sheets</span>
                  <span className="font-semibold text-slate-800 block truncate">
                    {config.spreadsheetName || 'LV Fleet Register'}
                  </span>
                </button>
                <a
                  href={`https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-slate-400 hover:text-emerald-700 rounded transition-colors"
                  title="Open Spreadsheet in New Tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={isSyncing}
                  className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors cursor-pointer"
                  title="Sync with Sheets"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
                </button>
              </div>
            ) : null}

            {/* Google / Cloud User Status */}
            {firebaseUser ? (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">
                {firebaseUser.photoURL ? (
                  <img
                    src={firebaseUser.photoURL}
                    alt={firebaseUser.displayName || 'User'}
                    className="w-6 h-6 rounded-full border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                    {firebaseUser.email ? firebaseUser.email[0].toUpperCase() : 'U'}
                  </div>
                )}
                <span className="text-xs font-medium text-slate-700 max-w-[110px] truncate hidden md:inline">
                  {firebaseUser.displayName || firebaseUser.email?.split('@')[0]}
                </span>
                {onSignOutGoogle && (
                  <button
                    type="button"
                    onClick={onSignOutGoogle}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : onSignInGoogle ? (
              <button
                type="button"
                onClick={onSignInGoogle}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer"
                title="Sign in with Google to sync changes across devices"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="hidden sm:inline">Sign In</span>
              </button>
            ) : null}

            {/* Add Vehicle Button: HANYA MUNCUL JIKA SUDAH LOGIN ADMIN */}
            {isAdmin && (
              <button
                type="button"
                id="header-add-vehicle-btn"
                onClick={onOpenAddVehicle}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs cursor-pointer animate-in fade-in"
                title="Register New Vehicle Asset (Admin Only)"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Add</span> Vehicle
              </button>
            )}

            {/* Admin Login Button matching screenshot */}
            <button
              type="button"
              id="admin-login-btn"
              onClick={onOpenAdminModal}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer shadow-xs ${
                isAdmin
                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 ring-2 ring-rose-200/50'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {isAdmin ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span className="hidden sm:inline">Admin Mode</span>
                  <span className="sm:hidden">Admin</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="hidden sm:inline">Admin Login</span>
                  <span className="sm:hidden">Admin</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
