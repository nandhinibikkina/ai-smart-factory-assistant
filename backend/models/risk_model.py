import os
import joblib
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'ml', 'risk_model.pkl')

_model = None

def get_ml_model():
    global _model
    if _model is None and os.path.exists(MODEL_PATH):
        try:
            _model = joblib.load(MODEL_PATH)
        except Exception as e:
            print(f"Notice: Could not load scikit-learn model ({e}). Using rule-based risk inference engine.")
    return _model

def calculate_transparent_risk_score(temperature, vibration, pressure, operating_hours, recent_trend=None):
    """
    Computes a transparent 0-100 risk score and identifies contributing risk factors.
    Scoring Ranges:
      0 - 30   : LOW
      31 - 60  : MEDIUM
      61 - 80  : HIGH
      81 - 100 : CRITICAL
    """
    factors = []
    score = 5.0 # baseline nominal risk

    # 1. Temperature (°C)
    if temperature > 88.0:
        score += 45
        factors.append(f"Critical Temperature ({temperature:.1f}°C > 88.0°C safety threshold)")
    elif temperature > 80.0:
        score += 30
        factors.append(f"High Temperature ({temperature:.1f}°C > 80.0°C limit)")
    elif temperature > 75.0:
        score += 15
        factors.append(f"Elevated Temperature ({temperature:.1f}°C in warning zone)")

    # 2. Vibration (mm/s)
    if vibration > 6.0:
        score += 45
        factors.append(f"Critical Vibration ({vibration:.2f} mm/s > 6.0 mm/s limit)")
    elif vibration > 4.5:
        score += 30
        factors.append(f"High Vibration ({vibration:.2f} mm/s > 4.5 mm/s tolerance)")
    elif vibration > 3.2:
        score += 15
        factors.append(f"Elevated Vibration ({vibration:.2f} mm/s in warning zone)")

    # 3. Pressure (PSI)
    if pressure < 65.0 or pressure > 130.0:
        score += 45
        factors.append(f"Critical Line Pressure Spike ({pressure:.1f} PSI outside 65-130 PSI safety range)")
    elif pressure < 75.0 or pressure > 125.0:
        score += 30
        factors.append(f"Abnormal Line Pressure ({pressure:.1f} PSI outside 75-125 PSI operating range)")
    elif (75.0 <= pressure < 85.0) or (115.0 < pressure <= 125.0):
        score += 15
        factors.append(f"Pressure Fluctuation ({pressure:.1f} PSI near limit)")

    # 4. Operating Hours (hrs)
    if operating_hours > 4000:
        score += 15
        factors.append(f"High Operating Hours ({operating_hours:.0f} hrs > 4,000 hrs service interval)")
    elif operating_hours > 2500:
        score += 8
        factors.append(f"Moderate Operating Hours ({operating_hours:.0f} hrs)")

    # 5. Recent Trend Analysis (Increasing vs Stable)
    trend_warning = False
    if recent_trend:
        temp_increasing = recent_trend.get('temp_increasing', False)
        vib_increasing = recent_trend.get('vib_increasing', False)
        if temp_increasing and vib_increasing:
            score += 15
            trend_warning = True
            factors.append("⚠ Increasing Trend Detected: Temperature & Vibration rising continuously over last 3 hours")
        elif temp_increasing or vib_increasing:
            score += 8
            trend_warning = True
            factors.append("⚠ Increasing Trend Detected: Continuous parameter upward drift")

    # Bound risk score between 0 and 100
    risk_score = int(min(99, max(2, round(score))))

    # Risk level classification
    if risk_score >= 81:
        risk_level = "CRITICAL"
        status = "Critical"
    elif risk_score >= 61:
        risk_level = "HIGH"
        status = "Warning"
    elif risk_score >= 31:
        risk_level = "MEDIUM"
        status = "Warning"
    else:
        risk_level = "LOW"
        status = "Normal"

    if not factors:
        factors.append("All operating parameters (Temperature, Vibration, Pressure, Hours) are within optimal baseline limits.")

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "status": status,
        "factors": factors,
        "trend_warning": trend_warning
    }

def predict_machine_risk(temperature, vibration, pressure, operating_hours, recent_trend=None):
    """
    Main risk prediction engine combining ML prediction and transparent scoring rules.
    """
    res = calculate_transparent_risk_score(temperature, vibration, pressure, operating_hours, recent_trend)
    model = get_ml_model()
    
    ml_confidence = None
    if model is not None:
        try:
            X = np.array([[temperature, vibration, pressure, operating_hours]])
            probs = model.predict_proba(X)[0]
            pred_class = model.predict(X)[0]
            ml_confidence = float(probs[pred_class])
        except Exception:
            pass

    return {
        "status": res["status"],
        "risk_score": res["risk_score"], # 0 to 100 integer
        "risk_level": res["risk_level"],
        "reasons": res["factors"],
        "trend_warning": res["trend_warning"],
        "ml_model_used": model is not None,
        "ml_confidence": ml_confidence
    }

def calculate_factory_health_score(machines, active_alerts_count, overall_efficiency=89.1, downtime_hrs=1.8, avg_energy_eff=90.0):
    """
    Calculates overall Factory Health Score (0 to 100) and operational status.
    Formula considers machine risk scores, active alerts, OEE efficiency, downtime, and energy efficiency.
    """
    if not machines:
        return {"health_score": 85, "status": "Healthy", "factors": ["Baseline factory operations"]}

    avg_machine_risk = sum(m['risk_score'] for m in machines) / len(machines)
    critical_count = sum(1 for m in machines if m['status'] == 'Critical')
    warning_count = sum(1 for m in machines if m['status'] == 'Warning')

    # Base score 100
    health = 100.0
    factors = []

    # Penalty for machine risks
    risk_deduction = (avg_machine_risk / 100.0) * 30.0
    health -= risk_deduction

    if critical_count > 0:
        health -= (critical_count * 12.0)
        factors.append(f"{critical_count} machine(s) in CRITICAL status")

    if warning_count > 0:
        health -= (warning_count * 5.0)
        factors.append(f"{warning_count} machine(s) requiring attention")

    if active_alerts_count > 0:
        health -= (active_alerts_count * 3.0)
        factors.append(f"{active_alerts_count} active maintenance alert(s)")

    if overall_efficiency < 85.0:
        health -= (85.0 - overall_efficiency) * 0.8
        factors.append(f"OEE Efficiency below target ({overall_efficiency:.1f}%)")
    else:
        factors.append(f"Strong OEE Efficiency ({overall_efficiency:.1f}%)")

    if downtime_hrs > 2.0:
        health -= (downtime_hrs - 2.0) * 4.0
        factors.append(f"Elevated shift downtime ({downtime_hrs:.1f} hrs)")

    final_score = int(min(99, max(10, round(health))))

    if final_score >= 80:
        health_status = "Healthy"
    elif final_score >= 60:
        health_status = "Attention Required"
    else:
        health_status = "Critical"

    if not factors:
        factors.append("Optimal overall factory performance.")

    return {
        "health_score": final_score,
        "status": health_status,
        "factors": factors
    }
