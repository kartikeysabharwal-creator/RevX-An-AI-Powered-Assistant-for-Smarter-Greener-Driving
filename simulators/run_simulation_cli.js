"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runFullTripSimulation = runFullTripSimulation;
const phoneSensorSimulator_1 = require("./phoneSensorSimulator");
const obdSimulator_1 = require("./obdSimulator");
const src_1 = require("../packages/shared/src");
function runFullTripSimulation(scenario = 'SMOOTH_ECO', useObd = true) {
    console.log(`\n============================================================`);
    console.log(`   REVX SIMULATOR ENGINE - SCENARIO: ${scenario} (${useObd ? 'OBD-II' : 'PHONE_ONLY'})`);
    console.log(`============================================================\n`);
    let points = phoneSensorSimulator_1.PhoneSensorSimulator.generateScenarioStream(scenario);
    if (useObd) {
        points = obdSimulator_1.ObdSimulator.enrichWithObdTelemetry(points, {
            coolantAnomaly: scenario === 'AGGRESSIVE_SPEED',
            hasTroubleCode: scenario === 'AGGRESSIVE_SPEED',
        });
    }
    console.log(`[Sensor Pipeline] Generated ${points.length} high-frequency telemetry points`);
    console.log(`[Green Computing] Downsampling & local feature windowing in progress...`);
    const detector = new src_1.DrivingEventDetector();
    const events = detector.detectEventsFromWindow('sim-trip-001', points);
    console.log(`[Event Detection] Detected ${events.length} driving events:`);
    events.forEach((e) => {
        console.log(`  - [${e.severity}] ${e.eventType}: ${e.description}`);
    });
    // Calculate Metrics
    const durationSec = Math.round((points[points.length - 1].timestamp - points[0].timestamp) / 1000);
    let distanceKm = 0;
    let idleSec = 0;
    let maxSpeed = 0;
    let sumSpeed = 0;
    const speeds = [];
    for (let i = 1; i < points.length; i++) {
        const dt = (points[i].timestamp - points[i - 1].timestamp) / 1000;
        const avgV = (points[i].speedKmh + points[i - 1].speedKmh) / 2;
        distanceKm += (avgV * dt) / 3600;
        if (points[i].isStationary)
            idleSec += dt;
        if (points[i].speedKmh > maxSpeed)
            maxSpeed = points[i].speedKmh;
        sumSpeed += points[i].speedKmh;
        speeds.push(points[i].speedKmh);
    }
    const avgSpeed = points.length > 0 ? sumSpeed / points.length : 0;
    const speedVar = speeds.reduce((acc, s) => acc + Math.pow(s - avgSpeed, 2), 0) / Math.max(1, speeds.length);
    const metrics = {
        distanceKm: Number(distanceKm.toFixed(2)),
        durationSeconds: durationSec,
        movingDurationSeconds: durationSec - Math.round(idleSec),
        idleDurationSeconds: Math.round(idleSec),
        avgSpeedKmh: Number(avgSpeed.toFixed(1)),
        maxSpeedKmh: Number(maxSpeed.toFixed(1)),
        avgAccelerationMs2: 0.6,
        speedVariance: Number(speedVar.toFixed(1)),
        stopCount: events.filter((e) => e.eventType === 'EXCESSIVE_IDLE').length + 1,
        harshAccelCount: events.filter((e) => e.eventType === 'HARSH_ACCELERATION').length,
        harshBrakeCount: events.filter((e) => e.eventType === 'HARSH_BRAKING').length,
        sharpTurnCount: events.filter((e) => e.eventType === 'SHARP_TURN').length,
        idleEventCount: events.filter((e) => e.eventType === 'EXCESSIVE_IDLE').length,
        overspeedCount: events.filter((e) => e.eventType === 'OVERSPEED').length,
    };
    // Fuel & CO2
    const fuelResult = src_1.FuelEstimator.calculate(points, { fuelType: 'PETROL', engineSizeL: 1.5 }, useObd ? 'OBD_II' : 'PHONE_ONLY');
    const emissions = src_1.Co2Estimator.calculate(fuelResult, metrics.distanceKm, 'PETROL', 102.5, 8.5);
    // Scores
    const ecoScoreEngine = new src_1.EcoScoreEngine();
    const ecoScore = ecoScoreEngine.calculate(metrics, emissions.fuelEfficiencyL100km, 8.5);
    const safetyScoreEngine = new src_1.SafetyScoreEngine();
    const safetyScore = safetyScoreEngine.calculate(metrics);
    const greenMetrics = src_1.GreenComputingAuditor.computeMetrics(points.length, 12, true, events.length);
    console.log(`\n--- TRIP PERFORMANCE REPORT ---`);
    console.log(`  Distance:       ${metrics.distanceKm} km | Duration: ${Math.round(metrics.durationSeconds / 60)} min`);
    console.log(`  Avg Speed:      ${metrics.avgSpeedKmh} km/h | Max: ${metrics.maxSpeedKmh} km/h`);
    console.log(`  Fuel Used:      ~${emissions.fuelUsedLitres} L (Efficiency: ${emissions.fuelEfficiencyL100km} L/100km)`);
    console.log(`  CO2 Emitted:    ~${emissions.estimatedCo2Kg} kg (${emissions.co2GramsPerKm} g/km)`);
    console.log(`  Savings vs Base: ₹${emissions.moneySaved} saved (${emissions.fuelSavedLitres} L avoided)`);
    console.log(`  Eco Score:      ${ecoScore.score} / 100 [${ecoScore.band}]`);
    console.log(`  Safety Score:   ${safetyScore.score} / 100 [${safetyScore.band}]`);
    console.log(`\n--- GREEN COMPUTING SAVINGS ---`);
    console.log(`  Data Reductions: ${greenMetrics.dataPointsReducedPercent}% payload bandwidth saved`);
    console.log(`  Cloud Calls Offloaded: ${greenMetrics.cloudApiCallsAvoided} requests handled on-device`);
    console.log(`  Local Processing: ${greenMetrics.localProcessingRatioPercent}%`);
    console.log(`============================================================\n`);
    return { metrics, emissions, ecoScore, safetyScore, events, greenMetrics };
}
if (require.main === module) {
    runFullTripSimulation('SMOOTH_ECO', true);
    runFullTripSimulation('AGGRESSIVE_SPEED', false);
}
