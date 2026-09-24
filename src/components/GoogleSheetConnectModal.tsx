import React, { useState } from 'react';
import { GoogleSheetsConfig, SaranaLV } from '../types';
import {
  FileSpreadsheet,
  X,
  PlusCircle,
  ExternalLink,
  FolderOpen,
  Link2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  Sparkles,
} from 'lucide-react';
import {
  fetchSpreadsheetFiles,
  createNewSaranaLVSheet,
} from '../services/googleSheetsService';

interface GoogleSheetConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GoogleSheetsConfig;
  token: string | null;
  onSignInWithGoogle: () => void;
  onSelectSpreadsheet: (id: string, name: string) => Promise<void>;
  onDisconnect: () => void;
  onRefreshData: () => Promise<void>;
  currentVehicles: SaranaLV[];
}

export const GoogleSheetConnectModal: React.FC<GoogleSheetConnectModalProps> = ({
  isOpen,
  onClose,
  config,
  token,
  onSignInWithGoogle,
  onSelectSpreadsheet,
  onDisconnect,
  onRefreshData,
  currentVehicles,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'create' | 'drive' | 'url'>('create');
  const [manualUrlOrId, setManualUrlOrId] = useState('');
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLoadDriveFiles = async () => {
    if (!token) return;
    setIsLoadingFiles(true);
    setErrorMsg(null);
    try {
      const files = await fetchSpreadsheetFiles(token);
      setDriveFiles(files);
      setActiveTab('drive');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to retrieve spreadsheets from Google Drive');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleCreateNewSheet = async () => {
    if (!token) {
      onSignInWithGoogle();
      return;
    }
    setIsCreating(true);
    setErrorMsg(null);
    try {
      const res = await createNewSaranaLVSheet(token, currentVehicles);
      await onSelectSpreadsheet(res.spreadsheetId, res.spreadsheetName);
      setSuccessMsg(`Successfully created new Google Sheet: "${res.spreadsheetName}"!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create new Google Sheet');
    } finally {
      setIsCreating(false);
    }
  };

  const handleApplyManualId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrlOrId.trim()) return;

    let sheetId = manualUrlOrId.trim();
    // Parse if user pasted full URL: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit...
    const urlMatch = manualUrlOrId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (urlMatch && urlMatch[1]) {
      sheetId = urlMatch[1];
    }

    try {
      await onSelectSpreadsheet(sheetId, 'Connected Fleet Google Sheet');
      setSuccessMsg('Successfully linked Google Sheet!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to link target Google Sheet');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Google Sheets Integration</h3>
              <p className="text-xs text-slate-500">
                Bidirectional synchronization of Light Vehicle PM inspections directly to your corporate sheet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Notifications */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google Account Status Banner */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {config.userAvatar ? (
                <img
                  src={config.userAvatar}
                  alt={config.userName || 'User'}
                  className="w-9 h-9 rounded-full border border-slate-300 object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {config.userName ? config.userName.charAt(0) : 'G'}
                </div>
              )}
              <div>
                <span className="font-bold text-slate-800 block text-xs">
                  {config.userName || 'Authorized Google Account'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {config.userEmail || 'gilangtryasmara789@gmail.com'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!token ? (
                <button
                  type="button"
                  onClick={onSignInWithGoogle}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Connect Google Account
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onDisconnect}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Disconnect account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              )}
            </div>
          </div>

          {/* Connected Spreadsheet Card */}
          {config.spreadsheetId ? (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Active Connected Spreadsheet
                </span>
                <a
                  href={`https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold text-xs underline"
                >
                  <span>Open in Google Sheets</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-emerald-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block truncate max-w-[280px]">
                    {config.spreadsheetName || 'Light Vehicle PM Fleet Register'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {config.spreadsheetId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onRefreshData}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-md transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Sync Now</span>
                </button>
              </div>

              {config.lastSyncTime && (
                <p className="text-[11px] text-emerald-700">
                  Last synchronized: {config.lastSyncTime}
                </p>
              )}
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                No Google Sheet currently connected. You can generate a new formatted spreadsheet or select an existing one.
              </span>
            </div>
          )}

          {/* Tabs for choosing method */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex border-b border-slate-200 mb-3 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className={`pb-2 px-3 font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'create'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Auto-Create Sheet
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('drive');
                  if (driveFiles.length === 0 && token) {
                    handleLoadDriveFiles();
                  }
                }}
                className={`pb-2 px-3 font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'drive'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Select from Drive
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`pb-2 px-3 font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'url'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Paste ID or URL
              </button>
            </div>

            {/* Tab 1: Create New Sheet Automatically */}
            {activeTab === 'create' && (
              <div className="space-y-3 p-4 bg-slate-50/70 border border-slate-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">
                      Generate Ready-to-Use Fleet Spreadsheet in Google Drive
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Automatically provisions a formatted spreadsheet with standardized fleet headers (Fleet ID, Model, Odometer, Last PM Date, Due Date, PM Status, etc.) and synchronizes all active vehicles.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isCreating}
                  onClick={handleCreateNewSheet}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50 text-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>
                    {isCreating
                      ? 'Generating fleet spreadsheet in Drive...'
                      : 'Create & Link New Google Sheet'}
                  </span>
                </button>
              </div>
            )}

            {/* Tab 2: Choose from Google Drive */}
            {activeTab === 'drive' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-500 text-[11px]">
                    Available Spreadsheets in Google Drive:
                  </span>
                  <button
                    type="button"
                    onClick={handleLoadDriveFiles}
                    disabled={isLoadingFiles}
                    className="text-blue-600 hover:underline text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                    <span>Reload</span>
                  </button>
                </div>

                {isLoadingFiles ? (
                  <div className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <span>Loading Google Drive spreadsheets...</span>
                  </div>
                ) : driveFiles.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-lg text-center text-slate-500">
                    <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                    <p>No spreadsheets found or list not yet loaded.</p>
                    <button
                      type="button"
                      onClick={handleLoadDriveFiles}
                      className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-semibold"
                    >
                      Browse Drive Files
                    </button>
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {driveFiles.map((file) => (
                      <div
                        key={file.id}
                        onClick={() => onSelectSpreadsheet(file.id, file.name)}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors flex items-center justify-between ${
                          config.spreadsheetId === file.id
                            ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-300'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="truncate mr-2">
                          <span className="font-semibold text-slate-800 block truncate">
                            {file.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Modified: {new Date(file.modifiedTime).toLocaleDateString('en-US')}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-blue-600 shrink-0">
                          {config.spreadsheetId === file.id ? 'Selected' : 'Select'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Paste Manual Link or ID */}
            {activeTab === 'url' && (
              <form onSubmit={handleApplyManualId} className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Google Spreadsheet URL or File ID:
                  </label>
                  <div className="relative">
                    <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={manualUrlOrId}
                      onChange={(e) => setManualUrlOrId(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdB.../edit"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Verify that your authenticated Google Account has editor permissions on this sheet.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer text-xs"
                >
                  Link Spreadsheet
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Enterprise security via Google Identity Services</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
