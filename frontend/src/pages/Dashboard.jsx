import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cpu, CheckCircle2, AlertTriangle, AlertCircle, PackageCheck, Zap, 
  ArrowRight, HeartPulse, Clock, Activity, Layers, ShieldAlert, Database, 
  TrendingDown, Sliders, DollarSign, ArrowUpRight, HelpCircle, CheckSquare 
} from 'lucide-react';
import StatCard from '../components/StatCard';
import MachineCard from '../components/MachineCard';
import AlertCard from '../components/AlertCard';
import CostConfigModal from '../components/CostConfigModal';
import { calculateFleetTotalPotentialLoss, calculateMachineProductionLoss, getCostAssumptions } from '../services/costCalculator';

export default function Dashboard({ 
  machines = [], 
  alerts = [], 
  productionSummary = {}, 
  activityLogs = [],
  onResolveAlert,
  onOpenAnomalyModal,
  onResetSingleMachine,
  isOffline = false
}) {
  const navigate = useNavigate();
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [costAssumptions, setCostAssumptions] = useState(getCostAssumptions);

  const total = machines.length;
  const normal = machines.filter(m => m.status === 'Normal').length;
  const warning = machines.filter(m => m.status === 'Warning').length;
  const critical = machines.filter(m => m.status === 'Critical').length;
  const activeAlerts = alerts.filter(a => a.status === 'Active');

  const healthScore = productionSummary.health_score || 84;
  const healthStatus = productionSummary.health_status || (critical > 0 ? 'Critical' : warning > 0 ? 'Attention Required' : 'Healthy');

  // Calculate fleet financial potential loss
  const fleetLossData = calculateFleetTotalPotentialLoss(machines);
  const highRiskMachines = machines.filter(m => m.status !== 'Normal');

  const healthBadgeStyles = {
    Healthy: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    'Attention Required': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    Critical: 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40 animate-pulse'
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 text-slate-900 dark:text-white">
      
      {/* Top Overall Factory Health Indicator Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-colors duration-200">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white shadow-md shadow-blue-500/20">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-bold text-base text-slate-900 dark:text-white">Overall Factory Health</h2>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${healthBadgeStyles[healthStatus]}`}>
                {healthStatus.toUpperCase()} ({healthScore}/100)
              </span>

              {/* Edge Processing Badge */}
              <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                ⚡ EDGE PROCESSING ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-2">
              <span>Integrated OEE Efficiency, Machine Risk Scores, Active Alerts, & Financial Impact Modeling</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCostModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 font-bold text-xs rounded-xl transition flex items-center space-x-1.5"
            title="Configure production rate & unit value assumptions"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Cost Assumptions</span>
          </button>
          <button
            onClick={() => navigate('/incidents')}
            className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold text-xs rounded-xl transition flex items-center space-x-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>AI Incidents ({warning + critical})</span>
          </button>
          <button
            onClick={() => navigate('/digital-twin')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center space-x-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Digital Twin</span>
          </button>
        </div>
      </div>

      {/* Top 8 KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard title="Total Units" value={total} subtitle="Fleet inventory" icon={Cpu} />
        <StatCard title="Normal" value={normal} subtitle="Optimal metrics" icon={CheckCircle2} />
        <StatCard title="Warning" value={warning} subtitle="Needs inspection" icon={AlertTriangle} />
        <StatCard title="Critical" value={critical} subtitle="Urgent action" icon={AlertCircle} />
        <StatCard title="Production" value={`${(productionSummary.produced_output || 5140).toLocaleString()}`} subtitle={`Target: ${(productionSummary.target_output || 5770).toLocaleString()}`} icon={PackageCheck} />
        <StatCard title="Efficiency" value={`${productionSummary.efficiency || 89.1}%`} subtitle="OEE Performance" icon={Zap} />
        <StatCard title="Potential Loss" value={fleetLossData.formatted_total_loss} subtitle={`Downtime: ${fleetLossData.total_downtime_hrs} hrs`} icon={TrendingDown} />
        <StatCard title="Est. Downtime" value={`${productionSummary.downtime_hrs || 1.8} hrs`} subtitle="Shift loss" icon={Clock} />
      </div>

      {/* FEATURE 2: VISUAL ROI VALUE CHAIN & ESTIMATED POTENTIAL PRODUCTION LOSS PANEL */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-indigo-500/30 space-y-4 shadow-lg">
        
        {/* Banner Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-indigo-500/20 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-400">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white">Estimated Potential Production Loss & Cost Impact</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {highRiskMachines.length} High-Risk Unit(s)
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Calculated using configured rates: <span className="font-mono font-bold text-amber-300">{costAssumptions.production_rate} units/hr</span> @ <span className="font-mono font-bold text-amber-300">₹{costAssumptions.unit_value}/unit</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCostModalOpen(true)}
              className="px-3 py-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl transition flex items-center space-x-1"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Configure Rates</span>
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition"
            >
              View SaaS Plans
            </button>
          </div>
        </div>

        {/* Visual ROI Value Chain Flow Banner */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Predictive Value Chain Pipeline: Early Detection to Cost Savings
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
            
            {/* Step 1: Risk Detected */}
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-indigo-500/30 flex flex-col justify-between space-y-1">
              <div className="text-[10px] uppercase text-indigo-400 font-bold font-sans">1. Risk Detected</div>
              <div className="font-bold text-sm text-amber-400">
                {critical > 0 ? `${critical} Critical Unit` : warning > 0 ? `${warning} Warning Unit` : 'Fleet Optimal'}
              </div>
              <div className="text-[10px] text-slate-400 font-sans">Edge ML sensor anomaly alert</div>
            </div>

            {/* Step 2: Downtime & Rate */}
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-indigo-500/30 flex flex-col justify-between space-y-1">
              <div className="text-[10px] uppercase text-indigo-400 font-bold font-sans">2. Downtime & Rate</div>
              <div className="font-bold text-sm text-white">
                {fleetLossData.total_downtime_hrs} hrs × {costAssumptions.production_rate} u/h
              </div>
              <div className="text-[10px] text-slate-400 font-sans font-mono">Valuation: ₹{costAssumptions.unit_value}/unit</div>
            </div>

            {/* Step 3: Estimated Potential Loss */}
            <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex flex-col justify-between space-y-1">
              <div className="text-[10px] uppercase text-rose-400 font-bold font-sans">3. Potential Loss</div>
              <div className="font-extrabold text-base text-rose-400">
                {fleetLossData.formatted_total_loss}
              </div>
              <div className="text-[10px] text-rose-300 font-sans">Shift production impact</div>
            </div>

            {/* Step 4: Preventive Action & Savings */}
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col justify-between space-y-1">
              <div className="text-[10px] uppercase text-emerald-400 font-bold font-sans">4. Preventive ROI</div>
              <div className="font-bold text-sm text-emerald-400 flex items-center space-x-1">
                <CheckSquare className="w-4 h-4" />
                <span>Save {fleetLossData.formatted_total_loss}</span>
              </div>
              <div className="text-[10px] text-emerald-300 font-sans">Avoid breakdown downtime</div>
            </div>

          </div>
        </div>

        {/* Dynamic Calculation Breakdown Details for High-Risk Machine */}
        {highRiskMachines.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-indigo-500/20 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold">
              <span className="text-amber-400">Calculated Impact Breakdown: {highRiskMachines[0].name} ({highRiskMachines[0].status})</span>
              <span className="font-mono text-rose-400 font-extrabold text-sm">
                {calculateMachineProductionLoss(highRiskMachines[0]).formatted_loss}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] text-slate-300">
              <div>
                <span className="text-slate-400">Expected Downtime: </span>
                <strong className="text-white">{calculateMachineProductionLoss(highRiskMachines[0]).downtime_hrs} hrs</strong>
              </div>
              <div>
                <span className="text-slate-400">Production Rate: </span>
                <strong className="text-white">{costAssumptions.production_rate} units/hr</strong>
              </div>
              <div>
                <span className="text-slate-400">Value per Unit: </span>
                <strong className="text-white">₹{costAssumptions.unit_value}</strong>
              </div>
              <div>
                <span className="text-slate-400">Estimated Potential Loss: </span>
                <strong className="text-rose-400">{calculateMachineProductionLoss(highRiskMachines[0]).formatted_loss}</strong>
              </div>
            </div>

            {/* Required Disclaimer Note */}
            <div className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800 flex items-center space-x-1">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Note: Estimated value based on configured production and downtime assumptions.</span>
            </div>
          </div>
        )}

      </div>

      {/* Main Grid: Machine Fleet (2/3) + Activity Feed & Active Alerts (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Machine Monitoring Fleet (6 Machines) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Machine Monitoring Fleet
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({machines.length} active units)</span>
                </h2>
                
                {/* Simulated / Local Sensor Data Badge */}
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1">
                  <Database className="w-3 h-3 text-blue-500" />
                  Simulated / Local Sensor Data
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time sensor telemetry: Temp, Vibration, Pressure, Hours & Risk Score</p>
            </div>

            <button
              onClick={() => navigate('/machines')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1 shrink-0"
            >
              <span>View Fleet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {machines.map(m => (
              <MachineCard key={m.id} machine={m} onResetSingleMachine={onResetSingleMachine} />
            ))}
          </div>
        </div>

        {/* Right Side Panel: Live Activity Feed & Active Alerts */}
        <div className="space-y-6">
          
          {/* Active Alerts Panel */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                Control Center Alerts
                <span className="px-2 py-0.5 text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-full">
                  {activeAlerts.length}
                </span>
              </h3>
              <button onClick={() => navigate('/alerts')} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                View All
              </button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">No active maintenance alerts.</div>
              ) : (
                alerts.slice(0, 3).map(alert => (
                  <AlertCard key={alert.id} alert={alert} onResolve={onResolveAlert} />
                ))
              )}
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <Activity className="w-4 h-4 text-blue-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Live Activity Feed</h3>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto text-xs">
              {activityLogs.length === 0 ? (
                <div className="text-slate-400 text-center py-3">No activity logged yet.</div>
              ) : (
                activityLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{log.machine_name || 'System'}</span>
                      <span className="font-mono">{log.timestamp ? log.timestamp.split(' ')[1] || log.timestamp : ''}</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 leading-tight text-[11px]">{log.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Cost Assumptions Configuration Modal */}
      <CostConfigModal
        isOpen={isCostModalOpen}
        onClose={() => setIsCostModalOpen(false)}
        onSave={(updated) => setCostAssumptions(updated)}
      />

    </div>
  );
}
