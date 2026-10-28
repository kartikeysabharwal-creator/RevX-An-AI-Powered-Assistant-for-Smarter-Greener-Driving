import { Router } from 'express';
import { AdminController } from '../controllers/adminController';

const router = Router();

router.get('/health', AdminController.health);
router.get('/stats', AdminController.getSystemStats);

export default router;
