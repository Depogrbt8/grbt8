'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, Clock, User, ArrowLeft, Share2, Bookmark } from 'lucide-react';
import { generateBlogContent, generateBlogTitle } from '@/lib/seo-content-generator';
import { useState, useEffect } from 'react';

interface BlogDetailClientProps {
  keyword: string;
  slug: string;
}

export default function BlogDetailClient({ keyword, slug }: BlogDetailClientProps) {
  const [readTime, setReadTime] = useState('5 dk');

  useEffect(() => {
    // İçeriğe göre okuma süresi hesapla
    const content = generateBlogContent(keyword);
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200); // Ortalama 200 kelime/dakika
    setReadTime(`${minutes} dk`);
  }, [keyword]);

  const title = generateBlogTitle(keyword);
  const content = generateBlogContent(keyword);
  const category = keyword.includes('uçak') || keyword.includes('uçuş') ? 'Uçuş Rehberi' :
                   keyword.includes('otel') || keyword.includes('hotel') ? 'Otel Rehberi' :
                   keyword.includes('villa') ? 'Villa Rehberi' :
                   keyword.includes('araç') || keyword.includes('araba') || keyword.includes('rent') ? 'Araç Kiralama' :
                   'Seyahat Rehberi';

  // Default image based on category
  const image = keyword.includes('uçak') || keyword.includes('uçuş') ? '/images/blog/cheap-flights.jpg' :
                keyword.includes('otel') || keyword.includes('hotel') ? '/images/blog/turkey-hotels.jpg' :
                keyword.includes('villa') ? '/images/blog/car-rental.jpg' :
                keyword.includes('araç') || keyword.includes('araba') || keyword.includes('rent') ? '/images/blog/car-rental.jpg' :
                '/images/blog/cheap-flights.jpg';

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
          <div className="container mx-auto px-4">
            <Link 
              href="/blog"
              className="inline-flex items-center text-green-100 hover:text-white mb-6 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Blog'a Dön
            </Link>
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            <div className="flex items-center space-x-6 text-green-100">
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Gurbetbiz Ekibi
              </div>
              <div className="flex items-center">
                <CalendarDays className="w-5 h-5 mr-2" />
                {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                {readTime}
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <article className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Featured Image */}
              <div className="h-64 relative overflow-hidden">
                <Image
                  src={image}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              </div>

              <div className="p-8">
                {/* Category Badge */}
                <div className="mb-6">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {category}
                  </span>
                </div>

                {/* Article Actions */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center text-gray-600 hover:text-green-600 transition-colors duration-200">
                      <Share2 className="w-5 h-5 mr-2" />
                      Paylaş
                    </button>
                    <button className="flex items-center text-gray-600 hover:text-green-600 transition-colors duration-200">
                      <Bookmark className="w-5 h-5 mr-2" />
                      Kaydet
                    </button>
                  </div>
                </div>

                {/* Content */}
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
                    Hemen Rezervasyon Yap
                  </Link>
                </div>

                {/* Author Bio */}
                <div className="mt-12 p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Yazar Hakkında</h3>
                  <p className="text-gray-600">
                    Gurbetbiz ekibi, Avrupa'da yaşayan gurbetçi Türklerin vatan yolculuğunda yanında olmak için çalışıyor. Uygun fiyatlı uçak biletleri, otel rezervasyonları ve araç kiralama hizmetleriyle gurbetçilerin memlekete dönüşünü kolaylaştırıyoruz.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

