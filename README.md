# AI Smart Factory Assistant (Industry 4.0 Prototype)

A realistic, production-ready Industry 4.0 / Smart Manufacturing control center application featuring predictive maintenance, machine risk telemetry, AI incident root cause investigation, What-If operational simulation, energy monitoring, and full **Offline / Edge Mode** processing.

---

## Technical Architecture

- **Frontend**: React (Vite), TailwindCSS, Lucide Icons, React Router v6, Recharts
- **Backend**: Python Flask, SQLite (`factory.db`), Scikit-Learn (`risk_model.pkl`)
- **Edge Storage**: On-Device ML Risk Rules & Persistent Local Storage (`offlineStore.js`)

---

## Quick Start (Running on Any Computer)

### Prerequisites
- **Node.js**: v18+ and `npm`
- **Python**: v3.9+ and `pip`

### Step 1: Install Dependencies & Run Backend (Flask)

```powershell
# From project root directory
pip install -r requirements.txt
python backend/app.py
```
> **Backend Endpoint**: `http://127.0.0.1:5000`

### Step 2: Install Dependencies & Run Frontend (React / Vite)

```powershell
# Open a new terminal window
cd frontend
npm install
npm run dev
```
> **Frontend Control Center**: `http://localhost:5173`

---

## How to Verify Offline / Edge Mode on Another Computer

The application includes an **Offline / Edge Mode** implementation built directly into the source code (`src/services/offlineStore.js` and `src/services/api.js`).

### Verification Steps:

1. **Copy / Extract the Project**:
   - Transfer or extract the project ZIP to another computer.
   - Run `cd frontend && npm run dev` to start the frontend.

2. **Simulate Offline Environment**:
   - **Method A (No Backend Running)**: Simply open `http://localhost:5173` without running `python backend/app.py`. The application will detect backend unreachability and automatically switch to `OFFLINE MODE`.
   - **Method B (Browser Disconnect)**: Open browser Developer Tools (`F12`), go to the **Network** tab, and select **Offline**.
   - **Method C (Header Toggle)**: Click the `🟢 ONLINE` / `🟠 OFFLINE MODE` badge in the top navigation bar to toggle Edge Mode manually.

3. **Verify Offline Capabilities**:
   - **Status Badge**: Top header displays `🟠 OFFLINE MODE` and `⚡ EDGE PROCESSING ACTIVE`.
   - **Offline Banner**: Top banner displays: `"OFFLINE MODE: Core factory monitoring is running locally."`.
   - **Simulated Data Badge**: Telemetry panel displays `"Simulated / Local Sensor Data"`.
   - **Inject Anomaly**: Click **"Inject Anomaly"**, select any machine (e.g. `Machine 02 - CNC Unit`) and an anomaly type (e.g. `Abnormal Pressure`). Click **Inject Anomaly**.
   - **Edge Risk Scoring**: Risk score recalculates locally on the edge (e.g. `75.0+`), status updates to `Critical` / `Warning`, and an Alert is generated.
   - **AI Incident Investigation**: Navigate to `🔎 AI Incident Investigation` to inspect the newly logged incident, view before/after impact comparison, AI root cause analysis, and create a Maintenance Work Order offline.
   - **State Persistence**: Refresh the browser page (`F5`). All offline state, machines, alerts, incidents, and work orders remain saved in browser `localStorage`.

4. **Reconnection Synchronization**:
   - Start `python backend/app.py` or disable browser offline simulation.
   - The application automatically detects connection recovery and displays: `"Connection restored. Local data is synchronized."`.

---

## Production Build & Bundling

To test or build the static production bundle:

```powershell
cd frontend
npm run build
```
Output files are written cleanly to `frontend/dist/`.
