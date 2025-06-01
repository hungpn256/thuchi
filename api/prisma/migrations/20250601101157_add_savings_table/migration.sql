-- CreateTable
CREATE TABLE "savings" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" VARCHAR(500),
    "color" VARCHAR(7),
    "profileId" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "savings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IDX_SAVINGS_PROFILE" ON "savings"("profileId");

-- AddForeignKey
ALTER TABLE "savings" ADD CONSTRAINT "savings_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings" ADD CONSTRAINT "savings_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
