import fs from 'fs';
import prisma from '@repo/db';
import { createBackupFromConfig } from './backup.service';
import { notifyBackupComplete } from '../../socket/socket';

export async function runBackup(config: any) {
    const startTime = Date.now();

    try {
        const result = await createBackupFromConfig(config);

        const fileBuffer = fs.readFileSync(result.filePath);
        const fileSize = fileBuffer.length;

        const duration = Date.now() - startTime;

        await prisma.backupHistory.create({
            data: {
                configId: config.id,
                fileData: fileBuffer,
                size: fileSize,
                durationMs: duration,
                status: 'success',
            },
        });

        fs.unlinkSync(result.filePath);

        await prisma.backupConfig.update({
            where: {
                id: config.id
            },
            data: {
                isRunning: false,
                lastRunAt: new Date(),
            },
        });

        notifyBackupComplete(config.id);

    } catch (err: any) {
        await prisma.backupHistory.create({
            data: {
                configId: config.id,
                fileData: null,
                size: 0,
                durationMs: 0,
                status: 'failed',
                errorMessage: err.Message || 'Unknown error'
            },
        });

        await prisma.backupConfig.update({
            where: {
                id: config.id
            },
            data: {
                isRunning: false
            },
        });

        throw err;
    }
}