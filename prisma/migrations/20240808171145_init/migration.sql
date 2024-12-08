/*
  Warnings:

  - You are about to drop the column `serviceImg` on the `services` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "services" DROP COLUMN "serviceImg",
ADD COLUMN     "service_img" TEXT[];
