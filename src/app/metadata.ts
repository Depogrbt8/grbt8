import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Gurbetbiz - Avrupa\'dan Türkiye\'ye Yol Arkadaşınız',
    template: '%s | Gurbetbiz'
  },
  description: 'Avrupa\'dan Türkiye\'ye uçak bileti, otel rezervasyonu ve araç kiralama. En uygun fiyatlar, anında rezervasyon, güvenli ödeme, 7/24 destek.',
  keywords: [
    'uçak bileti',
    'yurt dışı seyahat',
    'otel rezervasyonu',
    'araç kiralama',
    'gurbet',
    'seyahat platformu',
    'ucuz uçak bileti',
    'havayolu bileti'
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
    locale: 'tr_TR',
    url: 'https://gurbetbiz.app',
    siteName: 'Gurbet.biz',
    title: 'Gurbetbiz - Avrupa\'dan Türkiye\'ye Yol Arkadaşınız',
    description: 'Avrupa\'dan Türkiye\'ye uçak bileti, otel rezervasyonu ve araç kiralama. En uygun fiyatlar, anında rezervasyon, güvenli ödeme, 7/24 destek.',
    images: [
      {
        url: '/images/gurbetbiz-og.png',
        width: 1200,
        height: 630,
        alt: 'gurbetbiz.app - Avrupa\'dan Türkiye\'ye yol arkadaşınız',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gurbetbiz - Avrupa\'dan Türkiye\'ye Yol Arkadaşınız',
    description: 'Avrupa\'dan Türkiye\'ye uçak bileti, otel rezervasyonu ve araç kiralama. En uygun fiyatlar, anında rezervasyon, güvenli ödeme, 7/24 destek.',
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
