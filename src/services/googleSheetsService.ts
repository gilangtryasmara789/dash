import { SaranaLV, ObligationStatus, VehicleObligationItem } from '../types';
import { GOOGLE_SHEET_TEMPLATE_HEADERS } from '../data/initialData';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token?: string;
              error?: string;
              expires_in?: number;
            }) => void;
            error_callback?: (err: any) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

export const GOOGLE_CLIENT_ID = '945890263094-0mbqk0jnv4ucm5jga7k1nc77qi86lpg8.apps.googleusercontent.com';
export const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';

const TOKEN_KEY = 'sarana_lv_google_token';
const TOKEN_EXPIRY_KEY = 'sarana_lv_google_token_expiry';

export function getStoredToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!token || !expiry) return null;
  if (Date.now() > parseInt(expiry, 10)) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    return null;
  }
  return token;
}

export function saveToken(token: string, expiresInSeconds = 3599): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, (Date.now() + expiresInSeconds * 1000).toString());
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

export async function getUserProfile(token: string) {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Helper to calculate days diff (dueDate - today) and friendly H-tags (H-30, H-1, Today, Overdue)
 */
export function calculateDaysDiff(dueDateStr: string): { daysDiff: number; hTag: string } {
  if (!dueDateStr) return { daysDiff: 0, hTag: 'H-0' };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const daysDiff = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (daysDiff < 0) {
    return { daysDiff, hTag: `Overdue` };
  } else if (daysDiff === 0) {
    return { daysDiff, hTag: 'Today' };
  } else if (daysDiff === 1) {
    return { daysDiff, hTag: 'H-1' };
  } else {
    return { daysDiff, hTag: `H-${daysDiff}` };
  }
}

/**
 * Format date nicely e.g. "2026-09-26" -> "26 Sept 2026"
 */
export function formatFriendlyDate(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = months[parseInt(month, 10) - 1] || month;
    return `${parseInt(day, 10)} ${monthName} ${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Calculate weekly PM next due date (exactly 7 days after given date)
 */
export function addDays(dateStr: string, days: number): string {
  try {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  } catch {
    return dateStr;
  }
}

/**
 * Map vehicle to 3 separate obligation items for the obligations register table
 */
export function flattenVehicleObligations(vehicles: SaranaLV[]): VehicleObligationItem[] {
  const items: VehicleObligationItem[] = [];

  vehicles.forEach((v) => {
    // 1. Commissioning
    const commDiff = calculateDaysDiff(v.commissioningDueDate);
    items.push({
      id: `${v.id}_COMMISSIONING`,
      vehicleId: v.id,
      noLambung: v.noLambung,
      noPolisi: v.noPolisi,
      tipeKendaraan: v.tipeKendaraan,
      department: v.department,
      driver: v.driver,
      obligationType: 'COMMISSIONING',
      obligationName: 'Commissioning',
      dueDate: v.commissioningDueDate,
      doneDate: v.commissioningDoneDate,
      scheduleTime: v.commissioningScheduleTime || '20:00',
      status: v.commissioningStatus,
      daysDiff: commDiff.daysDiff,
      hTag: commDiff.hTag,
      vehicle: v,
    });

    // 2. Fuel Expiry
    const fuelDiff = calculateDaysDiff(v.fuelDueDate);
    items.push({
      id: `${v.id}_FUEL_EXPIRY`,
      vehicleId: v.id,
      noLambung: v.noLambung,
      noPolisi: v.noPolisi,
      tipeKendaraan: v.tipeKendaraan,
      department: v.department,
      driver: v.driver,
      obligationType: 'FUEL_EXPIRY',
      obligationName: 'Fuel Expiry',
      dueDate: v.fuelDueDate,
      doneDate: v.fuelDoneDate,
      scheduleTime: v.fuelScheduleTime || '20:00',
      status: v.fuelStatus,
      daysDiff: fuelDiff.daysDiff,
      hTag: fuelDiff.hTag,
      vehicle: v,
    });

    // 3. PM Check (Wajib tiap minggu sekali / 7 hari)
    const pmDiff = calculateDaysDiff(v.nextPmDueDate);
    items.push({
      id: `${v.id}_PM_CHECK`,
      vehicleId: v.id,
      noLambung: v.noLambung,
      noPolisi: v.noPolisi,
      tipeKendaraan: v.tipeKendaraan,
      department: v.department,
      driver: v.driver,
      obligationType: 'PM_CHECK',
      obligationName: 'PM Check',
      dueDate: v.nextPmDueDate,
      doneDate: v.pmDoneDate,
      scheduleTime: v.pmScheduleTime || '20:00',
      status: v.pmStatus,
      daysDiff: pmDiff.daysDiff,
      hTag: pmDiff.hTag,
      vehicle: v,
    });
  });

  return items;
}

export function vehicleToSheetRow(v: SaranaLV): (string | number)[] {
  return [
    v.noLambung,
    v.noPolisi,
    v.tipeKendaraan,
    v.department,
    v.driver,
    v.lokasi,
    v.currentKmHm,
    v.lastPmDate,
    v.nextPmDueDate,
    v.pmStatus,
    v.lastCommissioningDate,
    v.commissioningDueDate,
    v.commissioningStatus,
    v.commissioningCertificateNo || '',
    v.lastFuelRenewDate,
    v.fuelDueDate,
    v.fuelStatus,
    v.statusOperasi,
    v.catatan,
  ];
}

export function parseSheetRowToVehicle(row: (string | number)[], rowIndex: number): SaranaLV {
  const noLambung = String(row[0] || `LV-00${rowIndex}`).trim();
  const noPolisi = String(row[1] || '').trim();
  const tipeKendaraan = String(row[2] || 'TOYOTA AVANZA').trim();
  const department = String(row[3] || 'COAL MINING').trim();
  const driver = String(row[4] || '-').trim();
  const lokasi = String(row[5] || 'Sangatta').trim();
  const currentKmHm = Number(row[6]) || 0;

  // PM
  const lastPmDate = String(row[7] || '2026-09-19').trim();
  const nextPmDueDate = String(row[8] || addDays(lastPmDate, 7)).trim();
  const pmStatus = (String(row[9] || 'SCHEDULED').trim().toUpperCase() as ObligationStatus) || 'SCHEDULED';

  // Commissioning
  const lastCommissioningDate = String(row[10] || '2026-03-15').trim();
  const commissioningDueDate = String(row[11] || '2026-09-30').trim();
  const commissioningStatus = (String(row[12] || 'SCHEDULED').trim().toUpperCase() as ObligationStatus) || 'SCHEDULED';
  const commissioningCertificateNo = String(row[13] || '').trim();

  // Fuel
  const lastFuelRenewDate = String(row[14] || '2026-08-30').trim();
  const fuelDueDate = String(row[15] || '2026-09-30').trim();
  const fuelStatus = (String(row[16] || 'SCHEDULED').trim().toUpperCase() as ObligationStatus) || 'SCHEDULED';

  const statusOperasi = (String(row[17] || 'OPERASIONAL').trim().toUpperCase() as any) || 'OPERASIONAL';
  const catatan = String(row[18] || '').trim();

  return {
    id: `sheet-lv-${rowIndex}-${noLambung.replace(/\s+/g, '')}`,
    noLambung,
    noPolisi,
    tipeKendaraan,
    department,
    driver,
    lokasi,
    currentKmHm,
    statusOperasi: ['OPERASIONAL', 'STANDBY', 'BREAKDOWN', 'IN_PM'].includes(statusOperasi)
      ? statusOperasi
      : 'OPERASIONAL',
    catatan,
    rowNumber: rowIndex,

    lastPmDate,
    nextPmDueDate,
    pmStatus,
    statusPm: pmStatus,
    lastPmKmHm: Math.max(0, currentKmHm - 500),
    nextPmDueKmHm: currentKmHm + 4500,
    pmIntervalKm: 5000,
    lastInspector: 'KPC Mine Inspector',
    pmDoneDate: pmStatus === 'DONE' ? lastPmDate : undefined,
    pmScheduleTime: '20:00',

    lastCommissioningDate,
    commissioningDueDate,
    commissioningStatus,
    commissioningCertificateNo,
    commissioningScheduleTime: '20:00',

    lastFuelRenewDate,
    fuelDueDate,
    fuelStatus,
    fuelScheduleTime: '20:00',
  };
}

export async function fetchSpreadsheetFiles(token: string) {
  const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,webViewLink)&orderBy=modifiedTime%20desc&pageSize=20`;
  
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gagal mengambil daftar spreadsheet (${res.status})`);
  }

  const data = await res.json();
  return data.files || [];
}

export async function createNewSaranaLVSheet(token: string, initialData: SaranaLV[]) {
  const createUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
  
  const requestBody = {
    properties: {
      title: `Monitoring PM LV & Obligations - Coal Mining Sangatta (${new Date().toISOString().slice(0, 10)})`,
    },
    sheets: [
      {
        properties: {
          title: 'Monitoring PM LV',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
    ],
  };

  const createRes = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Gagal membuat Google Sheet baru');
  }

  const sheetObj = await createRes.json();
  const spreadsheetId = sheetObj.spreadsheetId;

  // Insert Header and Initial Data
  const rows = [
    GOOGLE_SHEET_TEMPLATE_HEADERS,
    ...initialData.map((v) => vehicleToSheetRow(v)),
  ];

  const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Monitoring PM LV'!A1:S${rows.length}?valueInputOption=USER_ENTERED`;
  
  await fetch(updateUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: `'Monitoring PM LV'!A1:S${rows.length}`,
      majorDimension: 'ROWS',
      values: rows,
    }),
  });

  return {
    spreadsheetId,
    spreadsheetName: sheetObj.properties.title,
    webViewLink: sheetObj.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
}

export async function readDataFromGoogleSheet(token: string, spreadsheetId: string) {
  const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`;
  const metaRes = await fetch(metaUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!metaRes.ok) {
    throw new Error('Gagal mengakses metadata spreadsheet');
  }

  const metaData = await metaRes.json();
  const sheetTitle = metaData.sheets?.[0]?.properties?.title || 'Sheet1';

  const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(sheetTitle)}'!A2:S200`;
  const readRes = await fetch(readUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!readRes.ok) {
    throw new Error('Gagal membaca baris data spreadsheet');
  }

  const readData = await readRes.json();
  const rows = readData.values || [];

  const vehicles: SaranaLV[] = rows
    .filter((r: any[]) => r && r[0] && String(r[0]).trim() !== '')
    .map((r: any[], idx: number) => parseSheetRowToVehicle(r, idx + 2));

  return {
    vehicles,
    sheetTitle,
  };
}

export async function updateVehicleInGoogleSheet(
  token: string,
  spreadsheetId: string,
  sheetName: string,
  vehicle: SaranaLV
) {
  if (!vehicle.rowNumber) {
    throw new Error('Row number tidak ditemukan untuk sinkronisasi baris');
  }

  const rowValues = vehicleToSheetRow(vehicle);
  const rowNumber = vehicle.rowNumber;
  const range = `'${sheetName}'!A${rowNumber}:S${rowNumber}`;

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values: [rowValues],
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Gagal memperbarui data di Google Sheet');
  }

  return true;
}

export async function appendVehicleToGoogleSheet(
  token: string,
  spreadsheetId: string,
  sheetName: string,
  vehicle: SaranaLV
) {
  const rowValues = vehicleToSheetRow(vehicle);
  const range = `'${sheetName}'!A:S`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values: [rowValues],
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Gagal menambahkan unit ke Google Sheet');
  }

  return true;
}

export async function syncAllVehiclesToGoogleSheet(
  token: string,
  spreadsheetId: string,
  sheetName: string,
  vehicles: SaranaLV[]
) {
  const rows = vehicles.map((v, idx) => {
    return vehicleToSheetRow({ ...v, rowNumber: idx + 2 });
  });

  // Clear existing rows A2:S500
  const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${sheetName}'!A2:S500:clear`;
  await fetch(clearUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }).catch(() => {});

  if (rows.length > 0) {
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${sheetName}'!A2:S${rows.length + 1}?valueInputOption=USER_ENTERED`;
    await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `'${sheetName}'!A2:S${rows.length + 1}`,
        majorDimension: 'ROWS',
        values: rows,
      }),
    });
  }

  return true;
}

