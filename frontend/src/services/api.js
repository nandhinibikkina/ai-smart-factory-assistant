import { offlineStore } from './offlineStore';

const API_BASE = '/api';

// Helper to check browser & manual override state
export function isOfflineActive() {
  return !navigator.onLine || offlineStore.getManualOfflineOverride();
}

// Health check endpoint
export async function checkBackendHealth() {
  if (isOfflineActive()) return false;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function fetchMachines() {
  if (isOfflineActive()) {
    return { machines: offlineStore.getMachines(), is_offline: true };
  }
  try {
    const res = await fetch(`${API_BASE}/machines`);
    if (!res.ok) throw new Error('Failed to fetch machines');
    const data = await res.json();
    return { ...data, is_offline: false };
  } catch (err) {
    console.warn('Network API unreachable. Falling back to Edge Store:', err.message);
    return { machines: offlineStore.getMachines(), is_offline: true };
  }
}

export async function fetchMachineDetails(machineId) {
  if (isOfflineActive()) {
    return { ...offlineStore.getMachineDetails(machineId), is_offline: true };
  }
  try {
    const res = await fetch(`${API_BASE}/machines/${machineId}`);
    if (!res.ok) throw new Error(`Failed to fetch machine ${machineId}`);
    const data = await res.json();
    return { ...data, is_offline: false };
  } catch (err) {
    console.warn('Network API unreachable. Falling back to Edge Store:', err.message);
    return { ...offlineStore.getMachineDetails(machineId), is_offline: true };
  }
}

export async function triggerMachineAnomaly(machineId = 'MCH-003', anomalyType = 'Combined Anomaly') {
  if (isOfflineActive()) {
    return { ...offlineStore.triggerAnomaly(machineId, anomalyType), is_offline: true };
  }
  try {
    const res = await fetch(`${API_BASE}/machines/trigger-anomaly`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ machine_id: machineId, anomaly_type: anomalyType })
    });
    if (!res.ok) throw new Error('Failed to trigger anomaly');
    const data = await res.json();
    return { ...data, is_offline: false };
  } catch (err) {
    console.warn('Network API unreachable. Falling back to Edge Store:', err.message);
    return { ...offlineStore.triggerAnomaly(machineId, anomalyType), is_offline: true };
  }
}

export async function resetSingleMachineAnomaly(machineId) {
  if (isOfflineActive()) {
    return { ...offlineStore.resetSingleMachine(machineId), is_offline: true };
  }
  try {
    const res = await fetch(`${API_BASE}/machines/${machineId}/reset-anomaly`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`Failed to reset machine ${machineId}`);
    const data = await res.json();
    return { ...data, is_offline: false };
  } catch (err) {
    console.warn('Network API unreachable. Falling back to Edge Store:', err.message);
    return { ...offlineStore.resetSingleMachine(machineId), is_offline: true };
  }
}

export async function resetSimulation() {
  if (isOfflineActive()) {
    return { ...offlineStore.resetSimulation(), is_offline: true };
  }
  try {
    const res = await fetch(`${API_BASE}/machines/reset-simulation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to reset simulation');
    const data = await res.json();
    return { ...data, is_offline: false };
  } catch (err) {
    console.warn('Network API unreachable. Falling back to Edge Store:', err.message);
    return { ...offlineStore.resetSimulation(), is_offline: true };
  }
}

export async function fetchAlerts() {
  if (isOfflineActive()) {
    return { alerts: offlineStore.getAlerts(), is_offline: true };
  }
  try {
    const res = await fetch(`${API_BASE}/alerts`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    const data = await res.json();
    return { ...data, is_offline: false };
  } catch (err) {
    console.warn('Network API unreachable. Falling back to Edge Store:', err.message);
    return { alerts: offlineStore.getAlerts(), is_offline: true };
  }
}

export async function resolveAlert(alertId) {
  if (isOfflineActive()) {
    return { ...offlineStore.resolveAlert(alertId), is_offline: true };
  }
  try {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/resolve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to resolve alert');
    const data = await res.json();
    return { ...data, is_offline: false };
  } catch (err) {
    console.warn('Network API unreachable. Falling back to Edge Store:', err.message);
    return { ...offlineStore.resolveAlert(alertId), is_offline: true };
  }
}

export async function fetchProductionAnalytics() {
  if (isOfflineActive()) {
    return { ...offlineStore.getProductionSummary(), is_offline: true };
  }
  try {
    const res = await fetch(`${API_BASE}/production`);
    if (!res.ok) throw new Error('Failed to fetch production analytics');
    const data = await res.json();
    return { ...data, is_offline: false };
  } catch (err) {
    console.warn('Network API unreachable. Falling back to Edge Store:', err.message);
    return { ...offlineStore.getProductionSummary(), is_offline: true };
  }
}

export async function sendAIChatQuery(question) {
  if (isOfflineActive()) {
    return { ...(await offlineStore.sendAIChatQuery(question)), is_offline: true };
  }
  try {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    if (!res.ok) throw new Error('Failed to send AI chat query');
    const data = await res.json();
    return { ...data, is_offline: false };
  } catch (err) {
    console.warn('Network API unreachable. Falling back to Edge Store:', err.message);
    return { ...(await offlineStore.sendAIChatQuery(question)), is_offline: true };
  }
}

export async function analyzeScenario(scenarioData) {
  try {
    const res = await fetch(`${API_BASE}/simulator/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenarioData)
    });
    if (!res.ok) throw new Error('Failed to analyze scenario');
    const data = await res.json();
    return { ...data, is_offline: false };
  } catch (err) {
    return {
      success: true,
      is_offline: true,
      simulation_results: {
        scenario_name: scenarioData.scenario_name || 'Edge What-If Simulation',
        predicted_oee: 84.5,
        predicted_downtime_hours: 2.1,
        risk_level: 'Moderate',
        recommendation: 'Simulation processed locally using Edge Predictive Rules.'
      }
    };
  }
}

export async function fetchDemoState() {
  if (isOfflineActive()) {
    return { step: Number(localStorage.getItem('factory_offline_demo_step') || 0), is_offline: true };
  }
  try {
    const res = await fetch(`${API_BASE}/demo/state`);
    if (!res.ok) throw new Error('Failed to fetch demo state');
    const data = await res.json();
    return { ...data, is_offline: false };
  } catch (err) {
    return { step: Number(localStorage.getItem('factory_offline_demo_step') || 0), is_offline: true };
  }
}

export async function executeDemoStep(step) {
  if (isOfflineActive()) {
    localStorage.setItem('factory_offline_demo_step', step);
    if (step === 2) offlineStore.triggerAnomaly('MCH-003', 'Abnormal Pressure');
    return { success: true, step, is_offline: true };
  }
  try {
    const res = await fetch(`${API_BASE}/demo/step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step })
    });
    if (!res.ok) throw new Error('Failed to execute demo step');
    const data = await res.json();
    return { ...data, is_offline: false };
  } catch (err) {
    localStorage.setItem('factory_offline_demo_step', step);
    return { success: true, step, is_offline: true };
  }
}

export async function resetDemoScenario() {
  if (isOfflineActive()) {
    localStorage.setItem('factory_offline_demo_step', 0);
    offlineStore.resetSimulation();
    return { success: true, step: 0, is_offline: true };
  }
  try {
    const res = await fetch(`${API_BASE}/demo/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to reset demo scenario');
    const data = await res.json();
    return { ...data, is_offline: false };
  } catch (err) {
    localStorage.setItem('factory_offline_demo_step', 0);
    offlineStore.resetSimulation();
    return { success: true, step: 0, is_offline: true };
  }
}

export async function fetchMaintenance() {
  if (isOfflineActive()) {
    return { success: true, schedule: offlineStore.getMaintenance(), is_offline: true };
  }
  try {
    const res = await fetch(`${API_BASE}/maintenance`);
    if (!res.ok) throw new Error('Failed to fetch maintenance');
    const data = await res.json();
    return { ...data, is_offline: false };
  } catch (err) {
    console.warn('Network API unreachable. Falling back to Edge Store:', err.message);
    return { success: true, schedule: offlineStore.getMaintenance(), is_offline: true };
  }
}

export async function scheduleMaintenance(maintenanceData) {
  if (isOfflineActive()) {
    return { ...offlineStore.scheduleMaintenance(maintenanceData), is_offline: true };
  }
  try {
    const res = await fetch(`${API_BASE}/maintenance/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(maintenanceData)
    });
    if (!res.ok) throw new Error('Failed to schedule maintenance');
    const data = await res.json();
    return { ...data, is_offline: false };
  } catch (err) {
    console.warn('Network API unreachable. Falling back to Edge Store:', err.message);
    return { ...offlineStore.scheduleMaintenance(maintenanceData), is_offline: true };
  }
}

export async function completeMaintenance(scheduleId) {
  if (isOfflineActive()) {
    return { ...offlineStore.completeMaintenance(scheduleId), is_offline: true };
  }
  try {
    const res = await fetch(`${API_BASE}/maintenance/${scheduleId}/complete`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to complete maintenance');
    const data = await res.json();
    return { ...data, is_offline: false };
  } catch (err) {
    console.warn('Network API unreachable. Falling back to Edge Store:', err.message);
    return { ...offlineStore.completeMaintenance(scheduleId), is_offline: true };
  }
}

export async function fetchEnergyMetrics() {
  if (isOfflineActive()) {
    return { ...offlineStore.getEnergyMetrics(), is_offline: true };
  }
  try {
    const res = await fetch(`${API_BASE}/energy`);
    if (!res.ok) throw new Error('Failed to fetch energy metrics');
    const data = await res.json();
    return { ...data, is_offline: false };
  } catch (err) {
    console.warn('Network API unreachable. Falling back to Edge Store:', err.message);
    return { ...offlineStore.getEnergyMetrics(), is_offline: true };
  }
}

export async function fetchIncidents() {
  if (isOfflineActive()) {
    return { success: true, incidents: offlineStore.getIncidents(), is_offline: true };
  }
  try {
    const res = await fetch(`${API_BASE}/incidents`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    const data = await res.json();
    return { ...data, is_offline: false };
  } catch (err) {
    console.warn('Network API unreachable. Falling back to Edge Store:', err.message);
    return { success: true, incidents: offlineStore.getIncidents(), is_offline: true };
  }
}

export async function fetchIncidentDetails(id) {
  if (isOfflineActive()) {
    return { ...offlineStore.getIncidentDetails(id), is_offline: true };
  }
  try {
    const res = await fetch(`${API_BASE}/incidents/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch incident ${id}`);
    const data = await res.json();
    return { ...data, is_offline: false };
  } catch (err) {
    console.warn('Network API unreachable. Falling back to Edge Store:', err.message);
    return { ...offlineStore.getIncidentDetails(id), is_offline: true };
  }
}

export async function updateIncidentStatus(id, status) {
  if (isOfflineActive()) {
    return { ...offlineStore.updateIncidentStatus(id, status), is_offline: true };
  }
  try {
    const res = await fetch(`${API_BASE}/incidents/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error(`Failed to update incident ${id} status`);
    const data = await res.json();
    return { ...data, is_offline: false };
  } catch (err) {
    console.warn('Network API unreachable. Falling back to Edge Store:', err.message);
    return { ...offlineStore.updateIncidentStatus(id, status), is_offline: true };
  }
}
