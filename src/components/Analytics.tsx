'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

interface AnalyticsProps {
  googleAnalyticsId?: string;
  facebookPixelId?: string;
}

type CookiePreferences = {
  necessary?: boolean;
  analytics?: boolean;
  functional?: boolean;
  marketing?: boolean;
};

export default function AnalyticsScripts({ googleAnalyticsId, facebookPixelId }: AnalyticsProps) {
  const [cookiePreferences, setCookiePreferences] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    // Cookie tercihlerini localStorage'dan oku
    const checkCookiePreferences = () => {
      if (typeof window === 'undefined') return;
      
      const savedPreferences = localStorage.getItem('cookiePreferences');
      const consentGiven = localStorage.getItem('cookieConsent');

      if (consentGiven && savedPreferences) {
        try {
          const parsed = JSON.parse(savedPreferences);
          setCookiePreferences(parsed);
        } catch (e) {
          console.error('Cookie preferences parse error:', e);
          // Varsayılan olarak sadece zorunlu çerezler
          setCookiePreferences({ necessary: true, analytics: false, functional: false, marketing: false });
        }
      } else {
        // Onay verilmemişse hiçbir script yükleme (GDPR uyumlu)
        setCookiePreferences({ necessary: true, analytics: false, functional: false, marketing: false });
      }
    };

    checkCookiePreferences();

    // Cookie tercihleri değiştiğinde güncellemek için event listener
    const handleStorageChange = () => {
      checkCookiePreferences();
    };

    window.addEventListener('storage', handleStorageChange);
    // Custom event için de dinle (aynı tab'da değişiklik olduğunda)
    window.addEventListener('cookiePreferencesChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cookiePreferencesChanged', handleStorageChange);
    };
  }, []);

  // Cookie tercihleri yüklenene kadar hiçbir script yükleme
  if (cookiePreferences === null) {
    return null;
  }

  return (
    <>
      {/* Google Analytics 4 - Sadece analytics çerezleri kabul edildiyse */}
      {googleAnalyticsId && cookiePreferences.analytics && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAnalyticsId}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}

      {/* Facebook Pixel - Sadece marketing çerezleri kabul edildiyse */}
      {facebookPixelId && cookiePreferences.marketing && (
        <>
          <Script
            id="facebook-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${facebookPixelId}');
                fbq('track', 'PageView');
              `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${facebookPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}
    </>
  );
}

