import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/dashboard', AnalyticsController.getDashboard);
router.get('/weekly', AnalyticsController.getWeekly);
router.get('/monthly', AnalyticsController.getMonthly);
router.get('/savings', AnalyticsController.getSavings);

export default router;
