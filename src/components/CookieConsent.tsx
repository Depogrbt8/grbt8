'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
};

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Zorunlu çerezler her zaman aktif
    analytics: false,
    functional: false,
    marketing: false,
  });

  useEffect(() => {
    // LocalStorage'dan çerez tercihlerini yükle
    const savedPreferences = localStorage.getItem('cookiePreferences');
    const consentGiven = localStorage.getItem('cookieConsent');

    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences({ ...preferences, ...parsed });
      } catch (e) {
        console.error('Cookie preferences parse error:', e);
      }
    }

    // Eğer onay verilmemişse banner'ı göster
    if (!consentGiven) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      functional: true,
      marketing: true,
    };
    savePreferences(allAccepted);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      functional: false,
      marketing: false,
    };
    savePreferences(onlyNecessary);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowBanner(false);
    setShowSettings(false);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookiePreferences', JSON.stringify(prefs));
    localStorage.setItem('cookieConsent', 'true');
    setPreferences(prefs);

    // AnalyticsScripts component'ini güncellemek için custom event gönder
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cookiePreferencesChanged'));
      // Sayfayı yenile (script'lerin doğru yüklenmesi için)
      window.location.reload();
    }
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Zorunlu çerezler değiştirilemez
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!showBanner) {
    // Ayarlar butonu (sayfanın altında sabit)
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg p-2">
        <div className="container mx-auto flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Çerez tercihlerinizi yönetmek için{' '}
            <button
              onClick={() => {
                setShowBanner(true);
                setShowSettings(true);
              }}
              className="text-green-600 hover:text-green-700 underline"
            >
              buraya tıklayın
            </button>
            {' '}veya{' '}
            <Link href="/cerez-politikasi" className="text-green-600 hover:text-green-700 underline">
              Çerez Politikası
            </Link>
            {' '}sayfasını ziyaret edin.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center p-4 pointer-events-none">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full pointer-events-auto border border-gray-200">
        {!showSettings ? (
          // Basit Banner
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Çerez Kullanımı
            </h3>
            <p className="text-gray-600 mb-4">
              Bu web sitesi, deneyiminizi geliştirmek ve site kullanımını analiz etmek için çerezler kullanmaktadır. 
              GDPR uyumlu olarak, zorunlu olmayan çerezler için onayınız gerekmektedir.{' '}
              <Link href="/cerez-politikasi" className="text-green-600 hover:text-green-700 underline">
                Daha fazla bilgi
              </Link>
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAcceptAll}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Tümünü Kabul Et
              </button>
              <button
                onClick={handleRejectAll}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Sadece Zorunlu
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="bg-white border border-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Özelleştir
              </button>
            </div>
          </div>
        ) : (
          // Detaylı Ayarlar
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Çerez Tercihleri
            </h3>
            <p className="text-gray-600 mb-6">
              Hangi çerez kategorilerini kabul etmek istediğinizi seçebilirsiniz.{' '}
              <Link href="/cerez-politikasi" className="text-green-600 hover:text-green-700 underline">
                Çerez Politikası
              </Link>
            </p>

            <div className="space-y-4 mb-6">
              {/* Zorunlu Çerezler */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-800">Zorunlu Çerezler</h4>
                    <p className="text-sm text-gray-600">Site işlevselliği için gerekli</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.necessary}
                    disabled
                    className="w-5 h-5 text-green-600 rounded"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Bu çerezler siteyi güvenli ve doğru şekilde kullanmanızı sağlar. Devre dışı bırakılamaz.
                </p>
              </div>

              {/* Analitik Çerezler */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-800">Analitik Çerezler</h4>
                    <p className="text-sm text-gray-600">Site kullanım analizi (Google Analytics)</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={() => togglePreference('analytics')}
                    className="w-5 h-5 text-green-600 rounded cursor-pointer"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Site kullanımını anlamak ve iyileştirmek için kullanılır. Süre: 26 ay.
                </p>
              </div>

              {/* Fonksiyonel Çerezler */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-800">Fonksiyonel Çerezler</h4>
                    <p className="text-sm text-gray-600">Kullanıcı tercihleri (dil, vb.)</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={() => togglePreference('functional')}
                    className="w-5 h-5 text-green-600 rounded cursor-pointer"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Tercihlerinizi hatırlamak için kullanılır. Süre: 1 yıl.
                </p>
              </div>

              {/* Pazarlama Çerezleri */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-800">Pazarlama Çerezleri</h4>
                    <p className="text-sm text-gray-600">Reklam ve pazarlama (Facebook Pixel)</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={() => togglePreference('marketing')}
                    className="w-5 h-5 text-green-600 rounded cursor-pointer"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Size daha uygun reklamlar göstermek için kullanılır. Süre: 90 gün.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleSavePreferences}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Tercihleri Kaydet
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieConsent;

