from flask import Blueprint, jsonify, request
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.db import get_db_connection
from models.risk_model import predict_machine_risk
from services.maintenance_service import generate_maintenance_recommendations
from services.simulation_service import inject_machine_anomaly, reset_single_machine_anomaly, reset_all_machines

machine_bp = Blueprint('machines', __name__)

@machine_bp.route('/api/machines', methods=['GET'])
def get_machines():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM machines ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()
    
    machines = [dict(r) for r in rows]
    return jsonify({"success": True, "machines": machines, "count": len(machines)})

@machine_bp.route('/api/machines/<machine_id>', methods=['GET'])
def get_machine_details(machine_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM machines WHERE id = ? OR name LIKE ?", (machine_id, f"%{machine_id}%"))
    machine_row = cursor.fetchone()
    
    if not machine_row:
        conn.close()
        return jsonify({"success": False, "error": "Machine not found"}), 404
        
    machine = dict(machine_row)
    
    # Get telemetry history (last 24 points)
    cursor.execute('''
        SELECT temperature, vibration, pressure, efficiency, timestamp
        FROM telemetry_history
        WHERE machine_id = ?
        ORDER BY id DESC LIMIT 24
    ''', (machine['id'],))
    history_rows = cursor.fetchall()
    history = [dict(r) for r in reversed(history_rows)]
    
    # Trend analysis on recent 6 points
    recent_trend = None
    if len(history) >= 6:
        temps = [h['temperature'] for h in history[-6:]]
        vibs = [h['vibration'] for h in history[-6:]]
        temp_inc = temps[-1] > temps[0] and (temps[-1] - temps[0]) >= 2.5
        vib_inc = vibs[-1] > vibs[0] and (vibs[-1] - vibs[0]) >= 0.4
        recent_trend = {"temp_increasing": temp_inc, "vib_increasing": vib_inc}

    # Get alerts for this machine
    cursor.execute('''
        SELECT * FROM alerts
        WHERE machine_id = ?
        ORDER BY id DESC LIMIT 10
    ''', (machine['id'],))
    alerts_rows = cursor.fetchall()
    alerts = [dict(r) for r in alerts_rows]
    
    conn.close()
    
    # AI Diagnosis check with trend evaluation
    diag = predict_machine_risk(machine['temperature'], machine['vibration'], machine['pressure'], machine['operating_hours'], recent_trend)
    recommendations = generate_maintenance_recommendations(machine['temperature'], machine['vibration'], machine['pressure'], machine['operating_hours'], machine['status'])
    
    return jsonify({
        "success": True,
        "machine": machine,
        "telemetry_history": history,
        "alerts": alerts,
        "ai_diagnosis": diag,
        "recommendations": recommendations
    })

@machine_bp.route('/api/machines/trigger-anomaly', methods=['POST'])
def trigger_anomaly():
    data = request.get_json() or {}
    machine_id = data.get('machine_id', 'MCH-003')
    anomaly_type = data.get('anomaly_type', 'Combined Anomaly')
    severity = data.get('severity', 'Critical')
    
    result = inject_machine_anomaly(machine_id, anomaly_type, severity)
    if "error" in result:
        return jsonify({"success": False, "error": result["error"]}), 400

    return jsonify({
        "success": True, 
        "message": f"Anomaly '{anomaly_type}' ({result.get('severity', severity)}) injected for {result['machine_name']}", 
        "result": result
    })

@machine_bp.route('/api/machines/<machine_id>/reset-anomaly', methods=['POST'])
def reset_machine_anomaly(machine_id):
    result = reset_single_machine_anomaly(machine_id)
    return jsonify({"success": True, "message": result['message'], "result": result})

@machine_bp.route('/api/machines/reset-simulation', methods=['POST'])
def reset_simulation():
    result = reset_all_machines()
    return jsonify({"success": True, "message": result['message']})
