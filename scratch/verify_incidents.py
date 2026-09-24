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

def patch(path, data=None):
    body = json.dumps(data).encode() if data else b""
    req = urllib.request.Request(f"{BASE_URL}{path}", data=body, headers={'Content-Type': 'application/json'}, method='PATCH')
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

print("=== STEP 1: RESET SIMULATION ===")
res = post("/machines/reset-simulation")
print("Reset:", res['message'])

print("\n=== STEP 2: INJECT ABNORMAL PRESSURE INTO MACHINE 02 (MCH-002) ===")
inj = post("/machines/trigger-anomaly", {"machine_id": "MCH-002", "anomaly_type": "Abnormal Pressure"})
print("Injection Response:", json.dumps(inj, indent=2))

print("\n=== STEP 3: FETCH INCIDENTS LIST ===")
inc_list = get("/incidents")
print(f"Total Incidents: {inc_list['total_count']}, Active: {inc_list['active_count']}")

print("\n=== STEP 4: FETCH INCIDENT DETAILS FOR INC-002 ===")
det = get("/incidents/INC-002")
inc = det['incident']
ba = det['before_after']
rc = det['ai_root_cause']

print(f"Incident ID: {inc['id']}")
print(f"Machine: {inc['machine_name']} ({inc['machine_id']})")
print(f"Anomaly: {inc['anomaly_type']}, Severity: {inc['severity']}, Risk Score: {inc['risk_score']}/100")
print(f"Status: {inc['status']}")

print("\nBEFORE vs AFTER Impact Table:")
print(f" - Temp: Before={ba['temperature']['before']}C -> After={ba['temperature']['after']}C (Delta: +{ba['temperature']['delta']}C)")
print(f" - Vib:  Before={ba['vibration']['before']}mm/s -> After={ba['vibration']['after']}mm/s (Delta: +{ba['vibration']['delta']}mm/s)")
print(f" - Press: Before={ba['pressure']['before']}PSI -> After={ba['pressure']['after']}PSI (Delta: +{ba['pressure']['delta']}PSI)")
print(f" - Risk: Before={ba['risk_score']['before']} -> After={ba['risk_score']['after']} (Delta: +{ba['risk_score']['delta']}pts)")
print(f" - Status: Before={ba['status']['before']} -> After={ba['status']['after']}")

print("\nAI Root Cause Analysis:")
clean_summary = rc['summary'].encode('ascii', 'ignore').decode()
print("Summary:", clean_summary)
print("Confidence:", rc['confidence'])
print("Disclaimer:", rc['disclaimer'])

print("\n=== STEP 5: UPDATE INCIDENT STATUS ===")
st_res = patch("/incidents/INC-002/status", {"status": "Maintenance Scheduled"})
print("Status Update:", st_res['message'])

print("\n=== STEP 6: AI ASSISTANT QUERY ===")
ai_res = post("/ai/chat", {"question": "What caused the M02 incident?"})
clean_ai = ai_res['answer'].encode('ascii', 'ignore').decode()
print("AI Response snippet:", clean_ai[:250])

print("\n=== STEP 7: TEST MULTI-MACHINE INCIDENTS (MCH-003 & MCH-006) ===")
inj3 = post("/machines/trigger-anomaly", {"machine_id": "MCH-003", "anomaly_type": "High Vibration"})
print(f"Created Incident #{inj3['result']['incident_id']} for MCH-003")

inj6 = post("/machines/trigger-anomaly", {"machine_id": "MCH-006", "anomaly_type": "High Temperature"})
print(f"Created Incident #{inj6['result']['incident_id']} for MCH-006")

inc_list_updated = get("/incidents")
print(f"Updated Incidents Count: {inc_list_updated['total_count']}")

print("\n=== STEP 8: FINAL RESET ===")
post("/machines/reset-simulation")
print("Reset all machines & resolved incidents cleanly!")
