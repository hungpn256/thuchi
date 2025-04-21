-- CreateEnum
CREATE TYPE "transaction_type_enum" AS ENUM ('INCOME', 'EXPENSE');

-- CreateTable
CREATE TABLE "category" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "type" "transaction_type_enum" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" VARCHAR,
    "date" DATE NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoryId" INTEGER,
    "eventId" INTEGER,
    "id" SERIAL NOT NULL,

    CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "password" VARCHAR,
    "googleId" VARCHAR,
    "avatar" VARCHAR,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "startDate" TIMESTAMP(6) NOT NULL,
    "endDate" TIMESTAMP(6) NOT NULL,
    "expectedAmount" DECIMAL(10,2),
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IDX_13e8b2a21988bec6fdcbb1fa74" ON "category"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UQ_c9e95d6cdc8663c1a22269cb54a" ON "category"("name", "userId");

-- CreateIndex
CREATE INDEX "IDX_TRANSACTION_USER_DATE" ON "transaction"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "UQ_97672ac88f789774dd47f7c8be3" ON "user"("email");

-- CreateIndex
CREATE INDEX "IDX_USER_EMAIL" ON "user"("email");

-- CreateIndex
CREATE INDEX "IDX_EVENT_USER" ON "event"("userId");

-- CreateIndex
CREATE INDEX "IDX_EVENT_DATE_RANGE" ON "event"("startDate", "endDate");

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "FK_13e8b2a21988bec6fdcbb1fa741" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "FK_86e965e74f9cc66149cf6c90f64" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "FK_event_transaction" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
