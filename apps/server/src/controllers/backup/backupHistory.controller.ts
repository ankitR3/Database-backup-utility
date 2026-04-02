import { Request, Response } from 'express';
import prisma from '@repo/db';

export async function getBackupHistoryController(req: Request, res: Response) {
    const userId = req.user?.id;
    const configId = req.params.configId as string;
    const since = req.query.since as string | undefined;

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

    if (!since) {
        const history = await prisma.backupHistory.findMany({
            where: {
                configId
            },
            orderBy: {
                createdAt: 'desc'
            },
            select:  {
                id: true,
                size: true,
                durationMs: true,
                status: true,
                createdAt: true,
            },
        });
        return res.status(200).json(history);
    }

    const TIMEOUT = 30000;
    const INTERVAL = 2000;
    const start = Date.now();

    async function check(): Promise<void> {
        const newHistory = await prisma.backupHistory.findMany({
            where: {
                configId,
                createdAt: {
                    gt: new Date(since!)
                },
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                size: true,
                durationMs: true,
                status: true,
                createdAt: true
            },
        });

        if (newHistory.length > 0) {
            res.status(200).json(newHistory);
            return;
        }

        if (Date.now() - start >= TIMEOUT) {
            res.status(200).json([]);
            return;
        }

        setTimeout(check, INTERVAL);
    }

    await check();
}