import { Request, Response, NextFunction } from 'express';
import { db } from '../services/db';

export class VehicleController {
  public static async listVehicles(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const vehicles = db.getVehicles(userId);
      res.json({ success: true, data: vehicles });
    } catch (err) {
      next(err);
    }
  }

  public static async createVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const vehicle = db.createVehicle(userId, req.body);
      res.status(201).json({ success: true, data: vehicle });
    } catch (err) {
      next(err);
    }
  }

  public static async getVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const vehicle = db.getVehicleById(req.params.id, userId);
      if (!vehicle) {
        return res.status(404).json({ success: false, error: { message: 'Vehicle not found' } });
      }
      res.json({ success: true, data: vehicle });
    } catch (err) {
      next(err);
    }
  }

  public static async updateVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const updated = db.updateVehicle(req.params.id, userId, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, error: { message: 'Vehicle not found' } });
      }
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  public static async deleteVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const success = db.deleteVehicle(req.params.id, userId);
      if (!success) {
        return res.status(404).json({ success: false, error: { message: 'Vehicle not found' } });
      }
      res.json({ success: true, message: 'Vehicle deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}
