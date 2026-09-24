import React, { useState } from 'react';
import { Settings as SettingsIcon, RefreshCw, AlertTriangle, Moon, Sun, Database, Sliders } from 'lucide-react';
import { triggerMachineAnomaly, resetSimulation } from '../services/api';

export default function Settings({ darkMode, setDarkMode, onRefreshData }) {
  const [refreshInterval, setRefreshInterval] = useState(10);
  const [tempThreshold, setTempThreshold] = useState(85);
  const [vibThreshold, setVibThreshold] = useState(5.5);
  const [msg, setMsg] = useState('');

  const handleInject = async () => {
    try {
      const res = await triggerMachineAnomaly('MCH-003');
      setMsg(`✅ Anomaly injected into Machine 03: Temp=${res.result.temperature}°C, Vib=${res.result.vibration} mm/s`);
      if (onRefreshData) onRefreshData();
    } catch (e) {
      setMsg('❌ Error injecting anomaly.');
    }
  };

  const handleReset = async () => {
    try {
      const res = await resetSimulation();
      setMsg(`✅ ${res.message}`);
      if (onRefreshData) onRefreshData();
    } catch (e) {
      setMsg('❌ Error resetting simulation.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-4xl">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          Factory System & Simulation Settings
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">Configure telemetry refresh rate, ML alert thresholds, theme preferences, and demo simulation state</p>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 text-xs font-semibold text-blue-700 dark:text-blue-300">
          {msg}
        </div>
      )}

      {/* Demo & Simulation Control Panel */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          Hackathon Demo Simulation Controls
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="font-semibold text-slate-900 dark:text-white">Trigger Machine 03 Anomaly</div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">Injects elevated temperature (88.5°C) and vibration (6.2 mm/s) into Machine 03 to test critical alerts and AI diagnosis.</p>
            <button
              onClick={handleInject}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg transition"
            >
              Simulate Anomaly
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="font-semibold text-slate-900 dark:text-white">Reset Simulation Baseline</div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">Restores all 6 factory machines to baseline normal metrics and clears active alerts.</p>
            <button
              onClick={handleReset}
              className="px-3.5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold border border-slate-300 dark:border-slate-700 rounded-lg transition flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Factory DB</span>
            </button>
          </div>

        </div>
      </div>

      {/* Threshold & Refresh Configuration */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Alert Threshold Configuration
        </h3>

        <div className="space-y-4 text-xs">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Telemetry Polling Interval</div>
              <div className="text-slate-600 dark:text-slate-400 text-[11px]">Background sensor update frequency</div>
            </div>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-1.5 focus:outline-none"
            >
              <option value={5}>5 seconds (Fast)</option>
              <option value={10}>10 seconds (Default)</option>
              <option value={30}>30 seconds</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Critical Temperature Safety Threshold</div>
              <div className="text-slate-600 dark:text-slate-400 text-[11px]">Triggers RED Critical status when exceeded</div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={tempThreshold}
                onChange={(e) => setTempThreshold(Number(e.target.value))}
                className="w-20 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-1 text-center font-mono focus:outline-none"
              />
              <span className="text-slate-500 dark:text-slate-400">°C</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Critical Vibration Tolerance Limit</div>
              <div className="text-slate-600 dark:text-slate-400 text-[11px]">Triggers mechanical bearing wear alert</div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                step="0.1"
                value={vibThreshold}
                onChange={(e) => setVibThreshold(Number(e.target.value))}
                className="w-20 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-1 text-center font-mono focus:outline-none"
              />
              <span className="text-slate-500 dark:text-slate-400">mm/s</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
