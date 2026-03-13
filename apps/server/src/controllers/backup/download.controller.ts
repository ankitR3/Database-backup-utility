import { Request, Response } from 'express';
import { decryptBuffer } from '../../utils/decryptBuffer';
import prisma from '@repo/db';

export async function downloadBackupController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const { backupId } = req.query;

        if (!userId) {
            return res.status(401).json({
                message: 'Unauthorized'
            });
        }
        

        if (!backupId || typeof backupId !== 'string') {
            return res.status(400).json({
                message: 'Backup ID required'
            });
        }

        const backup = await prisma.backupHistory.findUnique({
            where: {
                id: backupId,
            },
            include: {
                config: true,
            },
        });

        if (!backup) {
            return res.status(404).json({
                message: 'Backup not found',
            });
        }

        if (backup.config.userId !== userId) {
            return res.status(403).json({
                message: 'Access denied',
            });
        }

        if (!backup.fileData) {
            return res.status(404).json({
                message: 'Backup file missing',
            });
        }

        let fileBuffer: Buffer = Buffer.from(backup.fileData);

        if (backup.isEncrypted) {
            fileBuffer = await decryptBuffer(fileBuffer);
        }

        res.setHeader(
            'Content-Disposition',
            `attachment; filename=${backup.fileName || `backup-${backup.id}.enc`}`
        );

        res.setHeader(
            "Content-Type",
            "application/octet-stream"
        );

        res.send(fileBuffer);

    } catch (err) {
        console.error('Download failed: ', err);
        res.status(500).json({
            message: 'Download failed'
        });
    }
}