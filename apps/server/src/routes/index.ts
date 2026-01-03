import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import { createBackupController } from '../controllers/backup/backupController';
import { downloadBackupController } from '../controllers/backup/downloadController';
import signInController from '../controllers/auth/signInController';
import { healthController } from '../controllers/health/healthController';
import { createBackupConfigController } from '../controllers/backup/backupConfigController';

const router: Router = Router();

// <----------------------------------------CONTROLLERS---------------------------------------->
router.post('/backup/create', authMiddleware, createBackupController);
router.get('/backup/download', authMiddleware, downloadBackupController);
router.get('/health', healthController);
router.post('/backup/schedule', authMiddleware, createBackupConfigController);

// <----------------------------------------MIDDLEWARES---------------------------------------->
router.post('/auth/login', signInController);

export default router;