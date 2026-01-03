import { BackupInput } from '../../types/backup.types';
import { mongoBackup } from './mongo.backup';
import { postgresBackup } from './postgres.backup';

export async function createBackup(input: BackupInput) {
    switch (input.type) {
        case 'mongo':
            return mongoBackup(input);

        case 'postgres':
            return postgresBackup(input);

        default:
            throw new Error("UNSUPPORTED_BACKUP_TYPE");
    }
}