import { Metadata } from 'next';
import CountryLandingPage from '@/components/CountryLandingPage';
import Script from 'next/script';
import { breadcrumbSchema, faqSchema } from '@/lib/schemas';

export const metadata: Metadata = {
  title: '🇳🇱 Hollanda\'dan Türkiye\'ye Uçak Bileti | En Ucuz Fiyatlar',
  description: 'Hollanda\'dan Türkiye\'ye uçak bileti arıyorsanız doğru yerdesiniz! Amsterdam, Rotterdam, Eindhoven\'dan İstanbul, Ankara, İzmir\'e en uygun fiyatlarla uçun. ✈️ 85€\'dan başlayan fiyatlar!',
  keywords: [
    'hollanda türkiye uçak bileti',
    'hollandadan türkiyeye uçak',
    'amsterdam istanbul uçak bileti',
    'rotterdam ankara uçak bileti',
    'eindhoven izmir uçak bileti',
    'hollanda türkiye ucuz uçuş',
    'gurbetçi uçak bileti',
  ],
  openGraph: {
    title: '🇳🇱 Hollanda\'dan Türkiye\'ye Uçak Bileti | Gurbetbiz',
    description: 'Hollanda\'dan Türkiye\'ye en ucuz uçak biletleri! Amsterdam, Rotterdam\'dan İstanbul, Ankara\'ya ✈️ 85€\'dan başlayan fiyatlar.',
    url: 'https://gurbetbiz.app/hollanda-turkiye-ucak-bileti',
    type: 'website',
    locale: 'tr_NL',
  },
  alternates: {
    canonical: '/hollanda-turkiye-ucak-bileti',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const popularRoutes = [
  { from: 'Amsterdam', to: 'İstanbul', price: '85€' },
  { from: 'Rotterdam', to: 'Ankara', price: '95€' },
  { from: 'Eindhoven', to: 'İzmir', price: '89€' },
  { from: 'Amsterdam', to: 'Antalya', price: '99€' },
  { from: 'Rotterdam', to: 'Trabzon', price: '109€' },
  { from: 'Eindhoven', to: 'Bodrum', price: '115€' },
];

const cities = [
  'Amsterdam', 'Rotterdam', 'Eindhoven', 'Den Haag', 'Utrecht',
  'Groningen', 'Maastricht', 'Arnhem', 'Tilburg', 'Breda'
];

const faqs = [
  {
    question: "Hollanda'dan Türkiye'ye en ucuz uçuşlar ne zaman?",
    answer: "Genellikle hafta içi uçuşlar ve sezon dışı dönemler (Ocak-Şubat, Kasım) daha uygun fiyatlıdır. En iyi fiyatlar için 2-3 ay önceden rezervasyon yapmanızı öneririz."
  },
  {
    question: "Hangi havayolları Hollanda - Türkiye seferi yapıyor?",
    answer: "Turkish Airlines, Pegasus, KLM, Transavia ve Corendon düzenli seferler düzenlemektedir."
  },
  {
    question: "Hollanda'dan Türkiye'ye uçuş süresi ne kadar?",
    answer: "Hollanda'dan Türkiye'ye direkt uçuşlar ortalama 3.5-4 saat sürmektedir."
  }
];

const breadcrumbItems = [
  { name: 'Ana Sayfa', url: 'https://gurbetbiz.app' },
  { name: 'Hollanda Türkiye Uçak Bileti', url: 'https://gurbetbiz.app/hollanda-turkiye-ucak-bileti' }
];

export default function HollandaTurkiyePage() {
  return (
    <>
      <Script
        id="breadcrumb-schema-hollanda"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(breadcrumbItems))
        }}
      />
      <Script
        id="faq-schema-hollanda"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema(faqs))
        }}
      />
      <CountryLandingPage
        country="Hollanda"
        countryCode="NL"
        flag="🇳🇱"
        cities={cities}
        popularRoutes={popularRoutes}
      />
    </>
  );
}

