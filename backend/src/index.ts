import cron from "node-cron";
import { config } from "./config";
import { BackupService } from "./backup";

export async function main() {
    try {
        console.log("MongoDB Backup Utility Configuration");
        console.log("=====================================");

        await config.init();

        const isValid = await config.validateConnection();
        if (!isValid) {
            console.log("Configuration cancelled by user");
            process.exit(0);
        }
        
        const backup = new BackupService();

        // Run initial backup immediately
        console.log("Running initial backup...");
        await backup.runBackup();

        if (!cron.validate(config.schedule)) {
            throw new Error(`Invalid cron schedule: ${config.schedule}`);
        }

        console.log("Setting up backup scheduler...");

        cron.schedule(config.schedule, async () => {
            try {
                console.log("Starting scheduled backup...");
                await backup.runBackup();
                console.log("Scheduled backup completed successfully");
            } catch (err) {
                console.error("Scheduled backup failed:", err);
            }
        });

        console.log("Backup scheduler is running...");
        console.log(`Backups will be stored in: ${config.backupDir}`);

        process.on("SIGINT", () => {
            console.log('\n Gracefully shutting down backup scheduler...');
            process.exit(0);
        });
    } catch (error) {
        console.error("Failed to initialize backup utility:", error);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    process.exit(1);
});

process.on("unhandledRejection", (reason: unknown, promise: any) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});

main();