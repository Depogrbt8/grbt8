'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, Clock, User, ArrowRight } from 'lucide-react';
import Script from 'next/script';
import { breadcrumbSchema } from '@/lib/schemas';

export default function BlogPageClient() {
  const blogPosts = [
    {
      id: 1,
      title: "Gurbetçiler İçin İndirimli Uçak Bileti: Bu Sizin Hakkınız!",
      excerpt: "Avrupa'dan Türkiye'ye dönüş yolculuğunuzda uygun fiyatlı uçak bileti bulmanın püf noktaları ve Gurbetbiz garantisi.",
      content: "Gurbet hayatının en zor yanlarından biri, memlekete dönüş yolculuğunun masraflarıdır. Yüksek uçak bileti fiyatları, gurbetçilerin vatan özlemini daha da artırır. Ancak unutmayın ki indirimli uçak bileti bulmak, gurbetçilerin en doğal hakkıdır! Gurbetbiz olarak, Avrupa'dan Türkiye'ye en uygun fiyatlı uçak biletlerini sizler için sürekli güncelliyoruz.",
      author: "Gurbetbiz Ekibi",
      date: "4 Eylül 2025",
      readTime: "5 dk",
      category: "Gurbetçi Rehberi",
      image: "/images/blog/cheap-flights.jpg"
    },
    {
      id: 2,
      title: "Vatan Yolunda Dikkat Edilmesi Gerekenler",
      excerpt: "Gurbetçilerin Türkiye'ye dönüş yolculuğunda bilmesi gereken önemli detaylar ve pratik ipuçları.",
      content: "Vatan yolculuğu, gurbetçiler için sadece bir seyahat değil, özlemle dolu bir kavuşma anıdır. Bu yolculukta uçak bileti seçimi, otel rezervasyonu ve araç kiralama işlemlerini doğru planlamak çok önemlidir. Gurbetbiz, gurbetçilerin bu yolculukta ihtiyaç duyacağı tüm hizmetleri tek platformda sunuyor.",
      author: "Seyahat Uzmanı",
      date: "3 Eylül 2025",
      readTime: "7 dk",
      category: "Vatan Yolculuğu",
      image: "/images/blog/homeland-travel.jpg"
    },
    {
      id: 3,
      title: "Türkiye'nin En Popüler Otelleri: Gurbetçiler İçin Özel Seçimler",
      excerpt: "İstanbul, Antalya ve diğer şehirlerimizde gurbetçilerin tercih ettiği en iyi oteller ve konaklama fırsatları.",
      content: "Gurbetçilerin memlekete dönüşünde konforlu bir konaklama deneyimi yaşamaları çok önemlidir. İstanbul'un tarihi otellerinden Antalya'nın sahil resortlarına kadar, Türkiye'nin en popüler otellerini gurbetçiler için özenle seçtik. Gurbetbiz garantisiyle sunulan bu oteller, hem ekonomik hem de kaliteli konaklama imkanı sağlıyor.",
      author: "Konaklama Uzmanı",
      date: "2 Eylül 2025",
      readTime: "6 dk",
      category: "Otel Rehberi",
      image: "/images/blog/turkey-hotels.jpg"
    },
    {
      id: 4,
      title: "Gurbetçiler İçin Araç Kiralama Rehberi",
      excerpt: "Türkiye'de araç kiralarken gurbetçilerin bilmesi gereken tüm detaylar ve en uygun fiyatlı seçenekler.",
      content: "Memlekete döndüğünüzde ailenizi ziyaret etmek, eski dostlarınızla buluşmak için araç kiralama hizmeti çok önemlidir. Gurbetbiz, gurbetçilerin ihtiyaçlarına özel araç kiralama seçenekleri sunuyor. İstanbul, Antalya ve diğer şehirlerde en uygun fiyatlı araç kiralama fırsatları sizleri bekliyor.",
      author: "Araç Kiralama Uzmanı",
      date: "1 Eylül 2025",
      readTime: "8 dk",
      category: "Araç Kiralama",
      image: "/images/blog/car-rental.jpg"
    },
    {
      id: 5,
      title: "Bayramda Memlekete Dönüş: Gurbetçiler İçin Özel Fırsatlar",
      excerpt: "Bayram sezonunda en uygun fiyatlı uçak biletleri, otel rezervasyonları ve araç kiralama fırsatları.",
      content: "Bayramlar, gurbetçilerin memlekete dönüş için en özel zamanlardır. Bu dönemde uçak bileti fiyatları yükselse de, Gurbetbiz gurbetçilere özel bayram fırsatları sunuyor. Uygun fiyatlı uçak biletleri, otel rezervasyonları ve araç kiralama hizmetleriyle bayramınızı sevdiklerinizle geçirin.",
      author: "Bayram Fırsatları Uzmanı",
      date: "31 Ağustos 2025",
      readTime: "6 dk",
      category: "Bayram Seyahati",
      image: "/images/blog/holiday-travel.jpg"
    },
    {
      id: 6,
      title: "Gurbetçilerin Bütçe Dostu Seyahat Planlaması",
      excerpt: "Avrupa'dan Türkiye'ye seyahat ederken bütçenizi koruyacak akıllı planlama yöntemleri.",
      content: "Gurbetçilerin memlekete dönüş yolculuğunda bütçe planlaması kritik öneme sahiptir. Uçak bileti, otel ve araç kiralama masraflarını optimize etmek için Gurbetbiz size özel stratejiler sunuyor. Erken rezervasyon, sezonluk fırsatlar ve paket seyahat seçenekleriyle bütçenizi koruyun.",
      author: "Bütçe Planlama Uzmanı",
      date: "30 Ağustos 2025",
      readTime: "9 dk",
      category: "Bütçe Planlama",
      image: "/images/blog/budget-travel.jpg"
    }
  ];

  const breadcrumbItems = [
    { name: 'Ana Sayfa', url: 'https://gurbetbiz.app' },
    { name: 'Blog', url: 'https://gurbetbiz.app/blog' }
  ];

  return (
    <>
      <Script
        id="breadcrumb-schema-blog"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(breadcrumbItems))
        }}
      />
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Gurbetbiz Blog</h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Gurbetçilerin vatan yolculuğunda yanındayız! Uygun uçak bileti, otel ve araç kiralama fırsatları
            </p>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="h-48 relative overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                      <div className="text-white text-center">
                        <h3 className="text-lg font-semibold mb-2">{post.category}</h3>
                        <p className="text-sm opacity-90">Gurbetçi Blog</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        {post.category}
                      </span>
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                      {post.title}
                    </h2>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {post.author}
                        </div>
                        <div className="flex items-center">
                          <CalendarDays className="w-4 h-4 mr-1" />
                          {post.date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {post.readTime}
                        </div>
                      </div>
                    </div>
                    
                    <Link 
                      href={`/blog/${post.id}`}
                      className="inline-flex items-center text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
                    >
                      Devamını Oku
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-white py-12 border-t">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Gurbetçi Fırsatlarını Kaçırmayın!
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              En uygun fiyatlı uçak biletleri, otel rezervasyonları ve araç kiralama fırsatlarından haberdar olun.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium">
                Abone Ol
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

