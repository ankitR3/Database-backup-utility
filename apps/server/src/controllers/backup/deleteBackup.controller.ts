import prisma from "@repo/db";
import { Request, Response } from "express";

export async function deleteBackupController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const { backupId } = req.params;

        if (!userId) {
            return res.status(401).json({
                message: 'Unauthorised'
            });
        }

        if (!backupId) {
            return res.status(400).json({
                message: 'Backup ID required'
            });
        }

        const backup = await prisma.backupHistory.findUnique({
            where: { id: backupId },
            include: { config: true }
        });

        if (!backup) {
            return res.status(404).json({
                message: "Backup not found"
            });
        }

        if (backup.config.userId !== userId) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        await prisma.backupHistory.delete({
            where: { id: backupId }
        });

        res.json({
            success: true,
            message: "Backup deleted successfully"
        })
    } catch (err) {
        console.log('Delete backup failed: err');
    }
}