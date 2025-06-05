"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupService = void 0;
const config_1 = require("./config");
const fs_1 = require("fs");
const fs_2 = require("fs");
const child_process_1 = require("child_process");
const archiver_1 = __importDefault(require("archiver"));
const path_1 = __importDefault(require("path"));
const backupSchema_1 = require("./db/backupSchema");
class BackupService {
    getTimestamp() {
        const date = new Date();
        return date.toISOString().replace(/[:.]/g, '-');
    }
    getUserBackupDir(userUuid) {
        return path_1.default.join(config_1.config.backupDir, userUuid);
    }
    getBackupPath(dbName, userUuid) {
        const timestamp = this.getTimestamp();
        let backupFolder;
        if (userUuid) {
            backupFolder = this.getUserBackupDir(userUuid);
        }
        else {
            backupFolder = path_1.default.resolve(config_1.config.backupDir);
        }
        const fullPath = path_1.default.join(backupFolder, `${dbName}-${timestamp}`);
        console.log(`Full backup path resolved to: ${fullPath}`);
        return fullPath;
    }
    async ensureBackupDirExists(dirPath) {
        const targetDir = dirPath || config_1.config.backupDir;
        if (!targetDir) {
            throw new Error("Backup directory path is not defined");
        }
        try {
            const exists = await fs_1.promises.access(targetDir)
                .then(() => true)
                .catch(() => false);
            if (!exists) {
                await fs_1.promises.mkdir(targetDir, { recursive: true });
                console.log(`Directory created: ${targetDir}`);
            }
        }
        catch (error) {
            console.error(`Failed to create: ${targetDir} - ${error.message}`);
            throw error;
        }
    }
    backupCommand(outputPath, mongoUri, dbName) {
        let cleanUri = mongoUri.trim();
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
                console.log(`Compressed backup to: ${archivePath}`);
                resolve();
            });
            archive.on("error", (err) => {
                console.error(`Archive error: ${err.message}`);
                reject(err);
            });
            archive.pipe(output);
            archive.directory(source, false);
            archive.finalize();
        });
    }
    async cleanupUncompressedBackup(backupDir) {
        try {
            await fs_1.promises.rm(backupDir, { recursive: true, force: true });
            console.log(`Cleaned up uncompressed backup: ${backupDir}`);
        }
        catch (error) {
            console.error(`Failed to cleanup uncompressed backup: ${error.message}`);
        }
    }
    async getBackupSize(backupPath) {
        try {
            const zipPath = `${backupPath}.zip`;
            const stats = await fs_1.promises.stat(zipPath);
            return stats.size;
        }
        catch (error) {
            console.error(`Failed to get backup size: ${error.message}`);
            return 0;
        }
    }
    async runBackup() {
        console.log(`Starting backup for ${config_1.config.dbName}...`);
        if (!config_1.config.dbUri || !config_1.config.dbName) {
            throw new Error("DB_URI and DB_NAME must be configured");
        }
        try {
            await this.ensureBackupDirExists();
            const backupDir = this.getBackupPath(config_1.config.dbName);
            const cmd = this.backupCommand(backupDir, config_1.config.dbUri, config_1.config.dbName);
            return new Promise((resolve, reject) => {
                (0, child_process_1.exec)(cmd, async (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Backup failed: ${stderr}`);
                        reject(error);
                        return;
                    }
                    try {
                        console.log(`Backup successful: ${backupDir}`);
                        await this.zipDir(backupDir);
                        await this.cleanupUncompressedBackup(backupDir);
                        resolve();
                    }
                    catch (zipError) {
                        console.error(`Compression failed: ${zipError.message}`);
                        reject(zipError);
                    }
                });
            });
        }
        catch (error) {
            console.error(`Backup process failed: ${error.message}`);
            throw error;
        }
    }
    async runUserBackup(user) {
        console.log(`Starting backup for user: ${user.username} (${user.uuid})`);
        if (!user.mongoUri || !user.dbName) {
            throw new Error("User MongoDB URI and database name must be configured");
        }
        const backupRecord = new backupSchema_1.Backup({
            userId: user._id,
            userUuid: user.uuid,
            dbName: user.dbName,
            backupPath: "",
            status: "pending",
        });
        try {
            const userBackupDir = this.getUserBackupDir(user.uuid);
            await this.ensureBackupDirExists(userBackupDir);
            const backupDir = this.getBackupPath(user.dbName, user.uuid);
            const cmd = this.backupCommand(backupDir, user.mongoUri, user.dbName);
            backupRecord.backupPath = `${backupDir}.zip`;
            await backupRecord.save();
            return new Promise((resolve, reject) => {
                (0, child_process_1.exec)(cmd, async (error, stdout, stderr) => {
                    if (error) {
                        console.error(`User backup failed for ${user.username}: ${stderr}`);
                        backupRecord.status = 'failed';
                        backupRecord.errorMessage = stderr;
                        await backupRecord.save();
                        reject(error);
                        return;
                    }
                    try {
                        await this.zipDir(backupDir);
                        await this.cleanupUncompressedBackup(backupDir);
                        backupRecord.status = 'completed';
                        backupRecord.completedAt = new Date();
                        backupRecord.backupSize = await this.getBackupSize(backupDir);
                        await backupRecord.save();
                        resolve(backupRecord);
                    }
                    catch (zipError) {
                        console.error(`Compression failed for ${user.username}: ${zipError.message}`);
                        backupRecord.status = 'failed';
                        backupRecord.errorMessage = zipError.message;
                        await backupRecord.save();
                        reject(zipError);
                    }
                });
            });
        }
        catch (error) {
            console.error(`User backup process failed for ${user.username}: ${error.message}`);
            backupRecord.status = 'failed';
            backupRecord.errorMessage = error.message;
            await backupRecord.save();
            throw error;
        }
    }
    async getUserBackups(userUuid, limit = 10, offset = 0) {
        try {
            return await backupSchema_1.Backup.find({ userUuid })
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(offset)
                .exec();
        }
        catch (error) {
            console.error(`Failed to fetch user backups: ${error.message}`);
            throw error;
        }
    }
    async getBackupStats(userUuid) {
        try {
            const [totalBackups, completedBackups, failedBackups, totalSize] = await Promise.all([
                backupSchema_1.Backup.countDocuments({ userUuid }),
                backupSchema_1.Backup.countDocuments({ userUuid, status: 'completed' }),
                backupSchema_1.Backup.countDocuments({ userUuid, status: 'failed' }),
                backupSchema_1.Backup.aggregate([
                    { $match: { userUuid, status: 'completed' } },
                    { $group: { _id: null, totalSize: { $sum: '$backupSize' } } }
                ])
            ]);
            const lastBackup = await backupSchema_1.Backup.findOne({ userUuid })
                .sort({ createdAt: -1 })
                .exec();
            return {
                totalBackups,
                completedBackups,
                failedBackups,
                pendingBackups: totalBackups - completedBackups - failedBackups,
                totalSize: totalSize[0]?.totalSize || 0,
                lastBackup: lastBackup ? {
                    date: lastBackup.createdAt,
                    status: lastBackup.status,
                    size: lastBackup.backupSize
                } : null
            };
        }
        catch (error) {
            console.error(`Failed to fetch backup stats: ${error.message}`);
            throw error;
        }
    }
}
exports.BackupService = BackupService;
//# sourceMappingURL=backup.js.map