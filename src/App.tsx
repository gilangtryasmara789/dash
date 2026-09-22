import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  SaranaLV,
  VehicleObligationItem,
  ObligationType,
  GoogleSheetsConfig,
} from './types';
import { INITIAL_LV_DATA } from './data/initialData';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_SCOPES,
  getStoredToken,
  saveToken,
  clearToken,
  getUserProfile,
  readDataFromGoogleSheet,
  updateVehicleInGoogleSheet,
  appendVehicleToGoogleSheet,
  flattenVehicleObligations,
} from './services/googleSheetsService';

import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { KpiSummaryCards } from './components/KpiSummaryCards';
import { WeeklyPmReportCard } from './components/WeeklyPmReportCard';
import { ObligationsRegister } from './components/ObligationsRegister';
import { ConfirmObligationModal } from './components/ConfirmObligationModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AddVehicleModal } from './components/AddVehicleModal';
import { VehicleDetailModal } from './components/VehicleDetailModal';
import { GoogleSheetConnectModal } from './components/GoogleSheetConnectModal';
import { VehicleTable } from './components/VehicleTable';

import {
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  Calendar,
  ExternalLink,
  Plus,
} from 'lucide-react';

const LOCAL_STORAGE_VEHICLES_KEY = 'sarana_lv_data_v2';
const LOCAL_STORAGE_CONFIG_KEY = 'sarana_lv_sheet_config_v2';
const LOCAL_STORAGE_ADMIN_KEY = 'sarana_lv_admin_active';

export default function App() {
  // 1. Data State
  const [vehicles, setVehicles] = useState<SaranaLV[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_VEHICLES_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error parsing stored vehicles', e);
      }
    }
    return INITIAL_LV_DATA;
  });

  // 2. Google Sheets Config State
  const [config, setConfig] = useState<GoogleSheetsConfig>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored config', e);
      }
    }
    return {
      spreadsheetId: '',
      spreadsheetName: '',
      sheetName: 'Monitoring PM LV',
      isConnected: false,
      userEmail: 'gilangtryasmara789@gmail.com',
      userName: 'Gilang Tryasmara',
    };
  });

  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem(LOCAL_STORAGE_ADMIN_KEY) === 'true';
  });

  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Active View: 'OBLIGATIONS' (the user's design) or 'FLEET' (full vehicle catalog)
  const [activeMainView, setActiveMainView] = useState<'OBLIGATIONS' | 'FLEET'>('OBLIGATIONS');

  // Filter & Search states for Obligations Register
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'ALL' | ObligationType>('ALL');
  const [selectedStatusTab, setSelectedStatusTab] = useState<
    'ALL' | 'OVERDUE' | 'TODAY' | 'TOMORROW' | 'UPCOMING'
  >('ALL');

  // Modals state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedObligationItem, setSelectedObligationItem] = useState<VehicleObligationItem | null>(null);

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<SaranaLV | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailVehicle, setDetailVehicle] = useState<SaranaLV | null>(null);

  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);

  // Persistence to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_VEHICLES_KEY, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ADMIN_KEY, isAdmin.toString());
  }, [isAdmin]);

  // Toast notification helper
  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  }, []);

  // Compute all obligations
  const allObligations = useMemo(() => {
    return flattenVehicleObligations(vehicles);
  }, [vehicles]);

  // Counts for pills
  const pmCount = useMemo(() => {
    return allObligations.filter((o) => o.obligationType === 'PM_CHECK').length;
  }, [allObligations]);

  const commCount = useMemo(() => {
    return allObligations.filter((o) => o.obligationType === 'COMMISSIONING').length;
  }, [allObligations]);

  const fuelCount = useMemo(() => {
    return allObligations.filter((o) => o.obligationType === 'FUEL_EXPIRY').length;
  }, [allObligations]);

  // Filtered obligations
  const filteredObligations = useMemo(() => {
    return allObligations.filter((item) => {
      // 1. Filter by obligation type
      if (selectedType !== 'ALL' && item.obligationType !== selectedType) {
        return false;
      }

      // 2. Filter by status tab
      if (selectedStatusTab === 'OVERDUE') {
        if (item.status !== 'OVERDUE' && (item.status === 'DONE' || item.daysDiff >= 0)) {
          return false;
        }
      } else if (selectedStatusTab === 'TODAY') {
        if (item.daysDiff !== 0) return false;
      } else if (selectedStatusTab === 'TOMORROW') {
        if (item.daysDiff !== 1) return false;
      } else if (selectedStatusTab === 'UPCOMING') {
        if (item.daysDiff <= 1 || item.daysDiff > 30) return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          item.noLambung.toLowerCase().includes(q) ||
          item.noPolisi.toLowerCase().includes(q) ||
          item.tipeKendaraan.toLowerCase().includes(q) ||
          item.driver.toLowerCase().includes(q) ||
          item.obligationName.toLowerCase().includes(q) ||
          item.department.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [allObligations, selectedType, selectedStatusTab, searchQuery]);

  // Google OAuth Sign-in Handler
  const handleSignInWithGoogle = useCallback(() => {
    if (!window.google?.accounts?.oauth2) {
      showToast('Memuat Google Services, silakan coba beberapa saat lagi...', 'info');
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_SCOPES,
        callback: async (response) => {
          if (response.error) {
            showToast(`Gagal login Google: ${response.error}`, 'error');
            return;
          }

          if (response.access_token) {
            saveToken(response.access_token, response.expires_in || 3599);
            setToken(response.access_token);

            const profile = await getUserProfile(response.access_token);
            setConfig((prev) => ({
              ...prev,
              isConnected: true,
              userEmail: profile?.email || prev.userEmail,
              userName: profile?.name || prev.userName,
              userAvatar: profile?.picture || prev.userAvatar,
            }));

            showToast('Berhasil terhubung dengan akun Google!', 'success');
          }
        },
      });

      client.requestAccessToken();
    } catch (err: any) {
      console.error(err);
      showToast('Gagal memulai login Google', 'error');
    }
  }, [showToast]);

  const handleDisconnect = useCallback(() => {
    clearToken();
    setToken(null);
    setConfig((prev) => ({
      ...prev,
      isConnected: false,
      spreadsheetId: '',
      spreadsheetName: '',
    }));
    showToast('Koneksi Google Sheets berhasil diputuskan.', 'info');
  }, [showToast]);

  // Sync data from connected Google Sheet
  const handleRefreshData = useCallback(async () => {
    if (!config.spreadsheetId) {
      showToast('Belum ada Google Sheet yang terhubung', 'info');
      return;
    }

    const currentToken = token || getStoredToken();
    if (!currentToken) {
      handleSignInWithGoogle();
      return;
    }

    setIsSyncing(true);
    try {
      const result = await readDataFromGoogleSheet(currentToken, config.spreadsheetId);
      if (result.vehicles.length > 0) {
        setVehicles(result.vehicles);
        const syncTime = new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        });
        setConfig((prev) => ({
          ...prev,
          lastSyncTime: syncTime,
          sheetName: result.sheetTitle,
        }));
        showToast(
          `Berhasil menyinkronkan ${result.vehicles.length} unit sarana LV dari Google Sheet!`,
          'success'
        );
      } else {
        showToast('Google Sheet terhubung, tetapi belum ada data baris unit sarana.', 'info');
      }
    } catch (err: any) {
      console.error(err);
      showToast(`Gagal menyinkronkan data: ${err.message || 'Error'}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  }, [config.spreadsheetId, token, handleSignInWithGoogle, showToast]);

  const handleSelectSpreadsheet = useCallback(
    async (spreadsheetId: string, spreadsheetName: string) => {
      const currentToken = token || getStoredToken();
      if (!currentToken) {
        handleSignInWithGoogle();
        return;
      }

      setIsSyncing(true);
      try {
        const result = await readDataFromGoogleSheet(currentToken, spreadsheetId);
        setConfig((prev) => ({
          ...prev,
          spreadsheetId,
          spreadsheetName,
          sheetName: result.sheetTitle,
          isConnected: true,
          lastSyncTime: new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }));

        if (result.vehicles.length > 0) {
          setVehicles(result.vehicles);
          showToast(
            `Berhasil memuat ${result.vehicles.length} unit dari Google Sheet: "${spreadsheetName}"`,
            'success'
          );
        } else {
          showToast(`Terhubung ke "${spreadsheetName}". Format data siap digunakan!`, 'success');
        }
      } catch (err: any) {
        console.error(err);
        showToast(`Gagal membaca Google Sheet: ${err.message}`, 'error');
      } finally {
        setIsSyncing(false);
      }
    },
    [token, handleSignInWithGoogle, showToast]
  );

  // Confirm / Save obligation update
  const handleSaveConfirmedObligation = useCallback(
    async (updatedVehicle: SaranaLV) => {
      setVehicles((prev) =>
        prev.map((v) => (v.id === updatedVehicle.id ? updatedVehicle : v))
      );

      showToast(`Status kewajiban ${updatedVehicle.noLambung} berhasil diperbarui!`, 'success');

      // Sync to Google Sheets if connected
      const currentToken = token || getStoredToken();
      if (currentToken && config.spreadsheetId) {
        try {
          await updateVehicleInGoogleSheet(
            currentToken,
            config.spreadsheetId,
            config.sheetName || 'Monitoring PM LV',
            updatedVehicle
          );
          showToast(`Perubahan ${updatedVehicle.noLambung} tersinkron ke Google Sheets!`, 'success');
        } catch (err) {
          console.error('Error syncing to sheet:', err);
        }
      }
    },
    [token, config, showToast]
  );

  // Add / Edit complete vehicle
  const handleSaveVehicle = useCallback(
    async (vehicleData: SaranaLV, isEdit: boolean) => {
      if (isEdit) {
        setVehicles((prev) =>
          prev.map((v) => (v.id === vehicleData.id ? vehicleData : v))
        );
        showToast(`Data unit ${vehicleData.noLambung} berhasil diperbarui`, 'success');

        const currentToken = token || getStoredToken();
        if (currentToken && config.spreadsheetId && vehicleData.rowNumber) {
          try {
            await updateVehicleInGoogleSheet(
              currentToken,
              config.spreadsheetId,
              config.sheetName || 'Monitoring PM LV',
              vehicleData
            );
          } catch (err) {
            console.error(err);
          }
        }
      } else {
        const newRowNumber = vehicles.length + 2;
        const newVehicle: SaranaLV = {
          ...vehicleData,
          rowNumber: newRowNumber,
        };

        setVehicles((prev) => [newVehicle, ...prev]);
        showToast(`Sarana LV ${newVehicle.noLambung} berhasil didaftarkan`, 'success');

        const currentToken = token || getStoredToken();
        if (currentToken && config.spreadsheetId) {
          try {
            await appendVehicleToGoogleSheet(
              currentToken,
              config.spreadsheetId,
              config.sheetName || 'Monitoring PM LV',
              newVehicle
            );
          } catch (err) {
            console.error(err);
          }
        }
      }
    },
    [vehicles.length, token, config, showToast]
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-red-100 selection:text-red-900">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold ${
              toastMessage.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : toastMessage.type === 'error'
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-blue-600 text-white border-blue-700'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-white shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Header matching user screenshot */}
      <Header
        isAdmin={isAdmin}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        config={config}
        token={token}
        isSyncing={isSyncing}
        onRefresh={handleRefreshData}
        onOpenSheetModal={() => setIsSheetModalOpen(true)}
        onOpenAddVehicle={() => {
          setEditingVehicle(null);
          setIsAddVehicleOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Banner with Excavator loading haul truck and Red Curve Accent */}
        <HeroBanner />

        {/* 4 Summary Cards: Overdue, Due today, Due tomorrow, Upcoming */}
        <KpiSummaryCards
          obligations={allObligations}
          activeFilterTab={selectedStatusTab}
          onSelectTab={(tab) => setSelectedStatusTab(tab)}
        />

        {/* Weekly PM Report Section (PM compliance this week - Wajib 7 hari sekali) */}
        <WeeklyPmReportCard vehicles={vehicles} />

        {/* View Switcher Bar (Tabs) */}
        <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveMainView('OBLIGATIONS')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMainView === 'OBLIGATIONS'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Daftar Kewajiban (PM, Comm, Fuel)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainView('FLEET')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMainView === 'FLEET'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Katalog Seluruh Unit LV ({vehicles.length})</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            {config.spreadsheetId ? (
              <a
                href={`https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Buka Google Sheet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setIsSheetModalOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hubungkan Google Sheet</span>
              </button>
            )}
          </div>
        </div>

        {/* View 1: Obligations Register (The User's Desired View) */}
        {activeMainView === 'OBLIGATIONS' ? (
          <ObligationsRegister
            obligations={filteredObligations}
            allObligationsCount={allObligations.length}
            pmCount={pmCount}
            commCount={commCount}
            fuelCount={fuelCount}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedType={selectedType}
            onSelectType={setSelectedType}
            selectedStatusTab={selectedStatusTab}
            onSelectStatusTab={setSelectedStatusTab}
            onConfirmObligation={(item) => {
              setSelectedObligationItem(item);
              setIsConfirmModalOpen(true);
            }}
            onViewVehicleDetail={(vehicle) => {
              setDetailVehicle(vehicle);
              setIsDetailOpen(true);
            }}
          />
        ) : (
          /* View 2: Fleet Catalog & Detailed Specs Table */
          <VehicleTable
            vehicles={vehicles}
            onOpenQuickPm={(vehicle) => {
              const pmItem: VehicleObligationItem = {
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
                daysDiff: 0,
                hTag: 'Weekly',
                vehicle,
              };
              setSelectedObligationItem(pmItem);
              setIsConfirmModalOpen(true);
            }}
            onOpenEdit={(vehicle) => {
              setEditingVehicle(vehicle);
              setIsAddVehicleOpen(true);
            }}
            onOpenDetail={(vehicle) => {
              setDetailVehicle(vehicle);
              setIsDetailOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">KPC Coal Mining · LV Control</span>
            <span>•</span>
            <span>Siklus PM Mingguan (7 Hari) · Commissioning · Fuel Expiry</span>
          </div>
          <div className="flex items-center gap-3">
            {config.spreadsheetId ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Tersinkron dengan Google Sheets: {config.spreadsheetName || 'Connected'}
              </span>
            ) : (
              <span>Penyimpanan Lokal Aktif</span>
            )}
          </div>
        </div>
      </footer>

      {/* Modals */}
      {/* 1. Confirm Obligation Modal (Quick 1-Click Confirm & Reset) */}
      <ConfirmObligationModal
        item={selectedObligationItem}
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setSelectedObligationItem(null);
        }}
        onSave={handleSaveConfirmedObligation}
      />

      {/* 2. Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        isAdmin={isAdmin}
        onClose={() => setIsAdminModalOpen(false)}
        onLoginSuccess={() => {
          setIsAdmin(true);
          showToast('Login berhasil sebagai Admin Fleet Controller', 'success');
        }}
        onLogout={() => {
          setIsAdmin(false);
          showToast('Anda telah keluar dari Admin Mode', 'info');
        }}
      />

      {/* 3. Add / Edit Vehicle Modal */}
      <AddVehicleModal
        isOpen={isAddVehicleOpen}
        onClose={() => {
          setIsAddVehicleOpen(false);
          setEditingVehicle(null);
        }}
        onSave={handleSaveVehicle}
        editVehicle={editingVehicle}
        existingDepartments={['COAL MINING', 'MINING OPERATION', 'GEOLOGY', 'PLANT & WORKSHOP']}
      />

      {/* 4. Vehicle Detail Modal */}
      <VehicleDetailModal
        vehicle={detailVehicle}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailVehicle(null);
        }}
        onOpenConfirmObligation={(item) => {
          setIsDetailOpen(false);
          setSelectedObligationItem(item);
          setIsConfirmModalOpen(true);
        }}
        onEditVehicle={(vehicle) => {
          setIsDetailOpen(false);
          setEditingVehicle(vehicle);
          setIsAddVehicleOpen(true);
        }}
      />

      {/* 5. Google Sheets Connect & Management Modal */}
      <GoogleSheetConnectModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        config={config}
        token={token}
        onSignInWithGoogle={handleSignInWithGoogle}
        onSelectSpreadsheet={handleSelectSpreadsheet}
        onDisconnect={handleDisconnect}
        onRefreshData={handleRefreshData}
        currentVehicles={vehicles}
      />
    </div>
  );
}
