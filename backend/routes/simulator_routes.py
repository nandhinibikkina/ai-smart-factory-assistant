from flask import Blueprint, jsonify, request
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.db import get_db_connection
from models.risk_model import calculate_transparent_risk_score, predict_machine_risk
from services.maintenance_service import generate_maintenance_recommendations

simulator_bp = Blueprint('simulator', __name__)

@simulator_bp.route('/api/simulator/analyze', methods=['POST'])
def analyze_scenario():
    data = request.get_json() or {}
    machine_id = data.get('machine_id', 'MCH-001')
    
    try:
        temp = float(data.get('temperature', 70.0))
        vib = float(data.get('vibration', 2.5))
        press = float(data.get('pressure', 100.0))
        hrs = float(data.get('operating_hours', 1500.0))
    except (ValueError, TypeError):
        return jsonify({"success": False, "error": "Invalid numerical parameters."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    
    formatted_id = str(machine_id).upper().strip()
    if not formatted_id.startswith('MCH-'):
        clean_num = formatted_id.replace('MACHINE', '').replace('M', '').strip()
        if clean_num.isdigit():
            formatted_id = f"MCH-{int(clean_num):03d}"

    cursor.execute("SELECT * FROM machines WHERE id = ? OR name LIKE ?", (formatted_id, f"%{machine_id}%"))
    row = cursor.fetchone()
    conn.close()

    if row:
        m = dict(row)
        machine_name = m['name']
        target_id = m['id']
        baseline_temp = data.get('baseline_temperature', m['temperature'])
        baseline_vib = data.get('baseline_vibration', m['vibration'])
        baseline_press = data.get('baseline_pressure', m['pressure'])
        baseline_hrs = data.get('baseline_hours', m['operating_hours'])
    else:
        target_id = formatted_id
        machine_name = f"Machine {target_id}"
        baseline_temp = data.get('baseline_temperature', 65.0)
        baseline_vib = data.get('baseline_vibration', 1.8)
        baseline_press = data.get('baseline_pressure', 100.0)
        baseline_hrs = data.get('baseline_hours', 1500.0)

    # Calculate baseline vs simulated scenario
    baseline_result = calculate_transparent_risk_score(baseline_temp, baseline_vib, baseline_press, baseline_hrs)
    simulated_result = calculate_transparent_risk_score(temp, vib, press, hrs)
    
    delta_score = simulated_result['risk_score'] - baseline_result['risk_score']
    
    explanation = f"Simulated Scenario for {machine_name}: Risk Score {simulated_result['risk_score']}/100 ({simulated_result['risk_level']}). "
    if delta_score > 0:
        explanation += f"Risk score increased by +{delta_score} points due to elevated sensor parameters."
    elif delta_score < 0:
        explanation += f"Risk score decreased by {abs(delta_score)} points towards optimal baseline."
    else:
        explanation += "Risk score remains identical to current baseline condition."

    return jsonify({
        "success": True,
        "machine_id": target_id,
        "machine_name": machine_name,
        "baseline_risk": baseline_result,
        "simulated_risk": simulated_result,
        "delta_score": delta_score,
        "explanation": explanation
    })

@simulator_bp.route('/api/simulator/apply', methods=['POST'])
def apply_scenario():
    data = request.get_json() or {}
    machine_id = data.get('machine_id', 'MCH-001')
    
    try:
        temp = float(data.get('temperature', 70.0))
        vib = float(data.get('vibration', 2.5))
        press = float(data.get('pressure', 100.0))
        hrs = float(data.get('operating_hours', 1500.0))
    except (ValueError, TypeError):
        return jsonify({"success": False, "error": "Invalid numerical parameters."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    
    formatted_id = str(machine_id).upper().strip()
    if not formatted_id.startswith('MCH-'):
        clean_num = formatted_id.replace('MACHINE', '').replace('M', '').strip()
        if clean_num.isdigit():
            formatted_id = f"MCH-{int(clean_num):03d}"

    cursor.execute("SELECT * FROM machines WHERE id = ? OR name LIKE ?", (formatted_id, f"%{machine_id}%"))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({"success": False, "error": f"Machine {machine_id} not found."}), 404

    m = dict(row)
    target_id = m['id']
    machine_name = m['name']

    diag = predict_machine_risk(temp, vib, press, hrs)
    status = diag['status']
    risk_score = diag['risk_score']
    eff = round(max(50.0, min(99.0, 95.0 - (risk_score * 0.3))), 1)

    cursor.execute('''
        UPDATE machines
        SET temperature = ?, vibration = ?, pressure = ?, operating_hours = ?, status = ?, risk_score = ?, efficiency = ?, last_updated = datetime('now')
        WHERE id = ?
    ''', (temp, vib, press, hrs, status, risk_score, eff, target_id))

    cursor.execute('''
        INSERT INTO telemetry_history (machine_id, temperature, vibration, pressure, efficiency, timestamp)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
    ''', (target_id, temp, vib, press, eff))

    if status != 'Normal':
        recs = generate_maintenance_recommendations(temp, vib, press, hrs, status)
        rec_str = recs[0] if recs else "Inspect system parameters."
        cursor.execute("UPDATE alerts SET status = 'Resolved' WHERE machine_id = ? AND status = 'Active'", (target_id,))
        cursor.execute('''
            INSERT INTO alerts (machine_id, machine_name, severity, title, description, recommendation, status, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ''', (target_id, machine_name, status, f"What-If Simulation Applied ({status})", f"Parameters applied via What-If Simulator: Temp={temp}°C, Vib={vib}mm/s, Press={press}PSI.", rec_str, 'Active'))
    else:
        cursor.execute("UPDATE alerts SET status = 'Resolved' WHERE machine_id = ? AND status = 'Active'", (target_id,))

    cursor.execute("INSERT INTO activity_logs (type, machine_name, message) VALUES ('StatusChange', ?, ?)",
                   (machine_name, f"What-If Simulation applied: {machine_name} updated to Temp={temp}°C, Vib={vib}mm/s, Press={press}PSI (Status: {status})."))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": f"Applied simulation parameters to {machine_name}.",
        "machine_id": target_id,
        "machine_name": machine_name,
        "status": status,
        "risk_score": risk_score
    })
