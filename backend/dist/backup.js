"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupDatabase = void 0;
const config_1 = require("./config");
const fs_1 = require("fs");
const fs_2 = require("fs");
const child_process_1 = require("child_process");
const logger_1 = require("./logger");
const archiver_1 = __importDefault(require("archiver"));
const path_1 = __importDefault(require("path"));
class BackupDatabase {
    getTimestamp() {
        const date = new Date();
        return date.toISOString().replace(/[:.]/g, '-');
    }
    getBackupPath(dbName) {
        const timestamp = this.getTimestamp();
        const backupFolder = path_1.default.resolve(config_1.config.backupDir);
        const fullPath = path_1.default.join(backupFolder, `${dbName}-${timestamp}`);
        logger_1.log.info(`📁 Full backup path resolved to: ${fullPath}`);
        return fullPath;
    }
    async ensureBackupDirExists(dirPath) {
        const targetDir = dirPath || config_1.config.backupDir;
        if (!targetDir) {
            logger_1.log.error("Backup directory path is not defined");
            throw new Error("Backup directory path is not defined");
        }
        try {
            const exists = await fs_1.promises.access(targetDir)
                .then(() => true)
                .catch(() => false);
            if (!exists) {
                await fs_1.promises.mkdir(targetDir, { recursive: true });
                logger_1.log.success(`Directory created: ${targetDir}`);
            }
        }
        catch (error) {
            logger_1.log.error(`Failed to create: ${targetDir} - ${error.message}`);
            throw error;
        }
    }
    backupCommand(outputPath) {
        const { dbUri, dbName } = config_1.config;
        let cleanUri = dbUri.trim();
        if (cleanUri.endsWith("/")) {
            cleanUri = cleanUri.slice(0, -1);
        }
        const uri = `${cleanUri}/${dbName}`;
        return `mongodump --uri="${uri}" --out="${outputPath}"`;
    }
    async zipDir(source) {
        const archivePath = `${source}.zip`;
        const archiveDir = path_1.default.dirname(archivePath);
        await this.ensureBackupDirExists(archiveDir);
        return new Promise((resolve, reject) => {
            const output = (0, fs_2.createWriteStream)(archivePath);
            const archive = (0, archiver_1.default)("zip", { zlib: { level: 9 } });
            output.on("close", () => {
                logger_1.log.success(`Compressed backup to: ${archivePath}`);
                resolve();
            });
            archive.on("error", (err) => {
                logger_1.log.error(`Archive error: ${err.message}`);
                reject(err);
            });
            archive.pipe(output);
            archive.directory(source, false);
            archive.finalize();
        });
    }
    async runBackup() {
        logger_1.log.info(`Starting backup for ${config_1.config.dbName}...`);
        if (!config_1.config.dbUri || !config_1.config.dbName) {
            const error = new Error("DB_URI and DB_NAME must be configured");
            logger_1.log.error(error.message);
            throw error;
        }
        try {
            await this.ensureBackupDirExists();
            const backupDir = this.getBackupPath(config_1.config.dbName);
            const cmd = this.backupCommand(backupDir);
            return new Promise((resolve, reject) => {
                (0, child_process_1.exec)(cmd, async (error, stdout, stderr) => {
                    if (error) {
                        logger_1.log.error(`Backup failed: ${stderr}`);
                        reject(error);
                        return;
                    }
                    try {
                        logger_1.log.success(`Backup successful: ${backupDir}`);
                        await this.zipDir(backupDir);
                        resolve();
                    }
                    catch (zipError) {
                        logger_1.log.error(`Compression failed: ${zipError.message}`);
                        reject(zipError);
                    }
                });
            });
        }
        catch (error) {
            logger_1.log.error(`Backup process failed: ${error.message}`);
            throw error;
        }
    }
}
exports.BackupDatabase = BackupDatabase;
//# sourceMappingURL=backup.js.map