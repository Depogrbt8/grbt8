'use client';

import { useEffect } from 'react';
import { getSession } from 'next-auth/react';

export default function OAuthCallback() {
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Kısa bir bekleme (NextAuth callback'inin tamamlanması için)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Session'ı kontrol et
        const session = await getSession();
        
        if (session) {
          // Başarılı - parent window'a mesaj gönder ve popup'ı kapat
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage('oauth-success', window.location.origin);
          }
          // Popup'ı kapat
          window.close();
        } else {
          // Hata - parent window'a hata mesajı gönder
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage('oauth-error', window.location.origin);
          }
          // Popup'ı kapat veya giriş sayfasına yönlendir
          if (window.opener) {
            window.close();
          } else {
            window.location.href = '/giris';
          }
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage('oauth-error', window.location.origin);
        }
        if (window.opener) {
          window.close();
        } else {
          window.location.href = '/giris';
        }
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Giriş yapılıyor...</p>
      </div>
    </div>
  );
}

