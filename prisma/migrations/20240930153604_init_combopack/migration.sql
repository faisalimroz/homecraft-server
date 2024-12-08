-- CreateTable
CREATE TABLE "combopack" (
    "id" TEXT NOT NULL,
    "comboName" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "services" TEXT[],
    "amount" INTEGER NOT NULL,
    "providerId" TEXT NOT NULL,

    CONSTRAINT "combopack_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "combopack_comboName_key" ON "combopack"("comboName");

-- AddForeignKey
ALTER TABLE "combopack" ADD CONSTRAINT "combopack_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
