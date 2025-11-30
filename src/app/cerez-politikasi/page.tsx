'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function CerezPolitikasiPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              GURBETBİZ ÇEREZ POLİTİKASI
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">1. Çerez Nedir?</h2>
                <p className="text-gray-600 leading-relaxed">
                  Çerezler, web siteleri tarafından cihazınıza (bilgisayar, telefon, tablet) gönderilen ve cihazınızda depolanan küçük metin dosyalarıdır. Çerezler, sitenin sizinle ilgili tercihlerinizi hatırlamasına ve deneyiminizi geliştirmesine yardımcı olur.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">2. Gurbetbiz'de Hangi Çerezler Kullanılır?</h2>
                <p className="text-gray-600 mb-4">Gurbetbiz olarak GDPR uyumlu olarak aşağıdaki çerez kategorilerini kullanıyoruz:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-3 ml-4">
                  <li><strong>Zorunlu Çerezler (Gerekli):</strong> Siteyi güvenli ve doğru şekilde kullanmanızı sağlar. Örneğin, oturum açma işlemleri için gereklidir. Bu çerezler onay gerektirmez ve her zaman aktif kalır.</li>
                  <li><strong>Performans ve Analitik Çerezler:</strong> Sitemizin performansını ve kullanımını analiz eder, hangi sayfaların ziyaret edildiğini ölçeriz. (Google Analytics, vb.) - <strong>Onay gerektirir</strong></li>
                  <li><strong>Fonksiyonel Çerezler:</strong> Kullanıcı tercihlerinizi (dil seçimi gibi) hatırlayarak deneyiminizi kişiselleştirir. - <strong>Onay gerektirir</strong></li>
                  <li><strong>Pazarlama ve Reklam Çerezleri:</strong> Site kullanımını anlamak ve size daha uygun reklamlar göstermek için kullanılır. (Facebook Pixel, vb.) - <strong>Onay gerektirir</strong></li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">3. Çerezlerin Kullanım Amaçları ve Süreleri</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300 mt-4">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Çerez Kategorisi</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Amaç</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Süre</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Onay Gerekli</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Zorunlu</td>
                        <td className="border border-gray-300 px-4 py-2">Site işlevselliği, güvenlik</td>
                        <td className="border border-gray-300 px-4 py-2">Oturum süresi</td>
                        <td className="border border-gray-300 px-4 py-2">Hayır</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Analitik</td>
                        <td className="border border-gray-300 px-4 py-2">Site kullanım analizi</td>
                        <td className="border border-gray-300 px-4 py-2">26 ay (Google Analytics)</td>
                        <td className="border border-gray-300 px-4 py-2">Evet</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Fonksiyonel</td>
                        <td className="border border-gray-300 px-4 py-2">Kullanıcı tercihleri</td>
                        <td className="border border-gray-300 px-4 py-2">1 yıl</td>
                        <td className="border border-gray-300 px-4 py-2">Evet</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Pazarlama</td>
                        <td className="border border-gray-300 px-4 py-2">Reklam ve pazarlama</td>
                        <td className="border border-gray-300 px-4 py-2">90 gün (Facebook Pixel)</td>
                        <td className="border border-gray-300 px-4 py-2">Evet</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">4. Çerez Onay Mekanizması (GDPR Uyumlu)</h2>
                <p className="text-gray-600 mb-4">
                  GDPR gerekliliklerine uygun olarak, zorunlu olmayan çerezler için açık rıza alınmaktadır. 
                  Siteyi ilk ziyaret ettiğinizde bir çerez onay banner'ı göreceksiniz ve hangi çerez kategorilerini kabul etmek istediğinizi seçebilirsiniz.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-3 ml-4">
                  <li>Çerez tercihlerinizi istediğiniz zaman değiştirebilirsiniz.</li>
                  <li>Çerezleri tarayıcı ayarlarınızdan engelleyebilir veya silebilirsiniz.</li>
                  <li>Ancak zorunlu çerezleri engellemeniz durumunda, Gurbetbiz'in bazı özellikleri düzgün çalışmayabilir.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">5. Çerezleri Yönetme ve Kapatma</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-3 ml-4">
                  <li>Çerez tercihlerinizi değiştirmek için sayfanın alt kısmındaki "Çerez Ayarları" linkini kullanabilirsiniz.</li>
                  <li>Çerezleri tarayıcı ayarlarınızdan engelleyebilir veya silebilirsiniz.</li>
                  <li>Ancak çerezleri engellemeniz durumunda, Gurbetbiz'in bazı özellikleri düzgün çalışmayabilir veya kullanımınız kısıtlanabilir.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">6. Üçüncü Taraf Çerezleri</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-3 ml-4">
                  <li>Gurbetbiz sitesi, üçüncü taraf hizmet sağlayıcıların (örneğin Google Analytics) çerezlerini kullanabilir.</li>
                  <li>Bu üçüncü tarafların çerez politikalarını ve kullanım koşullarını ayrıca incelemeniz önerilir.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">7. Çerez Politikası Değişiklikleri</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-3 ml-4">
                  <li>Bu politika zaman zaman güncellenebilir.</li>
                  <li>Güncellemeler sitemizde yayımlanır ve önemli değişikliklerde kullanıcılar bilgilendirilir.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">8. İletişim</h2>
                <p className="text-gray-600 leading-relaxed">
                  Çerez politikamız hakkında sorularınız olursa bizimle iletişime geçebilirsiniz.{' '}
                  <Link href="/yardim" className="text-green-600 hover:text-green-700 underline">
                    Yardım ve İletişim
                  </Link>{' '}
                  sayfamızı ziyaret ediniz.
                </p>
              </section>

              <div className="mt-12 p-6 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 text-center">
                  Son güncelleme: 30 Kasım 2025<br />
                  <span className="text-xs">GDPR (Genel Veri Koruma Yönetmeliği) uyumlu</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

