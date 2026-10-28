const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

// In production, store token in httpOnly cookie. For demo, use this token.
const DEMO_TOKEN = 'demo-token';

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEMO_TOKEN}`,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(errBody?.error?.message ?? `API error ${res.status}`);
  }

  const json = await res.json();
  return (json.data ?? json) as T;
}

// ── Auth & Profile ─────────────────────────────────────────
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  preferredUnits: string;
  currencySymbol: string;
  fuelPricePerLitre: number;
  personalBaselineEfficiency: number;
  createdAt: string;
}

export async function getProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>('/auth/profile');
}

export async function login(email: string, password: string): Promise<{ user: UserProfile; token: string }> {
  return apiFetch<{ user: UserProfile; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// ── Vehicles ─────────────────────────────────────────────────
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  fuelType: string;
  engineSizeL: number;
  transmission: string;
  fuelTankCapacityL: number;
  odometerKm: number;
  nickname?: string;
  isPrimary: boolean;
}

export async function getVehicles(): Promise<Vehicle[]> {
  return apiFetch<Vehicle[]>('/vehicles');
}

// ── Dashboard ────────────────────────────────────────────────
export interface DashboardData {
  greeting: string;
  driverName: string;
  activeVehicle: Vehicle;
  currentEcoScore: number;
  currentSafetyScore: number;
  todayDriving: {
    distanceKm: number;
    estimatedFuelUsedLitres: number;
    estimatedCo2Kg: number;
    estimatedFuelCost: number;
  };
  quickCards: {
    ecoScore: number;
    safetyScore: number;
    efficiencyL100km: number;
    co2Kg: number;
  };
  savings: {
    estimatedFuelSavingsLitres: number;
    estimatedMoneySaved: number;
    estimatedCo2AvoidedKg: number;
  };
  recentTrips: Trip[];
}

export async function getDashboard(): Promise<DashboardData> {
  return apiFetch<DashboardData>('/analytics/dashboard');
}

// ── Trips ────────────────────────────────────────────────────
export interface DrivingEvent {
  id: string;
  tripId: string;
  timestamp: number;
  eventType: string;
  severity: string;
  value: number;
  latitude?: number;
  longitude?: number;
  durationSeconds: number;
  confidence: number;
  description: string;
}

export interface EcoScore {
  score: number;
  band: string;
  fuelEfficiencyScore: number;
  accelerationSmoothnessScore: number;
  brakingSmoothnessScore: number;
  idleScore: number;
  speedConsistencyScore: number;
  explanation: string;
}

export interface SafetyScore {
  score: number;
  band: string;
  penalties: {
    harshAccelerationPenalty: number;
    harshBrakingPenalty: number;
    speedInstabilityPenalty: number;
    sharpTurnPenalty: number;
    overspeedPenalty: number;
  };
  explanation: string;
}

export interface FuelEmissions {
  fuelUsedLitres: number;
  fuelEfficiencyL100km: number;
  fuelEfficiencyKml: number;
  estimatedCo2Kg: number;
  co2GramsPerKm: number;
  fuelCost: number;
  baselineFuelLitres: number;
  fuelSavedLitres: number;
  moneySaved: number;
  co2AvoidedKg: number;
  confidence: string;
  isEstimated: boolean;
}

export interface TripMetrics {
  distanceKm: number;
  durationSeconds: number;
  movingDurationSeconds: number;
  idleDurationSeconds: number;
  avgSpeedKmh: number;
  maxSpeedKmh: number;
  speedVariance: number;
  stopCount: number;
  harshAccelCount: number;
  harshBrakeCount: number;
  sharpTurnCount: number;
  idleEventCount: number;
  overspeedCount: number;
}

export interface AIInsight {
  id?: string;
  tripId: string;
  summary: string;
  positivePoints: string[];
  issues: Array<{
    type: string;
    count: number;
    description: string;
    impact: string;
  }>;
  recommendations: string[];
  priorityRecommendation: string;
  historicalComparison?: string;
  isCached: boolean;
  model: string;
  generatedAt: string;
}

export interface Trip {
  id: string;
  userId: string;
  vehicleId: string;
  mode: string;
  status: string;
  startTime: number;
  endTime?: number;
  routeSummary?: string;
  metrics: TripMetrics;
  fuelEmissions: FuelEmissions;
  ecoScore: EcoScore;
  safetyScore: SafetyScore;
  events: DrivingEvent[];
  aiInsight?: AIInsight;
  routeCoordinates?: Array<{ lat: number; lng: number; speedKmh: number; timestamp: number }>;
  createdAt: string;
}

export interface TripsResponse {
  trips: Trip[];
  pagination: { total: number; page: number; limit: number };
}

export async function getTrips(params?: {
  period?: string;
  vehicleId?: string;
  page?: number;
  limit?: number;
}): Promise<TripsResponse> {
  const qs = new URLSearchParams();
  if (params?.period) qs.set('period', params.period);
  if (params?.vehicleId) qs.set('vehicleId', params.vehicleId);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const query = qs.toString() ? `?${qs.toString()}` : '';

  // API returns { data: Trip[], pagination: ... } at top level
  const res = await fetch(`${API_BASE}/trips${query}`, {
    headers: { Authorization: `Bearer ${DEMO_TOKEN}` },
  });
  const json = await res.json();
  return { trips: json.data ?? [], pagination: json.pagination ?? { total: 0, page: 1, limit: 20 } };
}

export async function getTrip(id: string): Promise<Trip> {
  return apiFetch<Trip>(`/trips/${id}`);
}

export async function analyzeTrip(tripId: string, forceRefresh = false): Promise<AIInsight> {
  return apiFetch<AIInsight>('/ai/analyze-trip', {
    method: 'POST',
    body: JSON.stringify({ tripId, forceRefresh }),
  });
}

// ── Analytics ────────────────────────────────────────────────
export interface WeeklyAnalytics {
  period: string;
  summary: {
    tripCount: number;
    totalDistanceKm: number;
    totalFuelUsedLitres: number;
    totalCo2Kg: number;
    avgEcoScore: number;
    avgSafetyScore: number;
    avgFuelEfficiencyL100km: number;
    totalFuelSavedLitres: number;
    totalMoneySaved: number;
    totalCo2AvoidedKg: number;
  };
  daySeries: Array<{
    day: string;
    distanceKm: number;
    fuelUsedLitres: number;
    co2Kg: number;
    ecoScore: number;
    tripCount: number;
  }>;
  trends: {
    ecoTrend: { percentageChange: number; isImprovement: boolean; narrative: string; currentValue: number };
    safetyTrend: { percentageChange: number; isImprovement: boolean; narrative: string; currentValue: number };
    fuelEfficiencyTrend: { percentageChange: number; isImprovement: boolean; narrative: string; currentValue: number };
  };
  headlineTrend: string;
}

export async function getWeeklyAnalytics(): Promise<WeeklyAnalytics> {
  return apiFetch<WeeklyAnalytics>('/analytics/weekly');
}

export async function getMonthlyAnalytics(): Promise<WeeklyAnalytics> {
  return apiFetch<WeeklyAnalytics>('/analytics/monthly');
}

// ── Savings ──────────────────────────────────────────────────
export interface SavingsData {
  thisMonth: {
    estimatedMoneySaved: number;
    estimatedFuelAvoidedLitres: number;
    estimatedCo2AvoidedKg: number;
    currency: string;
  };
  lifetime: {
    estimatedMoneySaved: number;
    estimatedFuelAvoidedLitres: number;
    estimatedCo2AvoidedKg: number;
  };
  disclaimer: string;
}

export async function getSavings(): Promise<SavingsData> {
  return apiFetch<SavingsData>('/analytics/savings');
}

// ── Gamification ─────────────────────────────────────────────
export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement: Achievement;
  unlockedAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  targetMetric: string;
  targetValue: number;
  durationDays: number;
  rewardPoints: number;
  icon: string;
}

export interface UserChallenge {
  id: string;
  challengeId: string;
  challenge: Challenge;
  currentValue: number;
  isCompleted: boolean;
  startedAt: string;
}

export interface AchievementsData {
  catalog: Achievement[];
  unlocked: UserAchievement[];
}

export interface ChallengesData {
  catalog: Challenge[];
  userChallenges: UserChallenge[];
}

export interface StreakData {
  currentStreakDays: number;
  longestStreakDays: number;
  headline: string;
  lastActiveDate: string;
  weeklyProgress: Array<{ day: string; active: boolean; ecoScore?: number }>;
}

export async function getAchievements(): Promise<AchievementsData> {
  return apiFetch<AchievementsData>('/gamification/achievements');
}

export async function getChallenges(): Promise<ChallengesData> {
  return apiFetch<ChallengesData>('/gamification/challenges');
}

export async function getStreaks(): Promise<StreakData> {
  return apiFetch<StreakData>('/gamification/streaks');
}

// ── Vehicle Health ────────────────────────────────────────────
export interface VehicleHealth {
  vehicleId: string;
  vehicleName: string;
  coolantTempC: number;
  coolantStatus: string;
  batteryVoltage: number;
  batteryStatus: string;
  engineLoadPercent: number;
  engineLoadStatus: string;
  activeDtcs: Array<{ code: string; description: string; severity: string }>;
  maintenanceReminders: Array<{
    id: string;
    vehicleId: string;
    title: string;
    dueOdometerKm?: number;
    dueDate?: string;
    status: string;
  }>;
  disclaimer: string;
}

export async function getVehicleHealth(): Promise<VehicleHealth> {
  return apiFetch<VehicleHealth>('/vehicle-health/status');
}

// ── Simulator ─────────────────────────────────────────────────
export interface SimulatorResult {
  scenario: string;
  mode: string;
  trip: Trip;
  pointsSampled: number;
}

export async function runSimulator(
  scenario: string = 'SMOOTH_ECO',
  mode: string = 'OBD_II'
): Promise<SimulatorResult> {
  return apiFetch<SimulatorResult>('/simulators/run', {
    method: 'POST',
    body: JSON.stringify({ scenario, mode }),
  });
}

// ── Utilities ─────────────────────────────────────────────────
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m`;
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getScoreBand(score: number): string {
  if (score >= 85) return 'EXCELLENT';
  if (score >= 70) return 'GOOD';
  if (score >= 50) return 'MODERATE';
  return 'NEEDS_IMPROVEMENT';
}

export function getScoreColor(score: number): string {
  if (score >= 85) return '#10b981';
  if (score >= 70) return '#14b8a6';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}
