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
  syncAllVehiclesToGoogleSheet,
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
import { DeleteVehicleModal } from './components/DeleteVehicleModal';
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
    'ALL' | 'OVERDUE' | 'TODAY' | 'TOMORROW' | 'UPCOMING' | 'COMPLETED'
  >('ALL');

  // Modals state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedObligationItem, setSelectedObligationItem] = useState<VehicleObligationItem | null>(null);

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<SaranaLV | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailVehicle, setDetailVehicle] = useState<SaranaLV | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<SaranaLV | null>(null);

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

  // Counts for pills (pending obligations needing action)
  const pmCount = useMemo(() => {
    return allObligations.filter((o) => o.obligationType === 'PM_CHECK' && o.status !== 'DONE').length;
  }, [allObligations]);

  const commCount = useMemo(() => {
    return allObligations.filter((o) => o.obligationType === 'COMMISSIONING' && o.status !== 'DONE').length;
  }, [allObligations]);

  const fuelCount = useMemo(() => {
    return allObligations.filter((o) => o.obligationType === 'FUEL_EXPIRY' && o.status !== 'DONE').length;
  }, [allObligations]);

  const completedCount = useMemo(() => {
    return allObligations.filter((o) => o.status === 'DONE').length;
  }, [allObligations]);

  const allPendingCount = useMemo(() => {
    return allObligations.filter((o) => o.status !== 'DONE').length;
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
        if (item.status === 'DONE' || item.daysDiff >= 0) {
          return false;
        }
      } else if (selectedStatusTab === 'TODAY') {
        if (item.status === 'DONE' || item.daysDiff !== 0) {
          return false;
        }
      } else if (selectedStatusTab === 'TOMORROW') {
        if (item.status === 'DONE' || item.daysDiff !== 1) {
          return false;
        }
      } else if (selectedStatusTab === 'UPCOMING') {
        if (item.status === 'DONE' || item.daysDiff <= 1 || item.daysDiff > 30) {
          return false;
        }
      } else if (selectedStatusTab === 'COMPLETED') {
        if (item.status !== 'DONE') {
          return false;
        }
      } else if (selectedStatusTab === 'ALL') {
        // In All reminders: completed obligations are cleared and removed from active queue
        if (item.status === 'DONE') {
          return false;
        }
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
      showToast('Loading Google Services, please try again momentarily...', 'info');
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_SCOPES,
        callback: async (response) => {
          if (response.error) {
            showToast(`Google authentication failed: ${response.error}`, 'error');
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

            showToast('Successfully authenticated with Google account!', 'success');
          }
        },
      });

      client.requestAccessToken();
    } catch (err: any) {
      console.error(err);
      showToast('Failed to initiate Google authentication flow', 'error');
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
    showToast('Google Sheets connection disconnected.', 'info');
  }, [showToast]);

  // Sync data from connected Google Sheet
  const handleRefreshData = useCallback(async () => {
    if (!config.spreadsheetId) {
      showToast('No active Google Sheet currently linked', 'info');
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
        const syncTime = new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
        setConfig((prev) => ({
          ...prev,
          lastSyncTime: syncTime,
          sheetName: result.sheetTitle,
        }));
        showToast(
          `Successfully synchronized ${result.vehicles.length} Light Vehicles from Google Sheet!`,
          'success'
        );
      } else {
        showToast('Google Sheet connected, but no vehicle records were found.', 'info');
      }
    } catch (err: any) {
      console.error(err);
      showToast(`Failed to synchronize data: ${err.message || 'Error'}`, 'error');
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
          lastSyncTime: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }));

        if (result.vehicles.length > 0) {
          setVehicles(result.vehicles);
          showToast(
            `Loaded ${result.vehicles.length} fleet units from Google Sheet: "${spreadsheetName}"`,
            'success'
          );
        } else {
          showToast(`Connected to "${spreadsheetName}". Schema verified and ready for fleet records!`, 'success');
        }
      } catch (err: any) {
        console.error(err);
        showToast(`Failed to read Google Sheet: ${err.message}`, 'error');
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

      showToast(`Compliance obligation status for ${updatedVehicle.noLambung} updated successfully!`, 'success');

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
          showToast(`Updates for ${updatedVehicle.noLambung} synced to Google Sheets!`, 'success');
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
        showToast(`Asset specifications for ${vehicleData.noLambung} updated`, 'success');

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
        showToast(`Light Vehicle ${newVehicle.noLambung} registered to fleet`, 'success');

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

  // Request to delete a vehicle (open confirmation modal)
  const handleRequestDelete = useCallback((vehicle: SaranaLV) => {
    setVehicleToDelete(vehicle);
    setIsDeleteModalOpen(true);
  }, []);

  // Confirm delete / reduce vehicle from fleet
  const handleConfirmDelete = useCallback(
    async (vehicleId: string) => {
      const targetVehicle = vehicles.find((v) => v.id === vehicleId);
      const remainingVehicles = vehicles.filter((v) => v.id !== vehicleId);
      setVehicles(remainingVehicles);

      showToast(
        `Unit ${targetVehicle?.noLambung || 'Light Vehicle'} decommissioned from fleet`,
        'info'
      );

      // Sync remaining vehicles to Google Sheets if connected
      const currentToken = token || getStoredToken();
      if (currentToken && config.spreadsheetId) {
        try {
          await syncAllVehiclesToGoogleSheet(
            currentToken,
            config.spreadsheetId,
            config.sheetName || 'Monitoring PM LV',
            remainingVehicles
          );
          showToast(
            `Google Sheets fleet register updated (${remainingVehicles.length} units)`,
            'success'
          );
        } catch (err) {
          console.error('Error syncing vehicle deletion to sheets:', err);
        }
      }
    },
    [vehicles, token, config, showToast]
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

        {/* Admin Control Banner (Only visible when Admin Mode is active) */}
        {isAdmin && (
          <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                ADM
              </div>
              <div>
                <span className="text-xs font-bold text-amber-950 block">
                  Fleet Administrator Mode Active
                </span>
                <span className="text-[11px] text-amber-800">
                  Authorized permissions: Add new vehicles, modify technical specs, and decommission fleet units.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="banner-add-vehicle-btn"
                onClick={() => {
                  setEditingVehicle(null);
                  setIsAddVehicleOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ Add New Unit</span>
              </button>
              <button
                type="button"
                id="banner-manage-fleet-btn"
                onClick={() => setIsAdminModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 font-semibold text-xs hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                <span>Manage Fleet / Decommission</span>
              </button>
            </div>
          </div>
        )}

        {/* 4 Summary Cards: Overdue, Due today, Due tomorrow, Upcoming */}
        <KpiSummaryCards
          obligations={allObligations}
          activeFilterTab={selectedStatusTab}
          onSelectTab={(tab) => setSelectedStatusTab(tab)}
        />

        {/* Weekly PM Report Section (PM compliance this week - Mandatory 7-day cycle) */}
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
              <span>Obligations Register (PM, Comm, Fuel)</span>
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
              <span>Fleet Inventory ({vehicles.length})</span>
            </button>
          </div>

          {config.spreadsheetId && (
            <div className="hidden sm:flex items-center gap-2">
              <a
                href={`https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Open Google Sheet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* View 1: Obligations Register (The User's Desired View) */}
        {activeMainView === 'OBLIGATIONS' ? (
          <ObligationsRegister
            obligations={filteredObligations}
            allObligationsCount={allPendingCount}
            pmCount={pmCount}
            commCount={commCount}
            fuelCount={fuelCount}
            completedCount={completedCount}
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
            isAdmin={isAdmin}
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
            onRequestDelete={handleRequestDelete}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">KPC Coal Mining · LV Fleet Management</span>
            <span>•</span>
            <span>Mandatory Weekly PM Cycle (7 Days) · Commissioning · Fuel Allocation</span>
          </div>
          <div className="flex items-center gap-3">
            {config.spreadsheetId ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Synchronized with Google Sheets: {config.spreadsheetName || 'Connected'}
              </span>
            ) : (
              <span>Local Storage Active</span>
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
          showToast('Successfully authenticated as Fleet Operations Admin', 'success');
        }}
        onLogout={() => {
          setIsAdmin(false);
          showToast('Logged out of Admin Mode', 'info');
        }}
        vehicles={vehicles}
        onOpenAddVehicle={() => {
          setEditingVehicle(null);
          setIsAddVehicleOpen(true);
        }}
        onRequestDeleteVehicle={handleRequestDelete}
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
        onRequestDelete={handleRequestDelete}
      />

      {/* 4. Vehicle Detail Modal */}
      <VehicleDetailModal
        vehicle={detailVehicle}
        isOpen={isDetailOpen}
        isAdmin={isAdmin}
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
        onRequestDelete={handleRequestDelete}
      />

      {/* 5. Delete Vehicle Confirmation Modal */}
      <DeleteVehicleModal
        vehicle={vehicleToDelete}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setVehicleToDelete(null);
        }}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* 6. Google Sheets Connect & Management Modal */}
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
