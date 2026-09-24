import re
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.db import get_db_connection
from models.risk_model import predict_machine_risk, calculate_factory_health_score
from services.maintenance_service import generate_maintenance_recommendations

def process_ai_query(question):
    """
    Upgraded context-aware AI Factory Assistant that answers natural language questions using live SQLite data.
    """
    q_lower = question.lower().strip()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM machines ORDER BY id ASC")
    machines = [dict(r) for r in cursor.fetchall()]
    
    cursor.execute("SELECT * FROM alerts WHERE status = 'Active'")
    active_alerts = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM incidents WHERE status != 'Resolved' ORDER BY created_at DESC")
    active_incidents = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM maintenance_schedules WHERE status != 'Completed'")
    active_maintenance = [dict(r) for r in cursor.fetchall()]
    
    cursor.execute("SELECT * FROM factory_summary WHERE id = 1")
    summary_row = cursor.fetchone()
    summary = dict(summary_row) if summary_row else {"produced_output": 5140, "target_output": 5770, "efficiency": 89.1, "health_score": 84, "downtime_hrs": 1.8}
    
    conn.close()
    
    critical_machines = [m for m in machines if m['status'] == 'Critical']
    warning_machines = [m for m in machines if m['status'] == 'Warning']
    normal_machines = [m for m in machines if m['status'] == 'Normal']

    # 0. Incident Queries: "incident", "active incident", "caused", "investigate"
    if any(k in q_lower for k in ["incident", "investigation", "active incident", "what caused", "why did this incident happen"]):
        if active_incidents:
            ans = f"🔎 **{len(active_incidents)} Active Machine Incident(s) Logged**:\n\n"
            for inc in active_incidents:
                ans += f"• **[{inc['id']}] {inc['machine_name']}** ({inc['severity']} - Risk: {inc['risk_score']}/100)\n"
                ans += f"  - *Anomaly Type*: {inc['anomaly_type']}\n"
                ans += f"  - *Status*: **{inc['status']}**\n"
                ans += f"  - *Root Cause*: {inc.get('root_cause', 'Telemetry threshold exceedance.')}\n\n"
            ans += "Open the **AI Incident Investigation** page (`/incidents`) for full Before vs After impact analysis and work order generation."
            return ans
        else:
            return "✅ No active machine incidents requiring investigation at this time. All machines are operating within normal baseline limits."
        matched_m = []
        for m in machines:
            m_num = m['id'].split('-')[-1].lstrip('0')
            if f"machine {m_num}" in q_lower or f"machine 0{m_num}" in q_lower or m['id'].lower() in q_lower or m['type'].lower() in q_lower:
                matched_m.append(m)

        if len(matched_m) >= 2:
            m1, m2 = matched_m[0], matched_m[1]
            ans = f"⚖️ **Comparative Telemetry Breakdown: {m1['name']} vs {m2['name']}**\n\n"
            ans += f"| Metric | {m1['name']} | {m2['name']} |\n"
            ans += f"| :--- | :--- | :--- |\n"
            ans += f"| **Status** | **{m1['status']}** | **{m2['status']}** |\n"
            ans += f"| **Risk Score** | {m1['risk_score']}/100 | {m2['risk_score']}/100 |\n"
            ans += f"| **Temperature** | {m1['temperature']}°C | {m2['temperature']}°C |\n"
            ans += f"| **Vibration** | {m1['vibration']} mm/s | {m2['vibration']} mm/s |\n"
            ans += f"| **Pressure** | {m1['pressure']} PSI | {m2['pressure']} PSI |\n"
            ans += f"| **Efficiency** | {m1['efficiency']}% | {m2['efficiency']}% |\n"
            ans += f"| **Energy Usage** | {m1['energy_kwh']} kWh | {m2['energy_kwh']} kWh |\n\n"
            ans += f"**Key Takeaway**: **{m2['name']}** has a higher risk score ({m2['risk_score']}/100) compared to **{m1['name']}** ({m1['risk_score']}/100) due to elevated sensor parameters."
            return ans

    # 2. "Which machine has the highest risk?" / "highest risk" / "most critical"
    if any(phrase in q_lower for phrase in ["highest risk", "most critical", "worst machine", "highest risk machine"]):
        highest_m = max(machines, key=lambda x: x['risk_score'])
        ans = f"🚨 **{highest_m['name']}** has the **HIGHEST RISK** in the factory fleet with a Risk Score of **{highest_m['risk_score']}/100** ({highest_m['status'].upper()}).\n\n"
        ans += f"- **Temperature**: {highest_m['temperature']}°C\n"
        ans += f"- **Vibration**: {highest_m['vibration']} mm/s\n"
        ans += f"- **Pressure**: {highest_m['pressure']} PSI\n"
        ans += f"- **Operating Hours**: {highest_m['operating_hours']} hrs\n\n"
        ans += f"**Recommendation**: Immediate inspection required to prevent unplanned downtime."
        return ans

    # 3. "Which machine needs attention?" / "attention" / "failing"
    if any(phrase in q_lower for phrase in ["attention", "failing", "problem", "issue", "critical machine", "which machine"]):
        if critical_machines:
            m_list_str = ", ".join([m['name'] for m in critical_machines])
            m = critical_machines[0]
            ans = f"🚨 **{m_list_str}** requires immediate attention!\n\n"
            ans += f"**Primary Concern**: {m['name']} is currently in **CRITICAL** status with a Risk Score of **{m['risk_score']}/100**.\n\n"
            ans += f"- Temperature: **{m['temperature']}°C**\n- Vibration: **{m['vibration']} mm/s**\n- Pressure: **{m['pressure']} PSI**\n\n"
            ans += f"**Reason**: Temperature and vibration exceed standard safety tolerances, indicating thermal stress and potential bearing failure risk.\n\n"
            ans += f"**Immediate Action**: Inspect the liquid cooling loop, check bearing assemblies, and schedule urgent maintenance."
            return ans
        elif warning_machines:
            m_list_str = ", ".join([m['name'] for m in warning_machines])
            ans = f"⚠️ **{m_list_str}** is in **WARNING** state (Risk Score: {warning_machines[0]['risk_score']}/100) and should be inspected soon."
            return ans
        else:
            return "✅ All factory machines are currently running in **NORMAL** operating status. No machines require immediate attention!"

    # 4. "Which machines are normal?" / "normal machines"
    if any(phrase in q_lower for phrase in ["normal machines", "which machines are normal", "healthy machines"]):
        if normal_machines:
            names = [f"• **{m['name']}** ({m['temperature']}°C, {m['vibration']} mm/s)" for m in normal_machines]
            ans = f"🟢 **{len(normal_machines)} Machines are operating in NORMAL baseline status**:\n\n" + "\n".join(names)
            return ans
        else:
            return "⚠️ No machines are currently in Normal status."

    # 5. "What are the active alerts?" / "active alerts" / "alerts"
    if any(phrase in q_lower for phrase in ["active alerts", "what are the alerts", "current alerts", "alerts list"]):
        if active_alerts:
            ans = f"🔔 **{len(active_alerts)} Active Maintenance Alerts**:\n\n"
            for a in active_alerts:
                ans += f"• **[{a['severity']}] {a['machine_name']}**: {a['description']}\n  *Action*: {a['recommendation']}\n\n"
            return ans.strip()
        else:
            return "✅ There are no active maintenance alerts in the factory at this time."

    # 6. Specific machine queries: "status of Machine 03", "Why is Machine 03 critical?", "Machine 01"
    machine_match = None
    for m in machines:
        m_num = m['id'].split('-')[-1].lstrip('0')
        if (f"machine {m_num}" in q_lower or f"machine 0{m_num}" in q_lower or 
            m['id'].lower() in q_lower or m['name'].lower() in q_lower or m['type'].lower() in q_lower):
            machine_match = m
            break

    if machine_match:
        m = machine_match
        diag = predict_machine_risk(m['temperature'], m['vibration'], m['pressure'], m['operating_hours'])
        recs = generate_maintenance_recommendations(m['temperature'], m['vibration'], m['pressure'], m['operating_hours'], m['status'])
        
        if any(w in q_lower for w in ["why", "reason", "critical", "cause", "risk"]):
            ans = f"🔍 **Diagnostic Analysis for {m['name']}**:\n\n"
            ans += f"- **Current Status**: **{m['status'].upper()}** (Risk Score: {m['risk_score']}/100)\n"
            ans += f"- **Sensor Readings**: Temperature = {m['temperature']}°C | Vibration = {m['vibration']} mm/s | Pressure = {m['pressure']} PSI | Operating Hours = {m['operating_hours']} hrs\n\n"
            ans += f"**Identified Risk Factors**:\n"
            for r in diag['reasons']:
                ans += f"• {r}\n"
            ans += f"\n**Recommended Action**: {recs[0]}"
            return ans
        else:
            ans = f"⚙️ **Status Report for {m['name']}**:\n\n"
            ans += f"- **Status**: **{m['status']}** (Risk Score: {m['risk_score']}/100)\n"
            ans += f"- **Temperature**: {m['temperature']}°C\n"
            ans += f"- **Vibration**: {m['vibration']} mm/s\n"
            ans += f"- **Pressure**: {m['pressure']} PSI\n"
            ans += f"- **Efficiency**: {m['efficiency']}%\n"
            ans += f"- **Operating Hours**: {m['operating_hours']} hrs\n\n"
            ans += f"**Key Insight**: " + (diag['reasons'][0] if diag['reasons'] else "Operating normally within baseline limits.")
            return ans

    # 7. "What maintenance is recommended?" / "recommendations"
    if any(phrase in q_lower for phrase in ["maintenance", "recommend", "action", "fix", "repair"]):
        if critical_machines or warning_machines:
            ans = f"🛠️ **Recommended Maintenance Action Plan**:\n\n"
            for m in critical_machines + warning_machines:
                recs = generate_maintenance_recommendations(m['temperature'], m['vibration'], m['pressure'], m['operating_hours'], m['status'])
                ans += f"**{m['name']}** (Risk: {m['risk_score']}/100 - {m['status']}):\n"
                for r in recs[:2]:
                    ans += f"• {r}\n"
                ans += "\n"
            return ans.strip()
        else:
            return "🛠️ No critical maintenance required today. All machines are operating within normal baseline parameters."

    # 8. "How is today's production?" / "efficiency" / "factory efficiency"
    if any(phrase in q_lower for phrase in ["production", "efficiency", "output", "units", "target", "today", "factory efficiency"]):
        eff = summary['efficiency']
        produced = summary['produced_output']
        target = summary['target_output']
        pct = round((produced / target) * 100.0, 1)
        
        ans = f"📊 **Today's Factory Production & Efficiency**:\n\n"
        ans += f"- **Total Output**: **{produced:,}** / {target:,} target units ({pct}% completed)\n"
        ans += f"- **Overall OEE Efficiency**: **{eff}%**\n"
        ans += f"- **Active Fleet Capacity**: {len(normal_machines) + len(warning_machines)} / {len(machines)} units\n\n"
        if critical_machines:
            ans += f"⚠️ **Bottleneck Impact**: Output is slightly affected by throughput loss on **{critical_machines[0]['name']}**."
        else:
            ans += "🚀 Production output is running smoothly on target for today's shift."
        return ans

    # 9. General overview
    health_res = calculate_factory_health_score(machines, len(active_alerts), summary['efficiency'], summary['downtime_hrs'])
    ans = f"🏭 **AI Smart Factory Overview**:\n\n"
    ans += f"- **Factory Health Score**: **{health_res['health_score']}/100** ({health_res['status']})\n"
    ans += f"- **Total Fleet**: {len(machines)} Machines (Normal: {len(normal_machines)} | Warning: {len(warning_machines)} | Critical: {len(critical_machines)})\n"
    ans += f"- **Active Alerts**: {len(active_alerts)} | **Active Maintenance**: {len(active_maintenance)}\n\n"
    ans += "Try asking me queries like:\n"
    ans += "• *'Which machine needs attention?'*\n"
    ans += "• *'Which machine has the highest risk?'*\n"
    ans += "• *'Why is Machine 03 critical?'*\n"
    ans += "• *'Compare Machine 02 and Machine 03'*\n"
    ans += "• *'What is today's production?'*\n"
    ans += "• *'What maintenance is recommended?'*"
    return ans
