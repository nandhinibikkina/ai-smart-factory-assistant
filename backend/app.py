import os
import sys
import threading
import time
from flask import Flask, jsonify
from flask_cors import CORS

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from database.db import init_db, get_db_connection
from data.seed_data import seed_database
from routes.machine_routes import machine_bp
from routes.alert_routes import alert_bp
from routes.production_routes import production_bp
from routes.ai_routes import ai_bp
from routes.simulator_routes import simulator_bp
from routes.demo_routes import demo_bp
from routes.maintenance_routes import maintenance_bp
from routes.energy_routes import energy_bp
from routes.incident_routes import incident_bp
from services.simulation_service import tick_simulation

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register blueprints
app.register_blueprint(machine_bp)
app.register_blueprint(alert_bp)
app.register_blueprint(production_bp)
app.register_blueprint(ai_bp)
app.register_blueprint(simulator_bp)
app.register_blueprint(demo_bp)
app.register_blueprint(maintenance_bp)
app.register_blueprint(energy_bp)
app.register_blueprint(incident_bp)

@app.route('/api/health')
def health():
    return jsonify({"status": "online", "mode": "backend"})

@app.route('/')
def index():
    return jsonify({
        "status": "online",
        "app": "AI Smart Factory Assistant Backend API",
        "version": "2.0.0",
        "endpoints": [
            "/api/machines",
            "/api/machines/<id>",
            "/api/machines/trigger-anomaly",
            "/api/machines/reset-simulation",
            "/api/alerts",
            "/api/alerts/<id>/resolve",
            "/api/production",
            "/api/ai/chat",
            "/api/simulator/analyze",
            "/api/demo/step",
            "/api/demo/reset",
            "/api/maintenance",
            "/api/maintenance/schedule",
            "/api/maintenance/<id>/complete",
            "/api/energy"
        ]
    })

# Background sensor telemetry simulator thread
def start_background_simulation():
    def run_sim():
        while True:
            time.sleep(10) # Tick simulation every 10 seconds
            try:
                tick_simulation()
            except Exception as e:
                print(f"Simulation tick error: {e}")
                
    t = threading.Thread(target=run_sim, daemon=True)
    t.start()
    print("Background machine sensor simulator started.")

def initialize_application():
    init_db()
    db_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database', 'factory.db')
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as count FROM machines")
    count = cursor.fetchone()['count']
    conn.close()
    if count < 6:
        seed_database()

    # Train ML model if not created yet
    ml_model_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'ml', 'risk_model.pkl')
    if not os.path.exists(ml_model_file):
        try:
            from ml.train_model import train_and_save_model
            train_and_save_model()
        except Exception as e:
            print(f"Notice: ML model training skipped or using rule fallback: {e}")

    start_background_simulation()

if __name__ == '__main__':
    initialize_application()
    print("AI Smart Factory Assistant Backend listening on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)
