def generate_maintenance_recommendations(temperature, vibration, pressure, operating_hours, status):
    """
    Generates actionable inspection & maintenance recommendations with diagnostic explanations ("Why this recommendation?").
    """
    recommendations = []
    
    if status == "Normal":
        return [
            "No immediate intervention required. Continue standard operational monitoring.",
            "Schedule regular preventive inspection during next scheduled downtime."
        ]
        
    if temperature > 85.0:
        recommendations.append("Inspect liquid cooling system, check coolant fluid level, and clean radiator fans. (Why: High temperature indicates thermal stress)")
        recommendations.append("Inspect thermal sensors and verify heat exchanger pump pressure. (Why: Heat buildup can damage internal electronics)")
    elif temperature > 75.0:
        recommendations.append("Monitor thermal levels closely; check airflow vents for blockages. (Why: Temperature entering warning threshold)")
        
    if vibration > 5.5:
        recommendations.append("Perform urgent vibration spectral analysis; check drive shaft alignment and rotor balance. (Why: Excessive vibration indicates severe mechanical bearing stress)")
        recommendations.append("Inspect main bearing assemblies for mechanical wear and replace worn components. (Why: Prevent catastrophic bearing failure)")
    elif vibration > 3.2:
        recommendations.append("Check mounting bolt torque and lubricate drive shaft bearings. (Why: Vibration elevated above 3.2 mm/s baseline)")

    if pressure < 75.0:
        recommendations.append("Inspect pneumatic/hydraulic lines for pressure leakage or line restriction. (Why: Line pressure below 75 PSI safety threshold)")
        recommendations.append("Check intake valve seal integrity and pump compression output. (Why: Pressure drop causes operational inefficiency)")
    elif pressure > 125.0:
        recommendations.append("Calibrate pressure relief valve #3; check for downstream line blockages. (Why: Pressure spike above 125 PSI nominal limit)")
        
    if operating_hours > 3500:
        recommendations.append("Schedule 3,500+ hour major service overhaul including belt replacement and oil filter change. (Why: High operating hours increase wear probability)")

    if not recommendations:
        if status == "Critical":
            recommendations.append("Halt machine operation and dispatch field maintenance team for diagnostic check. (Why: Machine operating in critical risk state)")
        elif status == "Warning":
            recommendations.append("Conduct comprehensive visual inspection within next 8 operating hours. (Why: Early anomaly detection prevents downtime)")

    return recommendations
