'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CarList, CarFilters, CarSearchForm } from '@/modules/car/components';
import { searchCars } from '@/modules/car/services';
import { initCarRentalModule } from '@/modules/car/init';
import type { Car, CarFiltersType, CarSearchResult } from '@/modules/car/types';
import { Loader2, SlidersHorizontal } from 'lucide-react';

// Initialize module
if (typeof window !== 'undefined') {
  initCarRentalModule();
}

function CarSearchContent() {
  const searchParams = useSearchParams();
  
  // URL'den parametreleri al
  const pickupLocationId = searchParams.get('pickupLocationId') || '';
  const dropoffLocationId = searchParams.get('dropoffLocationId') || '';
  const pickupDate = searchParams.get('pickupDate') || '';
  const pickupTime = searchParams.get('pickupTime') || '10:00';
  const dropoffDate = searchParams.get('dropoffDate') || '';
  const dropoffTime = searchParams.get('dropoffTime') || '10:00';
  const driverAge = parseInt(searchParams.get('driverAge') || '30');
  
  // State
  const [searchResult, setSearchResult] = useState<CarSearchResult | null>(null);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [filters, setFilters] = useState<CarFiltersType>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating'>('price_asc');
  const [showFilters, setShowFilters] = useState(false);
  
  // İlk arama
  useEffect(() => {
    if (!pickupLocationId || !dropoffLocationId || !pickupDate || !dropoffDate) {
      setError('Eksik arama parametreleri');
      setLoading(false);
      return;
    }
    
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
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Arama formu (küçük) */}
        <div className="mb-6">
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
              {/* Mobil: Filtre butonu */}
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  <span>Filtreler</span>
                </button>
              </div>
              
              {/* Filtre paneli */}
              <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
                <CarFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  suppliers={supplierStats}
                  priceRange={priceRange}
                />
              </div>
            </div>
            
            {/* Araç listesi (sağ taraf) */}
            <div className="lg:col-span-3">
              {/* Başlık ve sıralama */}
              <div className="flex justify-between items-center mb-4">
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
                    <option value="price_asc">Fiyat (Düşük → Yüksek)</option>
                    <option value="price_desc">Fiyat (Yüksek → Düşük)</option>
                    <option value="rating">Puan</option>
                  </select>
                </div>
              </div>
              
              {/* Araç listesi */}
              <CarList
                cars={filteredCars}
                searchToken={searchResult?.metadata.searchToken || ''}
                loading={false}
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
