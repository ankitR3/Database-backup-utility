/*
  Warnings:

  - You are about to drop the column `usernme` on the `admins` table. All the data in the column will be lost.
  - The `role` column on the `admins` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[username]` on the table `admins` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `admins` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('admin', 'superadmin');

-- DropIndex
DROP INDEX "admins_usernme_key";

-- AlterTable
ALTER TABLE "admins" DROP COLUMN "usernme",
ADD COLUMN     "username" TEXT NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "AdminRole" NOT NULL DEFAULT 'admin';

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");
