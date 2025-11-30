-- CreateTable
CREATE TABLE IF NOT EXISTS "SeoSettings" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "siteDescription" TEXT NOT NULL,
    "siteUrl" TEXT NOT NULL,
    "defaultTitle" TEXT NOT NULL,
    "defaultDescription" TEXT NOT NULL,
    "defaultKeywords" TEXT NOT NULL,
    "googleAnalytics" TEXT,
    "googleSearchConsole" TEXT,
    "facebookPixel" TEXT,
    "bingWebmaster" TEXT,
    "twitterSite" TEXT,
    "twitterCreator" TEXT,
    "schemaOrgJson" TEXT,
    "robotsTxt" TEXT,
    "sitemapUrl" TEXT,
    "faviconUrl" TEXT,
    "logoUrl" TEXT,
    "ogImageUrl" TEXT,
    "twitterImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SeoSettings_siteName_idx" ON "SeoSettings"("siteName");

