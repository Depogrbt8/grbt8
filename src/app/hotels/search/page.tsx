'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  HotelSearchForm, 
  HotelList, 
  HotelFilters 
} from '@/modules/hotel/components';
import { useHotelState, useHotelFilters } from '@/modules/hotel/hooks';
import { parseSearchParams, buildSearchUrl } from '@/modules/hotel/utils';

function HotelSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { hotels, loading, error, search, availableFilters } = useHotelState();
  const { filters, setFilters, applyFilters, activeFilterCount } = useHotelFilters();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  // URL'den parametreleri al
  const urlParams = parseSearchParams(searchParams);
  const hasSearchParams = !!(urlParams.location && urlParams.checkIn && urlParams.checkOut);

  // Client-side kontrolü
  useEffect(() => {
    setIsClient(true);
  }, []);

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

  // Düzenle modalını aç
  const handleEditClick = () => {
    setShowEditModal(true);
  };

  // Modal'dan arama yap
  const handleEditSearch = (params: {
    location: string;
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    rooms: number;
    childAges: number[];
  }) => {
    setShowEditModal(false);
    const url = buildSearchUrl(params);
    router.push(url);
  };

  // Tarih formatı (örn: 12 Tem Cts)
  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = parseISO(dateStr);
      return format(d, 'dd MMM EEE', { locale: tr });
    } catch {
      return dateStr;
    }
  };

  // Filtrelenmiş oteller
  const filteredHotels = applyFilters(hotels);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Mobil: Kompakt özet - sadece arama parametreleri varsa */}
      {isClient && isMobile && hasSearchParams && (
        <div className="block md:hidden sticky top-0 z-30 bg-white border-b border-gray-200" ref={summaryRef}>
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="font-bold text-lg text-gray-900 tracking-tight">
                {urlParams.location}
              </div>
              <div className="text-gray-500 text-sm mt-0.5 flex items-center gap-2">
                {formatDateShort(urlParams.checkIn)}
                <span className="mx-1">-</span>
                {formatDateShort(urlParams.checkOut)}
                <span className="ml-2 flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {urlParams.adults + urlParams.children}
                </span>
              </div>
            </div>
            <button className="text-green-700 underline font-semibold text-base" onClick={handleEditClick}>
              Düzenle
            </button>
          </div>
        </div>
      )}

      {/* Desktop: Büyük form - her zaman göster */}
      {(!isMobile || !hasSearchParams) && (
        <div className="bg-white border-b border-gray-200">
          <HotelSearchForm
            initialLocation={urlParams.location}
            initialCheckIn={urlParams.checkIn}
            initialCheckOut={urlParams.checkOut}
            initialAdults={urlParams.adults}
            initialChildren={urlParams.children}
            initialRooms={urlParams.rooms}
          />
        </div>
      )}

      {/* Mobil: Düzenle modalı */}
      {isClient && isMobile && showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/30">
          <div className={`fixed left-0 right-0 top-0 z-50 transition-transform duration-300 ${showEditModal ? 'translate-y-0' : '-translate-y-full'}`} style={{maxWidth: '100vw'}}>
            <div className="bg-white rounded-b-2xl shadow-xl p-4 w-full max-w-md mx-auto relative">
              <button className="absolute top-2 right-2 text-gray-400 text-2xl" onClick={() => setShowEditModal(false)}>×</button>
              <HotelSearchForm
                initialLocation={urlParams.location}
                initialCheckIn={urlParams.checkIn}
                initialCheckOut={urlParams.checkOut}
                initialAdults={urlParams.adults}
                initialChildren={urlParams.children}
                initialRooms={urlParams.rooms}
                onSearch={handleEditSearch}
                isMobile={true}
              />
            </div>
          </div>
        </div>
      )}

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

