import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

export async function decryptBuffer(buffer: Buffer): Promise<Buffer> {
    const secret = process.env.ENCRYPTION_SECRET;
    if (!secret) {
        throw new Error('ENCRYPTION_SECRET missing');
    }

    const iv = buffer.subarray(0, IV_LENGTH);
    const content = buffer.subarray(IV_LENGTH);

    const key = crypto.createHash('sha256').update(secret).digest();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    const decrypted = Buffer.concat([
        decipher.update(content),
        decipher.final(),
    ]);

    return decrypted;
}