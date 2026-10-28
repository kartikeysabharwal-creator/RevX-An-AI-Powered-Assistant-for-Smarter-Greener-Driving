#!/usr/bin/env python3
"""
RevX ML Pipeline - Driving Behavior Classifier
Classifies driving style into SLOW, NORMAL, AGGRESSIVE.
Calculates Accuracy, Precision, Recall, F1, and Confusion Matrix.
Exports model rules and thresholds to ml/models/behavior_classifier_weights.json.
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

def predict_behavior(record):
    # Centroid / Decision Boundary classification
    accels = record["harsh_accels"]
    brakes = record["harsh_brakes"]
    variance = record["speed_variance"]
    avg_speed = record["avg_speed_kmh"]
    
    aggressive_score = accels * 3.5 + brakes * 3.0 + (variance / 15.0)
    
    if aggressive_score >= 12.0 or accels >= 3 or brakes >= 3:
        return "AGGRESSIVE"
    elif avg_speed < 38.0 and variance < 22.0 and accels == 0:
        return "SLOW"
    else:
        return "NORMAL"

def evaluate_classifier(test_data):
    labels = ["SLOW", "NORMAL", "AGGRESSIVE"]
    y_true = [r["label"] for r in test_data]
    y_pred = [predict_behavior(r) for r in test_data]
    
    # Confusion matrix
    matrix = {t: {p: 0 for p in labels} for t in labels}
    for t, p in zip(y_true, y_pred):
        matrix[t][p] += 1
        
    total = len(test_data)
    correct = sum(matrix[lbl][lbl] for lbl in labels)
    accuracy = correct / total
    
    per_class = {}
    macro_precision = 0.0
    macro_recall = 0.0
    macro_f1 = 0.0
    
    for lbl in labels:
        tp = matrix[lbl][lbl]
        fp = sum(matrix[other][lbl] for other in labels if other != lbl)
        fn = sum(matrix[lbl][other] for other in labels if other != lbl)
        
        prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2 * prec * rec) / (prec + rec) if (prec + rec) > 0 else 0.0
        
        per_class[lbl] = {
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1": round(f1, 4),
            "support": sum(matrix[lbl].values())
        }
        macro_precision += prec
        macro_recall += rec
        macro_f1 += f1
        
    num_classes = len(labels)
    macro_precision /= num_classes
    macro_recall /= num_classes
    macro_f1 /= num_classes
    
    return {
        "accuracy": round(accuracy, 4),
        "macro_precision": round(macro_precision, 4),
        "macro_recall": round(macro_recall, 4),
        "macro_f1": round(macro_f1, 4),
        "confusion_matrix": matrix,
        "per_class": per_class
    }

def main():
    dataset_path = "ml/datasets/driving_behavior_dataset.json"
    if not os.path.exists(dataset_path):
        import sys
        sys.path.append("ml/datasets")
        from generate_synthetic_telemetry_dataset import generate_telemetry_dataset
        generate_telemetry_dataset(2000, dataset_path)
        
    data = load_data(dataset_path)
    train_data, test_data = train_test_split(data)
    
    print(f"Evaluating Behavior Classifier on {len(test_data)} test samples...")
    metrics = evaluate_classifier(test_data)
    
    print("\n--- CLASSIFIER EVALUATION REPORT ---")
    print(f"  Accuracy:        {metrics['accuracy'] * 100:.2f}%")
    print(f"  Macro Precision: {metrics['macro_precision']:.4f}")
    print(f"  Macro Recall:    {metrics['macro_recall']:.4f}")
    print(f"  Macro F1:        {metrics['macro_f1']:.4f}")
    print("\n  Confusion Matrix (Row=True, Col=Pred):")
    for row_lbl, cols in metrics["confusion_matrix"].items():
        print(f"    {row_lbl:10s} -> {cols}")
        
    os.makedirs("ml/models", exist_ok=True)
    export_payload = {
        "model_name": "RevX-Driver-Behavior-Classifier",
        "version": "v1.4.0",
        "classes": ["SLOW", "NORMAL", "AGGRESSIVE"],
        "metrics": metrics
    }
    with open("ml/models/behavior_classifier_weights.json", "w") as f:
        json.dump(export_payload, f, indent=2)
    print("\nBehavior model exported to ml/models/behavior_classifier_weights.json")

if __name__ == "__main__":
    main()
