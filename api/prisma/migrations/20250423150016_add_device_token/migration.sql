-- CreateTable
CREATE TABLE "device_token" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "deviceId" VARCHAR(255) NOT NULL,
    "token" VARCHAR(512) NOT NULL,
    "deviceType" VARCHAR(50) NOT NULL,
    "deviceName" VARCHAR(255),
    "deviceModel" VARCHAR(100),
    "osVersion" VARCHAR(50),
    "appVersion" VARCHAR(50),
    "lastActiveAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IDX_DEVICE_TOKEN_USER_ID" ON "device_token"("userId");

-- CreateIndex
CREATE INDEX "IDX_DEVICE_TOKEN_TOKEN" ON "device_token"("token");

-- CreateIndex
CREATE UNIQUE INDEX "UQ_DEVICE_TOKEN_USER_DEVICE" ON "device_token"("userId", "deviceId");

-- AddForeignKey
ALTER TABLE "device_token" ADD CONSTRAINT "device_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
