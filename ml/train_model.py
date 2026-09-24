import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

def generate_synthetic_data(n_samples=2000, random_state=42):
    np.random.seed(random_state)
    
    # Generate continuous sensor variables
    # Temperature (°C): 40 to 110
    temperature = np.random.uniform(40.0, 105.0, n_samples)
    # Vibration (mm/s): 0.2 to 9.0
    vibration = np.random.uniform(0.2, 9.0, n_samples)
    # Pressure (PSI): 60 to 140
    pressure = np.random.uniform(60.0, 140.0, n_samples)
    # Operating Hours (hrs): 100 to 6000
    operating_hours = np.random.uniform(100.0, 6000.0, n_samples)
    
    labels = []
    for t, v, p, h in zip(temperature, vibration, pressure, operating_hours):
        # Determine risk based on realistic multi-sensor physics
        # Critical conditions
        critical_score = 0
        if t > 85.0: critical_score += 2
        if v > 5.5: critical_score += 2
        if p < 75.0 or p > 125.0: critical_score += 2
        if h > 4500 and (t > 80.0 or v > 4.5): critical_score += 1
        
        warning_score = 0
        if 75.0 < t <= 85.0: warning_score += 1
        if 3.2 < v <= 5.5: warning_score += 1
        if (75.0 <= p < 90.0) or (110.0 < p <= 125.0): warning_score += 1
        if h > 3500: warning_score += 1

        if critical_score >= 2 or (t > 90.0 and v > 6.0):
            labels.append(2)  # Critical
        elif warning_score >= 1 or critical_score == 1:
            labels.append(1)  # Warning
        else:
            labels.append(0)  # Normal

    df = pd.DataFrame({
        'temperature': temperature,
        'vibration': vibration,
        'pressure': pressure,
        'operating_hours': operating_hours,
        'risk_label': labels
    })
    return df

def train_and_save_model():
    print("Generating synthetic dataset...")
    df = generate_synthetic_data()
    
    X = df[['temperature', 'vibration', 'pressure', 'operating_hours']]
    y = df['risk_label']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    clf = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
    clf.fit(X_train, y_train)
    
    y_pred = clf.predict(X_test)
    print("Model Evaluation:")
    print(classification_report(y_test, y_pred, target_names=['Normal', 'Warning', 'Critical']))
    
    model_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(model_dir, 'risk_model.pkl')
    joblib.dump(clf, model_path)
    print(f"Model saved successfully to {model_path}")

if __name__ == '__main__':
    train_and_save_model()
