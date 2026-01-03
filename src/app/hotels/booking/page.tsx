'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HotelBookingForm } from '@/modules/hotel/components';
import { getHotelDetails, createBooking } from '@/modules/hotel/services';
import { getNights, formatPrice, formatDate } from '@/modules/hotel/utils';
import type { HotelDetails, RoomType, Rate, GuestInfo, BookingResponse } from '@/modules/hotel/types';

function HotelBookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

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
  const [bookingResult, setBookingResult] = useState<BookingResponse | null>(null);

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
        console.error('Booking data error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadBookingData();
  }, [hotelId, roomId, rateId]);

  // Rezervasyon gönder
  const handleSubmit = async (guestInfo: GuestInfo, specialRequests?: string) => {
    if (!hotel || !selectedRoom || !selectedRate) return;

    setSubmitting(true);
    setError(null);

    try {
      const result = await createBooking({
        hotelId: hotel.id,
        roomTypeId: selectedRoom.id,
        rateId: selectedRate.id,
        checkIn,
        checkOut,
        guests: { adults, children, rooms },
        guestInfo,
        specialRequests
      });

      setBookingResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rezervasyon oluşturulamadı');
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
              Rezervasyonunuz başarıyla oluşturuldu. Onay e-postası gönderildi.
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
                onClick={() => router.push('/hesabim')}
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
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Geri butonu */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Otele Dön</span>
          </button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Rezervasyon</h1>

        <HotelBookingForm
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
        />

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </main>

      <Footer />
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

