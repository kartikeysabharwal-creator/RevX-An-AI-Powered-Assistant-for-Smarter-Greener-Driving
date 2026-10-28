-- REVX MASTER SCHEMA DEFINITION FOR SUPABASE / POSTGRESQL
-- Compliant with Row Level Security (RLS), UUIDs, and foreign keys.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (linked to Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  preferred_units TEXT NOT NULL DEFAULT 'METRIC', -- 'METRIC' | 'IMPERIAL'
  currency_symbol TEXT NOT NULL DEFAULT '₹',
  fuel_price_per_litre NUMERIC(10, 2) NOT NULL DEFAULT 102.50,
  personal_baseline_efficiency NUMERIC(5, 2) NOT NULL DEFAULT 8.50, -- L/100km
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Vehicles Table
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  fuel_type TEXT NOT NULL DEFAULT 'PETROL', -- 'PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC', 'CNG'
  engine_size_l NUMERIC(4, 2) NOT NULL DEFAULT 1.5,
  transmission TEXT NOT NULL DEFAULT 'AUTOMATIC',
  fuel_tank_capacity_l NUMERIC(5, 2) NOT NULL DEFAULT 45.0,
  odometer_km NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
  nickname TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Trips Table
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT 'PHONE_ONLY', -- 'PHONE_ONLY' | 'OBD_II'
  status TEXT NOT NULL DEFAULT 'COMPLETED', -- 'IDLE', 'DETECTING', 'ACTIVE', 'COMPLETED', 'CANCELLED'
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  distance_km NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  moving_duration_seconds INTEGER NOT NULL DEFAULT 0,
  idle_duration_seconds INTEGER NOT NULL DEFAULT 0,
  avg_speed_kmh NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
  max_speed_kmh NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
  speed_variance NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
  fuel_used_litres NUMERIC(8, 3) NOT NULL DEFAULT 0.0,
  fuel_efficiency_l100km NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
  fuel_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
  co2_emissions_kg NUMERIC(8, 3) NOT NULL DEFAULT 0.0,
  co2_grams_per_km INTEGER NOT NULL DEFAULT 0,
  eco_score INTEGER NOT NULL DEFAULT 80,
  safety_score INTEGER NOT NULL DEFAULT 85,
  fuel_saved_litres NUMERIC(8, 3) NOT NULL DEFAULT 0.0,
  money_saved NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
  co2_avoided_kg NUMERIC(8, 3) NOT NULL DEFAULT 0.0,
  is_estimated BOOLEAN NOT NULL DEFAULT true,
  estimator_version TEXT NOT NULL DEFAULT 'v1.4.0',
  route_summary JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Driving Events Table
CREATE TABLE IF NOT EXISTS public.driving_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_type TEXT NOT NULL, -- 'HARSH_ACCELERATION', 'HARSH_BRAKING', 'RAPID_SPEED_CHANGE', 'SHARP_TURN', 'EXCESSIVE_IDLE', 'OVERSPEED'
  severity TEXT NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  value NUMERIC(8, 2) NOT NULL,
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  duration_seconds NUMERIC(5, 2) NOT NULL DEFAULT 1.0,
  confidence NUMERIC(3, 2) NOT NULL DEFAULT 0.90,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. AI Insights Table (Stores LLM-generated & rule-fallback coaching)
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL UNIQUE REFERENCES public.trips(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  positive_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  issues JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  priority_recommendation TEXT NOT NULL,
  historical_comparison TEXT,
  is_cached BOOLEAN NOT NULL DEFAULT false,
  model TEXT NOT NULL DEFAULT 'revx-llm-orchestrator',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Achievements Definition Table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  requirement TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. User Unlocked Achievements Table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_achievement UNIQUE(user_id, achievement_id)
);

-- 8. Challenges Definition Table
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_metric TEXT NOT NULL,
  target_value NUMERIC(8, 2) NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 7,
  reward_points INTEGER NOT NULL DEFAULT 100,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. User Active Challenges Table
CREATE TABLE IF NOT EXISTS public.user_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  current_value NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 10. Vehicle Maintenance Reminders
CREATE TABLE IF NOT EXISTS public.maintenance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_odometer_km NUMERIC(10, 2),
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'DUE_SOON', 'OVERDUE', 'COMPLETED'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Daily Aggregated Stats Table
CREATE TABLE IF NOT EXISTS public.daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  distance_km NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
  fuel_litres NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
  co2_kg NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
  avg_eco_score INTEGER NOT NULL DEFAULT 80,
  avg_safety_score INTEGER NOT NULL DEFAULT 85,
  money_saved NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_daily_stat UNIQUE(user_id, date)
);

-- 12. Green Computing Observability Table
CREATE TABLE IF NOT EXISTS public.green_computing_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  total_raw_points INTEGER NOT NULL,
  uploaded_points INTEGER NOT NULL,
  cloud_calls_avoided INTEGER NOT NULL,
  ai_cache_hit BOOLEAN NOT NULL DEFAULT false,
  local_processing_ratio NUMERIC(5, 2) NOT NULL,
  battery_saved_mwh NUMERIC(8, 2) NOT NULL,
  cloud_energy_saved_wh NUMERIC(8, 3) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES for Query Optimization
CREATE INDEX IF NOT EXISTS idx_vehicles_user ON public.vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_user ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_vehicle ON public.trips(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_trips_start_time ON public.trips(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_driving_events_trip ON public.driving_events(trip_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON public.daily_stats(user_id, date DESC);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures user data isolation across all endpoints
-- ========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driving_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.green_computing_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read and update only their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Vehicles: users can perform all actions on their own vehicles
CREATE POLICY "Users can manage own vehicles" ON public.vehicles FOR ALL USING (auth.uid() = user_id);

-- Trips: users can manage their own trips
CREATE POLICY "Users can manage own trips" ON public.trips FOR ALL USING (auth.uid() = user_id);

-- Driving Events: accessible if user owns the trip
CREATE POLICY "Users can view trip events" ON public.driving_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.trips WHERE trips.id = driving_events.trip_id AND trips.user_id = auth.uid())
);
CREATE POLICY "Users can insert trip events" ON public.driving_events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.trips WHERE trips.id = driving_events.trip_id AND trips.user_id = auth.uid())
);

-- AI Insights: accessible if user owns the trip
CREATE POLICY "Users can view trip ai insights" ON public.ai_insights FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.trips WHERE trips.id = ai_insights.trip_id AND trips.user_id = auth.uid())
);

-- User Achievements: users can read their achievements
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR ALL USING (auth.uid() = user_id);

-- User Challenges: users can view and update their challenges
CREATE POLICY "Users can manage own challenges" ON public.user_challenges FOR ALL USING (auth.uid() = user_id);

-- Maintenance: users can manage maintenance for their vehicles
CREATE POLICY "Users can manage vehicle maintenance" ON public.maintenance_records FOR ALL USING (
  EXISTS (SELECT 1 FROM public.vehicles WHERE vehicles.id = maintenance_records.vehicle_id AND vehicles.user_id = auth.uid())
);

-- Daily Stats: users can view own daily stats
CREATE POLICY "Users can view own daily stats" ON public.daily_stats FOR ALL USING (auth.uid() = user_id);

-- Public read access for achievements catalog and challenges catalog
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read achievements" ON public.achievements FOR SELECT USING (true);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read challenges" ON public.challenges FOR SELECT USING (true);
