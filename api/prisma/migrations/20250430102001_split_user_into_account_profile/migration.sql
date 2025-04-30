/*
  Warnings:

  - You are about to drop the column `userId` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `device_token` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,profileId]` on the table `category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accountId,deviceId]` on the table `device_token` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId]` on the table `settings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountId` to the `device_token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "account_status" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "profile_status" AS ENUM ('ACTIVE', 'INACTIVE', 'DELETED');

-- CreateEnum
CREATE TYPE "profile_permission" AS ENUM ('READ', 'WRITE', 'ADMIN');

-- DropForeignKey
ALTER TABLE "category" DROP CONSTRAINT "FK_13e8b2a21988bec6fdcbb1fa741";

-- DropForeignKey
ALTER TABLE "device_token" DROP CONSTRAINT "device_token_userId_fkey";

-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT "event_userId_fkey";

-- DropForeignKey
ALTER TABLE "settings" DROP CONSTRAINT "settings_userId_fkey";

-- DropForeignKey
ALTER TABLE "transaction" DROP CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41";

-- DropIndex
DROP INDEX "IDX_13e8b2a21988bec6fdcbb1fa74";

-- DropIndex
DROP INDEX "UQ_c9e95d6cdc8663c1a22269cb54a";

-- DropIndex
DROP INDEX "IDX_DEVICE_TOKEN_USER_ID";

-- DropIndex
DROP INDEX "device_token_userId_deviceId_key";

-- DropIndex
DROP INDEX "IDX_EVENT_USER";

-- DropIndex
DROP INDEX "IDX_SETTINGS_USER_ID";

-- DropIndex
DROP INDEX "settings_userId_key";

-- DropIndex
DROP INDEX "IDX_TRANSACTION_USER_DATE";

-- AlterTable
ALTER TABLE "category" DROP COLUMN "userId",
ADD COLUMN     "profileId" INTEGER;

-- AlterTable
ALTER TABLE "device_token" DROP COLUMN "userId",
ADD COLUMN     "accountId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "event" DROP COLUMN "userId",
ADD COLUMN     "profileId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "settings" DROP COLUMN "userId",
ADD COLUMN     "profileId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "transaction" DROP COLUMN "userId",
ADD COLUMN     "profileId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "user";

-- CreateTable
CREATE TABLE "account" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR NOT NULL,
    "password" VARCHAR,
    "googleId" VARCHAR,
    "status" "account_status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "avatar" VARCHAR,
    "status" "profile_status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_user" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,
    "permission" "profile_permission" NOT NULL DEFAULT 'READ',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UQ_97672ac88f789774dd47f7c8be3" ON "account"("email");

-- CreateIndex
CREATE INDEX "IDX_ACCOUNT_EMAIL" ON "account"("email");

-- CreateIndex
CREATE INDEX "IDX_PROFILE_NAME" ON "profile"("name");

-- CreateIndex
CREATE INDEX "IDX_PROFILE_USER_PROFILE" ON "profile_user"("profileId");

-- CreateIndex
CREATE INDEX "IDX_PROFILE_USER_ACCOUNT" ON "profile_user"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "profile_user_profileId_accountId_key" ON "profile_user"("profileId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "profile_user_accountId_isDefault_key" ON "profile_user"("accountId", "isDefault");

-- CreateIndex
CREATE INDEX "IDX_13e8b2a21988bec6fdcbb1fa74" ON "category"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "UQ_c9e95d6cdc8663c1a22269cb54a" ON "category"("name", "profileId");

-- CreateIndex
CREATE INDEX "IDX_DEVICE_TOKEN_ACCOUNT_ID" ON "device_token"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "device_token_accountId_deviceId_key" ON "device_token"("accountId", "deviceId");

-- CreateIndex
CREATE INDEX "IDX_EVENT_PROFILE" ON "event"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "settings_profileId_key" ON "settings"("profileId");

-- CreateIndex
CREATE INDEX "IDX_SETTINGS_PROFILE_ID" ON "settings"("profileId");

-- CreateIndex
CREATE INDEX "IDX_TRANSACTION_PROFILE_DATE" ON "transaction"("profileId", "date");

-- AddForeignKey
ALTER TABLE "profile_user" ADD CONSTRAINT "profile_user_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_user" ADD CONSTRAINT "profile_user_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "FK_13e8b2a21988bec6fdcbb1fa741" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_token" ADD CONSTRAINT "device_token_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
