import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import FutureIntegrationModal from './components/FutureIntegrationModal';
import InjectAnomalyModal from './components/InjectAnomalyModal';

import Dashboard from './pages/Dashboard';
import Machines from './pages/Machines';
import MachineDetails from './pages/MachineDetails';
import Alerts from './pages/Alerts';
import Production from './pages/Production';
import AIAssistant from './pages/AIAssistant';
import Settings from './pages/Settings';

import WhatIfSimulator from './pages/WhatIfSimulator';
import Energy from './pages/Energy';
import Maintenance from './pages/Maintenance';
import DigitalTwin from './pages/DigitalTwin';
import Reports from './pages/Reports';
import Incidents from './pages/Incidents';
import Pricing from './pages/Pricing';

import { 
  fetchMachines, 
  fetchAlerts, 
  fetchProductionAnalytics, 
  triggerMachineAnomaly, 
  resetSingleMachineAnomaly,
  resetSimulation,
  resolveAlert,
  fetchDemoState,
  executeDemoStep,
  resetDemoScenario,
  checkBackendHealth
} from './services/api';

import { offlineStore } from './services/offlineStore';
import { WifiOff, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [machines, setMachines] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [productionSummary, setProductionSummary] = useState({});
  const [activityLogs, setActivityLogs] = useState([]);
  const [demoStep, setDemoStep] = useState(0);
  
  // Theme state persisted in localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('factory_theme');
    return saved !== 'light';
  });

  const [isIndiaJapanModalOpen, setIsIndiaJapanModalOpen] = useState(false);
  const [isAnomalyModalOpen, setIsAnomalyModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState('Just now');

  // Offline / Edge Mode State
  const [isOffline, setIsOffline] = useState(() => {
    return !navigator.onLine || offlineStore.getManualOfflineOverride();
  });
  const [syncNotice, setSyncNotice] = useState(null);

  // Network Event Listeners & Auto Connectivity Detection
  useEffect(() => {
    const handleOnline = async () => {
      if (!offlineStore.getManualOfflineOverride()) {
        const healthy = await checkBackendHealth();
        if (healthy) {
          setIsOffline(false);
          setSyncNotice('Connection restored. Local data is synchronized.');
          setTimeout(() => setSyncNotice(null), 5000);
        } else {
          setIsOffline(true);
        }
      }
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleToggleOffline = () => {
    const nextState = !isOffline;
    offlineStore.setManualOfflineOverride(nextState);
    setIsOffline(nextState);
    if (!nextState) {
      setSyncNotice('Connection restored. Local data is synchronized.');
      setTimeout(() => setSyncNotice(null), 5000);
    }
    loadData();
  };

  // Synchronize document root class with darkMode state
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('factory_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('factory_theme', 'light');
    }
  }, [darkMode]);

  // Load telemetry data from Flask API or Edge Store
  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [mRes, aRes, pRes, dRes] = await Promise.all([
        fetchMachines().catch(() => ({ machines: offlineStore.getMachines(), is_offline: true })),
        fetchAlerts().catch(() => ({ alerts: offlineStore.getAlerts(), is_offline: true })),
        fetchProductionAnalytics().catch(() => ({ ...offlineStore.getProductionSummary(), is_offline: true })),
        fetchDemoState().catch(() => ({ step: 0, is_offline: true }))
      ]);

      // Detect if backend fetch fell back to offline mode
      const detectedOffline = Boolean(
        !navigator.onLine || 
        offlineStore.getManualOfflineOverride() ||
        mRes.is_offline || 
        aRes.is_offline || 
        pRes.is_offline
      );

      if (detectedOffline !== isOffline) {
        setIsOffline(detectedOffline);
        if (!detectedOffline) {
          setSyncNotice('Connection restored. Local data is synchronized.');
          setTimeout(() => setSyncNotice(null), 5000);
        }
      }

      if (mRes.machines) setMachines(mRes.machines);
      if (aRes.alerts) setAlerts(aRes.alerts);
      if (pRes.summary) setProductionSummary(pRes.summary);
      if (pRes.activity_logs) setActivityLogs(pRes.activity_logs);
      if (dRes.step !== undefined) setDemoStep(dRes.step);

      setLastUpdatedTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to update factory telemetry:', err);
      setIsOffline(true);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Demo Stepper Handler
  const handleExecuteDemoStep = async (step) => {
    try {
      const res = await executeDemoStep(step);
      if (res.success) {
        setDemoStep(res.step);
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reset Demo Handler
  const handleResetDemo = async () => {
    try {
      await resetDemoScenario();
      setDemoStep(0);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Generic Multi-Machine Anomaly Trigger
  const handleTriggerAnomaly = async (machineId, anomalyType) => {
    try {
      await triggerMachineAnomaly(machineId, anomalyType);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Reset Single Machine Anomaly
  const handleResetSingleMachine = async (machineId) => {
    try {
      await resetSingleMachineAnomaly(machineId);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Resolve Alert Handler
  const handleResolveAlert = async (alertId) => {
    try {
      await resolveAlert(alertId);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Fleet Counts
  const machineCounts = {
    total: machines.length,
    normal: machines.filter(m => m.status === 'Normal').length,
    warning: machines.filter(m => m.status === 'Warning').length,
    critical: machines.filter(m => m.status === 'Critical').length,
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white transition-colors duration-200">
        
        {/* Reconnection Notification Banner */}
        {syncNotice && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-center space-x-2 shadow-md animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{syncNotice}</span>
          </div>
        )}

        {/* Offline Mode Banner */}
        {isOffline && (
          <div className="bg-amber-600 dark:bg-amber-700 text-white px-4 py-2 text-xs font-bold flex items-center justify-between border-b border-amber-500 shadow-sm">
            <div className="flex items-center space-x-2">
              <WifiOff className="w-4 h-4" />
              <span>OFFLINE MODE: Core factory monitoring is running locally.</span>
            </div>
            <button 
              onClick={handleToggleOffline}
              className="text-xs underline hover:text-amber-200 font-semibold"
            >
              Switch to Online
            </button>
          </div>
        )}

        {/* Top Header Navbar */}
        <Navbar
          onOpenAnomalyModal={() => setIsAnomalyModalOpen(true)}
          onResetDemo={handleResetDemo}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onOpenIndiaJapanModal={() => setIsIndiaJapanModalOpen(true)}
          isRefreshing={isRefreshing}
          healthStatus={productionSummary.health_status || 'Healthy'}
          healthScore={productionSummary.health_score || 84}
          lastUpdatedTime={lastUpdatedTime}
          demoStep={demoStep}
          onExecuteDemoStep={handleExecuteDemoStep}
          isOffline={isOffline}
          onToggleOffline={handleToggleOffline}
        />

        {/* Main Body Layout: Sidebar + Route Views */}
        <div className="flex-1 flex overflow-hidden">
          <Sidebar machineCounts={machineCounts} />

          <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
            <Routes>
              <Route
                path="/"
                element={
                  <Dashboard
                    machines={machines}
                    alerts={alerts}
                    productionSummary={productionSummary}
                    activityLogs={activityLogs}
                    onResolveAlert={handleResolveAlert}
                    onOpenAnomalyModal={() => setIsAnomalyModalOpen(true)}
                    onResetSingleMachine={handleResetSingleMachine}
                    isOffline={isOffline}
                  />
                }
              />
              <Route
                path="/machines"
                element={
                  <Machines 
                    machines={machines} 
                    onResetSingleMachine={handleResetSingleMachine}
                  />
                }
              />
              <Route
                path="/machines/:id"
                element={
                  <MachineDetails 
                    machines={machines}
                    onResolveAlert={handleResolveAlert} 
                    onResetSingleMachine={handleResetSingleMachine}
                    onOpenAnomalyModal={() => setIsAnomalyModalOpen(true)}
                  />
                }
              />
              <Route
                path="/digital-twin"
                element={<DigitalTwin machines={machines} />}
              />
              <Route
                path="/alerts"
                element={<Alerts alerts={alerts} onResolveAlert={handleResolveAlert} />}
              />
              <Route
                path="/incidents"
                element={<Incidents machines={machines} onRefreshData={loadData} />}
              />
              <Route
                path="/simulator"
                element={<WhatIfSimulator machines={machines} onRefreshData={loadData} />}
              />
              <Route
                path="/pricing"
                element={<Pricing />}
              />
              <Route
                path="/energy"
                element={<Energy />}
              />
              <Route
                path="/maintenance"
                element={<Maintenance />}
              />
              <Route
                path="/production"
                element={<Production />}
              />
              <Route
                path="/ai-assistant"
                element={<AIAssistant />}
              />
              <Route
                path="/reports"
                element={<Reports machines={machines} alerts={alerts} productionSummary={productionSummary} />}
              />
              <Route
                path="/settings"
                element={
                  <Settings
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    onRefreshData={loadData}
                  />
                }
              />
            </Routes>
          </main>
        </div>

        {/* Universal Multi-Machine Anomaly Injection Modal */}
        <InjectAnomalyModal
          isOpen={isAnomalyModalOpen}
          onClose={() => setIsAnomalyModalOpen(false)}
          onInject={handleTriggerAnomaly}
          machines={machines}
        />

        {/* India-Japan Innovation Showcase Modal */}
        <FutureIntegrationModal
          isOpen={isIndiaJapanModalOpen}
          onClose={() => setIsIndiaJapanModalOpen(false)}
        />

      </div>
    </Router>
  );
}
