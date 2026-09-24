import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Thermometer, Activity, Gauge, Clock, Wrench, AlertTriangle, CheckCircle2, Sparkles, RefreshCw, Zap, RotateCcw, TrendingDown } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { fetchMachineDetails } from '../services/api';
import { calculateMachineProductionLoss } from '../services/costCalculator';
import AlertCard from '../components/AlertCard';

export default function MachineDetails({ machines = [], onResolveAlert, onResetSingleMachine, onOpenAnomalyModal }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMachineDetails(id);
      if (res.success) {
        setData(res);
      } else {
        setError(res.error || 'Failed to load details');
      }
    } catch (err) {
      setError('Unable to reach machine API endpoint');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id, machines]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 dark:text-slate-400 space-x-2">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
        <span className="text-xs font-semibold">Loading Machine Telemetry & Risk Diagnosis...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-4 text-slate-900 dark:text-white">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
        <div className="text-sm font-bold">Machine Not Found</div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{error || "Could not retrieve telemetry."}</p>
        <button
          onClick={() => navigate('/machines')}
          className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
        >
          Back to Machine Fleet
        </button>
      </div>
    );
  }

  const machine = data.machine || machines.find(m => m.id === id || m.id?.toLowerCase() === (id || '').toLowerCase());

  if (!machine) {
    return (
      <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-4 text-slate-900 dark:text-white">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
        <div className="text-sm font-bold">Machine Data Unavailable</div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Referenced machine ({id}) could not be located in current telemetry database.</p>
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => navigate('/machines')}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
          >
            Back to Machine Fleet
          </button>
          <button
            onClick={() => navigate('/incidents')}
            className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl"
          >
            Back to AI Incidents
          </button>
        </div>
      </div>
    );
  }

  const rawDiag = data.ai_diagnosis;
  const ai_diagnosis = rawDiag || {
    risk_level: machine.status === 'Critical' ? 'CRITICAL RISK' : machine.status === 'Warning' ? 'ATTENTION REQUIRED' : 'NORMAL OPERATIONAL STATUS',
    reasons: [
      `Temperature (${machine.temperature}°C) and vibration (${machine.vibration} mm/s) evaluated.`,
      `Operating pressure (${machine.pressure} PSI) and total runtime (${machine.operating_hours?.toLocaleString()} hrs) verified.`
    ],
    trend_warning: machine.temperature > 75 || machine.vibration > 3.5
  };

  const rawRecs = data.recommendations;
  const recommendations = Array.isArray(rawRecs) && rawRecs.length > 0 
    ? rawRecs 
    : [
        `Inspect primary drive shaft bearings and thermal cooling loop for ${machine.name}.`,
        `Calibrate pneumatic pressure regulator and check hydraulic seals.`,
        `Schedule preventive maintenance work order according to shift target.`
      ];

  const alerts = data.alerts || [];
  const telemetry_history = data.telemetry_history || [];

  const statusStyles = {
    Normal: { badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
    Warning: { badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
    Critical: { badgeBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/40 animate-pulse' }
  };
  const badgeStyle = statusStyles[machine.status]?.badgeBg || statusStyles.Normal.badgeBg;

  // Format historical chart data
  const chartData = telemetry_history.map(t => ({
    time: t.timestamp ? t.timestamp.split(' ')[1] || t.timestamp : t.time || '',
    temp: t.temperature,
    vibration: t.vibration,
    pressure: t.pressure,
    efficiency: t.efficiency || 90.0
  }));

  return (
    <div className="space-y-6 animate-fade-in pb-12 text-slate-900 dark:text-white">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">{machine.id} • {machine.type}</span>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${badgeStyle}`}>
                {machine.status} (Risk: {machine.risk_score}/100)
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{machine.name}</h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {machine.status !== 'Normal' && onResetSingleMachine && (
            <button
              onClick={async () => { await onResetSingleMachine(machine.id); loadDetails(); }}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Anomaly</span>
            </button>
          )}

          <button
            onClick={onOpenAnomalyModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md transition"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Inject Anomaly</span>
          </button>
        </div>
      </div>

      {/* Sensor Gauges & Risk Score Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        
        {/* Risk Score */}
        <div className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border ${machine.risk_score > 60 ? 'border-rose-500/40 bg-rose-500/5 dark:bg-rose-950/20' : 'border-slate-200 dark:border-slate-800'}`}>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Risk Score</span>
            <AlertTriangle className={`w-4 h-4 ${machine.risk_score > 60 ? 'text-rose-500' : 'text-emerald-500'}`} />
          </div>
          <div className={`text-2xl font-mono font-bold ${machine.risk_score > 60 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {machine.risk_score} <span className="text-xs text-slate-500 dark:text-slate-400">/100</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Level: <strong>{ai_diagnosis.risk_level || machine.status.toUpperCase()}</strong></p>
        </div>

        {/* Temperature */}
        <div className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border ${machine.temperature > 85 ? 'border-rose-500/40 bg-rose-500/5 dark:bg-rose-950/20' : 'border-slate-200 dark:border-slate-800'}`}>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Temperature</span>
            <Thermometer className="w-4 h-4 text-orange-500" />
          </div>
          <div className={`text-2xl font-mono font-bold ${machine.temperature > 85 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
            {machine.temperature} °C
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Nominal: 50 - 75 °C</p>
        </div>

        {/* Vibration */}
        <div className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border ${machine.vibration > 5.5 ? 'border-rose-500/40 bg-rose-500/5 dark:bg-rose-950/20' : 'border-slate-200 dark:border-slate-800'}`}>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Vibration</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className={`text-2xl font-mono font-bold ${machine.vibration > 5.5 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
            {machine.vibration} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">mm/s</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Nominal: 0.5 - 3.2 mm/s</p>
        </div>

        {/* Pressure */}
        <div className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border ${machine.pressure < 75 || machine.pressure > 125 ? 'border-amber-500/40' : 'border-slate-200 dark:border-slate-800'}`}>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pressure</span>
            <Gauge className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
            {machine.pressure} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">PSI</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Nominal: 90 - 110 PSI</p>
        </div>

        {/* Efficiency & Operating Hours */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Efficiency</span>
            <Zap className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {machine.efficiency || 90.0}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Total Hours: {machine.operating_hours.toLocaleString()} hrs</p>
        </div>

      </div>

      {/* FEATURE 2: Estimated Potential Production Loss Banner */}
      {(() => {
        const lossData = calculateMachineProductionLoss(machine);
        return (
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Estimated Potential Production Loss & Financial Impact</h3>
              </div>
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full border border-rose-500/30">
                {machine.status !== 'Normal' ? 'High Financial Risk' : 'Optimal Baseline'}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] uppercase text-slate-400 font-sans">Expected Downtime</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{lossData.downtime_hrs} hrs</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] uppercase text-slate-400 font-sans">Production Rate</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{lossData.production_rate} units/hr</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] uppercase text-slate-400 font-sans">Value Per Unit</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">₹{lossData.unit_value}</div>
              </div>

              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
                <div className="text-[10px] uppercase text-rose-500 font-sans font-bold">Estimated Potential Loss</div>
                <div className="text-base font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">{lossData.formatted_loss}</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1">
              Note: {lossData.disclaimer}
            </div>
          </div>
        );
      })()}

      {/* Why is this machine at risk? Section */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-slate-50 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Why is this machine at risk?
          </h3>
          <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
            Score: {machine.risk_score}/100 ({ai_diagnosis.risk_level || machine.status.toUpperCase()})
          </span>
        </div>

        {ai_diagnosis.trend_warning && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold">
            ⚠ Increasing Trend Detected: Continuous temperature and vibration drift recorded over recent telemetry snapshots.
          </div>
        )}

        <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
          <div className="font-semibold text-slate-900 dark:text-slate-200">Identified Physical Risk Factors:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {ai_diagnosis.reasons.map((reason, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 flex items-start space-x-2">
                <span className="text-amber-500 font-bold">✓</span>
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
          <span className="font-semibold text-slate-900 dark:text-white">AI Diagnostic Assessment: </span>
          "{machine.name} is currently at elevated risk ({machine.risk_score}/100) because multiple operating sensor parameters are outside their normal baseline range."
        </div>
      </div>

      {/* Historical Trend Line Charts */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Historical Telemetry & Efficiency Trends</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Historical trend lines: Temperature (°C), Vibration (mm/s), Pressure (PSI) & Efficiency (%)</p>
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
              />
              <Line type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#f97316" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="vibration" name="Vibration (mm/s)" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="pressure" name="Pressure (PSI)" stroke="#06b6d4" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="efficiency" name="Efficiency (%)" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Maintenance Action Plan */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
        <div className="flex items-center space-x-2 text-amber-500">
          <Wrench className="w-4 h-4" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">AI Maintenance Recommendation Plan</h3>
        </div>

        <div className="space-y-2 text-xs">
          {recommendations.map((rec, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 flex items-start space-x-2.5">
              <span className="font-bold text-amber-500 shrink-0">{i + 1}.</span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Machine Alerts Log */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Alert History for {machine.name}</h3>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-xs text-slate-400 py-4 text-center">No alerts logged for this machine.</div>
          ) : (
            alerts.map(a => <AlertCard key={a.id} alert={a} onResolve={onResolveAlert} />)
          )}
        </div>
      </div>

    </div>
  );
}
