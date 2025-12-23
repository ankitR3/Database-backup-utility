import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import { createBackupController } from '../controllers/backup/backupController';
import { downloadBackupController } from '../controllers/backup/downloadController';

const router = Router();

router.post('/backup/create', authMiddleware, createBackupController);
router.get('/backup/download', authMiddleware, downloadBackupController);

export default router;