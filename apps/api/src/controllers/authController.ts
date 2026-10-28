import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../services/db';
import { config } from '../config';

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, fullName, fuelPricePerLitre, personalBaselineEfficiency } = req.body;
      const userId = '00000000-0000-0000-0000-000000000001';

      const profile = db.updateProfile(userId, {
        email,
        fullName,
        fuelPricePerLitre: fuelPricePerLitre || 102.5,
        personalBaselineEfficiency: personalBaselineEfficiency || 8.5,
      });

      const token = jwt.sign(
        { id: userId, email: profile.email, fullName: profile.fullName },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        data: {
          user: profile,
          token,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const userId = '00000000-0000-0000-0000-000000000001';
      const profile = db.getProfile(userId) || db.updateProfile(userId, { email, fullName: 'Anjul Sharma' });

      const token = jwt.sign(
        { id: userId, email: profile.email, fullName: profile.fullName },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        data: {
          user: profile,
          token,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const profile = db.getProfile(userId);
      if (!profile) {
        return res.status(404).json({ success: false, error: { message: 'Profile not found' } });
      }
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  }

  public static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const updated = db.updateProfile(userId, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
}
