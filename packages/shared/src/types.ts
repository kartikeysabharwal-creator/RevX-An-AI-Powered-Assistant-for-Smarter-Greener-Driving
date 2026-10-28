export type OperatingMode = 'PHONE_ONLY' | 'OBD_II';

export type FuelType = 'PETROL' | 'DIESEL' | 'HYBRID' | 'ELECTRIC' | 'CNG';

export type DrivingEventType =
  | 'HARSH_ACCELERATION'
  | 'HARSH_BRAKING'
  | 'RAPID_SPEED_CHANGE'
  | 'SHARP_TURN'
  | 'EXCESSIVE_IDLE'
  | 'OVERSPEED';

export type EventSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type EcoBand = 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'NEEDS_IMPROVEMENT';
export type SafetyBand = 'SAFE' | 'CAUTION' | 'HIGH_RISK';

export type TripStatus =
  | 'IDLE'
  | 'DETECTING'
  | 'ACTIVE'
  | 'PAUSED'
  | 'FINISHING'
  | 'COMPLETED'
  | 'CANCELLED';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  preferredUnits: 'METRIC' | 'IMPERIAL';
  currencySymbol: string;
  fuelPricePerLitre: number;
  personalBaselineEfficiency: number; // L/100km baseline for calculating savings
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  fuelType: FuelType;
  engineSizeL: number; // e.g. 1.5, 2.0
  transmission: 'AUTOMATIC' | 'MANUAL';
  fuelTankCapacityL: number;
  odometerKm: number;
  nickname?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TelemetryPoint {
  id?: string;
  tripId?: string;
  timestamp: number; // epoch ms
  latitude: number;
  longitude: number;
  accuracy: number; // meters
  speedKmh: number; // speed in km/h
  altitude?: number;
  heading?: number;
  // Raw and transformed IMU
  rawAx?: number;
  rawAy?: number;
  rawAz?: number;
  longitudinalAccelMs2: number; // forward/braking accel (m/s²)
  lateralAccelMs2: number; // lateral cornering accel (m/s²)
  verticalAccelMs2: number;
  gyroZ?: number; // angular velocity (rad/s)
  jerkMs3?: number; // rate of change of acceleration
  // OBD-II fields (optional, present in OBD_II mode)
  rpm?: number;
  throttlePos?: number; // percentage 0-100
  engineLoad?: number; // percentage 0-100
  coolantTempC?: number;
  fuelLevelPercent?: number;
  batteryVoltage?: number;
  mafGramsSec?: number; // Mass Air Flow (g/s)
  // Metadata
  sourceMode: OperatingMode;
  isStationary: boolean;
}

export interface DrivingEvent {
  id: string;
  tripId: string;
  timestamp: number;
  eventType: DrivingEventType;
  severity: EventSeverity;
  value: number; // e.g. accel value m/s² or speed km/h or idle secs
  latitude?: number;
  longitude?: number;
  durationSeconds: number;
  confidence: number; // 0.0 - 1.0
  description: string;
}

export interface TripMetrics {
  distanceKm: number;
  durationSeconds: number;
  movingDurationSeconds: number;
  idleDurationSeconds: number;
  avgSpeedKmh: number;
  maxSpeedKmh: number;
  avgAccelerationMs2: number;
  speedVariance: number;
  stopCount: number;
  harshAccelCount: number;
  harshBrakeCount: number;
  sharpTurnCount: number;
  idleEventCount: number;
  overspeedCount: number;
}

export interface EcoScoreBreakdown {
  score: number; // 0-100
  band: EcoBand;
  fuelEfficiencyScore: number; // 30%
  accelerationSmoothnessScore: number; // 25%
  brakingSmoothnessScore: number; // 20%
  idleScore: number; // 15%
  speedConsistencyScore: number; // 10%
  explanation: string;
}

export interface SafetyScoreBreakdown {
  score: number; // 0-100
  band: SafetyBand;
  penalties: {
    harshAccelerationPenalty: number;
    harshBrakingPenalty: number;
    speedInstabilityPenalty: number;
    sharpTurnPenalty: number;
    overspeedPenalty: number;
  };
  explanation: string;
}

export interface FuelEmissionsCalculation {
  fuelUsedLitres: number;
  fuelEfficiencyL100km: number;
  fuelEfficiencyKml: number;
  estimatedCo2Kg: number;
  co2GramsPerKm: number;
  fuelCost: number;
  // Relative to personal baseline:
  baselineFuelLitres: number;
  fuelSavedLitres: number;
  moneySaved: number;
  co2AvoidedKg: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatorVersion: string;
  isEstimated: boolean;
}

export interface AICoachingInsight {
  id?: string;
  tripId: string;
  summary: string;
  positivePoints: string[];
  issues: Array<{
    type: DrivingEventType;
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
  mode: OperatingMode;
  status: TripStatus;
  startTime: number;
  endTime?: number;
  routeSummary?: string; // polyline or geoJSON summary
  metrics: TripMetrics;
  fuelEmissions: FuelEmissionsCalculation;
  ecoScore: EcoScoreBreakdown;
  safetyScore: SafetyScoreBreakdown;
  events: DrivingEvent[];
  aiInsight?: AICoachingInsight;
  routeCoordinates?: Array<{ lat: number; lng: number; speedKmh: number; timestamp: number }>;
  createdAt: string;
}

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: 'EFFICIENCY' | 'SAFETY' | 'CONSISTENCY' | 'MILESTONE';
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
  userId: string;
  challengeId: string;
  challenge: Challenge;
  currentValue: number;
  isCompleted: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface StreakInfo {
  currentStreakDays: number;
  longestStreakDays: number;
  lastActiveDate: string;
  weeklyProgress: Array<{
    day: string; // 'Mon', 'Tue', etc.
    active: boolean;
    ecoScore?: number;
  }>;
}

export interface VehicleHealthStatus {
  coolantTempC?: number;
  coolantStatus: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'UNAVAILABLE';
  batteryVoltage?: number;
  batteryStatus: 'NORMAL' | 'LOW' | 'CRITICAL' | 'UNAVAILABLE';
  engineLoadPercent?: number;
  engineLoadStatus: 'NORMAL' | 'HIGH' | 'UNAVAILABLE';
  activeDtcs: Array<{
    code: string;
    description: string;
    severity: 'INFORMATIONAL' | 'WARNING';
  }>;
  disclaimer: string;
  maintenanceReminders: MaintenanceReminder[];
}

export interface MaintenanceReminder {
  id: string;
  vehicleId: string;
  title: string;
  dueOdometerKm?: number;
  dueDate?: string;
  status: 'PENDING' | 'DUE_SOON' | 'OVERDUE' | 'COMPLETED';
}

export interface GreenComputingMetrics {
  totalSensorPointsSampled: number;
  telemetryPointsUploaded: number;
  dataPointsReducedPercent: number;
  cloudApiCallsAvoided: number;
  aiCacheHitRatePercent: number;
  localProcessingRatioPercent: number;
  estimatedDeviceBatterySavedMwh: number;
  estimatedCloudEnergySavedWh: number;
}
