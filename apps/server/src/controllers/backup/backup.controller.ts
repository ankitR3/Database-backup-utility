import { Request, Response } from 'express';
import { createBackup } from '../../services/backup/backup.service';
import prisma from '@repo/db';
import fs from 'fs';

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
        })
    }

    const startTime = Date.now();

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

        const stats = fs.statSync(result.filePath);
        const fileSize = stats.size;

        const duration = Date.now() - startTime;

        await prisma.backupHistory.create({
            data: {
                configId,
                filePath: result.filePath,
                size: fileSize,
                durationMs: duration,
                status: 'success',
            },
        });

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
        await prisma.backupHistory.create({
            data: {
                configId,
                filePath: '',
                size: 0,
                durationMs: 0,
                status: 'failed',
                errorMessage: err.message || 'Unknown error'
            },
        });

        await prisma.backupConfig.update({
            where: {
                id: configId
            },
            data: {
                isRunning: false
            },
        });

        console.error('Backup failed: ', err);

        return res.status(500).json({
            message: 'Backup failed',
        });
    }
}