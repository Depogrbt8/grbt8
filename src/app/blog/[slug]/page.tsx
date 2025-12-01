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
    const slugs: { slug: string }[] = [];

    // Manuel blog yazılarından slug'lar
    try {
      const blogPosts = await prisma.blogPost.findMany({
        where: { status: 'published' },
        select: { slug: true },
      });
      slugs.push(...blogPosts.map(post => ({ slug: post.slug })));
    } catch (e) {
      console.log('BlogPost table not ready yet');
    }

    // Keyword cluster'larından slug'lar
    const keywords = await prisma.seoKeyword.findMany({
      select: { keyword: true },
    });
    const allKeywordStrings = keywords.map(kw => kw.keyword);
    const clusters = clusterKeywords(allKeywordStrings);
    slugs.push(...clusters.map((cluster) => ({
      slug: getClusterSlug(cluster),
    })));

    return slugs;
  } catch (error) {
    console.error('generateStaticParams error:', error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    // Önce manuel blog'lardan ara
    try {
      const blogPost = await prisma.blogPost.findUnique({
        where: { slug: params.slug },
      });

      if (blogPost) {
        return {
          title: blogPost.title,
          description: blogPost.excerpt || undefined,
          openGraph: {
            title: blogPost.title,
            description: blogPost.excerpt || undefined,
            type: 'article',
            url: `https://gurbetbiz.app/blog/${params.slug}`,
            images: blogPost.coverImage ? [{ url: blogPost.coverImage }] : undefined,
          },
          alternates: {
            canonical: `/blog/${params.slug}`,
          },
        };
      }
    } catch (e) {
      console.log('BlogPost not found, checking clusters...');
    }

    // Bulunamazsa keyword cluster'larından ara
    const keywords = await prisma.seoKeyword.findMany({
      select: { keyword: true },
    });

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
    // Önce manuel blog'lardan ara
    try {
      const blogPost = await prisma.blogPost.findUnique({
        where: { slug: params.slug },
      });

      if (blogPost) {
        const breadcrumbItems = [
          { name: 'Ana Sayfa', url: 'https://gurbetbiz.app' },
          { name: 'Blog', url: 'https://gurbetbiz.app/blog' },
          { name: blogPost.title, url: `https://gurbetbiz.app/blog/${params.slug}` }
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
            <BlogDetailClient 
              blogPost={blogPost}
              slug={params.slug} 
            />
          </>
        );
      }
    } catch (e) {
      console.log('BlogPost not found, checking clusters...');
    }

    // Bulunamazsa keyword cluster'larından ara
    const keywords = await prisma.seoKeyword.findMany({
      select: { keyword: true },
    });

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

