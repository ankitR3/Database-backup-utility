import cron from 'node-cron';
import { prisma } from '@repo/db';
import { createBackup } from '../../services/backup/backupService';

export async function startBackupScheduler() {
    const backupConfigs = await prisma.backupConfig.findMany({
        where: {
            schedule: { not: null },
        },
    });

    for (const config of backupConfigs) {
        cron.schedule(config.schedule!, async () => {
            try {
                await createBackup({
                    userId: config.userId,
                    type: config.type,
                    mongoUri: config.mongoUri ?? undefined,
                    mongoDbName: config.mongoDbName ?? undefined,
                    pgUri: config.pgUri ?? undefined,
                    pgDbName: config.pgDbName ?? undefined,
                });

                console.log(`Scheduled backup success for user ${config.userId}`);
            } catch (err) {
                console.error(`Scheduled backup failed for user ${config.userId}`);
            }
        });
    }
}