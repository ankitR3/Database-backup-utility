import { Request, Response } from 'express';
import prisma from '@repo/db';

export async function createBackupConfigController(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({
            message: 'Unauthorized'
        });
    }

    const { type, mongoUri, mongoDbName, pgUri, pgDbName } = req.body;

    if (!type) {
        return res.status(400).json({
            message: 'Backup type is required',
        });
    }

    if (type === 'mongo' && (!mongoUri || !mongoDbName)) {
        return res.status(400).json({
            message: 'Mongo config missing'
        });
    }

    if (type === 'postgres' && (!pgUri || !pgDbName)) {
        return res.status(400).json({
            message: 'Postgres config missing',
        });
    }

    const config = await prisma.backupConfig.create({
        data: {
            userId: String(userId),
            type,
            schedule: null,
            mongoUri,
            mongoDbName,
            pgUri,
            pgDbName,
        },
    });

    res.status(201).json({
        success: true,
        message: 'Backup config saved',
        config,
    });
}