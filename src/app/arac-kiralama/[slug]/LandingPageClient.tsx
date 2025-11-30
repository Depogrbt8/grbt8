'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { generateLandingPageContent, generateSlug } from '@/lib/seo-content-generator';

interface LandingPageClientProps {
  keyword: string;
  slug: string;
  type: 'car';
}

export default function LandingPageClient({ keyword, slug, type }: LandingPageClientProps) {
  const title = `${keyword} | Hemen Rezervasyon Yap`;
  const content = generateLandingPageContent(keyword, 'car');
  const blogSlug = generateSlug(keyword);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4 text-center">{title}</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto text-center mb-8">
              {keyword} için Gurbetbiz'de havalimanı teslim araç kiralama. En uygun fiyatlar, sigorta dahil, güvenli rezervasyon.
            </p>
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

              {/* Blog link */}
              <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Daha fazla bilgi mi istiyorsunuz?</strong>
                </p>
                <Link 
                  href={`/blog/${blogSlug}`}
                  className="text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  {keyword} hakkında detaylı blog yazımızı okuyun →
                </Link>
              </div>

              {/* CTA Section */}
              <div className="mt-12 p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{keyword} İçin Hemen Rezervasyon Yapın!</h3>
                <p className="text-gray-700 mb-4">
                  Gurbetbiz'de {keyword.toLowerCase()} için en uygun fiyatları bulun. Havalimanı teslim, sigorta dahil, güvenli rezervasyon.
                </p>
                <Link
                  href="/"
                  className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                >
                  Araç Kiralama Rezervasyonu Yap
                </Link>
              </div>
            </article>

            {/* Benefits Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">✈️ Havalimanı Teslim</h3>
                <p className="text-gray-600 text-sm">Havalimanında teslim ve teslim alma</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">🛡️ Sigorta Dahil</h3>
                <p className="text-gray-600 text-sm">Tüm fiyatlar sigorta dahil</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">🚗 Yeni Model Araçlar</h3>
                <p className="text-gray-600 text-sm">Otomatik ve manuel şanzıman seçenekleri</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

