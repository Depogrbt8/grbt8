'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Check, X, Users, Briefcase, Fuel, Gauge, Shield, Calendar } from 'lucide-react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCarDetails } from '@/modules/car/services';
import { initCarRentalModule } from '@/modules/car/init';
import type { CarDetails } from '@/modules/car/types';
import {
  TRANSMISSION_LABELS,
  FUEL_TYPE_LABELS,
  MILEAGE_TYPE_LABELS,
  CANCELLATION_TYPE_LABELS
} from '@/modules/car/types';

function CarDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const carId = params.id as string;
  const searchToken = searchParams.get('token') || '';
  
  const [car, setCar] = useState<CarDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Araç kiralama API'sini başlat (doğrudan bu sayfaya gelindiyse)
  useEffect(() => {
    initCarRentalModule();
  }, []);

  // Araç detaylarını yükle
  useEffect(() => {
    async function loadCarDetails() {
      if (!carId || !searchToken) {
        setError('Geçersiz istek');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);

      try {
        const details = await getCarDetails(carId, searchToken);
        if (details) {
          setCar(details);
        } else {
          setError('Araç bulunamadı');
        }
      } catch (err) {
        setError('Araç bilgileri yüklenirken bir hata oluştu');
        console.error('Car details error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCarDetails();
  }, [carId, searchToken]);

  // Rezervasyon yap
  const handleBooking = () => {
    router.push(`/cars/booking?carId=${carId}&token=${searchToken}`);
  };

  // Geri git
  const handleBack = () => {
    router.back();
  };

  // Loading durumu
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-green-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Araç bilgileri yükleniyor...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Hata durumu
  if (error || !car) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md mx-auto">
            <h2 className="text-xl font-bold text-red-700 mb-2">Hata</h2>
            <p className="text-red-600 mb-4">{error || 'Araç bulunamadı'}</p>
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
        {/* Geri butonu */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Geri Dön</span>
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol taraf: Araç bilgileri */}
          <div className="lg:col-span-2 space-y-6">
            {/* Görseller */}
            <div className="bg-white rounded-xl overflow-hidden">
              {/* Ana görsel */}
              <div className="relative w-full h-96">
                <Image
                  src={car.images[selectedImageIndex]}
                  alt={car.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </div>
              
              {/* Küçük görseller */}
              {car.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-4">
                  {car.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImageIndex === idx ? 'border-green-500' : 'border-gray-200'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${car.name} ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Araç başlık ve özellikler */}
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{car.name}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                      {car.category.toUpperCase()}
                    </span>
                    {car.supplierRating && (
                      <span className="flex items-center gap-1">
                        ⭐ {car.supplierRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                
                {car.supplierLogo && (
                  <div className="relative w-24 h-12">
                    <Image
                      src={car.supplierLogo}
                      alt={car.supplierName}
                      fill
                      className="object-contain"
                      sizes="96px"
                    />
                  </div>
                )}
              </div>
              
              {/* Özellikler grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Yolcu</div>
                    <div className="font-medium">{car.seats} Kişi</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Bagaj</div>
                    <div className="font-medium">{car.largeBags}B + {car.smallBags}K</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Gauge className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Vites</div>
                    <div className="font-medium">{TRANSMISSION_LABELS[car.transmission]}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Fuel className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Yakıt</div>
                    <div className="font-medium">{FUEL_TYPE_LABELS[car.fuelType]}</div>
                  </div>
                </div>
              </div>
              
              {/* Açıklama */}
              <div className="mt-6">
                <h3 className="font-bold text-lg mb-3">Araç Hakkında</h3>
                <p className="text-gray-700 leading-relaxed">{car.description}</p>
              </div>
            </div>
            
            {/* Özellikler */}
            {car.features.length > 0 && (
              <div className="bg-white rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4">Araç Özellikleri</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {car.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Kiralama koşulları */}
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4">Kiralama Koşulları</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Minimum Yaş</span>
                  <span className="font-medium">{car.rentalConditions.minimumAge} yaş</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Minimum Ehliyet Yaşı</span>
                  <span className="font-medium">{car.rentalConditions.minimumLicenseAge} yıl</span>
                </div>
                {car.rentalConditions.youngDriverFee && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Genç Sürücü Ücreti ({car.rentalConditions.youngDriverFee.ageRange})</span>
                    <span className="font-medium">{car.rentalConditions.youngDriverFee.amount} {car.rentalConditions.youngDriverFee.currency}/gün</span>
                  </div>
                )}
                {car.rentalConditions.additionalDriverFee && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Ek Sürücü Ücreti</span>
                    <span className="font-medium">{car.rentalConditions.additionalDriverFee.amount} {car.rentalConditions.additionalDriverFee.currency}</span>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Sınır Ötesi Seyahat</span>
                  <span className="font-medium">
                    {car.rentalConditions.crossBorderAllowed ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> İzinli
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">
                        <X className="w-4 h-4" /> İzinsiz
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Politikalar */}
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4">Politikalar</h3>
              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">İptal Politikası</h4>
                  <p>{car.policies.cancellation}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Hasar Politikası</h4>
                  <p>{car.policies.damage}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Geç Teslim</h4>
                  <p>{car.policies.lateReturn}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sağ taraf: Fiyat ve rezervasyon */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 sticky top-4">
              {/* Fiyat */}
              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-1">Toplam Fiyat</div>
                <div className="text-3xl font-bold text-green-600">
                  {car.totalPrice.toLocaleString('tr-TR')} {car.currency}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  ({car.pricePerDay.toLocaleString('tr-TR')} {car.currency}/gün)
                </div>
              </div>
              
              {/* Önemli bilgiler */}
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">{CANCELLATION_TYPE_LABELS[car.cancellation.type]}</div>
                    {car.cancellation.freeCancellationBefore && (
                      <div className="text-gray-500 text-xs mt-0.5">
                        {new Date(car.cancellation.freeCancellationBefore).toLocaleDateString('tr-TR')} tarihine kadar
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">{MILEAGE_TYPE_LABELS[car.mileage.type]} Kilometre</div>
                    {car.mileage.type === 'limited' && car.mileage.distance && (
                      <div className="text-gray-500 text-xs mt-0.5">
                        {car.mileage.distance} km/gün
                      </div>
                    )}
                  </div>
                </div>
                
                {car.depositAmount && (
                  <div className="flex justify-between py-2 border-t">
                    <span className="text-gray-600">Depozito</span>
                    <span className="font-medium">{car.depositAmount} {car.currency}</span>
                  </div>
                )}
                
                {car.excessAmount && (
                  <div className="flex justify-between py-2 border-t">
                    <span className="text-gray-600">Hasar Muafiyeti</span>
                    <span className="font-medium">{car.excessAmount} {car.currency}</span>
                  </div>
                )}
              </div>
              
              {/* Rezervasyon butonu */}
              <button
                onClick={handleBooking}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 rounded-lg transition-colors"
              >
                Rezervasyon Yap
              </button>
              
              {/* Tedarikçi bilgisi */}
              <div className="mt-6 pt-6 border-t text-center">
                <div className="text-sm text-gray-500 mb-2">Tedarikçi</div>
                <div className="font-medium text-gray-900">{car.supplierName}</div>
                {car.supplier.rating && (
                  <div className="text-sm text-gray-600 mt-1">
                    ⭐ {car.supplier.rating.toFixed(1)} ({car.supplier.reviewCount?.toLocaleString('tr-TR')} yorum)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default function CarDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
      </div>
    }>
      <CarDetailContent />
    </Suspense>
  );
}
