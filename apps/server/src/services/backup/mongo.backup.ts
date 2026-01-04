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

    const mongoDumpPath = process.env.MONGO_DUMP_PATH;
    if (!mongoDumpPath) {
        throw new Error('MONGO_DUMP_PATH_ERROR');
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

    await execPromise(mongoDumpPath, [
        `--uri=${mongoUri}`,
        `--db=${mongoDbName}`,
        `--out=${baseDir}`,
    ]);

    const tarPath = path.join(baseDir, `${mongoDbName}.tar.gz`);
    await execPromise("tar", [
        "-czf",
        tarPath,
        "-C",
        baseDir,
        ".",
    ]);

    const encPath = `${tarPath}.enc`;
    await encryptFile(tarPath, encPath);

    await fs.rm(tarPath, { force: true });
    await fs.rm(baseDir, { recursive: true, force: true });

    return {
        type: "mongo",
        encryptFilePath: encPath,
    };
}