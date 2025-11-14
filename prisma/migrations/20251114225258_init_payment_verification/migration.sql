-- DropForeignKey
ALTER TABLE "public"."Subscription" DROP CONSTRAINT "Subscription_adminId_fkey";

-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "adminId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("tgId") ON DELETE RESTRICT ON UPDATE CASCADE;
