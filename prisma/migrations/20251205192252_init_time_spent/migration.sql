-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
