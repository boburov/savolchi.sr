/*
  Warnings:

  - You are about to drop the column `completedAt` on the `Result` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[text]` on the table `Option` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[testId]` on the table `Result` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[optionId]` on the table `Result` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `optionId` to the `Result` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Result" DROP COLUMN "completedAt",
ADD COLUMN     "isSkiped" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "optionId" TEXT NOT NULL,
ADD COLUMN     "timeSpent" INTEGER;

-- CreateTable
CREATE TABLE "TestUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subjectId" TEXT,

    CONSTRAINT "TestUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TestUser_email_key" ON "TestUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Option_text_key" ON "Option"("text");

-- CreateIndex
CREATE UNIQUE INDEX "Result_testId_key" ON "Result"("testId");

-- CreateIndex
CREATE UNIQUE INDEX "Result_optionId_key" ON "Result"("optionId");

-- AddForeignKey
ALTER TABLE "TestUser" ADD CONSTRAINT "TestUser_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
