from flask import Blueprint, jsonify, request
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.risk_model import calculate_transparent_risk_score

simulator_bp = Blueprint('simulator', __name__)

@simulator_bp.route('/api/simulator/analyze', methods=['POST'])
def analyze_scenario():
    data = request.get_json() or {}
    
    try:
        temp = float(data.get('temperature', 70.0))
        vib = float(data.get('vibration', 2.5))
        press = float(data.get('pressure', 100.0))
        hrs = float(data.get('operating_hours', 1500.0))
        baseline_temp = float(data.get('baseline_temperature', 65.0))
        baseline_vib = float(data.get('baseline_vibration', 1.8))
        baseline_press = float(data.get('baseline_pressure', 100.0))
        baseline_hrs = float(data.get('baseline_hours', 1500.0))
    except (ValueError, TypeError):
        return jsonify({"success": False, "error": "Invalid numerical parameters."}), 400

    # Calculate baseline vs simulated scenario
    baseline_result = calculate_transparent_risk_score(baseline_temp, baseline_vib, baseline_press, baseline_hrs)
    simulated_result = calculate_transparent_risk_score(temp, vib, press, hrs)
    
    delta_score = simulated_result['risk_score'] - baseline_result['risk_score']
    
    explanation = f"Simulated Scenario Risk Score: {simulated_result['risk_score']}/100 ({simulated_result['risk_level']}). "
    if delta_score > 0:
        explanation += f"Risk score increased by +{delta_score} points due to elevated sensor parameters."
    elif delta_score < 0:
        explanation += f"Risk score decreased by {delta_score} points towards optimal baseline."
    else:
        explanation += "Risk score remains identical to baseline condition."

    return jsonify({
        "success": True,
        "baseline_risk": baseline_result,
        "simulated_risk": simulated_result,
        "delta_score": delta_score,
        "explanation": explanation
    })
