import { TelemetryPoint, Vehicle, OperatingMode } from './types';
import { VEHICLE_PHYSICS_DEFAULTS } from './constants';

export interface FuelEstimateResult {
  fuelUsedLitres: number;
  fuelEfficiencyL100km: number;
  fuelEfficiencyKml: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  isEstimated: boolean;
  estimatorVersion: string;
}

export class FuelEstimator {
  private static readonly VERSION = 'v1.4.0-hybrid-physics';

  /**
   * Estimates fuel consumption and efficiency based on available telemetry points and vehicle specs.
   */
  public static calculate(
    points: TelemetryPoint[],
    vehicle: Partial<Vehicle>,
    mode: OperatingMode
  ): FuelEstimateResult {
    if (!points || points.length < 2) {
      return {
        fuelUsedLitres: 0,
        fuelEfficiencyL100km: 0,
        fuelEfficiencyKml: 0,
        confidence: 'LOW',
        isEstimated: true,
        estimatorVersion: this.VERSION,
      };
    }

    if (mode === 'OBD_II') {
      return this.calculateObdMode(points, vehicle);
    } else {
      return this.calculatePhoneOnlyMode(points, vehicle);
    }
  }

  /**
   * Mode B: OBD-II Telemetry
   * Uses real vehicle parameters: MAF sensor if available, or Engine Load + RPM + Engine displacement.
   */
  private static calculateObdMode(
    points: TelemetryPoint[],
    vehicle: Partial<Vehicle>
  ): FuelEstimateResult {
    let totalFuelGrams = 0;
    let hasMaf = false;
    let totalDistanceKm = 0;

    const engineSizeL = vehicle.engineSizeL || 1.8;
    const afr = vehicle.fuelType === 'DIESEL' ? 14.5 : 14.7; // Air to Fuel ratio
    const fuelDensityGramsPerLitre = vehicle.fuelType === 'DIESEL' ? 832 : 745;

    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];
      const dtSec = Math.max(0.1, Math.min(5.0, (p2.timestamp - p1.timestamp) / 1000));

      const avgSpeedKmh = (p1.speedKmh + p2.speedKmh) / 2;
      totalDistanceKm += (avgSpeedKmh * dtSec) / 3600;

      if (p2.mafGramsSec && p2.mafGramsSec > 0) {
        // High fidelity OBD-II MAF calculation: Fuel (g/s) = MAF / AFR
        hasMaf = true;
        const fuelRateGramsSec = p2.mafGramsSec / afr;
        totalFuelGrams += fuelRateGramsSec * dtSec;
      } else if (p2.rpm && p2.rpm > 0) {
        // Fallback OBD formula using RPM, Engine displacement and Engine Load / MAP
        // Air mass flow (g/s) ~ (RPM * Displacement_L / 120) * (EngineLoad / 100) * 1.184 (air density)
        const load = (p2.engineLoad || 25) / 100;
        const estimatedMaf = (p2.rpm * engineSizeL * load * 1.184) / 120;
        const fuelRateGramsSec = estimatedMaf / afr;
        totalFuelGrams += fuelRateGramsSec * dtSec;
      } else {
        // Fallback to phone-only model for segment if OBD stream dropped
        const phoneSegment = this.estimatePointEnergy(p1, p2, dtSec, vehicle);
        totalFuelGrams += (phoneSegment * fuelDensityGramsPerLitre) / 1000;
      }
    }

    const fuelUsedLitres = totalFuelGrams / fuelDensityGramsPerLitre;
    const distanceKm = Math.max(0.1, totalDistanceKm);
    const fuelEfficiencyL100km = (fuelUsedLitres / distanceKm) * 100;
    const fuelEfficiencyKml = distanceKm / Math.max(0.01, fuelUsedLitres);

    return {
      fuelUsedLitres: Number(fuelUsedLitres.toFixed(3)),
      fuelEfficiencyL100km: Number(Math.max(2.5, Math.min(30.0, fuelEfficiencyL100km)).toFixed(2)),
      fuelEfficiencyKml: Number(Math.max(3.0, Math.min(40.0, fuelEfficiencyKml)).toFixed(2)),
      confidence: hasMaf ? 'HIGH' : 'MEDIUM',
      isEstimated: !hasMaf, // if direct MAF was present it's real physical calculation
      estimatorVersion: `${this.VERSION}-obd`,
    };
  }

  /**
   * Mode A: Phone-Only Kinematic & Aerodynamic Vehicle Dynamics
   * Computes power demand = rolling resistance + aerodynamic drag + inertial acceleration + idle auxiliary draw.
   */
  private static calculatePhoneOnlyMode(
    points: TelemetryPoint[],
    vehicle: Partial<Vehicle>
  ): FuelEstimateResult {
    const massKg = VEHICLE_PHYSICS_DEFAULTS.DEFAULT_MASS_KG;
    const fuelEnergyDensityMj = VEHICLE_PHYSICS_DEFAULTS.FUEL_ENERGY_DENSITY_MJ_L; // 34.2 MJ/L
    let totalJoules = 0;
    let totalDistanceKm = 0;

    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];
      const dtSec = Math.max(0.1, Math.min(5.0, (p2.timestamp - p1.timestamp) / 1000));

      const v1 = (p1.speedKmh * 1000) / 3600; // m/s
      const v2 = (p2.speedKmh * 1000) / 3600; // m/s
      const avgV = (v1 + v2) / 2;

      const segmentDistM = avgV * dtSec;
      totalDistanceKm += segmentDistM / 1000;

      if (avgV < 1.0) {
        // Stationary / Idling power (approx 1.2 kW auxiliary + engine baseline idle)
        const idlePowerWatts = 1200;
        const idleJoules = (idlePowerWatts * dtSec) / VEHICLE_PHYSICS_DEFAULTS.ENGINE_THERMAL_EFFICIENCY;
        totalJoules += idleJoules;
        continue;
      }

      // Acceleration (m/s²)
      const accel = p2.longitudinalAccelMs2 || (v2 - v1) / dtSec;

      // 1. Rolling resistance force: F_rr = Crr * m * g
      const fRolling =
        VEHICLE_PHYSICS_DEFAULTS.ROLLING_RESISTANCE_COEFF * massKg * VEHICLE_PHYSICS_DEFAULTS.GRAVITY;

      // 2. Aerodynamic drag force: F_aero = 0.5 * rho * Cd * A * v²
      const fAero =
        0.5 *
        VEHICLE_PHYSICS_DEFAULTS.AIR_DENSITY *
        VEHICLE_PHYSICS_DEFAULTS.DRAG_COEFFICIENT *
        VEHICLE_PHYSICS_DEFAULTS.FRONTAL_AREA *
        (avgV * avgV);

      // 3. Inertial force: F_inertial = m * a (only positive work burns fuel; coasting/braking is non-negative fuel load)
      const fInertial = accel > 0 ? massKg * accel : 0;

      const totalTractiveForce = fRolling + fAero + fInertial;
      const wheelPowerWatts = Math.max(0, totalTractiveForce * avgV);

      // Account for drivetrain efficiency (~85%) and engine thermal efficiency (~30%)
      const enginePowerWatts =
        wheelPowerWatts / VEHICLE_PHYSICS_DEFAULTS.DRIVE_TRAIN_EFFICIENCY + 800; // 800W baseline overhead
      const chemicalFuelPowerWatts =
        enginePowerWatts / VEHICLE_PHYSICS_DEFAULTS.ENGINE_THERMAL_EFFICIENCY;

      totalJoules += chemicalFuelPowerWatts * dtSec;
    }

    // Convert Joules to Litres (1 MJ = 1e6 Joules)
    const totalMj = totalJoules / 1_000_000;
    const fuelUsedLitres = totalMj / fuelEnergyDensityMj;
    const distanceKm = Math.max(0.1, totalDistanceKm);
    const fuelEfficiencyL100km = (fuelUsedLitres / distanceKm) * 100;
    const fuelEfficiencyKml = distanceKm / Math.max(0.01, fuelUsedLitres);

    return {
      fuelUsedLitres: Number(fuelUsedLitres.toFixed(3)),
      fuelEfficiencyL100km: Number(Math.max(2.8, Math.min(25.0, fuelEfficiencyL100km)).toFixed(2)),
      fuelEfficiencyKml: Number(Math.max(4.0, Math.min(35.0, fuelEfficiencyKml)).toFixed(2)),
      confidence: 'MEDIUM',
      isEstimated: true,
      estimatorVersion: `${this.VERSION}-phone-dynamics`,
    };
  }

  private static estimatePointEnergy(
    p1: TelemetryPoint,
    p2: TelemetryPoint,
    dtSec: number,
    vehicle: Partial<Vehicle>
  ): number {
    const avgSpeed = (p1.speedKmh + p2.speedKmh) / 2;
    // approx 0.00002 Litres per second baseline + speed factor
    return (0.0004 + (avgSpeed / 100) * 0.0018) * dtSec;
  }
}
