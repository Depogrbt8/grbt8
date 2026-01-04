'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HotelDetails } from '@/modules/hotel/components';
import { getHotelDetails } from '@/modules/hotel/services';
import { parseSearchParams, buildSearchUrl } from '@/modules/hotel/utils';
import type { HotelDetails as HotelDetailsType } from '@/modules/hotel/types';

function HotelDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const hotelId = params.id as string;
  const urlParams = parseSearchParams(searchParams);
  
  const [hotel, setHotel] = useState<HotelDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Otel detaylarını yükle
  useEffect(() => {
    async function loadHotelDetails() {
      if (!hotelId) return;
      
      setLoading(true);
      setError(null);

      try {
        const details = await getHotelDetails(hotelId);
        if (details) {
          setHotel(details);
        } else {
          setError('Otel bulunamadı');
        }
      } catch (err) {
        setError('Otel bilgileri yüklenirken bir hata oluştu');
        console.error('Hotel details error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHotelDetails();
  }, [hotelId]);

  // Oda seçildiğinde
  const handleRoomSelect = (roomId: string, rateId: string) => {
    // Booking sayfasına yönlendir
    const bookingUrl = `/hotels/booking?hotelId=${hotelId}&roomId=${roomId}&rateId=${rateId}&checkIn=${urlParams.checkIn}&checkOut=${urlParams.checkOut}&adults=${urlParams.adults}&children=${urlParams.children}&rooms=${urlParams.rooms}`;
    router.push(bookingUrl);
  };

  // Geri git
  const handleBack = () => {
    const searchUrl = buildSearchUrl({
      location: hotel?.location.city || '',
      checkIn: urlParams.checkIn,
      checkOut: urlParams.checkOut,
      adults: urlParams.adults,
      children: urlParams.children,
      rooms: urlParams.rooms
    });
    router.push(searchUrl);
  };

  // Loading durumu
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-green-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Otel bilgileri yükleniyor...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Hata durumu
  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md mx-auto">
            <h2 className="text-xl font-bold text-red-700 mb-2">Hata</h2>
            <p className="text-red-600 mb-4">{error || 'Otel bulunamadı'}</p>
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
      
      {/* Geri butonu */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Aramaya Dön</span>
          </button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-4 md:py-6">
        <HotelDetails
          hotel={hotel}
          checkIn={urlParams.checkIn}
          checkOut={urlParams.checkOut}
          guests={{
            adults: urlParams.adults,
            children: urlParams.children,
            rooms: urlParams.rooms
          }}
          onRoomSelect={handleRoomSelect}
        />
      </main>

      <Footer />
    </div>
  );
}

export default function HotelDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Yükleniyor...</p>
        </div>
      </div>
    }>
      <HotelDetailContent />
    </Suspense>
  );
}



