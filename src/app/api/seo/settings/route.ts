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
          siteName: 'gurbetbiz.com',
          siteDescription: 'Avrupa\'dan Türkiye\'ye yol arkadaşınız',
          siteUrl: 'https://gurbetbiz.app',
          defaultTitle: 'gurbetbiz.com - Avrupa\'dan Türkiye\'ye yol arkadaşınız',
          defaultDescription: 'Yurt dışı seyahatleriniz için en uygun fiyatlı uçak bileti, otel ve araç kiralama hizmetleri.',
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
    
    const settings = await prisma.seoSettings.upsert({
      where: { id: data.id || 'default' },
      update: {
        siteName: data.siteName,
        siteDescription: data.siteDescription,
        siteUrl: data.siteUrl,
        defaultTitle: data.defaultTitle,
        defaultDescription: data.defaultDescription,
        defaultKeywords: data.defaultKeywords,
        googleAnalytics: data.googleAnalytics,
        googleSearchConsole: data.googleSearchConsole,
        facebookPixel: data.facebookPixel,
        twitterSite: data.twitterSite,
        twitterCreator: data.twitterCreator,
        schemaOrgJson: data.schemaOrgJson,
        robotsTxt: data.robotsTxt,
        sitemapUrl: data.sitemapUrl,
        faviconUrl: data.faviconUrl,
        logoUrl: data.logoUrl,
        ogImageUrl: data.ogImageUrl,
        twitterImageUrl: data.twitterImageUrl,
        updatedAt: new Date(),
      },
      create: {
        siteName: data.siteName,
        siteDescription: data.siteDescription,
        siteUrl: data.siteUrl,
        defaultTitle: data.defaultTitle,
        defaultDescription: data.defaultDescription,
        defaultKeywords: data.defaultKeywords,
        googleAnalytics: data.googleAnalytics,
        googleSearchConsole: data.googleSearchConsole,
        facebookPixel: data.facebookPixel,
        twitterSite: data.twitterSite,
        twitterCreator: data.twitterCreator,
        schemaOrgJson: data.schemaOrgJson,
        robotsTxt: data.robotsTxt,
        sitemapUrl: data.sitemapUrl,
        faviconUrl: data.faviconUrl,
        logoUrl: data.logoUrl,
        ogImageUrl: data.ogImageUrl,
        twitterImageUrl: data.twitterImageUrl,
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('SEO Settings POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
