import { GreenComputingMetrics } from './types';
export declare class GreenComputingAuditor {
    /**
     * Evaluates green computing performance metrics comparing raw stream vs. on-device windowed batching
     */
    static computeMetrics(rawPointsCount: number, uploadedBatchPointsCount: number, aiCached: boolean, localDetectionsCount: number): GreenComputingMetrics;
    /**
     * Generates a deterministic hash for a trip summary to check AI cache before calling external LLMs
     */
    static hashTripForAiCache(distanceKm: number, harshAccelCount: number, harshBrakeCount: number, avgSpeedKmh: number, ecoScore: number): string;
}
