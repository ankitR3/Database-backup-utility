import prisma from "@repo/db";
import { Request, Response } from "express";

export async function getBackupStatsController(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({
            message: 'Unauthorized'
        });
    }

    try {
        const configs = await prisma.backupConfig.findMany({
            where: {
                userId
            },
            select: {
                id: true
            },
        });

        const configIds = configs.map(c => c.id);

        const histories = await prisma.backupHistory.findMany({
            where: {
                configId: {
                    in: configIds
                },
            },
        });

        const totalBackups = histories.length;

        const totalStorage = histories.reduce((acc, h) => acc + h.size, 0);

        const lastBackup = histories.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

        return res.status(200).json({
            totalBackups,
            totalStorage,
            lastBackup,
        });

    } catch (err) {
        console.error('Backup stats Error: ', err);
        return res.status(500).json({
            message: 'Failed to fetch backup stats',
        });
    }
}