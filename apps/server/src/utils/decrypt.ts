import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

export async function decryptFile(
    encryptedPath: string,
    outputPath: string
) {
    const secret = process.env.ENCRYPTION_SECRET;
    if (!secret) {
        throw new Error('ENCRYPTION_SECRET missing');
    }

    const encryptedData = await fs.readFile(encryptedPath);

    const iv = encryptedData.subarray(0, IV_LENGTH);
    const content = encryptedData.subarray(IV_LENGTH);

    const key = crypto.createHash('sha256').update(secret).digest();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    const decrypted = Buffer.concat([
        decipher.update(content),
        decipher.final(),
    ]);

    await fs.writeFile(outputPath, decrypted);
}