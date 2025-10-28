-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "customerNo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_customerNo_key" ON "User"("customerNo") WHERE "customerNo" IS NOT NULL;

