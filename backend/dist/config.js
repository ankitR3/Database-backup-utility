"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const inquirer_1 = __importDefault(require("inquirer"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
class BackupConfig {
    constructor() {
        this.dbUri = "";
        this.dbName = "";
        this.backupDir = process.env.BACKUP_DIR || "./backups";
        this.schedule = process.env.SCHEDULE || "*/30 * * * *";
        this.dbUri = process.env.DB_URI || "";
        this.dbName = process.env.DB_NAME || "";
    }
    async init() {
        if (!this.dbUri) {
            this.dbUri = await this.promptForMongoUri();
        }
        if (!this.dbName) {
            this.dbName = await this.promptForDbName();
        }
        await this.setBackupLocation();
    }
    async validateConnection() {
        let attempts = 3;
        while (attempts > 0) {
            try {
                await mongoose_1.default.connect(this.dbUri, { dbName: this.dbName });
                console.log("✅ Connected to MongoDB successfully.");
                await mongoose_1.default.disconnect();
                return true;
            }
            catch {
                console.log("❌ MongoDB connection failed.");
                const { retry } = await inquirer_1.default.prompt([
                    {
                        type: "confirm",
                        name: "retry",
                        message: "Retry entering connection details?",
                        default: true,
                    },
                ]);
                if (!retry)
                    return false;
                this.dbUri = await this.promptForMongoUri();
                this.dbName = await this.promptForDbName();
                attempts--;
            }
        }
        return false;
    }
    async promptForMongoUri() {
        const { uri } = await inquirer_1.default.prompt([
            {
                type: "input",
                name: "uri",
                message: "Enter your MongoDB connection URI:",
                validate: (input) => {
                    if (!input.trim()) {
                        return "MongoDB URI is required";
                    }
                    return input.startsWith("mongodb://") || input.startsWith("mongodb+srv://")
                        ? true
                        : "Invalid MongoDB URI. Must start with mongodb:// or mongodb+srv://";
                },
            },
        ]);
        return uri.trim();
    }
    async promptForDbName() {
        const { dbName } = await inquirer_1.default.prompt([
            {
                type: "input",
                name: "dbName",
                message: "Enter your database name:",
                validate: (input) => {
                    if (!input.trim()) {
                        return "Database name is required";
                    }
                    const invalidChars = /[\/\\. "$*<>:|?]/;
                    if (invalidChars.test(input)) {
                        return "Database name contains invalid characters";
                    }
                    return true;
                },
            },
        ]);
        return dbName.trim();
    }
    async promptForBackupLocation() {
        const answer = await inquirer_1.default.prompt([
            {
                type: "list",
                name: "locationChoice",
                message: "Where would you like to store your backups?",
                choices: [
                    { name: "Use default location (./backups)", value: "default" },
                    { name: "Use environment variable location", value: "env" },
                    { name: "Choose custom location", value: "custom" },
                    { name: "Browse and select folder", value: "browse" }
                ]
            }
        ]);
        switch (answer.locationChoice) {
            case "default":
                return "./backups";
            case "env":
                return path_1.default.resolve(this.backupDir);
            case "custom":
                const customAnswer = await inquirer_1.default.prompt([
                    {
                        type: "input",
                        name: "customPath",
                        message: "Enter the full path where you want to store backups:",
                        validate: async (input) => {
                            if (!input.trim()) {
                                return "Please enter a valid path";
                            }
                            try {
                                const absolutePath = path_1.default.resolve(input);
                                const parentDir = path_1.default.dirname(absolutePath);
                                await fs_1.promises.access(parentDir);
                                return true;
                            }
                            catch {
                                return "Invalid path or parent directory does not exist";
                            }
                        },
                    },
                ]);
                return path_1.default.resolve(customAnswer.customPath);
            case "browse":
                return await this.browseForFolder();
            default:
                return "./backups";
        }
    }
    async browseForFolder() {
        let currentPath = process.cwd();
        while (true) {
            try {
                const items = await fs_1.promises.readdir(currentPath, { withFileTypes: true });
                const directories = items
                    .filter(item => item.isDirectory())
                    .map(dir => dir.name)
                    .sort();
                const choices = [
                    { name: `📁 Use current directory: ${currentPath}`, value: "select" },
                    { name: `📁 ../ (Go up one level)`, value: ".." },
                    ...directories.map(dir => ({ name: `📁 ${dir}`, value: dir }))
                ];
                const answer = await inquirer_1.default.prompt([
                    {
                        type: "list",
                        name: "choice",
                        message: `Current directory: ${currentPath}`,
                        choices: choices,
                        pageSize: 15
                    }
                ]);
                if (answer.choice === "select") {
                    console.log(`📁 Browse selected directory: ${currentPath}`);
                    return currentPath;
                }
                else if (answer.choice === "..") {
                    currentPath = path_1.default.dirname(currentPath);
                }
                else {
                    currentPath = path_1.default.join(currentPath, answer.choice);
                }
            }
            catch (error) {
                throw new Error("Failed to select directory via browse");
            }
        }
    }
    async setBackupLocation() {
        const selected = await this.promptForBackupLocation();
        this.backupDir = path_1.default.resolve(selected);
        console.log(`Backup location set to: ${this.backupDir}`);
    }
}
exports.config = new BackupConfig();
//# sourceMappingURL=config.js.map