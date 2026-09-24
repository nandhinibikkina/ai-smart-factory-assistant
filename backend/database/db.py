import sqlite3
import os
import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'factory.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Table: machines
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS machines (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            temperature REAL NOT NULL,
            vibration REAL NOT NULL,
            pressure REAL NOT NULL,
            operating_hours REAL NOT NULL,
            status TEXT NOT NULL, -- Normal, Warning, Critical
            risk_score REAL NOT NULL, -- 0 to 100
            production_output INTEGER DEFAULT 850,
            efficiency REAL DEFAULT 92.0,
            last_maintenance_date TEXT,
            next_maintenance_date TEXT,
            energy_kwh REAL DEFAULT 45.0,
            energy_efficiency REAL DEFAULT 90.0,
            x_pos INTEGER DEFAULT 1,
            y_pos INTEGER DEFAULT 1,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Table: telemetry_history
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS telemetry_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            machine_id TEXT NOT NULL,
            temperature REAL NOT NULL,
            vibration REAL NOT NULL,
            pressure REAL NOT NULL,
            efficiency REAL DEFAULT 90.0,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (machine_id) REFERENCES machines (id)
        )
    ''')
    
    # Table: alerts
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            machine_id TEXT NOT NULL,
            machine_name TEXT NOT NULL,
            severity TEXT NOT NULL, -- Critical, Warning, Info
            title TEXT DEFAULT 'Machine Alert',
            description TEXT NOT NULL,
            recommendation TEXT,
            status TEXT DEFAULT 'Active', -- Active, Resolved
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (machine_id) REFERENCES machines (id)
        )
    ''')

    # Table: maintenance_schedules
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS maintenance_schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            machine_id TEXT NOT NULL,
            machine_name TEXT NOT NULL,
            task_title TEXT NOT NULL,
            maintenance_type TEXT NOT NULL, -- Scheduled, Preventive, Emergency
            due_date TEXT NOT NULL,
            status TEXT DEFAULT 'Pending', -- Pending, Overdue, Completed
            notes TEXT,
            FOREIGN KEY (machine_id) REFERENCES machines (id)
        )
    ''')

    # Table: activity_logs
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL, -- StatusChange, Alert, Maintenance, System
            machine_name TEXT,
            message TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Table: production_logs
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS production_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            machine_id TEXT NOT NULL,
            produced_units INTEGER NOT NULL,
            target_units INTEGER NOT NULL,
            efficiency REAL NOT NULL,
            downtime_mins INTEGER DEFAULT 0,
            shift TEXT DEFAULT 'Day'
        )
    ''')

    # Table: factory_summary
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS factory_summary (
            id INTEGER PRIMARY KEY DEFAULT 1,
            target_output INTEGER DEFAULT 5770,
            produced_output INTEGER DEFAULT 5140,
            efficiency REAL DEFAULT 89.1,
            health_score INTEGER DEFAULT 84,
            downtime_hrs REAL DEFAULT 1.5,
            total_energy_kwh REAL DEFAULT 285.5
        )
    ''')

    # Table: incidents
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS incidents (
            id TEXT PRIMARY KEY,
            machine_id TEXT NOT NULL,
            machine_name TEXT NOT NULL,
            anomaly_type TEXT NOT NULL,
            severity TEXT NOT NULL,
            risk_score INTEGER NOT NULL,
            status TEXT DEFAULT 'Investigation Required',
            temp_before REAL,
            temp_after REAL,
            vib_before REAL,
            vib_after REAL,
            press_before REAL,
            press_after REAL,
            root_cause TEXT,
            confidence TEXT DEFAULT 'High',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (machine_id) REFERENCES machines (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("SQLite database schema initialized successfully.")

if __name__ == '__main__':
    init_db()
