import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Thermometer, Activity, Gauge, Clock, ArrowUpRight, RotateCcw, TrendingDown } from 'lucide-react';
import { calculateMachineProductionLoss } from '../services/costCalculator';

export default function MachineCard({ machine, onResetSingleMachine }) {
  const navigate = useNavigate();
  
  const statusStyles = {
    Normal: {
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      dotColor: 'bg-emerald-500',
      cardBorder: 'hover:border-emerald-500/50',
      riskColor: 'text-emerald-600 dark:text-emerald-400'
    },
    Warning: {
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      dotColor: 'bg-amber-500',
      cardBorder: 'hover:border-amber-500/50 border-amber-500/30',
      riskColor: 'text-amber-600 dark:text-amber-400'
    },
    Critical: {
      badgeBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/40 animate-pulse',
      dotColor: 'bg-rose-500',
      cardBorder: 'border-rose-500/60 shadow-lg shadow-rose-950/20 hover:border-rose-400',
      riskColor: 'text-rose-600 dark:text-rose-400'
    }
  };

  const style = statusStyles[machine.status] || statusStyles.Normal;
  const costImpact = calculateMachineProductionLoss(machine);

  return (
    <div
      onClick={() => navigate(`/machines/${machine.id}`)}
      className={`group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-all duration-200 cursor-pointer ${style.cardBorder} hover:shadow-md hover:-translate-y-0.5 space-y-3`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{machine.id} • {machine.type}</div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mt-0.5">
            {machine.name}
          </h3>
        </div>
        
        <div className="flex flex-col items-end space-y-1">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.badgeBg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dotColor} mr-1.5`}></span>
            {machine.status}
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
            Risk: <span className={style.riskColor}>{machine.risk_score}/100</span>
          </span>
        </div>
      </div>

      {/* Sensor Parameters Grid */}
      <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800/80 text-xs">
        
        {/* Temperature */}
        <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border ${machine.temperature > 85 ? 'border-rose-500/40 bg-rose-500/5 dark:bg-rose-950/20' : 'border-slate-200 dark:border-slate-800/80'}`}>
          <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 mb-0.5">
            <Thermometer className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[10px] uppercase font-semibold">Temp</span>
          </div>
          <div className={`font-mono font-bold text-sm ${machine.temperature > 85 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
            {machine.temperature}°C
          </div>
        </div>

        {/* Vibration */}
        <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border ${machine.vibration > 5.5 ? 'border-rose-500/40 bg-rose-500/5 dark:bg-rose-950/20' : 'border-slate-200 dark:border-slate-800/80'}`}>
          <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 mb-0.5">
            <Activity className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] uppercase font-semibold">Vib</span>
          </div>
          <div className={`font-mono font-bold text-sm ${machine.vibration > 5.5 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
            {machine.vibration} <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400">mm/s</span>
          </div>
        </div>

        {/* Pressure */}
        <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border ${machine.pressure < 75 || machine.pressure > 125 ? 'border-amber-500/40' : 'border-slate-200 dark:border-slate-800/80'}`}>
          <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 mb-0.5">
            <Gauge className="w-3.5 h-3.5 text-cyan-500" />
            <span className="text-[10px] uppercase font-semibold">Press</span>
          </div>
          <div className="font-mono font-bold text-sm text-slate-800 dark:text-slate-200">
            {machine.pressure} <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400">PSI</span>
          </div>
        </div>

      </div>

      {/* FEATURE 2: Estimated Potential Production Loss Badge for Warning/Critical */}
      {machine.status !== 'Normal' ? (
        <div className="p-2 rounded-xl bg-rose-500/10 dark:bg-rose-950/30 border border-rose-500/30 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-1.5 text-rose-600 dark:text-rose-400 font-bold">
            <TrendingDown className="w-3.5 h-3.5" />
            <span className="text-[10px] font-sans font-bold uppercase">Estimated Potential Loss:</span>
          </div>
          <strong className="text-rose-600 dark:text-rose-400 font-extrabold">{costImpact.formatted_loss}</strong>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono pt-0.5">
          <div>
            <span>Output:</span> <strong className="text-slate-800 dark:text-slate-200">{machine.production_output || 850} u</strong> ({machine.efficiency || 90}%)
          </div>
          <div className="text-right">
            <span>Next:</span> <span className="text-amber-600 dark:text-amber-300">{machine.next_maintenance_date || 'In 14 days'}</span>
          </div>
        </div>
      )}

      {/* Footer Info & Single Machine Reset */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center space-x-1.5 font-mono text-[11px]">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{machine.operating_hours.toLocaleString()} hrs</span>
        </div>

        <div className="flex items-center space-x-2">
          {machine.status !== 'Normal' && onResetSingleMachine && (
            <button
              onClick={(e) => { e.stopPropagation(); onResetSingleMachine(machine.id); }}
              className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg transition flex items-center space-x-1"
              title="Reset this machine anomaly to normal baseline"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Reset</span>
            </button>
          )}

          <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform font-medium">
            <span>Inspect</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

    </div>
  );
}
