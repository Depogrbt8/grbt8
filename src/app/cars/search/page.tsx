'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { format, parse } from 'date-fns';
import { tr } from 'date-fns/locale';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CarList, CarFilters, CarSearchForm } from '@/modules/car/components';
import { searchCars } from '@/modules/car/services';
import { initCarRentalModule } from '@/modules/car/init';
import type { Car, CarFiltersType, CarSearchResult } from '@/modules/car/types';
import { getLastCarSearch, setLastCarSearch } from '@/lib/lastSearch';
import { Loader2, Filter, ArrowUpDown } from 'lucide-react';

// Initialize module
if (typeof window !== 'undefined') {
  initCarRentalModule();
}

function CarSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL'den parametreleri al
  const pickupLocationId = searchParams.get('pickupLocationId') || '';
  const dropoffLocationId = searchParams.get('dropoffLocationId') || '';
  const pickupDate = searchParams.get('pickupDate') || '';
  const pickupTime = searchParams.get('pickupTime') || '10:00';
  const dropoffDate = searchParams.get('dropoffDate') || '';
  const dropoffTime = searchParams.get('dropoffTime') || '10:00';
  const driverAge = parseInt(searchParams.get('driverAge') || '30');
  const pickupName = searchParams.get('pickupName') || '';
  const dropoffName = searchParams.get('dropoffName') || '';

  // State
  const [searchResult, setSearchResult] = useState<CarSearchResult | null>(null);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [filters, setFilters] = useState<CarFiltersType>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating'>('price_asc');
  const [showFilters, setShowFilters] = useState(false);
  /** Mobil: arama özeti mi gösterilecek (false) yoksa form düzenleme mi (true) */
  const [showEditForm, setShowEditForm] = useState(false);
  /** Mobil: sıralama dropdown açık mı */
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  /** Mobil: Düzenle modalı açılış animasyonu (yukarıdan kayma) */
  const [editModalMounted, setEditModalMounted] = useState(false);

  // Düzenle modalı açıldığında yukarıdan kayma animasyonu
  useEffect(() => {
    if (showEditForm) {
      setEditModalMounted(false);
      const t = requestAnimationFrame(() => {
        requestAnimationFrame(() => setEditModalMounted(true));
      });
      return () => cancelAnimationFrame(t);
    } else {
      setEditModalMounted(false);
    }
  }, [showEditForm]);

  // Eksik parametre varsa son aramayla yönlendir
  useEffect(() => {
    if (!pickupLocationId || !dropoffLocationId || !pickupDate || !dropoffDate) {
      const last = getLastCarSearch();
      if (last?.pickupLocationId && last?.pickupDate && last?.dropoffDate) {
        const q = new URLSearchParams({
          pickupLocationId: last.pickupLocationId,
          dropoffLocationId: last.dropoffLocationId,
          pickupDate: last.pickupDate,
          pickupTime: last.pickupTime,
          dropoffDate: last.dropoffDate,
          dropoffTime: last.dropoffTime,
          driverAge: String(last.driverAge)
        });
        if (last.pickupName) q.set('pickupName', last.pickupName);
        if (last.dropoffName) q.set('dropoffName', last.dropoffName);
        router.replace(`/cars/search?${q.toString()}`);
        return;
      }
      setError('Eksik arama parametreleri');
      setLoading(false);
      return;
    }
  }, [pickupLocationId, dropoffLocationId, pickupDate, dropoffDate, router]);

  // İlk arama + son aramayı güncelle
  useEffect(() => {
    if (!pickupLocationId || !dropoffLocationId || !pickupDate || !dropoffDate) return;

    setLastCarSearch({
      pickupLocationId,
      dropoffLocationId,
      pickupDate,
      pickupTime,
      dropoffDate,
      dropoffTime,
      driverAge,
      pickupName: pickupName || undefined,
      dropoffName: dropoffName || undefined
    });
    performSearch();
  }, [pickupLocationId, dropoffLocationId, pickupDate, dropoffDate, pickupTime, dropoffTime, driverAge]);
  
  // Filtreleme ve sıralama
  useEffect(() => {
    if (!searchResult) return;
    
    let cars = [...searchResult.data];
    
    // Filtreleme
    if (filters.carCategories?.length) {
      cars = cars.filter(c => filters.carCategories!.includes(c.category));
    }
    if (filters.transmissionType) {
      cars = cars.filter(c => c.transmission === filters.transmissionType);
    }
    if (filters.mileageType) {
      cars = cars.filter(c => c.mileage.type === filters.mileageType);
    }
    if (filters.numberOfSeats) {
      cars = cars.filter(c => c.seats >= filters.numberOfSeats!);
    }
    if (filters.airConditioning !== undefined) {
      cars = cars.filter(c => c.airConditioning === filters.airConditioning);
    }
    if (filters.supplierIds?.length) {
      cars = cars.filter(c => filters.supplierIds!.includes(c.supplierId));
    }
    if (filters.priceRange) {
      cars = cars.filter(c => 
        c.totalPrice >= filters.priceRange!.min && 
        c.totalPrice <= filters.priceRange!.max
      );
    }
    
    // Sıralama
    switch (sortBy) {
      case 'price_asc':
        cars.sort((a, b) => a.totalPrice - b.totalPrice);
        break;
      case 'price_desc':
        cars.sort((a, b) => b.totalPrice - a.totalPrice);
        break;
      case 'rating':
        cars.sort((a, b) => (b.supplierRating || 0) - (a.supplierRating || 0));
        break;
    }
    
    setFilteredCars(cars);
  }, [searchResult, filters, sortBy]);
  
  const performSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Lokasyon bilgilerini al (basit mock)
      const pickupLocation = {
        id: pickupLocationId,
        name: 'İstanbul Havalimanı',
        type: 'airport' as const,
        airport: 'IST',
        country: 'Türkiye',
        countryCode: 'TR'
      };
      
      const dropoffLocation = {
        id: dropoffLocationId,
        name: 'İstanbul Havalimanı',
        type: 'airport' as const,
        airport: 'IST',
        country: 'Türkiye',
        countryCode: 'TR'
      };
      
      const result = await searchCars({
        route: {
          pickup: {
            location: pickupLocation,
            datetime: `${pickupDate}T${pickupTime}:00`
          },
          dropoff: {
            location: dropoffLocation,
            datetime: `${dropoffDate}T${dropoffTime}:00`
          }
        },
        driver: {
          age: driverAge
        },
        booker: {
          country: 'tr'
        },
        currency: 'EUR',
        filters,
        sort: {
          by: 'price',
          direction: 'ascending'
        }
      });
      
      setSearchResult(result);
      setFilteredCars(result.data);
    } catch (err) {
      console.error('Arama hatası:', err);
      setError('Araç arama sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  
  // Tedarikçi istatistikleri
  const supplierStats = searchResult?.data.reduce((acc, car) => {
    const existing = acc.find(s => s.id === car.supplierId);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ id: car.supplierId, name: car.supplierName, count: 1 });
    }
    return acc;
  }, [] as { id: number; name: string; count: number }[]) || [];
  
  // Fiyat aralığı
  const priceRange = searchResult?.data.length ? {
    min: Math.min(...searchResult.data.map(c => c.totalPrice)),
    max: Math.max(...searchResult.data.map(c => c.totalPrice))
  } : { min: 0, max: 1000 };

  // Özet satırı için tarih metni (11 Şub 01:00 - 19 Şub 10:00)
  const summaryDateText = (() => {
    if (!pickupDate || !dropoffDate || pickupDate.length !== 10 || dropoffDate.length !== 10) return '';
    try {
      const p = parse(pickupDate, 'yyyy-MM-dd', new Date());
      const d = parse(dropoffDate, 'yyyy-MM-dd', new Date());
      const pt = `${format(p, 'd MMM', { locale: tr })} ${pickupTime}`;
      const dt = `${format(d, 'd MMM', { locale: tr })} ${dropoffTime}`;
      return `${pt} - ${dt}`;
    } catch {
      return `${pickupDate} ${pickupTime} - ${dropoffDate} ${dropoffTime}`;
    }
  })();
  const summaryLocationText = pickupName && dropoffName
    ? (pickupLocationId === dropoffLocationId ? pickupName : `${pickupName} - ${dropoffName}`)
    : '';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Mobil: özet barı Header hemen altında, tam genişlik, çerçeve yok, sol köşeye yakın */}
      <div className="lg:hidden">
        {/* Özet barı (Düzenle’ye basılınca modal açılır, inline form yok) */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between px-3 pt-2.5 pb-2">
              <div className="min-w-0 flex-1 pr-2">
                <div className="font-bold text-lg text-gray-900 tracking-tight truncate">
                  {summaryLocationText || 'Araç kiralama'}
                </div>
                <div className="text-gray-500 text-sm mt-0.5">
                  {summaryDateText || `${pickupDate} - ${dropoffDate}`}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditForm(true)}
                className="text-green-700 underline font-semibold text-base shrink-0"
              >
                Düzenle
              </button>
            </div>
            {/* Filtrele, Sırala (çerçeve yok; Harita yok) */}
            <div className="flex gap-2 px-3 pb-2">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                    Object.values(filters).some(v => v !== undefined && (Array.isArray(v) ? v.length > 0 : v !== ''))
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-xs font-medium">Filtrele</span>
                </button>
                <div className="relative flex-1">
                  <button
                    type="button"
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border bg-white border-gray-300 text-gray-700 transition-colors"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    <span className="text-xs font-medium">Sırala</span>
                  </button>
                  {showSortDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowSortDropdown(false)} aria-hidden />
                      <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-white rounded-lg border border-gray-200 shadow-lg py-2">
                        <label className="flex items-center gap-2 w-full px-4 py-2 cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="carSort"
                            checked={sortBy === 'price_asc'}
                            onChange={() => { setSortBy('price_asc'); setShowSortDropdown(false); }}
                            className="w-4 h-4 text-green-600 focus:ring-green-500"
                          />
                          <span className={`text-sm whitespace-nowrap ${sortBy === 'price_asc' ? 'text-green-600 font-medium' : 'text-gray-700'}`}>Düşük fiyat</span>
                        </label>
                        <label className="flex items-center gap-2 w-full px-4 py-2 cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="carSort"
                            checked={sortBy === 'price_desc'}
                            onChange={() => { setSortBy('price_desc'); setShowSortDropdown(false); }}
                            className="w-4 h-4 text-green-600 focus:ring-green-500"
                          />
                          <span className={`text-sm whitespace-nowrap ${sortBy === 'price_desc' ? 'text-green-600 font-medium' : 'text-gray-700'}`}>Yüksek fiyat</span>
                        </label>
                        <label className="flex items-center gap-2 w-full px-4 py-2 cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="carSort"
                            checked={sortBy === 'rating'}
                            onChange={() => { setSortBy('rating'); setShowSortDropdown(false); }}
                            className="w-4 h-4 text-green-600 focus:ring-green-500"
                          />
                          <span className={`text-sm whitespace-nowrap ${sortBy === 'rating' ? 'text-green-600 font-medium' : 'text-gray-700'}`}>Puan</span>
                        </label>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

        {/* Mobil: Düzenle modalı – yukarıdan açılan panel (otel ile aynı açılış) */}
        {showEditForm && (
          <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setShowEditForm(false)}>
            <div
              className={`fixed left-0 right-0 top-0 z-50 transition-transform duration-300 w-full max-w-md mx-auto ${editModalMounted ? 'translate-y-0' : '-translate-y-full'}`}
              style={{ maxWidth: '100vw' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-b-2xl shadow-xl p-4 relative">
                <button
                  type="button"
                  className="absolute top-2 right-2 text-gray-400 text-2xl leading-none"
                  onClick={() => setShowEditForm(false)}
                  aria-label="Kapat"
                >
                  ×
                </button>
                <CarSearchForm
                  initialValues={{
                    pickupLocationId,
                    dropoffLocationId,
                    pickupDate,
                    pickupTime,
                    dropoffDate,
                    dropoffTime,
                    driverAge
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <main className="container mx-auto px-4 max-lg:pt-0 py-4 md:py-8">
        {/* Masaüstü: her zaman arama formu */}
        <div className="mb-6 hidden lg:block">
          <CarSearchForm
            initialValues={{
              pickupLocationId,
              dropoffLocationId,
              pickupDate,
              pickupTime,
              dropoffDate,
              dropoffTime,
              driverAge
            }}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
              <p className="text-gray-600">Araçlar aranıyor...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filtreler (sol taraf) */}
            <div className="lg:col-span-1">
              {/* Filtre paneli (mobilde üstteki Filtrele butonu ile açılır; CarFilters kendi mobil toggle'ını göstermez) */}
              <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
                <CarFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  suppliers={supplierStats}
                  priceRange={priceRange}
                  hideMobileToggle
                />
              </div>
            </div>
            
            {/* Araç listesi (sağ taraf) */}
            <div className="lg:col-span-3">
              {/* Başlık ve sıralama: sadece masaüstü (mobilde üstte Filtrele/Sırala var) */}
              <div className="hidden lg:flex justify-between items-center mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {filteredCars.length} Araç Bulundu
                  </h1>
                  {searchResult && (
                    <p className="text-sm text-gray-600 mt-1">
                      {pickupDate} - {dropoffDate}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Sırala:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="price_asc">Düşük fiyat</option>
                    <option value="price_desc">Yüksek fiyat</option>
                    <option value="rating">Puan</option>
                  </select>
                </div>
              </div>
              
              {/* Araç listesi */}
              <CarList
                cars={filteredCars}
                searchToken={searchResult?.metadata.searchToken || ''}
                loading={false}
                searchParams={{
                  pickupDate,
                  pickupTime,
                  dropoffDate,
                  dropoffTime,
                  pickupName: pickupName || undefined,
                  dropoffName: dropoffName || undefined
                }}
              />
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default function CarSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
      </div>
    }>
      <CarSearchContent />
    </Suspense>
  );
}
