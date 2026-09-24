import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowUpRight } from 'lucide-react';

export default function DigitalTwin({ machines = [] }) {
  const navigate = useNavigate();

  const statusStyles = {
    Normal: { 
      bg: 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/50 hover:border-emerald-500', 
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', 
      dot: 'bg-emerald-500' 
    },
    Warning: { 
      bg: 'bg-amber-500/10 dark:bg-amber-950/30 border-amber-500/60 hover:border-amber-500 shadow-md shadow-amber-500/10', 
      badge: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 font-bold', 
      dot: 'bg-amber-500' 
    },
    Critical: { 
      bg: 'bg-rose-500/15 dark:bg-rose-950/40 border-rose-500/80 shadow-lg shadow-rose-500/20 hover:border-rose-500 animate-pulse', 
      badge: 'bg-rose-500/25 text-rose-700 dark:text-rose-300 border-rose-500/50 font-bold', 
      dot: 'bg-rose-500' 
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 text-slate-900 dark:text-white">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-500" />
          Factory 2D Digital Twin Floor Overview
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Interactive 2D spatial floor map representing physical machine placement and real-time operational status</p>
      </div>

      {/* 2D Floor Layout Canvas */}
      <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl relative min-h-[500px] flex flex-col justify-between overflow-hidden shadow-sm">
        
        {/* Subtle grid background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

        {/* Floor Zones Header */}
        <div className="relative z-10 flex justify-between text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800/80 pb-3">
          <span>Assembly & Machining Line (Zone A)</span>
          <span>Packaging & Quality Inspection (Zone B)</span>
        </div>

        {/* 2D Grid Floor Representation */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
          {machines.map(m => {
            const style = statusStyles[m.status] || statusStyles.Normal;
            return (
              <div
                key={m.id}
                onClick={() => navigate(`/machines/${m.id}`)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm hover:-translate-y-1 ${style.bg}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-semibold">{m.id} • {m.type}</div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{m.name}</h3>
                  </div>

                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${style.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot} mr-1.5`}></span>
                    {m.status}
                  </span>
                </div>

                {/* Telemetry Snapshot */}
                <div className="grid grid-cols-3 gap-1.5 my-3 py-2 border-y border-slate-100 dark:border-slate-800 text-[11px]">
                  <div className="text-center">
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase block">Temp</span>
                    <span className={`font-mono font-bold ${m.temperature > 85 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>{m.temperature}°C</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase block">Vib</span>
                    <span className={`font-mono font-bold ${m.vibration > 5.5 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>{m.vibration}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase block">Risk</span>
                    <span className={`font-mono font-bold ${m.risk_score > 60 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{m.risk_score}/100</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <span>Eff: {m.efficiency}%</span>
                  <span className="text-blue-600 dark:text-blue-400 flex items-center space-x-1">
                    <span>Inspect Twin</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floor Map Legend */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Normal Operation</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Warning Drift</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>Critical Anomaly</span>
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            Click any floor machine node for real-time sensor diagnostics
          </div>
        </div>

      </div>

    </div>
  );
}
