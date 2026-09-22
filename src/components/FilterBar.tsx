import React from 'react';
import { FilterOptions, SaranaLV } from '../types';
import { Search, Filter, RotateCcw, Download, Plus, Layers } from 'lucide-react';

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  departments: string[];
  vehicleTypes: string[];
  onOpenAddModal: () => void;
  vehicles: SaranaLV[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  departments,
  vehicleTypes,
  onOpenAddModal,
  vehicles,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleStatusChange = (status: string) => {
    onFilterChange({ ...filters, statusPm: status });
  };

  const handleDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, department: e.target.value });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, tipeKendaraan: e.target.value });
  };

  const handleReset = () => {
    onFilterChange({
      search: '',
      statusPm: 'ALL',
      department: 'ALL',
      tipeKendaraan: 'ALL',
      statusOperasi: 'ALL',
    });
  };

  const handleExportCSV = () => {
    if (vehicles.length === 0) return;
    const headers = [
      'No Lambung',
      'No Polisi',
      'Tipe Kendaraan',
      'Departemen',
      'Driver / PIC',
      'Lokasi',
      'KM Saat Ini',
      'Tanggal Terakhir PM',
      'KM Terakhir PM',
      'Jatuh Tempo PM (Tanggal)',
      'Target KM PM Berikutnya',
      'Status PM',
      'Status Operasi',
      'Mekanik Terakhir',
      'Catatan',
    ];

    const rows = vehicles.map((v) => [
      `"${v.noLambung}"`,
      `"${v.noPolisi}"`,
      `"${v.tipeKendaraan}"`,
      `"${v.department}"`,
      `"${v.driver}"`,
      `"${v.lokasi}"`,
      v.currentKmHm,
      `"${v.lastPmDate}"`,
      v.lastPmKmHm,
      `"${v.nextPmDueDate}"`,
      v.nextPmDueKmHm,
      `"${v.statusPm}"`,
      `"${v.statusOperasi}"`,
      `"${v.lastInspector}"`,
      `"${v.catatan.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_PM_Sarana_LV_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusTabs = [
    { key: 'ALL', label: 'Semua Status' },
    { key: 'SUDAH_PM', label: 'Sudah PM' },
    { key: 'DUE_SOON', label: 'Jatuh Tempo Segera' },
    { key: 'OVERDUE', label: 'Overdue' },
    { key: 'BELUM_PM', label: 'Belum PM' },
  ];

  const hasActiveFilters =
    filters.search !== '' ||
    filters.statusPm !== 'ALL' ||
    filters.department !== 'ALL' ||
    filters.tipeKendaraan !== 'ALL' ||
    filters.statusOperasi !== 'ALL';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs mb-6 space-y-3.5">
      {/* Search and Action Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="search-sarana-input"
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Cari No. Lambung (LV-01), Plat Nomor, Driver, atau Lokasi..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded-sm"
            >
              ×
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="export-csv-button"
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
            title="Download Rekap CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>

          {hasActiveFilters && (
            <button
              id="reset-filter-button"
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Reset Semua Filter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            id="add-vehicle-button"
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Sarana LV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs and Dropdowns */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-slate-100">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {statusTabs.map((tab) => {
            const isActive = filters.statusPm === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleStatusChange(tab.key)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Departemen Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 shrink-0" />
            <select
              id="filter-department-select"
              value={filters.department}
              onChange={handleDeptChange}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Semua Departemen</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Tipe Kendaraan Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <select
              id="filter-type-select"
              value={filters.tipeKendaraan}
              onChange={handleTypeChange}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[160px] truncate"
            >
              <option value="ALL">Semua Tipe Kendaraan</option>
              {vehicleTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
