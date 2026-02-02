'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';
import ValidationPopup from '@/components/ValidationPopup';
import { HotelBookingForm } from '@/modules/hotel/components';
import { HotelPriceSummary } from '@/modules/hotel/components/booking';
import { getHotelDetails } from '@/modules/hotel/services';
import { getNights, formatPrice, formatDate } from '@/modules/hotel/utils';
import { logger } from '@/lib/logger';
import type { HotelDetails, RoomType, Rate, GuestInfo } from '@/modules/hotel/types';

type BookingSuccessResult = {
  confirmationNumber: string;
  hotel: { name: string };
  room: { name: string };
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  currency: string;
};

function HotelBookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  // URL parametreleri
  const hotelId = searchParams.get('hotelId') || '';
  const roomId = searchParams.get('roomId') || '';
  const rateId = searchParams.get('rateId') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const adults = parseInt(searchParams.get('adults') || '2', 10);
  const children = parseInt(searchParams.get('children') || '0', 10);
  const rooms = parseInt(searchParams.get('rooms') || '1', 10);

  // State
  const [hotel, setHotel] = useState<HotelDetails | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<BookingSuccessResult | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationPopup, setShowValidationPopup] = useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  // Verileri yükle
  useEffect(() => {
    async function loadBookingData() {
      if (!hotelId || !roomId || !rateId) {
        setError('Eksik rezervasyon bilgisi');
        setLoading(false);
        return;
      }

      try {
        const hotelDetails = await getHotelDetails(hotelId);
        if (!hotelDetails) {
          setError('Otel bulunamadı');
          setLoading(false);
          return;
        }

        setHotel(hotelDetails);

        // Oda ve rate bul
        const room = hotelDetails.rooms.find(r => r.id === roomId);
        if (!room) {
          setError('Oda bulunamadı');
          setLoading(false);
          return;
        }
        setSelectedRoom(room);

        const rate = room.rates.find(r => r.id === rateId);
        if (!rate) {
          setError('Fiyat seçeneği bulunamadı');
          setLoading(false);
          return;
        }
        setSelectedRate(rate);

      } catch (err) {
        setError('Veriler yüklenirken bir hata oluştu');
        logger.error('Booking data error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadBookingData();
  }, [hotelId, roomId, rateId]);

  // Session'dan kullanıcı bilgilerini al (GuestForm'a otomatik doldurulacak)
  useEffect(() => {
    if (session?.user) {
      // Session bilgileri GuestForm component'inde kullanılabilir
      // Şimdilik sadece kontrol ediyoruz
    }
  }, [session]);

  // Rezervasyon gönder - Veritabanına kayıt et
  const handleSubmit = async (guestInfo: GuestInfo, specialRequests?: string) => {
    if (!hotel || !selectedRoom || !selectedRate) return;

    // Giriş kontrolü
    if (status === 'unauthenticated') {
      setShowLoginModal(true);
      return;
    }

    if (status === 'loading') {
      return; // Session yükleniyor, bekle
    }

    // Form validasyonu
    const errors: string[] = [];
    
    if (!guestInfo.firstName || guestInfo.firstName.trim().length < 2) {
      errors.push('Ad en az 2 karakter olmalıdır');
    }
    if (!guestInfo.lastName || guestInfo.lastName.trim().length < 2) {
      errors.push('Soyad en az 2 karakter olmalıdır');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidationPopup(true);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const nights = getNights(checkIn, checkOut);
      const totalPrice = selectedRate.price * nights * rooms;

      // API'ye doğru formatta gönder - Veritabanına kayıt et
      const response = await fetch('/api/hotels/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotelId: hotel.id,
          hotelName: hotel.name,
          hotelLocation: `${hotel.location.city}, ${hotel.location.country}`,
          roomType: selectedRoom.id,
          roomName: selectedRoom.name,
          checkIn: checkIn,
          checkOut: checkOut,
          nights: nights,
          guests: {
            adults,
            children,
            rooms
          },
          guestInfo: {
            firstName: guestInfo.firstName,
            lastName: guestInfo.lastName,
            email: guestInfo.email,
            phone: guestInfo.phone,
            countryCode: guestInfo.countryCode || '+90',
            country: guestInfo.country || 'TR'
          },
          totalPrice: totalPrice,
          currency: selectedRate.currency,
          cancellationPolicy: selectedRate.cancellationPolicy || 'İptal politikası otel tarafından belirlenir',
          specialRequests: specialRequests || null,
          provider: 'demo'
        })
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errMessage = 'Rezervasyon oluşturulamadı';
        try {
          const parsed = JSON.parse(responseText);
          if (typeof parsed?.error === 'string') errMessage = parsed.error;
        } catch {
          if (responseText.length > 0 && responseText.length < 300) errMessage = responseText;
        }
        throw new Error(errMessage);
      }

      const result = JSON.parse(responseText) as {
        success?: boolean;
        data?: { booking: { id: string }; confirmationNumber: string };
        error?: string;
      };

      if (result.success) {
        logger.info('Otel rezervasyonu başarıyla oluşturuldu', {
          bookingId: result.data!.booking.id,
          confirmationNumber: result.data!.confirmationNumber
        });

        setBookingResult({
          confirmationNumber: result.data!.confirmationNumber,
          hotel: {
            name: hotel.name
          },
          room: {
            name: selectedRoom.name
          },
          checkIn: checkIn,
          checkOut: checkOut,
          totalPrice: totalPrice,
          currency: selectedRate.currency
        });
      } else {
        throw new Error(result.error || 'Rezervasyon oluşturulamadı');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Rezervasyon oluşturulamadı';
      setError(errorMessage);
      logger.error('Otel rezervasyon hatası', { error: err });
    } finally {
      setSubmitting(false);
    }
  };

  // Geri git
  const handleBack = () => {
    if (hotelId) {
      router.push(`/hotels/${hotelId}?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}&rooms=${rooms}`);
    } else {
      router.push('/hotels/search');
    }
  };

  // Loading durumu
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-green-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Rezervasyon bilgileri yükleniyor...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Rezervasyon başarılı
  if (bookingResult) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-8 text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Rezervasyon Onaylandı!
            </h1>
            <p className="text-gray-600 mb-6">
              Rezervasyonunuz oluşturuldu. Onay detayları e-posta ile paylaşılacaktır.
            </p>

            <div className="bg-gray-50 rounded-xl p-6 text-left mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Rezervasyon Detayları</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Onay Numarası</span>
                  <span className="font-mono font-bold text-green-600">
                    {bookingResult.confirmationNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Otel</span>
                  <span className="font-medium">{bookingResult.hotel.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Oda</span>
                  <span>{bookingResult.room.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tarih</span>
                  <span>
                    {formatDate(bookingResult.checkIn)} - {formatDate(bookingResult.checkOut)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam</span>
                  <span className="font-bold text-green-600">
                    {formatPrice(bookingResult.totalPrice, bookingResult.currency)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600"
              >
                Ana Sayfaya Dön
              </button>
              <button
                onClick={() => router.push('/hesabim/seyahatlerim')}
                className="px-6 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50"
              >
                Rezervasyonlarım
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Hata durumu
  if (error || !hotel || !selectedRoom || !selectedRate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md mx-auto">
            <h2 className="text-xl font-bold text-red-700 mb-2">Hata</h2>
            <p className="text-red-600 mb-4">{error || 'Rezervasyon bilgileri yüklenemedi'}</p>
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

  const nights = getNights(checkIn, checkOut);
  const totalPrice = selectedRate.price * nights * rooms;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Forms */}
          <div className="lg:col-span-2 space-y-6">
            <HotelBookingForm
              ref={formRef}
              hotelName={hotel.name}
              roomName={selectedRoom.name}
              rateName={selectedRate.name}
              checkIn={checkIn}
              checkOut={checkOut}
              nights={nights}
              guests={{ adults, children, rooms }}
              totalPrice={totalPrice}
              currency={selectedRate.currency}
              onSubmit={handleSubmit}
              isLoading={submitting}
              session={session}
              onLoginClick={() => setShowLoginModal(true)}
            />

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Right Column: Price Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <HotelPriceSummary
                hotelName={hotel.name}
                roomName={selectedRoom.name}
                rateName={selectedRate.name}
                checkIn={checkIn}
                checkOut={checkOut}
                nights={nights}
                guests={{ adults, children, rooms }}
                totalPrice={totalPrice}
                currency={selectedRate.currency}
              />

              {/* Rezervasyon butonu */}
              <button
                type="button"
                onClick={() => {
                  // Form submit'i tetikle
                  if (formRef.current) {
                    formRef.current.requestSubmit();
                  }
                }}
                disabled={submitting}
                className="w-full mt-4 bg-green-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'İşleniyor...' : 'Rezervasyonu Tamamla'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Ödeme güvenli bağlantı üzerinden yapılacaktır
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Validation Popup */}
      <ValidationPopup
        isOpen={showValidationPopup}
        onClose={() => setShowValidationPopup(false)}
        errors={validationErrors}
      />

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}

export default function HotelBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Yükleniyor...</p>
        </div>
      </div>
    }>
      <HotelBookingContent />
    </Suspense>
  );
}



