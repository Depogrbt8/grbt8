import { Metadata } from 'next';
import CountryLandingPage from '@/components/CountryLandingPage';
import Script from 'next/script';
import { breadcrumbSchema, faqSchema } from '@/lib/schemas';

export const metadata: Metadata = {
  title: '🇦🇹 Avusturya\'dan Türkiye\'ye Uçak Bileti | En Ucuz Fiyatlar',
  description: 'Avusturya\'dan Türkiye\'ye uçak bileti arıyorsanız doğru yerdesiniz! Viyana, Salzburg, Graz\'dan İstanbul, Ankara, İzmir\'e en uygun fiyatlarla uçun. ✈️ 95€\'dan başlayan fiyatlar!',
  keywords: [
    'avusturya türkiye uçak bileti',
    'avusturyadan türkiyeye uçak',
    'viyana istanbul uçak bileti',
    'salzburg ankara uçak bileti',
    'graz izmir uçak bileti',
    'avusturya türkiye ucuz uçuş',
    'gurbetçi uçak bileti',
  ],
  openGraph: {
    title: '🇦🇹 Avusturya\'dan Türkiye\'ye Uçak Bileti | Gurbetbiz',
    description: 'Avusturya\'dan Türkiye\'ye en ucuz uçak biletleri! Viyana, Salzburg\'dan İstanbul, Ankara\'ya ✈️ 95€\'dan başlayan fiyatlar.',
    url: 'https://gurbetbiz.app/avusturya-turkiye-ucak-bileti',
    type: 'website',
    locale: 'tr_AT',
  },
  alternates: {
    canonical: '/avusturya-turkiye-ucak-bileti',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const popularRoutes = [
  { from: 'Viyana', to: 'İstanbul', price: '95€' },
  { from: 'Salzburg', to: 'Ankara', price: '109€' },
  { from: 'Graz', to: 'İzmir', price: '115€' },
  { from: 'Viyana', to: 'Antalya', price: '105€' },
  { from: 'Innsbruck', to: 'Trabzon', price: '125€' },
  { from: 'Linz', to: 'Bodrum', price: '119€' },
];

const cities = [
  'Viyana', 'Salzburg', 'Graz', 'Innsbruck', 'Linz',
  'Klagenfurt', 'Villach', 'Wels', 'St. Pölten', 'Dornbirn'
];

const faqs = [
  {
    question: "Avusturya'dan Türkiye'ye en ucuz uçuşlar ne zaman?",
    answer: "Genellikle hafta içi uçuşlar ve sezon dışı dönemler (Ocak-Şubat, Kasım) daha uygun fiyatlıdır. En iyi fiyatlar için 2-3 ay önceden rezervasyon yapmanızı öneririz."
  },
  {
    question: "Hangi havayolları Avusturya - Türkiye seferi yapıyor?",
    answer: "Turkish Airlines, Pegasus, Austrian Airlines ve SunExpress düzenli seferler düzenlemektedir."
  },
  {
    question: "Avusturya'dan Türkiye'ye uçuş süresi ne kadar?",
    answer: "Avusturya'dan Türkiye'ye direkt uçuşlar ortalama 2.5-3 saat sürmektedir."
  }
];

const breadcrumbItems = [
  { name: 'Ana Sayfa', url: 'https://gurbetbiz.app' },
  { name: 'Avusturya Türkiye Uçak Bileti', url: 'https://gurbetbiz.app/avusturya-turkiye-ucak-bileti' }
];

export default function AvusturyaTurkiyePage() {
  return (
    <>
      <Script
        id="breadcrumb-schema-avusturya"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(breadcrumbItems))
        }}
      />
      <Script
        id="faq-schema-avusturya"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema(faqs))
        }}
      />
      <CountryLandingPage
        country="Avusturya"
        countryCode="AT"
        flag="🇦🇹"
        cities={cities}
        popularRoutes={popularRoutes}
      />
    </>
  );
}

