/*
  Warnings:

  - You are about to drop the column `availabilityId` on the `bookings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[Day,Time,serviceId,bookingDate]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Day` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Time` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_availabilityId_fkey";

-- DropIndex
DROP INDEX "bookings_availabilityId_serviceId_bookingDate_key";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "availabilityId",
ADD COLUMN     "Day" TEXT NOT NULL,
ADD COLUMN     "Time" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "bookings_Day_Time_serviceId_bookingDate_key" ON "bookings"("Day", "Time", "serviceId", "bookingDate");
