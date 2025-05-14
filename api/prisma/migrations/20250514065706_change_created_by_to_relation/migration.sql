/*
  Warnings:

  - You are about to drop the column `createdBy` on the `transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "transaction" DROP COLUMN "createdBy",
ADD COLUMN     "createdById" INTEGER;

-- CreateIndex
CREATE INDEX "IDX_TRANSACTION_CREATED_BY" ON "transaction"("createdById");

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
