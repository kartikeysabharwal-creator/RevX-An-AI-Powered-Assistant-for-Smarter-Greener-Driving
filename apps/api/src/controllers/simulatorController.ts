import { Request, Response, NextFunction } from 'express';
import { PhoneSensorSimulator, DrivingScenario } from '../simulators/phoneSensorSimulator';
import { ObdSimulator } from '../simulators/obdSimulator';
import { TripProcessorService } from '../services/tripProcessorService';
import { db } from '../services/db';

export class SimulatorController {
  public static async runScenario(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { scenario = 'SMOOTH_ECO', mode = 'OBD_II' } = req.body;

      const vehicles = db.getVehicles(userId);
      const vehicle = vehicles[0] || db.createVehicle(userId, {
        make: 'Honda',
        model: 'Civic Turbo',
        year: 2024,
        fuelType: 'PETROL',
        engineSizeL: 1.5,
        transmission: 'AUTOMATIC',
        fuelTankCapacityL: 45,
        odometerKm: 14000,
        isPrimary: true,
      });

      // 1. Generate points
      let points = PhoneSensorSimulator.generateScenarioStream(scenario as DrivingScenario);
      if (mode === 'OBD_II') {
        points = ObdSimulator.enrichWithObdTelemetry(points, {
          coolantAnomaly: scenario === 'AGGRESSIVE_SPEED',
          hasTroubleCode: scenario === 'AGGRESSIVE_SPEED',
        });
      }

      // 2. Start Trip
      const trip = TripProcessorService.startTrip(userId, vehicle.id, mode);

      // 3. Ingest points
      TripProcessorService.ingestBatch(trip.id, points, false);

      // 4. Complete trip
      const completedTrip = TripProcessorService.finishTrip(trip.id, userId);

      res.status(201).json({
        success: true,
        data: {
          scenario,
          mode,
          trip: completedTrip,
          pointsSampled: points.length,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
