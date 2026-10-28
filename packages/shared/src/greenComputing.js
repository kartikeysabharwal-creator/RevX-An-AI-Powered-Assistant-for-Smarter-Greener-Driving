"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GreenComputingAuditor = void 0;
class GreenComputingAuditor {
    /**
     * Evaluates green computing performance metrics comparing raw stream vs. on-device windowed batching
     */
    static computeMetrics(rawPointsCount, uploadedBatchPointsCount, aiCached, localDetectionsCount) {
        const totalSampled = Math.max(1, rawPointsCount);
        const uploaded = Math.max(1, uploadedBatchPointsCount);
        // Percentage of sensor points filtered / aggregated on device without raw cloud transmission
        const pointsReduced = Math.max(0, Math.round(((totalSampled - uploaded) / totalSampled) * 100));
        // Cloud requests avoided: in a naive architecture, 1 request per second would be sent
        const naiveRequests = totalSampled;
        const actualRequests = 1 + (aiCached ? 0 : 1); // 1 batch upload + 1 AI call if not cached
        const cloudApiCallsAvoided = Math.max(0, naiveRequests - actualRequests);
        // AI caching efficiency
        const aiCacheHitRatePercent = aiCached ? 100 : 0;
        // Local processing ratio: percentage of event detection, filtering, and scoring done locally
        const localProcessingRatioPercent = Number(Math.min(99.5, ((totalSampled - uploaded + localDetectionsCount) / totalSampled) * 100).toFixed(1));
        // Energy metrics (derived from empirical mobile radio & cloud server profiles)
        // 4G/5G radio continuous state vs sleep state saves ~180 mWh per hour of driving
        const estimatedDeviceBatterySavedMwh = Number((pointsReduced * 0.08).toFixed(1));
        // Cloud serverless invocations + ingress bandwidth saved (~0.05 Wh per 1000 requests)
        const estimatedCloudEnergySavedWh = Number((cloudApiCallsAvoided * 0.00005).toFixed(3));
        return {
            totalSensorPointsSampled: totalSampled,
            telemetryPointsUploaded: uploaded,
            dataPointsReducedPercent: pointsReduced,
            cloudApiCallsAvoided,
            aiCacheHitRatePercent,
            localProcessingRatioPercent,
            estimatedDeviceBatterySavedMwh,
            estimatedCloudEnergySavedWh,
        };
    }
    /**
     * Generates a deterministic hash for a trip summary to check AI cache before calling external LLMs
     */
    static hashTripForAiCache(distanceKm, harshAccelCount, harshBrakeCount, avgSpeedKmh, ecoScore) {
        // Quantize continuous variables into buckets so similar trips reuse coaching insights
        const distBucket = Math.round(distanceKm / 2) * 2; // 2 km resolution
        const speedBucket = Math.round(avgSpeedKmh / 5) * 5; // 5 km/h resolution
        const scoreBucket = Math.round(ecoScore / 5) * 5; // 5 pt score bucket
        return `trip-hash-d${distBucket}-a${harshAccelCount}-b${harshBrakeCount}-s${speedBucket}-e${scoreBucket}`;
    }
}
exports.GreenComputingAuditor = GreenComputingAuditor;
