import { SaranaLV } from '../types';

export const INITIAL_LV_DATA: SaranaLV[] = [
  {
    id: 'lv-001',
    noLambung: 'LV-001',
    noPolisi: 'KT 8101 SG',
    tipeKendaraan: 'TOYOTA AVANZA',
    department: 'COAL MINING',
    driver: 'BUDI SANTOSO',
    lokasi: 'Main Office Sangatta',
    currentKmHm: 28400,
    statusOperasi: 'OPERASIONAL',
    catatan: 'Unit operasional pimpinan area Sangatta East. Kondisi mesin prima.',
    rowNumber: 2,

    // 1. Mandatory Weekly PM Check (tiap minggu sekali)
    lastPmDate: '2026-09-19',
    nextPmDueDate: '2026-09-26',
    pmStatus: 'SCHEDULED',
    pmDoneDate: '2026-09-19',
    pmScheduleTime: '20:00',

    // 2. Commissioning
    lastCommissioningDate: '2025-09-13',
    commissioningDueDate: '2026-09-13',
    commissioningStatus: 'DONE',
    commissioningDoneDate: '2026-09-19',
    commissioningCertificateNo: 'CMS-KPC-2026-001',
    commissioningScheduleTime: '20:00',

    // 3. Fuel Expiry
    lastFuelRenewDate: '2026-08-15',
    fuelDueDate: '2026-09-15',
    fuelStatus: 'DONE',
    fuelDoneDate: '2026-09-19',
    fuelScheduleTime: '20:00',
    fuelQuota: '250 L / Bulan (Kupon Aktif)',
  },
  {
    id: 'lv-006',
    noLambung: 'LV-006',
    noPolisi: 'KT 8106 SG',
    tipeKendaraan: 'MITSUBISHI TRITON',
    department: 'COAL MINING',
    driver: 'RINA KARTIKA',
    lokasi: 'Pit Hatari Block C',
    currentKmHm: 41250,
    statusOperasi: 'OPERASIONAL',
    catatan: 'Patroli pengawasan loading pit hatari. Rotary & radio RIG 100% OK.',
    rowNumber: 3,

    // 1. Mandatory Weekly PM Check
    lastPmDate: '2026-09-19',
    nextPmDueDate: '2026-09-26',
    pmStatus: 'SCHEDULED',
    pmDoneDate: '2026-09-19',
    pmScheduleTime: '20:00',

    // 2. Commissioning
    lastCommissioningDate: '2026-03-30',
    commissioningDueDate: '2026-09-30',
    commissioningStatus: 'SCHEDULED',
    commissioningCertificateNo: 'CMS-KPC-2026-006',
    commissioningScheduleTime: '20:00',

    // 3. Fuel Expiry
    lastFuelRenewDate: '2026-08-30',
    fuelDueDate: '2026-09-30',
    fuelStatus: 'SCHEDULED',
    fuelScheduleTime: '20:00',
    fuelQuota: '300 L / Bulan',
  },
  {
    id: 'lv-005',
    noLambung: 'LV-005',
    noPolisi: 'KT 8105 SG',
    tipeKendaraan: 'TOYOTA AVANZA',
    department: 'COAL MINING',
    driver: 'ANDI WIJAYA',
    lokasi: 'Pit Surya West',
    currentKmHm: 35120,
    statusOperasi: 'OPERASIONAL',
    catatan: 'Antar jemput tim surveyor tambang dan engineering planner.',
    rowNumber: 4,

    // 1. Mandatory Weekly PM Check
    lastPmDate: '2026-09-19',
    nextPmDueDate: '2026-09-26',
    pmStatus: 'SCHEDULED',
    pmDoneDate: '2026-09-19',
    pmScheduleTime: '20:00',

    // 2. Commissioning
    lastCommissioningDate: '2026-04-10',
    commissioningDueDate: '2026-10-10',
    commissioningStatus: 'SCHEDULED',
    commissioningCertificateNo: 'CMS-KPC-2026-005',
    commissioningScheduleTime: '20:00',

    // 3. Fuel Expiry
    lastFuelRenewDate: '2026-09-01',
    fuelDueDate: '2026-10-01',
    fuelStatus: 'SCHEDULED',
    fuelScheduleTime: '20:00',
    fuelQuota: '250 L / Bulan',
  },
  {
    id: 'lv-004',
    noLambung: 'LV-004',
    noPolisi: 'KT 8104 SG',
    tipeKendaraan: 'TOYOTA LAND CRUISER',
    department: 'COAL MINING',
    driver: 'BUDI SANTOSO',
    lokasi: 'Pit Sangatta South',
    currentKmHm: 62000,
    statusOperasi: 'OPERASIONAL',
    catatan: 'Kendaraan operasional medan berat pit tambang batubara.',
    rowNumber: 5,

    // 1. Mandatory Weekly PM Check
    lastPmDate: '2026-09-19',
    nextPmDueDate: '2026-09-26',
    pmStatus: 'SCHEDULED',
    pmDoneDate: '2026-09-19',
    pmScheduleTime: '20:00',

    // 2. Commissioning
    lastCommissioningDate: '2026-03-24',
    commissioningDueDate: '2026-09-24',
    commissioningStatus: 'SCHEDULED',
    commissioningCertificateNo: 'CMS-KPC-2026-004',
    commissioningScheduleTime: '20:00',

    // 3. Fuel Expiry
    lastFuelRenewDate: '2026-08-28',
    fuelDueDate: '2026-09-28',
    fuelStatus: 'SCHEDULED',
    fuelScheduleTime: '20:00',
    fuelQuota: '350 L / Bulan',
  },
  {
    id: 'lv-003',
    noLambung: 'LV-003',
    noPolisi: 'KT 8103 SG',
    tipeKendaraan: 'MITSUBISHI PAJERO SPORT',
    department: 'COAL MINING',
    driver: 'RINA KARTIKA',
    lokasi: 'Central Dispatch Coal Hauling',
    currentKmHm: 38450,
    statusOperasi: 'OPERASIONAL',
    catatan: 'Pengawasan jalur hauling dan koordinasi dispatch excavator & dump truck.',
    rowNumber: 6,

    // 1. Mandatory Weekly PM Check
    lastPmDate: '2026-09-19',
    nextPmDueDate: '2026-09-26',
    pmStatus: 'SCHEDULED',
    pmDoneDate: '2026-09-19',
    pmScheduleTime: '20:00',

    // 2. Commissioning
    lastCommissioningDate: '2026-04-15',
    commissioningDueDate: '2026-10-15',
    commissioningStatus: 'SCHEDULED',
    commissioningCertificateNo: 'CMS-KPC-2026-003',
    commissioningScheduleTime: '20:00',

    // 3. Fuel Expiry
    lastFuelRenewDate: '2026-09-05',
    fuelDueDate: '2026-10-05',
    fuelStatus: 'SCHEDULED',
    fuelScheduleTime: '20:00',
    fuelQuota: '300 L / Bulan',
  },
  {
    id: 'lv-002',
    noLambung: 'LV-002',
    noPolisi: 'KT 8102 SG',
    tipeKendaraan: 'TOYOTA HILUX 4X4',
    department: 'COAL MINING',
    driver: 'DEDI SAPUTRA',
    lokasi: 'Coal Crushing Plant Area',
    currentKmHm: 49700,
    statusOperasi: 'OPERASIONAL',
    catatan: 'Inspeksi transfer chute & conveyor coal terminal Sangatta.',
    rowNumber: 7,

    // 1. Mandatory Weekly PM Check
    lastPmDate: '2026-09-19',
    nextPmDueDate: '2026-09-26',
    pmStatus: 'SCHEDULED',
    pmDoneDate: '2026-09-19',
    pmScheduleTime: '20:00',

    // 2. Commissioning
    lastCommissioningDate: '2026-04-12',
    commissioningDueDate: '2026-10-12',
    commissioningStatus: 'SCHEDULED',
    commissioningCertificateNo: 'CMS-KPC-2026-002',
    commissioningScheduleTime: '20:00',

    // 3. Fuel Expiry
    lastFuelRenewDate: '2026-09-08',
    fuelDueDate: '2026-10-08',
    fuelStatus: 'SCHEDULED',
    fuelScheduleTime: '20:00',
    fuelQuota: '300 L / Bulan',
  },
];

export const GOOGLE_SHEET_TEMPLATE_HEADERS = [
  'No Lambung',
  'No Polisi',
  'Tipe Kendaraan',
  'Departemen',
  'Driver / PIC',
  'Lokasi',
  'KM / HM Saat Ini',
  'PM Terakhir (Tanggal)',
  'Jatuh Tempo PM (Wajib Mingguan / 7 Hari)',
  'Status PM Check',
  'Tanggal Commissioning Terakhir',
  'Jatuh Tempo Commissioning',
  'Status Commissioning',
  'No Sertifikat Commissioning',
  'Tanggal Perpanjangan BBM',
  'Jatuh Tempo Fuel Expiry',
  'Status Fuel Expiry',
  'Status Operasional',
  'Catatan / Rekomendasi',
];
