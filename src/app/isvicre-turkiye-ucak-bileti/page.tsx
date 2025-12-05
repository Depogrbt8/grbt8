import { Metadata } from 'next';
import CountryLandingPage from '@/components/CountryLandingPage';
import Script from 'next/script';
import { breadcrumbSchema, faqSchema } from '@/lib/schemas';

export const metadata: Metadata = {
  title: '🇨🇭 İsviçre\'den Türkiye\'ye Uçak Bileti | En Ucuz Fiyatlar',
  description: 'İsviçre\'den Türkiye\'ye uçak bileti arıyorsanız doğru yerdesiniz! Zürih, Cenevre, Basel\'den İstanbul, Ankara, İzmir\'e en uygun fiyatlarla uçun. ✈️ 99€\'dan başlayan fiyatlar!',
  keywords: [
    'isviçre türkiye uçak bileti',
    'isviçreden türkiyeye uçak',
    'zürih istanbul uçak bileti',
    'cenevre ankara uçak bileti',
    'basel izmir uçak bileti',
    'isviçre türkiye ucuz uçuş',
    'gurbetçi uçak bileti',
  ],
  openGraph: {
    title: '🇨🇭 İsviçre\'den Türkiye\'ye Uçak Bileti | Gurbetbiz',
    description: 'İsviçre\'den Türkiye\'ye en ucuz uçak biletleri! Zürih, Cenevre\'den İstanbul, Ankara\'ya ✈️ 99€\'dan başlayan fiyatlar.',
    url: 'https://gurbetbiz.app/isvicre-turkiye-ucak-bileti',
    type: 'website',
    locale: 'tr_CH',
  },
  alternates: {
    canonical: '/isvicre-turkiye-ucak-bileti',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const popularRoutes = [
  { from: 'Zürih', to: 'İstanbul', price: '99€' },
  { from: 'Cenevre', to: 'Ankara', price: '109€' },
  { from: 'Basel', to: 'İzmir', price: '115€' },
  { from: 'Zürih', to: 'Antalya', price: '119€' },
  { from: 'Cenevre', to: 'Trabzon', price: '129€' },
  { from: 'Basel', to: 'Bodrum', price: '125€' },
];

const cities = [
  'Zürih', 'Cenevre', 'Basel', 'Bern', 'Lausanne',
  'Luzern', 'St. Gallen', 'Lugano', 'Winterthur', 'Thun'
];

const faqs = [
  {
    question: "İsviçre'den Türkiye'ye en ucuz uçuşlar ne zaman?",
    answer: "Genellikle hafta içi uçuşlar ve sezon dışı dönemler (Ocak-Şubat, Kasım) daha uygun fiyatlıdır. En iyi fiyatlar için 2-3 ay önceden rezervasyon yapmanızı öneririz."
  },
  {
    question: "Hangi havayolları İsviçre - Türkiye seferi yapıyor?",
    answer: "Turkish Airlines, Pegasus, Swiss International ve SunExpress düzenli seferler düzenlemektedir."
  },
  {
    question: "İsviçre'den Türkiye'ye uçuş süresi ne kadar?",
    answer: "İsviçre'den Türkiye'ye direkt uçuşlar ortalama 2.5-3 saat sürmektedir."
  }
];

const breadcrumbItems = [
  { name: 'Ana Sayfa', url: 'https://gurbetbiz.app' },
  { name: 'İsviçre Türkiye Uçak Bileti', url: 'https://gurbetbiz.app/isvicre-turkiye-ucak-bileti' }
];

export default function IsvicreTurkiyePage() {
  return (
    <>
      <Script
        id="breadcrumb-schema-isvicre"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(breadcrumbItems))
        }}
      />
      <Script
        id="faq-schema-isvicre"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema(faqs))
        }}
      />
      <CountryLandingPage
        country="İsviçre"
        countryCode="CH"
        flag="🇨🇭"
        cities={cities}
        popularRoutes={popularRoutes}
      />
    </>
  );
}

