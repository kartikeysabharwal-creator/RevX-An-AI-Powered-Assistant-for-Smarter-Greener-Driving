import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateBody } from '../middleware/validationMiddleware';
import { requireAuth } from '../middleware/authMiddleware';
import { RegisterUserSchema, LoginUserSchema, UpdateProfileSchema } from '@revx/shared';

const router = Router();

router.post('/register', validateBody(RegisterUserSchema), AuthController.register);
router.post('/login', validateBody(LoginUserSchema), AuthController.login);
router.get('/profile', requireAuth, AuthController.getProfile);
router.put('/profile', requireAuth, validateBody(UpdateProfileSchema), AuthController.updateProfile);

export default router;
