import express, {Request, Response} from "express";
import { v4 as uuidv4 } from 'uuid';
import cron, {ScheduledTask} from "node-cron";
import { User } from "../db/userSchema";
import { BackupService } from "../backup";
import { apiMiddleware } from "../middleware/apiMiddleware";

const router = express.Router();

const backupService = new BackupService();
const userScheduledTasks = new Map<string, ScheduledTask>();

router.post("/configure", apiMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user!;
        const { mongoUri, dbName, schedule } = req.body;

        // Validate required fields
        if (!mongoUri || !dbName) {
            res.status(400).json({
                success: false,
                message: "MongoDB URI and database name are required"
            });
            return;
        }

        // Validate MongoDB URI format
        if (!mongoUri.startsWith("mongodb://") && !mongoUri.startsWith("mongodb+srv://")) {
            res.status(400).json({
                success: false,
                message: "Invalid MongoDB URI format. Must start with mongodb:// or mongodb+srv://"
            });
            return;
        }

        const invalidChars = /[\/\\. "$*<>:|?]/;
        if (invalidChars.test(dbName)) {
            res.status(400).json({
                success: false,
                message: "Database name contains invalid characters"
            });
            return;
        }

        // Validate cron schedule if provided
        if (schedule && !cron.validate(schedule)) {
            res.status(400).json({
                success: false,
                message: "Invalid cron schedule format"
            });
            return;
        }

        // Update user configuration
        user.mongoUri = mongoUri;
        user.dbName = dbName;
        if (schedule) user.schedule = schedule;
        await user.save();

        res.json({
            success: true,
            message: "Backup configuration updated successfully",
            data: {
                mongoUri: user.mongoUri,
                dbName: user.dbName,
                schedule: user.schedule
            }
        });
    } catch (error) {
        console.error("Failed to update configuration:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update configuration",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

router.post("/start-scheduler", apiMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user!;

        if (!user.mongoUri || !user.dbName) {
            res.status(400).json({
                success: false,
                message: "Please configure MongoDB URI and database name first using /api/configure"
            });
            return;
        }

        if (userScheduledTasks.has(user.uuid)) {
            res.status(400).json({
                success: false,
                message: "Backup scheduler is already running for this user"
            });
            return;
        }

        // Validate schedule
        if (!user.schedule || !cron.validate(user.schedule)) {
            res.status(400).json({
                success: false,
                message: "Invalid or missing cron schedule. Please configure first."
            });
            return;
        }

        // Create scheduled task
        const scheduledTask = cron.schedule(user.schedule, async () => {
            try {
                console.log(`Starting scheduled backup for user: ${user.username} (${user.uuid})`);
                await backupService.runUserBackup(user);
                console.log(`Scheduled backup completed for user: ${user.username}`);
            } catch (error) {
                console.error(`Scheduled backup failed for user ${user.username}:`, error);
            }
        });

        userScheduledTasks.set(user.uuid, scheduledTask);

        try {
            console.log(`Running initial backup for user: ${user.username}`);
            await backupService.runUserBackup(user);
            console.log(`Initial backup completed for user: ${user.username}`);
        } catch (backupError) {
            console.error(`Initial backup failed for user ${user.username}:`, backupError);
        }

        res.json({
            success: true,
            message: "Backup scheduler started successfully",
            data: {
                schedule: user.schedule,
                nextRun: "Check your cron schedule for next execution time"
            }
        });
    } catch (error) {
        console.error("Failed to start backup scheduler:", error);
        res.status(500).json({
            success: false,
            message: "Failed to start backup scheduler",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

// Stop scheduled backups for user
router.post("/stop-scheduler", apiMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user!;

        if (!userScheduledTasks.has(user.uuid)) {
            res.status(400).json({
                success: false,
                message: "No active backup scheduler found for this user"
            });
            return;
        }

        // Stop and remove the scheduled task
        const task = userScheduledTasks.get(user.uuid)!;
        task.destroy();
        userScheduledTasks.delete(user.uuid);

        console.log(`Backup scheduler stopped for user: ${user.username}`);

        res.json({
            success: true,
            message: "Backup scheduler stopped successfully"
        });
    } catch (error) {
        console.error("Failed to stop backup scheduler:", error);
        res.status(500).json({
            success: false,
            message: "Failed to stop backup scheduler",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

// Trigger manual backup for user
router.post("/backup", apiMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user!;

        if (!user.mongoUri || !user.dbName) {
            res.status(400).json({
                success: false,
                message: "Please configure MongoDB URI and database name first using /api/configure"
            });
            return;
        }

        console.log(`Manual backup triggered for user: ${user.username} (${user.uuid})`);
        const backupRecord = await backupService.runUserBackup(user);

        res.json({
            success: true,
            message: "Backup completed successfully",
            data: {
                backupId: backupRecord._id,
                backupPath: backupRecord.backupPath,
                size: backupRecord.backupSize,
                timestamp: backupRecord.completedAt || backupRecord.createdAt
            }
        });
    } catch (error) {
        console.error("Manual backup failed:", error);
        res.status(500).json({
            success: false,
            message: "Backup failed",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

router.get("/backups", apiMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user!;
        const limit = Math.min(parseInt(req.query.limit as string) || 10, 100); // Max 100
        const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);

        const [backups, stats] = await Promise.all([
            backupService.getUserBackups(user.uuid, limit, offset),
            backupService.getBackupStats(user.uuid)
        ]);

        res.json({
            success: true,
            data: {
                backups: backups.map(backup => ({
                    id: backup._id,
                    dbName: backup.dbName,
                    status: backup.status,
                    size: backup.backupSize,
                    createdAt: backup.createdAt,
                    completedAt: backup.completedAt,
                    errorMessage: backup.errorMessage
                })),
                stats,
                pagination: {
                    limit,
                    offset,
                    total: stats.totalBackups,
                    hasMore: offset + limit < stats.totalBackups
                }
            }
        });
    } catch (error) {
        console.error("Fetch backups error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch backups",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

// Get comprehensive status for user
router.get("/status", apiMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user!;
        const isSchedulerRunning = userScheduledTasks.has(user.uuid);
        const stats = await backupService.getBackupStats(user.uuid);

        res.json({
            success: true,
            data: {
                user: {
                    username: user.username,
                    email: user.email,
                    uuid: user.uuid,
                    apiKey: user.uuid // UUID serves as API key
                },
                configuration: {
                    mongoUri: user.mongoUri ? `${user.mongoUri.substring(0, 20)}...` : null, // Masked for security
                    dbName: user.dbName,
                    schedule: user.schedule,
                    configured: !!(user.mongoUri && user.dbName)
                },
                scheduler: {
                    running: isSchedulerRunning,
                    schedule: user.schedule
                },
                stats,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error("Status API error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get status",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

// Regenerate API Key (UUID) for user
router.post("/regenerate-apikey", apiMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user!;
        
        if (userScheduledTasks.has(user.uuid)) {
            const task = userScheduledTasks.get(user.uuid)!;
            task.destroy();
            userScheduledTasks.delete(user.uuid);
            console.log(`Stopped scheduler for old API key: ${user.uuid}`);
        }
        
        // Generate new UUID (which serves as API key)
        const newUuid = uuidv4();
        const oldUuid = user.uuid;
        user.uuid = newUuid;
        await user.save();

        console.log(`API key regenerated for user ${user.username}: ${oldUuid} -> ${newUuid}`);

        res.json({
            success: true,
            message: "New API key generated successfully. Previous API key is now invalid.",
            data: {
                apiKey: newUuid,
                uuid: newUuid,
                note: "If you had a backup scheduler running, you'll need to restart it with the new API key."
            }
        });
    } catch (error) {
        console.error("Failed to regenerate API key:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate API key",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

// Health check for API
router.get("/health", (req: Request, res: Response): void => {
    res.json({
        success: true,
        message: "Backup API is running",
        timestamp: new Date().toISOString(),
        activeSchedulers: userScheduledTasks.size
    });
});

export default router;