"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupDatabase = void 0;
const config_1 = require("./config");
const fs_1 = require("fs");
const fs_2 = require("fs");
const child_process_1 = require("child_process");
const logger_1 = require("./logger");
const archiver_1 = __importDefault(require("archiver"));
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
        try {
            const exists = await fs_1.promises.access(dirPath)
                .then(() => true)
                .catch(() => false);
            if (!exists) {
                await fs_1.promises.mkdir(dirPath, { recursive: true });
                logger_1.log.success(`Directory created: ${dirPath}`);
            }
        }
        catch (error) {
            logger_1.log.error(`Failed to create: ${dirPath} - ${error.message}`);
        }
    }
    backupCommand(path) {
        const { dbUri, dbName } = config_1.config;
        const uri = `${dbUri}${dbName}`;
        return `mongodump --uri=${uri} --out=${path}`;
    }
    async zipDir(source) {
        const archivePath = `${source}.zip`;
        const output = (0, fs_2.createWriteStream)(archivePath);
        const archive = (0, archiver_1.default)("zip", { zlib: { level: 9 } });
        archive.pipe(output);
        archive.directory(source, false);
        await archive.finalize();
        logger_1.log.success(`Compressed backup to: ${archivePath}`);
    }
    async runBackup() {
        logger_1.log.info(`Starting backup for ${config_1.config.dbName}...`);
        await this.backupDir();
        const backupDir = this.backupPath(config_1.config.dbName);
        const cmd = this.backupCommand(backupDir);
        return new Promise((resolve, reject) => {
            (0, child_process_1.exec)(cmd, async (error, stdout, stderr) => {
                if (error) {
                    logger_1.log.error(`Backup failed: ${stderr}`);
                    reject(error);
                }
                else {
                    logger_1.log.success(`Backup successful: ${stdout}`);
                    try {
                        await this.zipDir(backupDir);
                        resolve();
                    }
                    catch (zipError) {
                        logger_1.log.error(`Compression failed: ${zipError.message}`);
                        reject(zipError);
                    }
                }
            });
        });
    }
}
exports.backupDatabase = backupDatabase;
