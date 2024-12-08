/*
  Warnings:

  - The values [active,inactive] on the enum `ServiceStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `category_icon` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `category_img` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `category_name` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `service_img` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `service_name` on the `services` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[categoryName]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serviceName]` on the table `services` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoryIcon` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryImg` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryName` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceName` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER');

-- CreateEnum
CREATE TYPE "ProviderRole" AS ENUM ('PROVIDER', 'ADMIN');

-- AlterEnum
BEGIN;
CREATE TYPE "ServiceStatus_new" AS ENUM ('ACTIVE', 'INACTIVE');
ALTER TABLE "services" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "services" ALTER COLUMN "status" TYPE "ServiceStatus_new" USING ("status"::text::"ServiceStatus_new");
ALTER TYPE "ServiceStatus" RENAME TO "ServiceStatus_old";
ALTER TYPE "ServiceStatus_new" RENAME TO "ServiceStatus";
DROP TYPE "ServiceStatus_old";
ALTER TABLE "services" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- DropIndex
DROP INDEX "categories_category_name_key";

-- DropIndex
DROP INDEX "services_service_name_key";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "category_icon",
DROP COLUMN "category_img",
DROP COLUMN "category_name",
ADD COLUMN     "categoryIcon" TEXT NOT NULL,
ADD COLUMN     "categoryImg" TEXT NOT NULL,
ADD COLUMN     "categoryName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "services" DROP COLUMN "service_img",
DROP COLUMN "service_name",
ADD COLUMN     "serviceImg" TEXT[],
ADD COLUMN     "serviceName" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "fname" TEXT NOT NULL,
    "lname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "gender" TEXT NOT NULL,
    "dob" DATE NOT NULL,
    "contactNo" TEXT NOT NULL,
    "profileImg" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "providers" (
    "id" TEXT NOT NULL,
    "fname" TEXT NOT NULL,
    "lname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "ProviderRole" NOT NULL DEFAULT 'PROVIDER',
    "gender" TEXT NOT NULL,
    "dob" DATE NOT NULL,
    "bio" TEXT NOT NULL,
    "categoryId" TEXT,
    "contactNo" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "profileImg" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "providers_email_key" ON "providers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_categoryName_key" ON "categories"("categoryName");

-- CreateIndex
CREATE UNIQUE INDEX "services_serviceName_key" ON "services"("serviceName");

-- AddForeignKey
ALTER TABLE "providers" ADD CONSTRAINT "providers_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
