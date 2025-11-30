import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogDetailClient from './BlogDetailClient';
import { generateSlug, generateBlogTitle, generateBlogDescription } from '@/lib/seo-content-generator';
import { prisma } from '@/lib/prisma';
import { breadcrumbSchema } from '@/lib/schemas';
import Script from 'next/script';

export async function generateStaticParams() {
  try {
    const keywords = await prisma.seoKeyword.findMany({
      select: { keyword: true },
    });

    return keywords.map((kw) => ({
      slug: generateSlug(kw.keyword),
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

    const keyword = keywords.find(
      (kw) => generateSlug(kw.keyword) === params.slug
    );

    if (!keyword) {
      return {
        title: 'Blog Yazısı Bulunamadı',
      };
    }

    const title = generateBlogTitle(keyword.keyword);
    const description = generateBlogDescription(keyword.keyword);

    return {
      title,
      description,
      keywords: [keyword.keyword],
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

    const keyword = keywords.find(
      (kw) => generateSlug(kw.keyword) === params.slug
    );

    if (!keyword) {
      notFound();
    }

    const breadcrumbItems = [
      { name: 'Ana Sayfa', url: 'https://gurbetbiz.app' },
      { name: 'Blog', url: 'https://gurbetbiz.app/blog' },
      { name: keyword.keyword, url: `https://gurbetbiz.app/blog/${params.slug}` }
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
        <BlogDetailClient keyword={keyword.keyword} slug={params.slug} />
      </>
    );
  } catch (error) {
    console.error('BlogDetailPage error:', error);
    notFound();
  }
}

