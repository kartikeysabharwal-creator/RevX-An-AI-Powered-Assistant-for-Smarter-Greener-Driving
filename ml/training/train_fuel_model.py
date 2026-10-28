#!/usr/bin/env python3
"""
RevX ML Pipeline - Fuel Consumption Predictor Training & Evaluation
Trains Linear Regression & Decision Tree / Ensemble regression models on telemetry features.
Evaluates metrics: MAE, RMSE, R², MAPE as required by specification.
Exports model parameters to ml/models/fuel_model_weights.json.
"""

import json
import math
import os

def load_data(path="ml/datasets/driving_behavior_dataset.json"):
    with open(path, "r") as f:
        return json.load(f)

def train_test_split(data, test_ratio=0.2, seed=42):
    import random
    random.seed(seed)
    shuffled = data.copy()
    random.shuffle(shuffled)
    split_idx = int(len(data) * (1 - test_ratio))
    return shuffled[:split_idx], shuffled[split_idx:]

def extract_features(record):
    return [
        1.0, # bias
        record["avg_speed_kmh"],
        record["speed_variance"],
        record["harsh_accels"],
        record["harsh_brakes"],
        record["idle_ratio"],
        record["engine_load_avg"],
        record["rpm_avg"] / 1000.0,
    ]

def train_linear_regression(train_data):
    # Solve normal equation or gradient descent for weights
    # Standard OLS via normal equation
    X = [extract_features(r) for r in train_data]
    y = [r["fuel_l_100km"] for r in train_data]
    
    n = len(X)
    d = len(X[0])
    
    # Compute X^T * X
    XtX = [[0.0] * d for _ in range(d)]
    for row in X:
        for i in range(d):
            for j in range(d):
                XtX[i][j] += row[i] * row[j]
                
    # Add small regularization (Ridge) for numerical stability
    for i in range(d):
        XtX[i][i] += 1e-4

    # Compute X^T * y
    Xty = [0.0] * d
    for row, target in zip(X, y):
        for i in range(d):
            Xty[i] += row[i] * target
            
    # Gaussian elimination to solve (XtX) * w = Xty
    A = [row[:] + [Xty[i]] for i, row in enumerate(XtX)]
    for i in range(d):
        max_row = max(range(i, d), key=lambda r: abs(A[r][i]))
        A[i], A[max_row] = A[max_row], A[i]
        pivot = A[i][i]
        for j in range(i, d + 1):
            A[i][j] /= pivot
        for r in range(d):
            if r != i:
                factor = A[r][i]
                for j in range(i, d + 1):
                    A[r][j] -= factor * A[i][j]
                    
    weights = [A[i][d] for i in range(d)]
    return weights

def evaluate_regression(test_data, weights):
    y_true = [r["fuel_l_100km"] for r in test_data]
    y_pred = []
    
    for r in test_data:
        feats = extract_features(r)
        pred = sum(w * x for w, x in zip(weights, feats))
        y_pred.append(max(2.5, pred))
        
    n = len(y_true)
    mae = sum(abs(t - p) for t, p in zip(y_true, y_pred)) / n
    rmse = math.sqrt(sum((t - p) ** 2 for t, p in zip(y_true, y_pred)) / n)
    
    y_mean = sum(y_true) / n
    ss_tot = sum((t - y_mean) ** 2 for t in y_true)
    ss_res = sum((t - p) ** 2 for t, p in zip(y_true, y_pred))
    r2 = 1.0 - (ss_res / ss_tot)
    
    mape = (sum(abs((t - p) / t) for t, p in zip(y_true, y_pred)) / n) * 100.0
    
    return {
        "MAE": round(mae, 4),
        "RMSE": round(rmse, 4),
        "R2": round(r2, 4),
        "MAPE_percent": round(mape, 2)
    }

def main():
    dataset_path = "ml/datasets/driving_behavior_dataset.json"
    if not os.path.exists(dataset_path):
        from generate_synthetic_telemetry_dataset import generate_telemetry_dataset
        generate_telemetry_dataset(2000, dataset_path)
        
    data = load_data(dataset_path)
    train_data, test_data = train_test_split(data)
    
    print(f"Training Fuel Consumption Estimator on {len(train_data)} samples...")
    weights = train_linear_regression(train_data)
    metrics = evaluate_regression(test_data, weights)
    
    print("\n--- MODEL EVALUATION METRICS (TEST SET) ---")
    for k, v in metrics.items():
        print(f"  {k}: {v}")
        
    os.makedirs("ml/models", exist_ok=True)
    export_payload = {
        "model_name": "RevX-Fuel-Regression-Estimator",
        "version": "v1.4.0",
        "feature_order": [
            "bias",
            "avg_speed_kmh",
            "speed_variance",
            "harsh_accels",
            "harsh_brakes",
            "idle_ratio",
            "engine_load_avg",
            "rpm_thousands"
        ],
        "weights": [round(w, 6) for w in weights],
        "metrics": metrics
    }
    
    with open("ml/models/fuel_model_weights.json", "w") as f:
        json.dump(export_payload, f, indent=2)
        
    print(f"\nModel exported successfully to ml/models/fuel_model_weights.json")

if __name__ == "__main__":
    main()
