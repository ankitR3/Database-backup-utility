import cron, { ScheduledTask } from 'node-cron';
import prisma from '@repo/db';
import { createBackup } from '../../services/backup/backup.service';
import { generateCron } from './cron.utils';

const tasks = new Map<string, ScheduledTask>();

export async function startBackupScheduler() {
    console.log('Scheduler started...');

    const configs = await prisma.backupConfig.findMany({
        where: {
            enabled: true,
        }
    });

    for (const config of configs) {
        createTask(config);
    }

    console.log(`Loaded ${configs.length} scheduled backups`);
}

function createTask(config: any) {
    const cronExpression = generateCron(
        config.frequency,
        config.time,
        config.dayOfWeek
    );

    if (!cronExpression || !cron.validate(cronExpression)) return;

    if (tasks.has(config.id)) {
        tasks.get(config.id)?.stop();
    }

    const task = cron.schedule(
        cronExpression,
        async () => {
            console.log(`Running backup for ${config.id}`);

            try {
                await createBackup({
                    userId: config.userId,
                    type: config.type,
                    mongoUri: config.mongoUri ?? undefined,
                    mongoDbName: config.mongoDbName ?? undefined,
                    pgUri: config.pgUri ?? undefined,
                    pgDbName: config.pgDbName ?? undefined,
                });

                console.log(`Backup success for ${config.id}`);
            } catch (err) {
                console.log(`Backup failed for ${config.id}`, err);
            }
        },
        {
            timezone: 'Asia/Kolkata',
        }
    );

    tasks.set(config.id, task);
}

export function refreshTask(config: any) {
    createTask(config);
}

export function removeTask(id: string) {
    if (tasks.has(id)) {
        tasks.get(id)?.stop();
        tasks.delete(id);
    }
}