-- CreateEnum
CREATE TYPE "BackupType" AS ENUM ('mongo', 'postgres');

-- CreateTable
CREATE TABLE "BackupConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "BackupType" NOT NULL,
    "mongoUri" TEXT,
    "mongoDbName" TEXT,
    "pgUri" TEXT,
    "pgDbName" TEXT,
    "schedule" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BackupConfig_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BackupConfig" ADD CONSTRAINT "BackupConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
