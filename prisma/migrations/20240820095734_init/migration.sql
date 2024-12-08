/*
  Warnings:

  - The values [PENDING,APPROVED,REJECTED] on the enum `ApprovalStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PROVIDER] on the enum `ProviderRole` will be removed. If these variants are still used in the database, this will fail.
  - The values [USER,ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - The values [ACTIVE,INACTIVE] on the enum `ServiceStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ApprovalStatus_new" AS ENUM ('Pending', 'Approved', 'Rejected');
ALTER TABLE "providers" ALTER COLUMN "approvalStatus" DROP DEFAULT;
ALTER TABLE "providers" ALTER COLUMN "approvalStatus" TYPE "ApprovalStatus_new" USING ("approvalStatus"::text::"ApprovalStatus_new");
ALTER TYPE "ApprovalStatus" RENAME TO "ApprovalStatus_old";
ALTER TYPE "ApprovalStatus_new" RENAME TO "ApprovalStatus";
DROP TYPE "ApprovalStatus_old";
ALTER TABLE "providers" ALTER COLUMN "approvalStatus" SET DEFAULT 'Pending';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ProviderRole_new" AS ENUM ('Provider');
ALTER TABLE "providers" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "providers" ALTER COLUMN "role" TYPE "ProviderRole_new" USING ("role"::text::"ProviderRole_new");
ALTER TYPE "ProviderRole" RENAME TO "ProviderRole_old";
ALTER TYPE "ProviderRole_new" RENAME TO "ProviderRole";
DROP TYPE "ProviderRole_old";
ALTER TABLE "providers" ALTER COLUMN "role" SET DEFAULT 'Provider';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('User', 'Admin');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'User';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ServiceStatus_new" AS ENUM ('Active', 'Inactive');
ALTER TABLE "services" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "services" ALTER COLUMN "status" TYPE "ServiceStatus_new" USING ("status"::text::"ServiceStatus_new");
ALTER TYPE "ServiceStatus" RENAME TO "ServiceStatus_old";
ALTER TYPE "ServiceStatus_new" RENAME TO "ServiceStatus";
DROP TYPE "ServiceStatus_old";
ALTER TABLE "services" ALTER COLUMN "status" SET DEFAULT 'Active';
COMMIT;

-- AlterTable
ALTER TABLE "providers" ALTER COLUMN "role" SET DEFAULT 'Provider',
ALTER COLUMN "approvalStatus" SET DEFAULT 'Pending';

-- AlterTable
ALTER TABLE "services" ALTER COLUMN "status" SET DEFAULT 'Active';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'User';
