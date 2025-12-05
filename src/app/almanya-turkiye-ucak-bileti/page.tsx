import { Metadata } from 'next';
import CountryLandingPage from '@/components/CountryLandingPage';
import Script from 'next/script';
import { breadcrumbSchema, faqSchema } from '@/lib/schemas';

export const metadata: Metadata = {
  title: '🇩🇪 Almanya\'dan Türkiye\'ye Uçak Bileti | En Ucuz Fiyatlar',
  description: 'Almanya\'dan Türkiye\'ye uçak bileti arıyorsanız doğru yerdesiniz! Berlin, Frankfurt, Münih, Düsseldorf\'tan İstanbul, Ankara, İzmir\'e en uygun fiyatlarla uçun. ✈️ 89€\'dan başlayan fiyatlar!',
  keywords: [
    'almanya türkiye uçak bileti',
    'almanyadan türkiyeye uçak',
    'berlin istanbul uçak bileti',
    'frankfurt ankara uçak bileti',
    'düsseldorf izmir uçak bileti',
    'münih antalya uçak bileti',
    'almanya türkiye ucuz uçuş',
    'gurbetçi uçak bileti',
  ],
  openGraph: {
    title: '🇩🇪 Almanya\'dan Türkiye\'ye Uçak Bileti | Gurbetbiz',
    description: 'Almanya\'dan Türkiye\'ye en ucuz uçak biletleri! Berlin, Frankfurt, Münih\'ten İstanbul, Ankara, İzmir\'e ✈️ 89€\'dan başlayan fiyatlar.',
    url: 'https://gurbetbiz.app/almanya-turkiye-ucak-bileti',
    type: 'website',
    locale: 'tr_DE',
  },
  alternates: {
    canonical: '/almanya-turkiye-ucak-bileti',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const popularRoutes = [
  { from: 'Berlin', to: 'İstanbul', price: '89€' },
  { from: 'Frankfurt', to: 'Ankara', price: '99€' },
  { from: 'Düsseldorf', to: 'İzmir', price: '109€' },
  { from: 'Münih', to: 'Antalya', price: '119€' },
  { from: 'Hamburg', to: 'İstanbul', price: '95€' },
  { from: 'Köln', to: 'Trabzon', price: '129€' },
];

const cities = [
  'Berlin', 'Frankfurt', 'Münih', 'Düsseldorf', 'Hamburg', 
  'Köln', 'Stuttgart', 'Hannover', 'Nürnberg', 'Bremen'
];

const faqs = [
  {
    question: "Almanya'dan Türkiye'ye en ucuz uçuşlar ne zaman?",
    answer: "Genellikle hafta içi uçuşlar ve sezon dışı dönemler (Ocak-Şubat, Kasım) daha uygun fiyatlıdır. En iyi fiyatlar için 2-3 ay önceden rezervasyon yapmanızı öneririz."
  },
  {
    question: "Hangi havayolları Almanya - Türkiye seferi yapıyor?",
    answer: "Turkish Airlines, Pegasus, SunExpress, Lufthansa ve çeşitli Avrupa havayolları düzenli seferler düzenlemektedir."
  },
  {
    question: "Almanya'dan Türkiye'ye uçuş süresi ne kadar?",
    answer: "Almanya'dan Türkiye'ye direkt uçuşlar ortalama 3-3.5 saat sürmektedir. Aktarmalı uçuşlar daha uzun sürebilir."
  }
];

const breadcrumbItems = [
  { name: 'Ana Sayfa', url: 'https://gurbetbiz.app' },
  { name: 'Almanya Türkiye Uçak Bileti', url: 'https://gurbetbiz.app/almanya-turkiye-ucak-bileti' }
];

export default function AlmanyaTurkiyePage() {
  return (
    <>
      <Script
        id="breadcrumb-schema-almanya"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(breadcrumbItems))
        }}
      />
      <Script
        id="faq-schema-almanya"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema(faqs))
        }}
      />
      <CountryLandingPage
        country="Almanya"
        countryCode="DE"
        flag="🇩🇪"
        cities={cities}
        popularRoutes={popularRoutes}
      />
    </>
  );
}

