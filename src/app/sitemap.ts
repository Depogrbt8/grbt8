import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://gurbetbiz.app'
  
  // Static pages - Only real, existing pages
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
    // Ülke bazlı landing page'ler - SEO için yüksek öncelikli
    {
      url: `${baseUrl}/almanya-turkiye-ucak-bileti`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/fransa-turkiye-ucak-bileti`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/hollanda-turkiye-ucak-bileti`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/belcika-turkiye-ucak-bileti`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/avusturya-turkiye-ucak-bileti`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/isvicre-turkiye-ucak-bileti`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95,
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

  // Blog sayfalarını ekle - SADECE MANUEL BLOGLAR
  const blogPages: MetadataRoute.Sitemap = [];
  
  try {
    // Manuel blog yazılarını al (otomatik keyword cluster'ları KALDIRıLDI)
    const blogPosts = await prisma.blogPost.findMany({
      where: { status: 'published' },
      select: { 
        slug: true, 
        updatedAt: true 
      },
    });

    blogPosts.forEach(post => {
      blogPages.push({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });

    console.log(`📊 Sitemap: ${staticPages.length} statik sayfa + ${blogPosts.length} blog yazısı = ${staticPages.length + blogPosts.length} toplam sayfa`);
  } catch (error) {
    console.log('Blog posts not available for sitemap:', error);
  }

  return [...staticPages, ...blogPages];
}
