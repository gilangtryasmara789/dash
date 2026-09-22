import React, { useMemo } from 'react';
import { SaranaLV } from '../types';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { PieChart as PieIcon, BarChart3, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ChartsSectionProps {
  vehicles: SaranaLV[];
}

const STATUS_COLORS = {
  'Sudah PM': '#10b981',      // emerald-500
  'Jatuh Tempo Segera': '#f59e0b', // amber-500
  'Overdue': '#f43f5e',       // rose-500
  'Belum PM': '#64748b',      // slate-500
};

export const ChartsSection: React.FC<ChartsSectionProps> = ({ vehicles }) => {
  const pieData = useMemo(() => {
    let sudah = 0;
    let dueSoon = 0;
    let overdue = 0;
    let belum = 0;

    vehicles.forEach((v) => {
      if (v.statusPm === 'SUDAH_PM') sudah++;
      else if (v.statusPm === 'DUE_SOON') dueSoon++;
      else if (v.statusPm === 'OVERDUE') overdue++;
      else belum++;
    });

    return [
      { name: 'Sudah PM', value: sudah, color: STATUS_COLORS['Sudah PM'] },
      { name: 'Jatuh Tempo Segera', value: dueSoon, color: STATUS_COLORS['Jatuh Tempo Segera'] },
      { name: 'Overdue', value: overdue, color: STATUS_COLORS['Overdue'] },
      { name: 'Belum PM', value: belum, color: STATUS_COLORS['Belum PM'] },
    ].filter((item) => item.value > 0);
  }, [vehicles]);

  const deptData = useMemo(() => {
    const deptMap: Record<string, { total: number; sudah: number; pending: number }> = {};

    vehicles.forEach((v) => {
      const dept = v.department || 'Lainnya';
      if (!deptMap[dept]) {
        deptMap[dept] = { total: 0, sudah: 0, pending: 0 };
      }
      deptMap[dept].total++;
      if (v.statusPm === 'SUDAH_PM') {
        deptMap[dept].sudah++;
      } else {
        deptMap[dept].pending++;
      }
    });

    return Object.entries(deptMap).map(([name, stat]) => ({
      dept: name.replace('Operation', 'Ops').replace('Emergency Response Team', 'ERT'),
      sudah: stat.sudah,
      pending: stat.pending,
      complianceRate: stat.total > 0 ? Math.round((stat.sudah / stat.total) * 100) : 0,
    }));
  }, [vehicles]);

  const urgentVehicles = useMemo(() => {
    return vehicles
      .filter((v) => v.statusPm === 'OVERDUE' || v.statusPm === 'DUE_SOON')
      .slice(0, 3);
  }, [vehicles]);

  if (vehicles.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
      {/* Donut Chart: Komposisi PM */}
      <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                <PieIcon className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Status Kepatuhan PM</h3>
            </div>
            <span className="text-xs text-slate-500">{vehicles.length} Total Unit</span>
          </div>
          <p className="text-xs text-slate-500 mb-3">Distribusi status perawatan berkala sarana LV.</p>
        </div>

        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={52}
                outerRadius={78}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any, name: any) => [`${val} Unit (${Math.round((Number(val) / vehicles.length) * 100)}%)`, name]}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          {pieData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <div className="truncate">
                <span className="text-[11px] text-slate-600 truncate block">{item.name}</span>
                <span className="text-xs font-bold text-slate-900">{item.value} unit</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart: PM per Departemen */}
      <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Status PM per Departemen</h3>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              Sudah vs Belum
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-2">Perbandingan unit yang sudah PM dan belum/overdue per divisi.</p>
        </div>

        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="dept" 
                tick={{ fontSize: 10, fill: '#64748b' }} 
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="sudah" name="Sudah PM" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" name="Belum / Overdue" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
            <span className="text-slate-600 font-medium">Sudah PM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-rose-500"></span>
            <span className="text-slate-600 font-medium">Belum / Overdue PM</span>
          </div>
        </div>
      </div>

      {/* Prioritas Servis & Tindakan Segera */}
      <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-rose-50 text-rose-700 rounded-lg">
              <AlertCircle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Prioritas Tindakan</h3>
          </div>
          <p className="text-xs text-slate-500 mb-3">Unit yang paling mendesak dijadwalkan ke workshop.</p>
        </div>

        <div className="space-y-2.5 my-auto">
          {urgentVehicles.length === 0 ? (
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-lg text-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-emerald-800">Semua Unit Aman!</p>
              <p className="text-[11px] text-emerald-600">Tidak ada unit yang jatuh tempo atau overdue saat ini.</p>
            </div>
          ) : (
            urgentVehicles.map((v) => (
              <div
                key={v.id}
                className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/80 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">{v.noLambung}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                      v.statusPm === 'OVERDUE'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {v.statusPm === 'OVERDUE' ? 'OVERDUE' : 'JATUH TEMPO'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 truncate">{v.tipeKendaraan}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                  <span>Target: {(v.nextPmDueKmHm || 0).toLocaleString()} KM</span>
                  <span className="font-semibold text-slate-700">{v.nextPmDueDate}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Standar Interval PM:</span>
            <span className="font-bold text-slate-800">5.000 KM / 250 HM</span>
          </div>
        </div>
      </div>
    </div>
  );
};
