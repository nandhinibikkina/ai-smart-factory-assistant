import os
import sys
import threading
import time
from flask import Flask, jsonify, send_from_directory
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

@app.route('/api/health', methods=['GET', 'HEAD'], strict_slashes=False)
@app.route('/health', methods=['GET', 'HEAD'], strict_slashes=False)
def health():
    return jsonify({
        "status": "healthy",
        "online": True,
        "mode": "production",
        "app": "AI Smart Factory Assistant",
        "version": "2.0.0"
    }), 200

dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'))

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    # Normalize path
    clean_path = path.strip('/')
    if clean_path in ('api/health', 'health'):
        return health()

    # Don't hijack undefined /api routes
    if clean_path.startswith('api'):
        return jsonify({"success": False, "error": f"API endpoint '/{path}' not found"}), 404

    # Serve static assets if file exists in dist
    if path != "" and os.path.exists(os.path.join(dist_dir, path)):
        return send_from_directory(dist_dir, path)
    # Serve index.html for client-side routing (SPA fallback)
    elif os.path.exists(os.path.join(dist_dir, 'index.html')):
        return send_from_directory(dist_dir, 'index.html')
    else:
        # Fallback API information when frontend is not built
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
_simulation_started = False
def start_background_simulation():
    global _simulation_started
    if _simulation_started:
        return
    _simulation_started = True

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

_initialized = False
def initialize_application():
    global _initialized
    if _initialized:
        return
    _initialized = True

    init_db()
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

# Initialize application when module is imported (ensures Gunicorn in Cloud Run starts properly)
initialize_application()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"AI Smart Factory Assistant Backend listening on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
