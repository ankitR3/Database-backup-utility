import { execPromise } from './exec';

export async function encryptFile(
    inputFile: string,
    outputFile: string
) {
    const key = process.env.BACKUP_ENCRYPTION_KEY;

    if (!key) {
        throw new Error("ENCRYPTION_KEY_MISSING");
    }

    const cmd = `
        openssl enc -aes-256-cbc -salt \
        -in "${inputFile}" \
        -out "${outputFile}" \
        -pass pass:${key}
    `;

    await execPromise(cmd);
}