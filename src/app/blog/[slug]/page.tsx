import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogDetailClient from './BlogDetailClient';
import { prisma } from '@/lib/prisma';
import { breadcrumbSchema } from '@/lib/schemas';
import Script from 'next/script';

export async function generateStaticParams() {
  try {
    // Sadece manuel blog yazılarından slug'lar (otomatik keyword cluster'lar KALDIRILDI)
    const blogPosts = await prisma.blogPost.findMany({
      where: { status: 'published' },
      select: { slug: true },
    });
    
    return blogPosts.map(post => ({ slug: post.slug }));
  } catch (error) {
    console.error('generateStaticParams error:', error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    // Sadece manuel blog yazılarından ara (keyword cluster sistemi KALDIRILDI)
    const blogPost = await prisma.blogPost.findUnique({
      where: { slug: params.slug },
    });

    if (!blogPost) {
      return {
        title: 'Blog Yazısı Bulunamadı',
      };
    }

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
  } catch (error) {
    console.error('generateMetadata error:', error);
    return {
      title: 'Blog Yazısı',
    };
  }
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  try {
    // Sadece manuel blog yazılarından ara (keyword cluster sistemi KALDIRILDI)
    const blogPost = await prisma.blogPost.findUnique({
      where: { slug: params.slug },
    });

    if (!blogPost) {
      notFound();
    }

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
  } catch (error) {
    console.error('BlogDetailPage error:', error);
    notFound();
  }
}

