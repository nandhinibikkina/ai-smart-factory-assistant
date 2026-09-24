import React, { useState } from 'react';
import { Sliders, RotateCcw, Activity, Thermometer, Gauge, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { analyzeScenario } from '../services/api';

export default function WhatIfSimulator() {
  const [temperature, setTemperature] = useState(70);
  const [vibration, setVibration] = useState(2.5);
  const [pressure, setPressure] = useState(100);
  const [operatingHours, setOperatingHours] = useState(1500);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const data = await analyzeScenario({
        temperature,
        vibration,
        pressure,
        operating_hours: operatingHours
      });
      if (data.success) {
        setResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTemperature(70);
    setVibration(2.5);
    setPressure(100);
    setOperatingHours(1500);
    setResult(null);
  };

  const riskBadgeStyles = {
    LOW: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    MEDIUM: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    HIGH: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40',
    CRITICAL: 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40 animate-pulse'
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-5xl text-slate-900 dark:text-white">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Interactive Risk Assessment Engine</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">What-If Scenario Risk Simulator</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Simulate arbitrary sensor parameters to predict risk score shifts and identify contributing physical failure factors</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Controls Column */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-500" />
              Sensor Telemetry Controls
            </h3>
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center space-x-1"
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
              <span className="font-mono text-orange-600 dark:text-orange-400">{temperature} °C</span>
            </div>
            <input
              type="range"
              min="40"
              max="110"
              step="0.5"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>40°C (Baseline)</span>
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
              <span className="font-mono text-blue-600 dark:text-blue-400">{vibration} mm/s</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="9.0"
              step="0.1"
              value={vibration}
              onChange={(e) => setVibration(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>0.5 mm/s (Normal)</span>
              <span>3.2 mm/s (Warning)</span>
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
              <span className="font-mono text-cyan-600 dark:text-cyan-400">{pressure} PSI</span>
            </div>
            <input
              type="range"
              min="60"
              max="140"
              step="1"
              value={pressure}
              onChange={(e) => setPressure(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>&lt;75 PSI (Low)</span>
              <span>90-110 PSI (Nominal)</span>
              <span>&gt;125 PSI (High)</span>
            </div>
          </div>

          {/* Operating Hours Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5 text-purple-500" />
                <span>Operating Hours (hrs)</span>
              </span>
              <span className="font-mono text-purple-600 dark:text-purple-400">{operatingHours} hrs</span>
            </div>
            <input
              type="range"
              min="100"
              max="6000"
              step="50"
              value={operatingHours}
              onChange={(e) => setOperatingHours(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>100 hrs</span>
              <span>2,500 hrs</span>
              <span>4,000+ hrs</span>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Computing Risk Analysis...' : 'ANALYZE SCENARIO'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Results Column */}
        <div className="space-y-6">
          {result ? (
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 animate-fade-in shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Simulation Analysis Results</h3>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${riskBadgeStyles[result.simulated_risk.risk_level]}`}>
                  {result.simulated_risk.risk_level}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Baseline Risk</div>
                  <div className="text-xl font-bold font-mono text-slate-700 dark:text-slate-300 mt-1">
                    {result.baseline_risk.risk_score}/100
                  </div>
                  <div className="text-[10px] text-slate-500">{result.baseline_risk.risk_level}</div>
                </div>

                <div className={`p-3 rounded-xl border ${result.simulated_risk.risk_score > 60 ? 'bg-rose-500/10 border-rose-500/40' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'}`}>
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Simulated Risk</div>
                  <div className={`text-xl font-bold font-mono mt-1 ${result.simulated_risk.risk_score > 60 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {result.simulated_risk.risk_score}/100
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{result.simulated_risk.risk_level}</div>
                </div>
              </div>

              {/* Assessment Explanation */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="font-semibold text-slate-900 dark:text-white">AI Scenario Assessment: </span>
                {result.explanation}
              </div>

              {/* Contributing Risk Factors */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-300">Contributing Risk Factors:</div>
                <div className="space-y-1.5 text-xs">
                  {result.simulated_risk.factors.map((f, idx) => (
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
                Adjust sensor telemetry sliders on the left and click <strong>ANALYZE SCENARIO</strong> to run the AI risk engine.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
