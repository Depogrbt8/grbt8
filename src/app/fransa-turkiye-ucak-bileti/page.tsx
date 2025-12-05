import { Metadata } from 'next';
import CountryLandingPage from '@/components/CountryLandingPage';
import Script from 'next/script';
import { breadcrumbSchema, faqSchema } from '@/lib/schemas';

export const metadata: Metadata = {
  title: '🇫🇷 Fransa\'dan Türkiye\'ye Uçak Bileti | En Ucuz Fiyatlar',
  description: 'Fransa\'dan Türkiye\'ye uçak bileti arıyorsanız doğru yerdesiniz! Paris, Lyon, Marsilya\'dan İstanbul, Ankara, İzmir\'e en uygun fiyatlarla uçun. ✈️ 79€\'dan başlayan fiyatlar!',
  keywords: [
    'fransa türkiye uçak bileti',
    'fransadan türkiyeye uçak',
    'paris istanbul uçak bileti',
    'lyon ankara uçak bileti',
    'marsilya izmir uçak bileti',
    'fransa türkiye ucuz uçuş',
    'gurbetçi uçak bileti',
  ],
  openGraph: {
    title: '🇫🇷 Fransa\'dan Türkiye\'ye Uçak Bileti | Gurbetbiz',
    description: 'Fransa\'dan Türkiye\'ye en ucuz uçak biletleri! Paris, Lyon, Marsilya\'dan İstanbul, Ankara\'ya ✈️ 79€\'dan başlayan fiyatlar.',
    url: 'https://gurbetbiz.app/fransa-turkiye-ucak-bileti',
    type: 'website',
    locale: 'tr_FR',
  },
  alternates: {
    canonical: '/fransa-turkiye-ucak-bileti',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const popularRoutes = [
  { from: 'Paris', to: 'İstanbul', price: '79€' },
  { from: 'Lyon', to: 'Ankara', price: '89€' },
  { from: 'Marsilya', to: 'İzmir', price: '99€' },
  { from: 'Nice', to: 'Antalya', price: '109€' },
  { from: 'Strasbourg', to: 'İstanbul', price: '95€' },
  { from: 'Toulouse', to: 'Trabzon', price: '119€' },
];

const cities = [
  'Paris', 'Lyon', 'Marsilya', 'Nice', 'Strasbourg', 
  'Toulouse', 'Bordeaux', 'Nantes', 'Lille', 'Montpellier'
];

const faqs = [
  {
    question: "Fransa'dan Türkiye'ye en ucuz uçuşlar ne zaman?",
    answer: "Genellikle hafta içi uçuşlar ve sezon dışı dönemler (Ocak-Şubat, Kasım) daha uygun fiyatlıdır. En iyi fiyatlar için 2-3 ay önceden rezervasyon yapmanızı öneririz."
  },
  {
    question: "Hangi havayolları Fransa - Türkiye seferi yapıyor?",
    answer: "Turkish Airlines, Pegasus, Air France, Transavia ve çeşitli Avrupa havayolları düzenli seferler düzenlemektedir."
  },
  {
    question: "Fransa'dan Türkiye'ye uçuş süresi ne kadar?",
    answer: "Fransa'dan Türkiye'ye direkt uçuşlar ortalama 3-3.5 saat sürmektedir."
  }
];

const breadcrumbItems = [
  { name: 'Ana Sayfa', url: 'https://gurbetbiz.app' },
  { name: 'Fransa Türkiye Uçak Bileti', url: 'https://gurbetbiz.app/fransa-turkiye-ucak-bileti' }
];

export default function FransaTurkiyePage() {
  return (
    <>
      <Script
        id="breadcrumb-schema-fransa"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(breadcrumbItems))
        }}
      />
      <Script
        id="faq-schema-fransa"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema(faqs))
        }}
      />
      <CountryLandingPage
        country="Fransa"
        countryCode="FR"
        flag="🇫🇷"
        cities={cities}
        popularRoutes={popularRoutes}
      />
    </>
  );
}

