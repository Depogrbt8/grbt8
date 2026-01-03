'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  HotelSearchForm, 
  HotelList, 
  HotelFilters 
} from '@/modules/hotel/components';
import { useHotelState, useHotelFilters } from '@/modules/hotel/hooks';
import { parseSearchParams } from '@/modules/hotel/utils';

function HotelSearchContent() {
  const searchParams = useSearchParams();
  const { hotels, loading, error, search, availableFilters } = useHotelState();
  const { filters, setFilters, applyFilters, activeFilterCount } = useHotelFilters();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // URL'den parametreleri al
  const urlParams = parseSearchParams(searchParams);

  // Mobil kontrolü
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // İlk arama
  useEffect(() => {
    if (urlParams.location && urlParams.checkIn && urlParams.checkOut) {
      search({
        location: urlParams.location,
        checkIn: urlParams.checkIn,
        checkOut: urlParams.checkOut,
        guests: {
          adults: urlParams.adults,
          children: urlParams.children,
          rooms: urlParams.rooms
        },
        filters
      });
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filtre değiştiğinde arama yap
  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    if (urlParams.location) {
      search({
        location: urlParams.location,
        checkIn: urlParams.checkIn,
        checkOut: urlParams.checkOut,
        guests: {
          adults: urlParams.adults,
          children: urlParams.children,
          rooms: urlParams.rooms
        },
        filters: newFilters
      });
    }
  };

  // Filtrelenmiş oteller
  const filteredHotels = applyFilters(hotels);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Arama formu - Mobil */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4">
        <HotelSearchForm
          initialLocation={urlParams.location}
          initialCheckIn={urlParams.checkIn}
          initialCheckOut={urlParams.checkOut}
          initialAdults={urlParams.adults}
          initialChildren={urlParams.children}
          initialRooms={urlParams.rooms}
          isMobile={true}
        />
      </div>

      {/* Desktop arama formu */}
      <div className="hidden md:block bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <HotelSearchForm
            initialLocation={urlParams.location}
            initialCheckIn={urlParams.checkIn}
            initialCheckOut={urlParams.checkOut}
            initialAdults={urlParams.adults}
            initialChildren={urlParams.children}
            initialRooms={urlParams.rooms}
          />
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        {/* Başlık ve filtre butonu (mobil) */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            {urlParams.location ? `${urlParams.location} Otelleri` : 'Otel Ara'}
          </h1>
          
          {/* Mobil filtre butonu */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>Filtreler</span>
            {activeFilterCount > 0 && (
              <span className="bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar Filtreler */}
          <aside className="hidden md:block w-72 flex-shrink-0">
            <HotelFilters
              filters={filters}
              availableFilters={availableFilters || undefined}
              onFiltersChange={handleFiltersChange}
            />
          </aside>

          {/* Otel Listesi */}
          <div className="flex-1">
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-600">{error}</p>
              </div>
            ) : (
              <HotelList
                hotels={filteredHotels}
                loading={loading}
                checkIn={urlParams.checkIn}
                checkOut={urlParams.checkOut}
                guests={{
                  adults: urlParams.adults,
                  children: urlParams.children,
                  rooms: urlParams.rooms
                }}
              />
            )}
          </div>
        </div>
      </main>

      {/* Mobil Filtre Modal */}
      <HotelFilters
        filters={filters}
        availableFilters={availableFilters || undefined}
        onFiltersChange={handleFiltersChange}
        isMobile={true}
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
      />

      <Footer />
    </div>
  );
}

export default function HotelSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Yükleniyor...</p>
        </div>
      </div>
    }>
      <HotelSearchContent />
    </Suspense>
  );
}

