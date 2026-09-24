import React, { useState } from 'react';
import AlertCard from '../components/AlertCard';
import { Bell, Filter, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export default function Alerts({ alerts = [], alertCounters = {}, onResolveAlert }) {
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterStatus, setFilterStatus] = useState('Active');

  const filtered = alerts.filter(a => {
    const matchSev = filterSeverity === 'All' || a.severity === filterSeverity;
    const matchStat = filterStatus === 'All' || a.status === filterStatus;
    return matchSev && matchStat;
  });

  const activeCount = alerts.filter(a => a.status === 'Active').length;
  const criticalCount = alerts.filter(a => a.severity === 'Critical' && a.status === 'Active').length;
  const warningCount = alerts.filter(a => a.severity === 'Warning' && a.status === 'Active').length;
  const resolvedCount = alerts.filter(a => a.status === 'Resolved').length;

  return (
    <div className="space-y-6 animate-fade-in pb-12 text-slate-900 dark:text-white">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            Control Center Smart Alert Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Real-time predictive maintenance alerts, diagnostic descriptions, and actionable repair recommendations</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          
          {/* Status Filter */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 shadow-sm">
            {['Active', 'Resolved', 'All'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg transition ${
                  filterStatus === st ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Severity Filter */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 shadow-sm">
            {['All', 'Critical', 'Warning', 'Info'].map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1 rounded-lg transition ${
                  filterSeverity === sev ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Alert Counters Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center space-x-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400">Critical Active</div>
            <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">{criticalCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center space-x-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400">Warning Active</div>
            <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">{warningCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center space-x-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400">Resolved Alerts</div>
            <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{resolvedCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center space-x-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400">Total Active</div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">{activeCount}</div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 dark:text-slate-400 text-xs shadow-sm">
          No alerts found matching severity "{filterSeverity}" and status "{filterStatus}".
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <AlertCard key={a.id} alert={a} onResolve={onResolveAlert} />
          ))}
        </div>
      )}

    </div>
  );
}
