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
          {/* Left: KPC Logo, System Name & Online Indicator */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            {/* KPC Brand */}
            <div className="h-8 sm:h-11 flex items-center shrink-0">
              <KpcLogo className="h-7 sm:h-10" />
            </div>

            {/* Title Separator */}
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                LV Fleet Operations
              </span>
              <span className="hidden md:inline text-xs text-slate-400 font-medium">· Coal Mining</span>

              {/* Real-time Cloud Status */}
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[10px] sm:text-[11px] font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Online</span>
              </div>
            </div>
          </div>

          {/* Right: Controls & Admin Login */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
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
              </div>
            ) : null}

            {/* Add Vehicle Button: Only for Admin */}
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

            {/* Admin Login / Admin Active Button */}
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
