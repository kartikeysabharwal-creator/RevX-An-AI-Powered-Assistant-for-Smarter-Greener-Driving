import { v4 as uuidv4 } from 'uuid';
import {
  Trip,
  TelemetryPoint,
  TripMetrics,
  OperatingMode,
  DrivingEventDetector,
  EcoScoreEngine,
  SafetyScoreEngine,
  FuelEstimator,
  Co2Estimator,
  GreenComputingAuditor,
} from '@revx/shared';
import { db } from './db';
import { AICoachService } from './aiCoachService';

export class TripProcessorService {
  private static activeBuffers: Map<string, TelemetryPoint[]> = new Map();
  private static detectors: Map<string, DrivingEventDetector> = new Map();

  /**
   * Initializes a new trip record
   */
  public static startTrip(
    userId: string,
    vehicleId: string,
    mode: OperatingMode = 'PHONE_ONLY'
  ): Trip {
    const vehicle = db.getVehicleById(vehicleId, userId);
    if (!vehicle) {
      throw new Error(`Vehicle ${vehicleId} not found or unauthorized`);
    }

    const tripId = uuidv4();
    const newTrip: Trip = {
      id: tripId,
      userId,
      vehicleId,
      mode,
      status: 'ACTIVE',
      startTime: Date.now(),
      metrics: {
        distanceKm: 0,
        durationSeconds: 0,
        movingDurationSeconds: 0,
        idleDurationSeconds: 0,
        avgSpeedKmh: 0,
        maxSpeedKmh: 0,
        avgAccelerationMs2: 0,
        speedVariance: 0,
        stopCount: 0,
        harshAccelCount: 0,
        harshBrakeCount: 0,
        sharpTurnCount: 0,
        idleEventCount: 0,
        overspeedCount: 0,
      },
      fuelEmissions: {
        fuelUsedLitres: 0,
        fuelEfficiencyL100km: 0,
        fuelEfficiencyKml: 0,
        estimatedCo2Kg: 0,
        co2GramsPerKm: 0,
        fuelCost: 0,
        baselineFuelLitres: 0,
        fuelSavedLitres: 0,
        moneySaved: 0,
        co2AvoidedKg: 0,
        confidence: 'MEDIUM',
        estimatorVersion: 'v1.4.0',
        isEstimated: true,
      },
      ecoScore: {
        score: 85,
        band: 'EXCELLENT',
        fuelEfficiencyScore: 85,
        accelerationSmoothnessScore: 100,
        brakingSmoothnessScore: 100,
        idleScore: 100,
        speedConsistencyScore: 85,
        explanation: 'Trip in progress...',
      },
      safetyScore: {
        score: 100,
        band: 'SAFE',
        penalties: {
          harshAccelerationPenalty: 0,
          harshBrakingPenalty: 0,
          speedInstabilityPenalty: 0,
          sharpTurnPenalty: 0,
          overspeedPenalty: 0,
        },
        explanation: 'No safety incidents detected so far.',
      },
      events: [],
      routeCoordinates: [],
      createdAt: new Date().toISOString(),
    };

    db.createTrip(newTrip);
    this.activeBuffers.set(tripId, []);
    this.detectors.set(tripId, new DrivingEventDetector());

    return newTrip;
  }

  /**
   * Ingests a windowed batch of telemetry points, runs event detection, and buffers the points.
   */
  public static ingestBatch(
    tripId: string,
    points: TelemetryPoint[],
    isEnd: boolean = false
  ): { detectedEventsCount: number; tripStatus: string } {
    const trip = db.getTripById(tripId, tripId); // check exists
    let existingBuffer = this.activeBuffers.get(tripId) || [];
    let detector = this.detectors.get(tripId);
    if (!detector) {
      detector = new DrivingEventDetector();
      this.detectors.set(tripId, detector);
    }

    const prevPoint = existingBuffer.length > 0 ? existingBuffer[existingBuffer.length - 1] : undefined;
    const newEvents = detector.detectEventsFromWindow(tripId, points, prevPoint);

    // Append points
    existingBuffer = existingBuffer.concat(points);
    this.activeBuffers.set(tripId, existingBuffer);

    // If trip exists in db, update its events list
    const currentTrip: Trip | undefined = (db as any).trips.get(tripId);

    if (currentTrip && newEvents.length > 0) {
      currentTrip.events = (currentTrip.events || []).concat(newEvents);
    }

    if (isEnd) {
      this.finishTrip(tripId, currentTrip ? currentTrip.userId : '00000000-0000-0000-0000-000000000001');
    }

    return {
      detectedEventsCount: newEvents.length,
      tripStatus: isEnd ? 'COMPLETED' : 'ACTIVE',
    };
  }

  /**
   * Completes a trip, performs final calculations, and triggers AI coaching.
   */
  public static finishTrip(tripId: string, userId: string): Trip {
    const trip = db.getTripById(tripId, userId);
    if (!trip) {
      throw new Error(`Trip ${tripId} not found`);
    }

    const rawPoints = this.activeBuffers.get(tripId);
    let points: TelemetryPoint[] = rawPoints || [];

    if (points.length === 0 && trip.routeCoordinates && trip.routeCoordinates.length > 0) {
      points = trip.routeCoordinates.map((c) => ({
        timestamp: c.timestamp,
        latitude: c.lat,
        longitude: c.lng,
        accuracy: 4.0,
        speedKmh: c.speedKmh,
        longitudinalAccelMs2: 0.2,
        lateralAccelMs2: 0,
        verticalAccelMs2: 9.8,
        sourceMode: trip.mode,
        isStationary: c.speedKmh <= 3.0,
      }));
    }

    const vehicle = db.getVehicleById(trip.vehicleId, userId) || {
      fuelType: 'PETROL' as const,
      engineSizeL: 1.5,
      fuelPricePerLitre: 102.5,
    };
    const profile = db.getProfile(userId);

    const baselineEff = profile?.personalBaselineEfficiency || 8.5;
    const fuelPrice = profile?.fuelPricePerLitre || 102.5;

    // Calculate duration, distance, and speeds
    let distanceKm = 0;
    let idleSec = 0;
    let maxSpeed = 0;
    let sumSpeed = 0;
    const speeds: number[] = [];

    if (points.length >= 2) {
      for (let i = 1; i < points.length; i++) {
        const p1 = points[i - 1];
        const p2 = points[i];
        const dt = Math.max(0.1, (p2.timestamp - p1.timestamp) / 1000);
        const avgV = (p1.speedKmh + p2.speedKmh) / 2;
        distanceKm += (avgV * dt) / 3600;
        if (p2.isStationary || p2.speedKmh <= 3.0) {
          idleSec += dt;
        }
        if (p2.speedKmh > maxSpeed) maxSpeed = p2.speedKmh;
        sumSpeed += p2.speedKmh;
        speeds.push(p2.speedKmh);
      }
    } else {
      distanceKm = trip.metrics.distanceKm || 3.5;
    }

    const durationSec =
      points.length >= 2
        ? Math.round((points[points.length - 1].timestamp - points[0].timestamp) / 1000)
        : trip.metrics.durationSeconds || 300;

    const avgSpeed = speeds.length > 0 ? sumSpeed / speeds.length : 35;
    const speedVar =
      speeds.length > 0
        ? speeds.reduce((acc, s) => acc + Math.pow(s - avgSpeed, 2), 0) / speeds.length
        : 20;

    const events = trip.events || [];
    const harshAccelCount = events.filter((e) => e.eventType === 'HARSH_ACCELERATION').length;
    const harshBrakeCount = events.filter((e) => e.eventType === 'HARSH_BRAKING').length;
    const sharpTurnCount = events.filter((e) => e.eventType === 'SHARP_TURN').length;
    const idleEventCount = events.filter((e) => e.eventType === 'EXCESSIVE_IDLE').length;
    const overspeedCount = events.filter((e) => e.eventType === 'OVERSPEED').length;

    const metrics: TripMetrics = {
      distanceKm: Number(Math.max(0.1, distanceKm).toFixed(2)),
      durationSeconds: durationSec,
      movingDurationSeconds: Math.max(0, durationSec - Math.round(idleSec)),
      idleDurationSeconds: Math.round(idleSec),
      avgSpeedKmh: Number(avgSpeed.toFixed(1)),
      maxSpeedKmh: Number(maxSpeed.toFixed(1)),
      avgAccelerationMs2: 0.6,
      speedVariance: Number(speedVar.toFixed(1)),
      stopCount: idleEventCount + 1,
      harshAccelCount,
      harshBrakeCount,
      sharpTurnCount,
      idleEventCount,
      overspeedCount,
    };

    // Calculate Fuel & CO2
    const fuelResult = FuelEstimator.calculate(points, vehicle, trip.mode);
    const fuelEmissions = Co2Estimator.calculate(
      fuelResult,
      metrics.distanceKm,
      vehicle.fuelType,
      fuelPrice,
      baselineEff
    );

    // Calculate Eco Score & Safety Score
    const ecoScoreEngine = new EcoScoreEngine();
    const ecoScore = ecoScoreEngine.calculate(metrics, fuelEmissions.fuelEfficiencyL100km, baselineEff);

    const safetyScoreEngine = new SafetyScoreEngine();
    const safetyScore = safetyScoreEngine.calculate(metrics);

    // Downsample coordinates for route visualization (max 50 points for web/mobile maps)
    const routeCoords = points
      .filter((_, idx) => idx % Math.max(1, Math.floor(points.length / 50)) === 0)
      .map((p) => ({
        lat: p.latitude,
        lng: p.longitude,
        speedKmh: p.speedKmh,
        timestamp: p.timestamp,
      }));

    const updatedTrip: Trip = {
      ...trip,
      status: 'COMPLETED',
      endTime: Date.now(),
      metrics,
      fuelEmissions,
      ecoScore,
      safetyScore,
      routeCoordinates: routeCoords,
      routeSummary: `${routeCoords[0]?.lat || 12.97}➔${routeCoords[routeCoords.length - 1]?.lat || 12.84} (${metrics.distanceKm} km)`,
    };

    db.updateTrip(tripId, updatedTrip);

    // Trigger AI Coaching
    AICoachService.generateCoaching(updatedTrip).catch((err) => {
      console.error('[AI Coach] Async error:', err);
    });

    // Check Gamification
    if (harshAccelCount === 0) {
      db.unlockAchievement(userId, 'smooth_operator');
    }
    if (harshBrakeCount === 0) {
      db.unlockAchievement(userId, 'brake_master');
    }
    if (fuelEmissions.fuelEfficiencyL100km < baselineEff * 0.85) {
      db.unlockAchievement(userId, 'fuel_saver');
    }

    // Clean active buffer
    this.activeBuffers.delete(tripId);
    this.detectors.delete(tripId);

    // Log green computing metrics
    const greenMetrics = GreenComputingAuditor.computeMetrics(
      points.length,
      routeCoords.length,
      true,
      events.length
    );
    db.logGreenComputing(greenMetrics);

    return updatedTrip;
  }
}
