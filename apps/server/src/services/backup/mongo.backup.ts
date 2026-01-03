import path from "node:path";
import fs from 'node:fs/promises';
import { execPromise } from "../../utils/exec";
import { encryptFile } from "../../utils/encrypt";
import { BackupInput } from "../../types/backup.types";

export async function mongoBackup(input: BackupInput) {
    const { mongoUri, mongoDbName, userId} = input;

    if (!mongoUri || !mongoDbName) {
        throw new Error('MONGO_CONFIG_MISSING');
    }

    const baseDir = path.join(
        process.cwd(),
        "backups",
        userId,
        "mongo",
        mongoDbName,
        Date.now().toString()
    );

    await fs.mkdir(baseDir, { recursive: true });

    const dumpCmd = `mongodump --uri="${mongoUri}" --db="${mongoDbName}" --out="${baseDir}"`;
    await execPromise(dumpCmd);

    const tarPath = `${baseDir}.tar.gz`;
    await execPromise(`tar -czf "${tarPath}" -C "${baseDir}" .`);

    const encPath = `${tarPath}.enc`;
    await encryptFile(tarPath, encPath);

    await fs.rm(baseDir, { recursive: true, force: true });
    await fs.rm(tarPath, { force: true });

    return {
        type: "mongo",
        encryptFilePath: encPath,
    };
}