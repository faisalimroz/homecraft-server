/*
  Warnings:

  - Added the required column `discount` to the `offers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "offers" ADD COLUMN     "discount" INTEGER NOT NULL;
