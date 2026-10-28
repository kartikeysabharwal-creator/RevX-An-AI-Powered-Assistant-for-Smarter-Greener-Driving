import { SafetyScoreBreakdown, TripMetrics } from './types';
export interface SafetyPenaltiesConfig {
    harshAccelPenalty?: number;
    harshBrakePenalty?: number;
    rapidSpeedChangePenalty?: number;
    sharpTurnPenalty?: number;
    overspeedPenalty?: number;
}
export declare class SafetyScoreEngine {
    private penalties;
    constructor(customPenalties?: SafetyPenaltiesConfig);
    calculate(metrics: TripMetrics): SafetyScoreBreakdown;
    private buildExplanation;
}
