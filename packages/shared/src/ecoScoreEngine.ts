import { EcoScoreBreakdown, EcoBand, TripMetrics } from './types';
import { ECO_SCORE_WEIGHTS } from './constants';

export interface EcoWeightsConfig {
  fuelEfficiency?: number;
  accelSmoothness?: number;
  brakeSmoothness?: number;
  idleEfficiency?: number;
  speedConsistency?: number;
}

export class EcoScoreEngine {
  private weights: Required<EcoWeightsConfig>;

  constructor(customWeights: EcoWeightsConfig = {}) {
    this.weights = {
      fuelEfficiency: customWeights.fuelEfficiency ?? ECO_SCORE_WEIGHTS.FUEL_EFFICIENCY,
      accelSmoothness: customWeights.accelSmoothness ?? ECO_SCORE_WEIGHTS.ACCEL_SMOOTHNESS,
      brakeSmoothness: customWeights.brakeSmoothness ?? ECO_SCORE_WEIGHTS.BRAKE_SMOOTHNESS,
      idleEfficiency: customWeights.idleEfficiency ?? ECO_SCORE_WEIGHTS.IDLE_EFFICIENCY,
      speedConsistency: customWeights.speedConsistency ?? ECO_SCORE_WEIGHTS.SPEED_CONSISTENCY,
    };
  }

  public calculate(
    metrics: TripMetrics,
    fuelEfficiencyL100km: number,
    baselineEfficiency: number = 8.5
  ): EcoScoreBreakdown {
    // 1. Fuel Efficiency Score (0-100)
    // If user's L/100km is lower (better) than baseline, score increases.
    // If 20% better than baseline -> 100. If 30% worse -> 40.
    const efficiencyRatio = baselineEfficiency / Math.max(2.0, fuelEfficiencyL100km);
    let fuelEfficiencyScore = Math.min(100, Math.max(0, Math.round(efficiencyRatio * 85)));

    // 2. Acceleration Smoothness Score (0-100)
    // Penalize based on harsh acceleration frequency per 10 km
    const distanceNorm = Math.max(1.0, metrics.distanceKm);
    const harshAccelPer10Km = (metrics.harshAccelCount / distanceNorm) * 10;
    let accelerationSmoothnessScore = Math.max(0, Math.round(100 - harshAccelPer10Km * 12));

    // 3. Braking Smoothness Score (0-100)
    const harshBrakePer10Km = (metrics.harshBrakeCount / distanceNorm) * 10;
    let brakingSmoothnessScore = Math.max(0, Math.round(100 - harshBrakePer10Km * 15));

    // 4. Idle Score (0-100)
    // Ratio of idle time to total duration
    const totalDuration = Math.max(1, metrics.durationSeconds);
    const idleRatio = metrics.idleDurationSeconds / totalDuration;
    let idleScore = 100;
    if (idleRatio > 0.4) {
      idleScore = Math.max(0, Math.round(100 - (idleRatio - 0.4) * 150));
    } else if (idleRatio > 0.15) {
      idleScore = Math.round(100 - (idleRatio - 0.15) * 80);
    }

    // 5. Speed Consistency Score (0-100)
    // Based on speed variance (low variance while moving = high consistency)
    let speedConsistencyScore = 85;
    if (metrics.speedVariance > 0) {
      // typical speed variance ranges from 15 to 150
      speedConsistencyScore = Math.min(
        100,
        Math.max(20, Math.round(100 - Math.min(80, metrics.speedVariance * 0.4)))
      );
    }

    // Weighted composite
    const rawComposite =
      fuelEfficiencyScore * this.weights.fuelEfficiency +
      accelerationSmoothnessScore * this.weights.accelSmoothness +
      brakingSmoothnessScore * this.weights.brakeSmoothness +
      idleScore * this.weights.idleEfficiency +
      speedConsistencyScore * this.weights.speedConsistency;

    const finalScore = Math.min(100, Math.max(0, Math.round(rawComposite)));

    const band: EcoBand =
      finalScore >= 85
        ? 'EXCELLENT'
        : finalScore >= 70
        ? 'GOOD'
        : finalScore >= 50
        ? 'MODERATE'
        : 'NEEDS_IMPROVEMENT';

    const explanation = this.buildExplanation(
      finalScore,
      fuelEfficiencyScore,
      accelerationSmoothnessScore,
      brakingSmoothnessScore,
      idleScore
    );

    return {
      score: finalScore,
      band,
      fuelEfficiencyScore,
      accelerationSmoothnessScore,
      brakingSmoothnessScore,
      idleScore,
      speedConsistencyScore,
      explanation,
    };
  }

  private buildExplanation(
    total: number,
    fuel: number,
    accel: number,
    brake: number,
    idle: number
  ): string {
    const reasons: string[] = [];
    if (accel >= 85 && brake >= 85) reasons.push('silky throttle and anticipation');
    else if (accel < 65) reasons.push('frequent throttle surges');
    if (brake < 65) reasons.push('hard braking events');
    if (idle < 65) reasons.push('extended stationary idling');
    if (fuel >= 85) reasons.push('high fuel conservation');

    if (total >= 85) {
      return `Outstanding eco-driving performance driven by ${reasons.join(' and ') || 'balanced driving'}.`;
    } else if (total >= 70) {
      return `Solid efficient driving, with minor room for improvement in ${reasons.filter((r) => r.includes('surges') || r.includes('braking') || r.includes('idling')).join(' and ') || 'speed smoothing'}.`;
    } else {
      return `Noticeable efficiency loss caused by ${reasons.join(', ') || 'erratic driving patterns'}.`;
    }
  }
}
