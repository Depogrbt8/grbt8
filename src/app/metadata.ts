import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Gurbetbiz - Almanya, Fransa, Hollanda, Belçika\'dan Türkiye\'ye Uçak Bileti',
    template: '%s | Gurbetbiz'
  },
  description: 'Avrupa\'dan Türkiye\'ye uçak bileti, otel rezervasyonu ve araç kiralama. Almanya, Fransa, Hollanda, Belçika\'dan en uygun fiyatlar, anında rezervasyon, güvenli ödeme ve 7/24 müşteri desteği.',
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
    title: 'Gurbetbiz - Almanya, Fransa, Hollanda, Belçika\'dan Türkiye\'ye Uçak Bileti',
    description: 'Avrupa\'dan Türkiye\'ye uçak bileti, otel rezervasyonu ve araç kiralama. Almanya, Fransa, Hollanda, Belçika\'dan en uygun fiyatlar, anında rezervasyon, güvenli ödeme ve 7/24 destek.',
    images: [
      {
        url: '/images/gurbetbiz-og.png',
        width: 1200,
        height: 630,
        alt: 'Gurbetbiz - Almanya, Fransa, Hollanda, Belçika\'dan Türkiye\'ye Uçak Bileti',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gurbetbiz - Almanya, Fransa, Hollanda, Belçika\'dan Türkiye\'ye Uçak Bileti',
    description: 'Avrupa\'dan Türkiye\'ye uçak bileti, otel rezervasyonu ve araç kiralama. Almanya, Fransa, Hollanda, Belçika\'dan en uygun fiyatlar, anında rezervasyon, güvenli ödeme ve 7/24 destek.',
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
