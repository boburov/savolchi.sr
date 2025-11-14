/*
  Warnings:

  - You are about to drop the column `is_verified` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `is_verified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `tgId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserSubscription` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `username` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_adminId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserSubscription" DROP CONSTRAINT "UserSubscription_userId_fkey";

-- DropIndex
DROP INDEX "public"."User_tgId_key";

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "is_verified",
ADD COLUMN     "is_verifyed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "is_verified",
DROP COLUMN "tgId",
ADD COLUMN     "is_verifyed" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "username" SET NOT NULL,
ALTER COLUMN "password" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- DropTable
DROP TABLE "public"."Payment";

-- DropTable
DROP TABLE "public"."UserSubscription";

-- DropEnum
DROP TYPE "public"."PaymentStatus";
