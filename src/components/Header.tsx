import React from 'react';
import { KpcLogo } from './KpcLogo';
import { GoogleSheetsConfig } from '../types';
import {
  Lock,
  Unlock,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  Plus,
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
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Left: KPC Logo & System Name & Live Badge */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* KPC Brand */}
            <div className="h-9 sm:h-11 flex items-center">
              <KpcLogo className="h-8 sm:h-10" />
            </div>

            {/* Title Separator */}
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center gap-2.5">
              <span className="text-sm sm:text-base font-semibold text-slate-800 tracking-tight">
                Coal Mining · LV Control
              </span>

              {/* Live Monitoring Badge as in user's screenshot */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[11px] font-medium shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Live Monitoring</span>
              </div>
            </div>
          </div>

          {/* Right: Google Sheets & Admin Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
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
                    {config.spreadsheetName || 'Monitoring PM LV'}
                  </span>
                </button>
                <a
                  href={`https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-slate-400 hover:text-emerald-700 rounded transition-colors"
                  title="Buka Spreadsheet"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={isSyncing}
                  className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors cursor-pointer"
                  title="Sinkronkan"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="header-connect-sheet-btn"
                onClick={onOpenSheetModal}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Google Sheet</span>
              </button>
            )}

            {/* Add Vehicle Button (Admin / Supervisor) */}
            <button
              type="button"
              id="header-add-vehicle-btn"
              onClick={onOpenAddVehicle}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Tambah</span> Unit
            </button>

            {/* Admin Login Button matching screenshot */}
            <button
              type="button"
              id="admin-login-btn"
              onClick={onOpenAdminModal}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer shadow-xs ${
                isAdmin
                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {isAdmin ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-rose-600" />
                  <span>Admin Mode</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Admin Login</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
