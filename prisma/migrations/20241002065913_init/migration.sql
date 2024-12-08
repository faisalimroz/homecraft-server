/*
  Warnings:

  - You are about to drop the column `mode` on the `comboPack` table. All the data in the column will be lost.
  - Added the required column `plan` to the `comboPack` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "comboPack" DROP COLUMN "mode",
ADD COLUMN     "plan" TEXT NOT NULL;
