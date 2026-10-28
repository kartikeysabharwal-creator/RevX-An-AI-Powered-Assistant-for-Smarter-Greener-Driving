import { TelemetryPoint } from '../packages/shared/src/types';

export type DrivingScenario =
  | 'SMOOTH_ECO'
  | 'AGGRESSIVE_SPEED'
  | 'STOP_AND_GO_CITY'
  | 'HARSH_BRAKING_INCIDENTS'
  | 'EXCESSIVE_IDLING';

export interface RouteWaypoint {
  lat: number;
  lng: number;
  targetSpeedKmh: number;
  durationSec: number;
  isStationary?: boolean;
  maneuver?: 'ACCELERATE' | 'BRAKE' | 'TURN' | 'CRUISE' | 'IDLE';
}

export class PhoneSensorSimulator {
  /**
   * Generates realistic GPS, accelerometer, and gyroscope streams
   * matching real world driving conditions and sensor noise.
   */
  public static generateScenarioStream(
    scenario: DrivingScenario,
    startLat: number = 12.9716, // Bangalore Central
    startLng: number = 77.5946
  ): TelemetryPoint[] {
    const points: TelemetryPoint[] = [];
    const startTime = Date.now() - 25 * 60 * 1000; // 25 mins ago
    let currentLat = startLat;
    let currentLng = startLng;
    let currentSpeed = 0;
    let elapsedMs = 0;

    const stages = this.getScenarioStages(scenario);

    for (const stage of stages) {
      const steps = Math.max(2, Math.round(stage.durationSec));
      const speedStep = (stage.targetSpeedKmh - currentSpeed) / steps;

      for (let s = 0; s < steps; s++) {
        elapsedMs += 1000; // 1Hz sampling
        currentSpeed = Math.max(0, currentSpeed + speedStep);

        // Calculate heading and small positional increments
        const headingRad = 0.85; // approx NE heading
        const speedMs = (currentSpeed * 1000) / 3600;
        const distMovedM = speedMs * 1.0;
        const dLat = (distMovedM * Math.cos(headingRad)) / 111111;
        const dLng =
          (distMovedM * Math.sin(headingRad)) / (111111 * Math.cos((currentLat * Math.PI) / 180));

        currentLat += dLat;
        currentLng += dLng;

        // Sensor noise simulation (typical phone IMU noise: ±0.08 m/s²)
        const noiseAx = (Math.random() - 0.5) * 0.15;
        const noiseAy = (Math.random() - 0.5) * 0.15;

        let longitudinalAccel = (speedStep * 1000) / 3600 + noiseAx;
        let lateralAccel = noiseAy;
        let gyroZ = (Math.random() - 0.5) * 0.05;

        // Inject scenario-specific spikes
        if (stage.maneuver === 'ACCELERATE' && s === 1) {
          longitudinalAccel = scenario === 'AGGRESSIVE_SPEED' ? 3.4 : 1.6;
        } else if (stage.maneuver === 'BRAKE' && s === 1) {
          longitudinalAccel =
            scenario === 'HARSH_BRAKING_INCIDENTS' || scenario === 'AGGRESSIVE_SPEED' ? -3.8 : -1.8;
        } else if (stage.maneuver === 'TURN' && s === 2) {
          lateralAccel = scenario === 'AGGRESSIVE_SPEED' ? 3.8 : 1.8;
          gyroZ = scenario === 'AGGRESSIVE_SPEED' ? 0.55 : 0.25;
        }

        points.push({
          timestamp: startTime + elapsedMs,
          latitude: Number(currentLat.toFixed(6)),
          longitude: Number(currentLng.toFixed(6)),
          accuracy: Number((3.5 + Math.random() * 2.0).toFixed(1)),
          speedKmh: Number(currentSpeed.toFixed(1)),
          heading: 48,
          altitude: 920,
          longitudinalAccelMs2: Number(longitudinalAccel.toFixed(2)),
          lateralAccelMs2: Number(lateralAccel.toFixed(2)),
          verticalAccelMs2: Number((9.8 + (Math.random() - 0.5) * 0.2).toFixed(2)),
          gyroZ: Number(gyroZ.toFixed(3)),
          sourceMode: 'PHONE_ONLY',
          isStationary: currentSpeed < 1.0,
        });
      }
    }

    return points;
  }

  private static getScenarioStages(scenario: DrivingScenario): RouteWaypoint[] {
    switch (scenario) {
      case 'SMOOTH_ECO':
        return [
          { lat: 0, lng: 0, targetSpeedKmh: 0, durationSec: 15, isStationary: true, maneuver: 'IDLE' },
          { lat: 0, lng: 0, targetSpeedKmh: 35, durationSec: 20, maneuver: 'ACCELERATE' },
          { lat: 0, lng: 0, targetSpeedKmh: 50, durationSec: 60, maneuver: 'CRUISE' },
          { lat: 0, lng: 0, targetSpeedKmh: 45, durationSec: 15, maneuver: 'TURN' },
          { lat: 0, lng: 0, targetSpeedKmh: 65, durationSec: 90, maneuver: 'CRUISE' },
          { lat: 0, lng: 0, targetSpeedKmh: 20, durationSec: 25, maneuver: 'BRAKE' },
          { lat: 0, lng: 0, targetSpeedKmh: 0, durationSec: 20, isStationary: true, maneuver: 'IDLE' },
        ];
      case 'AGGRESSIVE_SPEED':
        return [
          { lat: 0, lng: 0, targetSpeedKmh: 0, durationSec: 10, isStationary: true, maneuver: 'IDLE' },
          { lat: 0, lng: 0, targetSpeedKmh: 60, durationSec: 8, maneuver: 'ACCELERATE' }, // aggressive surge
          { lat: 0, lng: 0, targetSpeedKmh: 95, durationSec: 40, maneuver: 'CRUISE' },
          { lat: 0, lng: 0, targetSpeedKmh: 25, durationSec: 6, maneuver: 'BRAKE' }, // hard brake
          { lat: 0, lng: 0, targetSpeedKmh: 75, durationSec: 30, maneuver: 'TURN' }, // sharp corner
          { lat: 0, lng: 0, targetSpeedKmh: 105, durationSec: 50, maneuver: 'CRUISE' }, // overspeed
          { lat: 0, lng: 0, targetSpeedKmh: 0, durationSec: 8, maneuver: 'BRAKE' },
        ];
      case 'STOP_AND_GO_CITY':
        return [
          { lat: 0, lng: 0, targetSpeedKmh: 0, durationSec: 30, isStationary: true, maneuver: 'IDLE' },
          { lat: 0, lng: 0, targetSpeedKmh: 25, durationSec: 15, maneuver: 'ACCELERATE' },
          { lat: 0, lng: 0, targetSpeedKmh: 0, durationSec: 25, isStationary: true, maneuver: 'BRAKE' },
          { lat: 0, lng: 0, targetSpeedKmh: 30, durationSec: 18, maneuver: 'ACCELERATE' },
          { lat: 0, lng: 0, targetSpeedKmh: 0, durationSec: 35, isStationary: true, maneuver: 'IDLE' },
          { lat: 0, lng: 0, targetSpeedKmh: 40, durationSec: 25, maneuver: 'CRUISE' },
          { lat: 0, lng: 0, targetSpeedKmh: 0, durationSec: 15, isStationary: true, maneuver: 'BRAKE' },
        ];
      case 'HARSH_BRAKING_INCIDENTS':
        return [
          { lat: 0, lng: 0, targetSpeedKmh: 0, durationSec: 10, maneuver: 'IDLE' },
          { lat: 0, lng: 0, targetSpeedKmh: 50, durationSec: 25, maneuver: 'ACCELERATE' },
          { lat: 0, lng: 0, targetSpeedKmh: 10, durationSec: 5, maneuver: 'BRAKE' }, // emergency brake
          { lat: 0, lng: 0, targetSpeedKmh: 45, durationSec: 25, maneuver: 'ACCELERATE' },
          { lat: 0, lng: 0, targetSpeedKmh: 0, durationSec: 4, maneuver: 'BRAKE' }, // second hard brake
          { lat: 0, lng: 0, targetSpeedKmh: 0, durationSec: 15, isStationary: true, maneuver: 'IDLE' },
        ];
      case 'EXCESSIVE_IDLING':
        return [
          { lat: 0, lng: 0, targetSpeedKmh: 0, durationSec: 120, isStationary: true, maneuver: 'IDLE' }, // 2 mins idle
          { lat: 0, lng: 0, targetSpeedKmh: 30, durationSec: 30, maneuver: 'ACCELERATE' },
          { lat: 0, lng: 0, targetSpeedKmh: 0, durationSec: 90, isStationary: true, maneuver: 'IDLE' }, // 1.5 mins idle
          { lat: 0, lng: 0, targetSpeedKmh: 25, durationSec: 20, maneuver: 'ACCELERATE' },
          { lat: 0, lng: 0, targetSpeedKmh: 0, durationSec: 15, isStationary: true, maneuver: 'IDLE' },
        ];
    }
  }
}
