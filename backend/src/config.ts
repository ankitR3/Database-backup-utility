import dotenv from "dotenv";
import inquirer from "inquirer";
import { promises as fs } from "fs";
import path from "path";

dotenv.config();

class BackupConfig {
    public dbUri: string = "";
    public dbName: string = "";
    public backupDir: string;
    public schedule: string;

    constructor() {
        this.backupDir = process.env.BACKUP_DIR || "./backups";
        this.schedule = process.env.SCHEDULE || "*/30 * * * *";
    }

    public async init(): Promise<void> {
        this.dbUri = await this.promptForMongoUri();
        this.dbName = await this.promptForDbName();
        await this.setBackupLocation();
    }

    public async promptForMongoUri(): Promise<string> {
        const { uri } = await inquirer.prompt([
            {
                type: "input",
                name: "uri",
                message: "Enter your MongoDB connection URI:",
                validate: (input: string) => {
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

    public async promptForDbName(): Promise<string> {
        const { dbName } = await inquirer.prompt([
            {
                type: "input",
                name: "dbName",
                message: "Enter your database name:",
                validate: (input: string) => {
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

    async promptForBackupLocation(): Promise<string> {
        const answer = await inquirer.prompt([
            {
                type: "list",
                name: "locationChoice",
                message: "Where would you like to store your backups?",
                choices: [
                    {name: "Use default location (./backups)", value: "default"},
                    {name: "Use environment variable location", value: "env"},
                    {name: "Choose custom location", value: "custom"},
                    {name: "Browse and select folder", value: "browse"}
                ]
            }
        ]);

        switch (answer.locationChoice) {
            case "default":
                return "./backups";

            case "env":
                return path.resolve(this.backupDir);

            case "custom":
                const customAnswer = await inquirer.prompt([
                    {
                        type: "input",
                        name: "customPath",
                        message: "Enter the full path where you want to store backups:",
                        validate: async (input: string) => {
                            if (!input.trim()) {
                                return "Please enter a valid path";
                            }

                            try {
                                const absolutePath = path.resolve(input);
                                // Check if parent directory exists
                                const parentDir = path.dirname(absolutePath);
                                await fs.access(parentDir);
                                return true;
                            } catch {
                                return "Invalid path or parent directory does not exist";
                            }
                        }
                    }
                ]);
                return path.resolve(customAnswer.customPath);

            case "browse":
                return await this.browseForFolder();

            default:
                return "./backups";
        }
    }

    private async browseForFolder(): Promise<string> {
        // Simple folder browse using inquirer
        let currentPath = process.cwd();

        while (true) {
            try {
                const items = await fs.readdir(currentPath, { withFileTypes: true});
                const directories = items
                .filter(item => item.isDirectory())
                .map(dir => dir.name)
                .sort();

                const choices = [
                    { name: `📁 Use current directory: ${currentPath}`, value: "select"},
                    { name: `📁 ../ (Go up one level)`, value: ".."},
                    ...directories.map(dir => ({ name: `📁 ${dir}`, value: dir}))
                ];

                const answer = await inquirer.prompt([
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
                } else if (answer.choice === "..") {
                    currentPath = path.dirname(currentPath);
                } else {
                    currentPath = path.join(currentPath, answer.choice);
                }
            } catch (error) {
                throw new Error("Failed to select directory via browse");
            }
        }
    }

    async setBackupLocation(): Promise<void> {
        const selected = await this.promptForBackupLocation();
        this.backupDir = path.resolve(selected);
        console.log(`✅ Backup location set to: ${this.backupDir}`);
    }

    public async validateConnection(): Promise<boolean> {
        if (!this.dbUri || !this.dbName) {
            console.log("❌ Missing MongoDB URI or database name");
            return false;
        }

        console.log(`🔗 MongoDB URI: ${this.dbUri}`);
        console.log(`📊 Database Name: ${this.dbName}`);
        console.log(`📁 Backup Directory: ${this.backupDir}`);

        const { proceed } = await inquirer.prompt([
            {
                type: "confirm",
                name: "proceed",
                message: "Do you want to proceed with these settings?",
                default: true,
            }
        ]);

        return proceed;
    }
}

export const config = new BackupConfig();