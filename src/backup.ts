import { config } from "./config";
import { promises as fs } from "fs";
import { createWriteStream } from "fs";
import { exec } from "child_process";
import { log } from "./logger";
import archiver from "archiver";
import path from "path";

export class BackupDatabase {
    
    private getTimestamp(): string {
        const date = new Date();
        return date.toISOString().replace(/[:.]/g, '-');
    }

    private getBackupPath(dbName: string) {
        const timestamp = this.getTimestamp();
        const backupFolder = path.resolve(config.backupDir);
        const fullPath = path.join(backupFolder, `${dbName}-${timestamp}`);
        log.info(`📁 Full backup path resolved to: ${fullPath}`);
        return fullPath;
    }

    private async ensureBackupDirExists(dirPath?: string): Promise<void> {
        const targetDir = dirPath || config.backupDir;

        if (!targetDir) {
            log.error("Backup directory path is not defined");
            throw new Error("Backup directory path is not defined");
        }

        try {
            const exists = await fs.access(targetDir)
                        .then(() => true)
                        .catch(() => false);

            if(!exists) {
                await fs.mkdir(targetDir, { recursive: true });
                log.success(`Directory created: ${targetDir}`);
            }
        } catch (error) {
            log.error(`Failed to create: ${targetDir} - ${(error as Error).message}`);
            throw error;
        }
    }

    private backupCommand(outputPath: string): string {
        
        const {dbUri, dbName} = config;
        let cleanUri = dbUri.trim();

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
                log.success(`Compressed backup to: ${archivePath}`);
                resolve();
            });

            archive.on("error", (err) => {
                log.error(`Archive error: ${err.message}`);
                reject(err);
            });
            archive.pipe(output);
            archive.directory(source, false);
            archive.finalize();
        });
    }

    //  private async cleanupUncompressedBackup(backupDir: string): Promise<void> {
    //     try {
    //         await fs.rm(backupDir, { recursive: true, force: true });
    //         log.info(`Cleaned up uncompressed backup: ${backupDir}`);
    //     } catch (error) {
    //         log.error(`Failed to cleanup uncompressed backup: ${(error as Error).message}`);
    //     }
    // }

    public async runBackup(): Promise<void> {
        log.info(`Starting backup for ${config.dbName}...`);

        if (!config.dbUri || !config.dbName) {
            const error = new Error("DB_URI and DB_NAME must be configured");
            log.error(error.message);
            throw error;
        }

        try {
            await this.ensureBackupDirExists();
            const backupDir = this.getBackupPath(config.dbName);
            const cmd = this.backupCommand(backupDir);

            // log.info(`Running command: ${cmd}`);

            return new Promise((resolve, reject) => {
            exec(cmd, async (error, stdout, stderr) => {
                if (error) {
                    log.error(`Backup failed: ${stderr}`);
                    reject(error);
                    return;
                }

                try {
                    log.success(`Backup successful: ${backupDir}`);
                    await this.zipDir(backupDir);
                    // await this.cleanupUncompressedBackup(backupDir);
                    resolve();
                    } catch (zipError) {
                        log.error(`Compression failed: ${(zipError as Error).message}`);
                        reject(zipError);
                    }
                });
            });
        } catch (error) {
            log.error(`Backup process failed: ${(error as Error).message}`);
            throw error;
        }       
    }
}
