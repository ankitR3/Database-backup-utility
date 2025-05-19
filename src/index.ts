import { backupDatabase } from "./backup";

const backup = new backupDatabase

backup.runBackup().catch((err) => {
    console.error("Unexpected error during backup: ", err)
});