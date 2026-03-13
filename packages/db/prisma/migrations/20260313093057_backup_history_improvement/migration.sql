-- DropIndex
DROP INDEX "BackupHistory_configId_idx";

-- AlterTable
ALTER TABLE "BackupHistory" ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "isEncrypted" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "BackupHistory_configId_createdAt_idx" ON "BackupHistory"("configId", "createdAt");
