import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Tablo yoksa oluştur - try-catch ile güvenli
    try {
      // Önce tablo var mı kontrol et
      const tableCheck = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'SeoSettings'
        );
      `;
      
      const tableExists = (tableCheck as any)[0]?.exists || false;
      
      if (!tableExists) {
        // Tablo yoksa oluştur
        await prisma.$executeRawUnsafe(`
          CREATE TABLE "SeoSettings" (
            "id" TEXT NOT NULL,
            "siteName" TEXT NOT NULL DEFAULT 'gurbetbiz.app',
            "siteDescription" TEXT NOT NULL DEFAULT 'Avrupa''dan Türkiye''ye yol arkadaşınız',
            "siteUrl" TEXT NOT NULL DEFAULT 'https://gurbetbiz.app',
            "defaultTitle" TEXT NOT NULL DEFAULT 'gurbetbiz.app',
            "defaultDescription" TEXT NOT NULL DEFAULT 'Avrupa''dan Türkiye''ye uçak bileti',
            "defaultKeywords" TEXT NOT NULL DEFAULT 'uçak bileti',
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
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "SeoSettings_pkey" PRIMARY KEY ("id")
          );
        `);
        
        await prisma.$executeRawUnsafe(`
          CREATE INDEX IF NOT EXISTS "SeoSettings_siteName_idx" ON "SeoSettings"("siteName");
        `);
      }
    } catch (createError: any) {
      // Tablo zaten varsa veya başka hata varsa devam et
      console.log('Table check/create error (continuing):', createError?.message);
    }

    // Prisma Client ile veriyi çek - hata olursa raw query kullan
    let settings;
    try {
      settings = await prisma.seoSettings.findFirst();
    } catch (prismaError: any) {
      // Prisma Client hatası - raw query ile dene
      console.log('Prisma Client error, using raw query:', prismaError?.message);
      const rawSettings = await prisma.$queryRawUnsafe(`
        SELECT * FROM "SeoSettings" LIMIT 1;
      `);
      settings = (rawSettings as any[])[0] || null;
    }
    
    if (!settings) {
      // Default settings oluştur
      const defaultSettings = await prisma.seoSettings.create({
        data: {
          siteName: 'gurbetbiz.app',
          siteDescription: 'Avrupa\'dan Türkiye\'ye yol arkadaşınız',
          siteUrl: 'https://gurbetbiz.app',
          defaultTitle: 'gurbetbiz.app - Avrupa\'dan Türkiye\'ye yol arkadaşınız',
          defaultDescription: 'Avrupa\'dan Türkiye\'ye uçak bileti, otel rezervasyonu ve araç kiralama. En uygun fiyatlar, anında rezervasyon, güvenli ödeme, 7/24 destek.',
          defaultKeywords: 'uçak bileti, yurt dışı seyahat, otel rezervasyonu, araç kiralama, gurbet, seyahat platformu',
          robotsTxt: `User-agent: *
Disallow: /

User-agent: Googlebot
Disallow: /

User-agent: Bingbot
Disallow: /`,
        }
      });
      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('SEO Settings GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Mevcut kaydı bul - Prisma Client hatası olursa raw query kullan
    let existing;
    try {
      existing = await prisma.seoSettings.findFirst();
    } catch (prismaError: any) {
      // Prisma Client hatası - raw query ile dene
      console.log('Prisma Client error in POST, using raw query:', prismaError?.message);
      const rawExisting = await prisma.$queryRawUnsafe(`
        SELECT * FROM "SeoSettings" LIMIT 1;
      `);
      existing = (rawExisting as any[])[0] || null;
    }
    
    const settingsData = {
      siteName: data.siteName || 'gurbetbiz.app',
      siteDescription: data.siteDescription || 'Avrupa\'dan Türkiye\'ye yol arkadaşınız',
      siteUrl: data.siteUrl || 'https://gurbetbiz.app',
      defaultTitle: data.defaultTitle || 'gurbetbiz.app - Avrupa\'dan Türkiye\'ye yol arkadaşınız',
      defaultDescription: data.defaultDescription || 'Avrupa\'dan Türkiye\'ye uçak bileti, otel rezervasyonu ve araç kiralama. En uygun fiyatlar, anında rezervasyon, güvenli ödeme, 7/24 destek.',
      defaultKeywords: data.defaultKeywords || 'uçak bileti, yurt dışı seyahat, otel rezervasyonu, araç kiralama, gurbet, seyahat platformu',
      googleAnalytics: data.googleAnalytics || null,
      googleSearchConsole: data.googleSearchConsole || null,
      facebookPixel: data.facebookPixel || null,
      bingWebmaster: data.bingWebmaster || null,
      twitterSite: data.twitterSite || null,
      twitterCreator: data.twitterCreator || null,
      schemaOrgJson: data.schemaOrgJson || null,
      robotsTxt: data.robotsTxt || null,
      sitemapUrl: data.sitemapUrl || null,
      faviconUrl: data.faviconUrl || null,
      logoUrl: data.logoUrl || null,
      ogImageUrl: data.ogImageUrl || null,
      twitterImageUrl: data.twitterImageUrl || null,
    };
    
    let settings;
    try {
      if (existing) {
        // Mevcut kaydı güncelle
        settings = await prisma.seoSettings.update({
          where: { id: existing.id },
          data: settingsData,
        });
      } else {
        // Yeni kayıt oluştur
        settings = await prisma.seoSettings.create({
          data: settingsData,
        });
      }
    } catch (prismaError: any) {
      // Prisma Client hatası - raw SQL ile yap
      console.log('Prisma Client error in save, using raw SQL:', prismaError?.message);
      
      if (existing) {
        // UPDATE with raw SQL
        const updateFields = Object.keys(settingsData)
          .map(key => `"${key}" = $${Object.keys(settingsData).indexOf(key) + 1}`)
          .join(', ');
        const values = Object.values(settingsData);
        
        await prisma.$executeRawUnsafe(
          `UPDATE "SeoSettings" SET ${updateFields}, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $${values.length + 1}`,
          ...values,
          existing.id
        );
        
        // Tekrar oku
        const updated = await prisma.$queryRawUnsafe(`
          SELECT * FROM "SeoSettings" WHERE "id" = '${existing.id}';
        `);
        settings = (updated as any[])[0];
      } else {
        // INSERT with raw SQL
        const id = `c${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        const fields = Object.keys(settingsData).map(k => `"${k}"`).join(', ');
        const placeholders = Object.keys(settingsData).map((_, i) => `$${i + 1}`).join(', ');
        const values = Object.values(settingsData);
        
        await prisma.$executeRawUnsafe(
          `INSERT INTO "SeoSettings" ("id", ${fields}, "createdAt", "updatedAt") 
           VALUES ('${id}', ${placeholders}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          ...values
        );
        
        // Tekrar oku
        const inserted = await prisma.$queryRawUnsafe(`
          SELECT * FROM "SeoSettings" WHERE "id" = '${id}';
        `);
        settings = (inserted as any[])[0];
      }
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('SEO Settings POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
