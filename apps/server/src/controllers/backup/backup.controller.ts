import { Request, Response } from 'express';
import prisma from '@repo/db';
import { runBackup } from '../../services/backup/runBackup';

export async function createBackupController(req: Request, res: Response) {
    const userId = req.user?.id;
    const { configId } = req.body;

    if (!userId) {
        return res.status(401).json({
            message: 'Unauthorized'
        });
    }

    if (!configId) {
        return res.status(400).json({
            message: 'Config ID required',
        });
    }

    const config = await prisma.backupConfig.findUnique({
        where: {
            id: configId
        }
    });

    if (!config || config.userId !== userId) {
        return res.status(403).json({
            message: 'Forbidden'
        }); 
    }

    if (!config.enabled) {
        return res.status(400).json({
            message: 'Scheduler is disabled. Please enable it first'
        });
    }

    if (config?.isRunning) {
        return res.status(400).json({
            message: 'Backup already running'
        });
    }

    try {

        await prisma.backupConfig.update({
            where: {
                id: configId
            },
            data: {
                isRunning: true
            },
        });

        await runBackup(config);

        res.status(201).json({
            success: true,
            message: 'Backup created successfully',
        });

    } catch (err) {
        console.error('Backup failed: ', err);

        res.status(500).json({
            message: 'Backup failed'
        });
    }
}