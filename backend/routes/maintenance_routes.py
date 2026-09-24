from flask import Blueprint, jsonify, request
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.db import get_db_connection

maintenance_bp = Blueprint('maintenance', __name__)

@maintenance_bp.route('/api/maintenance', methods=['GET'])
def get_maintenance():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM maintenance_schedules ORDER BY due_date ASC")
    schedules = [dict(r) for r in cursor.fetchall()]
    
    overdue = [s for s in schedules if s['status'] == 'Overdue']
    pending = [s for s in schedules if s['status'] == 'Pending']
    completed = [s for s in schedules if s['status'] == 'Completed']
    
    conn.close()
    return jsonify({
        "success": True,
        "schedules": schedules,
        "counts": {
            "overdue": len(overdue),
            "pending": len(pending),
            "completed": len(completed),
            "total": len(schedules)
        }
    })

@maintenance_bp.route('/api/maintenance/schedule', methods=['POST'])
def schedule_maintenance():
    data = request.get_json() or {}
    m_id = data.get('machine_id', 'MCH-003')
    task_title = data.get('task_title', 'Preventive Inspection & Calibration').strip()
    m_type = data.get('maintenance_type', 'Preventive')
    due_date = data.get('due_date', '')
    notes = data.get('notes', 'Scheduled via AI Control Center').strip()
    
    if not task_title or not due_date:
        return jsonify({"success": False, "error": "Task title and due date are required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM machines WHERE id = ?", (m_id,))
    row = cursor.fetchone()
    m_name = row['name'] if row else m_id
    
    cursor.execute('''
        INSERT INTO maintenance_schedules (machine_id, machine_name, task_title, maintenance_type, due_date, status, notes)
        VALUES (?, ?, ?, ?, ?, 'Pending', ?)
    ''', (m_id, m_name, task_title, m_type, due_date, notes))
    
    cursor.execute("INSERT INTO activity_logs (type, machine_name, message) VALUES ('Maintenance', ?, ?)",
                   (m_name, f"New {m_type} maintenance scheduled: '{task_title}' due {due_date}."))
    
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": f"Maintenance scheduled for {m_name}."})

@maintenance_bp.route('/api/maintenance/<int:schedule_id>/complete', methods=['PATCH', 'POST'])
def complete_maintenance(schedule_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT machine_name, task_title FROM maintenance_schedules WHERE id = ?", (schedule_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({"success": False, "error": "Schedule not found"}), 404

    m_name = row['machine_name']
    title = row['task_title']

    cursor.execute("UPDATE maintenance_schedules SET status = 'Completed' WHERE id = ?", (schedule_id,))
    cursor.execute("INSERT INTO activity_logs (type, machine_name, message) VALUES ('Maintenance', ?, ?)",
                   (m_name, f"Maintenance completed: '{title}' for {m_name}."))
    
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": f"Maintenance #{schedule_id} marked as completed."})
