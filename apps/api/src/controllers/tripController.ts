import { Request, Response, NextFunction } from 'express';
import { TripProcessorService } from '../services/tripProcessorService';
import { db } from '../services/db';

export class TripController {
  public static async startTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { vehicleId, mode } = req.body;
      const trip = TripProcessorService.startTrip(userId, vehicleId, mode);
      res.status(201).json({ success: true, data: trip });
    } catch (err) {
      next(err);
    }
  }

  public static async ingestTelemetry(req: Request, res: Response, next: NextFunction) {
    try {
      const { tripId, points, isEnd } = req.body;
      const result = TripProcessorService.ingestBatch(tripId, points, isEnd);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async endTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { tripId } = req.body;
      const trip = TripProcessorService.finishTrip(tripId, userId);
      res.json({ success: true, data: trip });
    } catch (err) {
      next(err);
    }
  }

  public static async listTrips(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { period, vehicleId, page, limit } = req.query as any;
      const result = db.listTrips(userId, { period, vehicleId, page: Number(page), limit: Number(limit) });
      res.json({
        success: true,
        data: result.trips,
        pagination: {
          total: result.total,
          page: Number(page) || 1,
          limit: Number(limit) || 20,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const trip = db.getTripById(req.params.id, userId);
      if (!trip) {
        return res.status(404).json({ success: false, error: { message: 'Trip not found' } });
      }
      res.json({ success: true, data: trip });
    } catch (err) {
      next(err);
    }
  }

  public static async deleteTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const success = db.deleteTrip(req.params.id, userId);
      if (!success) {
        return res.status(404).json({ success: false, error: { message: 'Trip not found' } });
      }
      res.json({ success: true, message: 'Trip removed successfully' });
    } catch (err) {
      next(err);
    }
  }
}
