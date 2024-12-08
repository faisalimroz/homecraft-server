/*
  Warnings:

  - You are about to drop the `combopack` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "combopack" DROP CONSTRAINT "combopack_providerId_fkey";

-- DropTable
DROP TABLE "combopack";

-- CreateTable
CREATE TABLE "comboPack" (
    "id" TEXT NOT NULL,
    "comboName" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "services" TEXT[],
    "amount" INTEGER NOT NULL,
    "providerId" TEXT NOT NULL,

    CONSTRAINT "comboPack_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "comboPack_comboName_key" ON "comboPack"("comboName");

-- AddForeignKey
ALTER TABLE "comboPack" ADD CONSTRAINT "comboPack_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
