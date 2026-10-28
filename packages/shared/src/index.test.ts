import {
  DrivingEventDetector,
  EcoScoreEngine,
  SafetyScoreEngine,
  FuelEstimator,
  Co2Estimator,
  GreenComputingAuditor,
  TelemetryPoint,
  TripMetrics,
} from './index';

describe('RevX Core Engine Tests', () => {
  describe('DrivingEventDetector', () => {
    const detector = new DrivingEventDetector({
      harshAccelThreshold: 2.8,
      harshBrakeThreshold: -3.2,
      sharpTurnThreshold: 3.5,
      spikeWindowMs: 3.0,
    });

    it('should detect harsh acceleration and brake correctly with spike suppression', () => {
      const now = Date.now();
      const points: TelemetryPoint[] = [
        {
          timestamp: now,
          latitude: 12.9716,
          longitude: 77.5946,
          accuracy: 5,
          speedKmh: 20,
          longitudinalAccelMs2: 3.2, // Harsh accel!
          lateralAccelMs2: 0.1,
          verticalAccelMs2: 0.0,
          sourceMode: 'PHONE_ONLY',
          isStationary: false,
        },
        {
          timestamp: now + 500, // within spike window (3000ms)
          latitude: 12.9717,
          longitude: 77.5947,
          accuracy: 5,
          speedKmh: 25,
          longitudinalAccelMs2: 3.5, // should be suppressed as duplicate spike
          lateralAccelMs2: 0.2,
          verticalAccelMs2: 0.0,
          sourceMode: 'PHONE_ONLY',
          isStationary: false,
        },
        {
          timestamp: now + 5000,
          latitude: 12.972,
          longitude: 77.595,
          accuracy: 5,
          speedKmh: 40,
          longitudinalAccelMs2: -3.8, // Harsh brake!
          lateralAccelMs2: 0.1,
          verticalAccelMs2: 0.0,
          sourceMode: 'PHONE_ONLY',
          isStationary: false,
        },
      ];

      const events = detector.detectEventsFromWindow('trip-123', points);
      expect(events.length).toBe(2);
      expect(events[0].eventType).toBe('HARSH_ACCELERATION');
      expect(events[1].eventType).toBe('HARSH_BRAKING');
    });
  });

  describe('EcoScoreEngine', () => {
    const engine = new EcoScoreEngine();

    it('should award high eco score to smooth efficient trips', () => {
      const metrics: TripMetrics = {
        distanceKm: 15.0,
        durationSeconds: 1200,
        movingDurationSeconds: 1100,
        idleDurationSeconds: 100,
        avgSpeedKmh: 45,
        maxSpeedKmh: 65,
        avgAccelerationMs2: 0.6,
        speedVariance: 25,
        stopCount: 2,
        harshAccelCount: 0,
        harshBrakeCount: 0,
        sharpTurnCount: 0,
        idleEventCount: 0,
        overspeedCount: 0,
      };

      const breakdown = engine.calculate(metrics, 6.2, 8.5); // 6.2 L/100km vs 8.5 baseline
      expect(breakdown.score).toBeGreaterThanOrEqual(85);
      expect(breakdown.band).toBe('EXCELLENT');
      expect(breakdown.accelerationSmoothnessScore).toBe(100);
      expect(breakdown.brakingSmoothnessScore).toBe(100);
    });

    it('should penalize frequent throttle surges and hard braking', () => {
      const metrics: TripMetrics = {
        distanceKm: 10.0,
        durationSeconds: 900,
        movingDurationSeconds: 700,
        idleDurationSeconds: 200,
        avgSpeedKmh: 40,
        maxSpeedKmh: 75,
        avgAccelerationMs2: 1.8,
        speedVariance: 120,
        stopCount: 8,
        harshAccelCount: 5,
        harshBrakeCount: 4,
        sharpTurnCount: 2,
        idleEventCount: 2,
        overspeedCount: 1,
      };

      const breakdown = engine.calculate(metrics, 10.5, 8.5); // 10.5 L/100km vs 8.5 baseline
      expect(breakdown.score).toBeLessThan(70);
      expect(['MODERATE', 'NEEDS_IMPROVEMENT']).toContain(breakdown.band);
    });
  });

  describe('SafetyScoreEngine', () => {
    const engine = new SafetyScoreEngine();

    it('should start at 100 and deduct penalties based on hazardous events', () => {
      const cleanMetrics: TripMetrics = {
        distanceKm: 20,
        durationSeconds: 1500,
        movingDurationSeconds: 1400,
        idleDurationSeconds: 100,
        avgSpeedKmh: 48,
        maxSpeedKmh: 65,
        avgAccelerationMs2: 0.5,
        speedVariance: 30,
        stopCount: 3,
        harshAccelCount: 0,
        harshBrakeCount: 0,
        sharpTurnCount: 0,
        idleEventCount: 0,
        overspeedCount: 0,
      };

      const cleanScore = engine.calculate(cleanMetrics);
      expect(cleanScore.score).toBe(100);
      expect(cleanScore.band).toBe('SAFE');

      const aggressiveMetrics: TripMetrics = {
        ...cleanMetrics,
        harshBrakeCount: 4,
        harshAccelCount: 3,
        sharpTurnCount: 2,
      };

      const aggressiveScore = engine.calculate(aggressiveMetrics);
      expect(aggressiveScore.score).toBeLessThan(80);
      expect(aggressiveScore.penalties.harshBrakingPenalty).toBeGreaterThan(0);
    });
  });

  describe('FuelEstimator & Co2Estimator', () => {
    it('should estimate fuel usage and calculate CO2 and savings', () => {
      const now = Date.now();
      const points: TelemetryPoint[] = [
        {
          timestamp: now,
          latitude: 12.9,
          longitude: 77.6,
          accuracy: 5,
          speedKmh: 0,
          longitudinalAccelMs2: 0,
          lateralAccelMs2: 0,
          verticalAccelMs2: 0,
          sourceMode: 'PHONE_ONLY',
          isStationary: true,
        },
        {
          timestamp: now + 10000,
          latitude: 12.901,
          longitude: 77.601,
          accuracy: 5,
          speedKmh: 45,
          longitudinalAccelMs2: 1.2,
          lateralAccelMs2: 0,
          verticalAccelMs2: 0,
          sourceMode: 'PHONE_ONLY',
          isStationary: false,
        },
        {
          timestamp: now + 30000,
          latitude: 12.905,
          longitude: 77.605,
          accuracy: 5,
          speedKmh: 50,
          longitudinalAccelMs2: 0.1,
          lateralAccelMs2: 0,
          verticalAccelMs2: 0,
          sourceMode: 'PHONE_ONLY',
          isStationary: false,
        },
      ];

      const fuel = FuelEstimator.calculate(points, { fuelType: 'PETROL', engineSizeL: 1.6 }, 'PHONE_ONLY');
      expect(fuel.fuelUsedLitres).toBeGreaterThan(0);
      expect(fuel.isEstimated).toBe(true);

      const emissions = Co2Estimator.calculate(fuel, 10.0, 'PETROL', 102.5, 8.5);
      expect(emissions.estimatedCo2Kg).toBeGreaterThan(0);
      expect(emissions.fuelCost).toBeGreaterThan(0);
    });
  });

  describe('GreenComputingAuditor', () => {
    it('should calculate local processing savings and trip cache hashing', () => {
      const metrics = GreenComputingAuditor.computeMetrics(1200, 15, true, 3);
      expect(metrics.dataPointsReducedPercent).toBeGreaterThan(95);
      expect(metrics.aiCacheHitRatePercent).toBe(100);
      expect(metrics.localProcessingRatioPercent).toBeGreaterThan(90);

      const hash = GreenComputingAuditor.hashTripForAiCache(14.2, 2, 1, 42.5, 84);
      expect(hash).toContain('trip-hash');
    });
  });
});
