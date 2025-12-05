import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import SessionProviderWrapper from "../components/SessionProviderWrapper"
import { metadata as siteMetadata } from './metadata'
import { organizationSchema, websiteSchema } from '../lib/schemas'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import ErrorBoundary from '@/components/ErrorBoundary'
import { setupErrorTracking } from '@/lib/errorTracking'
import '@/lib/monitoringClient'
import { logger } from '@/lib/logger'
import SurveyPopup from '@/components/SurveyPopup'
import AnalyticsScripts from '@/components/Analytics'
import CookieConsent from '@/components/CookieConsent'
import { prisma } from '@/lib/prisma'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = siteMetadata

async function getSeoSettings() {
  try {
    const settings = await prisma.seoSettings.findFirst()
    return {
      googleAnalytics: settings?.googleAnalytics || null,
      facebookPixel: settings?.facebookPixel || null,
      googleSearchConsole: settings?.googleSearchConsole || null,
      bingWebmaster: settings?.bingWebmaster || null,
    }
  } catch (error) {
    logger.error('SEO settings fetch error', { error })
    return {
      googleAnalytics: null,
      facebookPixel: null,
      googleSearchConsole: null,
      bingWebmaster: null,
    }
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const seoSettings = await getSeoSettings()
  return (
    <html lang="tr">
      <head>
        {/* Robots meta tag'ler metadata.ts'de yönetiliyor */}
        
        {/* Hreflang Tags - Avrupa ülkeleri için ülke bazlı landing page'lere yönlendirme */}
        <link rel="alternate" hrefLang="tr" href="https://gurbetbiz.app" />
        <link rel="alternate" hrefLang="tr-DE" href="https://gurbetbiz.app/almanya-turkiye-ucak-bileti" />
        <link rel="alternate" hrefLang="tr-FR" href="https://gurbetbiz.app/fransa-turkiye-ucak-bileti" />
        <link rel="alternate" hrefLang="tr-NL" href="https://gurbetbiz.app/hollanda-turkiye-ucak-bileti" />
        <link rel="alternate" hrefLang="tr-BE" href="https://gurbetbiz.app/belcika-turkiye-ucak-bileti" />
        <link rel="alternate" hrefLang="tr-AT" href="https://gurbetbiz.app/avusturya-turkiye-ucak-bileti" />
        <link rel="alternate" hrefLang="tr-CH" href="https://gurbetbiz.app/isvicre-turkiye-ucak-bileti" />
        <link rel="alternate" hrefLang="x-default" href="https://gurbetbiz.app" />
        
        {/* Google Search Console Verification */}
        {seoSettings.googleSearchConsole && (
          <meta name="google-site-verification" content={seoSettings.googleSearchConsole} />
        )}
        
        {/* Bing Webmaster Tools Verification */}
        {seoSettings.bingWebmaster && (
          <meta name="msvalidate.01" content={seoSettings.bingWebmaster} />
        )}
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <SessionProviderWrapper>
            {children}
            <SurveyPopup />
            <CookieConsent />
          </SessionProviderWrapper>
        </ErrorBoundary>
        <Toaster position="bottom-right" toastOptions={{ duration: 3500, style: { zIndex: 999999 } }} />
        <AnalyticsScripts 
          googleAnalyticsId={seoSettings.googleAnalytics || undefined}
          facebookPixelId={seoSettings.facebookPixel || undefined}
        />
        <Analytics />
        <SpeedInsights />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                (${setupErrorTracking.toString()})();
              }
            `
          }}
        />
      </body>
    </html>
  )
}
