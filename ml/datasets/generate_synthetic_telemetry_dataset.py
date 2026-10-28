#!/usr/bin/env python3
"""
RevX ML Pipeline - Telemetry Dataset Generator
Generates realistic driving behavior and fuel consumption datasets
with labelled driver categories: SLOW, NORMAL, AGGRESSIVE.
"""

import json
import math
import os
import random

def generate_telemetry_dataset(num_samples=2000, output_path="ml/datasets/driving_behavior_dataset.json"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    records = []
    
    categories = ['SLOW', 'NORMAL', 'AGGRESSIVE']
    
    for i in range(num_samples):
        cat = random.choices(categories, weights=[0.25, 0.50, 0.25])[0]
        
        if cat == 'SLOW':
            avg_speed = random.uniform(20.0, 45.0)
            max_speed = avg_speed + random.uniform(5.0, 15.0)
            speed_variance = random.uniform(5.0, 20.0)
            harsh_accels = random.choices([0, 1], weights=[0.9, 0.1])[0]
            harsh_brakes = random.choices([0, 1], weights=[0.9, 0.1])[0]
            idle_ratio = random.uniform(0.15, 0.35)
            engine_load_avg = random.uniform(20.0, 40.0)
            rpm_avg = random.uniform(1200.0, 1900.0)
            # Base fuel consumption (L/100km)
            base_fuel = 6.2 + (engine_load_avg / 100.0) * 3.0 + random.gauss(0, 0.2)
        elif cat == 'NORMAL':
            avg_speed = random.uniform(35.0, 75.0)
            max_speed = avg_speed + random.uniform(15.0, 25.0)
            speed_variance = random.uniform(15.0, 45.0)
            harsh_accels = random.choices([0, 1, 2], weights=[0.7, 0.25, 0.05])[0]
            harsh_brakes = random.choices([0, 1, 2], weights=[0.75, 0.20, 0.05])[0]
            idle_ratio = random.uniform(0.08, 0.20)
            engine_load_avg = random.uniform(30.0, 55.0)
            rpm_avg = random.uniform(1600.0, 2400.0)
            base_fuel = 7.4 + (engine_load_avg / 100.0) * 3.5 + random.gauss(0, 0.25)
        else: # AGGRESSIVE
            avg_speed = random.uniform(50.0, 95.0)
            max_speed = avg_speed + random.uniform(25.0, 45.0)
            speed_variance = random.uniform(50.0, 130.0)
            harsh_accels = random.randint(3, 9)
            harsh_brakes = random.randint(3, 8)
            idle_ratio = random.uniform(0.05, 0.18)
            engine_load_avg = random.uniform(55.0, 85.0)
            rpm_avg = random.uniform(2600.0, 4200.0)
            base_fuel = 10.2 + (harsh_accels * 0.4) + (engine_load_avg / 100.0) * 4.0 + random.gauss(0, 0.35)
            
        record = {
            "id": f"sample-{i+1:04d}",
            "label": cat,
            "avg_speed_kmh": round(avg_speed, 2),
            "max_speed_kmh": round(max_speed, 2),
            "speed_variance": round(speed_variance, 2),
            "harsh_accels": harsh_accels,
            "harsh_brakes": harsh_brakes,
            "idle_ratio": round(idle_ratio, 3),
            "engine_load_avg": round(engine_load_avg, 2),
            "rpm_avg": round(rpm_avg, 1),
            "fuel_l_100km": round(max(3.5, base_fuel), 2)
        }
        records.append(record)
        
    with open(output_path, "w") as f:
        json.dump(records, f, indent=2)
        
    print(f"Generated {num_samples} samples saved to {output_path}")

if __name__ == "__main__":
    generate_telemetry_dataset()
