// Edge Processing & Offline Persistence Store for AI Smart Factory Assistant
// Provides 100% offline capability, local risk calculation, anomaly injection, alert generation, and localStorage sync.

const STORAGE_KEYS = {
  MACHINES: 'factory_offline_machines',
  ALERTS: 'factory_offline_alerts',
  INCIDENTS: 'factory_offline_incidents',
  MAINTENANCE: 'factory_offline_maintenance',
  PRODUCTION: 'factory_offline_production',
  LOGS: 'factory_offline_logs',
  DEMO_STEP: 'factory_offline_demo_step',
  OFFLINE_OVERRIDE: 'factory_offline_manual_toggle'
};

// Initial Baseline Fleet Data
const INITIAL_MACHINES = [
  {
    id: "MCH-001",
    name: "Machine 01 - Assembly Unit",
    type: "Robotic Assembly",
    status: "Normal",
    risk_score: 5.0,
    temperature: 42.5,
    vibration: 1.2,
    pressure: 98.4,
    operating_hours: 1420,
    health: 95.0,
    anomaly_type: "None",
    location: "Bay A - Cell 1",
    model: "KUKA KR-210"
  },
  {
    id: "MCH-002",
    name: "Machine 02 - CNC Unit",
    type: "CNC Milling",
    status: "Normal",
    risk_score: 5.0,
    temperature: 48.1,
    vibration: 1.8,
    pressure: 104.2,
    operating_hours: 2180,
    health: 95.0,
    anomaly_type: "None",
    location: "Bay A - Cell 2",
    model: "Haas VF-4"
  },
  {
    id: "MCH-003",
    name: "Machine 03 - Packaging Unit",
    type: "Automated Packaging",
    status: "Normal",
    risk_score: 13.0,
    temperature: 52.4,
    vibration: 2.1,
    pressure: 110.5,
    operating_hours: 3100,
    health: 87.0,
    anomaly_type: "None",
    location: "Bay B - Cell 1",
    model: "Bosch Pack 301"
  },
  {
    id: "MCH-004",
    name: "Machine 04 - Welding Unit",
    type: "Laser Welding",
    status: "Normal",
    risk_score: 5.0,
    temperature: 45.0,
    vibration: 1.5,
    pressure: 100.0,
    operating_hours: 1850,
    health: 95.0,
    anomaly_type: "None",
    location: "Bay B - Cell 2",
    model: "Trumpf TruLaser"
  },
  {
    id: "MCH-005",
    name: "Machine 05 - Conveyor Unit",
    type: "Material Handling",
    status: "Normal",
    risk_score: 5.0,
    temperature: 39.8,
    vibration: 1.1,
    pressure: 95.0,
    operating_hours: 980,
    health: 95.0,
    anomaly_type: "None",
    location: "Bay C - Main Line",
    model: "FlexLink X85"
  },
  {
    id: "MCH-006",
    name: "Machine 06 - Inspection Unit",
    type: "Optical Inspection",
    status: "Normal",
    risk_score: 5.0,
    temperature: 41.2,
    vibration: 0.9,
    pressure: 92.0,
    operating_hours: 1120,
    health: 95.0,
    anomaly_type: "None",
    location: "Bay C - Quality Station",
    model: "Cognex In-Sight 9000"
  }
];

const INITIAL_ALERTS = [
  {
    id: "ALT-801",
    machine_id: "MCH-003",
    machine_name: "Machine 03 - Packaging Unit",
    severity: "Info",
    type: "Preventive Maintenance",
    title: "Operating Hours Threshold",
    message: "Operating hours (3,100 hrs) approaching 3,500 hrs preventive maintenance window.",
    timestamp: "2026-09-17 09:15:00",
    status: "Active"
  }
];

const INITIAL_INCIDENTS = [];
const INITIAL_MAINTENANCE = [
  {
    id: "WO-901",
    machine_id: "MCH-003",
    machine_name: "Machine 03 - Packaging Unit",
    task_title: "Preventive Calibration & Bearing Check",
    maintenance_type: "Preventive",
    assigned_tech: "Alex Chen (Senior Specialist)",
    due_date: "2026-09-20",
    status: "Scheduled",
    notes: "Routine 3,000-hour inspection interval check."
  }
];

const INITIAL_LOGS = [
  { id: "LOG-01", machine_name: "System", message: "Edge processing engine initialized locally.", timestamp: new Date().toLocaleString() }
];

// Helper to load or initialize localStorage
function loadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save ${key} to localStorage:`, err);
  }
}

// Client-Side Edge Risk Scoring Model
export function calculateEdgeRiskScore(temp, vib, press, hours, anomalyType = 'None') {
  let score = 5.0;

  // Temperature thresholds
  if (temp > 85) score += 45;
  else if (temp > 70) score += 25;
  else if (temp > 55) score += 10;

  // Vibration thresholds
  if (vib > 5.0) score += 45;
  else if (vib > 3.5) score += 25;
  else if (vib > 2.5) score += 10;

  // Pressure thresholds
  if (press > 150) score += 45;
  else if (press > 130) score += 45;
  else if (press > 115) score += 20;

  // Operating Hours
  if (hours > 3000) score += 8;

  // Specific Anomaly Bonuses
  if (anomalyType === 'High Temperature') score = Math.max(score, 82.0);
  if (anomalyType === 'High Vibration') score = Math.max(score, 78.0);
  if (anomalyType === 'Abnormal Pressure') score = Math.max(score, 75.0);
  if (anomalyType === 'Increasing Trend') score = Math.max(score, 65.0);
  if (anomalyType === 'Combined Anomaly') score = Math.max(score, 94.0);

  score = Math.min(100.0, Math.max(0.0, Number(score.toFixed(1))));

  let status = 'Normal';
  if (score >= 70) status = 'Critical';
  else if (score >= 40) status = 'Warning';

  return { risk_score: score, status };
}

// Edge Store Controller
export const offlineStore = {
  getManualOfflineOverride() {
    return localStorage.getItem(STORAGE_KEYS.OFFLINE_OVERRIDE) === 'true';
  },

  setManualOfflineOverride(isOffline) {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_OVERRIDE, isOffline ? 'true' : 'false');
  },

  getMachines() {
    let machines = loadStorage(STORAGE_KEYS.MACHINES, INITIAL_MACHINES);
    // Ensure risk calculation consistency
    machines = machines.map(m => {
      const calc = calculateEdgeRiskScore(m.temperature, m.vibration, m.pressure, m.operating_hours, m.anomaly_type);
      return {
        ...m,
        risk_score: m.anomaly_type !== 'None' ? calc.risk_score : m.risk_score,
        status: m.anomaly_type !== 'None' ? calc.status : m.status
      };
    });
    saveStorage(STORAGE_KEYS.MACHINES, machines);
    return machines;
  },

  getMachineDetails(id) {
    const machines = this.getMachines();
    const searchId = (id || '').toString().trim().toLowerCase();
    const m = machines.find(x => 
      x.id.toLowerCase() === searchId || 
      x.id.replace('-', '').toLowerCase() === searchId.replace('-', '') ||
      x.name.toLowerCase().includes(searchId)
    ) || machines.find(x => x.id === 'MCH-001') || machines[0];

    const alerts = this.getAlerts().filter(a => a.machine_id === m.id);

    // Generate telemetry history graph points
    const telemetry_history = Array.from({ length: 12 }, (_, i) => ({
      timestamp: `2026-09-22 11:${(10 + i * 2).toString().padStart(2, '0')}:00`,
      temperature: Number((m.temperature + (Math.random() * 2 - 1)).toFixed(1)),
      vibration: Number((m.vibration + (Math.random() * 0.4 - 0.2)).toFixed(2)),
      pressure: Number((m.pressure + (Math.random() * 3 - 1.5)).toFixed(1)),
      risk_score: m.risk_score,
      efficiency: m.efficiency || 90.0
    }));

    const ai_diagnosis = {
      risk_level: m.status === 'Critical' ? 'CRITICAL RISK' : m.status === 'Warning' ? 'ATTENTION REQUIRED' : 'NORMAL OPERATIONAL STATUS',
      reasons: [
        `Temperature telemetry (${m.temperature}°C) evaluated by Edge Engine.`,
        `Vibration harmonic level (${m.vibration} mm/s) monitored.`,
        `Operating pressure (${m.pressure} PSI) and total runtime (${m.operating_hours.toLocaleString()} hrs) verified.`
      ],
      trend_warning: m.temperature > 75 || m.vibration > 3.5
    };

    const recommendations = [
      `Inspect primary drive shaft bearings and thermal cooling loop for ${m.name}.`,
      `Calibrate pneumatic pressure regulator and check hydraulic seals.`,
      `Schedule preventive maintenance work order according to shift target.`
    ];

    return {
      success: true,
      machine: m,
      alerts,
      telemetry_history,
      ai_diagnosis,
      recommendations,
      is_edge: true
    };
  },

  getAlerts() {
    return loadStorage(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
  },

  resolveAlert(alertId) {
    const alerts = this.getAlerts().map(a => a.id === alertId ? { ...a, status: 'Resolved' } : a);
    saveStorage(STORAGE_KEYS.ALERTS, alerts);
    return { success: true, alert_id: alertId, status: 'Resolved' };
  },

  getIncidents() {
    return loadStorage(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENTS);
  },

  getIncidentDetails(id) {
    const incidents = this.getIncidents();
    const inc = incidents.find(i => i.id === id) || incidents[0];
    const machines = this.getMachines();
    const machine = machines.find(m => m.id === inc?.machine_id) || machines[0];

    const tempAfter = inc?.telemetry?.temperature || machine.temperature;
    const tempBefore = Math.max(38, tempAfter - 28);
    const vibAfter = inc?.telemetry?.vibration || machine.vibration;
    const vibBefore = Math.max(0.8, Number((vibAfter - 2.1).toFixed(2)));
    const pressAfter = inc?.telemetry?.pressure || machine.pressure;
    const pressBefore = Math.max(90, pressAfter - 40);

    return {
      success: true,
      incident: inc || {
        id: id || 'INC-OFF-01',
        machine_id: machine.id,
        machine_name: machine.name,
        anomaly_type: machine.anomaly_type || 'High Temperature',
        severity: machine.status === 'Critical' ? 'Critical' : 'Warning',
        risk_score: machine.risk_score,
        status: 'Investigation Required',
        created_at: new Date().toLocaleString()
      },
      machine,
      before_after: {
        temperature: { before: tempBefore, after: tempAfter, delta: Number((tempAfter - tempBefore).toFixed(1)) },
        vibration: { before: vibBefore, after: vibAfter, delta: Number((vibAfter - vibBefore).toFixed(2)) },
        pressure: { before: pressBefore, after: pressAfter, delta: Number((pressAfter - pressBefore).toFixed(1)) },
        risk_score: { before: 5.0, after: machine.risk_score, delta: Number((machine.risk_score - 5.0).toFixed(1)) },
        status: { before: 'Normal', after: machine.status }
      },
      ai_root_cause: {
        summary: `Edge AI Model detected critical sensor deviation in ${machine.name} (${machine.anomaly_type}). Thermal/mechanical strain exceeds safe operating threshold.`,
        confidence: '96.4% (Local Edge Model)',
        factors: [
          'High thermal friction build-up under heavy shift load',
          'Vibration harmonics exceeding ISO 10816 mechanical limits',
          'Pneumatic pressure fluctuation in primary drive circuit',
          `Operating hours (${machine.operating_hours} hrs) nearing scheduled maintenance interval`
        ],
        disclaimer: 'Edge processed telemetry anomaly analysis using on-device ML scoring rules.'
      },
      recommendations: [
        'Perform emergency mechanical inspection of drive shaft bearings and cooling loop.',
        'Calibrate pneumatic pressure regulator and flush hydraulic lines.',
        'Schedule emergency maintenance work order to replace worn components.'
      ],
      timeline: [
        { time: '10 mins ago', title: 'Baseline Telemetry Normal', desc: 'All parameters within optimal thresholds.' },
        { time: '5 mins ago', title: `${machine.anomaly_type} Triggered`, desc: 'Edge anomaly detection algorithm flagged parameter spike.' },
        { time: 'Just now', title: 'AI Incident Created', desc: 'Incident logged locally for root cause investigation.' }
      ]
    };
  },

  updateIncidentStatus(id, newStatus) {
    const incidents = this.getIncidents().map(i => i.id === id ? { ...i, status: newStatus } : i);
    saveStorage(STORAGE_KEYS.INCIDENTS, incidents);
    return { success: true, incident_id: id, status: newStatus };
  },

  triggerAnomaly(machineId = 'MCH-003', anomalyType = 'Combined Anomaly') {
    const machines = this.getMachines();
    const targetIdx = machines.findIndex(m => m.id === machineId);
    if (targetIdx === -1) return { success: false, error: 'Machine not found' };

    const target = machines[targetIdx];
    let newTemp = target.temperature;
    let newVib = target.vibration;
    let newPress = target.pressure;

    if (anomalyType === 'High Temperature') newTemp = 88.5;
    else if (anomalyType === 'High Vibration') newVib = 4.8;
    else if (anomalyType === 'Abnormal Pressure') newPress = 142.0;
    else if (anomalyType === 'Increasing Trend') { newTemp = 74.0; newVib = 3.2; }
    else if (anomalyType === 'Combined Anomaly') { newTemp = 91.2; newVib = 5.6; newPress = 148.5; }
    else { newTemp = 82.0; newVib = 4.1; }

    const { risk_score, status } = calculateEdgeRiskScore(newTemp, newVib, newPress, target.operating_hours, anomalyType);

    target.temperature = newTemp;
    target.vibration = newVib;
    target.pressure = newPress;
    target.anomaly_type = anomalyType;
    target.risk_score = risk_score;
    target.status = status;
    target.health = Math.max(20, 100 - risk_score);

    machines[targetIdx] = target;
    saveStorage(STORAGE_KEYS.MACHINES, machines);

    // Create Alert
    const alerts = this.getAlerts();
    const newAlert = {
      id: `ALT-OFF-${Date.now().toString().slice(-4)}`,
      machine_id: target.id,
      machine_name: target.name,
      severity: status === 'Critical' ? 'Critical' : 'Warning',
      type: `${anomalyType} Detected`,
      title: `${target.name} Anomaly`,
      message: `Edge Engine: ${anomalyType} detected on ${target.name}. Risk Score: ${risk_score}/100.`,
      timestamp: new Date().toLocaleString(),
      status: 'Active'
    };
    alerts.unshift(newAlert);
    saveStorage(STORAGE_KEYS.ALERTS, alerts);

    // Create Incident
    const incidents = this.getIncidents();
    const newIncident = {
      id: `INC-OFF-${Date.now().toString().slice(-4)}`,
      machine_id: target.id,
      machine_name: target.name,
      anomaly_type: anomalyType,
      severity: status === 'Critical' ? 'Critical' : 'Warning',
      risk_score: risk_score,
      status: 'Investigation Required',
      created_at: new Date().toLocaleString(),
      telemetry: { temperature: newTemp, vibration: newVib, pressure: newPress }
    };
    incidents.unshift(newIncident);
    saveStorage(STORAGE_KEYS.INCIDENTS, incidents);

    // Add Log
    const logs = loadStorage(STORAGE_KEYS.LOGS, INITIAL_LOGS);
    logs.unshift({
      id: `LOG-${Date.now().toString().slice(-4)}`,
      machine_name: target.name,
      message: `[EDGE ENGINE] ${anomalyType} injected on ${target.name} (Risk: ${risk_score}).`,
      timestamp: new Date().toLocaleString()
    });
    saveStorage(STORAGE_KEYS.LOGS, logs);

    return {
      success: true,
      message: `Edge Engine: Anomaly injected on ${target.name}`,
      machine: target,
      risk_score,
      status,
      is_edge: true
    };
  },

  resetSingleMachine(machineId) {
    const machines = this.getMachines();
    const idx = machines.findIndex(m => m.id === machineId);
    if (idx !== -1) {
      const init = INITIAL_MACHINES.find(m => m.id === machineId) || INITIAL_MACHINES[0];
      machines[idx] = { ...init };
      saveStorage(STORAGE_KEYS.MACHINES, machines);
    }
    return { success: true, message: `Reset machine ${machineId} to baseline normal.` };
  },

  resetSimulation() {
    saveStorage(STORAGE_KEYS.MACHINES, INITIAL_MACHINES);
    saveStorage(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
    saveStorage(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENTS);
    saveStorage(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE);
    saveStorage(STORAGE_KEYS.LOGS, INITIAL_LOGS);
    return { success: true, message: 'Factory local edge simulation reset to baseline.' };
  },

  getMaintenance() {
    return loadStorage(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE);
  },

  scheduleMaintenance(woData) {
    const list = this.getMaintenance();
    const newWO = {
      id: `WO-OFF-${Date.now().toString().slice(-4)}`,
      machine_id: woData.machine_id,
      machine_name: woData.machine_name,
      task_title: woData.task_title || 'Emergency Repair',
      maintenance_type: woData.maintenance_type || 'Emergency',
      assigned_tech: 'Local Edge Tech Specialist',
      due_date: woData.due_date || new Date().toISOString().split('T')[0],
      status: 'Scheduled',
      notes: woData.notes || 'Created via Edge Investigation'
    };
    list.unshift(newWO);
    saveStorage(STORAGE_KEYS.MAINTENANCE, list);
    return { success: true, work_order: newWO };
  },

  completeMaintenance(id) {
    const list = this.getMaintenance().map(m => m.id === id ? { ...m, status: 'Completed' } : m);
    saveStorage(STORAGE_KEYS.MAINTENANCE, list);
    return { success: true, status: 'Completed' };
  },

  getProductionSummary() {
    const machines = this.getMachines();
    const critical = machines.filter(m => m.status === 'Critical').length;
    const warning = machines.filter(m => m.status === 'Warning').length;

    let health_score = 88;
    if (critical > 0) health_score = Math.max(45, 88 - critical * 20);
    else if (warning > 0) health_score = Math.max(65, 88 - warning * 10);

    let health_status = 'Healthy';
    if (critical > 0) health_status = 'Critical';
    else if (warning > 0) health_status = 'Attention Required';

    const logs = loadStorage(STORAGE_KEYS.LOGS, INITIAL_LOGS);

    return {
      success: true,
      summary: {
        produced_output: 5240,
        target_output: 5770,
        efficiency: Number((89.1 - (critical * 4.5)).toFixed(1)),
        downtime_hrs: Number((1.2 + (critical * 1.5)).toFixed(1)),
        health_score,
        health_status
      },
      activity_logs: logs
    };
  },

  getEnergyMetrics() {
    return {
      success: true,
      total_kwh: 1245.8,
      peak_kw: 185.2,
      efficiency_score: 92.4,
      co2_savings_kg: 480.0,
      machine_consumption: [
        { machine_id: 'MCH-001', kwh: 240.5, status: 'Normal' },
        { machine_id: 'MCH-002', kwh: 310.2, status: 'Normal' },
        { machine_id: 'MCH-003', kwh: 285.0, status: 'Normal' },
        { machine_id: 'MCH-004', kwh: 195.4, status: 'Normal' },
        { machine_id: 'MCH-005', kwh: 110.8, status: 'Normal' },
        { machine_id: 'MCH-006', kwh: 103.9, status: 'Normal' }
      ]
    };
  },

  sendAIChatQuery(question) {
    const q = question.toLowerCase();
    let reply = `🤖 **Edge AI Assistant (Local Mode)**: Processing your query locally. All 6 machines are monitored on the edge. `;
    if (q.includes('machine') || q.includes('status')) {
      const machines = this.getMachines();
      reply += `Current fleet status: ${machines.filter(m => m.status === 'Normal').length} Normal, ${machines.filter(m => m.status === 'Warning').length} Warning, ${machines.filter(m => m.status === 'Critical').length} Critical.`;
    } else if (q.includes('risk') || q.includes('anomaly')) {
      reply += `Machine risk scores are evaluated using on-device ML decision thresholds (Temp, Vibration, Pressure & Hours).`;
    } else {
      reply += `Edge analysis indicates baseline factory parameters are operational under current shift targets.`;
    }
    return Promise.resolve({ success: true, answer: reply, is_edge: true });
  }
};
