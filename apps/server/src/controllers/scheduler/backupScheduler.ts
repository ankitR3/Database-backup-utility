import cron, { ScheduledTask } from 'node-cron';
import prisma from '@repo/db';
import { generateCron } from './cron.utils';
import { runBackup } from '../../services/backup/runBackup';

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
    console.log(`Cron created for ${config.id}: ${cronExpression}`);

    if (!cronExpression || !cron.validate(cronExpression)) return;

    if (tasks.has(config.id)) {
        tasks.get(config.id)?.stop();
        tasks.delete(config.id);
    }

    const task = cron.schedule(
        cronExpression,
        async () => {

            console.log(`Running backup for ${config.id} at ${new Date().toISOString()}`);

            try {

                const latestConfig = await prisma.backupConfig.findUnique({
                    where: {
                        id: config.id
                    }
                });

                if (!latestConfig || !latestConfig.enabled) {
                    console.log(`Backup skipped for ${config.id}`);
                    return;
                }

                if (latestConfig.isRunning) {
                    console.log(`Backup already running for ${config.id}`);
                    return;
                }

                await prisma.backupConfig.update({
                    where: {
                        id: config.id
                    },
                    data: {
                        isRunning: true
                    }
                });

                await runBackup(latestConfig);

                console.log(`Backup success for ${config.id}`);
            } catch (err) {
                console.log(`Backup failed for ${config.id}`, err);

                await prisma.backupConfig.update({
                    where: {
                        id: config.id
                    },
                    data: {
                        isRunning: false
                    }
                });
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