import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hakkımızda - Gurbetbiz',
  description: 'Gurbetbiz, Avrupa\'da yaşayan Türk gurbetçilerin anavatanlarına olan özlemlerini en ekonomik ve en pratik şekilde giderebilmeleri için kurulmuş bir online seyahat platformudur.',
}

export default function HakkimizdaPage() {
  return (
    <div className="min-h-screen bg-green-50">
      {/* Hero Section */}
      <div className="bg-green-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-medium mb-3">
              Hakkımızda
            </h1>
            <p className="text-base font-light">
              Memleketine Giden Yolculuğun Güvenli Adresi
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Tek Kompozisyon */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          
          {/* Giriş */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Gurbetbiz Nedir?</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Gurbetbiz, Avrupa'da yaşayan Türk gurbetçilerin anavatanlarına olan özlemlerini en ekonomik ve en pratik şekilde giderebilmeleri için kurulmuş bir online seyahat platformudur. Amacımız, gurbetçilerimizin sevdiklerine ulaşma yolculuğunu, bütçelerini sarsmadan güvenli ve kolay bir deneyime dönüştürmektir.
            </p>
          </div>

          {/* Gelişme */}
          <div className="bg-green-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Misyonumuz</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              Gurbetbiz olarak, her memleket hasreti çeken gurbetçiye, en uygun fiyatlı ve en kaliteli seyahat hizmetlerini tek bir noktadan sunmayı misyon edindik. Havayolları, oteller ve araç kiralama şirketleri ile yaptığımız özel anlaşmalar sayesinde, uçak biletinden konaklamaya, araç kiralamadan tüm seyahat ihtiyaçlarına kadar her şeyi güvenle ve kolayca karşılamayı hedefliyoruz.
            </p>
            
            <h3 className="text-base font-medium text-gray-900 mb-3">Hizmetlerimiz</h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                <strong>Uçak Bileti:</strong> Avrupa'dan Türkiye'ye en uygun fiyatlı uçuş seçeneklerini sunarak, yolculuğunuzun ilk adımını ekonomik hale getiriyoruz.
              </p>
              <p className="text-sm text-gray-700">
                <strong>Otel Rezervasyonu:</strong> Türkiye'deki binlerce otel arasından bütçenize ve zevkinize en uygun olanı bulmanızı sağlıyoruz.
              </p>
              <p className="text-sm text-gray-700">
                <strong>Araç Kiralama:</strong> Havaalanından indiğiniz anda özgürce seyahat edebilmeniz için geniş araç kiralama seçeneklerini bir araya getiriyoruz.
              </p>
            </div>
          </div>

          {/* Sonuç */}
          <div className="bg-green-100 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Vizyonumuz</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              Her gurbetçinin gönül rahatlığıyla memleketine gidebilmesi için tüm seyahat ihtiyaçlarını tek bir platformda birleştirmek ve bu yolculuğu, baştan sona kayıt altında tutarak eksiksiz bir şekilde tamamlamasını sağlamaktır.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed font-medium">
              Gurbetbiz, sadece bir seyahat sitesi değil, aynı zamanda memleketine giden yolda en güvenilir dostunuzdur.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
