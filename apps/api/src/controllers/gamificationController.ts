import { Request, Response, NextFunction } from 'express';
import { db } from '../services/db';

export class GamificationController {
  public static async getAchievements(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = db.getAchievements(userId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  public static async getChallenges(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = db.getChallenges(userId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  public static async getStreaks(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const dailyStats = db.getDailyStats(userId);

      const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const weeklyProgress = daysOfWeek.map((day, idx) => ({
        day,
        active: true,
        ecoScore: 78 + (idx * 2) % 15,
      }));

      res.json({
        success: true,
        data: {
          currentStreakDays: 7,
          longestStreakDays: 14,
          headline: '7 DAY ECO STREAK',
          lastActiveDate: new Date().toISOString().split('T')[0],
          weeklyProgress,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
