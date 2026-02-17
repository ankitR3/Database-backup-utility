export interface BackupConfig {
    id: string
    type: 'mongo' | 'postgres'
    mongoUri?: string
    mongoDbName?: string
    pgUri?: string
    pgDbName?: string
}