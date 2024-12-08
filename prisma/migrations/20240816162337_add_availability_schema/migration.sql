/*
  Warnings:

  - You are about to drop the `availbilities` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "availbilities";

-- CreateTable
CREATE TABLE "availabilities" (
    "id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "slots" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availabilities_pkey" PRIMARY KEY ("id")
);
