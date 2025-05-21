"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const config_1 = require("./config");
const backup_1 = require("./backup");
const logger_1 = require("./logger");
const backup = new backup_1.backupDatabase;
backup.runBackup().catch((err) => {
    logger_1.log.error("Backup failed. Check DB_URI, DB_NAME, or connectivity.");
    if (err.message.includes("DB_URI"),
        err.message.includes("DB_NAME"),
        err.message.includes("ENOENT")) {
        process.exit(1);
    }
});
node_cron_1.default.schedule(config_1.config.schedule || "*/01 * * * *", () => {
    backup.runBackup().catch((err) => {
        console.error("Unexpected error during backup: ", err);
    });
});
console.log("📅 Backup scheduler is running...");
