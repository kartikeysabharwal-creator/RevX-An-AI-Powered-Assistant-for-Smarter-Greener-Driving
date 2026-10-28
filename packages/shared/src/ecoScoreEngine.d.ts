import { EcoScoreBreakdown, TripMetrics } from './types';
export interface EcoWeightsConfig {
    fuelEfficiency?: number;
    accelSmoothness?: number;
    brakeSmoothness?: number;
    idleEfficiency?: number;
    speedConsistency?: number;
}
export declare class EcoScoreEngine {
    private weights;
    constructor(customWeights?: EcoWeightsConfig);
    calculate(metrics: TripMetrics, fuelEfficiencyL100km: number, baselineEfficiency?: number): EcoScoreBreakdown;
    private buildExplanation;
}
