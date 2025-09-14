import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hakkımızda - Gurbetbiz',
  description: 'Gurbetbiz, Avrupa\'da yaşayan Türk gurbetçilerin anavatanlarına olan özlemlerini en ekonomik ve en pratik şekilde giderebilmeleri için kurulmuş bir online seyahat platformudur.',
}

export default function HakkimizdaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Hakkımızda
            </h1>
            <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto">
              Memleketine Giden Yolculuğun Güvenli Adresi
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          
          {/* Introduction */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Gurbetbiz Nedir?</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Gurbetbiz, Avrupa'da yaşayan Türk gurbetçilerin anavatanlarına olan özlemlerini en ekonomik ve en pratik şekilde giderebilmeleri için kurulmuş bir online seyahat platformudur. Amacımız, gurbetçilerimizin sevdiklerine ulaşma yolculuğunu, bütçelerini sarsmadan güvenli ve kolay bir deneyime dönüştürmektir.
            </p>
          </div>

          {/* Mission */}
          <div className="bg-blue-50 rounded-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Misyonumuz</h2>
            <p className="text-lg text-blue-800 leading-relaxed">
              Gurbetbiz olarak, her memleket hasreti çeken gurbetçiye, en uygun fiyatlı ve en kaliteli seyahat hizmetlerini tek bir noktadan sunmayı misyon edindik. Havayolları, oteller ve araç kiralama şirketleri ile yaptığımız özel anlaşmalar sayesinde, uçak biletinden konaklamaya, araç kiralamadan tüm seyahat ihtiyaçlarına kadar her şeyi güvenle ve kolayca karşılamayı hedefliyoruz.
            </p>
          </div>

          {/* Services */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Hizmetlerimiz</h2>
            <div className="grid md:grid-cols-3 gap-8">
              
              {/* Flight */}
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✈️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Uçak Bileti</h3>
                <p className="text-gray-700">
                  Avrupa'dan Türkiye'ye en uygun fiyatlı uçuş seçeneklerini sunarak, yolculuğunuzun ilk adımını ekonomik hale getiriyoruz.
                </p>
              </div>

              {/* Hotel */}
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🏨</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Otel Rezervasyonu</h3>
                <p className="text-gray-700">
                  Türkiye'deki binlerce otel arasından bütçenize ve zevkinize en uygun olanı bulmanızı sağlıyoruz.
                </p>
              </div>

              {/* Car Rental */}
              <div className="text-center">
                <div className="bg-orange-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🚗</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Araç Kiralama</h3>
                <p className="text-gray-700">
                  Havaalanından indiğiniz anda özgürce seyahat edebilmeniz için geniş araç kiralama seçeneklerini bir araya getiriyoruz.
                </p>
              </div>
            </div>
          </div>

          {/* Vision */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Vizyonumuz</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Her gurbetçinin gönül rahatlığıyla memleketine gidebilmesi için tüm seyahat ihtiyaçlarını tek bir platformda birleştirmek ve bu yolculuğu, baştan sona kayıt altında tutarak eksiksiz bir şekilde tamamlamasını sağlamaktır.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed font-medium">
              Gurbetbiz, sadece bir seyahat sitesi değil, aynı zamanda memleketine giden yolda en güvenilir dostunuzdur.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
