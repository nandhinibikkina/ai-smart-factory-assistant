from flask import Blueprint, jsonify, request
from datetime import datetime
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.db import get_db_connection
from models.risk_model import predict_machine_risk
from services.maintenance_service import generate_maintenance_recommendations

incident_bp = Blueprint('incidents', __name__)

BASELINES = {
    "MCH-001": {"temp": 64.2, "vib": 1.8, "press": 102.5, "eff": 94.5, "hours": 1420.0},
    "MCH-002": {"temp": 71.5, "vib": 2.9, "press": 98.0, "eff": 89.0, "hours": 2180.5},
    "MCH-003": {"temp": 66.0, "vib": 1.9, "press": 101.0, "eff": 95.0, "hours": 3850.0},
    "MCH-004": {"temp": 68.4, "vib": 2.1, "press": 99.5, "eff": 93.0, "hours": 1940.0},
    "MCH-005": {"temp": 58.0, "vib": 1.2, "press": 95.0, "eff": 96.0, "hours": 890.0},
    "MCH-006": {"temp": 52.4, "vib": 0.8, "press": 91.5, "eff": 97.5, "hours": 650.0}
}

@incident_bp.route('/api/incidents', methods=['GET'])
def get_incidents():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM incidents ORDER BY created_at DESC, id DESC")
    rows = cursor.fetchall()
    incidents = [dict(r) for r in rows]
    
    active_incidents = [inc for inc in incidents if inc['status'] != 'Resolved']
    critical_count = sum(1 for inc in active_incidents if inc['severity'] == 'Critical')
    
    conn.close()
    
    return jsonify({
        "success": True,
        "incidents": incidents,
        "active_count": len(active_incidents),
        "critical_count": critical_count,
        "total_count": len(incidents)
    })

@incident_bp.route('/api/incidents/<incident_id>', methods=['GET'])
def get_incident_details(incident_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM incidents WHERE id = ?", (incident_id,))
    inc_row = cursor.fetchone()
    
    if not inc_row:
        conn.close()
        return jsonify({"success": False, "error": f"Incident {incident_id} not found."}), 404
        
    inc = dict(inc_row)
    m_id = inc['machine_id']
    
    cursor.execute("SELECT * FROM machines WHERE id = ?", (m_id,))
    m_row = cursor.fetchone()
    machine = dict(m_row) if m_row else {"id": m_id, "name": inc['machine_name'], "status": inc['severity']}
    
    base = BASELINES.get(m_id, {"temp": 65.0, "vib": 1.8, "press": 100.0, "eff": 95.0, "hours": 1500.0})
    
    # Risk calculation & reasons
    diag = predict_machine_risk(
        inc.get('temp_after') or machine.get('temperature', 80.0),
        inc.get('vib_after') or machine.get('vibration', 5.0),
        inc.get('press_after') or machine.get('pressure', 110.0),
        machine.get('operating_hours', 2000.0)
    )
    
    recs = generate_maintenance_recommendations(
        inc.get('temp_after') or machine.get('temperature', 80.0),
        inc.get('vib_after') or machine.get('vibration', 5.0),
        inc.get('press_after') or machine.get('pressure', 110.0),
        machine.get('operating_hours', 2000.0),
        inc['severity']
    )
    
    # Build Before vs After delta comparison
    before_after = {
        "temperature": {"before": inc.get('temp_before') or base['temp'], "after": inc.get('temp_after') or machine.get('temperature'), "unit": "°C", "delta": round((inc.get('temp_after') or machine.get('temperature')) - (inc.get('temp_before') or base['temp']), 1)},
        "vibration": {"before": inc.get('vib_before') or base['vib'], "after": inc.get('vib_after') or machine.get('vibration'), "unit": "mm/s", "delta": round((inc.get('vib_after') or machine.get('vibration')) - (inc.get('vib_before') or base['vib']), 2)},
        "pressure": {"before": inc.get('press_before') or base['press'], "after": inc.get('press_after') or machine.get('pressure'), "unit": "PSI", "delta": round((inc.get('press_after') or machine.get('pressure')) - (inc.get('press_before') or base['press']), 1)},
        "risk_score": {"before": 15, "after": inc['risk_score'], "unit": "/100", "delta": inc['risk_score'] - 15},
        "status": {"before": "NORMAL", "after": inc['severity'].upper(), "unit": "", "delta": None}
    }
    
    # Root cause text logic
    atype = inc['anomaly_type'].lower()
    if "pressure" in atype:
        root_cause_desc = "Pressure-system instability or pneumatic line valve regulation failure is the primary contributing factor based on the abnormal line pressure spike."
        confidence = "High"
    elif "vibration" in atype:
        root_cause_desc = "Mechanical drive shaft misalignment, rotor imbalance, or bearing mechanical wear is the primary root cause based on excessive vibration levels."
        confidence = "High"
    elif "temperature" in atype or "thermal" in atype:
        root_cause_desc = "Liquid cooling loop restriction, radiator dust blockage, or heat exchanger pump thermal stress is the primary root cause."
        confidence = "High"
    elif "trend" in atype:
        root_cause_desc = "Continuous cumulative thermal and mechanical friction drift indicates progressive component wear and lubricant degradation."
        confidence = "Medium"
    else:
        root_cause_desc = "Multi-sensor thermal, mechanical vibration, and pneumatic pressure boundary exceedance requiring comprehensive multi-system overhaul."
        confidence = "High"

    # Incident timeline
    ts = inc.get('created_at') or datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    timeline = [
        {"time": ts, "title": "Normal Operation", "desc": f"{machine.get('name')} operating within normal baseline parameters."},
        {"time": ts, "title": f"Telemetry Anomaly Detected ({inc['anomaly_type']})", "desc": f"Parameter spike recorded: Temp={before_after['temperature']['after']}°C, Vib={before_after['vibration']['after']} mm/s, Press={before_after['pressure']['after']} PSI."},
        {"time": ts, "title": f"Risk Score Elevated ({inc['risk_score']}/100)", "desc": f"AI Risk engine re-classified machine status to {inc['severity'].upper()}."},
        {"time": ts, "title": "Alert & Investigation Logged", "desc": f"Smart alert logged and Incident #{inc['id']} generated in Control Center."},
        {"time": ts, "title": "AI Maintenance Action Plan Generated", "desc": recs[0] if recs else "Inspection recommended."}
    ]
    
    conn.close()
    
    return jsonify({
        "success": True,
        "incident": inc,
        "machine": machine,
        "before_after": before_after,
        "ai_root_cause": {
            "summary": root_cause_desc,
            "confidence": confidence,
            "factors": diag['reasons'],
            "disclaimer": "AI-generated analysis based on available sensor telemetry data."
        },
        "recommendations": recs,
        "timeline": timeline
    })

@incident_bp.route('/api/incidents/<incident_id>/status', methods=['PATCH'])
def update_incident_status(incident_id):
    data = request.get_json() or {}
    new_status = data.get('status')
    
    valid_statuses = ['Investigation Required', 'Under Investigation', 'Maintenance Scheduled', 'Resolved']
    if not new_status or new_status not in valid_statuses:
        return jsonify({"success": False, "error": f"Invalid status. Must be one of: {valid_statuses}"}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM incidents WHERE id = ?", (incident_id,))
    inc_row = cursor.fetchone()
    if not inc_row:
        conn.close()
        return jsonify({"success": False, "error": f"Incident {incident_id} not found."}), 404
        
    cursor.execute("UPDATE incidents SET status = ? WHERE id = ?", (new_status, incident_id))
    cursor.execute("INSERT INTO activity_logs (type, machine_name, message) VALUES ('System', ?, ?)",
                   (inc_row['machine_name'], f"Incident {incident_id} status updated to '{new_status}'."))
                   
    conn.commit()
    conn.close()
    
    return jsonify({
        "success": True,
        "message": f"Incident {incident_id} status updated to '{new_status}'.",
        "incident_id": incident_id,
        "status": new_status
    })
