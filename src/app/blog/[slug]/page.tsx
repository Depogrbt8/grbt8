import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogDetailClient from './BlogDetailClient';
import { generateSlug, generateBlogTitle, generateBlogDescription } from '@/lib/seo-content-generator';
import { clusterKeywords, getClusterSlug, getClusterTitle, getClusterDescription } from '@/lib/keyword-clustering';
import { prisma } from '@/lib/prisma';
import { breadcrumbSchema } from '@/lib/schemas';
import Script from 'next/script';

export async function generateStaticParams() {
  try {
    const keywords = await prisma.seoKeyword.findMany({
      select: { keyword: true },
    });

    // Cluster'lara göre slug'ları üret
    const allKeywordStrings = keywords.map(kw => kw.keyword);
    const clusters = clusterKeywords(allKeywordStrings);

    return clusters.map((cluster) => ({
      slug: getClusterSlug(cluster),
    }));
  } catch (error) {
    console.error('generateStaticParams error:', error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const keywords = await prisma.seoKeyword.findMany({
      select: { keyword: true },
    });

    // Cluster'ları oluştur ve slug'a göre bul
    const allKeywordStrings = keywords.map(kw => kw.keyword);
    const clusters = clusterKeywords(allKeywordStrings);
    
    const cluster = clusters.find(
      (c) => getClusterSlug(c) === params.slug
    );

    if (!cluster) {
      return {
        title: 'Blog Yazısı Bulunamadı',
      };
    }

    const title = getClusterTitle(cluster);
    const description = getClusterDescription(cluster);

    return {
      title,
      description,
      keywords: cluster.allKeywords,
      openGraph: {
        title,
        description,
        type: 'article',
        url: `https://gurbetbiz.app/blog/${params.slug}`,
      },
      alternates: {
        canonical: `/blog/${params.slug}`,
      },
    };
  } catch (error) {
    console.error('generateMetadata error:', error);
    return {
      title: 'Blog Yazısı',
    };
  }
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  try {
    const keywords = await prisma.seoKeyword.findMany({
      select: { keyword: true },
    });

    // Cluster'ları oluştur ve slug'a göre bul
    const allKeywordStrings = keywords.map(kw => kw.keyword);
    const clusters = clusterKeywords(allKeywordStrings);
    
    const cluster = clusters.find(
      (c) => getClusterSlug(c) === params.slug
    );

    if (!cluster) {
      notFound();
    }

    const breadcrumbItems = [
      { name: 'Ana Sayfa', url: 'https://gurbetbiz.app' },
      { name: 'Blog', url: 'https://gurbetbiz.app/blog' },
      { name: cluster.mainKeyword, url: `https://gurbetbiz.app/blog/${params.slug}` }
    ];

    return (
      <>
        <Script
          id={`breadcrumb-schema-${params.slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema(breadcrumbItems))
          }}
        />
        <BlogDetailClient cluster={cluster} slug={params.slug} />
      </>
    );
  } catch (error) {
    console.error('BlogDetailPage error:', error);
    notFound();
  }
}

