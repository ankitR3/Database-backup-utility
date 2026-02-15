import prisma from '@repo/db';
import { mongoBackup } from './mongo.backup';
import { postgresBackup } from './postgres.backup';

export async function createBackup(configId: string, userId: string) {
    const config = await prisma.backupConfig.findFirst({
        where: {
            id: configId,
            userId,
            enabled: true,
        },
    })

    if (!config) {
        throw new Error('CONFIG_NOT_FOUND')
    }

    return createBackupFromConfig(config)
}

export async function createBackupFromConfig(config: any) {
    switch (config.type) {
        case 'mongo':
            return mongoBackup({
                userId: config.userId,
                type: 'mongo',
                mongoUri: config.mongoUri ?? undefined,
                mongoDbName: config.mongoDbName ?? undefined,
            })

        case 'postgres':
            return postgresBackup({
                userId: config.userId,
                type: 'postgres',
                pgUri: config.pgUri ?? undefined,
                pgDbName: config.pgDbName ?? undefined,
            })

        default:
            throw new Error('UNSUPPORTED_BACKUP_TYPE')
    }
}