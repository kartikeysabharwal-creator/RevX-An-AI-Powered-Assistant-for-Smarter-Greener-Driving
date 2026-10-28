import { Router } from 'express';
import { AIController } from '../controllers/aiController';
import { requireAuth } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validationMiddleware';
import { AnalyzeTripRequestSchema } from '@revx/shared';

const router = Router();

router.use(requireAuth);

router.post('/analyze-trip', validateBody(AnalyzeTripRequestSchema), AIController.analyzeTrip);

export default router;
