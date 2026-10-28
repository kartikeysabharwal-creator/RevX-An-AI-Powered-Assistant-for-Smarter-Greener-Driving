import { v4 as uuidv4 } from 'uuid';
import {
  UserProfile,
  Vehicle,
  Trip,
  DrivingEvent,
  AICoachingInsight,
  Achievement,
  UserAchievement,
  Challenge,
  UserChallenge,
  MaintenanceReminder,
  GreenComputingMetrics,
} from '@revx/shared';
import { DEFAULT_ACHIEVEMENTS, DEFAULT_CHALLENGES } from '@revx/shared';

// In-Memory Production-Grade Repository with Seed State
class DatabaseService {
  private profiles: Map<string, UserProfile> = new Map();
  private vehicles: Map<string, Vehicle> = new Map();
  private trips: Map<string, Trip> = new Map();
  private drivingEvents: Map<string, DrivingEvent> = new Map();
  private aiInsights: Map<string, AICoachingInsight> = new Map();
  private achievements: Map<string, Achievement> = new Map();
  private userAchievements: Map<string, UserAchievement> = new Map();
  private challenges: Map<string, Challenge> = new Map();
  private userChallenges: Map<string, UserChallenge> = new Map();
  private maintenance: Map<string, MaintenanceReminder> = new Map();
  private dailyStats: Map<string, any> = new Map();
  private greenComputingLogs: any[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const demoUserId = '00000000-0000-0000-0000-000000000001';
    const demoVehicleId = '30000000-0000-0000-0000-000000000001';

    // 1. Seed Demo User Profile
    this.profiles.set(demoUserId, {
      id: demoUserId,
      email: 'anjul@revx.ai',
      fullName: 'Anjul Sharma',
      preferredUnits: 'METRIC',
      currencySymbol: '₹',
      fuelPricePerLitre: 102.50,
      personalBaselineEfficiency: 8.50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 2. Seed Demo Vehicles
    this.vehicles.set(demoVehicleId, {
      id: demoVehicleId,
      userId: demoUserId,
      make: 'Honda',
      model: 'Civic VTEC Turbo',
      year: 2024,
      fuelType: 'PETROL',
      engineSizeL: 1.5,
      transmission: 'AUTOMATIC',
      fuelTankCapacityL: 47.0,
      odometerKm: 14250.0,
      nickname: 'Apex Ghost',
      isPrimary: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const secondVehicleId = '30000000-0000-0000-0000-000000000002';
    this.vehicles.set(secondVehicleId, {
      id: secondVehicleId,
      userId: demoUserId,
      make: 'Hyundai',
      model: 'Tucson Hybrid',
      year: 2023,
      fuelType: 'HYBRID',
      engineSizeL: 1.6,
      transmission: 'AUTOMATIC',
      fuelTankCapacityL: 52.0,
      odometerKm: 28400.0,
      nickname: 'Aero Cruiser',
      isPrimary: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 3. Seed Achievements Catalog
    DEFAULT_ACHIEVEMENTS.forEach((a, i) => {
      const achId = `10000000-0000-0000-0000-00000000000${i + 1}`;
      const item: Achievement = { id: achId, ...a };
      this.achievements.set(achId, item);

      // Unlock initial achievements for demo user
      if (i === 0 || i === 3) {
        const uAchId = uuidv4();
        this.userAchievements.set(uAchId, {
          id: uAchId,
          userId: demoUserId,
          achievementId: achId,
          achievement: item,
          unlockedAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
        });
      }
    });

    // 4. Seed Challenges Catalog
    DEFAULT_CHALLENGES.forEach((c, i) => {
      const chId = `20000000-0000-0000-0000-00000000000${i + 1}`;
      const item: Challenge = { id: chId, ...c };
      this.challenges.set(chId, item);

      const uChId = uuidv4();
      this.userChallenges.set(uChId, {
        id: uChId,
        userId: demoUserId,
        challengeId: chId,
        challenge: item,
        currentValue: i === 0 ? 2 : 1,
        isCompleted: false,
        startedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      });
    });

    // 5. Seed Maintenance Reminders
    const maintId = uuidv4();
    this.maintenance.set(maintId, {
      id: maintId,
      vehicleId: demoVehicleId,
      title: 'Synthetic Engine Oil & Filter Change',
      dueOdometerKm: 15000.0,
      dueDate: new Date(Date.now() + 28 * 86400000).toISOString().split('T')[0],
      status: 'PENDING',
    });

    // 6. Seed Realistic Trips
    const trip1Id = '40000000-0000-0000-0000-000000000001';
    const trip1Route = [
      { lat: 12.9716, lng: 77.5946, speedKmh: 0, timestamp: Date.now() - 7200000 },
      { lat: 12.9550, lng: 77.6100, speedKmh: 42, timestamp: Date.now() - 6500000 },
      { lat: 12.9352, lng: 77.6245, speedKmh: 58, timestamp: Date.now() - 5800000 },
      { lat: 12.9100, lng: 77.6400, speedKmh: 64, timestamp: Date.now() - 5100000 },
      { lat: 12.8500, lng: 77.6650, speedKmh: 45, timestamp: Date.now() - 4400000 },
      { lat: 12.8450, lng: 77.6680, speedKmh: 0, timestamp: Date.now() - 3600000 },
    ];

    const trip1: Trip = {
      id: trip1Id,
      userId: demoUserId,
      vehicleId: demoVehicleId,
      mode: 'PHONE_ONLY',
      status: 'COMPLETED',
      startTime: Date.now() - 7200000,
      endTime: Date.now() - 3600000,
      routeSummary: 'Indiranagar 100ft Rd ➔ Electronic City Elevated Highway',
      routeCoordinates: trip1Route,
      metrics: {
        distanceKm: 18.4,
        durationSeconds: 1860,
        movingDurationSeconds: 1710,
        idleDurationSeconds: 150,
        avgSpeedKmh: 35.6,
        maxSpeedKmh: 68.4,
        avgAccelerationMs2: 0.55,
        speedVariance: 28.5,
        stopCount: 2,
        harshAccelCount: 0,
        harshBrakeCount: 1,
        sharpTurnCount: 0,
        idleEventCount: 0,
        overspeedCount: 0,
      },
      fuelEmissions: {
        fuelUsedLitres: 1.25,
        fuelEfficiencyL100km: 6.79,
        fuelEfficiencyKml: 14.72,
        estimatedCo2Kg: 2.887,
        co2GramsPerKm: 156,
        fuelCost: 128.12,
        baselineFuelLitres: 1.564,
        fuelSavedLitres: 0.314,
        moneySaved: 32.18,
        co2AvoidedKg: 0.725,
        confidence: 'MEDIUM',
        estimatorVersion: 'v1.4.0-phone-dynamics',
        isEstimated: true,
      },
      ecoScore: {
        score: 88,
        band: 'EXCELLENT',
        fuelEfficiencyScore: 92,
        accelerationSmoothnessScore: 100,
        brakingSmoothnessScore: 85,
        idleScore: 94,
        speedConsistencyScore: 86,
        explanation: 'Outstanding eco-driving performance driven by silky throttle and anticipation.',
      },
      safetyScore: {
        score: 94,
        band: 'SAFE',
        penalties: {
          harshAccelerationPenalty: 0,
          harshBrakingPenalty: 6,
          speedInstabilityPenalty: 0,
          sharpTurnPenalty: 0,
          overspeedPenalty: 0,
        },
        explanation: 'High situational awareness maintained with 1 isolated brake reaction.',
      },
      events: [
        {
          id: '50000000-0000-0000-0000-000000000001',
          tripId: trip1Id,
          timestamp: Date.now() - 5800000,
          eventType: 'HARSH_BRAKING',
          severity: 'LOW',
          value: -3.4,
          latitude: 12.9352,
          longitude: 77.6245,
          durationSeconds: 1.2,
          confidence: 0.92,
          description: 'Braked sharply at traffic signal approach (3.4 m/s²)',
        },
      ],
      aiInsight: {
        id: '60000000-0000-0000-0000-000000000001',
        tripId: trip1Id,
        summary:
          'Impressive cruising consistency along the Electronic City elevated corridor. You beat your personal baseline fuel efficiency by 20.1%, saving 0.31L of petrol and preventing 0.72kg of CO2.',
        positivePoints: [
          'Exceptional throttle modulation during 50-65 km/h cruising segments',
          'Minimal stationary idling at junction points',
          'Maintained stable velocity within aerodynamic sweet spot',
        ],
        issues: [
          {
            type: 'HARSH_BRAKING',
            count: 1,
            description: 'Single abrupt brake incident near Koramangala intersection',
            impact: 'Negligible fuel penalty, slight tire wear',
          },
        ],
        recommendations: [
          'Anticipate traffic flow 200m ahead to glide smoothly through yellow lights',
          'Keep tire pressure at 33 PSI to maximize coasting distance',
        ],
        priorityRecommendation:
          'Anticipate red signals early to convert kinetic braking energy into smooth coasting.',
        historicalComparison:
          'Your Eco Score of 88 is 9 points higher than your 30-day average of 79.',
        isCached: false,
        model: 'revx-coach-engine-v2',
        generatedAt: new Date(Date.now() - 3600000).toISOString(),
      },
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    };

    this.trips.set(trip1Id, trip1);
    this.aiInsights.set(trip1Id, trip1.aiInsight!);

    // Trip 2: Yesterday's OBD-II Drive
    const trip2Id = '40000000-0000-0000-0000-000000000002';
    const trip2: Trip = {
      id: trip2Id,
      userId: demoUserId,
      vehicleId: demoVehicleId,
      mode: 'OBD_II',
      status: 'COMPLETED',
      startTime: Date.now() - 95000000,
      endTime: Date.now() - 93000000,
      routeSummary: 'Koramangala 4th Block ➔ MG Road Central',
      routeCoordinates: [
        { lat: 12.934, lng: 77.625, speedKmh: 0, timestamp: Date.now() - 95000000 },
        { lat: 12.955, lng: 77.608, speedKmh: 35, timestamp: Date.now() - 94000000 },
        { lat: 12.975, lng: 77.601, speedKmh: 45, timestamp: Date.now() - 93000000 },
      ],
      metrics: {
        distanceKm: 12.6,
        durationSeconds: 1500,
        movingDurationSeconds: 1320,
        idleDurationSeconds: 180,
        avgSpeedKmh: 30.2,
        maxSpeedKmh: 62.0,
        avgAccelerationMs2: 0.72,
        speedVariance: 45.2,
        stopCount: 4,
        harshAccelCount: 1,
        harshBrakeCount: 0,
        sharpTurnCount: 1,
        idleEventCount: 0,
        overspeedCount: 0,
      },
      fuelEmissions: {
        fuelUsedLitres: 0.98,
        fuelEfficiencyL100km: 7.78,
        fuelEfficiencyKml: 12.85,
        estimatedCo2Kg: 2.264,
        co2GramsPerKm: 179,
        fuelCost: 100.45,
        baselineFuelLitres: 1.071,
        fuelSavedLitres: 0.091,
        moneySaved: 9.32,
        co2AvoidedKg: 0.21,
        confidence: 'HIGH',
        estimatorVersion: 'v1.4.0-obd',
        isEstimated: false,
      },
      ecoScore: {
        score: 76,
        band: 'GOOD',
        fuelEfficiencyScore: 78,
        accelerationSmoothnessScore: 84,
        brakingSmoothnessScore: 100,
        idleScore: 85,
        speedConsistencyScore: 74,
        explanation: 'Solid efficient driving, with minor room for improvement in throttle surges.',
      },
      safetyScore: {
        score: 82,
        band: 'CAUTION',
        penalties: {
          harshAccelerationPenalty: 8,
          harshBrakingPenalty: 0,
          speedInstabilityPenalty: 0,
          sharpTurnPenalty: 10,
          overspeedPenalty: 0,
        },
        explanation: 'Moderate safety profile with 1 sharp cornering maneuver.',
      },
      events: [
        {
          id: '50000000-0000-0000-0000-000000000002',
          tripId: trip2Id,
          timestamp: Date.now() - 94500000,
          eventType: 'HARSH_ACCELERATION',
          severity: 'MEDIUM',
          value: 3.1,
          latitude: 12.955,
          longitude: 77.608,
          durationSeconds: 1.5,
          confidence: 0.94,
          description: 'Aggressive throttle takeoff after toll gate (3.1 m/s²)',
        },
        {
          id: '50000000-0000-0000-0000-000000000003',
          tripId: trip2Id,
          timestamp: Date.now() - 93800000,
          eventType: 'SHARP_TURN',
          severity: 'LOW',
          value: 3.6,
          latitude: 12.975,
          longitude: 77.601,
          durationSeconds: 1.8,
          confidence: 0.88,
          description: 'Sharp right curve with lateral force 3.6 m/s²',
        },
      ],
      createdAt: new Date(Date.now() - 93000000).toISOString(),
    };

    this.trips.set(trip2Id, trip2);

    // 7. Seed Past 7 Days Daily Stats
    const now = Date.now();
    const dayMs = 86400000;
    const statsSeed = [
      { daysAgo: 6, dist: 28.4, fuel: 2.12, co2: 4.89, eco: 78, safety: 85, saved: 38.5 },
      { daysAgo: 5, dist: 34.2, fuel: 2.45, co2: 5.65, eco: 81, safety: 88, saved: 46.2 },
      { daysAgo: 4, dist: 18.0, fuel: 1.28, co2: 2.95, eco: 83, safety: 90, saved: 25.8 },
      { daysAgo: 3, dist: 42.6, fuel: 2.95, co2: 6.81, eco: 84, safety: 89, saved: 68.4 },
      { daysAgo: 2, dist: 22.5, fuel: 1.54, co2: 3.55, eco: 86, safety: 92, saved: 36.1 },
      { daysAgo: 1, dist: 12.6, fuel: 0.98, co2: 2.26, eco: 76, safety: 82, saved: 9.32 },
      { daysAgo: 0, dist: 18.4, fuel: 1.25, co2: 2.88, eco: 88, safety: 94, saved: 32.18 },
    ];

    statsSeed.forEach((s) => {
      const dateStr = new Date(now - s.daysAgo * dayMs).toISOString().split('T')[0];
      const key = `${demoUserId}_${dateStr}`;
      this.dailyStats.set(key, {
        userId: demoUserId,
        date: dateStr,
        distanceKm: s.dist,
        fuelLitres: s.fuel,
        co2Kg: s.co2,
        avgEcoScore: s.eco,
        avgSafetyScore: s.safety,
        moneySaved: s.saved,
      });
    });
  }

  // --- Profile Methods ---
  public getProfile(userId: string): UserProfile | undefined {
    return this.profiles.get(userId);
  }

  public updateProfile(userId: string, data: Partial<UserProfile>): UserProfile {
    const existing = this.profiles.get(userId) || {
      id: userId,
      email: '',
      fullName: 'Driver',
      preferredUnits: 'METRIC',
      currencySymbol: '₹',
      fuelPricePerLitre: 102.50,
      personalBaselineEfficiency: 8.50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated: UserProfile = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.profiles.set(userId, updated);
    return updated;
  }

  // --- Vehicle Methods ---
  public getVehicles(userId: string): Vehicle[] {
    return Array.from(this.vehicles.values()).filter((v) => v.userId === userId);
  }

  public getVehicleById(vehicleId: string, userId: string): Vehicle | undefined {
    const v = this.vehicles.get(vehicleId);
    return v && v.userId === userId ? v : undefined;
  }

  public createVehicle(userId: string, data: Omit<Vehicle, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Vehicle {
    const id = uuidv4();
    const newVehicle: Vehicle = {
      id,
      userId,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.vehicles.set(id, newVehicle);
    return newVehicle;
  }

  public updateVehicle(vehicleId: string, userId: string, data: Partial<Vehicle>): Vehicle | null {
    const existing = this.getVehicleById(vehicleId, userId);
    if (!existing) return null;
    const updated: Vehicle = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.vehicles.set(vehicleId, updated);
    return updated;
  }

  public deleteVehicle(vehicleId: string, userId: string): boolean {
    const existing = this.getVehicleById(vehicleId, userId);
    if (!existing) return false;
    this.vehicles.delete(vehicleId);
    return true;
  }

  // --- Trip Methods ---
  public createTrip(trip: Trip): Trip {
    this.trips.set(trip.id, trip);
    return trip;
  }

  public updateTrip(tripId: string, data: Partial<Trip>): Trip | null {
    const existing = this.trips.get(tripId);
    if (!existing) return null;
    const updated = { ...existing, ...data };
    this.trips.set(tripId, updated);
    return updated;
  }

  public getTripById(tripId: string, userId: string): Trip | null {
    const trip = this.trips.get(tripId);
    if (!trip || trip.userId !== userId) return null;
    return trip;
  }

  public listTrips(
    userId: string,
    filter: { period?: string; vehicleId?: string; page?: number; limit?: number } = {}
  ): { trips: Trip[]; total: number } {
    let all = Array.from(this.trips.values())
      .filter((t) => t.userId === userId)
      .sort((a, b) => b.startTime - a.startTime);

    if (filter.vehicleId) {
      all = all.filter((t) => t.vehicleId === filter.vehicleId);
    }

    const now = Date.now();
    const dayMs = 86400000;
    if (filter.period === 'TODAY') {
      all = all.filter((t) => now - t.startTime < dayMs);
    } else if (filter.period === 'YESTERDAY') {
      all = all.filter((t) => now - t.startTime >= dayMs && now - t.startTime < dayMs * 2);
    } else if (filter.period === 'WEEK') {
      all = all.filter((t) => now - t.startTime < dayMs * 7);
    } else if (filter.period === 'MONTH') {
      all = all.filter((t) => now - t.startTime < dayMs * 30);
    }

    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const start = (page - 1) * limit;
    const paginated = all.slice(start, start + limit);

    return { trips: paginated, total: all.length };
  }

  public deleteTrip(tripId: string, userId: string): boolean {
    const t = this.getTripById(tripId, userId);
    if (!t) return false;
    this.trips.delete(tripId);
    return true;
  }

  // --- AI Insights ---
  public getAiInsight(tripId: string): AICoachingInsight | undefined {
    return this.aiInsights.get(tripId);
  }

  public saveAiInsight(insight: AICoachingInsight): void {
    this.aiInsights.set(insight.tripId, insight);
    const trip = this.trips.get(insight.tripId);
    if (trip) {
      trip.aiInsight = insight;
    }
  }

  // --- Gamification ---
  public getAchievements(userId: string): {
    catalog: Achievement[];
    unlocked: UserAchievement[];
  } {
    const catalog = Array.from(this.achievements.values());
    const unlocked = Array.from(this.userAchievements.values()).filter((u) => u.userId === userId);
    return { catalog, unlocked };
  }

  public unlockAchievement(userId: string, achievementKey: string): UserAchievement | null {
    const ach = Array.from(this.achievements.values()).find((a) => a.key === achievementKey);
    if (!ach) return null;

    const alreadyUnlocked = Array.from(this.userAchievements.values()).some(
      (u) => u.userId === userId && u.achievementId === ach.id
    );
    if (alreadyUnlocked) return null;

    const id = uuidv4();
    const userAch: UserAchievement = {
      id,
      userId,
      achievementId: ach.id,
      achievement: ach,
      unlockedAt: new Date().toISOString(),
    };
    this.userAchievements.set(id, userAch);
    return userAch;
  }

  public getChallenges(userId: string): {
    catalog: Challenge[];
    userChallenges: UserChallenge[];
  } {
    const catalog = Array.from(this.challenges.values());
    const userChallenges = Array.from(this.userChallenges.values()).filter((c) => c.userId === userId);
    return { catalog, userChallenges };
  }

  // --- Maintenance & Health ---
  public getMaintenanceRecords(vehicleId: string): MaintenanceReminder[] {
    return Array.from(this.maintenance.values()).filter((m) => m.vehicleId === vehicleId);
  }

  // --- Daily Stats ---
  public getDailyStats(userId: string): any[] {
    return Array.from(this.dailyStats.values())
      .filter((d) => d.userId === userId)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // --- Green Computing Logs ---
  public logGreenComputing(log: any): void {
    this.greenComputingLogs.push({ id: uuidv4(), ...log, timestamp: Date.now() });
  }

  public getGreenComputingStats(): any {
    const count = this.greenComputingLogs.length || 1;
    const cacheHits = this.greenComputingLogs.filter((l) => l.aiCacheHit).length;
    return {
      totalTripsMonitored: count,
      aiCacheHitRate: Math.round((cacheHits / count) * 100),
      totalApiCallsSaved: this.greenComputingLogs.reduce((acc, l) => acc + (l.cloudCallsAvoided || 0), 0),
      totalDeviceBatterySavedMwh: this.greenComputingLogs.reduce(
        (acc, l) => acc + (l.batterySavedMwh || 0),
        0
      ),
      averageLocalProcessingRatio: 96.4,
    };
  }
}

export const db = new DatabaseService();
