'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface CountryLandingPageProps {
  country: string;
  countryCode: string;
  flag: string;
  cities: string[];
  popularRoutes: { from: string; to: string; price: string }[];
}

export default function CountryLandingPage({ 
  country, 
  countryCode, 
  flag, 
  cities, 
  popularRoutes 
}: CountryLandingPageProps) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-4">
              <span className="text-6xl">{flag}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
              {country}'dan Türkiye'ye Uçak Bileti
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto text-center mb-8">
              {country}'daki gurbetçiler için en uygun Türkiye uçuşları! 
              Anında karşılaştır, güvenle rezervasyon yap.
            </p>
            
            {/* CTA Button */}
            <div className="text-center mt-8">
              <Link
                href="/flights/search"
                className="inline-block bg-white text-green-600 px-8 py-4 rounded-lg hover:bg-green-50 transition-colors duration-200 font-bold text-lg shadow-xl"
              >
                ✈️ Hemen Uçak Bileti Ara
              </Link>
            </div>
          </div>
        </section>

        {/* Popular Routes Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
              🔥 Popüler {country} - Türkiye Rotaları
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {popularRoutes.map((route, index) => (
                <Link
                  key={index}
                  href={`/flights/search?origin=${route.from}&destination=${route.to}`}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-semibold text-gray-800">{route.from}</span>
                    <span className="text-green-600">✈️</span>
                    <span className="text-lg font-semibold text-gray-800">{route.to}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-bold text-green-600">{route.price}</span>
                    <span className="text-gray-500 text-sm ml-1">'dan başlayan fiyatlar</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Cities Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
              📍 {country}'dan Kalkan Şehirler
            </h2>
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {cities.map((city, index) => (
                <Link
                  key={index}
                  href={`/flights/search?origin=${city}`}
                  className="bg-white px-6 py-3 rounded-full shadow-sm border border-gray-200 hover:border-green-500 hover:shadow-md transition-all text-gray-700 hover:text-green-600"
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
              Neden Gurbetbiz?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="text-center p-6">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">En Uygun Fiyat</h3>
                <p className="text-gray-600 text-sm">Tüm havayollarını karşılaştır, en ucuzu bul</p>
              </div>
              <div className="text-center p-6">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Güvenli Ödeme</h3>
                <p className="text-gray-600 text-sm">256-bit SSL şifreleme</p>
              </div>
              <div className="text-center p-6">
                <div className="text-4xl mb-4">🇹🇷</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Türkçe Destek</h3>
                <p className="text-gray-600 text-sm">7/24 Türkçe müşteri hizmetleri</p>
              </div>
              <div className="text-center p-6">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Anında Onay</h3>
                <p className="text-gray-600 text-sm">E-biletiniz hemen gönderilir</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
              Sık Sorulan Sorular
            </h2>
            <div className="space-y-4">
              <details className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <summary className="font-semibold text-gray-800 cursor-pointer">
                  {country}'dan Türkiye'ye en ucuz uçuşlar ne zaman?
                </summary>
                <p className="mt-3 text-gray-600">
                  Genellikle hafta içi uçuşlar ve sezon dışı dönemler (Ocak-Şubat, Kasım) daha uygun fiyatlıdır. 
                  En iyi fiyatlar için 2-3 ay önceden rezervasyon yapmanızı öneririz.
                </p>
              </details>
              <details className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <summary className="font-semibold text-gray-800 cursor-pointer">
                  Hangi havayolları {country} - Türkiye seferi yapıyor?
                </summary>
                <p className="mt-3 text-gray-600">
                  Turkish Airlines, Pegasus, SunExpress ve çeşitli Avrupa havayolları düzenli seferler düzenlemektedir. 
                  Gurbetbiz'de tüm havayollarının fiyatlarını karşılaştırabilirsiniz.
                </p>
              </details>
              <details className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <summary className="font-semibold text-gray-800 cursor-pointer">
                  Bagaj hakkım ne kadar?
                </summary>
                <p className="mt-3 text-gray-600">
                  Bagaj hakkı havayoluna ve bilet tipine göre değişir. Ekonomi bilette genellikle 20-23 kg, 
                  business'ta 32 kg bagaj hakkı bulunur. Detayları rezervasyon sırasında görebilirsiniz.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-gradient-to-r from-green-600 to-green-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              {country}'dan Türkiye'ye Uçmaya Hazır mısınız?
            </h2>
            <p className="text-green-100 mb-8 max-w-2xl mx-auto">
              Binlerce gurbetçi Gurbetbiz'i tercih ediyor. Siz de en uygun fiyatlarla ailenize kavuşun!
            </p>
            <Link
              href="/flights/search"
              className="inline-block bg-white text-green-600 px-10 py-4 rounded-lg hover:bg-green-50 transition-colors duration-200 font-bold text-xl shadow-xl"
            >
              ✈️ Uçak Bileti Ara
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

