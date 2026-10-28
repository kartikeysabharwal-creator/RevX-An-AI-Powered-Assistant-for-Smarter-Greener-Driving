"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrivingEventDetector = void 0;
const constants_1 = require("./constants");
class DrivingEventDetector {
    options;
    lastEventTimestamps = new Map();
    idleStartTime = null;
    idleReported = false;
    constructor(options = {}) {
        this.options = {
            harshAccelThreshold: options.harshAccelThreshold ?? constants_1.EVENT_THRESHOLDS.HARSH_ACCEL_MS2,
            harshBrakeThreshold: options.harshBrakeThreshold ?? constants_1.EVENT_THRESHOLDS.HARSH_BRAKE_MS2,
            rapidSpeedChangeThreshold: options.rapidSpeedChangeThreshold ?? constants_1.EVENT_THRESHOLDS.RAPID_SPEED_CHANGE_KMH_SEC,
            sharpTurnThreshold: options.sharpTurnThreshold ?? constants_1.EVENT_THRESHOLDS.SHARP_TURN_LATERAL_MS2,
            idleSpeedThreshold: options.idleSpeedThreshold ?? constants_1.EVENT_THRESHOLDS.IDLE_SPEED_KMH,
            excessiveIdleSeconds: options.excessiveIdleSeconds ?? constants_1.EVENT_THRESHOLDS.EXCESSIVE_IDLE_SECONDS,
            overspeedThreshold: options.overspeedThreshold ?? constants_1.EVENT_THRESHOLDS.OVERSPEED_DEFAULT_KMH,
            spikeWindowMs: (options.spikeWindowMs ?? constants_1.EVENT_THRESHOLDS.SPIKE_SUPPRESSION_WINDOW_SEC) * 1000,
        };
    }
    detectEventsFromWindow(tripId, points, previousPoint) {
        const detected = [];
        if (!points || points.length === 0)
            return detected;
        let prev = previousPoint;
        for (let i = 0; i < points.length; i++) {
            const current = points[i];
            // Confidence factor based on GPS accuracy (high accuracy = high confidence)
            const accuracyConfidence = Math.max(0.4, Math.min(1.0, 1 - (current.accuracy - 5) / 25));
            // 1. Harsh Acceleration Detection
            if (current.longitudinalAccelMs2 >= this.options.harshAccelThreshold) {
                if (this.shouldTriggerEvent('HARSH_ACCELERATION', current.timestamp)) {
                    const severity = this.calculateSeverity(current.longitudinalAccelMs2, this.options.harshAccelThreshold, this.options.harshAccelThreshold * 1.5);
                    detected.push({
                        id: `evt-${current.timestamp}-${Math.floor(Math.random() * 1000)}`,
                        tripId,
                        timestamp: current.timestamp,
                        eventType: 'HARSH_ACCELERATION',
                        severity,
                        value: Number(current.longitudinalAccelMs2.toFixed(2)),
                        latitude: current.latitude,
                        longitude: current.longitude,
                        durationSeconds: 1.5,
                        confidence: Number(accuracyConfidence.toFixed(2)),
                        description: `Sudden acceleration surge of ${current.longitudinalAccelMs2.toFixed(1)} m/s²`,
                    });
                    this.lastEventTimestamps.set('HARSH_ACCELERATION', current.timestamp);
                }
            }
            // 2. Harsh Braking Detection
            if (current.longitudinalAccelMs2 <= this.options.harshBrakeThreshold) {
                if (this.shouldTriggerEvent('HARSH_BRAKING', current.timestamp)) {
                    const absAccel = Math.abs(current.longitudinalAccelMs2);
                    const absThresh = Math.abs(this.options.harshBrakeThreshold);
                    const severity = this.calculateSeverity(absAccel, absThresh, absThresh * 1.5);
                    detected.push({
                        id: `evt-${current.timestamp}-${Math.floor(Math.random() * 1000)}`,
                        tripId,
                        timestamp: current.timestamp,
                        eventType: 'HARSH_BRAKING',
                        severity,
                        value: Number(current.longitudinalAccelMs2.toFixed(2)),
                        latitude: current.latitude,
                        longitude: current.longitude,
                        durationSeconds: 1.2,
                        confidence: Number(accuracyConfidence.toFixed(2)),
                        description: `Hard braking deceleration of ${Math.abs(current.longitudinalAccelMs2).toFixed(1)} m/s²`,
                    });
                    this.lastEventTimestamps.set('HARSH_BRAKING', current.timestamp);
                }
            }
            // 3. Sharp Turn / Aggressive Cornering
            const lateralAccelAbs = Math.abs(current.lateralAccelMs2);
            const gyroZAbs = current.gyroZ ? Math.abs(current.gyroZ) : 0;
            if (lateralAccelAbs >= this.options.sharpTurnThreshold ||
                gyroZAbs >= constants_1.EVENT_THRESHOLDS.SHARP_TURN_GYRO_RAD_S) {
                if (this.shouldTriggerEvent('SHARP_TURN', current.timestamp)) {
                    const severity = this.calculateSeverity(lateralAccelAbs, this.options.sharpTurnThreshold, this.options.sharpTurnThreshold * 1.4);
                    detected.push({
                        id: `evt-${current.timestamp}-${Math.floor(Math.random() * 1000)}`,
                        tripId,
                        timestamp: current.timestamp,
                        eventType: 'SHARP_TURN',
                        severity,
                        value: Number(lateralAccelAbs.toFixed(2)),
                        latitude: current.latitude,
                        longitude: current.longitude,
                        durationSeconds: 2.0,
                        confidence: Number((accuracyConfidence * 0.9).toFixed(2)),
                        description: `Sharp turn with lateral cornering acceleration of ${lateralAccelAbs.toFixed(1)} m/s²`,
                    });
                    this.lastEventTimestamps.set('SHARP_TURN', current.timestamp);
                }
            }
            // 4. Rapid Speed Change (when delta time and delta speed are available)
            if (prev && current.timestamp > prev.timestamp) {
                const deltaSec = (current.timestamp - prev.timestamp) / 1000;
                if (deltaSec > 0 && deltaSec <= 3) {
                    const deltaSpeedKmh = Math.abs(current.speedKmh - prev.speedKmh);
                    const rateOfSpeedChange = deltaSpeedKmh / deltaSec;
                    if (rateOfSpeedChange >= this.options.rapidSpeedChangeThreshold) {
                        if (this.shouldTriggerEvent('RAPID_SPEED_CHANGE', current.timestamp)) {
                            detected.push({
                                id: `evt-${current.timestamp}-${Math.floor(Math.random() * 1000)}`,
                                tripId,
                                timestamp: current.timestamp,
                                eventType: 'RAPID_SPEED_CHANGE',
                                severity: 'MEDIUM',
                                value: Number(rateOfSpeedChange.toFixed(1)),
                                latitude: current.latitude,
                                longitude: current.longitude,
                                durationSeconds: Number(deltaSec.toFixed(1)),
                                confidence: Number(accuracyConfidence.toFixed(2)),
                                description: `Rapid speed variation of ${deltaSpeedKmh.toFixed(1)} km/h in ${deltaSec.toFixed(1)}s`,
                            });
                            this.lastEventTimestamps.set('RAPID_SPEED_CHANGE', current.timestamp);
                        }
                    }
                }
            }
            // 5. Overspeed Event
            if (current.speedKmh > this.options.overspeedThreshold) {
                if (this.shouldTriggerEvent('OVERSPEED', current.timestamp)) {
                    detected.push({
                        id: `evt-${current.timestamp}-${Math.floor(Math.random() * 1000)}`,
                        tripId,
                        timestamp: current.timestamp,
                        eventType: 'OVERSPEED',
                        severity: current.speedKmh > this.options.overspeedThreshold * 1.2 ? 'HIGH' : 'MEDIUM',
                        value: Number(current.speedKmh.toFixed(1)),
                        latitude: current.latitude,
                        longitude: current.longitude,
                        durationSeconds: 3.0,
                        confidence: 0.95,
                        description: `Vehicle exceeded speed threshold at ${current.speedKmh.toFixed(0)} km/h`,
                    });
                    this.lastEventTimestamps.set('OVERSPEED', current.timestamp);
                }
            }
            // 6. Excessive Idling Tracking
            if (current.speedKmh <= this.options.idleSpeedThreshold) {
                if (!this.idleStartTime) {
                    this.idleStartTime = current.timestamp;
                    this.idleReported = false;
                }
                else {
                    const idleDurationSec = (current.timestamp - this.idleStartTime) / 1000;
                    if (idleDurationSec >= this.options.excessiveIdleSeconds && !this.idleReported) {
                        detected.push({
                            id: `evt-${current.timestamp}-${Math.floor(Math.random() * 1000)}`,
                            tripId,
                            timestamp: current.timestamp,
                            eventType: 'EXCESSIVE_IDLE',
                            severity: 'LOW',
                            value: Math.round(idleDurationSec),
                            latitude: current.latitude,
                            longitude: current.longitude,
                            durationSeconds: Math.round(idleDurationSec),
                            confidence: 0.9,
                            description: `Vehicle stationary for over ${Math.round(idleDurationSec / 60)} minute(s) with engine active`,
                        });
                        this.idleReported = true;
                    }
                }
            }
            else {
                this.idleStartTime = null;
                this.idleReported = false;
            }
            prev = current;
        }
        return detected;
    }
    shouldTriggerEvent(eventType, currentTimestamp) {
        const lastTimestamp = this.lastEventTimestamps.get(eventType);
        if (!lastTimestamp)
            return true;
        return currentTimestamp - lastTimestamp >= this.options.spikeWindowMs;
    }
    calculateSeverity(val, baseThreshold, highThreshold) {
        if (val >= highThreshold * 1.3)
            return 'CRITICAL';
        if (val >= highThreshold)
            return 'HIGH';
        if (val >= baseThreshold * 1.15)
            return 'MEDIUM';
        return 'LOW';
    }
}
exports.DrivingEventDetector = DrivingEventDetector;
