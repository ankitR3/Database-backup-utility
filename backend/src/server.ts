import express, { Request, Response} from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cron, { ScheduledTask } from "node-cron";
import { validateEnv } from "./utils/validateEnv";
import { BackupDatabase } from "./backup";
import { config } from "./config";
import { log } from "./logger";

dotenv.config();
validateEnv();

import userSigninRouter from "./routes/userSignin";
import userSignupRouter from "./routes/userSignup";
import userSignoutRouter from "./routes/userSignout";
import dashboardRouter from "./routes/dashboard";
import adminSigninRouter from "./routes/adminSignin";
import adminSignoutRouter from "./routes/adminSignout";

const app = express();
const PORT = process.env.PORT || 3000;

// Backup system state
let isBackupSchedulerRunning = false;
let backupInstance: BackupDatabase | null = null;
let scheduledTask: ScheduledTask | null = null;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection 
mongoose.connect(process.env.DB_URI + process.env.DB_NAME)
    .then(() => {
        console.log("✅ Connected to MongoDB");
        initializeBackupSystem();
    })
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
    });

    const initializeBackupSystem = async (): Promise<boolean> => {
        try {
            await config.setBackupLocation();
            backupInstance = new BackupDatabase();
            console.log("✅ Backup system initialized");
            return true;
        } catch (error) {
            console.error("❌ Failed to initialize backup system:", error);
            return false;
        }
    };

    // Backup scheduler function (extracted from main)
const startBackupScheduler = async (): Promise<void> => {
    try {
        if (!backupInstance) {
            throw new Error("Backup system not initialized");
        }

        if (isBackupSchedulerRunning) {
            console.log("⚠️ Backup scheduler is already running");
            return;
        }

        // Validate cron schedule
        if (!cron.validate(config.schedule)) {
            throw new Error(`Invalid cron schedule: ${config.schedule}`);
        }

        // Run initial backup
        console.log("🚀 Running initial backup...");
        await backupInstance.runBackup();

        // Set up scheduled backups
        console.log("📅 Setting up backup scheduler...");
        scheduledTask = cron.schedule(config.schedule, async () => {
            try {
                log.info("🔄 Starting scheduled backup...");
                
                if (backupInstance) {
                    await backupInstance.runBackup();
                    log.info("✨ Scheduled backup completed successfully");
                } else {
                    log.error("Backup instance is nul - cannot run scheduled backup");
                }
            } catch (err) {
                log.error("Scheduled backup failed:", err);
            }
        });

        isBackupSchedulerRunning = true;
        console.log("📅 Backup scheduler is running...");
        console.log(`📍 Backups will be stored in: ${config.backupDir}`);
        console.log(`⏰ Schedule: ${config.schedule}`);

    } catch (error) {
        console.error("❌ Failed to start backup scheduler:", error);
        throw error;
    }
};

const stopBackupScheduler = (): void => {
    if (scheduledTask) {
        scheduledTask.destroy();
        scheduledTask = null;
    }
    isBackupSchedulerRunning = false;
    console.log("📅 Backup scheduler stopped");
};


    // Routes
    app.use("/api/auth", userSigninRouter);
    app.use("/api/auth", userSignupRouter);
    app.use("/api/auth", userSignoutRouter);
    app.use("/api/auth", adminSigninRouter);
    app.use("/api/auth", adminSignoutRouter);
    app.use("/api", dashboardRouter);

    // New backup API routes
    app.get("/api/backup/status", (req: Request, res: Response): void => {
        res.json({
            schedulerRunning: isBackupSchedulerRunning,
            initialized: backupInstance !== null,
            backupDirectory: config.backupDir,
            schedule: config.schedule,
            timestamp: new Date().toISOString()
        });
    });

    app.post("/api/backup/trigger", async (req: Request, res: Response): Promise<void> => {
        try {
            if (!backupInstance) {
            res.status(500).json({
                success: false,
                message: "Backup system not initialized"
            });
            return;
        }

            log.info("🔄 Manual backup triggered via API");
            await backupInstance.runBackup();

            res.json({
                success: true,
                message: "Backup completed successfully",
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            log.error("Manual backup failed:", error);
            res.status(500).json({
                success: false,
                message: "Backup failed",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    });

    // Start backup scheduler (your main function)
    app.post("/api/backup/start-scheduler", async (req: Request, res: Response): Promise<void> => {
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
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to start backup scheduler",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    });

    app.post("/api/backup/stop-scheduler", (req: Request, res: Response): void => {
        try {

            stopBackupScheduler();
            res.json({
            success: true,
            message: "Backup scheduler stopped successfully",
            timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to stop backup scheduler",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    });

    // Health check
    app.get("/health", (req: Request, res: Response): void => {
        const mongoState = mongoose.connection.readyState;
        const mongoStatusMap: { [key: number]: string } = {
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
                    backupDirectory: config?.backupDir || "Not configured"
                }
            },
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.version
        });
    });

    app.get("/maincheck", async (req: Request, res: Response) => {
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
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to run main check",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    });

    // Graceful shutdown
    const gracefulShutdown = async (): Promise<void> => {
        console.log("\n👋 Gracefully shutting down server...");

        try {

            stopBackupScheduler();

            await mongoose.connection.close();
            console.log("📦 MongoDB connection closed"); 
            process.exit(0);
        } catch (error) {
            console.error("❌ Error closing MongoDB connection:", error);
            process.exit(1);
        }
    };

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);

    // Error handling
    process.on("uncaughtException", (error) => {
        log.error("Uncaught Exception:", error);
        process.exit(1);
    });

    process.on("unhandledRejection", (reason: unknown, promise: Promise<any>) => {
        log.error("Unhandled Rejection at:", promise, "reason:", reason);
        process.exit(1);
    });

    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📊 Backup directory: ${config.backupDir}`);
        console.log(`⏰ Backup schedule: ${config.schedule}`);
        console.log("💡 Use /api/backup/start-scheduler to start automated backups");
    });


    export default app;