export type ObligationType = 'PM_CHECK' | 'COMMISSIONING' | 'FUEL_EXPIRY';

export type ObligationStatus = 'DONE' | 'SCHEDULED' | 'OVERDUE';

export type PMStatus = ObligationStatus | 'SUDAH_PM' | 'BELUM_PM' | 'DUE_SOON';

export type OperationalStatus = 'OPERASIONAL' | 'STANDBY' | 'BREAKDOWN' | 'IN_PM';

export interface SaranaLV {
  id: string;
  noLambung: string;          // e.g. "LV-001", "LV-002", "LV-006"
  noPolisi: string;           // e.g. "KT 8492 GA"
  tipeKendaraan: string;      // e.g. "TOYOTA AVANZA", "MITSUBISHI TRITON"
  department: string;         // e.g. "COAL MINING", "MINING OPERATION"
  driver: string;             // Penanggung Jawab / User (e.g. "BUDI SANTOSO")
  lokasi: string;             // e.g. "Pit Sangatta South", "Workshop Central"
  currentKmHm: number;        // KM / HM saat ini
  statusOperasi: OperationalStatus; // Kondisi operasional unit
  catatan: string;            // Catatan kondisi/rekomendasi
  rowNumber?: number;         // Nomor baris di Google Sheets

  // 1. Mandatory Weekly PM Check (Wajib seminggu sekali / tiap 7 hari)
  lastPmDate: string;         // Tanggal PM terakhir (YYYY-MM-DD)
  nextPmDueDate: string;      // Tanggal jatuh tempo PM (wajib 7 hari setelah last PM)
  pmStatus: ObligationStatus; // 'DONE' | 'SCHEDULED' | 'OVERDUE'
  statusPm?: PMStatus;        // Compatibility alias for pmStatus
  pmDoneDate?: string;        // Tanggal selesai PM terakhir (e.g. "2026-09-19")
  pmScheduleTime?: string;    // e.g. "20:00"
  lastPmKmHm?: number;
  nextPmDueKmHm?: number;
  pmIntervalKm?: number;
  lastInspector?: string;

  // 2. Commissioning (Izin kelayakan masuk tambang KPC)
  lastCommissioningDate: string; // Tanggal lulus commissioning
  commissioningDueDate: string;  // Tanggal jatuh tempo perpanjangan commissioning
  commissioningStatus: ObligationStatus; // 'DONE' | 'SCHEDULED' | 'OVERDUE'
  commissioningDoneDate?: string;// Tanggal selesai (e.g. "2026-09-19")
  commissioningCertificateNo?: string; // e.g. "CMS-KPC-2026-012"
  commissioningScheduleTime?: string;  // e.g. "20:00"

  // 3. Fuel Expiry (Masa aktif kupon / otorisasi kartu BBM tambang)
  lastFuelRenewDate: string;  // Tanggal perpanjangan terakhir
  fuelDueDate: string;        // Tanggal expired fuel / kupon BBM
  fuelStatus: ObligationStatus;// 'DONE' | 'SCHEDULED' | 'OVERDUE'
  fuelDoneDate?: string;      // Tanggal selesai (e.g. "2026-09-19")
  fuelScheduleTime?: string;  // e.g. "20:00"
  fuelQuota?: string;         // e.g. "250 L / Bulan"
}

export interface VehicleObligationItem {
  id: string;
  vehicleId: string;
  noLambung: string;
  noPolisi: string;
  tipeKendaraan: string;
  department: string;
  driver: string;
  obligationType: ObligationType;
  obligationName: string;
  dueDate: string;            // YYYY-MM-DD
  doneDate?: string;          // YYYY-MM-DD
  scheduleTime: string;       // e.g. "20:00"
  status: ObligationStatus;   // 'DONE' | 'SCHEDULED' | 'OVERDUE'
  hTag: string;               // e.g. "H-30", "H-1", "Today", "Overdue"
  daysDiff: number;           // Selisih hari dari hari ini (due - today)
  vehicle: SaranaLV;
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  spreadsheetName: string;
  sheetName: string;
  isConnected: boolean;
  userEmail?: string;
  userName?: string;
  userAvatar?: string;
  lastSyncTime?: string;
}

export interface FilterOptions {
  search: string;
  statusPm: string;
  department: string;
  tipeKendaraan: string;
  statusOperasi: string;
}

export interface ObligationFilterOptions {
  search: string;
  obligationType: 'ALL' | ObligationType;
  statusTab: 'ALL' | 'OVERDUE' | 'TODAY' | 'TOMORROW' | 'UPCOMING';
  department?: string;
}
