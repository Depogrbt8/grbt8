import { Metadata } from 'next';
import HakkimizdaPageClient from './HakkimizdaPageClient';

export const metadata: Metadata = {
  title: 'Hakkımızda - Gurbetbiz | Avrupa\'dan Türkiye\'ye Seyahat',
  description: 'Gurbetbiz hakkında bilgiler. Avrupa\'da yaşayan Türk gurbetçiler için özel olarak tasarlanmış seyahat platformu. Misyonumuz, vizyonumuz ve hizmetlerimiz.',
  keywords: [
    'gurbetbiz hakkında',
    'hakkımızda',
    'gurbetçi seyahat platformu',
    'Avrupa Türkiye seyahat',
    'gurbetçi hizmetleri'
  ],
  openGraph: {
    title: 'Hakkımızda - Gurbetbiz | Avrupa\'dan Türkiye\'ye Seyahat',
    description: 'Gurbetbiz hakkında bilgiler. Avrupa\'da yaşayan Türk gurbetçiler için özel olarak tasarlanmış seyahat platformu. Misyonumuz, vizyonumuz ve hizmetlerimiz.',
    type: 'website',
    url: 'https://gurbetbiz.app/hakkimizda',
  },
  alternates: {
    canonical: '/hakkimizda',
  },
};

export default function HakkimizdaPage() {
  return <HakkimizdaPageClient />;
}
