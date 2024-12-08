/*
  Warnings:

  - The values [ADMIN] on the enum `ProviderRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "ProviderRole_new" AS ENUM ('PROVIDER');
ALTER TABLE "providers" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "providers" ALTER COLUMN "role" TYPE "ProviderRole_new" USING ("role"::text::"ProviderRole_new");
ALTER TYPE "ProviderRole" RENAME TO "ProviderRole_old";
ALTER TYPE "ProviderRole_new" RENAME TO "ProviderRole";
DROP TYPE "ProviderRole_old";
ALTER TABLE "providers" ALTER COLUMN "role" SET DEFAULT 'PROVIDER';
COMMIT;

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "providers" ADD COLUMN     "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING';
