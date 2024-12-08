-- CreateTable
CREATE TABLE "comboBookings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "comboId" TEXT NOT NULL,
    "isPaid" "PaymentStatus" NOT NULL DEFAULT 'Unpaid',
    "status" "Status" NOT NULL DEFAULT 'Pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comboBookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comboPayment" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "comboBookingId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'Pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comboPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "comboBookings" ADD CONSTRAINT "comboBookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comboBookings" ADD CONSTRAINT "comboBookings_comboId_fkey" FOREIGN KEY ("comboId") REFERENCES "comboPack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comboPayment" ADD CONSTRAINT "comboPayment_comboBookingId_fkey" FOREIGN KEY ("comboBookingId") REFERENCES "comboBookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
