import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Cpu, Bell, BarChart3, Bot, Settings, Sliders, 
  Zap, Wrench, Layers, FileText, Sparkles, ShieldAlert, CreditCard 
} from 'lucide-react';

export default function Sidebar({ machineCounts = { normal: 0, warning: 0, critical: 0, total: 0 } }) {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { 
      to: '/machines', 
      label: 'Machines Fleet', 
      icon: Cpu,
      badge: machineCounts.critical > 0 ? machineCounts.critical : null,
      badgeColor: 'bg-rose-500 text-white'
    },
    { to: '/digital-twin', label: '2D Digital Twin', icon: Layers },
    { 
      to: '/alerts', 
      label: 'Alert Center', 
      icon: Bell,
      badge: machineCounts.critical + machineCounts.warning > 0 ? machineCounts.critical + machineCounts.warning : null,
      badgeColor: 'bg-amber-500 text-slate-900'
    },
    { 
      to: '/incidents', 
      label: 'AI Incident Investigation', 
      icon: ShieldAlert,
      badge: machineCounts.critical > 0 ? machineCounts.critical : null,
      badgeColor: 'bg-rose-500 text-white'
    },
    { to: '/simulator', label: 'What-If Simulator', icon: Sliders, highlight: true },
    { to: '/pricing', label: 'SaaS Pricing Plans', icon: CreditCard },
    { to: '/energy', label: 'Energy & Sustainability', icon: Zap },
    { to: '/maintenance', label: 'Maintenance Mgmt', icon: Wrench },
    { to: '/production', label: 'Production Analytics', icon: BarChart3 },
    { to: '/ai-assistant', label: 'AI Assistant', icon: Bot },
    { to: '/reports', label: 'Executive Reports', icon: FileText },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-white/90 dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 hidden md:flex min-h-[calc(100vh-61px)] transition-colors duration-200">
      <div className="p-3.5 space-y-5 overflow-y-auto">
        
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-3">
            Industrial Operations
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    } ${item.highlight ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/30 dark:to-purple-900/30 border border-indigo-500/20' : ''}`
                  }
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${item.highlight ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Fleet Health Indicator Box */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Fleet Status</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{machineCounts.total} Units</span>
          </div>
          
          <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-semibold">
            <div className="bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 dark:border-emerald-800/30 rounded-lg p-1 text-emerald-600 dark:text-emerald-400">
              <div className="text-sm font-mono">{machineCounts.normal}</div>
              <div className="text-[9px] uppercase font-medium">Normal</div>
            </div>
            <div className="bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/20 dark:border-amber-800/30 rounded-lg p-1 text-amber-600 dark:text-amber-400">
              <div className="text-sm font-mono">{machineCounts.warning}</div>
              <div className="text-[9px] uppercase font-medium">Warn</div>
            </div>
            <div className="bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/20 dark:border-rose-800/30 rounded-lg p-1 text-rose-600 dark:text-rose-400">
              <div className="text-sm font-mono">{machineCounts.critical}</div>
              <div className="text-[9px] uppercase font-medium">Critical</div>
            </div>
          </div>
        </div>

      </div>

      <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-2">
        <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        <span>AI Smart Factory v2.0 • Control Center</span>
      </div>
    </aside>
  );
}
