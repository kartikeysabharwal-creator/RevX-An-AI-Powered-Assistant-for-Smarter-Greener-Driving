"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObdSimulator = void 0;
class ObdSimulator {
    /**
     * Enriches a stream of telemetry points with realistic OBD-II ELM327 PID values.
     */
    static enrichWithObdTelemetry(points, config = {}) {
        let coolantTemp = config.coolantAnomaly ? 106 : 89.0;
        const batteryVoltage = config.lowBattery ? 11.7 : 14.1;
        let fuelLevel = 68.0;
        return points.map((p, idx) => {
            const speed = p.speedKmh;
            let rpm = 800; // base idle
            let throttle = 0;
            let engineLoad = 18.0;
            let maf = 2.4; // idle MAF g/s
            if (speed > 1.0) {
                // Dynamic vehicle gear & RPM simulation
                if (speed < 20) {
                    rpm = 800 + speed * 60;
                    throttle = 15 + p.longitudinalAccelMs2 * 8;
                }
                else if (speed < 50) {
                    rpm = 1200 + (speed - 20) * 35;
                    throttle = 20 + p.longitudinalAccelMs2 * 10;
                }
                else if (speed < 80) {
                    rpm = 1600 + (speed - 50) * 28;
                    throttle = 25 + p.longitudinalAccelMs2 * 12;
                }
                else {
                    rpm = 2200 + (speed - 80) * 32;
                    throttle = 35 + p.longitudinalAccelMs2 * 15;
                }
                throttle = Math.max(0, Math.min(100, Math.round(throttle)));
                engineLoad = Math.max(15, Math.min(95, Math.round(20 + (throttle * 0.7))));
                // MAF approximation based on RPM & Load
                maf = Number(((rpm * 1.5 * (engineLoad / 100) * 1.184) / 120).toFixed(2));
            }
            else {
                rpm = 780 + Math.floor(Math.random() * 40);
                throttle = 0;
                engineLoad = 18 + Math.floor(Math.random() * 5);
                maf = 2.2;
            }
            // Fuel consumption decreases fuel level slowly
            if (idx % 60 === 0 && fuelLevel > 5) {
                fuelLevel -= 0.05;
            }
            return {
                ...p,
                sourceMode: 'OBD_II',
                rpm: Math.round(rpm),
                throttlePos: throttle,
                engineLoad,
                coolantTempC: Math.round(coolantTemp),
                fuelLevelPercent: Number(fuelLevel.toFixed(1)),
                batteryVoltage: Number(batteryVoltage.toFixed(1)),
                mafGramsSec: maf,
            };
        });
    }
    /**
     * Returns mock DTCs for diagnostic display
     */
    static getDiagnosticCodes(config) {
        if (!config.hasTroubleCode)
            return [];
        return [
            {
                code: 'P0171',
                description: 'System Too Lean (Bank 1) — Fuel trim running lean under intake vacuum',
                severity: 'INFORMATIONAL',
            },
            {
                code: 'P0420',
                description: 'Catalyst System Efficiency Below Threshold (Bank 1)',
                severity: 'INFORMATIONAL',
            },
        ];
    }
}
exports.ObdSimulator = ObdSimulator;
