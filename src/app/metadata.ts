import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Gurbetbiz ✈️ Almanya, Fransa, Hollanda\'dan Türkiye\'ye Ucuz Uçak Bileti',
    template: '%s | Gurbetbiz'
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.svg', type: 'image/svg+xml' },
    ],
  },
  description: '🇩🇪🇫🇷🇳🇱 Avrupa\'dan Türkiye\'ye 79€\'dan başlayan fiyatlarla uçak bileti! Berlin, Paris, Amsterdam\'dan İstanbul, Ankara, İzmir\'e ✈️ Hemen karşılaştır, anında rezervasyon yap. Türkçe destek 7/24.',
  keywords: [
    'uçak bileti',
    'avrupa türkiye uçak bileti',
    'almanya türkiye uçak bileti',
    'fransa türkiye uçak bileti',
    'hollanda türkiye uçak bileti',
    'belçika türkiye uçak bileti',
    'avusturya türkiye uçak bileti',
    'isviçre türkiye uçak bileti',
    'berlin istanbul uçak bileti',
    'paris ankara uçak bileti',
    'amsterdam izmir uçak bileti',
    'brüksel antalya uçak bileti',
    'gurbetçi uçak bileti',
    'avrupa uçak bileti',
    'ucuz uçak bileti',
    'online uçak bileti',
    'otel rezervasyonu',
    'araç kiralama',
    'seyahat platformu'
  ],
  authors: [{ name: 'Gurbet.biz' }],
  creator: 'Gurbet.biz',
  publisher: 'Gurbet.biz',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://gurbetbiz.app'),
  alternates: {
    canonical: '/',
    languages: {
      'tr-TR': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_DE',
    url: 'https://gurbetbiz.app',
    siteName: 'Gurbetbiz',
    title: '✈️ Gurbetbiz - Avrupa\'dan Türkiye\'ye En Ucuz Uçak Bileti',
    description: '🇩🇪🇫🇷🇳🇱 79€\'dan başlayan fiyatlarla Türkiye\'ye uç! Berlin, Paris, Amsterdam\'dan İstanbul, Ankara, İzmir\'e anında rezervasyon. Türkçe destek 7/24.',
    images: [
      {
        url: '/images/gurbetbiz-og.png',
        width: 1200,
        height: 630,
        alt: 'Gurbetbiz - Avrupa\'dan Türkiye\'ye Ucuz Uçak Bileti',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '✈️ Avrupa\'dan Türkiye\'ye Ucuz Uçak Bileti | Gurbetbiz',
    description: '🇩🇪🇫🇷🇳🇱 79€\'dan başlayan fiyatlarla Türkiye\'ye uç! Hemen karşılaştır, anında rezervasyon yap.',
    images: ['/images/gurbetbiz-og.png'],
  },
  // ✅ INDEXLEME AÇILDI - Production'a geçildi
  // Site domain'de (gurbetbiz.app)
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Verification kodlarını kaldır (geçici site)
}
