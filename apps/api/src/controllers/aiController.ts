import { Request, Response, NextFunction } from 'express';
import { AICoachService } from '../services/aiCoachService';
import { db } from '../services/db';

export class AIController {
  public static async analyzeTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { tripId, forceRefresh } = req.body;

      const trip = db.getTripById(tripId, userId);
      if (!trip) {
        return res.status(404).json({ success: false, error: { message: 'Trip not found' } });
      }

      const insight = await AICoachService.generateCoaching(trip, forceRefresh);
      res.json({ success: true, data: insight });
    } catch (err) {
      next(err);
    }
  }
}
