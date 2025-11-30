import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/seo-content-generator'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://gurbetbiz.app'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/flights/search`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/flights/booking`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/check-in`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/hakkimizda`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/yardim`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/gizlilik-politikasi`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/kullanim-sartlari`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cerez-politikasi`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/kvkk`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/bilet-iptal`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/pnr-sorgula`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // Dynamic pages from keywords
  try {
    const keywords = await prisma.seoKeyword.findMany({
      select: { keyword: true, updatedAt: true },
    });

    const dynamicPages: MetadataRoute.Sitemap = [];

    // Blog pages
    keywords.forEach((kw) => {
      const slug = generateSlug(kw.keyword);
      dynamicPages.push({
        url: `${baseUrl}/blog/${slug}`,
        lastModified: kw.updatedAt || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      });

      // Flight route pages
      if (kw.keyword.includes('uçak') || kw.keyword.includes('uçuş')) {
        dynamicPages.push({
          url: `${baseUrl}/flights/rotalar/${slug}`,
          lastModified: kw.updatedAt || new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        });
      }

      // Hotel pages
      if (kw.keyword.includes('otel') || kw.keyword.includes('hotel')) {
        dynamicPages.push({
          url: `${baseUrl}/otel/${slug}`,
          lastModified: kw.updatedAt || new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        });
      }

      // Villa pages
      if (kw.keyword.includes('villa')) {
        dynamicPages.push({
          url: `${baseUrl}/villa/${slug}`,
          lastModified: kw.updatedAt || new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        });
      }

      // Car rental pages
      if (kw.keyword.includes('araç') || kw.keyword.includes('araba') || 
          kw.keyword.includes('rent') || kw.keyword.includes('kiralama')) {
        dynamicPages.push({
          url: `${baseUrl}/arac-kiralama/${slug}`,
          lastModified: kw.updatedAt || new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        });
      }
    });

    return [...staticPages, ...dynamicPages];
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return staticPages;
  }
}
