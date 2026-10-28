import { Request, Response, NextFunction } from 'express';
import { db } from '../services/db';

export class VehicleHealthController {
  public static async getHealthStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const vehicles = db.getVehicles(userId);
      const vehicle = vehicles.find((v) => v.isPrimary) || vehicles[0];

      if (!vehicle) {
        return res.status(404).json({ success: false, error: { message: 'No vehicle registered' } });
      }

      const maintenance = db.getMaintenanceRecords(vehicle.id);

      res.json({
        success: true,
        data: {
          vehicleId: vehicle.id,
          vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          coolantTempC: 91,
          coolantStatus: 'NORMAL',
          batteryVoltage: 14.1,
          batteryStatus: 'NORMAL',
          engineLoadPercent: 32,
          engineLoadStatus: 'NORMAL',
          activeDtcs: [],
          maintenanceReminders: maintenance,
          disclaimer:
            'RevX health indicators are informational behavioural indicators and do not replace professional vehicle diagnostic tools or manufacturer inspection.',
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
