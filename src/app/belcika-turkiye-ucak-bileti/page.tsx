import { Metadata } from 'next';
import CountryLandingPage from '@/components/CountryLandingPage';
import Script from 'next/script';
import { breadcrumbSchema, faqSchema } from '@/lib/schemas';

export const metadata: Metadata = {
  title: '🇧🇪 Belçika\'dan Türkiye\'ye Uçak Bileti | En Ucuz Fiyatlar',
  description: 'Belçika\'dan Türkiye\'ye uçak bileti arıyorsanız doğru yerdesiniz! Brüksel, Charleroi, Anvers\'ten İstanbul, Ankara, İzmir\'e en uygun fiyatlarla uçun. ✈️ 75€\'dan başlayan fiyatlar!',
  keywords: [
    'belçika türkiye uçak bileti',
    'belçikadan türkiyeye uçak',
    'brüksel istanbul uçak bileti',
    'charleroi ankara uçak bileti',
    'anvers izmir uçak bileti',
    'belçika türkiye ucuz uçuş',
    'gurbetçi uçak bileti',
  ],
  openGraph: {
    title: '🇧🇪 Belçika\'dan Türkiye\'ye Uçak Bileti | Gurbetbiz',
    description: 'Belçika\'dan Türkiye\'ye en ucuz uçak biletleri! Brüksel, Charleroi\'dan İstanbul, Ankara\'ya ✈️ 75€\'dan başlayan fiyatlar.',
    url: 'https://gurbetbiz.app/belcika-turkiye-ucak-bileti',
    type: 'website',
    locale: 'tr_BE',
  },
  alternates: {
    canonical: '/belcika-turkiye-ucak-bileti',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const popularRoutes = [
  { from: 'Brüksel', to: 'İstanbul', price: '75€' },
  { from: 'Charleroi', to: 'Ankara', price: '69€' },
  { from: 'Anvers', to: 'İzmir', price: '85€' },
  { from: 'Brüksel', to: 'Antalya', price: '89€' },
  { from: 'Charleroi', to: 'Trabzon', price: '99€' },
  { from: 'Liège', to: 'Bodrum', price: '95€' },
];

const cities = [
  'Brüksel', 'Charleroi', 'Anvers', 'Liège', 'Gent',
  'Brugge', 'Namur', 'Leuven', 'Mons', 'Hasselt'
];

const faqs = [
  {
    question: "Belçika'dan Türkiye'ye en ucuz uçuşlar ne zaman?",
    answer: "Genellikle hafta içi uçuşlar ve sezon dışı dönemler (Ocak-Şubat, Kasım) daha uygun fiyatlıdır. En iyi fiyatlar için 2-3 ay önceden rezervasyon yapmanızı öneririz."
  },
  {
    question: "Hangi havayolları Belçika - Türkiye seferi yapıyor?",
    answer: "Turkish Airlines, Pegasus, Brussels Airlines ve SunExpress düzenli seferler düzenlemektedir."
  },
  {
    question: "Belçika'dan Türkiye'ye uçuş süresi ne kadar?",
    answer: "Belçika'dan Türkiye'ye direkt uçuşlar ortalama 3-3.5 saat sürmektedir."
  }
];

const breadcrumbItems = [
  { name: 'Ana Sayfa', url: 'https://gurbetbiz.app' },
  { name: 'Belçika Türkiye Uçak Bileti', url: 'https://gurbetbiz.app/belcika-turkiye-ucak-bileti' }
];

export default function BelcikaTurkiyePage() {
  return (
    <>
      <Script
        id="breadcrumb-schema-belcika"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(breadcrumbItems))
        }}
      />
      <Script
        id="faq-schema-belcika"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema(faqs))
        }}
      />
      <CountryLandingPage
        country="Belçika"
        countryCode="BE"
        flag="🇧🇪"
        cities={cities}
        popularRoutes={popularRoutes}
      />
    </>
  );
}

