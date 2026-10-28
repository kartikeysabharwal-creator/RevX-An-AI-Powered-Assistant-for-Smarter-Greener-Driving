"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafetyScoreEngine = void 0;
const constants_1 = require("./constants");
class SafetyScoreEngine {
    penalties;
    constructor(customPenalties = {}) {
        this.penalties = {
            harshAccelPenalty: customPenalties.harshAccelPenalty ?? constants_1.SAFETY_SCORE_PENALTIES.HARSH_ACCEL_PENALTY,
            harshBrakePenalty: customPenalties.harshBrakePenalty ?? constants_1.SAFETY_SCORE_PENALTIES.HARSH_BRAKE_PENALTY,
            rapidSpeedChangePenalty: customPenalties.rapidSpeedChangePenalty ??
                constants_1.SAFETY_SCORE_PENALTIES.RAPID_SPEED_CHANGE_PENALTY,
            sharpTurnPenalty: customPenalties.sharpTurnPenalty ?? constants_1.SAFETY_SCORE_PENALTIES.SHARP_TURN_PENALTY,
            overspeedPenalty: customPenalties.overspeedPenalty ?? constants_1.SAFETY_SCORE_PENALTIES.OVERSPEED_PENALTY,
        };
    }
    calculate(metrics) {
        const distanceNorm = Math.max(1.0, metrics.distanceKm);
        const per10KmFactor = Math.min(2.5, Math.max(0.5, 10 / distanceNorm));
        const harshAccelerationPenalty = Math.min(30, Math.round(metrics.harshAccelCount * this.penalties.harshAccelPenalty * per10KmFactor));
        const harshBrakingPenalty = Math.min(40, Math.round(metrics.harshBrakeCount * this.penalties.harshBrakePenalty * per10KmFactor));
        const sharpTurnPenalty = Math.min(25, Math.round(metrics.sharpTurnCount * this.penalties.sharpTurnPenalty * per10KmFactor));
        const overspeedPenalty = Math.min(35, Math.round(metrics.overspeedCount * this.penalties.overspeedPenalty * per10KmFactor));
        // Speed instability penalty based on variance
        const speedInstabilityPenalty = metrics.speedVariance > 100
            ? Math.min(15, Math.round((metrics.speedVariance - 100) * 0.1))
            : 0;
        const totalDeductions = harshAccelerationPenalty +
            harshBrakingPenalty +
            sharpTurnPenalty +
            overspeedPenalty +
            speedInstabilityPenalty;
        const finalScore = Math.max(0, Math.min(100, 100 - totalDeductions));
        const band = finalScore >= 85 ? 'SAFE' : finalScore >= 65 ? 'CAUTION' : 'HIGH_RISK';
        const explanation = this.buildExplanation(finalScore, metrics.harshBrakeCount, metrics.harshAccelCount, metrics.sharpTurnCount, metrics.overspeedCount);
        return {
            score: finalScore,
            band,
            penalties: {
                harshAccelerationPenalty,
                harshBrakingPenalty,
                speedInstabilityPenalty,
                sharpTurnPenalty,
                overspeedPenalty,
            },
            explanation,
        };
    }
    buildExplanation(score, brakes, accels, turns, overspeed) {
        const issues = [];
        if (brakes > 0)
            issues.push(`${brakes} harsh brake${brakes > 1 ? 's' : ''}`);
        if (accels > 0)
            issues.push(`${accels} sudden acceleration${accels > 1 ? 's' : ''}`);
        if (turns > 0)
            issues.push(`${turns} sharp turn${turns > 1 ? 's' : ''}`);
        if (overspeed > 0)
            issues.push(`${overspeed} overspeed event${overspeed > 1 ? 's' : ''}`);
        if (score >= 85) {
            return issues.length === 0
                ? 'Impeccable safe driving with zero hazardous dynamic maneuvers detected.'
                : `High situational awareness maintained despite minor notes: ${issues.join(', ')}.`;
        }
        else if (score >= 65) {
            return `Moderate safety risk profile influenced by ${issues.join(', ')}. Increase following distance to prevent abrupt reactions.`;
        }
        else {
            return `Elevated hazard risk detected due to ${issues.join(', ')}. Smooth anticipation is vital for road safety.`;
        }
    }
}
exports.SafetyScoreEngine = SafetyScoreEngine;
