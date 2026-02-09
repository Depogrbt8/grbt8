'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Clock, Search, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { LocationSearchResult } from '../types';
import { searchLocations, getPopularLocations } from '../services';
import { initCarRentalModule } from '../init';

interface CarSearchFormProps {
  initialValues?: {
    pickupLocationId?: string;
    dropoffLocationId?: string;
    pickupDate?: string;
    pickupTime?: string;
    dropoffDate?: string;
    dropoffTime?: string;
    driverAge?: number; // Formda gösterilmiyor; arama sayfası URL'den geçirebilir
  };
}

export default function CarSearchForm({ initialValues }: CarSearchFormProps) {
  const router = useRouter();
  
  // Form state
  const [pickupLocation, setPickupLocation] = useState<LocationSearchResult | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<LocationSearchResult | null>(null);
  const [pickupDate, setPickupDate] = useState(initialValues?.pickupDate || '');
  const [pickupTime, setPickupTime] = useState(initialValues?.pickupTime || '10:00');
  const [dropoffDate, setDropoffDate] = useState(initialValues?.dropoffDate || '');
  const [dropoffTime, setDropoffTime] = useState(initialValues?.dropoffTime || '10:00');
  const [sameLocation, setSameLocation] = useState(true);
  
  // Lokasyon arama state
  const [pickupQuery, setPickupQuery] = useState('');
  const [dropoffQuery, setDropoffQuery] = useState('');
  const [pickupSuggestions, setPickupSuggestions] = useState<LocationSearchResult[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<LocationSearchResult[]>([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
  const [popularLocations, setPopularLocations] = useState<LocationSearchResult[]>([]);
  
  // Loading state
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  
  // Araç kiralama API'sini başlat (ana sayfa vb. sayfalarda init çağrılmamış olabilir)
  useEffect(() => {
    initCarRentalModule();
  }, []);

  // Popüler lokasyonları yükle
  useEffect(() => {
    loadPopularLocations();
  }, []);
  
  const loadPopularLocations = async () => {
    try {
      const locations = await getPopularLocations('TR');
      setPopularLocations(locations);
    } catch (error) {
      console.error('Popüler lokasyonlar yüklenemedi:', error);
    }
  };
  
  // Pickup lokasyon ara
  useEffect(() => {
    if (pickupQuery.length < 2) {
      setPickupSuggestions([]);
      return;
    }
    
    const timer = setTimeout(async () => {
      setIsLoadingLocations(true);
      try {
        const results = await searchLocations(pickupQuery);
        setPickupSuggestions(results);
      } catch (error) {
        console.error('Lokasyon arama hatası:', error);
      } finally {
        setIsLoadingLocations(false);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [pickupQuery]);
  
  // Dropoff lokasyon ara
  useEffect(() => {
    if (dropoffQuery.length < 2) {
      setDropoffSuggestions([]);
      return;
    }
    
    const timer = setTimeout(async () => {
      setIsLoadingLocations(true);
      try {
        const results = await searchLocations(dropoffQuery);
        setDropoffSuggestions(results);
      } catch (error) {
        console.error('Lokasyon arama hatası:', error);
      } finally {
        setIsLoadingLocations(false);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [dropoffQuery]);
  
  // Aynı lokasyon seçeneği değişince
  useEffect(() => {
    if (sameLocation && pickupLocation) {
      setDropoffLocation(pickupLocation);
      setDropoffQuery(pickupQuery);
    }
  }, [sameLocation, pickupLocation, pickupQuery]);
  
  // Minimum tarihler
  const today = new Date().toISOString().split('T')[0];
  const minDropoffDate = pickupDate || today;
  
  const handleSearch = () => {
    // Validasyon
    if (!pickupLocation) {
      alert('Lütfen alış lokasyonu seçin');
      return;
    }
    if (!sameLocation && !dropoffLocation) {
      alert('Lütfen teslim lokasyonu seçin');
      return;
    }
    if (!pickupDate || !dropoffDate) {
      alert('Lütfen tarih seçin');
      return;
    }
    
    setIsSearching(true);
    
    // Arama parametrelerini oluştur
    const params = new URLSearchParams({
      pickupLocationId: pickupLocation.id,
      dropoffLocationId: sameLocation ? pickupLocation.id : dropoffLocation!.id,
      pickupDate,
      pickupTime,
      dropoffDate,
      dropoffTime,
      driverAge: '30'
    });
    
    // Arama sayfasına yönlendir
    router.push(`/cars/search?${params.toString()}`);
  };
  
  const handlePickupLocationSelect = (location: LocationSearchResult) => {
    setPickupLocation(location);
    setPickupQuery(location.name);
    setShowPickupSuggestions(false);
    
    if (sameLocation) {
      setDropoffLocation(location);
      setDropoffQuery(location.name);
    }
  };
  
  const handleDropoffLocationSelect = (location: LocationSearchResult) => {
    setDropoffLocation(location);
    setDropoffQuery(location.name);
    setShowDropoffSuggestions(false);
  };
  
  return (
    <div className="w-full px-4 md:px-8">
      <div className="bg-white rounded-[32px] shadow-lg p-4 sm:p-8">
        {/* Tek satır: masaüstünde tüm alanlar yan yana */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-4 flex-wrap">
          {/* Alış Lokasyonu */}
          <div className="relative flex-1 min-w-0 lg:min-w-[140px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Alış Lokasyonu
            </label>
            <input
              type="text"
              value={pickupQuery}
              onChange={(e) => {
                setPickupQuery(e.target.value);
                setShowPickupSuggestions(true);
              }}
              onFocus={() => setShowPickupSuggestions(true)}
              placeholder="Havalimanı veya şehir"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {/* Farklı yerde teslim - alış lokasyonu kutusunun altında */}
            <div className="mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!sameLocation}
                  onChange={(e) => {
                    const farkliLokasyon = e.target.checked;
                    setSameLocation(!farkliLokasyon);
                    if (!farkliLokasyon) {
                      setDropoffLocation(pickupLocation);
                      setDropoffQuery(pickupQuery);
                    }
                  }}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Farklı yerde teslim</span>
              </label>
            </div>
            
            {/* Öneriler */}
            {showPickupSuggestions && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {isLoadingLocations ? (
                  <div className="p-4 text-center text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  </div>
                ) : pickupSuggestions.length > 0 ? (
                  pickupSuggestions.map(loc => (
                    <button
                      key={loc.id}
                      onClick={() => handlePickupLocationSelect(loc)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-2 border-b last:border-b-0"
                    >
                      <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900">{loc.name}</div>
                        <div className="text-sm text-gray-500">
                          {loc.city}, {loc.country}
                          {loc.airport && <span className="ml-2 text-blue-600">({loc.airport})</span>}
                        </div>
                      </div>
                    </button>
                  ))
                ) : pickupQuery.length >= 2 ? (
                  <div className="p-4 text-center text-gray-500">Sonuç bulunamadı</div>
                ) : (
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-500 px-2 py-1">Popüler Lokasyonlar</div>
                    {popularLocations.map(loc => (
                      <button
                        key={loc.id}
                        onClick={() => handlePickupLocationSelect(loc)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                      >
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{loc.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Teslim Lokasyonu - sadece checkbox işaretliyken */}
          {!sameLocation && (
            <div className="relative flex-1 min-w-0 lg:min-w-[140px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Teslim Lokasyonu
              </label>
              <input
                type="text"
                value={dropoffQuery}
                onChange={(e) => {
                  setDropoffQuery(e.target.value);
                  setShowDropoffSuggestions(true);
                }}
                onFocus={() => setShowDropoffSuggestions(true)}
                placeholder="Havalimanı veya şehir"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              
              {/* Öneriler */}
              {showDropoffSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {isLoadingLocations ? (
                    <div className="p-4 text-center text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    </div>
                  ) : dropoffSuggestions.length > 0 ? (
                    dropoffSuggestions.map(loc => (
                      <button
                        key={loc.id}
                        onClick={() => handleDropoffLocationSelect(loc)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-2 border-b last:border-b-0"
                      >
                        <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-gray-900">{loc.name}</div>
                          <div className="text-sm text-gray-500">
                            {loc.city}, {loc.country}
                            {loc.airport && <span className="ml-2 text-blue-600">({loc.airport})</span>}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : dropoffQuery.length >= 2 ? (
                    <div className="p-4 text-center text-gray-500">Sonuç bulunamadı</div>
                  ) : (
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-500 px-2 py-1">Popüler Lokasyonlar</div>
                      {popularLocations.map(loc => (
                        <button
                          key={loc.id}
                          onClick={() => handleDropoffLocationSelect(loc)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                        >
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{loc.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Alış Tarihi - tek satırda */}
          <div className="w-full lg:w-auto lg:min-w-[130px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Alış Tarihi
            </label>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              min={today}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="w-full lg:w-auto lg:min-w-[90px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Saat
            </label>
            <input
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          {/* Teslim Tarihi ve Saat - tek satırda */}
          <div className="w-full lg:w-auto lg:min-w-[130px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Teslim Tarihi
            </label>
            <input
              type="date"
              value={dropoffDate}
              onChange={(e) => setDropoffDate(e.target.value)}
              min={minDropoffDate}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="w-full lg:w-auto lg:min-w-[90px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Saat
            </label>
            <input
              type="time"
              value={dropoffTime}
              onChange={(e) => setDropoffTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {/* Arama Butonu */}
        <div className="mt-6">
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Aranıyor...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Araç Ara
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
