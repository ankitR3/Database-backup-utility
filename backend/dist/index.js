"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const node_cron_1 = __importDefault(require("node-cron"));
const config_1 = require("./config");
const backup_1 = require("./backup");
async function main() {
    try {
        console.log("MongoDB Backup Utility Configuration");
        console.log("=====================================");
        await config_1.config.init();
        const isValid = await config_1.config.validateConnection();
        if (!isValid) {
            console.log("Configuration cancelled by user");
            process.exit(0);
        }
        const backup = new backup_1.BackupService();
        console.log("Running initial backup...");
        await backup.runBackup();
        if (!node_cron_1.default.validate(config_1.config.schedule)) {
            throw new Error(`Invalid cron schedule: ${config_1.config.schedule}`);
        }
        console.log("Setting up backup scheduler...");
        node_cron_1.default.schedule(config_1.config.schedule, async () => {
            try {
                console.log("Starting scheduled backup...");
                await backup.runBackup();
                console.log("Scheduled backup completed successfully");
            }
            catch (err) {
                console.error("Scheduled backup failed:", err);
            }
        });
        console.log("Backup scheduler is running...");
        console.log(`Backups will be stored in: ${config_1.config.backupDir}`);
        process.on("SIGINT", () => {
            console.log('\n Gracefully shutting down backup scheduler...');
            process.exit(0);
        });
    }
    catch (error) {
        console.error("Failed to initialize backup utility:", error);
        process.exit(1);
    }
}
process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});
main();
//# sourceMappingURL=index.js.map