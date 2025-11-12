/*
  Warnings:

  - You are about to drop the column `correctId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `question` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `pfp` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `schoolId` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Option` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `School` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserAccess` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `answer` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectId` to the `Test` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('MONTHLY', 'THREE_MONTHS', 'SIX_MONTHS', 'YEARLY');

-- CreateEnum
CREATE TYPE "TestLevel" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'EXPERT', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "Rank" AS ENUM ('S', 'A', 'B', 'C', 'D', 'E', 'F');

-- DropForeignKey
ALTER TABLE "public"."Option" DROP CONSTRAINT "Option_questionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."School" DROP CONSTRAINT "School_adminId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Test" DROP CONSTRAINT "Test_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserAccess" DROP CONSTRAINT "UserAccess_testId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserAccess" DROP CONSTRAINT "UserAccess_userId_fkey";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "correctId",
DROP COLUMN "question",
ADD COLUMN     "answer" TEXT NOT NULL,
ADD COLUMN     "text" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "subjectLimit" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "type" "SubscriptionType" NOT NULL DEFAULT 'MONTHLY',
ALTER COLUMN "userLimit" SET DEFAULT 200;

-- AlterTable
ALTER TABLE "Test" DROP COLUMN "password",
DROP COLUMN "pfp",
DROP COLUMN "schoolId",
DROP COLUMN "type",
ADD COLUMN     "level" "TestLevel" NOT NULL DEFAULT 'EASY',
ADD COLUMN     "subjectId" INTEGER NOT NULL,
ADD COLUMN     "xpReward" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isVerified",
ADD COLUMN     "rank" "Rank" NOT NULL DEFAULT 'F',
ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "public"."Option";

-- DropTable
DROP TABLE "public"."School";

-- DropTable
DROP TABLE "public"."UserAccess";

-- DropEnum
DROP TYPE "public"."TestType";

-- CreateTable
CREATE TABLE "Channel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "pfp" TEXT,
    "banner" TEXT,
    "adminId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "channelId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "testId" INTEGER NOT NULL,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Channel_adminId_key" ON "Channel"("adminId");

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
