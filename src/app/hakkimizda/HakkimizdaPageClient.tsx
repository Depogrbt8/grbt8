'use client';

import { Plane, Home, Car, Shield, Users, Heart } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Script from 'next/script';
import { breadcrumbSchema } from '@/lib/schemas';

export default function HakkimizdaPageClient() {
  const breadcrumbItems = [
    { name: 'Ana Sayfa', url: 'https://gurbetbiz.app' },
    { name: 'Hakkımızda', url: 'https://gurbetbiz.app/hakkimizda' }
  ];

  return (
    <>
      <Script
        id="breadcrumb-schema-hakkimizda"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(breadcrumbItems))
        }}
      />
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          
          {/* Ana Başlık */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
              Gurbetbiz Hakkında
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Avrupa'da yaşayan Türk gurbetçiler için özel olarak tasarlanmış seyahat platformu. 
              <Link href="/flights/search" className="text-green-600 hover:text-green-700 ml-1 underline">Uçak bileti</Link>, 
              <Link href="/yardim" className="text-green-600 hover:text-green-700 ml-1 underline">yardım</Link> ve 
              <Link href="/blog" className="text-green-600 hover:text-green-700 ml-1 underline">blog</Link> sayfalarımızı ziyaret edin.
            </p>
          </div>

          {/* Gurbetbiz Nedir? */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Heart className="w-6 h-6 text-green-500" />
              Gurbetbiz Nedir?
            </h2>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              Gurbetbiz, Avrupa'da yaşayan Türk gurbetçiler için özel olarak oluşturulmuş online seyahat platformudur. 
              Amacımız, gurbetçilerin memleketlerini ekonomik ve pratik bir şekilde ziyaret edebilmelerine yardımcı olmaktır. 
              Gurbetçilerin sevdiklerine ulaşabilmeleri için güvenli, kolay ve bütçe dostu bir seyahat deneyimi sunmayı hedefliyoruz.
            </p>
          </div>

          {/* Misyonumuz */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-500" />
              Misyonumuz
            </h2>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              Misyonumuz, tüm gurbetçilere tek noktadan en uygun fiyatlı ve en kaliteli seyahat hizmetlerini sunmaktır. 
              Havayolu şirketleri, oteller ve araç kiralama firmaları ile yaptığımız özel anlaşmalar sayesinde, 
              uçak bileti ve konaklama rezervasyonundan araç kiralama ve diğer seyahat ihtiyaçlarına kadar 
              tüm seyahat gereksinimlerini güvenli ve kolay bir şekilde karşılamayı amaçlıyoruz.
            </p>
          </div>

          {/* Vizyonumuz */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6 mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-green-600" />
              Vizyonumuz
            </h2>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4">
              Her gurbetçinin gönül rahatlığıyla memleketine gidebilmesi için tüm seyahat ihtiyaçlarını 
              tek bir platformda birleştirmek ve bu yolculuğu, baştan sona kayıt altında tutarak 
              eksiksiz bir şekilde tamamlamasını sağlamaktır.
            </p>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed font-medium">
              Gurbetbiz, sadece bir seyahat sitesi değil, aynı zamanda memleketine giden yolda en güvenilir dostunuzdur.
            </p>
          </div>

          {/* Hizmetlerimiz */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Plane className="w-6 h-6 text-purple-500" />
              Hizmetlerimiz
            </h2>
            
            <div className="space-y-6">
              {/* Uçak Bileti */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Plane className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Uçak Bileti</h3>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                    Avrupa'dan Türkiye'ye en uygun fiyatlı uçuş seçeneklerini sunarak, 
                    yolculuğunuzun ilk adımını ekonomik hale getiriyoruz.
                  </p>
                </div>
              </div>

              {/* Otel Rezervasyonu */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Home className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Otel Rezervasyonu</h3>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                    Türkiye'deki binlerce otel arasından bütçenize ve zevkinize en uygun 
                    konaklama seçeneklerini bulmanıza yardımcı oluyoruz.
                  </p>
                </div>
              </div>

              {/* Araç Kiralama */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Car className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Araç Kiralama</h3>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                    Havalimanına indiğinizde özgürce seyahat edebilmeniz için 
                    geniş araç kiralama seçenekleri sunuyoruz.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* İletişim Bilgileri */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Bizimle İletişime Geçin</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Sorularınız için her zaman yanınızdayız. 
              <br className="sm:hidden" />
              <span className="hidden sm:inline"> • </span>
              Güvenli ve konforlu seyahat deneyimi için buradayız.
            </p>
          </div>

        </div>
        
        <Footer />
      </main>
    </>
  );
}







