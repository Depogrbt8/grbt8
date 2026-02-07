-- AlterTable
ALTER TABLE "HotelBooking" ALTER COLUMN "guestInfo" DROP NOT NULL;
ALTER TABLE "HotelBooking" ADD COLUMN "contactInfo" TEXT;
ALTER TABLE "HotelBooking" ADD COLUMN "guestDetails" TEXT;
