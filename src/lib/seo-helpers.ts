import { Metadata } from 'next';

/**
 * Sayfa bazlı SEO metadata oluşturur
 */
export function generatePageMetadata({
  title,
  description,
  path,
  keywords,
  image,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
}): Metadata {
  const baseUrl = 'https://gurbetbiz.app';
  const fullUrl = `${baseUrl}${path}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: 'Gurbet.biz',
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : [
            {
              url: '/images/gurbetbiz-og.png',
              width: 1200,
              height: 630,
              alt: title,
            },
          ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : ['/images/gurbetbiz-og.png'],
    },
  };
}

