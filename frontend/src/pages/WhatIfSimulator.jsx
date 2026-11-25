import React, { useState, useEffect } from 'react';
import { Sliders, RotateCcw, Activity, Thermometer, Gauge, Clock, Sparkles, ArrowRight, CheckCircle2, Zap, Cpu, AlertTriangle, ShieldAlert } from 'lucide-react';
import { analyzeScenario, applySimulatorScenario } from '../services/api';

export default function WhatIfSimulator({ machines = [], onRefreshData }) {
  const defaultMachines = [
    { id: 'MCH-001', name: 'Machine 01 - Assembly Unit', type: 'Robotic Assembly', status: 'Normal', risk_score: 12.0, temperature: 64.2, vibration: 1.8, pressure: 102.5, operating_hours: 1420 },
    { id: 'MCH-002', name: 'Machine 02 - CNC Unit', type: 'CNC Milling', status: 'Normal', risk_score: 25.0, temperature: 71.5, vibration: 2.9, pressure: 98.0, operating_hours: 2180 },
    { id: 'MCH-003', name: 'Machine 03 - Packaging Unit', type: 'Automated Packaging', status: 'Normal', risk_score: 13.0, temperature: 66.0, vibration: 1.9, pressure: 101.0, operating_hours: 3850 },
    { id: 'MCH-004', name: 'Machine 04 - Welding Unit', type: 'Robotic Welding', status: 'Normal', risk_score: 15.0, temperature: 68.4, vibration: 2.1, pressure: 99.5, operating_hours: 1940 },
    { id: 'MCH-005', name: 'Machine 05 - Conveyor Unit', type: 'Material Handling', status: 'Normal', risk_score: 8.0, temperature: 58.0, vibration: 1.2, pressure: 95.0, operating_hours: 890 },
    { id: 'MCH-006', name: 'Machine 06 - Inspection Unit', type: 'Optical Inspection', status: 'Normal', risk_score: 4.0, temperature: 52.4, vibration: 0.8, pressure: 91.5, operating_hours: 650 }
  ];

  const machineList = machines.length > 0 ? machines : defaultMachines;
  const [selectedMachineId, setSelectedMachineId] = useState(machineList[0]?.id || 'MCH-001');

  // Isolated Per-Machine Slider State: { [mId]: { temperature, vibration, pressure, operatingHours } }
  const [simulationsState, setSimulationsState] = useState({});

  // Isolated Per-Machine Analysis Results: { [mId]: resultData }
  const [resultsState, setResultsState] = useState({});

  // Apply Feedback Notice: { [mId]: message }
  const [appliedNotices, setAppliedNotices] = useState({});

  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);

  // Active machine reference
  const currentMachine = machineList.find(m => m.id === selectedMachineId) || machineList[0];

  // Get current slider values for selected machine (or default to actual baseline)
  const getMachineSliders = (mId) => {
    if (simulationsState[mId]) {
      return simulationsState[mId];
    }
    const target = machineList.find(m => m.id === mId) || currentMachine;
    return {
      temperature: Number(target.temperature || 65.0),
      vibration: Number(target.vibration || 1.8),
      pressure: Number(target.pressure || 100.0),
      operatingHours: Number(target.operating_hours || 1500)
    };
  };

  const activeSliders = getMachineSliders(selectedMachineId);
  const activeResult = resultsState[selectedMachineId] || null;
  const activeNotice = appliedNotices[selectedMachineId] || null;

  // Update slider for current machine only
  const updateSlider = (paramKey, value) => {
    setSimulationsState(prev => ({
      ...prev,
      [selectedMachineId]: {
        ...getMachineSliders(selectedMachineId),
        [paramKey]: value
      }
    }));
  };

  // Analyze scenario for selected machine
  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const payload = {
        machine_id: selectedMachineId,
        temperature: activeSliders.temperature,
        vibration: activeSliders.vibration,
        pressure: activeSliders.pressure,
        operating_hours: activeSliders.operatingHours,
        baseline_temperature: currentMachine.temperature,
        baseline_vibration: currentMachine.vibration,
        baseline_pressure: currentMachine.pressure,
        baseline_hours: currentMachine.operating_hours
      };
      const data = await analyzeScenario(payload);
      if (data.success) {
        setResultsState(prev => ({
          ...prev,
          [selectedMachineId]: data
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Explicitly apply scenario to selected machine
  const handleApplyScenario = async () => {
    setApplying(true);
    try {
      const payload = {
        machine_id: selectedMachineId,
        temperature: activeSliders.temperature,
        vibration: activeSliders.vibration,
        pressure: activeSliders.pressure,
        operating_hours: activeSliders.operatingHours
      };
      const res = await applySimulatorScenario(payload);
      if (res.success) {
        setAppliedNotices(prev => ({
          ...prev,
          [selectedMachineId]: `Applied simulated telemetry to ${currentMachine.name} (${selectedMachineId}). Status updated to ${res.status || 'Updated'}.`
        }));
        if (onRefreshData) onRefreshData();
        setTimeout(() => {
          setAppliedNotices(prev => ({ ...prev, [selectedMachineId]: null }));
        }, 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  // Reset controls for selected machine only
  const handleResetCurrentMachine = () => {
    const baseline = {
      temperature: Number(currentMachine.temperature || 65.0),
      vibration: Number(currentMachine.vibration || 1.8),
      pressure: Number(currentMachine.pressure || 100.0),
      operatingHours: Number(currentMachine.operating_hours || 1500)
    };
    setSimulationsState(prev => ({
      ...prev,
      [selectedMachineId]: baseline
    }));
    setResultsState(prev => ({
      ...prev,
      [selectedMachineId]: null
    }));
    setAppliedNotices(prev => ({
      ...prev,
      [selectedMachineId]: null
    }));
  };

  const riskBadgeStyles = {
    LOW: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    MEDIUM: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    HIGH: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40',
    CRITICAL: 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40 animate-pulse'
  };

  const statusBadgeStyles = {
    Normal: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    Warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    Critical: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/40 animate-pulse'
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-6xl text-slate-900 dark:text-white">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Interactive Risk Assessment Engine</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">What-If Scenario Risk Simulator</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Simulate independent sensor parameters for individual machines to predict AI risk score shifts without modifying live production fleet state
          </p>
        </div>

        {/* Target Machine Selection Dropdown */}
        <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-sm">
          <Cpu className="w-4 h-4 text-blue-500 shrink-0" />
          <div className="text-xs shrink-0">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">Target Machine:</span>
            <select
              value={selectedMachineId}
              onChange={(e) => setSelectedMachineId(e.target.value)}
              className="bg-transparent font-bold text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              {machineList.map(m => (
                <option key={m.id} value={m.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {m.name} ({m.id}) — Status: {m.status} (Risk: {m.risk_score}/100)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active Simulation Target Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-slate-900 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white font-bold font-mono">
            {currentMachine.id}
          </div>
          <div>
            <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400 uppercase font-bold tracking-wider">
              Simulating: {currentMachine.name}
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {currentMachine.type} • Nominal Parameters
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 font-mono">
          <div className="text-right">
            <div className="text-[10px] uppercase text-slate-400">Current Fleet Status</div>
            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${statusBadgeStyles[currentMachine.status] || statusBadgeStyles.Normal}`}>
              {currentMachine.status} (Risk: {currentMachine.risk_score}/100)
            </span>
          </div>
        </div>
      </div>

      {/* Applied Notice Banner */}
      {activeNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{activeNotice}</span>
        </div>
      )}

      {/* Main Grid: Controls vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Controls Column */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-5 shadow-sm">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-500" />
              Sensor Telemetry Controls for {currentMachine.id}
            </h3>
            <button
              onClick={handleResetCurrentMachine}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center space-x-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Controls</span>
            </button>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                <span>Temperature (°C)</span>
              </span>
              <span className="font-mono text-orange-600 dark:text-orange-400 font-bold">{activeSliders.temperature} °C</span>
            </div>
            <input
              type="range"
              min="40"
              max="110"
              step="0.5"
              value={activeSliders.temperature}
              onChange={(e) => updateSlider('temperature', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>Baseline ({currentMachine.temperature}°C)</span>
              <span>75°C (Warning)</span>
              <span>85°C+ (Critical)</span>
            </div>
          </div>

          {/* Vibration Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                <Activity className="w-3.5 h-3.5 text-blue-500" />
                <span>Vibration (mm/s)</span>
              </span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{activeSliders.vibration} mm/s</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="9.0"
              step="0.1"
              value={activeSliders.vibration}
              onChange={(e) => updateSlider('vibration', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>Baseline ({currentMachine.vibration} mm/s)</span>
              <span>3.5 mm/s (Warning)</span>
              <span>5.5 mm/s+ (Critical)</span>
            </div>
          </div>

          {/* Pressure Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                <Gauge className="w-3.5 h-3.5 text-cyan-500" />
                <span>Pressure (PSI)</span>
              </span>
              <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">{activeSliders.pressure} PSI</span>
            </div>
            <input
              type="range"
              min="60"
              max="140"
              step="1"
              value={activeSliders.pressure}
              onChange={(e) => updateSlider('pressure', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>Baseline ({currentMachine.pressure} PSI)</span>
              <span>115-125 PSI (Warning)</span>
              <span>&gt;130 PSI (High)</span>
            </div>
          </div>

          {/* Operating Hours Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5 text-purple-500" />
                <span>Operating Hours (hrs)</span>
              </span>
              <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{activeSliders.operatingHours} hrs</span>
            </div>
            <input
              type="range"
              min="100"
              max="6000"
              step="50"
              value={activeSliders.operatingHours}
              onChange={(e) => updateSlider('operatingHours', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>Baseline ({currentMachine.operating_hours} hrs)</span>
              <span>2,500 hrs</span>
              <span>4,000+ hrs</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center space-x-2 active:scale-95"
            >
              <span>{loading ? 'Computing Analysis...' : 'ANALYZE SCENARIO'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleApplyScenario}
              disabled={applying}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span>{applying ? 'Applying...' : 'APPLY TO MACHINE'}</span>
            </button>
          </div>

        </div>

        {/* Results Column */}
        <div className="space-y-6">
          {activeResult ? (
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 animate-fade-in shadow-sm">
              
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Simulation Results for {currentMachine.name}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">Machine ID: {currentMachine.id}</span>
                </div>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${riskBadgeStyles[activeResult.simulated_risk.risk_level] || riskBadgeStyles.LOW}`}>
                  {activeResult.simulated_risk.risk_level}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                
                {/* Baseline Risk */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Baseline Risk</div>
                  <div className="text-xl font-bold font-mono text-slate-700 dark:text-slate-300 mt-1">
                    {activeResult.baseline_risk.risk_score}/100
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500">{activeResult.baseline_risk.risk_level} ({activeResult.baseline_risk.status})</div>
                </div>

                {/* Simulated Risk */}
                <div className={`p-3 rounded-xl border ${activeResult.simulated_risk.risk_score > 60 ? 'bg-rose-500/10 border-rose-500/40' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'}`}>
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Simulated Risk</div>
                  <div className={`text-xl font-bold font-mono mt-1 ${activeResult.simulated_risk.risk_score > 60 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {activeResult.simulated_risk.risk_score}/100
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{activeResult.simulated_risk.risk_level} ({activeResult.simulated_risk.status})</div>
                </div>

              </div>

              {/* Assessment Explanation */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="font-semibold text-slate-900 dark:text-white">AI Scenario Assessment: </span>
                {activeResult.explanation}
              </div>

              {/* Contributing Risk Factors */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-300">Contributing Risk Factors:</div>
                <div className="space-y-1.5 text-xs">
                  {activeResult.simulated_risk.factors.map((f, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-start space-x-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-500 dark:text-slate-400 space-y-3 shadow-sm">
              <Sliders className="w-8 h-8 text-indigo-500 mx-auto opacity-80" />
              <div className="text-sm font-bold text-slate-900 dark:text-white">Ready for Scenario Simulation</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Adjust sensor telemetry sliders for <strong>{currentMachine.name} ({currentMachine.id})</strong> and click <strong>ANALYZE SCENARIO</strong> to run the AI risk engine.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
