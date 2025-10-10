import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'gurbetbiz.com - Avrupa\'dan Türkiye\'ye yol arkadaşınız',
    template: '%s | Gurbet.biz'
  },
  description: 'Yurt dışı seyahatleriniz için en uygun fiyatlı uçak bileti, otel ve araç kiralama hizmetleri. Güvenli ödeme, 7/24 destek.',
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
  metadataBase: new URL('https://gurbet.biz'),
  alternates: {
    canonical: '/',
    languages: {
      'tr-TR': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://gurbet.biz',
    siteName: 'Gurbet.biz',
    title: 'gurbetbiz.com - Avrupa\'dan Türkiye\'ye yol arkadaşınız',
    description: 'Yurt dışı seyahatleriniz için en uygun fiyatlı uçak bileti, otel ve araç kiralama hizmetleri.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'gurbetbiz.com - Avrupa\'dan Türkiye\'ye yol arkadaşınız',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'gurbetbiz.com - Avrupa\'dan Türkiye\'ye yol arkadaşınız',
    description: 'Yurt dışı seyahatleriniz için en uygun fiyatlı uçak bileti, otel ve araç kiralama hizmetleri.',
    images: ['/images/og-image.jpg'],
  },
  // ⚠️ TÜM ARAMA MOTORLARI - INDEXLEME KAPALI
  // Site geçici domain'de (anasite.grbt8.store)
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
      'max-video-preview': 0,
      'max-image-preview': 'none',
      'max-snippet': 0,
    },
  },
  // Verification kodlarını kaldır (geçici site)
}
