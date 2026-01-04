-- CreateTable
CREATE TABLE "HotelFavorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HotelFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HotelFavorite_userId_hotelId_key" ON "HotelFavorite"("userId", "hotelId");

-- CreateIndex
CREATE INDEX "HotelFavorite_userId_createdAt_idx" ON "HotelFavorite"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "HotelFavorite_hotelId_idx" ON "HotelFavorite"("hotelId");

-- AddForeignKey
ALTER TABLE "HotelFavorite" ADD CONSTRAINT "HotelFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

