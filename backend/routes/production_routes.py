from flask import Blueprint, jsonify, request
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.db import get_db_connection
from models.risk_model import calculate_factory_health_score

production_bp = Blueprint('production', __name__)

@production_bp.route('/api/production', methods=['GET'])
def get_production_analytics():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Summary card KPIs
    cursor.execute("SELECT * FROM factory_summary WHERE id = 1")
    summary = dict(cursor.fetchone() or {"produced_output": 5140, "target_output": 5770, "efficiency": 89.1, "health_score": 84, "downtime_hrs": 1.8})
    
    # Machines for health score calculation
    cursor.execute("SELECT * FROM machines")
    machines = [dict(r) for r in cursor.fetchall()]
    
    cursor.execute("SELECT COUNT(*) as count FROM alerts WHERE status = 'Active'")
    active_alerts_count = cursor.fetchone()['count']

    # Activity Feed (last 10 events)
    cursor.execute("SELECT * FROM activity_logs ORDER BY id DESC LIMIT 10")
    activity_logs = [dict(r) for r in cursor.fetchall()]

    # Calculate overall Factory Health Score (0 to 100)
    health_res = calculate_factory_health_score(
        machines, 
        active_alerts_count, 
        summary['efficiency'], 
        summary.get('downtime_hrs', 1.8)
    )
    summary['health_score'] = health_res['health_score']
    summary['health_status'] = health_res['status']
    summary['health_factors'] = health_res['factors']

    # Daily production totals (last 7 days)
    cursor.execute('''
        SELECT date, SUM(produced_units) as total_produced, SUM(target_units) as total_target, 
               AVG(efficiency) as avg_efficiency, SUM(downtime_mins) as total_downtime
        FROM production_logs
        GROUP BY date
        ORDER BY date ASC
    ''')
    daily_production = [dict(r) for r in cursor.fetchall()]
    
    # Machine-wise production breakdown
    cursor.execute('''
        SELECT m.id, m.name, m.type, m.status, m.risk_score,
               COALESCE(SUM(p.produced_units), 0) as produced, 
               COALESCE(SUM(p.target_units), 0) as target,
               COALESCE(AVG(p.efficiency), 0) as efficiency,
               COALESCE(SUM(p.downtime_mins), 0) as downtime_mins
        FROM machines m
        LEFT JOIN production_logs p ON m.id = p.machine_id
        GROUP BY m.id
        ORDER BY m.id ASC
    ''')
    machine_efficiency = [dict(r) for r in cursor.fetchall()]
    
    # Status distribution
    cursor.execute("SELECT status, COUNT(*) as count FROM machines GROUP BY status")
    status_dist = {r['status']: r['count'] for r in cursor.fetchall()}
    for st in ['Normal', 'Warning', 'Critical']:
        if st not in status_dist:
            status_dist[st] = 0
            
    conn.close()
    
    return jsonify({
        "success": True,
        "summary": summary,
        "daily_production": daily_production,
        "machine_efficiency": machine_efficiency,
        "status_distribution": status_dist,
        "activity_logs": activity_logs
    })
