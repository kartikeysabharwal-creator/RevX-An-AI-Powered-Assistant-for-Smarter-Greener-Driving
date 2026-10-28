import { TelemetryPoint } from '../packages/shared/src/types';
export interface ObdSimulatorConfig {
    hasTroubleCode?: boolean;
    coolantAnomaly?: boolean;
    lowBattery?: boolean;
}
export declare class ObdSimulator {
    /**
     * Enriches a stream of telemetry points with realistic OBD-II ELM327 PID values.
     */
    static enrichWithObdTelemetry(points: TelemetryPoint[], config?: ObdSimulatorConfig): TelemetryPoint[];
    /**
     * Returns mock DTCs for diagnostic display
     */
    static getDiagnosticCodes(config: ObdSimulatorConfig): {
        code: string;
        description: string;
        severity: "INFORMATIONAL";
    }[];
}
