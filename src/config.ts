import dotenv from "dotenv";
dotenv.config();

export const config = {
    dbUri: process.env.DB_URI,
    dbName: process.env.DB_NAME!,
    backupDir: process.env.BACKUP_DIR || `./backups`,
    schedule: process.env.SCHEDULE
}