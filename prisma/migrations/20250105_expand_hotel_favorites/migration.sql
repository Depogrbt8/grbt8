-- AlterTable HotelFavorite - Yeni alanlar ekleniyor
ALTER TABLE "HotelFavorite" ADD COLUMN "hotelName" TEXT;
ALTER TABLE "HotelFavorite" ADD COLUMN "hotelLocation" TEXT;
ALTER TABLE "HotelFavorite" ADD COLUMN "hotelImage" TEXT;
ALTER TABLE "HotelFavorite" ADD COLUMN "updatedAt" TIMESTAMP(3);

-- Mevcut kayıtlar için varsayılan değerler
UPDATE "HotelFavorite" SET 
  "hotelName" = 'Unknown Hotel',
  "updatedAt" = "createdAt"
WHERE "hotelName" IS NULL;

-- hotelName zorunlu hale getiriliyor
ALTER TABLE "HotelFavorite" ALTER COLUMN "hotelName" SET NOT NULL;
ALTER TABLE "HotelFavorite" ALTER COLUMN "updatedAt" SET NOT NULL;
ALTER TABLE "HotelFavorite" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

