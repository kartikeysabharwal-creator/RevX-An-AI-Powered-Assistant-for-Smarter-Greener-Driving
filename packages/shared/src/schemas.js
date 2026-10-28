"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripFilterSchema = exports.AnalyzeTripRequestSchema = exports.EndTripSchema = exports.IngestTelemetrySchema = exports.StartTripSchema = exports.TelemetryPointSchema = exports.UpdateVehicleSchema = exports.CreateVehicleSchema = exports.UpdateProfileSchema = exports.LoginUserSchema = exports.RegisterUserSchema = exports.DrivingEventTypeSchema = exports.OperatingModeSchema = exports.FuelTypeSchema = void 0;
const zod_1 = require("zod");
exports.FuelTypeSchema = zod_1.z.enum(['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC', 'CNG']);
exports.OperatingModeSchema = zod_1.z.enum(['PHONE_ONLY', 'OBD_II']);
exports.DrivingEventTypeSchema = zod_1.z.enum([
    'HARSH_ACCELERATION',
    'HARSH_BRAKING',
    'RAPID_SPEED_CHANGE',
    'SHARP_TURN',
    'EXCESSIVE_IDLE',
    'OVERSPEED',
]);
exports.RegisterUserSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    fullName: zod_1.z.string().min(2),
    preferredUnits: zod_1.z.enum(['METRIC', 'IMPERIAL']).default('METRIC'),
    fuelPricePerLitre: zod_1.z.number().positive().default(100.0), // default in ₹ or local currency
    personalBaselineEfficiency: zod_1.z.number().positive().default(8.5), // L/100km default baseline
});
exports.LoginUserSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
exports.UpdateProfileSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2).optional(),
    preferredUnits: zod_1.z.enum(['METRIC', 'IMPERIAL']).optional(),
    currencySymbol: zod_1.z.string().optional(),
    fuelPricePerLitre: zod_1.z.number().positive().optional(),
    personalBaselineEfficiency: zod_1.z.number().positive().optional(),
});
exports.CreateVehicleSchema = zod_1.z.object({
    make: zod_1.z.string().min(1),
    model: zod_1.z.string().min(1),
    year: zod_1.z.number().int().min(1980).max(2030),
    fuelType: exports.FuelTypeSchema,
    engineSizeL: zod_1.z.number().positive().default(1.5),
    transmission: zod_1.z.enum(['AUTOMATIC', 'MANUAL']).default('AUTOMATIC'),
    fuelTankCapacityL: zod_1.z.number().positive().default(45.0),
    odometerKm: zod_1.z.number().nonnegative().default(0),
    nickname: zod_1.z.string().optional(),
    isPrimary: zod_1.z.boolean().default(true),
});
exports.UpdateVehicleSchema = exports.CreateVehicleSchema.partial();
exports.TelemetryPointSchema = zod_1.z.object({
    timestamp: zod_1.z.number(),
    latitude: zod_1.z.number(),
    longitude: zod_1.z.number(),
    accuracy: zod_1.z.number().default(5),
    speedKmh: zod_1.z.number().nonnegative(),
    altitude: zod_1.z.number().optional(),
    heading: zod_1.z.number().optional(),
    rawAx: zod_1.z.number().optional(),
    rawAy: zod_1.z.number().optional(),
    rawAz: zod_1.z.number().optional(),
    longitudinalAccelMs2: zod_1.z.number(),
    lateralAccelMs2: zod_1.z.number().default(0),
    verticalAccelMs2: zod_1.z.number().default(0),
    gyroZ: zod_1.z.number().optional(),
    jerkMs3: zod_1.z.number().optional(),
    rpm: zod_1.z.number().optional(),
    throttlePos: zod_1.z.number().optional(),
    engineLoad: zod_1.z.number().optional(),
    coolantTempC: zod_1.z.number().optional(),
    fuelLevelPercent: zod_1.z.number().optional(),
    batteryVoltage: zod_1.z.number().optional(),
    mafGramsSec: zod_1.z.number().optional(),
    sourceMode: exports.OperatingModeSchema.default('PHONE_ONLY'),
    isStationary: zod_1.z.boolean().default(false),
});
exports.StartTripSchema = zod_1.z.object({
    vehicleId: zod_1.z.string().uuid(),
    mode: exports.OperatingModeSchema,
    initialLatitude: zod_1.z.number().optional(),
    initialLongitude: zod_1.z.number().optional(),
});
exports.IngestTelemetrySchema = zod_1.z.object({
    tripId: zod_1.z.string().uuid(),
    points: zod_1.z.array(exports.TelemetryPointSchema).min(1).max(500),
    isEnd: zod_1.z.boolean().default(false),
});
exports.EndTripSchema = zod_1.z.object({
    tripId: zod_1.z.string().uuid(),
    finalOdometer: zod_1.z.number().optional(),
    forceRecalculate: zod_1.z.boolean().default(false),
});
exports.AnalyzeTripRequestSchema = zod_1.z.object({
    tripId: zod_1.z.string().uuid(),
    forceRefresh: zod_1.z.boolean().default(false),
});
exports.TripFilterSchema = zod_1.z.object({
    period: zod_1.z.enum(['TODAY', 'YESTERDAY', 'WEEK', 'MONTH', '3MONTHS', 'ALL']).default('ALL'),
    vehicleId: zod_1.z.string().uuid().optional(),
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(20),
});
