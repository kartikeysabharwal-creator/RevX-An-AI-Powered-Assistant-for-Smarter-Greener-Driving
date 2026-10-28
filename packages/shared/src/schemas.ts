import { z } from 'zod';

export const FuelTypeSchema = z.enum(['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC', 'CNG']);
export const OperatingModeSchema = z.enum(['PHONE_ONLY', 'OBD_II']);
export const DrivingEventTypeSchema = z.enum([
  'HARSH_ACCELERATION',
  'HARSH_BRAKING',
  'RAPID_SPEED_CHANGE',
  'SHARP_TURN',
  'EXCESSIVE_IDLE',
  'OVERSPEED',
]);

export const RegisterUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  preferredUnits: z.enum(['METRIC', 'IMPERIAL']).default('METRIC'),
  fuelPricePerLitre: z.number().positive().default(100.0), // default in ₹ or local currency
  personalBaselineEfficiency: z.number().positive().default(8.5), // L/100km default baseline
});

export const LoginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const UpdateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  preferredUnits: z.enum(['METRIC', 'IMPERIAL']).optional(),
  currencySymbol: z.string().optional(),
  fuelPricePerLitre: z.number().positive().optional(),
  personalBaselineEfficiency: z.number().positive().optional(),
});

export const CreateVehicleSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1980).max(2030),
  fuelType: FuelTypeSchema,
  engineSizeL: z.number().positive().default(1.5),
  transmission: z.enum(['AUTOMATIC', 'MANUAL']).default('AUTOMATIC'),
  fuelTankCapacityL: z.number().positive().default(45.0),
  odometerKm: z.number().nonnegative().default(0),
  nickname: z.string().optional(),
  isPrimary: z.boolean().default(true),
});

export const UpdateVehicleSchema = CreateVehicleSchema.partial();

export const TelemetryPointSchema = z.object({
  timestamp: z.number(),
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().default(5),
  speedKmh: z.number().nonnegative(),
  altitude: z.number().optional(),
  heading: z.number().optional(),
  rawAx: z.number().optional(),
  rawAy: z.number().optional(),
  rawAz: z.number().optional(),
  longitudinalAccelMs2: z.number(),
  lateralAccelMs2: z.number().default(0),
  verticalAccelMs2: z.number().default(0),
  gyroZ: z.number().optional(),
  jerkMs3: z.number().optional(),
  rpm: z.number().optional(),
  throttlePos: z.number().optional(),
  engineLoad: z.number().optional(),
  coolantTempC: z.number().optional(),
  fuelLevelPercent: z.number().optional(),
  batteryVoltage: z.number().optional(),
  mafGramsSec: z.number().optional(),
  sourceMode: OperatingModeSchema.default('PHONE_ONLY'),
  isStationary: z.boolean().default(false),
});

export const StartTripSchema = z.object({
  vehicleId: z.string().uuid(),
  mode: OperatingModeSchema,
  initialLatitude: z.number().optional(),
  initialLongitude: z.number().optional(),
});

export const IngestTelemetrySchema = z.object({
  tripId: z.string().uuid(),
  points: z.array(TelemetryPointSchema).min(1).max(500),
  isEnd: z.boolean().default(false),
});

export const EndTripSchema = z.object({
  tripId: z.string().uuid(),
  finalOdometer: z.number().optional(),
  forceRecalculate: z.boolean().default(false),
});

export const AnalyzeTripRequestSchema = z.object({
  tripId: z.string().uuid(),
  forceRefresh: z.boolean().default(false),
});

export const TripFilterSchema = z.object({
  period: z.enum(['TODAY', 'YESTERDAY', 'WEEK', 'MONTH', '3MONTHS', 'ALL']).default('ALL'),
  vehicleId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
