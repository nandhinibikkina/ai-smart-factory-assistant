import random
from datetime import datetime
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.db import get_db_connection
from models.risk_model import predict_machine_risk, calculate_factory_health_score
from services.maintenance_service import generate_maintenance_recommendations

BASELINES = {
    "MCH-001": {"temp": 64.2, "vib": 1.8, "press": 102.5, "eff": 94.5, "hours": 1420.0},
    "MCH-002": {"temp": 71.5, "vib": 2.9, "press": 98.0, "eff": 89.0, "hours": 2180.5},
    "MCH-003": {"temp": 66.0, "vib": 1.9, "press": 101.0, "eff": 95.0, "hours": 3850.0},
    "MCH-004": {"temp": 68.4, "vib": 2.1, "press": 99.5, "eff": 93.0, "hours": 1940.0},
    "MCH-005": {"temp": 58.0, "vib": 1.2, "press": 95.0, "eff": 96.0, "hours": 890.0},
    "MCH-006": {"temp": 52.4, "vib": 0.8, "press": 91.5, "eff": 97.5, "hours": 650.0}
}

def inject_machine_anomaly(machine_id="MCH-003", anomaly_type="Combined Anomaly"):
    """
    Injects simulated anomaly into ANY machine in the fleet.
    Anomaly Types:
      - 'High Temperature' / 'high_temperature'
      - 'High Vibration' / 'high_vibration'
      - 'Abnormal Pressure' / 'abnormal_pressure'
      - 'Increasing Trend' / 'increasing_trend'
      - 'Combined Anomaly' / 'combined_anomaly'
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Normalize machine_id (e.g. '02' or '2' -> 'MCH-002')
    formatted_id = machine_id.upper().strip()
    if not formatted_id.startswith('MCH-'):
        clean_num = formatted_id.replace('MACHINE', '').replace('M', '').strip()
        if clean_num.isdigit():
            formatted_id = f"MCH-{int(clean_num):03d}"
            
    cursor.execute("SELECT * FROM machines WHERE id = ? OR name LIKE ?", (formatted_id, f"%{machine_id}%"))
    machine_row = cursor.fetchone()
    
    if not machine_row:
        conn.close()
        return {"error": f"Machine {machine_id} not found."}
        
    m = dict(machine_row)
    target_id = m['id']
    machine_name = m['name']
    
    # Compute parameter values based on anomaly_type
    atype = str(anomaly_type).lower().replace('_', ' ').strip()
    trend_dict = None
    
    if "temperature" in atype or "temp" in atype:
        temp = round(random.uniform(89.5, 94.0), 1)
        vib = round(random.uniform(2.0, 2.8), 2)
        press = round(random.uniform(98.0, 104.0), 1)
        title = "Thermal Overheat Anomaly"
        desc = f"HIGH TEMPERATURE ANOMALY DETECTED: Thermal sensor reads {temp}°C (Safety limit: 85.0°C)."
    elif "vibration" in atype or "vib" in atype:
        temp = round(random.uniform(68.0, 74.0), 1)
        vib = round(random.uniform(6.8, 7.8), 2)
        press = round(random.uniform(96.0, 102.0), 1)
        title = "Excessive Shaft Vibration Anomaly"
        desc = f"HIGH VIBRATION ANOMALY DETECTED: Drive shaft vibration reads {vib} mm/s (Tolerance limit: 5.5 mm/s)."
    elif "pressure" in atype or "press" in atype:
        temp = round(random.uniform(72.0, 78.0), 1)
        vib = round(random.uniform(2.5, 3.4), 2)
        press = round(random.uniform(134.0, 142.0), 1)
        title = "Pneumatic Pressure Spike Anomaly"
        desc = f"ABNORMAL PRESSURE DETECTED: Line pressure reads {press} PSI (Operating limit: 125.0 PSI)."
    elif "trend" in atype:
        temp = round(random.uniform(82.5, 86.0), 1)
        vib = round(random.uniform(4.8, 5.6), 2)
        press = round(random.uniform(118.0, 126.0), 1)
        trend_dict = {"temp_increasing": True, "vib_increasing": True}
        title = "Continuous Parameter Upward Trend"
        desc = f"INCREASING TREND DETECTED: Continuous upward drift in Temperature ({temp}°C) and Vibration ({vib} mm/s)."
    else: # Combined Anomaly
        temp = round(random.uniform(90.0, 95.0), 1)
        vib = round(random.uniform(6.8, 7.9), 2)
        press = round(random.uniform(132.0, 140.0), 1)
        title = "Critical Multi-Sensor Anomaly"
        desc = f"COMBINED CRITICAL ANOMALY: Temperature ({temp}°C), Vibration ({vib} mm/s), and Pressure ({press} PSI) exceed safety tolerances."

    diag = predict_machine_risk(temp, vib, press, m['operating_hours'], trend_dict)
    status = diag['status']
    risk_score = diag['risk_score'] # 0 to 100
    eff = round(max(55.0, m['efficiency'] - 20.0), 1)

    cursor.execute('''
        UPDATE machines
        SET temperature = ?, vibration = ?, pressure = ?, status = ?, risk_score = ?, efficiency = ?, last_updated = datetime('now')
        WHERE id = ?
    ''', (temp, vib, press, status, risk_score, eff, target_id))
    
    cursor.execute('''
        INSERT INTO telemetry_history (machine_id, temperature, vibration, pressure, efficiency, timestamp)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
    ''', (target_id, temp, vib, press, eff))
    
    recs = generate_maintenance_recommendations(temp, vib, press, m['operating_hours'], status)
    rec_str = recs[0] if recs else "Inspect system liquid cooling, drive shaft, and pneumatic lines."

    # Update or add active alert
    cursor.execute("UPDATE alerts SET status = 'Resolved' WHERE machine_id = ? AND status = 'Active'", (target_id,))
    cursor.execute('''
        INSERT INTO alerts (machine_id, machine_name, severity, title, description, recommendation, status, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, 'Active', datetime('now'))
    ''', (target_id, machine_name, 'Critical' if status == 'Critical' else 'Warning', title, desc, rec_str))

    # Auto-create or update AI Incident Investigation Record
    m_num = target_id.split('-')[-1] if '-' in target_id else '001'
    incident_id = f"INC-{m_num}"
    base = BASELINES.get(target_id, {"temp": 65.0, "vib": 1.8, "press": 100.0})
    
    cursor.execute("DELETE FROM incidents WHERE id = ?", (incident_id,))
    cursor.execute('''
        INSERT INTO incidents (
            id, machine_id, machine_name, anomaly_type, severity, risk_score, status,
            temp_before, temp_after, vib_before, vib_after, press_before, press_after,
            root_cause, confidence, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'Investigation Required', ?, ?, ?, ?, ?, ?, ?, 'High', datetime('now'))
    ''', (
        incident_id, target_id, machine_name, anomaly_type,
        'Critical' if status == 'Critical' else 'Warning',
        risk_score, base['temp'], temp, base['vib'], vib, base['press'], press,
        title
    ))

    cursor.execute("INSERT INTO activity_logs (type, machine_name, message) VALUES ('Alert', ?, ?)",
                   (machine_name, f"Anomaly Injected ({anomaly_type}): {title} (Incident #{incident_id} Created)"))
    
    conn.commit()
    conn.close()
    
    return {
        "machine_id": target_id,
        "machine_name": machine_name,
        "anomaly_type": anomaly_type,
        "temperature": temp,
        "vibration": vib,
        "pressure": press,
        "status": status,
        "risk_score": risk_score,
        "incident_id": incident_id
    }

def reset_single_machine_anomaly(machine_id):
    """
    Restores a SINGLE machine back to its baseline normal operating condition.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    formatted_id = machine_id.upper().strip()
    if not formatted_id.startswith('MCH-'):
        clean_num = formatted_id.replace('MACHINE', '').replace('M', '').strip()
        if clean_num.isdigit():
            formatted_id = f"MCH-{int(clean_num):03d}"

    base = BASELINES.get(formatted_id, {"temp": 65.0, "vib": 1.8, "press": 100.0, "eff": 95.0, "hours": 1500.0})
    
    cursor.execute("SELECT id, name FROM machines WHERE id = ? OR name LIKE ?", (formatted_id, f"%{machine_id}%"))
    row = cursor.fetchone()
    if row:
        target_id = row['id']
        machine_name = row['name']
    else:
        target_id = formatted_id
        machine_name = formatted_id
    
    diag = predict_machine_risk(base['temp'], base['vib'], base['press'], base['hours'])

    cursor.execute('''
        UPDATE machines
        SET temperature = ?, vibration = ?, pressure = ?, status = 'Normal', risk_score = ?, efficiency = ?, last_updated = datetime('now')
        WHERE id = ?
    ''', (base['temp'], base['vib'], base['press'], diag['risk_score'], base['eff'], target_id))

    cursor.execute('''
        INSERT INTO telemetry_history (machine_id, temperature, vibration, pressure, efficiency, timestamp)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
    ''', (target_id, base['temp'], base['vib'], base['press'], base['eff']))

    cursor.execute("UPDATE alerts SET status = 'Resolved' WHERE machine_id = ? AND status = 'Active'", (target_id,))
    cursor.execute("UPDATE incidents SET status = 'Resolved' WHERE machine_id = ? AND status != 'Resolved'", (target_id,))
    
    cursor.execute("INSERT INTO activity_logs (type, machine_name, message) VALUES ('System', ?, ?)",
                   (machine_name, f"Single-machine anomaly reset: {machine_name} restored to Normal baseline."))

    conn.commit()
    conn.close()
    return {"message": f"{machine_name} restored to Normal operating baseline.", "machine_id": target_id}

def reset_all_machines():
    """
    Resets all machines to clean normal baseline state.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    for m_id, base in BASELINES.items():
        diag = predict_machine_risk(base['temp'], base['vib'], base['press'], base['hours'])
        cursor.execute('''
            UPDATE machines
            SET temperature = ?, vibration = ?, pressure = ?, status = 'Normal', risk_score = ?, efficiency = ?, last_updated = datetime('now')
            WHERE id = ?
        ''', (base['temp'], base['vib'], base['press'], diag['risk_score'], base['eff'], m_id))
        
    cursor.execute("UPDATE alerts SET status = 'Resolved' WHERE status = 'Active'")
    cursor.execute("UPDATE incidents SET status = 'Resolved' WHERE status != 'Resolved'")
    cursor.execute("UPDATE factory_summary SET health_score = 86, produced_output = 5140, efficiency = 89.1, downtime_hrs = 1.2 WHERE id = 1")
    
    cursor.execute("INSERT INTO activity_logs (type, machine_name, message) VALUES ('System', 'Factory Fleet', 'All factory machines reset to baseline normal operating conditions.')")

    conn.commit()
    conn.close()
    return {"message": "All factory machines successfully reset to Normal operating baseline."}

def tick_simulation():
    """
    Simulates small random fluctuations in normal telemetry.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM machines")
    machines = [dict(r) for r in cursor.fetchall()]
    
    for m in machines:
        if m['status'] in ['Warning', 'Critical']:
            temp = round(m['temperature'] + random.uniform(-0.2, 0.2), 1)
            vib = round(m['vibration'] + random.uniform(-0.04, 0.04), 2)
            press = round(m['pressure'] + random.uniform(-0.4, 0.4), 1)
        else:
            temp = round(max(40.0, min(80.0, m['temperature'] + random.uniform(-0.3, 0.3))), 1)
            vib = round(max(0.2, min(4.0, m['vibration'] + random.uniform(-0.04, 0.04))), 2)
            press = round(max(80.0, min(120.0, m['pressure'] + random.uniform(-0.4, 0.4))), 1)
            
        diag = predict_machine_risk(temp, vib, press, m['operating_hours'])
        
        cursor.execute('''
            UPDATE machines
            SET temperature = ?, vibration = ?, pressure = ?, status = ?, risk_score = ?, last_updated = datetime('now')
            WHERE id = ?
        ''', (temp, vib, press, diag['status'], diag['risk_score'], m['id']))
        
        cursor.execute('''
            INSERT INTO telemetry_history (machine_id, temperature, vibration, pressure, efficiency, timestamp)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
        ''', (m['id'], temp, vib, press, m['efficiency']))

    conn.commit()
    conn.close()
