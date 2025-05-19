import { config } from "./config";
import { promises as fs } from "fs";
import { exec } from "child_process";
import { log } from "./logger";

export class backupDatabase {
    
    private getTimestamp(): string {
        const date = new Date();
        return date.toISOString().replace(/[:.]/g, '-');
    }

    private backupPath(dbName: string) {
        const timestamp = this.getTimestamp();
        return `${config.backupDir}/${dbName}-${timestamp}`;
    }

    private async backupDir(): Promise<void> {
        const dirPath = config.backupDir;
        console.log("dirPath is: ", dirPath);
        try {
            await fs.mkdir(dirPath, { recursive: true });
            log.success(`Directory created: ${dirPath}`)
        } catch (error) {
            log.error(`Failed to create: ${dirPath} - ${(error as Error).message}`);
        }
    }

    private backupCommand(): string {
        
        const {dbUri} = config;
        const {dbName} = config;

        const outDir = this.backupPath(dbName);

        const uri = `${dbUri}${dbName}`;

        const cmd = `mongodump --uri=${uri} --out=${outDir}`;
        return cmd;
    }

    public async runBackup(): Promise<void> {
        log.info(`Starting backup for ${config.dbName}...`);

        await this.backupDir();
        const cmd = this.backupCommand();

        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                log.error(`Backup failed: ${stderr}`);
            } else {
                log.success(`Backup successful: ${stdout}`);
            }
        });
    }
}

// i have created a timestamp for backup directory so if I create backup files didn't get mix
// in backupPath i have created a path where will be my backup will be stored....... the location.
// In backupDir if the folder hasn't created it will create the folder where the backup will store
// In backupCommand 
