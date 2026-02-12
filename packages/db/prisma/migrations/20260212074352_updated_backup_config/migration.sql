/*
  Warnings:

  - You are about to drop the column `schedule` on the `BackupConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BackupConfig" DROP COLUMN "schedule",
ADD COLUMN     "dayOfWeek" INTEGER,
ADD COLUMN     "frequency" TEXT,
ADD COLUMN     "time" TEXT;
