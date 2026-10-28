"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CHALLENGES = exports.DEFAULT_ACHIEVEMENTS = exports.SAFETY_SCORE_PENALTIES = exports.ECO_SCORE_WEIGHTS = exports.EVENT_THRESHOLDS = exports.VEHICLE_PHYSICS_DEFAULTS = exports.CO2_EMISSION_FACTORS = void 0;
// Carbon Emission Factors (kg CO2 per Litre of fuel or equivalent)
exports.CO2_EMISSION_FACTORS = {
    PETROL: 2.31, // kg CO2 / L
    DIESEL: 2.68, // kg CO2 / L
    HYBRID: 1.62, // kg CO2 / L (effective)
    CNG: 1.82, // kg CO2 / kg equivalent
    ELECTRIC: 0.45, // kg CO2 / kWh grid factor equiv
};
// Standard Physical Constants for Vehicle Dynamics (Phone-only model)
exports.VEHICLE_PHYSICS_DEFAULTS = {
    AIR_DENSITY: 1.225, // kg/m³
    GRAVITY: 9.80665, // m/s²
    ROLLING_RESISTANCE_COEFF: 0.015,
    DRAG_COEFFICIENT: 0.30,
    FRONTAL_AREA: 2.2, // m²
    DEFAULT_MASS_KG: 1400, // kg
    DRIVE_TRAIN_EFFICIENCY: 0.85,
    ENGINE_THERMAL_EFFICIENCY: 0.30, // 30% for internal combustion
    FUEL_ENERGY_DENSITY_MJ_L: 34.2, // MJ/L for standard gasoline
};
// Driving Event Detection Default Thresholds
exports.EVENT_THRESHOLDS = {
    HARSH_ACCEL_MS2: 2.8, // > 2.8 m/s² (~0.29g)
    HARSH_BRAKE_MS2: -3.2, // < -3.2 m/s² (~-0.33g)
    RAPID_SPEED_CHANGE_KMH_SEC: 12.0, // delta speed > 12 km/h in 1 second
    SHARP_TURN_LATERAL_MS2: 3.5, // lateral cornering accel > 3.5 m/s² (~0.36g)
    SHARP_TURN_GYRO_RAD_S: 0.45, // yaw rate > 0.45 rad/s
    IDLE_SPEED_KMH: 3.0, // speed <= 3 km/h counts as stopped/idling
    EXCESSIVE_IDLE_SECONDS: 60, // stationary > 60 continuous seconds
    OVERSPEED_DEFAULT_KMH: 100.0, // default highway alert limit
    SPIKE_SUPPRESSION_WINDOW_SEC: 3.0, // debounce period for repeated spikes
};
// Eco Score Weights (Page 34: 30% fuel, 25% accel, 20% brake, 15% idle, 10% speed consistency)
exports.ECO_SCORE_WEIGHTS = {
    FUEL_EFFICIENCY: 0.30,
    ACCEL_SMOOTHNESS: 0.25,
    BRAKE_SMOOTHNESS: 0.20,
    IDLE_EFFICIENCY: 0.15,
    SPEED_CONSISTENCY: 0.10,
};
// Safety Score Penalties (Page 34: 100 - penalties(events))
exports.SAFETY_SCORE_PENALTIES = {
    HARSH_ACCEL_PENALTY: 4, // points off per occurrence
    HARSH_BRAKE_PENALTY: 6, // points off per occurrence (braking has higher safety penalty)
    RAPID_SPEED_CHANGE_PENALTY: 3,
    SHARP_TURN_PENALTY: 5,
    OVERSPEED_PENALTY: 8,
};
// Built-in System Achievements
exports.DEFAULT_ACHIEVEMENTS = [
    {
        key: 'smooth_operator',
        name: 'Smooth Operator',
        description: 'Complete 10 trips with zero harsh acceleration events.',
        icon: 'feather',
        category: 'EFFICIENCY',
        requirement: '10 trips with 0 harsh accelerations',
    },
    {
        key: 'brake_master',
        name: 'Brake Master',
        description: 'Complete 5 trips with zero harsh braking events.',
        icon: 'shield-check',
        category: 'SAFETY',
        requirement: '5 trips with 0 harsh brakes',
    },
    {
        key: 'green_week',
        name: 'Green Week',
        description: 'Maintain an Eco Score above 80 for 7 consecutive active days.',
        icon: 'leaf',
        category: 'CONSISTENCY',
        requirement: '7-day streak with Eco Score >= 80',
    },
    {
        key: 'fuel_saver',
        name: 'Fuel Saver',
        description: 'Beat your personal baseline efficiency by 15% on a trip over 10 km.',
        icon: 'droplet',
        category: 'EFFICIENCY',
        requirement: 'Efficiency >= 15% better than baseline',
    },
    {
        key: 'clean_miles',
        name: 'Clean Miles',
        description: 'Drive 100 km while producing under 120g CO2/km average.',
        icon: 'globe',
        category: 'MILESTONE',
        requirement: '100 km cumulative with CO2 < 120 g/km',
    },
    {
        key: 'steady_cruiser',
        name: 'Steady Cruiser',
        description: 'Keep speed variance under 5 km/h for a 20-minute highway segment.',
        icon: 'gauge',
        category: 'CONSISTENCY',
        requirement: 'Speed variance < 5 km/h on highway',
    },
];
// Built-in Active Driving Challenges
exports.DEFAULT_CHALLENGES = [
    {
        title: 'Zero Harsh Brakes',
        description: 'Complete 3 trips this week without a single harsh braking event.',
        targetMetric: 'trips_with_zero_brakes',
        targetValue: 3,
        durationDays: 7,
        rewardPoints: 250,
        icon: 'disc',
    },
    {
        title: 'Eco 85+ Club',
        description: 'Achieve an Eco Score of 85 or higher on two separate trips.',
        targetMetric: 'trips_eco_above_85',
        targetValue: 2,
        durationDays: 5,
        rewardPoints: 300,
        icon: 'award',
    },
    {
        title: 'Idle Reducer',
        description: 'Keep total idle time below 2 minutes across your next 3 city trips.',
        targetMetric: 'low_idle_trips',
        targetValue: 3,
        durationDays: 7,
        rewardPoints: 200,
        icon: 'clock',
    },
];
