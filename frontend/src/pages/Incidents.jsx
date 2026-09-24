import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, ShieldAlert, ArrowRight, CheckCircle2, AlertTriangle, Clock, 
  Wrench, ArrowUpRight, ArrowDownRight, ArrowRightLeft, Sparkles, RefreshCw, 
  Layers, Bot, CheckSquare, PlusCircle
} from 'lucide-react';
import { fetchIncidents, fetchIncidentDetails, updateIncidentStatus, scheduleMaintenance } from '../services/api';
import { calculateMachineProductionLoss } from '../services/costCalculator';

export default function Incidents({ machines = [], onRefreshData }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('id') || searchParams.get('machine');

  const [incidents, setIncidents] = useState([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [details, setDetails] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Work Order Modal State
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [workOrderData, setWorkOrderData] = useState({
    machine_id: '',
    machine_name: '',
    task_title: '',
    maintenance_type: 'Emergency',
    due_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [submittingWO, setSubmittingWO] = useState(false);

  // Fetch incident list
  const loadIncidents = async () => {
    setLoadingList(true);
    try {
      const res = await fetchIncidents();
      if (res.success && res.incidents) {
        setIncidents(res.incidents);
        // Select first incident or preselected query match
        if (res.incidents.length > 0) {
          let match = res.incidents.find(i => i.id === preselectedId || i.machine_id === preselectedId);
          if (!match) match = res.incidents[0];
          setSelectedIncidentId(match.id);
        }
      }
    } catch (err) {
      console.error('Error loading incidents:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  // Fetch details when selected incident changes
  useEffect(() => {
    if (!selectedIncidentId) return;
    const loadDetails = async () => {
      setLoadingDetails(true);
      try {
        const res = await fetchIncidentDetails(selectedIncidentId);
        if (res.success) {
          setDetails(res);
        }
      } catch (err) {
        console.error('Error loading incident details:', err);
      } finally {
        setLoadingDetails(false);
      }
    };
    loadDetails();
  }, [selectedIncidentId]);

  // Handle status update
  const handleStatusChange = async (newStatus) => {
    if (!selectedIncidentId) return;
    try {
      await updateIncidentStatus(selectedIncidentId, newStatus);
      await loadIncidents();
      const res = await fetchIncidentDetails(selectedIncidentId);
      if (res.success) setDetails(res);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Open pre-filled Work Order Modal
  const handleOpenWorkOrderModal = () => {
    if (!details || !details.incident) return;
    const inc = details.incident;
    setWorkOrderData({
      machine_id: inc.machine_id,
      machine_name: inc.machine_name,
      task_title: `Emergency Repair: ${inc.anomaly_type} Investigation`,
      maintenance_type: 'Emergency',
      due_date: new Date().toISOString().split('T')[0],
      notes: `Generated from AI Incident Investigation #${inc.id}. Anomaly: ${inc.anomaly_type} (Risk: ${inc.risk_score}/100). Recommendation: Inspect cooling loop, drive shaft, and pneumatic valves.`
    });
    setIsWorkOrderModalOpen(true);
  };

  // Submit Work Order
  const handleScheduleWorkOrderSubmit = async (e) => {
    e.preventDefault();
    setSubmittingWO(true);
    try {
      await scheduleMaintenance(workOrderData);
      await handleStatusChange('Maintenance Scheduled');
      setIsWorkOrderModalOpen(false);
      navigate('/maintenance');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingWO(false);
    }
  };

  // Filtered Incident List
  const filteredIncidents = incidents.filter(inc => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = inc.id.toLowerCase().includes(q) || 
                          inc.machine_name.toLowerCase().includes(q) || 
                          inc.machine_id.toLowerCase().includes(q) ||
                          inc.anomaly_type.toLowerCase().includes(q);
    if (!matchesSearch) return false;

    if (filter === 'All') return true;
    if (filter === 'Open') return inc.status !== 'Resolved';
    if (filter === 'Resolved') return inc.status === 'Resolved';
    return inc.severity.toLowerCase() === filter.toLowerCase() || inc.status.toLowerCase() === filter.toLowerCase();
  });

  const severityBadges = {
    Critical: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
    Warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    Info: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
  };

  const statusBadges = {
    'Investigation Required': 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse',
    'Under Investigation': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    'Maintenance Scheduled': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    'Resolved': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 text-slate-900 dark:text-white">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            AI INCIDENT INVESTIGATION
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Investigate machine anomalies, identify possible causes and generate recommended actions
          </p>
        </div>

        <button
          onClick={loadIncidents}
          className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
          <span>Refresh Incidents</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        
        {/* Filter Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
          {['All', 'Open', 'Critical', 'Warning', 'Resolved'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                filter === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID or Machine..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

      </div>

      {/* Main Grid: Incident List (Left 1/3) vs Incident Detail (Right 2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Incident List Cards */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between px-1">
            <span>Detected Incidents ({filteredIncidents.length})</span>
          </div>

          {loadingList ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-500 mb-2" />
              Loading detected incidents...
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <div className="font-bold">No Incidents Found</div>
              <p className="text-[11px]">No active machine anomalies match the selected filter.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
              {filteredIncidents.map(inc => {
                const isSelected = inc.id === selectedIncidentId;
                const sevBadge = severityBadges[inc.severity] || severityBadges.Info;
                const statBadge = statusBadges[inc.status] || statusBadges['Investigation Required'];

                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncidentId(inc.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer shadow-sm ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-500 text-slate-900 dark:text-white font-semibold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{inc.id}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({inc.machine_id})</span>
                        </div>
                        <h3 className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">{inc.machine_name}</h3>
                      </div>

                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${sevBadge}`}>
                        {inc.severity}
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Anomaly: </span>
                        <span className="font-semibold text-slate-900 dark:text-white">{inc.anomaly_type}</span>
                      </div>
                      <div className="font-mono font-bold text-rose-500">
                        Risk: {inc.risk_score}/100
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${statBadge}`}>
                        {inc.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {inc.created_at ? inc.created_at.split(' ')[1] || inc.created_at : 'Just now'}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Detailed Incident Inspection View */}
        <div className="lg:col-span-8">
          {!details || loadingDetails ? (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl min-h-[400px] flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-xs font-semibold">Loading Incident Telemetry & Root Cause Analysis...</span>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Incident Header Card */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                        INCIDENT #{details.incident.id}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${severityBadges[details.incident.severity]}`}>
                        {details.incident.severity} (Risk: {details.incident.risk_score}/100)
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                      {details.incident.machine_name}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      Machine ID: {details.incident.machine_id} • Detected: {details.incident.created_at}
                    </p>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Status:</span>
                    <select
                      value={details.incident.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none transition ${statusBadges[details.incident.status]}`}
                    >
                      <option value="Investigation Required">Investigation Required</option>
                      <option value="Under Investigation">Under Investigation</option>
                      <option value="Maintenance Scheduled">Maintenance Scheduled</option>
                      <option value="Resolved">Resolved</option>
                    </select>

                    <button
                      onClick={() => {
                        const targetId = details?.incident?.machine_id || details?.machine?.id;
                        if (targetId) navigate(`/machines/${targetId}`);
                      }}
                      className="flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/60 transition"
                    >
                      <span>View Machine</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sensor Snapshot Cards */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    5. Sensor Snapshot at Incident Time
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-sans uppercase">Temperature</div>
                      <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {details.before_after.temperature.after}°C
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans">Baseline: {details.before_after.temperature.before}°C</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-sans uppercase">Vibration</div>
                      <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {details.before_after.vibration.after} mm/s
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans">Baseline: {details.before_after.vibration.before} mm/s</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-sans uppercase">Pressure</div>
                      <div className="text-base font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">
                        {details.before_after.pressure.after} PSI
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans">Baseline: {details.before_after.pressure.before} PSI</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-sans uppercase">Operating Hours</div>
                      <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {details.machine.operating_hours || 2180} hrs
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans">Interval: 4,000 hrs</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* 6. BEFORE vs AFTER Anomaly Impact Comparison Table */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-blue-500" />
                    ANOMALY IMPACT (BEFORE vs AFTER)
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">Live Telemetry Delta Analysis</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-700 dark:text-slate-300">
                    <thead className="text-[11px] uppercase bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-mono">
                      <tr>
                        <th className="p-2.5">Parameter</th>
                        <th className="p-2.5">BEFORE (Baseline)</th>
                        <th className="p-2.5">AFTER (Incident)</th>
                        <th className="p-2.5">Impact Delta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white font-sans">Temperature (°C)</td>
                        <td className="p-2.5 text-slate-500">{details.before_after.temperature.before} °C</td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white">{details.before_after.temperature.after} °C</td>
                        <td className={`p-2.5 font-bold ${details.before_after.temperature.delta > 5 ? 'text-rose-500' : 'text-slate-400'}`}>
                          +{details.before_after.temperature.delta} °C ↑
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white font-sans">Vibration (mm/s)</td>
                        <td className="p-2.5 text-slate-500">{details.before_after.vibration.before} mm/s</td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white">{details.before_after.vibration.after} mm/s</td>
                        <td className={`p-2.5 font-bold ${details.before_after.vibration.delta > 1.0 ? 'text-rose-500' : 'text-slate-400'}`}>
                          +{details.before_after.vibration.delta} mm/s ↑
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white font-sans">Pressure (PSI)</td>
                        <td className="p-2.5 text-slate-500">{details.before_after.pressure.before} PSI</td>
                        <td className="p-2.5 font-bold text-cyan-600 dark:text-cyan-400">{details.before_after.pressure.after} PSI</td>
                        <td className={`p-2.5 font-bold ${Math.abs(details.before_after.pressure.delta) > 15 ? 'text-rose-500' : 'text-slate-400'}`}>
                          +{details.before_after.pressure.delta} PSI ↑
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white font-sans">AI Risk Score</td>
                        <td className="p-2.5 text-slate-500">{details.before_after.risk_score.before} / 100</td>
                        <td className="p-2.5 font-bold text-rose-500">{details.before_after.risk_score.after} / 100</td>
                        <td className="p-2.5 font-bold text-rose-500">+{details.before_after.risk_score.delta} pts ↑</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white font-sans">Machine Status</td>
                        <td className="p-2.5 text-emerald-600 dark:text-emerald-400 font-bold">NORMAL</td>
                        <td className="p-2.5 text-rose-600 dark:text-rose-400 font-bold">{details.before_after.status.after}</td>
                        <td className="p-2.5 font-bold text-rose-500">Exceeded Threshold</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 7. AI ROOT CAUSE ANALYSIS & 8. WHY DID THIS HAPPEN */}
              <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-slate-50 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-500/30 rounded-3xl space-y-4 shadow-sm">
                
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Bot className="w-5 h-5 text-indigo-500" />
                    🤖 AI ROOT CAUSE ANALYSIS
                  </h3>
                  <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-500/30">
                    Confidence: {details.ai_root_cause.confidence}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-950/80 border border-indigo-500/20 text-xs leading-relaxed space-y-2 text-slate-800 dark:text-slate-200">
                  <div className="font-bold text-slate-900 dark:text-white">Possible Root Cause:</div>
                  <p>"{details.ai_root_cause.summary}"</p>
                </div>

                {/* Disclaimer */}
                <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                  Note: {details.ai_root_cause.disclaimer}
                </div>

                {/* 8. WHY DID THIS HAPPEN */}
                <div className="space-y-2 pt-2 border-t border-indigo-500/20">
                  <div className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    WHY DID THIS HAPPEN? (Identified Risk Factors)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {details.ai_root_cause.factors.map((factor, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 flex items-start space-x-2">
                        <span className="text-rose-500 font-bold">⚠</span>
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* 9. POTENTIAL PRODUCTION IMPACT & COST LOSS ESTIMATION */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ESTIMATED POTENTIAL PRODUCTION LOSS & IMPACT
                  </h3>
                  <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full border border-rose-500/30">
                    Cost Impact Analysis
                  </span>
                </div>

                {(() => {
                  const lossData = calculateMachineProductionLoss(details.machine || { status: 'Critical' });
                  return (
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-slate-900 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-rose-500 dark:text-rose-400">Estimated Potential Production Loss</div>
                          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
                            {lossData.formatted_loss}
                          </div>
                        </div>
                        <div className="text-[11px] font-sans text-slate-600 dark:text-slate-300">
                          Formula: <strong className="font-mono text-slate-900 dark:text-white">{lossData.downtime_hrs} hrs × {lossData.production_rate} u/h × ₹{lossData.unit_value}</strong>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                          <div className="text-[10px] uppercase text-slate-400 font-sans">Expected Downtime</div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{lossData.downtime_hrs} hrs</div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                          <div className="text-[10px] uppercase text-slate-400 font-sans">Production Rate</div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{lossData.production_rate} units/hr</div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                          <div className="text-[10px] uppercase text-slate-400 font-sans">Value Per Unit</div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">₹{lossData.unit_value}</div>
                        </div>

                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
                          <div className="text-[10px] uppercase text-rose-500 font-sans font-bold">Estimated Potential Loss</div>
                          <div className="text-sm font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">{lossData.formatted_loss}</div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1">
                        Note: {lossData.disclaimer}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* 10. AI RECOMMENDED ACTION & WORK ORDER BUTTONS */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-emerald-500" />
                    🛠 AI RECOMMENDED ACTION
                  </h3>
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 rounded-full border border-rose-500/30">
                    Priority: HIGH
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {details.recommendations.map((rec, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 flex items-start space-x-2.5">
                      <span className="font-bold text-blue-500 shrink-0">{i + 1}.</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleOpenWorkOrderModal}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Maintenance Work Order</span>
                  </button>

                  {details.incident.status !== 'Resolved' && (
                    <button
                      onClick={() => handleStatusChange('Resolved')}
                      className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95"
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span>Mark Investigation Complete</span>
                    </button>
                  )}
                </div>

              </div>

              {/* 12. INCIDENT TIMELINE */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  INCIDENT TIMELINE
                </h3>

                <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 dark:border-slate-800">
                  {details.timeline.map((event, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900"></div>
                      <div className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">{event.time}</div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{event.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{event.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* Pre-filled Work Order Modal */}
      {isWorkOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-500" />
              Create Maintenance Work Order
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pre-filled with incident investigation telemetry and recommended actions</p>

            <form onSubmit={handleScheduleWorkOrderSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Target Machine</label>
                <input
                  type="text"
                  disabled
                  value={`${workOrderData.machine_name} (${workOrderData.machine_id})`}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Task Title</label>
                <input
                  type="text"
                  value={workOrderData.task_title}
                  onChange={(e) => setWorkOrderData({ ...workOrderData, task_title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Priority Type</label>
                  <select
                    value={workOrderData.maintenance_type}
                    onChange={(e) => setWorkOrderData({ ...workOrderData, maintenance_type: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="Emergency">Emergency</option>
                    <option value="Preventive">Preventive</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    value={workOrderData.due_date}
                    onChange={(e) => setWorkOrderData({ ...workOrderData, due_date: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Work Description & Notes</label>
                <textarea
                  rows={3}
                  value={workOrderData.notes}
                  onChange={(e) => setWorkOrderData({ ...workOrderData, notes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsWorkOrderModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWO}
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition"
                >
                  {submittingWO ? 'Scheduling...' : 'Schedule Work Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
