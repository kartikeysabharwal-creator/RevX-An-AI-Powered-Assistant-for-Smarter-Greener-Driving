import { Trip } from '@revx/shared';

export interface AggregatedStats {
  tripCount: number;
  totalDistanceKm: number;
  totalDurationSeconds: number;
  totalFuelUsedLitres: number;
  totalCo2Kg: number;
  avgEcoScore: number;
  avgSafetyScore: number;
  avgFuelEfficiencyL100km: number;
  totalFuelSavedLitres: number;
  totalMoneySaved: number;
  totalCo2AvoidedKg: number;
  totalHarshAccels: number;
  totalHarshBrakes: number;
  totalSharpTurns: number;
}

export interface TrendComparison {
  metric: string;
  currentValue: number;
  previousValue: number;
  percentageChange: number; // e.g. +11%
  isImprovement: boolean;
  narrative: string;
}

export class AnalyticsAggregator {
  /**
   * Aggregates a list of trips into composite performance statistics
   */
  public static aggregate(trips: Trip[]): AggregatedStats {
    if (!trips || trips.length === 0) {
      return {
        tripCount: 0,
        totalDistanceKm: 0,
        totalDurationSeconds: 0,
        totalFuelUsedLitres: 0,
        totalCo2Kg: 0,
        avgEcoScore: 0,
        avgSafetyScore: 0,
        avgFuelEfficiencyL100km: 0,
        totalFuelSavedLitres: 0,
        totalMoneySaved: 0,
        totalCo2AvoidedKg: 0,
        totalHarshAccels: 0,
        totalHarshBrakes: 0,
        totalSharpTurns: 0,
      };
    }

    let dist = 0;
    let dur = 0;
    let fuel = 0;
    let co2 = 0;
    let ecoSum = 0;
    let safetySum = 0;
    let fuelSaved = 0;
    let moneySaved = 0;
    let co2Avoided = 0;
    let accels = 0;
    let brakes = 0;
    let turns = 0;

    for (const t of trips) {
      dist += t.metrics.distanceKm;
      dur += t.metrics.durationSeconds;
      fuel += t.fuelEmissions.fuelUsedLitres;
      co2 += t.fuelEmissions.estimatedCo2Kg;
      ecoSum += t.ecoScore.score;
      safetySum += t.safetyScore.score;
      fuelSaved += t.fuelEmissions.fuelSavedLitres;
      moneySaved += t.fuelEmissions.moneySaved;
      co2Avoided += t.fuelEmissions.co2AvoidedKg;
      accels += t.metrics.harshAccelCount;
      brakes += t.metrics.harshBrakeCount;
      turns += t.metrics.sharpTurnCount;
    }

    const count = trips.length;
    const avgEfficiency = dist > 0 ? (fuel / dist) * 100 : 0;

    return {
      tripCount: count,
      totalDistanceKm: Number(dist.toFixed(1)),
      totalDurationSeconds: dur,
      totalFuelUsedLitres: Number(fuel.toFixed(2)),
      totalCo2Kg: Number(co2.toFixed(2)),
      avgEcoScore: Math.round(ecoSum / count),
      avgSafetyScore: Math.round(safetySum / count),
      avgFuelEfficiencyL100km: Number(avgEfficiency.toFixed(2)),
      totalFuelSavedLitres: Number(fuelSaved.toFixed(2)),
      totalMoneySaved: Number(moneySaved.toFixed(2)),
      totalCo2AvoidedKg: Number(co2Avoided.toFixed(2)),
      totalHarshAccels: accels,
      totalHarshBrakes: brakes,
      totalSharpTurns: turns,
    };
  }

  /**
   * Compares current period stats with previous period to generate genuine trend narratives
   */
  public static comparePeriods(
    currentTrips: Trip[],
    previousTrips: Trip[]
  ): {
    ecoTrend: TrendComparison;
    safetyTrend: TrendComparison;
    fuelEfficiencyTrend: TrendComparison;
  } {
    const cur = this.aggregate(currentTrips);
    const prev = this.aggregate(previousTrips);

    // Eco Score comparison
    let ecoChange = 0;
    if (prev.avgEcoScore > 0) {
      ecoChange = Math.round(((cur.avgEcoScore - prev.avgEcoScore) / prev.avgEcoScore) * 100);
    }
    const ecoImproved = ecoChange >= 0;
    const ecoNarrative =
      prev.tripCount === 0
        ? 'Initial baseline established for your driving.'
        : ecoImproved
        ? `Your Eco Score improved ${Math.abs(ecoChange)}% compared with your previous period.`
        : `Your Eco Score dipped ${Math.abs(ecoChange)}% compared with your previous period.`;

    // Safety Score comparison
    let safetyChange = 0;
    if (prev.avgSafetyScore > 0) {
      safetyChange = Math.round(
        ((cur.avgSafetyScore - prev.avgSafetyScore) / prev.avgSafetyScore) * 100
      );
    }
    const safetyImproved = safetyChange >= 0;
    const safetyNarrative =
      prev.tripCount === 0
        ? 'First week safety baseline recorded.'
        : safetyImproved
        ? `Safety Score improved ${Math.abs(safetyChange)}% with fewer dynamic disruptions.`
        : `Safety Score decreased ${Math.abs(safetyChange)}% due to occasional harsh reactions.`;

    // Fuel Efficiency comparison (lower L/100km is better!)
    let effChange = 0;
    if (prev.avgFuelEfficiencyL100km > 0) {
      effChange = Math.round(
        ((cur.avgFuelEfficiencyL100km - prev.avgFuelEfficiencyL100km) /
          prev.avgFuelEfficiencyL100km) *
          100
      );
    }
    const effImproved = effChange <= 0; // negative L/100km change means more efficient
    const effNarrative =
      prev.tripCount === 0
        ? 'Efficiency baseline established.'
        : effImproved
        ? `Fuel burn reduced by ${Math.abs(effChange)}% per 100km.`
        : `Fuel demand increased by ${Math.abs(effChange)}% per 100km.`;

    return {
      ecoTrend: {
        metric: 'Eco Score',
        currentValue: cur.avgEcoScore,
        previousValue: prev.avgEcoScore,
        percentageChange: ecoChange,
        isImprovement: ecoImproved,
        narrative: ecoNarrative,
      },
      safetyTrend: {
        metric: 'Safety Score',
        currentValue: cur.avgSafetyScore,
        previousValue: prev.avgSafetyScore,
        percentageChange: safetyChange,
        isImprovement: safetyImproved,
        narrative: safetyNarrative,
      },
      fuelEfficiencyTrend: {
        metric: 'Fuel Efficiency (L/100km)',
        currentValue: cur.avgFuelEfficiencyL100km,
        previousValue: prev.avgFuelEfficiencyL100km,
        percentageChange: effChange,
        isImprovement: effImproved,
        narrative: effNarrative,
      },
    };
  }

  /**
   * Groups trips into day-of-week buckets for weekly dashboard charts
   */
  public static groupByDayOfWeek(trips: Trip[]): Array<{
    day: string;
    distanceKm: number;
    fuelUsedLitres: number;
    co2Kg: number;
    ecoScore: number;
    tripCount: number;
  }> {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const buckets = days.map((d) => ({
      day: d,
      distanceKm: 0,
      fuelUsedLitres: 0,
      co2Kg: 0,
      ecoScoreSum: 0,
      tripCount: 0,
    }));

    for (const t of trips) {
      const d = new Date(t.startTime).getDay();
      buckets[d].distanceKm += t.metrics.distanceKm;
      buckets[d].fuelUsedLitres += t.fuelEmissions.fuelUsedLitres;
      buckets[d].co2Kg += t.fuelEmissions.estimatedCo2Kg;
      buckets[d].ecoScoreSum += t.ecoScore.score;
      buckets[d].tripCount += 1;
    }

    return buckets.map((b) => ({
      day: b.day,
      distanceKm: Number(b.distanceKm.toFixed(1)),
      fuelUsedLitres: Number(b.fuelUsedLitres.toFixed(2)),
      co2Kg: Number(b.co2Kg.toFixed(2)),
      ecoScore: b.tripCount > 0 ? Math.round(b.ecoScoreSum / b.tripCount) : 0,
      tripCount: b.tripCount,
    }));
  }
}
