import { TelemetryPoint, Vehicle, OperatingMode } from './types';
export interface FuelEstimateResult {
    fuelUsedLitres: number;
    fuelEfficiencyL100km: number;
    fuelEfficiencyKml: number;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    isEstimated: boolean;
    estimatorVersion: string;
}
export declare class FuelEstimator {
    private static readonly VERSION;
    /**
     * Estimates fuel consumption and efficiency based on available telemetry points and vehicle specs.
     */
    static calculate(points: TelemetryPoint[], vehicle: Partial<Vehicle>, mode: OperatingMode): FuelEstimateResult;
    /**
     * Mode B: OBD-II Telemetry
     * Uses real vehicle parameters: MAF sensor if available, or Engine Load + RPM + Engine displacement.
     */
    private static calculateObdMode;
    /**
     * Mode A: Phone-Only Kinematic & Aerodynamic Vehicle Dynamics
     * Computes power demand = rolling resistance + aerodynamic drag + inertial acceleration + idle auxiliary draw.
     */
    private static calculatePhoneOnlyMode;
    private static estimatePointEnergy;
}
