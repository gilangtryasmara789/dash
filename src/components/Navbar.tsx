import React from 'react';
import { GoogleSheetsConfig } from '../types';
import {
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  Settings,
} from 'lucide-react';

interface NavbarProps {
  config: GoogleSheetsConfig;
  token: string | null;
  isSyncing: boolean;
  onRefresh: () => void;
  onOpenSheetModal: () => void;
  onOpenAddVehicle: () => void;
  onSignInWithGoogle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  token,
  isSyncing,
  onRefresh,
  onOpenSheetModal,
  onOpenAddVehicle,
  onSignInWithGoogle,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Truck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none">
                  MONITORING PM SARANA LV
                </h1>
                <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Fleet PM
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 hidden xs:block">
                Sistem Pemantauan Preventive Maintenance Check Sarana Ringan (LV)
              </p>
            </div>
          </div>

          {/* Right Controls: Google Sheets & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Google Sheets Connection Pill */}
            {config.spreadsheetId ? (
              <div className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-xl transition-colors">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                <button
                  type="button"
                  onClick={onOpenSheetModal}
                  className="text-left max-w-[120px] sm:max-w-[180px] truncate cursor-pointer"
                  title={`Tersambung ke: ${config.spreadsheetName || 'Google Sheets'}`}
                >
                  <span className="text-[10px] text-slate-400 block leading-tight font-medium">
                    Google Sheets
                  </span>
                  <span className="text-xs font-semibold text-slate-800 block truncate">
                    {config.spreadsheetName || 'Data PM Sarana LV'}
                  </span>
                </button>

                <a
                  href={`https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-slate-400 hover:text-emerald-700 rounded-md transition-colors"
                  title="Buka Spreadsheet di Google Sheets"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={isSyncing}
                  className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
                  title="Sinkronkan data dengan Google Sheets"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="connect-google-sheets-btn"
                onClick={onOpenSheetModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Hubungkan</span> Google Sheet
              </button>
            )}

            {/* Quick Add Button */}
            <button
              type="button"
              id="top-add-vehicle-btn"
              onClick={onOpenAddVehicle}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah</span> Unit
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
