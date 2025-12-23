import path from 'node:path';
import fs from 'node:fs/promises';
import { BackupInput } from '../../types/backup.types';
import { execPromise } from '../../utils/exec';
import { encryptFile } from '../../utils/encrypt';

export async function postgresBackup(input: BackupInput) {
    const { pgUri, pgDbName, userId } = input;

    if (!pgUri || !pgDbName) {
        throw new Error("POSTGRES_CONFIG_MISSING");
    }

    const baseDir = path.join(
        process.cwd(),
        "backups",
        userId,
        "postgres",
        pgDbName,
        Date.now().toString()
    );

    await fs.mkdir(baseDir, { recursive: true });

    const sqlPath = path.join(baseDir, `${pgDbName}.sql`);

    const dumpCmd = `pg_dump "${pgUri}" --dbname=${pgDbName} --file="${sqlPath}"`;
    await execPromise(dumpCmd);

    const encPath = `${sqlPath}.enc`;
    await encryptFile(sqlPath, encPath);

    await fs.rm(sqlPath, { force: true });

    return {
        type: "postgres",
        encryptFilePath: encPath,
    }
}