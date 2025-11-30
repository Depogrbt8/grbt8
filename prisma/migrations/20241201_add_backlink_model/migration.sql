-- CreateTable
CREATE TABLE IF NOT EXISTS "Backlink" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "anchorText" TEXT,
    "type" TEXT NOT NULL DEFAULT 'dofollow',
    "status" TEXT NOT NULL DEFAULT 'active',
    "qualityScore" INTEGER NOT NULL DEFAULT 0,
    "domainAuthority" INTEGER,
    "pageAuthority" INTEGER,
    "notes" TEXT,
    "targetPage" TEXT,
    "lastChecked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Backlink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Backlink_url_key" ON "Backlink"("url");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Backlink_domain_idx" ON "Backlink"("domain");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Backlink_status_idx" ON "Backlink"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Backlink_qualityScore_idx" ON "Backlink"("qualityScore");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Backlink_lastChecked_idx" ON "Backlink"("lastChecked");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Backlink_createdAt_idx" ON "Backlink"("createdAt");

