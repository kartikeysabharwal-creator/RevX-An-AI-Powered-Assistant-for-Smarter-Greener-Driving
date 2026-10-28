import { Request, Response, NextFunction } from 'express';
import { db } from '../services/db';

export class AdminController {
  public static async health(req: Request, res: Response) {
    res.json({
      status: 'UP',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      service: 'RevX Core Backend Engine',
      version: '1.4.0',
      greenComputingStatus: 'ACTIVE',
    });
  }

  public static async getSystemStats(req: Request, res: Response, next: NextFunction) {
    try {
      const greenStats = db.getGreenComputingStats();
      const allTrips = (db as any).trips.size || 2;
      const allVehicles = (db as any).vehicles.size || 2;

      res.json({
        success: true,
        data: {
          system: {
            uptime: Math.floor(process.uptime()),
            environment: process.env.NODE_ENV || 'development',
            apiVersion: '1.4.0',
            activeTripsCount: (TripProcessorService as any).activeBuffers?.size || 0,
            totalVehiclesRegistered: allVehicles,
            totalTripsProcessed: allTrips,
          },
          models: {
            fuelModel: 'RevX-Fuel-Regression-Estimator (v1.4.0)',
            behaviorClassifier: 'RevX-Driver-Behavior-Classifier (v1.4.0)',
            eventEngine: 'RevX-Deterministic-Rules-Engine (v1.4.0)',
            aiCoachModel: 'revx-deterministic-rules-engine',
          },
          greenComputing: greenStats,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
import { TripProcessorService } from '../services/tripProcessorService';
