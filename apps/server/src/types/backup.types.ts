export type BackupType = 'mongo' | 'postgres';

export interface BackupInput {
    userId: string;
    type: BackupType;

    mongoUri?: string;
    mongoDbName?: string;

    pgUri?: string;
    pgDbName?: string;
}