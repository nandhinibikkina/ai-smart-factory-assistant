import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Zap, PieChart as PieIcon, RefreshCw, Clock } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import { fetchProductionAnalytics } from '../services/api';

export default function Production() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('7days');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchProductionAnalytics();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 dark:text-slate-400 space-x-2">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
        <span className="text-xs font-semibold">Loading Factory Production & Downtime Analytics...</span>
      </div>
    );
  }

  const { summary, daily_production, machine_efficiency, status_distribution } = data;

  const totalWeeklyProduced = daily_production.reduce((acc, curr) => acc + curr.total_produced, 0);
  const totalWeeklyTarget = daily_production.reduce((acc, curr) => acc + curr.total_target, 0);
  const achievementPct = roundVal((totalWeeklyProduced / (totalWeeklyTarget || 1)) * 100.0, 1);

  function roundVal(val, decimals) {
    return Number(Math.round(val + 'e' + decimals) + 'e-' + decimals);
  }

  const pieData = [
    { name: 'Normal', value: status_distribution.Normal || 0, color: '#10b981' },
    { name: 'Warning', value: status_distribution.Warning || 0, color: '#f59e0b' },
    { name: 'Critical', value: status_distribution.Critical || 0, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12 text-slate-900 dark:text-white">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            Production Analytics & Downtime Intelligence
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Shift output, weekly target fulfillment, OEE efficiency breakdown, and shift downtime analysis</p>
        </div>

        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 shadow-sm">
          {[
            { id: 'today', label: 'Today' },
            { id: '7days', label: 'Last 7 Days' },
            { id: '30days', label: 'Last 30 Days' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setTimeFilter(f.id)}
              className={`px-3 py-1 rounded-lg transition ${
                timeFilter === f.id ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Production KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Today's Production</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {summary.produced_output.toLocaleString()} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">units</span>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Target: {summary.target_output.toLocaleString()} units</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Weekly Output</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {totalWeeklyProduced.toLocaleString()} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">units</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Achievement: <strong>{achievementPct}%</strong> of target</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Overall OEE Efficiency</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {summary.efficiency}%
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Nominal Target: &gt; 85.0%</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Shift Downtime</div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">
            {summary.downtime_hrs || 1.8} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">hrs</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Packaging unit bottleneck</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Production Trend Output vs Target (2 cols) */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Daily Production Trend vs Target</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Comparison of actual units produced against daily target metrics over time</p>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily_production} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="total_produced" name="Produced Units" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="total_target" name="Target Units" fill="#94a3b8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Machine Status Distribution Pie Chart (1 col) */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-500" />
              Machine Status Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Proportion of Normal vs Warning vs Critical units</p>
          </div>

          <div className="h-[200px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="text-emerald-600 dark:text-emerald-400">
              <div className="text-sm font-mono">{status_distribution.Normal || 0}</div>
              <div className="text-[10px] uppercase text-slate-500 dark:text-slate-400">Normal</div>
            </div>
            <div className="text-amber-600 dark:text-amber-400">
              <div className="text-sm font-mono">{status_distribution.Warning || 0}</div>
              <div className="text-[10px] uppercase text-slate-500 dark:text-slate-400">Warning</div>
            </div>
            <div className="text-rose-600 dark:text-rose-400">
              <div className="text-sm font-mono">{status_distribution.Critical || 0}</div>
              <div className="text-[10px] uppercase text-slate-500 dark:text-slate-400">Critical</div>
            </div>
          </div>
        </div>

      </div>

      {/* Machine Efficiency & Downtime Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Machine Efficiency Breakdown */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Machine Efficiency Comparison (%)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Comparative operational efficiency across all 6 industrial units</p>
          </div>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={machine_efficiency} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fontSize: 11 }} width={140} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
                <Bar dataKey="efficiency" name="Efficiency %" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shift Downtime Analysis Chart */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-500" />
              Machine Downtime Loss Analysis (Mins)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tracked shift downtime minutes per machine unit</p>
          </div>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={machine_efficiency} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="id" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
                <Bar dataKey="downtime_mins" name="Downtime Mins" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
