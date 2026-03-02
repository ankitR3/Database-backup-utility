import { Request, Response } from 'express';
import prisma from '@repo/db';

export async function getBackupHistoryController(req: Request, res: Response) {
    const userId = req.user?.id;
    const { configId } = req.params;

    if (!userId) {
        return res.status(401).json({
            message: 'Unauthorized'
        });
    }

    if (!configId) {
        return res.status(400).json({
            message: 'Config-Id required'
        });
    }

    const config = await prisma.backupConfig.findUnique({
        where: {
            id: configId
        },
    });

    if (!config || config.userId !== userId) {
        return res.status(403).json({
            message: 'Forbidden'
        });
    }

    const history = await prisma.backupHistory.findMany({
        where: {
            configId
        },
        orderBy: {
            createdAt: 'desc'
        },
    });

    return res.status(200).json(history);
}