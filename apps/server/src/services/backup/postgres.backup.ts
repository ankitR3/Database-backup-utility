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

    const pgDumpPath = process.env.PG_DUMP_PATH;
    if (!pgDumpPath) {
        throw new Error("PG_DUMP_PATH_ERROR");
    }

    const outputDir = path.join(
        process.cwd(),
        "backups",
        userId,
        "postgres",
        pgDbName,
        Date.now().toString()
    );
    await fs.mkdir(outputDir, { recursive: true });

    const tempDir = path.join(
        process.cwd(),
        'tmp',
        'backups',
        userId,
        'postgres',
        pgDbName,
        Date.now().toString()
    );
    await fs.mkdir(tempDir, { recursive: true });

    const sqlPath = path.join(tempDir, `${pgDbName}.sql`);
    const encPath = path.join(outputDir, `${Date.now()}-${pgDbName}.sql.enc`);

    await execPromise(pgDumpPath, [
        "--dbname",
        pgUri,
        "--file",
        sqlPath,
    ]);

    await encryptFile(sqlPath, encPath);
    await fs.rm(tempDir, { recursive: true, force: true });

    return {
        type: "postgres",
        encryptFilePath: encPath,
    };
}