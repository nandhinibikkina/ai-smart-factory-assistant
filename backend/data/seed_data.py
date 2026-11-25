import sqlite3
import os
import random
from datetime import datetime, timedelta
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.db import get_db_connection, init_db

def seed_database():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DROP TABLE IF EXISTS machines")
    cursor.execute("DROP TABLE IF EXISTS telemetry_history")
    cursor.execute("DROP TABLE IF EXISTS alerts")
    cursor.execute("DROP TABLE IF EXISTS maintenance_schedules")
    cursor.execute("DROP TABLE IF EXISTS activity_logs")
    cursor.execute("DROP TABLE IF EXISTS production_logs")
    cursor.execute("DROP TABLE IF EXISTS factory_summary")
    cursor.execute("DROP TABLE IF EXISTS incidents")
    conn.commit()
    conn.close()

    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    now = datetime.now()
    d_last_1 = (now - timedelta(days=12)).strftime('%Y-%m-%d')
    d_next_1 = (now + timedelta(days=18)).strftime('%Y-%m-%d')
    
    d_last_2 = (now - timedelta(days=25)).strftime('%Y-%m-%d')
    d_next_2 = (now + timedelta(days=5)).strftime('%Y-%m-%d')

    d_last_3 = (now - timedelta(days=45)).strftime('%Y-%m-%d')
    d_next_3 = (now - timedelta(days=2)).strftime('%Y-%m-%d') # Overdue!

    d_last_4 = (now - timedelta(days=18)).strftime('%Y-%m-%d')
    d_next_4 = (now + timedelta(days=12)).strftime('%Y-%m-%d')

    d_last_5 = (now - timedelta(days=30)).strftime('%Y-%m-%d')
    d_next_5 = (now + timedelta(days=30)).strftime('%Y-%m-%d')

    d_last_6 = (now - timedelta(days=5)).strftime('%Y-%m-%d')
    d_next_6 = (now + timedelta(days=55)).strftime('%Y-%m-%d')

    # 6 Sample Machines with full extended telemetry
    # (id, name, type, temp, vib, press, hours, status, risk_score, output, eff, last_maint, next_maint, energy_kwh, energy_eff, x, y)
    machines_data = [
        ("MCH-001", "Machine 01 - Assembly Unit", "Assembly", 64.2, 1.8, 102.5, 1420.0, "Normal", 12.0, 980, 94.5, d_last_1, d_next_1, 42.5, 92.0, 1, 1),
        ("MCH-002", "Machine 02 - CNC Unit", "CNC Milling", 71.5, 2.9, 98.0, 2180.5, "Normal", 25.0, 920, 89.0, d_last_2, d_next_2, 58.0, 85.0, 2, 1),
        ("MCH-003", "Machine 03 - Packaging Unit", "Packaging", 88.5, 6.2, 128.4, 3850.0, "Critical", 89.0, 680, 68.5, d_last_3, d_next_3, 64.2, 71.0, 3, 2),
        ("MCH-004", "Machine 04 - Welding Unit", "Robotic Welding", 79.8, 3.8, 114.2, 1940.0, "Warning", 58.0, 790, 81.2, d_last_4, d_next_4, 76.5, 78.0, 1, 2),
        ("MCH-005", "Machine 05 - Conveyor Unit", "Material Handling", 58.0, 1.2, 95.0, 890.0, "Normal", 8.0, 1120, 96.0, d_last_5, d_next_5, 28.0, 95.0, 2, 2),
        ("MCH-006", "Machine 06 - Inspection Unit", "Optical Inspection", 52.4, 0.8, 91.5, 650.0, "Normal", 4.0, 930, 97.5, d_last_6, d_next_6, 21.0, 98.0, 3, 1)
    ]
    
    cursor.executemany('''
        INSERT INTO machines (
            id, name, type, temperature, vibration, pressure, operating_hours, status, risk_score,
            production_output, efficiency, last_maintenance_date, next_maintenance_date,
            energy_kwh, energy_efficiency, x_pos, y_pos, last_updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ''', machines_data)
    
    # Telemetry History (Last 24 hours trend for each machine)
    telemetry_records = []
    for m_id, name, m_type, base_t, base_v, base_p, hrs, status, risk, out, base_eff, lm, nm, ek, ee, x, y in machines_data:
        for i in range(24, -1, -1):
            ts = (now - timedelta(hours=i)).strftime('%Y-%m-%d %H:%M:%S')
            if m_id == "MCH-003": # Ramp up parameters to show continuous upward trend
                t = base_t - (i * 0.7) + random.uniform(-0.5, 0.5)
                v = base_v - (i * 0.14) + random.uniform(-0.1, 0.1)
                p = base_p - (i * 0.5) + random.uniform(-0.8, 0.8)
                eff = max(60.0, base_eff + (i * 0.8))
            elif m_id == "MCH-004":
                t = base_t - (i * 0.25) + random.uniform(-0.5, 0.5)
                v = base_v - (i * 0.04) + random.uniform(-0.1, 0.1)
                p = base_p + random.uniform(-0.5, 0.5)
                eff = base_eff + random.uniform(-1, 1)
            else:
                t = base_t + random.uniform(-1.0, 1.0)
                v = base_v + random.uniform(-0.1, 0.1)
                p = base_p + random.uniform(-1.0, 1.0)
                eff = base_eff + random.uniform(-1, 1)
            
            telemetry_records.append((m_id, round(t, 1), round(v, 2), round(p, 1), round(eff, 1), ts))
            
    cursor.executemany('''
        INSERT INTO telemetry_history (machine_id, temperature, vibration, pressure, efficiency, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', telemetry_records)
    
    # Sample Alerts
    alerts_data = [
        ("MCH-003", "Machine 03 - Packaging Unit", "Critical", "Thermal Stress & Bearing Anomaly",
         "Critical anomaly detected: High temperature (88.5°C) and elevated vibration (6.2 mm/s).", 
         "Inspect cooling liquid loop and replace main drive bearing.", "Active", (now - timedelta(minutes=18)).strftime('%Y-%m-%d %H:%M:%S')),
        ("MCH-004", "Machine 04 - Welding Unit", "Warning", "Elevated Thermal Level",
         "Warning level reached: Temperature (79.8°C) approaching maximum operating threshold.", 
         "Inspect cooling fan assembly and clear dust intake filters.", "Active", (now - timedelta(hours=1, minutes=10)).strftime('%Y-%m-%d %H:%M:%S')),
        ("MCH-002", "Machine 02 - CNC Unit", "Info", "Spindle Calibration Notice",
         "Routine calibration due within 50 operating hours.", 
         "Schedule spindle alignment check during upcoming shift break.", "Resolved", (now - timedelta(hours=5)).strftime('%Y-%m-%d %H:%M:%S'))
    ]
    
    cursor.executemany('''
        INSERT INTO alerts (machine_id, machine_name, severity, title, description, recommendation, status, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', alerts_data)

    # Maintenance Schedules
    maintenance_data = [
        ("MCH-003", "Machine 03 - Packaging Unit", "Overdue 500-hr Overhaul & Bearing Inspection", "Emergency", d_next_3, "Overdue", "Requires immediate cooling loop check and main bearing replacement."),
        ("MCH-002", "Machine 02 - CNC Unit", "Spindle Alignment & Calibration Check", "Scheduled", d_next_2, "Pending", "Perform precision spindle calibration."),
        ("MCH-004", "Machine 04 - Welding Unit", "Torch & Radiator Dust Intake Cleaning", "Preventive", d_next_4, "Pending", "Clean air intake filters and inspect weld head."),
        ("MCH-001", "Machine 01 - Assembly Unit", "Robotic Arm Joint Lubrication", "Preventive", d_next_1, "Pending", "Standard 1,500-hour lubrication service."),
        ("MCH-005", "Machine 05 - Conveyor Unit", "Belt Tension Calibration", "Preventive", d_last_5, "Completed", "Replaced drive belt and verified motor current.")
    ]

    cursor.executemany('''
        INSERT INTO maintenance_schedules (machine_id, machine_name, task_title, maintenance_type, due_date, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', maintenance_data)

    # Activity Feed Logs
    activity_data = [
        ("Alert", "Machine 03 - Packaging Unit", "CRITICAL Alert generated: Temperature 88.5°C & Vibration 6.2 mm/s exceed thresholds.", (now - timedelta(minutes=18)).strftime('%Y-%m-%d %H:%M:%S')),
        ("StatusChange", "Machine 03 - Packaging Unit", "Status changed: NORMAL -> CRITICAL (Risk Score: 89/100)", (now - timedelta(minutes=20)).strftime('%Y-%m-%d %H:%M:%S')),
        ("Maintenance", "Machine 04 - Welding Unit", "Preventive maintenance work order generated.", (now - timedelta(hours=1, minutes=10)).strftime('%Y-%m-%d %H:%M:%S')),
        ("Production", "Factory Fleet", "Day shift production target updated to 5,770 units.", (now - timedelta(hours=4)).strftime('%Y-%m-%d %H:%M:%S')),
        ("System", "Factory Fleet", "AI Risk Detection engine initialized with 99% baseline model accuracy.", (now - timedelta(hours=6)).strftime('%Y-%m-%d %H:%M:%S'))
    ]

    cursor.executemany('''
        INSERT INTO activity_logs (type, machine_name, message, timestamp)
        VALUES (?, ?, ?, ?)
    ''', activity_data)
    
    # Production Logs (Last 7 Days)
    production_records = []
    for day_offset in range(6, -1, -1):
        date_str = (now - timedelta(days=day_offset)).strftime('%Y-%m-%d')
        m_production = [
            ("MCH-001", random.randint(950, 1050), 1000, random.randint(5, 15)),
            ("MCH-002", random.randint(880, 960), 950, random.randint(10, 25)),
            ("MCH-003", random.randint(620, 750) if day_offset <= 1 else random.randint(880, 950), 900, random.randint(45, 90) if day_offset <= 1 else 15),
            ("MCH-004", random.randint(750, 820), 850, random.randint(15, 30)),
            ("MCH-005", random.randint(1100, 1200), 1150, random.randint(0, 10)),
            ("MCH-006", random.randint(900, 950), 920, random.randint(0, 5))
        ]
        for m_id, prod, target, downtime in m_production:
            eff = round((prod / target) * 100.0, 1)
            production_records.append((date_str, m_id, prod, target, eff, downtime))
            
    cursor.executemany('''
        INSERT INTO production_logs (date, machine_id, produced_units, target_units, efficiency, downtime_mins)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', production_records)
    
    # Incidents
    incidents_data = [
        ("INC-003", "MCH-003", "Machine 03 - Packaging Unit", "Combined Anomaly", "Critical", 89, "Investigation Required", 66.0, 88.5, 1.9, 6.2, 101.0, 128.4, "Thermal Stress & Bearing Anomaly", "High", (now - timedelta(minutes=18)).strftime('%Y-%m-%d %H:%M:%S')),
        ("INC-004", "MCH-004", "Machine 04 - Welding Unit", "High Temperature", "Warning", 58, "Investigation Required", 68.4, 79.8, 2.1, 3.8, 99.5, 114.2, "Elevated Thermal Level", "High", (now - timedelta(hours=1, minutes=10)).strftime('%Y-%m-%d %H:%M:%S'))
    ]

    cursor.executemany('''
        INSERT INTO incidents (
            id, machine_id, machine_name, anomaly_type, severity, risk_score, status,
            temp_before, temp_after, vib_before, vib_after, press_before, press_after,
            root_cause, confidence, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', incidents_data)

    conn.commit()
    conn.close()
    print("Database seeded with extended Industry 4.0 sample data.")

if __name__ == '__main__':
    seed_database()
