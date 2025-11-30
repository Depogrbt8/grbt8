'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HelpCircle, Phone, Mail, MessageCircle, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function YardimPage() {
  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Başlık */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Yardım ve İletişim</h1>
            <p className="text-gray-600">Size nasıl yardımcı olabiliriz?</p>
          </div>

          {/* Ana Bölümler */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* İletişim Bilgileri */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-500" />
                İletişim Bilgileri
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-900">Telefon</p>
                    <p className="text-sm text-gray-600">+90 212 XXX XX XX</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-900">E-posta</p>
                    <p className="text-sm text-gray-600">destek@gurbetbiz.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-900">Çalışma Saatleri</p>
                    <p className="text-sm text-gray-600">7/24 Hizmet</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-900">Adres</p>
                    <p className="text-sm text-gray-600">İstanbul, Türkiye</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mail Formu */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-green-500" />
                Bize Yazın
              </h2>
              <form action="mailto:destek@gurbetbiz.com" method="post" encType="text/plain" className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Adınız Soyadınız *</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    required 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Adınız ve soyadınız"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-posta Adresiniz *</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    required 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="ornek@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Konu *</label>
                  <select 
                    id="subject" 
                    name="subject" 
                    required 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Konu seçiniz</option>
                    <option value="Rezervasyon Sorunu">Rezervasyon Sorunu</option>
                    <option value="Bilet İptali">Bilet İptali</option>
                    <option value="Check-in Sorunu">Check-in Sorunu</option>
                    <option value="Ödeme Sorunu">Ödeme Sorunu</option>
                    <option value="Teknik Sorun">Teknik Sorun</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Mesajınız *</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows={5} 
                    required 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Sorununuzu detaylı bir şekilde açıklayınız..."
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors font-medium"
                  >
                    Mesaj Gönder
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Hızlı İşlemler</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/check-in" className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <span className="text-green-500 font-medium">Online Check-in</span>
              </a>
              <a href="/pnr-sorgula" className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <span className="text-blue-500 font-medium">PNR Sorgula</span>
              </a>
              <a href="/bilet-iptal" className="flex flex-col items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <span className="text-red-500 font-medium">Bilet İptal</span>
              </a>
              <a href="/hesabim" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-gray-500 font-medium">Hesabım</span>
              </a>
            </div>
          </div>

          {/* Sık Sorulan Sorular */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-green-500" />
              Sık Sorulan Sorular
            </h2>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-3">
                <h3 className="font-medium text-gray-900 mb-2">Uçak bileti nasıl rezerve edebilirim?</h3>
                <p className="text-sm text-gray-600">Ana sayfada uçuş bilgilerinizi girerek bilet arayabilir ve rezervasyon yapabilirsiniz.</p>
              </div>
              <div className="border-b border-gray-200 pb-3">
                <h3 className="font-medium text-gray-900 mb-2">Biletimi nasıl iptal edebilirim?</h3>
                <p className="text-sm text-gray-600">"Biletimi İptal Et" sayfasından PNR numaranızı girerek iptal işlemi yapabilirsiniz.</p>
              </div>
              <div className="border-b border-gray-200 pb-3">
                <h3 className="font-medium text-gray-900 mb-2">Online check-in nasıl yapılır?</h3>
                <p className="text-sm text-gray-600">"Online Check-in" sayfasından rezervasyon bilgilerinizi girerek check-in yapabilirsiniz.</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">PNR sorgulama nedir?</h3>
                <p className="text-sm text-gray-600">PNR (Passenger Name Record) ile rezervasyon detaylarınızı görüntüleyebilirsiniz.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
