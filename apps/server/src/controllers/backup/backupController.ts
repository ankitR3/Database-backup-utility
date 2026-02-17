import { Request, Response } from 'express';
import { createBackup } from '../../services/backup/backup.service';
import prisma from '@repo/db';

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

    if (config?.isRunning) {
        return res.status(400).json({
            message: 'Backup already running'
        })
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

        const result = await createBackup(configId, userId);

        await prisma.backupConfig.update({
            where: {
                id: configId
            },
            data: {
                isRunning: false,
                lastRunAt: new Date(),
            },
        });

        res.status(201).json({
            success: true,
            message: 'Backup created successfully',
            backup: result,
        });

    } catch (err: any) {
        await prisma.backupConfig.update({
            where: {
                id: configId
            },
            data: {
                isRunning: false
            },
        });

        if (err.message === 'CONFIG_NOT_FOUND') {
            return res.status(404).json({
                message: 'Backup config not found',
            });
        }

        if (err.message === 'CONFIG_DISABLED') {
            return res.status(400).json({
                message: 'Scheduler is disabled. Please enable it first'
            })
        }

        console.error('Backup failed: ', err);

        res.status(500).json({
            message: 'Backup failed',
        });
    }
}