import { Request, Response } from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';
import { decryptFile } from '../../utils/decrypt';

export async function downloadBackupController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const { filePath, encrypted } = req.query;

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

        const encryptedPath = path.resolve(filePath);

        if (!encryptedPath.includes(path.join('backups', String(userId)))) {
            return res.status(403).json({
                message: 'Access denied'
            });
        }

        await fs.access(encryptedPath);

        if (encrypted == 'true') {
            return res.download(encryptedPath);
        }

        const decryptedPath = encryptedPath.replace(/\.enc$/, "");

        await decryptFile(encryptedPath, decryptedPath);

        res.download(decryptedPath, async () => {
            await fs.rm(decryptedPath, { force: true });
        });
    } catch (err) {
        res.status(500).json({
            message: 'Download failed'
        });
    }
}