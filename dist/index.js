"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const backup_1 = require("./backup");
const backup = new backup_1.backupDatabase;
backup.runBackup().catch((err) => {
    console.error("Unexpected error during backup: ", err);
});
