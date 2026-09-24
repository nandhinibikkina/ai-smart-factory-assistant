import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, RefreshCw, AlertTriangle, Globe, Sun, Moon, Play, RotateCcw, Clock, HeartPulse, Zap, CreditCard } from 'lucide-react';

export default function Navbar({ 
  onOpenAnomalyModal, 
  onResetDemo, 
  darkMode, 
  setDarkMode, 
  onOpenIndiaJapanModal,
  isRefreshing,
  healthStatus = 'Healthy',
  healthScore = 84,
  lastUpdatedTime = 'Just now',
  demoStep = 0,
  onExecuteDemoStep,
  isOffline = false,
  onToggleOffline
}) {
  const navigate = useNavigate();

  const healthBadgeStyles = {
    Healthy: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    'Attention Required': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    Critical: 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40 animate-pulse'
  };

  const healthBadge = healthBadgeStyles[healthStatus] || healthBadgeStyles.Healthy;

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-3 transition-colors duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Brand & Factory Health Indicator */}
        <div className="flex items-center space-x-3.5">
          <div 
            onClick={() => navigate('/')} 
            className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 text-white cursor-pointer hover:opacity-90 transition"
          >
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 
                onClick={() => navigate('/')}
                className="font-bold text-lg tracking-tight text-slate-900 dark:text-white font-sans cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                AI Smart Factory Control Center
              </h1>
              
              {/* Online / Offline Status Badge */}
              <button
                onClick={onToggleOffline}
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border transition ${
                  isOffline
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                }`}
                title="Click to toggle between Online and Offline/Edge Mode"
              >
                {isOffline ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
                    OFFLINE MODE
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
                    ONLINE
                  </>
                )}
              </button>

              {/* Edge Processing Indicator */}
              <div 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 group relative cursor-help"
                title="Machine risk analysis is being processed locally."
              >
                <Zap className="w-3 h-3 mr-1 text-indigo-500" />
                <span>EDGE PROCESSING ACTIVE</span>
              </div>

            </div>
            
            <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>Industry 4.0 Predictive Maintenance</span>
              <span>•</span>
              <span className="flex items-center space-x-1 font-mono text-[11px]">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Updated: {lastUpdatedTime}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Hackathon Demo Stepper & Universal Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* SaaS Pricing Link */}
          <button
            onClick={() => navigate('/pricing')}
            className="flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 rounded-xl transition shadow-sm"
            title="View SaaS Package Pricing Tiers"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>SaaS Pricing</span>
          </button>

          {/* Universal "Inject Anomaly" Button */}
          <button
            onClick={onOpenAnomalyModal}
            className="flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition shadow-md shadow-rose-600/20 active:scale-95"
            title="Inject Anomaly into any target machine"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Inject Anomaly</span>
          </button>

          {/* Demo Stepper Widget */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2.5 shrink-0">
              Demo Step {demoStep}/7:
            </span>
            <button
              onClick={() => onExecuteDemoStep(demoStep < 7 ? demoStep + 1 : 0)}
              className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition active:scale-95"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{demoStep === 0 ? 'Start Demo' : demoStep === 7 ? 'Restart' : 'Next Step'}</span>
            </button>
            <button
              onClick={onResetDemo}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white ml-1"
              title="Reset Demo Scenario"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* India-Japan Innovation Vision */}
          <button
            onClick={onOpenIndiaJapanModal}
            className="flex items-center space-x-1 text-xs font-medium px-2.5 py-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-xl hover:bg-amber-500/20 transition"
          >
            <Globe className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">India-Japan Vision</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition shadow-sm"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

        </div>

      </div>
    </header>
  );
}
