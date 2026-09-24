from flask import Blueprint, jsonify, request
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.db import get_db_connection

alert_bp = Blueprint('alerts', __name__)

@alert_bp.route('/api/alerts', methods=['GET'])
def get_alerts():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM alerts ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    
    alerts = [dict(r) for r in rows]
    active_count = sum(1 for a in alerts if a['status'] == 'Active')
    critical_count = sum(1 for a in alerts if a['severity'] == 'Critical' and a['status'] == 'Active')
    warning_count = sum(1 for a in alerts if a['severity'] == 'Warning' and a['status'] == 'Active')
    resolved_count = sum(1 for a in alerts if a['status'] == 'Resolved')

    return jsonify({
        "success": True, 
        "alerts": alerts, 
        "count": len(alerts),
        "counters": {
            "active": active_count,
            "critical": critical_count,
            "warning": warning_count,
            "resolved": resolved_count
        }
    })

@alert_bp.route('/api/alerts/<int:alert_id>/resolve', methods=['PATCH', 'POST'])
def resolve_alert(alert_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT machine_name, title FROM alerts WHERE id = ?", (alert_id,))
    row = cursor.fetchone()
    
    cursor.execute("UPDATE alerts SET status = 'Resolved' WHERE id = ?", (alert_id,))
    
    if row:
        cursor.execute("INSERT INTO activity_logs (type, machine_name, message) VALUES ('Alert', ?, ?)",
                       (row['machine_name'], f"Alert resolved: {row['title']}"))
        
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": f"Alert #{alert_id} marked as resolved."})
