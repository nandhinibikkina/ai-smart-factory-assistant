import React, { useState } from 'react';
import MachineCard from '../components/MachineCard';
import { Search, Filter, Cpu } from 'lucide-react';

export default function Machines({ machines = [], onResetSingleMachine }) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const types = ['All', ...new Set(machines.map(m => m.type))];

  const filtered = machines.filter(m => {
    const matchesStatus = filterStatus === 'All' || m.status === filterStatus;
    const matchesType = filterType === 'All' || m.type === filterType;
    const matchesQuery = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         m.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesQuery;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12 text-slate-900 dark:text-white">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-500" />
            Industrial Machine Fleet
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Real-time sensor telemetry, risk scores (0-100), energy usage, and maintenance schedules</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search machine name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white rounded-xl focus:border-blue-500 focus:outline-none w-56 shadow-sm"
            />
          </div>

          {/* Filter Status */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 shadow-sm">
            {['All', 'Normal', 'Warning', 'Critical'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterStatus === status ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Filter Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none shadow-sm"
          >
            <option value="All">All Machine Types</option>
            {types.filter(t => t !== 'All').map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

        </div>
      </div>

      {/* Grid View */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 dark:text-slate-400 text-xs">
          No machines found matching search query "{searchQuery}" or selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(m => (
            <MachineCard key={m.id} machine={m} onResetSingleMachine={onResetSingleMachine} />
          ))}
        </div>
      )}

    </div>
  );
}
