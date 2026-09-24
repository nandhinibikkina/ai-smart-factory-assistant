import urllib.request
import json

BASE_URL = "http://127.0.0.1:5000/api"

def get(path):
    req = urllib.request.Request(f"{BASE_URL}{path}")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def post(path, data=None):
    body = json.dumps(data).encode() if data else b""
    req = urllib.request.Request(f"{BASE_URL}{path}", data=body, headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

print("=== STEP 1: INITIAL BASELINE ===")
res_init = post("/machines/reset-simulation")
print("Reset all machines to baseline:", res_init['message'])

machines = get("/machines")['machines']
prod_init = get("/production")['summary']
print(f"Factory Health Score Baseline: {prod_init['health_score']}/100 ({prod_init.get('health_status')})")
m2_baseline = next(m for m in machines if m['id'] == 'MCH-002')
print(f"M02 Baseline: Status={m2_baseline['status']}, Temp={m2_baseline['temperature']}C, Vib={m2_baseline['vibration']}mm/s, Press={m2_baseline['pressure']}PSI, Risk={m2_baseline['risk_score']}")

print("\n=== STEP 2: INJECT ABNORMAL PRESSURE INTO MACHINE 02 (MCH-002) ===")
inj_res = post("/machines/trigger-anomaly", {
    "machine_id": "MCH-002",
    "anomaly_type": "Abnormal Pressure"
})
print("Injection Result:", json.dumps(inj_res, indent=2))

# Verify Machine 02 details endpoint
m2_det = get("/machines/MCH-002")['machine']
m2_diag = get("/machines/MCH-002")['ai_diagnosis']
print(f"\nM02 Details Post-Injection: Status={m2_det['status']}, Press={m2_det['pressure']} PSI, Risk={m2_det['risk_score']}/100 ({m2_diag['risk_level']})")
clean_reasons = [r.encode('ascii', 'ignore').decode() for r in m2_diag['reasons']]
print("M02 Risk Factors:", clean_reasons)

# Verify Factory Health Score updated
prod_post = get("/production")['summary']
print(f"Factory Health Score Post-Injection: {prod_post['health_score']}/100 ({prod_post.get('health_status')})")

# Verify Active Alerts
alerts = get("/alerts")['alerts']
m2_alerts = [a for a in alerts if a['machine_id'] == 'MCH-002' and a['status'] == 'Active']
print(f"Active Alerts for M02 ({len(m2_alerts)}):", m2_alerts[0]['title'] if m2_alerts else "None")

# Verify AI Assistant Query
ai_res = post("/ai/chat", {"question": "status of Machine 02"})
clean_ai_ans = ai_res['answer'].encode('ascii', 'ignore').decode()
print("\nAI Assistant Response for Machine 02:")
print(clean_ai_ans[:300])

print("\n=== STEP 3: RESET MACHINE 02 SINGLE MACHINE ===")
reset_m2 = post("/machines/MCH-002/reset-anomaly")
print("Reset M02 Result:", reset_m2['message'])

m2_after_reset = get("/machines/MCH-002")['machine']
print(f"M02 Post-Reset: Status={m2_after_reset['status']}, Press={m2_after_reset['pressure']} PSI, Risk={m2_after_reset['risk_score']}/100")
prod_reset = get("/production")['summary']
print(f"Factory Health Score Post-Reset: {prod_reset['health_score']}/100")

print("\n=== STEP 4: VERIFY REUSABLE HANDLER FOR ALL MACHINES (MCH-001 TO MCH-006) ===")
test_cases = [
    ("MCH-001", "High Temperature"),
    ("MCH-003", "High Vibration"),
    ("MCH-004", "Increasing Trend"),
    ("MCH-005", "Combined Anomaly"),
    ("MCH-006", "High Temperature")
]

for m_id, a_type in test_cases:
    res = post("/machines/trigger-anomaly", {"machine_id": m_id, "anomaly_type": a_type})
    m_info = get(f"/machines/{m_id}")['machine']
    print(f"SUCCESS {m_id} ({a_type}): Status={m_info['status']}, Risk={m_info['risk_score']}/100, Temp={m_info['temperature']}C, Vib={m_info['vibration']}mm/s, Press={m_info['pressure']}PSI")
    # Reset back
    post(f"/machines/{m_id}/reset-anomaly")

print("\n=== FINAL CLEANUP: RESET ALL MACHINES ===")
post("/machines/reset-simulation")
print("All machines reset cleanly to baseline!")
