import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, Wrench, Clock, ShieldAlert } from 'lucide-react';

export default function AlertCard({ alert, onResolve }) {
  const navigate = useNavigate();
  const isCritical = alert.severity === 'Critical';
  const isWarning = alert.severity === 'Warning';
  const isResolved = alert.status === 'Resolved';

  const severityStyles = {
    Critical: {
      badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
      icon: AlertCircle,
      iconColor: 'text-rose-500',
      border: 'border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/10'
    },
    Warning: {
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      border: 'border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/10'
    },
    Info: {
      badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
      icon: Info,
      iconColor: 'text-blue-500',
      border: 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60'
    }
  };

  const style = severityStyles[alert.severity] || severityStyles.Info;
  const Icon = style.icon;

  return (
    <div className={`p-4 rounded-2xl border transition-all ${isResolved ? 'opacity-60 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40' : style.border}`}>
      <div className="flex items-start justify-between gap-3">
        
        {/* Left Severity Icon + Content */}
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0 mt-0.5 shadow-sm">
            <Icon className={`w-4 h-4 ${style.iconColor}`} />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">{alert.machine_name}</span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${style.badge}`}>
                {alert.severity}
              </span>
              {alert.title && alert.title !== alert.severity && (
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">• {alert.title}</span>
              )}
              {isResolved && (
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700">
                  Resolved
                </span>
              )}
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {alert.description}
            </p>

            {alert.recommendation && (
              <div className="flex items-start space-x-1.5 pt-1.5 text-xs text-amber-700 dark:text-amber-300 font-medium">
                <Wrench className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>Recommendation: {alert.recommendation}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right side: Timestamp & Resolve/Investigate Action */}
        <div className="flex flex-col items-end justify-between shrink-0 space-y-2">
          <div className="flex items-center space-x-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{alert.timestamp ? alert.timestamp.split(' ')[1] || alert.timestamp : 'Just now'}</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => navigate(`/incidents?machine=${alert.machine_id}`)}
              className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-lg transition active:scale-95"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Investigate</span>
            </button>

            {!isResolved && onResolve && (
              <button
                onClick={() => onResolve(alert.id)}
                className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 rounded-lg transition active:scale-95"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Resolve</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
