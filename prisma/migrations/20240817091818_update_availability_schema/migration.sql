/*
  Warnings:

  - A unique constraint covering the columns `[day]` on the table `availabilities` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "availabilities_day_key" ON "availabilities"("day");
