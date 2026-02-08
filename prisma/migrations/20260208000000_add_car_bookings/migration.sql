-- CreateTable
CREATE TABLE "CarBooking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookingNumber" TEXT NOT NULL,
    "bookingReference" TEXT,
    "carId" TEXT NOT NULL,
    "carName" TEXT NOT NULL,
    "carCategory" TEXT NOT NULL,
    "carImage" TEXT,
    "transmission" TEXT NOT NULL,
    "fuelType" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "supplierName" TEXT NOT NULL,
    "supplierLogo" TEXT,
    "pickupLocation" TEXT NOT NULL,
    "dropoffLocation" TEXT NOT NULL,
    "pickupDateTime" TIMESTAMP(3) NOT NULL,
    "dropoffDateTime" TIMESTAMP(3) NOT NULL,
    "pickupDepot" TEXT,
    "dropoffDepot" TEXT,
    "driver" TEXT NOT NULL,
    "additionalDrivers" TEXT,
    "extras" TEXT,
    "insurance" TEXT,
    "priceBreakdown" TEXT NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "depositAmount" DOUBLE PRECISION,
    "excessAmount" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "confirmationEmail" TEXT NOT NULL,
    "confirmationSms" TEXT,
    "cancellationPolicy" TEXT,
    "amendmentPolicy" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'demo',
    "providerBookingId" TEXT,
    "searchToken" TEXT,

    CONSTRAINT "CarBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CarBooking_bookingNumber_key" ON "CarBooking"("bookingNumber");

-- CreateIndex
CREATE INDEX "CarBooking_userId_idx" ON "CarBooking"("userId");

-- CreateIndex
CREATE INDEX "CarBooking_status_idx" ON "CarBooking"("status");

-- CreateIndex
CREATE INDEX "CarBooking_bookingNumber_idx" ON "CarBooking"("bookingNumber");

-- CreateIndex
CREATE INDEX "CarBooking_pickupDateTime_idx" ON "CarBooking"("pickupDateTime");

-- CreateIndex
CREATE INDEX "CarBooking_dropoffDateTime_idx" ON "CarBooking"("dropoffDateTime");

-- CreateIndex
CREATE INDEX "CarBooking_providerBookingId_idx" ON "CarBooking"("providerBookingId");

-- CreateIndex
CREATE INDEX "CarBooking_createdAt_idx" ON "CarBooking"("createdAt");

-- AddForeignKey
ALTER TABLE "CarBooking" ADD CONSTRAINT "CarBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
