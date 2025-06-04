import cron from "node-cron";
import { config } from "./config";
import { BackupDatabase } from "./backup";
import { log } from "./logger";

export async function main() {
    try {
        console.log("🔧 MongoDB Backup Utility Configuration");
        console.log("=====================================");

        await config.init();

        const isValid = await config.validateConnection();
        if (!isValid) {
            console.log("❌ Configuration cancelled by user");
            process.exit(0);
        }
        
        const backup = new BackupDatabase();

        // Run initial backup immediately
        console.log("🚀 Running initial backup...");
        await backup.runBackup();

        console.log("📅 Setting up backup scheduler...");

        if (!cron.validate(config.schedule)) {
            throw new Error(`Invalid cron schedule: ${config.schedule}`);
        }

        cron.schedule(config.schedule, async () => {
            try {
                log.info("🔄 Starting scheduled backup...");
                await backup.runBackup();
                log.success("✨ Scheduled backup completed successfully");
            } catch (err) {
                log.error("Scheduled backup failed:", err);
            }
        });

        console.log("📅 Backup scheduler is running...");
        console.log(`📍 Backups will be stored in: ${config.backupDir}`);

        process.on("SIGINT", () => {
            console.log('\n👋 Gracefully shutting down backup scheduler...');
            process.exit(0);
        });
    } catch (error) {
        console.error("❌ Failed to initialize backup utility:", error);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
    log.error("Uncaught Exception:", error);
    process.exit(1);
});

process.on("unhandledRejection", (reason: unknown, promise: any) => {
    log.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});

main();