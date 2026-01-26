import cron from 'node-cron';
import { prisma } from '@repo/db';
import { createBackup } from '../../services/backup/backupService';

type ScheduledTask = ReturnType<typeof cron.schedule>;

const jobs = new Map<string, ScheduledTask>();

export async function syncBackupScheduler() {
    const configs = await prisma.backupConfig.findMany({
        where: { schedule: { not: null }},
    });

    const liveIds = new Set(configs.map((c) => c.id));

    for (const config of configs) {
        if (jobs.has(config.id)) {
            continue;
        }

        const task = cron.schedule(
            config.schedule!,
            async () => {
                try {
                    await createBackup({
                        userId: config.userId,
                        type: config.type,
                        mongoUri: config.mongoUri ?? undefined,
                        mongoDbName: config.mongoDbName ?? undefined,
                        pgUri: config.pgUri ?? undefined,
                        pgDbName: config.pgDbName ?? undefined,
                    });
                    console.log(`Backup success: config=${config.id}`);
                } catch (err) {
                    console.log(`Backup failed: config=${config.id}`), err;
                }
            },
            {
                timezone: 'Asia/Kolkata'
            }
        );

        jobs.set(config.id, task);
        console.log(`Scheduled: config=${config.id}`);
    }

    for(const [id, task] of jobs.entries()) {
        if (!liveIds.has(id)) {
            task.stop();
            task.destroy();
            jobs.delete(id);
            console.log(`Removed: config=${id}`);
        }
    }
}

export function startBackupScheduler() {
    syncBackupScheduler().catch(console.error);
    cron.schedule(
        '*/1 * * * *',
        () => syncBackupScheduler().catch(console.error),
        {
            timezone: 'Asia/Kolkata'
        }
    );
    console.log('Backup scheduler started (sync every 1 minute)');
}