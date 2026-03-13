import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import { createBackupController } from '../controllers/backup/backup.controller';
import { downloadBackupController } from '../controllers/backup/download.controller';
import { healthController } from '../controllers/health/healthController';
import { createBackupConfigController, deleteConfig, getConfigs, toggleScheduler, updateScheduler } from '../controllers/backup/backupConfig.controller';
import signInController from '../controllers/auth/signIn.controller';
import { getBackupHistoryController } from '../controllers/backup/backupHistory.controller';
import { getBackupStatsController } from '../controllers/backup/backupStats.controller';
import { deleteBackupController } from '../controllers/backup/deleteBackup.controller';

const router: Router = Router();

// <----------------------------------------CONTROLLERS---------------------------------------->
// <-------------------------AUTH------------------------->
router.post('/login', signInController);

// <----------------------------------BACKUP---------------------------------->
router.post('/backup/create', authMiddleware, createBackupController);
router.get('/backup/download', authMiddleware, downloadBackupController);

// <----------------------------------HEALTH---------------------------------->
router.get('/health', healthController);

// <----------------------------------SCHEDULE---------------------------------->
router.post('/backup/schedule', authMiddleware, createBackupConfigController);
router.get('/backup/configs', authMiddleware, getConfigs);
router.patch('/backup/config/:id/toggle', authMiddleware, toggleScheduler);
router.patch('/backup/update-scheduler', authMiddleware, updateScheduler);
router.delete('/backup/config/:id', authMiddleware, deleteConfig);
router.get('/backup/history/:configId', authMiddleware, getBackupHistoryController);
router.get('/backup/stats', authMiddleware, getBackupStatsController);
router.delete('/backup/:backupId', authMiddleware, deleteBackupController);

export default router;