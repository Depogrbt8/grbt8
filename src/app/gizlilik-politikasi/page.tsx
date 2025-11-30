'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function GizlilikPolitikasiPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              GURBETBİZ GİZLİLİK POLİTİKASI
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">1. Giriş</h2>
                <p className="text-gray-600 leading-relaxed">
                  Gurbetbiz olarak, kullanıcılarımızın kişisel bilgilerinin güvenliği ve gizliliği bizim için çok önemlidir. Bu gizlilik politikası, hangi bilgileri topladığımızı, nasıl kullandığımızı ve koruduğumuzu açıklar.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">2. Topladığımız Bilgiler</h2>
                <p className="text-gray-600 mb-4">Sitemizi kullandığınızda aşağıdaki kişisel bilgileri toplayabiliriz:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>İsim, soyisim</li>
                  <li>E-posta adresi</li>
                  <li>Telefon numarası</li>
                  <li>Doğum tarihi</li>
                  <li>Seyahat bilgileri (uçuş, konaklama, araç kiralama detayları)</li>
                  <li>Ödeme bilgileri (kredi kartı gibi), ancak ödeme işlemleri güvenli üçüncü taraf ödeme sistemleri aracılığıyla yapılır, ödeme bilgileri tarafımızca saklanmaz.</li>
                  <li>IP adresi ve çerezler aracılığıyla site kullanımı verileri</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">3. Bilgilerin Kullanım Amaçları</h2>
                <p className="text-gray-600 mb-4">Topladığımız bilgiler:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Rezervasyonların oluşturulması ve takibi</li>
                  <li>Müşteri hizmetleri ve destek sağlamak</li>
                  <li>Kullanıcı deneyimini geliştirmek</li>
                  <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                  <li>Size promosyon ve bilgilendirme amaçlı e-postalar göndermek (izin verdiğiniz takdirde)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">4. Bilgi Paylaşımı</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-3 ml-4">
                  <li>Kişisel bilgileriniz, hizmetlerin sunulması için gerekli olduğu ölçüde üçüncü taraf hizmet sağlayıcılarla (havayolları, oteller, araç kiralama firmaları) paylaşılır.</li>
                  <li>Yasal zorunluluklar haricinde, bilgilerinizi izniniz olmadan üçüncü şahıslarla paylaşmayız.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">5. Çerezler (Cookies)</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-3 ml-4">
                  <li>Site performansını artırmak ve kullanım alışkanlıklarını analiz etmek için çerezler kullanılır.</li>
                  <li>Çerezleri tarayıcı ayarlarından engelleme seçeneğiniz vardır; ancak bazı hizmetlerde kısıtlamalar yaşanabilir.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">6. Bilgi Güvenliği</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-3 ml-4">
                  <li>Kişisel bilgilerinizin güvenliği için endüstri standartlarında teknik ve idari önlemler alınmaktadır.</li>
                  <li>Ancak internet üzerinden yapılan iletimlerde %100 güvenlik garanti edilemez.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">7. GDPR Kapsamında Kullanıcı Hakları (Avrupa Birliği)</h2>
                <p className="text-gray-600 mb-4">Avrupa Birliği'nde bulunan kullanıcılarımız GDPR (Genel Veri Koruma Yönetmeliği) kapsamında aşağıdaki haklara sahiptir:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-3 ml-4">
                  <li><strong>Erişim Hakkı:</strong> Kişisel verilerinize erişim talep edebilirsiniz.</li>
                  <li><strong>Düzeltme Hakkı:</strong> Yanlış veya eksik verilerinizi düzeltme talep edebilirsiniz.</li>
                  <li><strong>Silme Hakkı (Unutulma Hakkı):</strong> Kişisel verilerinizin silinmesini talep edebilirsiniz.</li>
                  <li><strong>Veri Taşınabilirliği:</strong> Verilerinizi başka bir hizmet sağlayıcıya aktarma talep edebilirsiniz.</li>
                  <li><strong>İtiraz Hakkı:</strong> Veri işlemeye itiraz edebilirsiniz.</li>
                  <li><strong>İşlemeyi Kısıtlama:</strong> Veri işlemeyi kısıtlama talep edebilirsiniz.</li>
                  <li><strong>Pazarlama İzni:</strong> Pazarlama izinlerinizi istediğiniz zaman geri çekebilirsiniz.</li>
                </ul>
                <p className="text-gray-600 mt-4">
                  Bu haklarınızı kullanmak için bizimle{' '}
                  <Link href="/yardim" className="text-green-600 hover:text-green-700 underline">
                    iletişime geçebilirsiniz
                  </Link>.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">8. Veri İşleme Yasal Dayanağı</h2>
                <p className="text-gray-600 mb-4">Kişisel verileriniz aşağıdaki yasal dayanaklara göre işlenmektedir:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-3 ml-4">
                  <li><strong>Sözleşmenin İfası:</strong> Rezervasyon ve hizmet sunumu için gerekli veriler</li>
                  <li><strong>Yasal Yükümlülük:</strong> Yasal zorunlulukların yerine getirilmesi</li>
                  <li><strong>Meşru Menfaat:</strong> İşletme faaliyetlerinin yürütülmesi</li>
                  <li><strong>Açık Rıza:</strong> Pazarlama ve analitik amaçlı veri işleme (izin verdiğiniz takdirde)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">9. Veri Saklama Süreleri</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-3 ml-4">
                  <li>Rezervasyon verileri: Rezervasyon tamamlandıktan sonra 5 yıl (yasal zorunluluk)</li>
                  <li>Hesap bilgileri: Hesap aktif olduğu sürece</li>
                  <li>Analitik veriler: 26 ay (Google Analytics varsayılan süresi)</li>
                  <li>Pazarlama izinleri: İzin geri çekilene kadar</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">10. Veri İhlali Bildirimi</h2>
                <p className="text-gray-600 leading-relaxed">
                  Kişisel verilerinizin güvenliğini etkileyen bir ihlal durumunda, yasal süre içinde (72 saat) ilgili veri koruma otoritesine bildirim yapılacak ve etkilenen kullanıcılar bilgilendirilecektir.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">11. Data Protection Officer (DPO)</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  GDPR gerekliliklerine uygun olarak, veri koruma sorumlusu (DPO) ile iletişim için:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li><strong>E-posta:</strong> dpo@gurbetbiz.app</li>
                  <li><strong>Adres:</strong> [Şirket Adresi, Berlin, Almanya]</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">12. 18 Yaş Altı Kullanıcılar</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-3 ml-4">
                  <li>Hizmetlerimizi kullanabilmek için 18 yaşından büyük olmanız gerekmektedir.</li>
                  <li>18 yaş altı kullanıcıların bilgileri yasal vasilerinin izni olmadan toplanmaz.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">13. Politikadaki Değişiklikler</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-3 ml-4">
                  <li>Bu gizlilik politikası zaman zaman güncellenebilir.</li>
                  <li>Güncellemeler sitemizde yayımlanır ve önemli değişikliklerde kullanıcılar bilgilendirilir.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">14. İletişim</h2>
                <p className="text-gray-600 leading-relaxed">
                  Gizlilik politikamızla ilgili sorularınız için bizimle iletişime geçebilirsiniz.{' '}
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

