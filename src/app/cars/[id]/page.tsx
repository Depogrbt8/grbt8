'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Check, X, Users, Briefcase, Fuel, Gauge, Shield, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Rezervasyon yap (tarih/lokasyon varsa booking özetinde gösterilsin diye query ile geçir)
  const handleBooking = () => {
    const q = new URLSearchParams({ carId, token: searchToken });
    const pickupDate = searchParams.get('pickupDate');
    const pickupTime = searchParams.get('pickupTime');
    const dropoffDate = searchParams.get('dropoffDate');
    const dropoffTime = searchParams.get('dropoffTime');
    const pickupName = searchParams.get('pickupName');
    const dropoffName = searchParams.get('dropoffName');
    if (pickupDate) q.set('pickupDate', pickupDate);
    if (pickupTime) q.set('pickupTime', pickupTime);
    if (dropoffDate) q.set('dropoffDate', dropoffDate);
    if (dropoffTime) q.set('dropoffTime', dropoffTime);
    if (pickupName) q.set('pickupName', pickupName);
    if (dropoffName) q.set('dropoffName', dropoffName);
    router.push(`/cars/booking?${q.toString()}`);
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

  // Galeri ok fonksiyonları (otel detay ile aynı mantık)
  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev === car.images.length - 1 ? 0 : prev + 1));
  };
  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? car.images.length - 1 : prev - 1));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Geri butonu - otel detay ile aynı bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 lg:px-12 xl:px-16 2xl:px-20 py-3 max-w-7xl">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Aramaya Dön</span>
          </button>
        </div>
      </div>

      <main className="container mx-auto px-4 lg:px-12 xl:px-16 2xl:px-20 py-4 md:py-6 max-w-7xl pb-24 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Sol / tek sütun: Araç bilgileri */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Görsel galerisi - otel detay ile aynı yapı (mobilde h-64 sm:h-80, oklar, sayaç) */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="relative h-64 sm:h-80 md:h-96 bg-gray-200">
                <Image
                  src={car.images[selectedImageIndex]}
                  alt={car.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 66vw"
                />
                {car.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  </>
                )}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImageIndex + 1} / {car.images.length}
                </div>
              </div>
              {/* Küçük görseller - sadece desktop */}
              {car.images.length > 1 && (
                <div className="hidden md:grid grid-cols-4 gap-2 p-4">
                  {car.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImageIndex === idx ? 'border-green-500' : 'border-gray-200'
                      }`}
                    >
                      <Image src={img} alt="" fill className="object-cover" sizes="120px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Araç başlık ve özellikler - kart stili (otel gibi) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 break-words">{car.name}</h1>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        {car.category.toUpperCase()}
                      </span>
                      {car.supplierRating && (
                        <span className="text-gray-600">⭐ {car.supplierRating.toFixed(1)}</span>
                      )}
                    </div>
                  </div>
                  {car.supplierLogo && (
                    <div className="relative w-20 h-10 md:w-24 md:h-12 flex-shrink-0">
                      <Image src={car.supplierLogo} alt={car.supplierName} fill className="object-contain" sizes="96px" />
                    </div>
                  )}
                </div>
                {/* Özellikler grid - mobilde 2 sütun */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 py-4 border-t border-b border-gray-100">
                  <div className="flex items-center gap-2 md:gap-3">
                    <Users className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <div className="text-xs md:text-sm text-gray-500">Yolcu</div>
                      <div className="font-medium text-sm md:text-base">{car.seats} Kişi</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3">
                    <Briefcase className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <div className="text-xs md:text-sm text-gray-500">Bagaj</div>
                      <div className="font-medium text-sm md:text-base">{car.largeBags}B + {car.smallBags}K</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3">
                    <Gauge className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <div className="text-xs md:text-sm text-gray-500">Vites</div>
                      <div className="font-medium text-sm md:text-base">{TRANSMISSION_LABELS[car.transmission]}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3">
                    <Fuel className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <div className="text-xs md:text-sm text-gray-500">Yakıt</div>
                      <div className="font-medium text-sm md:text-base">{FUEL_TYPE_LABELS[car.fuelType]}</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Araç Hakkında</h2>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">{car.description}</p>
                </div>
              </div>
            </div>

            {/* Araç özellikleri listesi */}
            {car.features.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 md:p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Araç Özellikleri</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                    {car.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Kiralama koşulları */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 md:p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Kiralama Koşulları</h2>
                <div className="space-y-0 text-sm">
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Minimum Yaş</span>
                    <span className="font-medium">{car.rentalConditions.minimumAge} yaş</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Minimum Ehliyet Yaşı</span>
                    <span className="font-medium">{car.rentalConditions.minimumLicenseAge} yıl</span>
                  </div>
                  {car.rentalConditions.youngDriverFee && (
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">Genç Sürücü ({car.rentalConditions.youngDriverFee.ageRange})</span>
                      <span className="font-medium">{car.rentalConditions.youngDriverFee.amount} {car.rentalConditions.youngDriverFee.currency}/gün</span>
                    </div>
                  )}
                  {car.rentalConditions.additionalDriverFee && (
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">Ek Sürücü Ücreti</span>
                      <span className="font-medium">{car.rentalConditions.additionalDriverFee.amount} {car.rentalConditions.additionalDriverFee.currency}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-3">
                    <span className="text-gray-600">Sınır Ötesi</span>
                    <span className="font-medium">
                      {car.rentalConditions.crossBorderAllowed ? (
                        <span className="text-green-600 flex items-center gap-1"><Check className="w-4 h-4" /> İzinli</span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-1"><X className="w-4 h-4" /> İzinsiz</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Politikalar */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 md:p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Politikalar</h2>
                <div className="space-y-4 text-sm text-gray-700">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">İptal</h3>
                    <p className="text-gray-600">{car.policies.cancellation}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Hasar</h3>
                    <p className="text-gray-600">{car.policies.damage}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Geç Teslim</h3>
                    <p className="text-gray-600">{car.policies.lateReturn}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ taraf: Fiyat ve rezervasyon - desktop sticky sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-4">
              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-1">Toplam Fiyat</div>
                <div className="text-2xl md:text-3xl font-bold text-green-600">
                  {car.totalPrice.toLocaleString('tr-TR')} {car.currency}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {car.pricePerDay.toLocaleString('tr-TR')} {car.currency}/gün
                </div>
              </div>
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
                      <div className="text-gray-500 text-xs mt-0.5">{car.mileage.distance} km/gün</div>
                    )}
                  </div>
                </div>
                {car.depositAmount && (
                  <div className="flex justify-between py-2 border-t border-gray-100">
                    <span className="text-gray-600">Depozito</span>
                    <span className="font-medium">{car.depositAmount} {car.currency}</span>
                  </div>
                )}
                {car.excessAmount && (
                  <div className="flex justify-between py-2 border-t border-gray-100">
                    <span className="text-gray-600">Hasar Muafiyeti</span>
                    <span className="font-medium">{car.excessAmount} {car.currency}</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleBooking}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 rounded-xl transition-colors"
              >
                Rezervasyon Yap
              </button>
              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <div className="text-sm text-gray-500 mb-2">Tedarikçi</div>
                <div className="font-medium text-gray-900">{car.supplierName}</div>
                {car.supplier.rating && (
                  <div className="text-sm text-gray-600 mt-1">
                    ⭐ {car.supplier.rating.toFixed(1)} {car.supplier.reviewCount != null && `(${car.supplier.reviewCount.toLocaleString('tr-TR')} yorum)`}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobil: Sticky alt CTA - fiyat + Rezervasyon Yap (otel tarzı tek aksiyon) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20 py-3">
        <div className="container mx-auto px-4 py-3 max-w-7xl flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-gray-500">Toplam</div>
            <div className="text-xl font-bold text-green-600">
              {car.totalPrice.toLocaleString('tr-TR')} {car.currency}
            </div>
          </div>
          <button
            onClick={handleBooking}
            className="flex-1 max-w-[200px] sm:max-w-none bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors"
          >
            Rezervasyon Yap
          </button>
        </div>
      </div>

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
