/*
  Warnings:

  - Added the required column `discountAmount` to the `comboPack` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "comboPack" ADD COLUMN     "discountAmount" INTEGER NOT NULL;
