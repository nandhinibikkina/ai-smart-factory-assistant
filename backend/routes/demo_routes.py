from flask import Blueprint, jsonify, request
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.db import get_db_connection
from models.risk_model import predict_machine_risk
from services.maintenance_service import generate_maintenance_recommendations
from services.simulation_service import reset_all_machines

demo_bp = Blueprint('demo', __name__)

_current_step = 0

@demo_bp.route('/api/demo/state', methods=['GET'])
def get_demo_state():
    global _current_step
    return jsonify({"success": True, "step": _current_step})

@demo_bp.route('/api/demo/reset', methods=['POST'])
def reset_demo():
    global _current_step
    _current_step = 0
    reset_all_machines()
    return jsonify({"success": True, "step": 0, "message": "Demo scenario reset to baseline."})

@demo_bp.route('/api/demo/step', methods=['POST'])
def execute_demo_step():
    global _current_step
    data = request.get_json() or {}
    target_step = data.get('step', _current_step + 1)
    
    if target_step > 7:
        target_step = 7
    if target_step < 0:
        target_step = 0

    _current_step = target_step
    conn = get_db_connection()
    cursor = conn.cursor()
    
    m_id = "MCH-003"
    m_name = "Machine 03 - Packaging Unit"
    
    if target_step == 0:
        reset_all_machines()
        msg = "Step 0: Baseline state. All factory machines operating normally."
    elif target_step == 1:
        # Step 1: Temperature & vibration start rising slightly
        temp, vib, press = 76.5, 3.6, 108.0
        diag = predict_machine_risk(temp, vib, press, 3850.0, {"temp_increasing": True, "vib_increasing": True})
        cursor.execute('''
            UPDATE machines SET temperature = ?, vibration = ?, pressure = ?, status = ?, risk_score = ?, last_updated = datetime('now')
            WHERE id = ?
        ''', (temp, vib, press, "Normal", diag['risk_score'], m_id))
        cursor.execute("INSERT INTO activity_logs (type, machine_name, message) VALUES ('System', ?, ?)",
                       (m_name, "⚠ Increasing Trend Detected: Temp 76.5°C & Vibration 3.6 mm/s rising continuous over last 2 hours."))
        msg = "Step 1: Machine 03 parameters show early continuous upward drift (Trend Warning)."
    elif target_step == 2:
        # Step 2: Machine 03 enters WARNING
        temp, vib, press = 82.0, 4.8, 118.5
        diag = predict_machine_risk(temp, vib, press, 3850.0, {"temp_increasing": True, "vib_increasing": True})
        cursor.execute('''
            UPDATE machines SET temperature = ?, vibration = ?, pressure = ?, status = 'Warning', risk_score = ?, last_updated = datetime('now')
            WHERE id = ?
        ''', (temp, vib, press, diag['risk_score'], m_id))
        cursor.execute("INSERT INTO activity_logs (type, machine_name, message) VALUES ('StatusChange', ?, ?)",
                       (m_name, f"Status changed: NORMAL -> WARNING (Risk Score: {diag['risk_score']}/100)"))
        msg = "Step 2: Machine 03 risk score rises to WARNING level (58/100)."
    elif target_step == 3:
        # Step 3: Machine 03 reaches CRITICAL
        temp, vib, press = 89.5, 6.5, 128.4
        diag = predict_machine_risk(temp, vib, press, 3850.0)
        cursor.execute('''
            UPDATE machines SET temperature = ?, vibration = ?, pressure = ?, status = 'Critical', risk_score = ?, last_updated = datetime('now')
            WHERE id = ?
        ''', (temp, vib, press, diag['risk_score'], m_id))
        cursor.execute("INSERT INTO activity_logs (type, machine_name, message) VALUES ('StatusChange', ?, ?)",
                       (m_name, f"CRITICAL ANOMALY: Temperature 89.5°C & Vibration 6.5 mm/s exceed thresholds (Risk Score: {diag['risk_score']}/100)"))
        msg = "Step 3: Machine 03 risk score reaches CRITICAL (89/100)."
    elif target_step == 4:
        # Step 4: Smart Alert generated
        temp, vib, press = 89.5, 6.5, 128.4
        recs = generate_maintenance_recommendations(temp, vib, press, 3850.0, "Critical")
        rec_text = recs[0] if recs else "Inspect cooling system and bearing assemblies."
        desc = "CRITICAL ANOMALY DETECTED: Thermal limits (89.5°C > 85.0°C) and Bearing Vibration (6.5 mm/s > 5.5 mm/s) exceeded."
        
        cursor.execute("UPDATE alerts SET status = 'Resolved' WHERE machine_id = ? AND status = 'Active'", (m_id,))
        cursor.execute('''
            INSERT INTO alerts (machine_id, machine_name, severity, title, description, recommendation, status, timestamp)
            VALUES (?, ?, 'Critical', 'Thermal Stress & Bearing Wear Anomaly', ?, ?, 'Active', datetime('now'))
        ''', (m_id, m_name, desc, rec_text))
        cursor.execute("INSERT INTO activity_logs (type, machine_name, message) VALUES ('Alert', ?, ?)",
                       (m_name, "Smart Alert generated: Thermal Stress & Bearing Wear Anomaly"))
        msg = "Step 4: Smart Alert automatically logged to Control Center Alert Panel."
    elif target_step == 5:
        # Step 5: Maintenance recommendation generated
        msg = "Step 5: Actionable AI Maintenance Plan generated (Cooling loop check, drive shaft alignment, main bearing replacement)."
    elif target_step == 6:
        # Step 6: AI Assistant context ready
        msg = "Step 6: AI Assistant ready to answer 'Why is Machine 03 critical?' with live root cause breakdown."
    elif target_step == 7:
        # Step 7: Production Analytics & Factory Health impact
        cursor.execute("UPDATE factory_summary SET health_score = 68, produced_output = 4850, efficiency = 82.4, downtime_hrs = 3.2 WHERE id = 1")
        cursor.execute("INSERT INTO activity_logs (type, machine_name, message) VALUES ('System', ?, ?)",
                       ("Factory Summary", "Overall Factory Health updated to 68/100 (Attention Required) due to Machine 03 bottleneck."))
        msg = "Step 7: Production analytics & Factory Health score updated to reflect bottleneck throughput loss."

    conn.commit()
    conn.close()
    
    return jsonify({
        "success": True,
        "step": target_step,
        "message": msg
    })
