-- AlterTable
ALTER TABLE "services" ADD COLUMN     "offerId" TEXT;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
