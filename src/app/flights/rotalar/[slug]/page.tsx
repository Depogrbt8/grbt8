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
        keyword: {
          contains: 'uçak',
        },
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
        keyword: {
          contains: 'uçak',
        },
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

    const title = generateBlogTitle(keyword.keyword);
    const description = generateBlogDescription(keyword.keyword);

    return {
      title,
      description,
      keywords: [keyword.keyword],
      openGraph: {
        title,
        description,
        type: 'website',
        url: `https://gurbetbiz.app/flights/rotalar/${params.slug}`,
      },
      alternates: {
        canonical: `/flights/rotalar/${params.slug}`,
      },
    };
  } catch (error) {
    console.error('generateMetadata error:', error);
    return {
      title: 'Uçuş Rotaları',
    };
  }
}

export default async function FlightRoutePage({ params }: { params: { slug: string } }) {
  try {
    const keywords = await prisma.seoKeyword.findMany({
      where: {
        keyword: {
          contains: 'uçak',
        },
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
      { name: 'Uçuş Rotaları', url: 'https://gurbetbiz.app/flights/search' },
      { name: keyword.keyword, url: `https://gurbetbiz.app/flights/rotalar/${params.slug}` }
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
        <LandingPageClient keyword={keyword.keyword} slug={params.slug} type="flight" />
      </>
    );
  } catch (error) {
    console.error('FlightRoutePage error:', error);
    notFound();
  }
}

