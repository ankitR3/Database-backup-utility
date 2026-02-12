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

        const { type, mongoUri, mongoDbName, pgUri, pgDbName } = req.body;

        if (!['mongo', 'postgres'].includes(type)) {
            return res.status(400).json({
                message: 'Invalid backup type'
            });
        }

        const input: BackupInput = {
            userId: String(userId),
            type,
            mongoUri,
            mongoDbName,
            pgUri,
            pgDbName
        };

        const result = await createBackup(input);

        res.status(201).json({
            success: true,
            message: 'Backup created successfully',
            backup: result,
        });
    } catch (err: any) {
        if (err.message === 'MONGO_CONFIG_MISSING') {
            return res.status(400).json({
                message: 'Mongo config missing'
            });
        }

        if (err.message === 'POSTGRES_CONFIG_MISSING') {
            return res.status(400).json({
                message: 'Postgres config missing'
            });
        }

        if (err.message === 'PG_DUMP_PATH_ERROR') {
            return res.status(500).json({
                message: 'pg_dump not configured on server'
            });
        }

        res.status(500).json({
            message: 'Backup failed'
        });
    }
}