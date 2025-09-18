-- AlterTable
ALTER TABLE "Passenger" ALTER COLUMN "birthDay" DROP NOT NULL,
ALTER COLUMN "birthMonth" DROP NOT NULL,
ALTER COLUMN "birthYear" DROP NOT NULL,
ALTER COLUMN "gender" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "name" TEXT,
    "tcNo" TEXT,
    "companyName" TEXT,
    "taxOffice" TEXT,
    "taxNo" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "Address"("userId");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
