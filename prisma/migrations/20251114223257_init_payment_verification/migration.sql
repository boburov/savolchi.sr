/*
  Warnings:

  - A unique constraint covering the columns `[tgId]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "tgId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Admin_tgId_key" ON "Admin"("tgId");
