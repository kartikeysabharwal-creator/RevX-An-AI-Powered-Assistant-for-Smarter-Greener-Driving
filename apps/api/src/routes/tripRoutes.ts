import { Router } from 'express';
import { TripController } from '../controllers/tripController';
import { requireAuth } from '../middleware/authMiddleware';
import { validateBody, validateQuery } from '../middleware/validationMiddleware';
import {
  StartTripSchema,
  IngestTelemetrySchema,
  EndTripSchema,
  TripFilterSchema,
} from '@revx/shared';

const router = Router();

router.use(requireAuth);

router.post('/start', validateBody(StartTripSchema), TripController.startTrip);
router.post('/telemetry', validateBody(IngestTelemetrySchema), TripController.ingestTelemetry);
router.post('/end', validateBody(EndTripSchema), TripController.endTrip);
router.get('/', validateQuery(TripFilterSchema), TripController.listTrips);
router.get('/:id', TripController.getTrip);
router.delete('/:id', TripController.deleteTrip);

export default router;
