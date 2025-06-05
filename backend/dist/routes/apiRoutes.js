"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uuid_1 = require("uuid");
const node_cron_1 = __importDefault(require("node-cron"));
const backup_1 = require("../backup");
const apiMiddleware_1 = require("../middleware/apiMiddleware");
const router = express_1.default.Router();
const backupService = new backup_1.BackupService();
const userScheduledTasks = new Map();
router.post("/configure", apiMiddleware_1.apiMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const { mongoUri, dbName, schedule } = req.body;
        if (!mongoUri || !dbName) {
            res.status(400).json({
                success: false,
                message: "MongoDB URI and database name are required"
            });
            return;
        }
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
        if (schedule && !node_cron_1.default.validate(schedule)) {
            res.status(400).json({
                success: false,
                message: "Invalid cron schedule format"
            });
            return;
        }
        user.mongoUri = mongoUri;
        user.dbName = dbName;
        if (schedule)
            user.schedule = schedule;
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
    }
    catch (error) {
        console.error("Failed to update configuration:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update configuration",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
router.post("/start-scheduler", apiMiddleware_1.apiMiddleware, async (req, res) => {
    try {
        const user = req.user;
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
        if (!user.schedule || !node_cron_1.default.validate(user.schedule)) {
            res.status(400).json({
                success: false,
                message: "Invalid or missing cron schedule. Please configure first."
            });
            return;
        }
        const scheduledTask = node_cron_1.default.schedule(user.schedule, async () => {
            try {
                console.log(`Starting scheduled backup for user: ${user.username} (${user.uuid})`);
                await backupService.runUserBackup(user);
                console.log(`Scheduled backup completed for user: ${user.username}`);
            }
            catch (error) {
                console.error(`Scheduled backup failed for user ${user.username}:`, error);
            }
        });
        userScheduledTasks.set(user.uuid, scheduledTask);
        try {
            console.log(`Running initial backup for user: ${user.username}`);
            await backupService.runUserBackup(user);
            console.log(`Initial backup completed for user: ${user.username}`);
        }
        catch (backupError) {
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
    }
    catch (error) {
        console.error("Failed to start backup scheduler:", error);
        res.status(500).json({
            success: false,
            message: "Failed to start backup scheduler",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
router.post("/stop-scheduler", apiMiddleware_1.apiMiddleware, async (req, res) => {
    try {
        const user = req.user;
        if (!userScheduledTasks.has(user.uuid)) {
            res.status(400).json({
                success: false,
                message: "No active backup scheduler found for this user"
            });
            return;
        }
        const task = userScheduledTasks.get(user.uuid);
        task.destroy();
        userScheduledTasks.delete(user.uuid);
        console.log(`Backup scheduler stopped for user: ${user.username}`);
        res.json({
            success: true,
            message: "Backup scheduler stopped successfully"
        });
    }
    catch (error) {
        console.error("Failed to stop backup scheduler:", error);
        res.status(500).json({
            success: false,
            message: "Failed to stop backup scheduler",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
router.post("/backup", apiMiddleware_1.apiMiddleware, async (req, res) => {
    try {
        const user = req.user;
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
router.get("/backups", apiMiddleware_1.apiMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const limit = Math.min(parseInt(req.query.limit) || 10, 100);
        const offset = Math.max(parseInt(req.query.offset) || 0, 0);
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
    }
    catch (error) {
        console.error("Fetch backups error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch backups",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
router.get("/status", apiMiddleware_1.apiMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const isSchedulerRunning = userScheduledTasks.has(user.uuid);
        const stats = await backupService.getBackupStats(user.uuid);
        res.json({
            success: true,
            data: {
                user: {
                    username: user.username,
                    email: user.email,
                    uuid: user.uuid,
                    apiKey: user.uuid
                },
                configuration: {
                    mongoUri: user.mongoUri ? `${user.mongoUri.substring(0, 20)}...` : null,
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
    }
    catch (error) {
        console.error("Status API error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get status",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
router.post("/regenerate-apikey", apiMiddleware_1.apiMiddleware, async (req, res) => {
    try {
        const user = req.user;
        if (userScheduledTasks.has(user.uuid)) {
            const task = userScheduledTasks.get(user.uuid);
            task.destroy();
            userScheduledTasks.delete(user.uuid);
            console.log(`Stopped scheduler for old API key: ${user.uuid}`);
        }
        const newUuid = (0, uuid_1.v4)();
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
    }
    catch (error) {
        console.error("Failed to regenerate API key:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate API key",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
router.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "Backup API is running",
        timestamp: new Date().toISOString(),
        activeSchedulers: userScheduledTasks.size
    });
});
exports.default = router;
//# sourceMappingURL=apiRoutes.js.map