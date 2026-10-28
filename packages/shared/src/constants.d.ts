import { FuelType, Achievement, Challenge } from './types';
export declare const CO2_EMISSION_FACTORS: Record<FuelType, number>;
export declare const VEHICLE_PHYSICS_DEFAULTS: {
    AIR_DENSITY: number;
    GRAVITY: number;
    ROLLING_RESISTANCE_COEFF: number;
    DRAG_COEFFICIENT: number;
    FRONTAL_AREA: number;
    DEFAULT_MASS_KG: number;
    DRIVE_TRAIN_EFFICIENCY: number;
    ENGINE_THERMAL_EFFICIENCY: number;
    FUEL_ENERGY_DENSITY_MJ_L: number;
};
export declare const EVENT_THRESHOLDS: {
    HARSH_ACCEL_MS2: number;
    HARSH_BRAKE_MS2: number;
    RAPID_SPEED_CHANGE_KMH_SEC: number;
    SHARP_TURN_LATERAL_MS2: number;
    SHARP_TURN_GYRO_RAD_S: number;
    IDLE_SPEED_KMH: number;
    EXCESSIVE_IDLE_SECONDS: number;
    OVERSPEED_DEFAULT_KMH: number;
    SPIKE_SUPPRESSION_WINDOW_SEC: number;
};
export declare const ECO_SCORE_WEIGHTS: {
    FUEL_EFFICIENCY: number;
    ACCEL_SMOOTHNESS: number;
    BRAKE_SMOOTHNESS: number;
    IDLE_EFFICIENCY: number;
    SPEED_CONSISTENCY: number;
};
export declare const SAFETY_SCORE_PENALTIES: {
    HARSH_ACCEL_PENALTY: number;
    HARSH_BRAKE_PENALTY: number;
    RAPID_SPEED_CHANGE_PENALTY: number;
    SHARP_TURN_PENALTY: number;
    OVERSPEED_PENALTY: number;
};
export declare const DEFAULT_ACHIEVEMENTS: Omit<Achievement, 'id'>[];
export declare const DEFAULT_CHALLENGES: Omit<Challenge, 'id'>[];
