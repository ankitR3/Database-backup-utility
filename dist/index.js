"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const config_1 = require("./config");
const backup_1 = require("./backup");
const logger_1 = require("./logger");
async function main() {
    try {
        await config_1.config.setBackupLocation();
        console.log("🔍 Active backup directory:", config_1.config.backupDir);
        const backup = new backup_1.BackupDatabase();
        console.log("🚀 Running initial backup...");
        await backup.runBackup();
        console.log("📅 Setting up backup scheduler...");
        if (!node_cron_1.default.validate(config_1.config.schedule)) {
            throw new Error(`Invalid cron schedule: ${config_1.config.schedule}`);
        }
        node_cron_1.default.schedule(config_1.config.schedule, async () => {
            try {
                logger_1.log.info("🔄 Starting scheduled backup...");
                await backup.runBackup();
                logger_1.log.success("✨ Scheduled backup completed successfully");
            }
            catch (err) {
                logger_1.log.error("Scheduled backup failed:", err);
            }
        });
        console.log("📅 Backup scheduler is running...");
        console.log(`📍 Backups will be stored in: ${config_1.config.backupDir}`);
        console.log(`⏰ Schedule: ${config_1.config.schedule}`);
        console.log("🎯 Press Ctrl+C to stop the scheduler");
        process.on("SIGINT", () => {
            console.log('\n👋 Gracefully shutting down backup scheduler...');
            process.exit(0);
        });
    }
    catch (error) {
        console.error("❌ Failed to initialize backup utility:", error);
        process.exit(1);
    }
}
process.on("uncaughtException", (error) => {
    logger_1.log.error("Uncaught Exception:", error);
    process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
    logger_1.log.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});
main();
