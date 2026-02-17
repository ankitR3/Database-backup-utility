-- AlterTable
ALTER TABLE "BackupConfig" ADD COLUMN     "isRunning" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastRunAt" TIMESTAMP(3);
