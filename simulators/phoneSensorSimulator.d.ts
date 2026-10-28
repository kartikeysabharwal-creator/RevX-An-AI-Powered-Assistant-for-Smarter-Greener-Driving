import { TelemetryPoint } from '../packages/shared/src/types';
export type DrivingScenario = 'SMOOTH_ECO' | 'AGGRESSIVE_SPEED' | 'STOP_AND_GO_CITY' | 'HARSH_BRAKING_INCIDENTS' | 'EXCESSIVE_IDLING';
export interface RouteWaypoint {
    lat: number;
    lng: number;
    targetSpeedKmh: number;
    durationSec: number;
    isStationary?: boolean;
    maneuver?: 'ACCELERATE' | 'BRAKE' | 'TURN' | 'CRUISE' | 'IDLE';
}
export declare class PhoneSensorSimulator {
    /**
     * Generates realistic GPS, accelerometer, and gyroscope streams
     * matching real world driving conditions and sensor noise.
     */
    static generateScenarioStream(scenario: DrivingScenario, startLat?: number, // Bangalore Central
    startLng?: number): TelemetryPoint[];
    private static getScenarioStages;
}
