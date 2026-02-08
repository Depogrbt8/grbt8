'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Check } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCarDetails, createBooking } from '@/modules/car/services';
import type { CarDetails, Driver, CarBookingData } from '@/modules/car/types';

function CarBookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const carId = searchParams.get('carId') || '';
  const searchToken = searchParams.get('token') || '';
  
  const [car, setCar] = useState<CarDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [driver, setDriver] = useState<Partial<Driver>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+90',
    dateOfBirth: '',
    age: 30,
    license: {
      number: '',
      issueDate: '',
      expiryDate: '',
      issueCountry: 'TR'
    },
    identity: {
      type: 'id_card',
      number: '',
      issueCountry: 'TR'
    }
  });
  
  // Araç detaylarını yükle
  useEffect(() => {
    async function loadCarDetails() {
      if (!carId || !searchToken) {
        setError('Geçersiz istek');
        setLoading(false);
        return;
      }
      
      try {
        const details = await getCarDetails(carId, searchToken);
        setCar(details);
      } catch (err) {
        setError('Araç bilgileri yüklenemedi');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    loadCarDetails();
  }, [carId, searchToken]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!car) return;
    
    // Basit validasyon
    if (!driver.firstName || !driver.lastName || !driver.email || !driver.phone) {
      alert('Lütfen tüm zorunlu alanları doldurun');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Rezervasyon verisi
      const bookingData: CarBookingData = {
        carId: car.id,
        searchToken,
        route: {
          pickup: {
            depotId: car.pickupDepot.id,
            datetime: new Date().toISOString() // Mock
          },
          dropoff: {
            depotId: car.dropoffDepot.id,
            datetime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Mock
          }
        },
        driver: driver as Driver,
        payment: {
          method: 'credit_card',
          timing: 'pay_online_now'
        }
      };
      
      // API üzerinden rezervasyon oluştur
      const booking = await createBooking(bookingData);
      
      // DB'ye kaydet
      const response = await fetch('/api/cars/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
      });
      
      if (!response.ok) {
        throw new Error('API error');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Başarılı, onay sayfasına yönlendir
        alert(`Rezervasyon başarılı! Rezervasyon No: ${booking.bookingNumber}`);
        router.push('/hesabim/seyahatlerim');
      } else {
        throw new Error(result.error || 'Unknown error');
      }
      
    } catch (err) {
      console.error('Rezervasyon hatası:', err);
      alert('Rezervasyon oluşturulamadı. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error || !car) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md mx-auto">
            <p className="text-red-600">{error || 'Araç bulunamadı'}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Geri Dön
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Geri Dön</span>
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol: Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Sürücü Bilgileri</h1>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Kişisel Bilgiler */}
                <div>
                  <h3 className="font-medium text-lg mb-4">Kişisel Bilgiler</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ad *
                      </label>
                      <input
                        type="text"
                        required
                        value={driver.firstName}
                        onChange={(e) => setDriver({ ...driver, firstName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Soyad *
                      </label>
                      <input
                        type="text"
                        required
                        value={driver.lastName}
                        onChange={(e) => setDriver({ ...driver, lastName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-posta *
                      </label>
                      <input
                        type="email"
                        required
                        value={driver.email}
                        onChange={(e) => setDriver({ ...driver, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefon *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={driver.countryCode}
                          onChange={(e) => setDriver({ ...driver, countryCode: e.target.value })}
                          className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <input
                          type="tel"
                          required
                          value={driver.phone}
                          onChange={(e) => setDriver({ ...driver, phone: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Doğum Tarihi *
                      </label>
                      <input
                        type="date"
                        required
                        value={driver.dateOfBirth}
                        onChange={(e) => {
                          const birthDate = new Date(e.target.value);
                          const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                          setDriver({ ...driver, dateOfBirth: e.target.value, age });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Ehliyet Bilgileri */}
                <div>
                  <h3 className="font-medium text-lg mb-4">Ehliyet Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ehliyet No *
                      </label>
                      <input
                        type="text"
                        required
                        value={driver.license?.number}
                        onChange={(e) => setDriver({
                          ...driver,
                          license: { ...driver.license!, number: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Verilme Tarihi *
                      </label>
                      <input
                        type="date"
                        required
                        value={driver.license?.issueDate}
                        onChange={(e) => setDriver({
                          ...driver,
                          license: { ...driver.license!, issueDate: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Geçerlilik Tarihi *
                      </label>
                      <input
                        type="date"
                        required
                        value={driver.license?.expiryDate}
                        onChange={(e) => setDriver({
                          ...driver,
                          license: { ...driver.license!, expiryDate: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Kimlik Bilgileri */}
                <div>
                  <h3 className="font-medium text-lg mb-4">Kimlik Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kimlik Tipi *
                      </label>
                      <select
                        required
                        value={driver.identity?.type}
                        onChange={(e) => setDriver({
                          ...driver,
                          identity: { ...driver.identity!, type: e.target.value as any }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="id_card">T.C. Kimlik Kartı</option>
                        <option value="passport">Pasaport</option>
                        <option value="driving_license">Ehliyet</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kimlik No *
                      </label>
                      <input
                        type="text"
                        required
                        value={driver.identity?.number}
                        onChange={(e) => setDriver({
                          ...driver,
                          identity: { ...driver.identity!, number: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      İşleniyor...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Rezervasyonu Tamamla
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
          
          {/* Sağ: Özet */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 sticky top-4">
              <h3 className="font-bold text-lg mb-4">Rezervasyon Özeti</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="font-medium text-gray-900">{car.name}</div>
                  <div className="text-sm text-gray-500">{car.supplierName}</div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Günlük Fiyat</span>
                    <span className="font-medium">{car.pricePerDay} {car.currency}</span>
                  </div>
                  
                  {car.depositAmount && (
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Depozito</span>
                      <span className="font-medium">{car.depositAmount} {car.currency}</span>
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="font-bold text-lg">Toplam</span>
                    <span className="font-bold text-lg text-green-600">
                      {car.totalPrice.toLocaleString('tr-TR')} {car.currency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default function CarBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
      </div>
    }>
      <CarBookingContent />
    </Suspense>
  );
}
