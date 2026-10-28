import { DrivingScenario } from './phoneSensorSimulator';
import { TripMetrics } from '../packages/shared/src';
export declare function runFullTripSimulation(scenario?: DrivingScenario, useObd?: boolean): {
    metrics: TripMetrics;
    emissions: import("@revx/shared/src/types").FuelEmissionsCalculation;
    ecoScore: import("@revx/shared/src/types").EcoScoreBreakdown;
    safetyScore: import("@revx/shared/src/types").SafetyScoreBreakdown;
    events: import("@revx/shared/src/types").DrivingEvent[];
    greenMetrics: import("@revx/shared/src/types").GreenComputingMetrics;
};
