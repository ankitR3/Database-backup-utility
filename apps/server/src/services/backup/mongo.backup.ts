import path from 'node:path';
import fs from 'node:fs/promises';
import { execPromise } from '../../utils/exec';
import { encryptFile } from '../../utils/encrypt';
import { BackupInput } from '../../types/backup.types';

export async function mongoBackup(input: BackupInput) {
    const { mongoUri, mongoDbName, userId} = input;

    if (!mongoUri || !mongoDbName) {
        throw new Error('MONGO_CONFIG_MISSING');
    }

    const mongoDumpPath = process.env.MONGO_DUMP_PATH;
    if (!mongoDumpPath) {
        throw new Error('MONGO_DUMP_PATH_ERROR');
    }

    // output folder
    const outputDir = path.join(
        process.cwd(),
        'backups',
        userId,
        'mongo',
        mongoDbName,
        Date.now().toString()
    );
    await fs.mkdir(outputDir, { recursive: true });

    const tempDir = path.join(
        process.cwd(),
        'tmp',
        'backups',
        userId,
        'mongo',
        mongoDbName,
        Date.now().toString()
    );
    await fs.mkdir(tempDir, { recursive: true });

    await execPromise(mongoDumpPath, [
        `--uri=${mongoUri}`,
        `--db=${mongoDbName}`,
        `--out=${tempDir}`,
    ]);

    // tar should be created outside temp folder
    const tarPath = path.join(outputDir, `${Date.now()}-${mongoDbName}.tar.gz`);
    await execPromise('tar', ['-czf', tarPath, '-C', tempDir, '.']);

    // encrypt tar
    const encPath = `${tarPath}.enc`;
    await encryptFile(tarPath, encPath);

    // remove raw tar + temp dump directory
    await fs.rm(tarPath, { force: true });
    await fs.rm(tempDir, { recursive: true, force: true });

    return {
        type: "mongo",
        encryptFilePath: encPath,
    };
}