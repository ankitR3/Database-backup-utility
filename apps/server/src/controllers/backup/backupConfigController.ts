import { Request, Response } from 'express';
import { prisma } from '@repo/db';

export async function createBackupConfigController(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({
            message: 'Unauthorized'
        });
    }

    const { type, schedule, mongoUri, mongoDbName, pgUri, pgDbName } = req.body;

    if (!type || !schedule) {
        return res.status(400).json({
            message: 'Backup type and schedule are required'
        });
    }

    const config = await prisma.backupConfig.create({
        data: {
            userId: String(userId),
            type,
            schedule,
            mongoUri,
            mongoDbName,
            pgUri,
            pgDbName,
        },
    });

    res.status(201).json({
        success: true,
        message: 'Scheduled backup configured',
        config,
    });
}