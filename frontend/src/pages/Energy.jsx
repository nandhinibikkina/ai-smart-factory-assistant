import React, { useEffect, useState } from 'react';
import { Zap, AlertTriangle, CheckCircle2, RefreshCw, Leaf, Cpu } from 'lucide-react';
import StatCard from '../components/StatCard';
import { fetchEnergyMetrics } from '../services/api';

export default function Energy() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadEnergy = async () => {
    setLoading(true);
    try {
      const res = await fetchEnergyMetrics();
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
    loadEnergy();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 dark:text-slate-400 space-x-2">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
        <span className="text-xs font-semibold">Loading Energy & Sustainability Telemetry...</span>
      </div>
    );
  }

  const { summary, machines, high_energy_machines } = data;

  return (
    <div className="space-y-6 animate-fade-in pb-12 text-slate-900 dark:text-white">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs uppercase tracking-wider">
            <Leaf className="w-4 h-4 text-emerald-500" />
            <span>Green Manufacturing & Energy Efficiency</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">Energy & Sustainability Monitoring</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Simulated prototype data tracking industrial energy usage (kWh) and sustainability recommendations</p>
        </div>

        <button
          onClick={loadEnergy}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Top Energy KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Energy Load"
          value={`${summary.total_energy_kwh} kWh`}
          subtitle="Current shift energy load"
          icon={Zap}
        />
        <StatCard
          title="Avg Energy Efficiency"
          value={`${summary.average_energy_efficiency}%`}
          subtitle="Nominal threshold: > 85.0%"
          icon={CheckCircle2}
        />
        <StatCard
          title="High Energy Machines"
          value={summary.high_energy_count}
          subtitle="Requires efficiency review"
          icon={AlertTriangle}
        />
      </div>

      {/* High Energy Warning Banner */}
      {high_energy_machines.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
          <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-300 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>High Energy Consumption Detected ({high_energy_machines.length} Units)</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            {high_energy_machines.map(m => (
              <div key={m.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">{m.name}</span>
                  <span className="text-slate-500 dark:text-slate-400 ml-2">({m.energy_kwh} kWh • {m.energy_efficiency}% efficiency)</span>
                </div>
                <div className="text-amber-700 dark:text-amber-300 text-[11px] font-medium">
                  💡 {m.suggestion}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Machine Energy Grid */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-500" />
          Machine Energy Telemetry Fleet Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {machines.map(m => (
            <div key={m.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold">{m.id} • {m.type}</div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{m.name}</div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                  m.energy_status === 'Optimal' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                }`}>
                  {m.energy_status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Energy Usage</div>
                  <div className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400 mt-0.5">{m.energy_kwh} kWh</div>
                </div>

                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Efficiency</div>
                  <div className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{m.energy_efficiency}%</div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                {m.suggestion}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
