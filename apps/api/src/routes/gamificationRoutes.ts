import { Router } from 'express';
import { GamificationController } from '../controllers/gamificationController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/achievements', GamificationController.getAchievements);
router.get('/challenges', GamificationController.getChallenges);
router.get('/streaks', GamificationController.getStreaks);

export default router;
