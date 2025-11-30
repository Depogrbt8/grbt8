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

    const settings = await prisma.seoSettings.findFirst();
    
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
    
    // Mevcut kaydı bul
    const existing = await prisma.seoSettings.findFirst();
    
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

    return NextResponse.json(settings);
  } catch (error) {
    console.error('SEO Settings POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
