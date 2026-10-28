import { Router } from 'express';
import authRoutes from './authRoutes';
import vehicleRoutes from './vehicleRoutes';
import tripRoutes from './tripRoutes';
import aiRoutes from './aiRoutes';
import analyticsRoutes from './analyticsRoutes';
import gamificationRoutes from './gamificationRoutes';
import vehicleHealthRoutes from './vehicleHealthRoutes';
import simulatorRoutes from './simulatorRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/trips', tripRoutes);
router.use('/ai', aiRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/gamification', gamificationRoutes);
router.use('/vehicle-health', vehicleHealthRoutes);
router.use('/simulators', simulatorRoutes);
router.use('/admin', adminRoutes);

// Direct top-level health endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'RevX API', version: '1.4.0', timestamp: new Date().toISOString() });
});

export default router;
