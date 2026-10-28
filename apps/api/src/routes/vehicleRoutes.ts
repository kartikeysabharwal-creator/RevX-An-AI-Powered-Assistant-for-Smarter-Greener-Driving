import { Router } from 'express';
import { VehicleController } from '../controllers/vehicleController';
import { requireAuth } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validationMiddleware';
import { CreateVehicleSchema, UpdateVehicleSchema } from '@revx/shared';

const router = Router();

router.use(requireAuth);

router.get('/', VehicleController.listVehicles);
router.post('/', validateBody(CreateVehicleSchema), VehicleController.createVehicle);
router.get('/:id', VehicleController.getVehicle);
router.put('/:id', validateBody(UpdateVehicleSchema), VehicleController.updateVehicle);
router.delete('/:id', VehicleController.deleteVehicle);

export default router;
