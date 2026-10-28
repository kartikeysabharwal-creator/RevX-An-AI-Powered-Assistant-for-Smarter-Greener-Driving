import { Router } from 'express';
import { VehicleHealthController } from '../controllers/vehicleHealthController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/status', VehicleHealthController.getHealthStatus);

export default router;
