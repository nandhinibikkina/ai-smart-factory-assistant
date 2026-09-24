import React, { useState } from 'react';
import { X, AlertTriangle, Cpu, Flame, Activity, Gauge, TrendingUp, Zap } from 'lucide-react';

export default function InjectAnomalyModal({ isOpen, onClose, onInject, machines = [] }) {
  const defaultMachines = [
    { id: 'MCH-001', name: 'Machine 01 - Assembly Unit' },
    { id: 'MCH-002', name: 'Machine 02 - CNC Unit' },
    { id: 'MCH-003', name: 'Machine 03 - Packaging Unit' },
    { id: 'MCH-004', name: 'Machine 04 - Welding Unit' },
    { id: 'MCH-005', name: 'Machine 05 - Conveyor Unit' },
    { id: 'MCH-006', name: 'Machine 06 - Inspection Unit' }
  ];

  const machineList = machines.length > 0 ? machines : defaultMachines;
  const [selectedMachine, setSelectedMachine] = useState(machineList[0]?.id || 'MCH-001');
  const [selectedAnomaly, setSelectedAnomaly] = useState('Abnormal Pressure');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const anomalyTypes = [
    { id: 'High Temperature', label: 'High Temperature', desc: 'Spikes temperature to ~89.5°C above safety limits', icon: Flame, color: 'text-orange-400' },
    { id: 'High Vibration', label: 'High Vibration', desc: 'Increases drive shaft vibration to ~6.8 mm/s', icon: Activity, color: 'text-blue-400' },
    { id: 'Abnormal Pressure', label: 'Abnormal Pressure', desc: 'Spikes line pressure to ~135 PSI', icon: Gauge, color: 'text-cyan-400' },
    { id: 'Increasing Trend', label: 'Increasing Trend', desc: 'Simulates continuous upward parameter drift', icon: TrendingUp, color: 'text-amber-400' },
    { id: 'Combined Anomaly', label: 'Combined Anomaly (Critical)', desc: 'Multi-sensor thermal, vibration & pressure spike', icon: AlertTriangle, color: 'text-rose-400' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onInject(selectedMachine, selectedAnomaly);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-900 dark:text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Inject Machine Anomaly</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select any machine in the fleet and specify an anomaly scenario for live demonstration
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Select Machine */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              1. Select Target Machine
            </label>
            <select
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 transition"
            >
              {machineList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.id}) {m.status ? `— Current: ${m.status}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Select Anomaly Type */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              2. Select Anomaly Type
            </label>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {anomalyTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedAnomaly === type.id;
                return (
                  <div
                    key={type.id}
                    onClick={() => setSelectedAnomaly(type.id)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-rose-500/10 dark:bg-rose-950/30 border-rose-500/60 text-slate-900 dark:text-white font-bold'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${type.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">{type.label}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">{type.desc}</div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-rose-500 bg-rose-500' : 'border-slate-300 dark:border-slate-700'}`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-md transition flex items-center space-x-1.5 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{loading ? 'Injecting Anomaly...' : 'Inject Anomaly'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
