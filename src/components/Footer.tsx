import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-50 mt-24">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-base font-semibold text-gray-600 mb-4">Şirket</h3>
            <ul className="space-y-2">
              <li><Link href="/hakkimizda" className="text-sm text-gray-700 hover:text-gray-900">Hakkımızda</Link></li>
              <li><Link href="/blog" className="text-sm text-gray-700 hover:text-gray-900">gurbetbiz Blog</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-gray-600 mb-4">Yardım ve Destek</h3>
            <ul className="space-y-2">
              <li><Link href="/yardim" className="text-sm text-gray-700 hover:text-gray-900">Yardım ve İletişim</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-gray-600 mb-4">Gizlilik ve Güvenlik</h3>
            <ul className="space-y-2">
              <li><Link href="/kullanim-sartlari" className="text-sm text-gray-700 hover:text-gray-900">Kullanım Şartları</Link></li>
              <li><Link href="/gizlilik-politikasi" className="text-sm text-gray-700 hover:text-gray-900">Gizlilik Politikası</Link></li>
              <li><Link href="/cerez-politikasi" className="text-sm text-gray-700 hover:text-gray-900">Çerez Politikası</Link></li>
              <li><Link href="/kvkk" className="text-sm text-gray-700 hover:text-gray-900">Kişisel Verilerin Korunması</Link></li>
              <li><Link href="/ticari-elektronik-ileti" className="text-sm text-gray-700 hover:text-gray-900">Ticari Elektronik İleti Açık Rıza Metni</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-600 mb-4">İletişim</h3>
            <ul className="space-y-2">
              <li className="text-sm text-gray-700">
                <strong>Adres:</strong><br />
                Örnek Mahallesi, Örnek Sokak<br />
                No: 123, Kat: 4<br />
                34000 İstanbul, Türkiye
              </li>
              <li className="text-sm text-gray-700">
                <strong>Telefon:</strong><br />
                +90 (212) 123 45 67
              </li>
              <li className="text-sm text-gray-700">
                <strong>E-posta:</strong><br />
                info@gurbetbiz.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex items-baseline">
                <span className="text-[17px] font-bold text-gray-700">gurbet</span>
                <span className="text-[17px] font-bold text-green-500">biz</span>
              </div>
              <div className="flex items-center space-x-3 bg-gray-100 px-3 py-2 rounded">
                {/* PayPal */}
                <Image
                  src="/images/payment/paypal.png"
                  alt="PayPal"
                  width={40}
                  height={25}
                  className="object-contain"
                />
                {/* Visa */}
                <Image
                  src="/images/payment/visa.png"
                  alt="Visa"
                  width={40}
                  height={25}
                  className="object-contain"
                />
                {/* Mastercard */}
                <Image
                  src="/images/payment/mastercard.png"
                  alt="Mastercard"
                  width={40}
                  height={25}
                  className="object-contain"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center md:text-right">
              © {new Date().getFullYear()} gurbetbiz. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
} 