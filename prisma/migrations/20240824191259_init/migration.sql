/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `blogs` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "blogs_title_key" ON "blogs"("title");
