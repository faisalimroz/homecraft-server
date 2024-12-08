-- CreateEnum
CREATE TYPE "offerStatus" AS ENUM ('Active', 'Inactive');

-- CreateTable
CREATE TABLE "offers" (
    "id" TEXT NOT NULL,
    "offerName" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "offerStatus" NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);
