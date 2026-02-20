-- CreateEnum
CREATE TYPE "BackupStatus" AS ENUM ('success', 'failed');

-- CreateTable
CREATE TABLE "BackupHistory" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "durationMs" INTEGER,
    "status" "BackupStatus" NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BackupHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BackupHistory_configId_idx" ON "BackupHistory"("configId");

-- AddForeignKey
ALTER TABLE "BackupHistory" ADD CONSTRAINT "BackupHistory_configId_fkey" FOREIGN KEY ("configId") REFERENCES "BackupConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
