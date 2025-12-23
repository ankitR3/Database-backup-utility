import { Router } from 'express';
import signInController from '../controllers/auth/signInController';

const router = Router();

router.post('/auth', signInController);

export default router;