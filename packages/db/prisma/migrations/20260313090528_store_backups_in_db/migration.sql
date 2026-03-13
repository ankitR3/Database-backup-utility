-- AlterTable
ALTER TABLE "BackupHistory" ADD COLUMN     "fileData" BYTEA,
ALTER COLUMN "filePath" DROP NOT NULL;
