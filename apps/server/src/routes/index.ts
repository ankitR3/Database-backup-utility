import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import { createBackupController } from '../controllers/backup/backupController';
import { downloadBackupController } from '../controllers/backup/downloadController';
import { healthController } from '../controllers/health/healthController';
import { createBackupConfigController, deleteConfig, getConfigs, toggleScheduler, updateScheduler } from '../controllers/backup/backupConfigController';
import signInController from '../controllers/auth/signIn.controller';

const router: Router = Router();

// <----------------------------------------CONTROLLERS---------------------------------------->
// <-------------------------AUTH------------------------->
router.post('/login', signInController);

// <----------------------------------BACKUP---------------------------------->
router.post('/backup/create', authMiddleware, createBackupController);
router.get('/backup/download', authMiddleware, downloadBackupController);

router.get('/health', healthController);

router.post('/backup/schedule', authMiddleware, createBackupConfigController);
router.get('/backup/configs', authMiddleware, getConfigs);
router.patch('/backup/toggle', authMiddleware, toggleScheduler);
router.patch('/backup/update-scheduler', authMiddleware, updateScheduler);
router.delete('/backup/config/:id', authMiddleware, deleteConfig);

export default router;