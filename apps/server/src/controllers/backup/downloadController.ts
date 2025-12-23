import { Request, Response } from 'express';
import path from 'node:path';
import fs from 'fs';

export async function downloadBackupController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const { filePath } = req.query;

        if (!userId) {
            return res.status(401).json({
                message: 'Unauthorized'
            });
        }
        

        if (!filePath || typeof filePath !== 'string') {
            return res.status(400).json({
                message: 'File path required'
            });
        }

        const absolutePath = path.resolve(filePath);

        if (!absolutePath.includes(path.join('backups', String(userId)))) {
            return res.status(403).json({
                message: 'Access denied'
            });
        }

        if (!fs.existsSync(absolutePath)) {
            return res.status(404).json({
                message: 'File not found'
            });
        }

        res.download(absolutePath);
    } catch (err) {
        res.status(500).json({
            message: 'Download failed'
        });
    }
}