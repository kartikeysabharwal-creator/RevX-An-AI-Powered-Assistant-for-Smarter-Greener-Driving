-- REVX COMPREHENSIVE SEED DATA
-- Creates default user, vehicles, achievements, challenges, realistic trips, events, AI insights, and daily stats

-- 1. Insert Base Achievements
INSERT INTO public.achievements (id, key, name, description, icon, category, requirement) VALUES
('10000000-0000-0000-0000-000000000001', 'smooth_operator', 'Smooth Operator', 'Complete 10 trips with zero harsh acceleration events.', 'feather', 'EFFICIENCY', '10 trips with 0 harsh accelerations'),
('10000000-0000-0000-0000-000000000002', 'brake_master', 'Brake Master', 'Complete 5 trips with zero harsh braking events.', 'shield-check', 'SAFETY', '5 trips with 0 harsh brakes'),
('10000000-0000-0000-0000-000000000003', 'green_week', 'Green Week', 'Maintain an Eco Score above 80 for 7 consecutive active days.', 'leaf', 'CONSISTENCY', '7-day streak with Eco Score >= 80'),
('10000000-0000-0000-0000-000000000004', 'fuel_saver', 'Fuel Saver', 'Beat your personal baseline efficiency by 15% on a trip over 10 km.', 'droplet', 'EFFICIENCY', 'Efficiency >= 15% better than baseline'),
('10000000-0000-0000-0000-000000000005', 'clean_miles', 'Clean Miles', 'Drive 100 km while producing under 120g CO2/km average.', 'globe', 'MILESTONE', '100 km cumulative with CO2 < 120 g/km'),
('10000000-0000-0000-0000-000000000006', 'steady_cruiser', 'Steady Cruiser', 'Keep speed variance under 5 km/h for a 20-minute highway segment.', 'gauge', 'CONSISTENCY', 'Speed variance < 5 km/h on highway')
ON CONFLICT (key) DO NOTHING;

-- 2. Insert Base Challenges
INSERT INTO public.challenges (id, title, description, target_metric, target_value, duration_days, reward_points, icon) VALUES
('20000000-0000-0000-0000-000000000001', 'Zero Harsh Brakes', 'Complete 3 trips this week without a single harsh braking event.', 'trips_with_zero_brakes', 3, 7, 250, 'disc'),
('20000000-0000-0000-0000-000000000002', 'Eco 85+ Club', 'Achieve an Eco Score of 85 or higher on two separate trips.', 'trips_eco_above_85', 2, 5, 300, 'award'),
('20000000-0000-0000-0000-000000000003', 'Idle Reducer', 'Keep total idle time below 2 minutes across your next 3 city trips.', 'low_idle_trips', 3, 7, 200, 'clock')
ON CONFLICT DO NOTHING;

-- 3. Insert Demo Profile
INSERT INTO public.profiles (id, email, full_name, preferred_units, currency_symbol, fuel_price_per_litre, personal_baseline_efficiency)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'anjul@revx.ai',
  'Anjul Sharma',
  'METRIC',
  '₹',
  102.50,
  8.50
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  fuel_price_per_litre = EXCLUDED.fuel_price_per_litre;

-- 4. Insert Demo Vehicles
INSERT INTO public.vehicles (id, user_id, make, model, year, fuel_type, engine_size_l, transmission, fuel_tank_capacity_l, odometer_km, nickname, is_primary)
VALUES
(
  '30000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Honda',
  'Civic VTEC Turbo',
  2024,
  'PETROL',
  1.5,
  'AUTOMATIC',
  47.0,
  14250.0,
  'Apex Ghost',
  true
),
(
  '30000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Hyundai',
  'Tucson Hybrid',
  2023,
  'HYBRID',
  1.6,
  'AUTOMATIC',
  52.0,
  28400.0,
  'Aero Cruiser',
  false
)
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Completed Demo Trips
-- Trip 1: Today's Evening Commute (Highly Efficient)
INSERT INTO public.trips (
  id, user_id, vehicle_id, mode, status, start_time, end_time,
  distance_km, duration_seconds, moving_duration_seconds, idle_duration_seconds,
  avg_speed_kmh, max_speed_kmh, speed_variance,
  fuel_used_litres, fuel_efficiency_l100km, fuel_cost,
  co2_emissions_kg, co2_grams_per_km, eco_score, safety_score,
  fuel_saved_litres, money_saved, co2_avoided_kg, is_estimated, estimator_version,
  route_summary
) VALUES (
  '40000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  'PHONE_ONLY',
  'COMPLETED',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '1 hour 29 minutes',
  18.4,
  1860,
  1710,
  150,
  35.6,
  68.4,
  28.5,
  1.25,
  6.79,
  128.12,
  2.887,
  156,
  88,
  94,
  0.314,
  32.18,
  0.725,
  true,
  'v1.4.0-phone-dynamics',
  '{"start": "Indiranagar 100ft Rd", "destination": "Electronic City Tech Zone", "points_count": 240}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Trip 2: Yesterday's Afternoon Trip (Moderate with 2 harsh accelerations)
INSERT INTO public.trips (
  id, user_id, vehicle_id, mode, status, start_time, end_time,
  distance_km, duration_seconds, moving_duration_seconds, idle_duration_seconds,
  avg_speed_kmh, max_speed_kmh, speed_variance,
  fuel_used_litres, fuel_efficiency_l100km, fuel_cost,
  co2_emissions_kg, co2_grams_per_km, eco_score, safety_score,
  fuel_saved_litres, money_saved, co2_avoided_kg, is_estimated, estimator_version,
  route_summary
) VALUES (
  '40000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  'OBD_II',
  'COMPLETED',
  NOW() - INTERVAL '1 day 4 hours',
  NOW() - INTERVAL '1 day 3 hours 35 minutes',
  12.6,
  1500,
  1320,
  180,
  30.2,
  62.0,
  45.2,
  0.98,
  7.78,
  100.45,
  2.264,
  179,
  76,
  82,
  0.091,
  9.32,
  0.210,
  false,
  'v1.4.0-obd',
  '{"start": "Koramangala 4th Block", "destination": "MG Road Central", "points_count": 180}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 6. Insert Driving Events for Trips
INSERT INTO public.driving_events (id, trip_id, timestamp, event_type, severity, value, latitude, longitude, duration_seconds, confidence, description)
VALUES
(
  '50000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000001',
  NOW() - INTERVAL '1 hour 45 minutes',
  'HARSH_BRAKING',
  'LOW',
  -3.4,
  12.9352,
  77.6245,
  1.2,
  0.92,
  'Braked sharply at traffic signal approach (3.4 m/s²)'
),
(
  '50000000-0000-0000-0000-000000000002',
  '40000000-0000-0000-0000-000000000002',
  NOW() - INTERVAL '1 day 3 hours 50 minutes',
  'HARSH_ACCELERATION',
  'MEDIUM',
  3.1,
  12.9716,
  77.5946,
  1.5,
  0.94,
  'Aggressive throttle takeoff after toll gate (3.1 m/s²)'
),
(
  '50000000-0000-0000-0000-000000000003',
  '40000000-0000-0000-0000-000000000002',
  NOW() - INTERVAL '1 day 3 hours 42 minutes',
  'SHARP_TURN',
  'LOW',
  3.6,
  12.9750,
  77.6010,
  1.8,
  0.88,
  'Sharp right curve with lateral force 3.6 m/s²'
)
ON CONFLICT (id) DO NOTHING;

-- 7. Insert AI Coaching Insights for Trip 1
INSERT INTO public.ai_insights (
  id, trip_id, summary, positive_points, issues, recommendations, priority_recommendation, historical_comparison, is_cached, model
) VALUES (
  '60000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000001',
  'Impressive cruising consistency along the Electronic City elevated highway. You beat your personal baseline fuel efficiency by 20.1%, saving 0.31L of petrol and preventing 0.72kg of CO2.',
  '["Exceptional throttle modulation during cruising segments", "Minimal stationary idling at junction points", "Maintained stable velocity within 45-60 km/h sweet spot"]'::jsonb,
  '[{"type": "HARSH_BRAKING", "count": 1, "description": "Single abrupt brake incident near Koramangala intersection", "impact": "Negligible fuel penalty, slight tire wear"}]'::jsonb,
  '["Anticipate traffic flow 200m ahead to glide smoothly through yellow lights", "Keep tire pressure at 33 PSI to maximize coasting distance"]'::jsonb,
  'Anticipate red signals early to convert kinetic braking energy into smooth coasting.',
  'Your Eco Score of 88 is 9 points higher than your 30-day average of 79.',
  false,
  'revx-coach-engine-v2'
) ON CONFLICT (trip_id) DO NOTHING;

-- 8. Insert User Achievements
INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
VALUES
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 days'),
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- 9. Insert User Active Challenge
INSERT INTO public.user_challenges (user_id, challenge_id, current_value, is_completed, started_at)
VALUES
('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 2.0, false, NOW() - INTERVAL '3 days'),
('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 2.0, true, NOW() - INTERVAL '4 days')
ON CONFLICT DO NOTHING;

-- 10. Insert Maintenance Records
INSERT INTO public.maintenance_records (vehicle_id, title, due_odometer_km, due_date, status)
VALUES
('30000000-0000-0000-0000-000000000001', 'Synthetic Engine Oil & Filter Change', 15000.0, CURRENT_DATE + INTERVAL '28 days', 'PENDING'),
('30000000-0000-0000-0000-000000000001', 'Tire Rotation & High-Speed Balancing', 15000.0, CURRENT_DATE + INTERVAL '28 days', 'PENDING')
ON CONFLICT DO NOTHING;

-- 11. Insert Daily Stats for 7-Day Trend Chart
INSERT INTO public.daily_stats (user_id, date, distance_km, fuel_litres, co2_kg, avg_eco_score, avg_safety_score, money_saved)
VALUES
('00000000-0000-0000-0000-000000000001', CURRENT_DATE - 6, 28.4, 2.12, 4.89, 78, 85, 38.50),
('00000000-0000-0000-0000-000000000001', CURRENT_DATE - 5, 34.2, 2.45, 5.65, 81, 88, 46.20),
('00000000-0000-0000-0000-000000000001', CURRENT_DATE - 4, 18.0, 1.28, 2.95, 83, 90, 25.80),
('00000000-0000-0000-0000-000000000001', CURRENT_DATE - 3, 42.6, 2.95, 6.81, 84, 89, 68.40),
('00000000-0000-0000-0000-000000000001', CURRENT_DATE - 2, 22.5, 1.54, 3.55, 86, 92, 36.10),
('00000000-0000-0000-0000-000000000001', CURRENT_DATE - 1, 12.6, 0.98, 2.26, 76, 82, 9.32),
('00000000-0000-0000-0000-000000000001', CURRENT_DATE,     18.4, 1.25, 2.88, 88, 94, 32.18)
ON CONFLICT (user_id, date) DO UPDATE SET
  distance_km = EXCLUDED.distance_km,
  avg_eco_score = EXCLUDED.avg_eco_score;
