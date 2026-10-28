import { Router } from 'express';
import { SimulatorController } from '../controllers/simulatorController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.post('/run', SimulatorController.runScenario);

export default router;
