"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupDatabase = void 0;
const config_1 = require("./config");
const fs_1 = require("fs");
const child_process_1 = require("child_process");
const logger_1 = require("./logger");
class backupDatabase {
    getTimestamp() {
        const date = new Date();
        return date.toISOString().replace(/[:.]/g, '-');
    }
    backupPath(dbName) {
        const timestamp = this.getTimestamp();
        return `${config_1.config.backupDir}/${dbName}-${timestamp}`;
    }
    async backupDir() {
        const dirPath = config_1.config.backupDir;
        console.log("dirPath is: ", dirPath);
        try {
            await fs_1.promises.mkdir(dirPath, { recursive: true });
            logger_1.log.success(`Directory created: ${dirPath}`);
        }
        catch (error) {
            logger_1.log.error(`Failed to create: ${dirPath} - ${error.message}`);
        }
    }
    backupCommand() {
        const { dbUri } = config_1.config;
        const { dbName } = config_1.config;
        const outDir = this.backupPath(dbName);
        const uri = `${dbUri}${dbName}`;
        const cmd = `mongodump --uri=${uri} --out=${outDir}`;
        return cmd;
    }
    async runBackup() {
        logger_1.log.info(`Starting backup for ${config_1.config.dbName}...`);
        await this.backupDir();
        const cmd = this.backupCommand();
        (0, child_process_1.exec)(cmd, (error, stdout, stderr) => {
            if (error) {
                logger_1.log.error(`Backup failed: ${stderr}`);
            }
            else {
                logger_1.log.success(`Backup successful: ${stdout}`);
            }
        });
    }
}
exports.backupDatabase = backupDatabase;
