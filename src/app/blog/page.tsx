import { Metadata } from 'next';
import BlogPageClient from './BlogPageClient';

export const metadata: Metadata = {
  title: 'Gurbetbiz Blog - Gurbetçiler İçin Seyahat Rehberi ve İpuçları',
  description: 'Avrupa\'dan Türkiye\'ye seyahat rehberleri, uçak bileti ipuçları, otel önerileri ve araç kiralama kılavuzları. Gurbetçiler için özel seyahat içerikleri.',
  keywords: [
    'gurbetçi blog',
    'seyahat rehberi',
    'uçak bileti ipuçları',
    'otel önerileri',
    'araç kiralama rehberi',
    'vatan yolculuğu',
    'gurbetçi seyahat',
    'Türkiye seyahat'
  ],
  openGraph: {
    title: 'Gurbetbiz Blog - Gurbetçiler İçin Seyahat Rehberi ve İpuçları',
    description: 'Avrupa\'dan Türkiye\'ye seyahat rehberleri, uçak bileti ipuçları, otel önerileri ve araç kiralama kılavuzları. Gurbetçiler için özel seyahat içerikleri.',
    type: 'website',
    url: 'https://gurbetbiz.app/blog',
  },
  alternates: {
    canonical: '/blog',
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}
