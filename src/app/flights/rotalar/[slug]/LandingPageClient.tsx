'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { generateBlogContent, generateBlogTitle } from '@/lib/seo-content-generator';
import FlightSearchForm from '@/components/FlightSearchForm';

interface LandingPageClientProps {
  keyword: string;
  slug: string;
  type: 'flight' | 'hotel' | 'villa' | 'car';
}

export default function LandingPageClient({ keyword, slug, type }: LandingPageClientProps) {
  const title = generateBlogTitle(keyword);
  const content = generateBlogContent(keyword);

  // Extract cities from keyword for flight search
  const extractCities = (kw: string) => {
    const countries = ['Almanya', 'Fransa', 'Belçika', 'Hollanda', 'Danimarka'];
    const turkishCities = ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Muğla'];
    
    let from = '';
    let to = 'İstanbul'; // Default

    countries.forEach(country => {
      if (kw.includes(country)) {
        from = country;
      }
    });

    turkishCities.forEach(city => {
      if (kw.includes(city)) {
        to = city;
      }
    });

    return { from, to };
  };

  const { from, to } = extractCities(keyword);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section with Search */}
        <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4 text-center">{title}</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto text-center mb-8">
              {keyword} için en uygun fiyatları Gurbetbiz'de bulun. Anında rezervasyon, güvenli ödeme.
            </p>
            
            {/* Flight Search Form */}
            <div className="max-w-4xl mx-auto mt-8">
              <div className="bg-white rounded-lg shadow-xl p-6">
                <FlightSearchForm />
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <article className="bg-white rounded-lg shadow-md overflow-hidden p-8">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />

              {/* CTA Section */}
              <div className="mt-12 p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{keyword} İçin Hemen Rezervasyon Yapın!</h3>
                <p className="text-gray-700 mb-4">
                  Gurbetbiz'de {keyword.toLowerCase()} için en uygun fiyatları bulun. Güvenli rezervasyon, anında onay, 7/24 müşteri desteği.
                </p>
                <Link
                  href="/flights/search"
                  className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                >
                  Hemen Uçak Bileti Ara
                </Link>
              </div>
            </article>

            {/* Benefits Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">✅ En Uygun Fiyat Garantisi</h3>
                <p className="text-gray-600 text-sm">Tüm havayollarının fiyatlarını karşılaştırıyoruz</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">🔒 Güvenli Rezervasyon</h3>
                <p className="text-gray-600 text-sm">256-bit SSL şifreleme ile güvenli ödeme</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">📞 7/24 Destek</h3>
                <p className="text-gray-600 text-sm">Türkçe müşteri desteği her zaman yanınızda</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

