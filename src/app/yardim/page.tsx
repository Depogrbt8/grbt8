import { Metadata } from 'next';
import YardimPageClient from './YardimPageClient';

export const metadata: Metadata = {
  title: 'Sık Sorulan Sorular - Gurbetbiz | Yardım Merkezi',
  description: 'Gurbetbiz yardım merkezi ve sık sorulan sorular. Uçak bileti rezervasyonu, iptal, check-in ve PNR sorgulama hakkında tüm sorularınızın cevapları.',
  keywords: [
    'gurbetbiz yardım',
    'sık sorulan sorular',
    'uçak bileti yardım',
    'rezervasyon yardımı',
    'PNR sorgulama',
    'check-in yardım'
  ],
  openGraph: {
    title: 'Sık Sorulan Sorular - Gurbetbiz | Yardım Merkezi',
    description: 'Gurbetbiz yardım merkezi ve sık sorulan sorular. Uçak bileti rezervasyonu, iptal, check-in ve PNR sorgulama hakkında tüm sorularınızın cevapları.',
    type: 'website',
    url: 'https://gurbetbiz.app/yardim',
  },
  alternates: {
    canonical: '/yardim',
  },
};

export default function YardimPage() {
  return <YardimPageClient />;
}
