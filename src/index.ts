import cron from "node-cron";
import { config } from "./config";
import { backupDatabase } from "./backup";
import { log } from "./logger";

const backup = new backupDatabase

// Run initial backup immediately
backup.runBackup().catch((err) => {
    log.error("Backup failed. Check DB_URI, DB_NAME, or connectivity.");
    if (
        err.message.includes("DB_URI"),
        err.message.includes("DB_NAME"),
        err.message.includes("ENOENT")
    ) {
        process.exit(1);
    }
});

// schedule future backups
cron.schedule(config.schedule || "*/01 * * * *", () => {
    backup.runBackup().catch((err) => {
        console.error("Unexpected error during backup: ", err)
    });
})

console.log("📅 Backup scheduler is running...");


