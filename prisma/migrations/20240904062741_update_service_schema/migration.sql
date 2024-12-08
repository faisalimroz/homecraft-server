/*
  Warnings:

  - You are about to drop the column `price` on the `services` table. All the data in the column will be lost.
  - Added the required column `providerId` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `regularPrice` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "services" DROP COLUMN "price",
ADD COLUMN     "offeredPrice" INTEGER,
ADD COLUMN     "providerId" TEXT NOT NULL,
ADD COLUMN     "regularPrice" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
