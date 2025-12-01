-- Backlink tablosunu oluştur (eğer yoksa)
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

-- Index'leri oluştur
CREATE UNIQUE INDEX IF NOT EXISTS "Backlink_url_key" ON "Backlink"("url");
CREATE INDEX IF NOT EXISTS "Backlink_domain_idx" ON "Backlink"("domain");
CREATE INDEX IF NOT EXISTS "Backlink_status_idx" ON "Backlink"("status");
CREATE INDEX IF NOT EXISTS "Backlink_qualityScore_idx" ON "Backlink"("qualityScore");
CREATE INDEX IF NOT EXISTS "Backlink_lastChecked_idx" ON "Backlink"("lastChecked");
CREATE INDEX IF NOT EXISTS "Backlink_createdAt_idx" ON "Backlink"("createdAt");

-- 13 Backlink'i ekle (UPSERT mantığı ile)

-- 1. Avrupa Postası
INSERT INTO "Backlink" (id, url, domain, "anchorText", type, status, "qualityScore")
VALUES (gen_random_uuid()::text, 'https://www.avrupa-postasi.com', 'avrupa-postasi.com', 'Avrupa Postası', 'dofollow', 'active', 70)
ON CONFLICT (url) DO UPDATE SET
  domain = EXCLUDED.domain,
  "anchorText" = EXCLUDED."anchorText",
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  "qualityScore" = EXCLUDED."qualityScore",
  "updatedAt" = CURRENT_TIMESTAMP;

-- 2. Berlin Türk
INSERT INTO "Backlink" (id, url, domain, "anchorText", type, status, "qualityScore")
VALUES (gen_random_uuid()::text, 'https://www.berlinturk.de', 'berlinturk.de', 'Berlin Türk', 'dofollow', 'active', 65)
ON CONFLICT (url) DO UPDATE SET
  domain = EXCLUDED.domain,
  "anchorText" = EXCLUDED."anchorText",
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  "qualityScore" = EXCLUDED."qualityScore",
  "updatedAt" = CURRENT_TIMESTAMP;

-- 3. Artı 33
INSERT INTO "Backlink" (id, url, domain, "anchorText", type, status, "qualityScore")
VALUES (gen_random_uuid()::text, 'https://www.arti33.com', 'arti33.com', 'Artı 33', 'dofollow', 'active', 60)
ON CONFLICT (url) DO UPDATE SET
  domain = EXCLUDED.domain,
  "anchorText" = EXCLUDED."anchorText",
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  "qualityScore" = EXCLUDED."qualityScore",
  "updatedAt" = CURRENT_TIMESTAMP;

-- 4. Son Haber
INSERT INTO "Backlink" (id, url, domain, "anchorText", type, status, "qualityScore")
VALUES (gen_random_uuid()::text, 'https://www.sonhaber.eu', 'sonhaber.eu', 'Son Haber', 'dofollow', 'active', 65)
ON CONFLICT (url) DO UPDATE SET
  domain = EXCLUDED.domain,
  "anchorText" = EXCLUDED."anchorText",
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  "qualityScore" = EXCLUDED."qualityScore",
  "updatedAt" = CURRENT_TIMESTAMP;

-- 5. ETS Tur
INSERT INTO "Backlink" (id, url, domain, "anchorText", type, status, "qualityScore")
VALUES (gen_random_uuid()::text, 'https://www.etstur.com', 'etstur.com', 'ETS Tur', 'nofollow', 'active', 80)
ON CONFLICT (url) DO UPDATE SET
  domain = EXCLUDED.domain,
  "anchorText" = EXCLUDED."anchorText",
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  "qualityScore" = EXCLUDED."qualityScore",
  "updatedAt" = CURRENT_TIMESTAMP;

-- 6. Yolcu360
INSERT INTO "Backlink" (id, url, domain, "anchorText", type, status, "qualityScore")
VALUES (gen_random_uuid()::text, 'https://www.yolcu360.com', 'yolcu360.com', 'Yolcu360', 'nofollow', 'active', 75)
ON CONFLICT (url) DO UPDATE SET
  domain = EXCLUDED.domain,
  "anchorText" = EXCLUDED."anchorText",
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  "qualityScore" = EXCLUDED."qualityScore",
  "updatedAt" = CURRENT_TIMESTAMP;

-- 7. TatilSepeti
INSERT INTO "Backlink" (id, url, domain, "anchorText", type, status, "qualityScore")
VALUES (gen_random_uuid()::text, 'https://www.tatilsepeti.com', 'tatilsepeti.com', 'TatilSepeti', 'nofollow', 'active', 85)
ON CONFLICT (url) DO UPDATE SET
  domain = EXCLUDED.domain,
  "anchorText" = EXCLUDED."anchorText",
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  "qualityScore" = EXCLUDED."qualityScore",
  "updatedAt" = CURRENT_TIMESTAMP;

-- 8. Enuygun
INSERT INTO "Backlink" (id, url, domain, "anchorText", type, status, "qualityScore")
VALUES (gen_random_uuid()::text, 'https://www.enuygun.com', 'enuygun.com', 'Enuygun', 'nofollow', 'active', 90)
ON CONFLICT (url) DO UPDATE SET
  domain = EXCLUDED.domain,
  "anchorText" = EXCLUDED."anchorText",
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  "qualityScore" = EXCLUDED."qualityScore",
  "updatedAt" = CURRENT_TIMESTAMP;

-- 9. Turkish Airlines
INSERT INTO "Backlink" (id, url, domain, "anchorText", type, status, "qualityScore")
VALUES (gen_random_uuid()::text, 'https://www.turkishairlines.com', 'turkishairlines.com', 'Turkish Airlines', 'nofollow', 'active', 95)
ON CONFLICT (url) DO UPDATE SET
  domain = EXCLUDED.domain,
  "anchorText" = EXCLUDED."anchorText",
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  "qualityScore" = EXCLUDED."qualityScore",
  "updatedAt" = CURRENT_TIMESTAMP;

-- 10. Pegasus
INSERT INTO "Backlink" (id, url, domain, "anchorText", type, status, "qualityScore")
VALUES (gen_random_uuid()::text, 'https://www.flypgs.com', 'flypgs.com', 'Pegasus', 'nofollow', 'active', 90)
ON CONFLICT (url) DO UPDATE SET
  domain = EXCLUDED.domain,
  "anchorText" = EXCLUDED."anchorText",
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  "qualityScore" = EXCLUDED."qualityScore",
  "updatedAt" = CURRENT_TIMESTAMP;

-- 11. SunExpress
INSERT INTO "Backlink" (id, url, domain, "anchorText", type, status, "qualityScore")
VALUES (gen_random_uuid()::text, 'https://www.sunexpress.com', 'sunexpress.com', 'SunExpress', 'nofollow', 'active', 85)
ON CONFLICT (url) DO UPDATE SET
  domain = EXCLUDED.domain,
  "anchorText" = EXCLUDED."anchorText",
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  "qualityScore" = EXCLUDED."qualityScore",
  "updatedAt" = CURRENT_TIMESTAMP;

-- 12. Corendon Airlines
INSERT INTO "Backlink" (id, url, domain, "anchorText", type, status, "qualityScore")
VALUES (gen_random_uuid()::text, 'https://www.corendonairlines.com', 'corendonairlines.com', 'Corendon Airlines', 'nofollow', 'active', 80)
ON CONFLICT (url) DO UPDATE SET
  domain = EXCLUDED.domain,
  "anchorText" = EXCLUDED."anchorText",
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  "qualityScore" = EXCLUDED."qualityScore",
  "updatedAt" = CURRENT_TIMESTAMP;

-- 13. TUIFly
INSERT INTO "Backlink" (id, url, domain, "anchorText", type, status, "qualityScore")
VALUES (gen_random_uuid()::text, 'https://www.tuifly.be', 'tuifly.be', 'TUIFly', 'nofollow', 'active', 75)
ON CONFLICT (url) DO UPDATE SET
  domain = EXCLUDED.domain,
  "anchorText" = EXCLUDED."anchorText",
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  "qualityScore" = EXCLUDED."qualityScore",
  "updatedAt" = CURRENT_TIMESTAMP;

-- Başarı mesajı
SELECT 'Backlink ekleme tamamlandı! 13 backlink eklendi/güncellendi.' AS sonuc;

