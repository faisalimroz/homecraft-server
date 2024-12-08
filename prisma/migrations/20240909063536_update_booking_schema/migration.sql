-- CreateEnum
CREATE TYPE "WorkStatus" AS ENUM ('Pending', 'InProgress', 'Completed', 'Canceled');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "workStatus" "WorkStatus" NOT NULL DEFAULT 'Pending';
