-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "eventId" INTEGER;

-- CreateTable
CREATE TABLE "event" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "expectedAmount" DECIMAL(10,2),
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IDX_EVENT_USER" ON "event"("userId");

-- CreateIndex
CREATE INDEX "IDX_EVENT_DATE_RANGE" ON "event"("startDate", "endDate");

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "FK_event_transaction" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
