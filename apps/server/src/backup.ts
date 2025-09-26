import { config } from "./config";
import { promises as fs } from "fs";
import { createWriteStream } from "fs";
import { exec } from "child_process";
import archiver from "archiver";
import path from "path";
import { UserType } from "./db/userSchema";
import { Backup, BackupType } from "./db/backupSchema";

export class BackupService {
    
    private getTimestamp(): string {
        const date = new Date();
        return date.toISOString().replace(/[:.]/g, '-');
    }

    private getUserBackupDir(userUuid: string): string {
        return path.join(config.backupDir, userUuid);
    }

    private getBackupPath(dbName: string, userUuid?: string) {
        const timestamp = this.getTimestamp();
        let backupFolder: string;
        
        if (userUuid) {
            backupFolder = this.getUserBackupDir(userUuid);
        } else {
            backupFolder = path.resolve(config.backupDir);
        }
        
        const fullPath = path.join(backupFolder, `${dbName}-${timestamp}`);
        console.log(`Full backup path resolved to: ${fullPath}`);
        return fullPath;
    }

    private async ensureBackupDirExists(dirPath?: string): Promise<void> {
        const targetDir = dirPath || config.backupDir;

        if (!targetDir) {
            throw new Error("Backup directory path is not defined");
        }

        try {
            const exists = await fs.access(targetDir)
                        .then(() => true)
                        .catch(() => false);

            if(!exists) {
                await fs.mkdir(targetDir, { recursive: true });
                console.log(`Directory created: ${targetDir}`);
            }
        } catch (error) {
            console.error(`Failed to create: ${targetDir} - ${(error as Error).message}`);
            throw error;
        }
    }

    private backupCommand(outputPath: string, mongoUri: string, dbName: string): string {
        let cleanUri = mongoUri.trim();

        if (cleanUri.endsWith("/")) {
            cleanUri = cleanUri.slice(0, -1);
        }

        const uri = `${cleanUri}/${dbName}`;
        return `mongodump --uri="${uri}" --out="${outputPath}"`;
    }

    private async zipDir(source: string): Promise<void> {
        const archivePath = `${source}.zip`;
        const archiveDir = path.dirname(archivePath);

        await this.ensureBackupDirExists(archiveDir);

        return new Promise((resolve, reject) => {
            const output = createWriteStream(archivePath);
            const archive = archiver("zip", {zlib: { level: 9 }});

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

     private async cleanupUncompressedBackup(backupDir: string): Promise<void> {
        try {
            await fs.rm(backupDir, { recursive: true, force: true });
            console.log(`Cleaned up uncompressed backup: ${backupDir}`);
        } catch (error) {
            console.error(`Failed to cleanup uncompressed backup: ${(error as Error).message}`);
        }
    }

    private async getBackupSize(backupPath: string): Promise<number> {
        try {
            const zipPath = `${backupPath}.zip`;
            const stats = await fs.stat(zipPath);
            return stats.size;
        } catch (error) {
            console.error(`Failed to get backup size: ${(error as Error).message}`);
            return 0;
        }
    }

    public async runBackup(): Promise<void> {
        console.log(`Starting backup for ${config.dbName}...`);

        if (!config.dbUri || !config.dbName) {
            throw new Error("DB_URI and DB_NAME must be configured");
        }

        try {
            await this.ensureBackupDirExists();
            const backupDir = this.getBackupPath(config.dbName);
            const cmd = this.backupCommand(backupDir, config.dbUri, config.dbName);

            return new Promise((resolve, reject) => {
            exec(cmd, async (error, stdout, stderr) => {
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
                    } catch (zipError) {
                        console.error(`Compression failed: ${(zipError as Error).message}`);
                        reject(zipError);
                    }
                });
            });
        } catch (error) {
            console.error(`Backup process failed: ${(error as Error).message}`);
            throw error;
        }       
    }

    public async runUserBackup(user: UserType): Promise<BackupType> {
        console.log(`Starting backup for user: ${user.username} (${user.uuid})`);

        if (!user.mongoUri || !user.dbName) {
            throw new Error("User MongoDB URI and database name must be configured");
        }

        // Create backup record
        const backupRecord = new Backup({
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
                exec(cmd, async (error, stdout, stderr) => {
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
                        
                        // Update backup record
                        backupRecord.status = 'completed';
                        backupRecord.completedAt = new Date();
                        backupRecord.backupSize = await this.getBackupSize(backupDir);
                        await backupRecord.save();
                        resolve(backupRecord);
                    } catch (zipError) {
                        console.error(`Compression failed for ${user.username}: ${(zipError as Error).message}`);
                        backupRecord.status = 'failed';
                        backupRecord.errorMessage = (zipError as Error).message;
                        await backupRecord.save();
                        reject(zipError);
                    }
                });
            });
        } catch (error) {
            console.error(`User backup process failed for ${user.username}: ${(error as Error).message}`);
            backupRecord.status = 'failed';
            backupRecord.errorMessage = (error as Error).message;
            await backupRecord.save();
            throw error;
        }
    }

    // Get user backups with pagination
    public async getUserBackups(userUuid: string, limit: number = 10, offset: number = 0): Promise<BackupType[]> {
        try {
            return await Backup.find({ userUuid })
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(offset)
                .exec();
        } catch (error) {
            console.error(`Failed to fetch user backups: ${(error as Error).message}`);
            throw error;
        }
    }

    // Get backup statistics for user
    public async getBackupStats(userUuid: string) {
        try {
            const [totalBackups, completedBackups, failedBackups, totalSize] = await Promise.all([
                Backup.countDocuments({ userUuid }),
                Backup.countDocuments({ userUuid, status: 'completed' }),
                Backup.countDocuments({ userUuid, status: 'failed' }),
                Backup.aggregate([
                    { $match: { userUuid, status: 'completed' } },
                    { $group: { _id: null, totalSize: { $sum: '$backupSize' } } }
                ])
            ]);

            const lastBackup = await Backup.findOne({ userUuid })
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
        } catch (error) {
            console.error(`Failed to fetch backup stats: ${(error as Error).message}`);
            throw error;
        }
    }
}