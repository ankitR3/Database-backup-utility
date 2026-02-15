import { Request, Response } from 'express';
import { BackupInput } from '../../types/backup.types';
import { createBackup } from '../../services/backup/backup.service';

export async function createBackupController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: 'Unauthorized'
            });
        }

        const { configId } = req.body;

        if (!configId) {
            return res.status(400).json({
                message: 'Config ID required',
            });
        }

        const result = await createBackup(configId, userId);

        res.status(201).json({
            success: true,
            message: 'Backup created successfully',
            backup: result,
        });
    } catch (err: any) {
        if (err.message === 'CONFIG_NOT_FOUND') {
            return res.status(404).json({
                message: 'Backup config not found',
            });
        }

        res.status(500).json({
            message: 'Backup failed',
        });
    }
}