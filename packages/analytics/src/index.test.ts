import { AnalyticsAggregator } from './index';
import { Trip } from '@revx/shared';

describe('AnalyticsAggregator', () => {
  const mockTrip = (
    dist: number,
    fuel: number,
    eco: number,
    safety: number,
    accel: number,
    brake: number
  ): Trip =>
    ({
      id: `trip-${Math.random()}`,
      userId: 'usr-1',
      vehicleId: 'veh-1',
      mode: 'PHONE_ONLY',
      status: 'COMPLETED',
      startTime: Date.now(),
      metrics: {
        distanceKm: dist,
        durationSeconds: 1000,
        movingDurationSeconds: 900,
        idleDurationSeconds: 100,
        avgSpeedKmh: 45,
        maxSpeedKmh: 65,
        avgAccelerationMs2: 0.6,
        speedVariance: 20,
        stopCount: 2,
        harshAccelCount: accel,
        harshBrakeCount: brake,
        sharpTurnCount: 0,
        idleEventCount: 0,
        overspeedCount: 0,
      },
      fuelEmissions: {
        fuelUsedLitres: fuel,
        fuelEfficiencyL100km: (fuel / dist) * 100,
        fuelEfficiencyKml: dist / fuel,
        estimatedCo2Kg: fuel * 2.31,
        co2GramsPerKm: 120,
        fuelCost: fuel * 100,
        baselineFuelLitres: (dist * 8.5) / 100,
        fuelSavedLitres: Math.max(0, (dist * 8.5) / 100 - fuel),
        moneySaved: Math.max(0, ((dist * 8.5) / 100 - fuel) * 100),
        co2AvoidedKg: Math.max(0, ((dist * 8.5) / 100 - fuel) * 2.31),
        confidence: 'MEDIUM',
        estimatorVersion: 'v1.4.0',
        isEstimated: true,
      },
      ecoScore: {
        score: eco,
        band: eco >= 85 ? 'EXCELLENT' : 'GOOD',
        fuelEfficiencyScore: eco,
        accelerationSmoothnessScore: 90,
        brakingSmoothnessScore: 90,
        idleScore: 95,
        speedConsistencyScore: 85,
        explanation: 'Good trip',
      },
      safetyScore: {
        score: safety,
        band: 'SAFE',
        penalties: {
          harshAccelerationPenalty: 0,
          harshBrakingPenalty: 0,
          speedInstabilityPenalty: 0,
          sharpTurnPenalty: 0,
          overspeedPenalty: 0,
        },
        explanation: 'Safe',
      },
      events: [],
      createdAt: new Date().toISOString(),
    } as Trip);

  it('aggregates trips correctly', () => {
    const trips = [mockTrip(10, 0.7, 85, 90, 0, 0), mockTrip(20, 1.3, 89, 95, 0, 0)];
    const stats = AnalyticsAggregator.aggregate(trips);
    expect(stats.tripCount).toBe(2);
    expect(stats.totalDistanceKm).toBe(30);
    expect(stats.avgEcoScore).toBe(87);
    expect(stats.avgSafetyScore).toBe(93);
    expect(stats.totalFuelSavedLitres).toBeGreaterThan(0);
  });

  it('generates trend comparisons and improvement percentage', () => {
    const currentWeek = [mockTrip(15, 0.9, 88, 92, 0, 0)];
    const previousWeek = [mockTrip(15, 1.2, 79, 85, 2, 2)];
    const trends = AnalyticsAggregator.comparePeriods(currentWeek, previousWeek);

    expect(trends.ecoTrend.isImprovement).toBe(true);
    expect(trends.ecoTrend.percentageChange).toBeGreaterThan(0);
    expect(trends.ecoTrend.narrative).toContain('improved');
  });
});
