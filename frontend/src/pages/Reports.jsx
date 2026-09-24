import React, { useState } from 'react';
import { FileText, Printer, Download, CheckCircle2, AlertTriangle, AlertCircle, Zap, Cpu, Sparkles } from 'lucide-react';

export default function Reports({ machines = [], alerts = [], productionSummary = {} }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportReady, setReportReady] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  const criticals = machines.filter(m => m.status === 'Critical');
  const warnings = machines.filter(m => m.status === 'Warning');
  const normals = machines.filter(m => m.status === 'Normal');

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-5xl">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Executive Factory Operations Report
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">Comprehensive summary of factory health, risk metrics, active alerts, production, energy, and maintenance recommendations</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-6 print:bg-white print:text-black print:p-0 print:border-none print:shadow-none shadow-sm">
        
        {/* Document Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 print:border-gray-300 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl print:bg-blue-700">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white print:text-black">AI Smart Factory Control Center</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 print:text-gray-600">Executive Predictive Maintenance & Operations Summary</p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-600 dark:text-slate-400 print:text-gray-600 font-mono">
            <div>Date: {new Date().toLocaleDateString()}</div>
            <div>Shift: Day Shift (Operational)</div>
          </div>
        </div>

        {/* Executive Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl print:bg-gray-100 print:border-gray-300">
            <div className="text-slate-600 dark:text-slate-400 print:text-gray-600 uppercase font-semibold">Factory Health</div>
            <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 print:text-emerald-700 mt-0.5">
              {productionSummary.health_score || 84}/100
            </div>
            <div className="text-[10px] text-slate-500 print:text-gray-500">{productionSummary.health_status || 'Healthy'}</div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl print:bg-gray-100 print:border-gray-300">
            <div className="text-slate-600 dark:text-slate-400 print:text-gray-600 uppercase font-semibold">Total Output</div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white print:text-black mt-0.5">
              {(productionSummary.produced_output || 5140).toLocaleString()} units
            </div>
            <div className="text-[10px] text-slate-500 print:text-gray-500">Target: 5,770 units</div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl print:bg-gray-100 print:border-gray-300">
            <div className="text-slate-600 dark:text-slate-400 print:text-gray-600 uppercase font-semibold">OEE Efficiency</div>
            <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 print:text-blue-700 mt-0.5">
              {productionSummary.efficiency || 89.1}%
            </div>
            <div className="text-[10px] text-slate-500 print:text-gray-500">Optimal: &gt; 85%</div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl print:bg-gray-100 print:border-gray-300">
            <div className="text-slate-600 dark:text-slate-400 print:text-gray-600 uppercase font-semibold">Fleet Status</div>
            <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 print:text-amber-700 mt-0.5">
              {normals.length} N / {warnings.length} W / {criticals.length} C
            </div>
            <div className="text-[10px] text-slate-500 print:text-gray-500">Total {machines.length} Units</div>
          </div>
        </div>

        {/* Machine Status Fleet Summary Table */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white print:text-black border-b border-slate-200 dark:border-slate-800 print:border-gray-300 pb-2">
            Machine Fleet Telemetry Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700 dark:text-slate-300 print:text-gray-800">
              <thead className="text-[11px] uppercase bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 print:bg-gray-200 print:text-gray-700">
                <tr>
                  <th className="p-2.5">Machine Name</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Risk Score</th>
                  <th className="p-2.5">Temp (°C)</th>
                  <th className="p-2.5">Vib (mm/s)</th>
                  <th className="p-2.5">Pressure</th>
                  <th className="p-2.5">Efficiency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 print:divide-gray-300">
                {machines.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                    <td className="p-2.5 font-bold text-slate-900 dark:text-white print:text-black">{m.name}</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-400 print:text-gray-600">{m.type}</td>
                    <td className="p-2.5 font-bold">
                      <span className={m.status === 'Critical' ? 'text-rose-600 dark:text-rose-400' : m.status === 'Warning' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
                        {m.status}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono">{m.risk_score}/100</td>
                    <td className="p-2.5 font-mono">{m.temperature}°C</td>
                    <td className="p-2.5 font-mono">{m.vibration} mm/s</td>
                    <td className="p-2.5 font-mono">{m.pressure} PSI</td>
                    <td className="p-2.5 font-mono">{m.efficiency}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Maintenance Action Plan Section */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white print:text-black border-b border-slate-200 dark:border-slate-800 print:border-gray-300 pb-2">
            Priority Maintenance & AI Recommendations
          </h3>
          <div className="space-y-2 text-xs">
            {criticals.concat(warnings).map(m => (
              <div key={m.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 print:bg-gray-100 print:border-gray-300">
                <div className="font-bold text-slate-900 dark:text-white print:text-black">{m.name} ({m.status} - Risk: {m.risk_score}/100)</div>
                <div className="text-slate-600 dark:text-slate-300 print:text-gray-700 mt-1">
                  • Inspect cooling liquid loop, verify heat exchanger pressure, and check bearing assemblies.
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 print:border-gray-300 text-[11px] text-slate-500 print:text-gray-500 flex justify-between">
          <span>AI Smart Factory Assistant Report Generator</span>
          <span>Approved for Hackathon Demo Presentation</span>
        </div>

      </div>

    </div>
  );
}
