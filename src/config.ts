import dotenv from "dotenv";
dotenv.config();

export const config = {
    // dbType: process.env.DB_TYPE,
    // host: process.env.DB_HOST,
    // port: process.env.DB_PORT,
    // user: process.env.DB_USER,
    // password: process.env.DB_PASSWORD,
    dbUri: process.env.DB_URI,
    dbName: process.env.DB_NAME!,
    backupDir: process.env.BACKUP_DIR || `./backups`,
    schedule: process.env.SCHEDULE
}