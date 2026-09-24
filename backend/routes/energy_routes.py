from flask import Blueprint, jsonify, request
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.db import get_db_connection

energy_bp = Blueprint('energy', __name__)

@energy_bp.route('/api/energy', methods=['GET'])
def get_energy_metrics():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, name, type, status, energy_kwh, energy_efficiency, temperature, vibration FROM machines ORDER BY energy_kwh DESC")
    machine_rows = cursor.fetchall()
    conn.close()
    
    machines = []
    total_energy = 0.0
    high_energy_machines = []
    
    for r in machine_rows:
        m = dict(r)
        total_energy += m['energy_kwh']
        # Identify high energy or low efficiency machines
        if m['energy_kwh'] > 60.0 or m['energy_efficiency'] < 80.0 or m['status'] in ['Warning', 'Critical']:
            m['energy_status'] = 'Attention Required' if m['energy_kwh'] > 65.0 else 'High Usage'
            m['suggestion'] = f"Review machine operating efficiency on {m['name']} and schedule thermal/vibration inspection."
            high_energy_machines.append(m)
        else:
            m['energy_status'] = 'Optimal'
            m['suggestion'] = "Energy consumption is within nominal efficiency limits."
        machines.append(m)
        
    avg_efficiency = sum(m['energy_efficiency'] for m in machines) / len(machines) if machines else 90.0

    return jsonify({
        "success": True,
        "is_simulated": True,
        "summary": {
            "total_energy_kwh": round(total_energy, 1),
            "average_energy_efficiency": round(avg_efficiency, 1),
            "high_energy_count": len(high_energy_machines)
        },
        "machines": machines,
        "high_energy_machines": high_energy_machines
    })
