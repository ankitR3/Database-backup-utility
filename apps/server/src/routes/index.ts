import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import { createBackupController } from '../controllers/backup/backupController';
import { downloadBackupController } from '../controllers/backup/downloadController';
import { healthController } from '../controllers/health/healthController';
import { createBackupConfigController } from '../controllers/backup/backupConfigController';
import signUpController from '../controllers/auth/signup.controller';
import signInController from '../controllers/auth/signin.controller';

const router: Router = Router();

// <----------------------------------------CONTROLLERS---------------------------------------->
// <-------------------------AUTH------------------------->
router.post('/signup', signUpController);
router.post('/signin', signInController);

// <----------------------------------BACKUP---------------------------------->
router.post('/backup/create', authMiddleware, createBackupController);
router.get('/backup/download', authMiddleware, downloadBackupController);
router.get('/health', healthController);
router.post('/backup/schedule', authMiddleware, createBackupConfigController);

export default router;