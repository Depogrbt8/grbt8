import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LandingPageClient from './LandingPageClient';
import { generateSlug, generateBlogTitle, generateBlogDescription } from '@/lib/seo-content-generator';
import { prisma } from '@/lib/prisma';
import { breadcrumbSchema } from '@/lib/schemas';
import Script from 'next/script';

export async function generateStaticParams() {
  try {
    const keywords = await prisma.seoKeyword.findMany({
      where: {
        OR: [
          { keyword: { contains: 'otel' } },
          { keyword: { contains: 'hotel' } },
        ],
      },
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
      where: {
        OR: [
          { keyword: { contains: 'otel' } },
          { keyword: { contains: 'hotel' } },
        ],
      },
      select: { keyword: true },
    });

    const keyword = keywords.find(
      (kw) => generateSlug(kw.keyword) === params.slug
    );

    if (!keyword) {
      return {
        title: 'Sayfa Bulunamadı',
      };
    }

    const blogSlug = generateSlug(keyword.keyword);
    const title = `${keyword.keyword} | Hemen Rezervasyon Yap`;
    const description = `${keyword.keyword} için en uygun fiyatları Gurbetbiz'de bulun. Anında rezervasyon, güvenli ödeme, 7/24 destek.`;

    return {
      title,
      description,
      keywords: [keyword.keyword],
      openGraph: {
        title,
        description,
        type: 'website',
        url: `https://gurbetbiz.app/otel/${params.slug}`,
      },
      alternates: {
        canonical: `/blog/${blogSlug}`, // Landing page blog'a canonical point ediyor
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    console.error('generateMetadata error:', error);
    return {
      title: 'Otel Rezervasyonu',
    };
  }
}

export default async function HotelPage({ params }: { params: { slug: string } }) {
  try {
    const keywords = await prisma.seoKeyword.findMany({
      where: {
        OR: [
          { keyword: { contains: 'otel' } },
          { keyword: { contains: 'hotel' } },
        ],
      },
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
      { name: 'Otel Rezervasyonu', url: 'https://gurbetbiz.app' },
      { name: keyword.keyword, url: `https://gurbetbiz.app/otel/${params.slug}` }
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
        <LandingPageClient keyword={keyword.keyword} slug={params.slug} type="hotel" />
      </>
    );
  } catch (error) {
    console.error('HotelPage error:', error);
    notFound();
  }
}

