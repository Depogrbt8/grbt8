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

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = siteMetadata

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <head>
        {/* ARAMA MOTORLARI - TÜM SİTE KAPALI */}
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex, nocache" />
        <meta name="googlebot" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
        <meta name="bingbot" content="noindex, nofollow" />
        <meta name="yandex" content="noindex, nofollow" />
        
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
          </SessionProviderWrapper>
        </ErrorBoundary>
        <Toaster position="bottom-right" toastOptions={{ duration: 3500, style: { zIndex: 999999 } }} />
        <Analytics />
        <SpeedInsights />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                ${setupErrorTracking.toString()}();
                
                // CSRF Protection setup
                const originalFetch = window.fetch;
                let csrfToken = null;
                let tokenPromise = null;
                
                window.fetch = async function(input, init) {
                  const method = init?.method?.toUpperCase() || 'GET';
                  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
                    return originalFetch(input, init);
                  }
                  
                  if (!csrfToken && !tokenPromise) {
                    tokenPromise = fetch('/api/csrf-token', {
                      method: 'GET',
                      credentials: 'include',
                    })
                      .then(res => res.json())
                      .then(data => {
                        csrfToken = data.csrfToken;
                        return data.csrfToken;
                      })
                      .catch(() => {
                        tokenPromise = null;
                        return null;
                      });
                  }
                  
                  try {
                    const token = csrfToken || await tokenPromise;
                    if (token) {
                      const headers = new Headers(init?.headers);
                      headers.set('x-csrf-token', token);
                      return originalFetch(input, { ...init, headers });
                    }
                  } catch (err) {
                    // Client-side inline script içinde logger kullanılamaz
                    if (process.env.NODE_ENV === 'development') {
                      console.error('CSRF token eklenemedi:', err);
                    }
                  }
                  
                  return originalFetch(input, init);
                };
              }
            `
          }}
        />
      </body>
    </html>
  )
}
