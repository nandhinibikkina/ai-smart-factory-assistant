import React, { useEffect, useState } from 'react';
import { Wrench, Calendar, CheckCircle2, Clock, AlertTriangle, Plus, X, RefreshCw } from 'lucide-react';
import { fetchMaintenance, scheduleMaintenance, completeMaintenance, fetchMachines } from '../services/api';

export default function Maintenance() {
  const [data, setData] = useState(null);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState('MCH-003');
  const [taskTitle, setTaskTitle] = useState('');
  const [maintType, setMaintType] = useState('Preventive');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const loadMaintenanceData = async () => {
    setLoading(true);
    try {
      const [mRes, macRes] = await Promise.all([
        fetchMaintenance().catch(() => ({ schedules: [], counts: {} })),
        fetchMachines().catch(() => ({ machines: [] }))
      ]);
      if (mRes.schedules) setData(mRes);
      if (macRes.machines) setMachines(macRes.machines);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaintenanceData();
  }, []);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!taskTitle || !dueDate) return;

    setSubmitLoading(true);
    try {
      const res = await scheduleMaintenance({
        machine_id: selectedMachine,
        task_title: taskTitle,
        maintenance_type: maintType,
        due_date: dueDate,
        notes: notes
      });

      if (res.success) {
        setIsModalOpen(false);
        setTaskTitle('');
        setNotes('');
        await loadMaintenanceData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleComplete = async (scheduleId) => {
    try {
      await completeMaintenance(scheduleId);
      await loadMaintenanceData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 dark:text-slate-400 space-x-2">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
        <span className="text-xs font-semibold">Loading Maintenance Schedules...</span>
      </div>
    );
  }

  const { schedules, counts } = data;

  const overdue = schedules.filter(s => s.status === 'Overdue');
  const pending = schedules.filter(s => s.status === 'Pending');
  const completed = schedules.filter(s => s.status === 'Completed');

  return (
    <div className="space-y-6 animate-fade-in pb-12 text-slate-900 dark:text-white">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-500" />
            Maintenance Operations Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Track upcoming, overdue, and completed preventive maintenance work orders across all machinery</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-md transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Maintenance</span>
        </button>
      </div>

      {/* Summary Counters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Overdue Servicing</div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">{counts.overdue || 0}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Requires immediate work order</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Pending / Scheduled</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">{counts.pending || 0}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Upcoming shift schedules</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Completed Servicing</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{counts.completed || 0}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Successfully resolved</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Work Orders</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{counts.total || 0}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Lifetime tracked orders</p>
        </div>
      </div>

      {/* Schedules Section */}
      <div className="space-y-6">
        
        {/* Overdue Section */}
        {overdue.length > 0 && (
          <div className="p-5 bg-rose-500/10 border border-rose-500/40 rounded-2xl space-y-3">
            <h3 className="font-bold text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Overdue Maintenance Tasks ({overdue.length})
            </h3>
            <div className="space-y-2 text-xs">
              {overdue.map(s => (
                <div key={s.id} className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{s.task_title}</div>
                    <div className="text-slate-500 dark:text-slate-400 mt-0.5">Machine: <strong className="text-slate-800 dark:text-slate-200">{s.machine_name}</strong> • Due Date: <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">{s.due_date}</span></div>
                    {s.notes && <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1">{s.notes}</p>}
                  </div>
                  <button
                    onClick={() => handleComplete(s.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition shrink-0 flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Completed</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending / Scheduled Section */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500" />
            Upcoming Scheduled Maintenance ({pending.length})
          </h3>

          <div className="space-y-2 text-xs">
            {pending.length === 0 ? (
              <div className="text-slate-500 dark:text-slate-400 py-3 text-center">No pending maintenance schedules.</div>
            ) : (
              pending.map(s => (
                <div key={s.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{s.task_title}</div>
                    <div className="text-slate-500 dark:text-slate-400 mt-0.5">Machine: <strong className="text-slate-800 dark:text-slate-200">{s.machine_name}</strong> • Due: <span className="font-mono text-amber-600 dark:text-amber-300">{s.due_date}</span> • Type: <span className="text-blue-600 dark:text-blue-400">{s.maintenance_type}</span></div>
                    {s.notes && <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1">{s.notes}</p>}
                  </div>
                  <button
                    onClick={() => handleComplete(s.id)}
                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 font-semibold rounded-lg transition shrink-0 flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Completed</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recently Completed Section */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-sm">
          <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Recently Completed Maintenance ({completed.length})
          </h3>

          <div className="space-y-2 text-xs">
            {completed.map(s => (
              <div key={s.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between opacity-80">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">{s.task_title}</span>
                  <span className="text-slate-500 dark:text-slate-400 ml-2">({s.machine_name})</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20">
                  Completed
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Schedule Maintenance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-base font-bold flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-500" />
              Schedule Maintenance Work Order
            </h2>

            <form onSubmit={handleScheduleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Select Machine</label>
                <select
                  value={selectedMachine}
                  onChange={(e) => setSelectedMachine(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 focus:outline-none"
                >
                  {machines.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Spindle Bearing Inspection & Lubrication"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Maintenance Type</label>
                  <select
                    value={maintType}
                    onChange={(e) => setMaintType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 focus:outline-none"
                  >
                    <option value="Preventive">Preventive</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Work Order Notes</label>
                <textarea
                  rows="3"
                  placeholder="Add specific inspection notes or replacement details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md"
                >
                  {submitLoading ? 'Scheduling...' : 'Save Work Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
