/*
  Warnings:

  - You are about to drop the column `dob` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "dob",
DROP COLUMN "gender";
