-- DropForeignKey
ALTER TABLE "savings" DROP CONSTRAINT "savings_createdById_fkey";

-- AlterTable
ALTER TABLE "savings" ADD COLUMN     "assetType" VARCHAR(50) NOT NULL DEFAULT 'MONEY',
ADD COLUMN     "unit" VARCHAR(20) NOT NULL DEFAULT 'VND',
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(15,3);

-- CreateIndex
CREATE INDEX "IDX_SAVINGS_ASSET_TYPE" ON "savings"("assetType");

-- AddForeignKey
ALTER TABLE "savings" ADD CONSTRAINT "savings_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "IDX_SAVINGS_PROFILE" RENAME TO "IDX_SAVINGS_PROFILE_ID";
