/*
  Warnings:

  - You are about to drop the column `Day` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `Time` on the `bookings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[day,time,serviceId,bookingDate]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `day` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "bookings_Day_Time_serviceId_bookingDate_key";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "Day",
DROP COLUMN "Time",
ADD COLUMN     "day" TEXT NOT NULL,
ADD COLUMN     "time" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "bookings_day_time_serviceId_bookingDate_key" ON "bookings"("day", "time", "serviceId", "bookingDate");
