import { TelemetryPoint, DrivingEvent } from './types';
export interface EventDetectorOptions {
    harshAccelThreshold?: number;
    harshBrakeThreshold?: number;
    rapidSpeedChangeThreshold?: number;
    sharpTurnThreshold?: number;
    idleSpeedThreshold?: number;
    excessiveIdleSeconds?: number;
    overspeedThreshold?: number;
    spikeWindowMs?: number;
}
export declare class DrivingEventDetector {
    private options;
    private lastEventTimestamps;
    private idleStartTime;
    private idleReported;
    constructor(options?: EventDetectorOptions);
    detectEventsFromWindow(tripId: string, points: TelemetryPoint[], previousPoint?: TelemetryPoint): DrivingEvent[];
    private shouldTriggerEvent;
    private calculateSeverity;
}
