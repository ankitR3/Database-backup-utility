"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const node_cron_1 = __importDefault(require("node-cron"));
const backup_1 = require("./backup");
const config_1 = require("./config");
dotenv_1.default.config();
const userAuth_1 = __importDefault(require("./routes/userAuth"));
const adminAuth_1 = __importDefault(require("./routes/adminAuth"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const apiRoutes_1 = __importDefault(require("./routes/apiRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 1515;
let isBackupSchedulerRunning = false;
let backupInstance = null;
let scheduledTask = null;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const initializeSystem = async () => {
    try {
        console.log("MongoDB Backup Utility Starting...");
        const systemDbUri = process.env.SYSTEM_DB_URI || "mongodb+srv://ankit:OMgJsOfYE3e2R4HN@cluster0.xwvxfxn.mongodb.net/";
        await mongoose_1.default.connect(systemDbUri);
        console.log("Connected to system database");
        await initializeBackupSystem();
    }
    catch (error) {
        console.log("System initialization failed:", error);
        process.exit(1);
    }
};
const initializeBackupSystem = async () => {
    try {
        backupInstance = new backup_1.BackupService();
        console.log("Backup system initialized");
        return true;
    }
    catch (error) {
        console.error("Failed to initialize backup system:", error);
        return false;
    }
};
const startBackupScheduler = async () => {
    try {
        if (!backupInstance) {
            throw new Error("Backup system not initialized");
        }
        if (isBackupSchedulerRunning) {
            console.log("Backup scheduler is already running");
            return;
        }
        if (!node_cron_1.default.validate(config_1.config.schedule)) {
            throw new Error(`Invalid cron schedule: ${config_1.config.schedule}`);
        }
        console.log("Running initial backup...");
        await backupInstance.runBackup();
        console.log("Setting up backup scheduler...");
        scheduledTask = node_cron_1.default.schedule(config_1.config.schedule, async () => {
            try {
                console.log("Starting scheduled backup...");
                if (backupInstance) {
                    await backupInstance.runBackup();
                    console.log("Scheduled backup completed successfully");
                }
                else {
                    console.error("Backup instance is nul - cannot run scheduled backup");
                }
            }
            catch (err) {
                console.error("Scheduled backup failed:", err);
            }
        });
        isBackupSchedulerRunning = true;
        console.log("Backup scheduler is running...");
        console.log(`Backups will be stored in: ${config_1.config.backupDir}`);
        console.log(`Schedule: ${config_1.config.schedule}`);
    }
    catch (error) {
        console.error("Failed to start backup scheduler:", error);
        throw error;
    }
};
const stopBackupScheduler = () => {
    if (scheduledTask) {
        scheduledTask.destroy();
        scheduledTask = null;
    }
    isBackupSchedulerRunning = false;
    console.log("Backup scheduler stopped");
};
app.use("/api/auth", userAuth_1.default);
app.use("/api/auth", adminAuth_1.default);
app.use("/api", dashboard_1.default);
app.use("/api/user", apiRoutes_1.default);
app.get("/api/status/backup/status", (req, res) => {
    res.json({
        schedulerRunning: isBackupSchedulerRunning,
        initialized: backupInstance !== null,
        backupDirectory: config_1.config.backupDir,
        schedule: config_1.config.schedule,
        timestamp: new Date().toISOString()
    });
});
app.post("/api/system/backup/trigger", async (req, res) => {
    try {
        if (!backupInstance) {
            res.status(500).json({
                success: false,
                message: "Backup system not initialized"
            });
            return;
        }
        console.log("Manual backup triggered via API");
        await backupInstance.runBackup();
        res.json({
            success: true,
            message: "Backup completed successfully",
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error("Manual backup failed:", error);
        res.status(500).json({
            success: false,
            message: "Backup failed",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
app.post("/api/backup/start-scheduler", async (req, res) => {
    try {
        if (isBackupSchedulerRunning) {
            res.status(400).json({
                success: false,
                message: "Backup scheduler is already running"
            });
            return;
        }
        await startBackupScheduler();
        res.json({
            success: true,
            message: "Backup scheduler started successfully",
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to start backup scheduler",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
app.post("/api/backup/stop-scheduler", (req, res) => {
    try {
        stopBackupScheduler();
        res.json({
            success: true,
            message: "Backup scheduler stopped successfully",
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to stop backup scheduler",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
app.get("/health", (req, res) => {
    const mongoState = mongoose_1.default.connection.readyState;
    const mongoStatusMap = {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting"
    };
    const mongoStatus = mongoStatusMap[mongoState] || "unknown";
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        services: {
            database: {
                status: mongoStatus,
                connect: mongoState === 1
            },
            backup: {
                initialized: backupInstance !== null,
                schedulerRunning: isBackupSchedulerRunning,
                backupDirectory: config_1.config?.backupDir || "Not configured"
            }
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
    });
});
app.get("/maincheck", async (req, res) => {
    try {
        if (!backupInstance) {
            res.status(500).json({
                success: false,
                message: "Backup system not initialized"
            });
            return;
        }
        await backupInstance.runBackup();
        res.json({
            success: true,
            message: "Backup system check completed successfully",
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to run main check",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
const gracefulShutdown = async () => {
    console.log("\n Gracefully shutting down server...");
    try {
        stopBackupScheduler();
        await mongoose_1.default.connection.close();
        console.log("MongoDB connection closed");
        process.exit(0);
    }
    catch (error) {
        console.error("Error closing MongoDB connection:", error);
        process.exit(1);
    }
};
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});
const startServer = async () => {
    try {
        await initializeSystem();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Backup directory: ${config_1.config.backupDir}`);
            console.log(`Backup schedule: ${config_1.config.schedule}`);
            console.log("Use /api/backup/start-scheduler to start automated backups");
        });
    }
    catch (error) {
        console.log("Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map