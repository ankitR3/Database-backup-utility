import { config } from "./config";
import { promises as fs } from "fs";
import { createWriteStream } from "fs";
import { exec } from "child_process";
import { log } from "./logger";
import archiver from "archiver";

export class backupDatabase {
    
    private getTimestamp(): string {
        const date = new Date();
        return date.toISOString().replace(/[:.]/g, '-'); // rqbdouqebfjvbeQCBPIQNCKQ
    }

    private backupPath(dbName: string) {
        const timestamp = this.getTimestamp();
        return `${config.backupDir}/${dbName}-${timestamp}`;
    }

    private async backupDir(): Promise<void> {
        const dirPath = config.backupDir;
        try {
            const exists = await fs.access(dirPath)
                        .then(() => true)
                        .catch(() => false);

            if(!exists) {
                await fs.mkdir(dirPath, { recursive: true });
                log.success(`Directory created: ${dirPath}`);
            }
        } catch (error) {
            log.error(`Failed to create: ${dirPath} - ${(error as Error).message}`);
        }
    }

    private backupCommand(path: string): string {
        
        const {dbUri, dbName} = config;

        const uri = `${dbUri}${dbName}`;

        return `mongodump --uri=${uri} --out=${path}`;
    }

    private async zipDir(source: string): Promise<void> {
        const archivePath = `${source}.zip`;

        const output = createWriteStream(archivePath);
        const archive = archiver("zip", {zlib: { level: 9 }});
        archive.pipe(output);
        archive.directory(source, false);
        await archive.finalize();
        log.success(`Compressed backup to: ${archivePath}`);
    }

    public async runBackup(): Promise<void> {
        log.info(`Starting backup for ${config.dbName}...`);

        await this.backupDir();
        const backupDir = this.backupPath(config.dbName);
        const cmd = this.backupCommand(backupDir);

        return new Promise((resolve, reject) => {
            exec(cmd, async (error, stdout, stderr) => {
                if (error) {
                    log.error(`Backup failed: ${stderr}`);
                    reject(error);
                } else {
                    log.success(`Backup successful: ${stdout}`);

                    try {
                        // await this.zipDir(this.backupPath(config.dbName));
                        await this.zipDir(backupDir);
                        resolve();
                    } catch (zipError) {
                        log.error(`Compression failed: ${(zipError as Error).message}`);
                        reject(zipError);
                    }
                }
            });
        })
    }
}
