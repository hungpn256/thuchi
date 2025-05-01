-- CreateEnum
CREATE TYPE "profile_user_status" AS ENUM ('ACTIVE', 'PENDING', 'REJECTED');

-- AlterTable
ALTER TABLE "profile_user" ADD COLUMN     "status" "profile_user_status" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "permission" SET DEFAULT 'ADMIN';
