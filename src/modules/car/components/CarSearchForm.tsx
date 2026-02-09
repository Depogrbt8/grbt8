'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Clock, Search, Loader2 } from 'lucide-react';
import { format, parse } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { LocationSearchResult } from '../types';
import { searchLocations, getPopularLocations } from '../services';
import { initCarRentalModule } from '../init';
import DateInput from '@/components/DateInput';
import TimeInput from '@/components/TimeInput';

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
  /** Ana sayfada kullanıldığında uçuş/otel formu ile aynı üst boşluk (mt-24) ve container */
  useHomepageSpacing?: boolean;
}

export default function CarSearchForm({ initialValues, useHomepageSpacing }: CarSearchFormProps) {
  const router = useRouter();
  
  // Form state (tarih string YYYY-MM-DD, saat HH:mm - URL ile uyumlu)
  const [pickupLocation, setPickupLocation] = useState<LocationSearchResult | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<LocationSearchResult | null>(null);
  const [pickupDate, setPickupDate] = useState(initialValues?.pickupDate || '');
  const [pickupTime, setPickupTime] = useState(initialValues?.pickupTime || '10:00');
  const [dropoffDate, setDropoffDate] = useState(initialValues?.dropoffDate || '');
  const [dropoffTime, setDropoffTime] = useState(initialValues?.dropoffTime || '10:00');
  const [sameLocation, setSameLocation] = useState(true);

  const safeParseDate = (s: string): Date | undefined => {
    if (!s || s.length !== 10) return undefined;
    try {
      const d = parse(s, 'yyyy-MM-dd', new Date());
      return isNaN(d.getTime()) ? undefined : d;
    } catch {
      return undefined;
    }
  };
  const pickupDateObj = safeParseDate(pickupDate);
  const dropoffDateObj = safeParseDate(dropoffDate);
  
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
    if (!pickupDate || !dropoffDate || !pickupDateObj || !dropoffDateObj) {
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
  
  const wrapperClass = useHomepageSpacing
    ? 'w-full sm:container sm:mx-auto px-0 sm:px-4 mt-8 sm:mt-24'
    : 'w-full px-4 md:px-8';

  return (
    <div className={wrapperClass}>
      <div className="bg-white rounded-[32px] shadow-lg p-4 sm:p-8 border border-gray-200">
        {/* Tek satır: masaüstünde tüm alanlar yan yana - uçuş/otel formu ile aynı tasarım */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-4 flex-wrap">
          {/* Alış Lokasyonu */}
          <div className="relative flex-1 min-w-0 lg:min-w-[140px]">
            <label className="block text-xs text-gray-500 mb-1 ml-1 font-medium">Alış Lokasyonu</label>
            <div className="relative h-12 border border-gray-300 rounded-xl focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={pickupQuery}
                onChange={(e) => {
                  setPickupQuery(e.target.value);
                  setShowPickupSuggestions(true);
                }}
                onFocus={() => setShowPickupSuggestions(true)}
                placeholder="Havalimanı veya şehir"
                className="w-full pl-10 pr-4 h-12 text-base text-gray-700 placeholder-gray-400 focus:ring-0 outline-none bg-transparent border-none rounded-xl"
              />
            </div>
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
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
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
              <label className="block text-xs text-gray-500 mb-1 ml-1 font-medium">Teslim Lokasyonu</label>
              <div className="relative h-12 border border-gray-300 rounded-xl focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={dropoffQuery}
                  onChange={(e) => {
                    setDropoffQuery(e.target.value);
                    setShowDropoffSuggestions(true);
                  }}
                  onFocus={() => setShowDropoffSuggestions(true)}
                  placeholder="Havalimanı veya şehir"
                  className="w-full pl-10 pr-4 h-12 text-base text-gray-700 placeholder-gray-400 focus:ring-0 outline-none bg-transparent border-none rounded-xl"
                />
              </div>
              
              {/* Öneriler */}
              {showDropoffSuggestions && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
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
          
          {/* Alış Tarihi - otel ile aynı takvim popup (DateInput) */}
          <div className="w-full lg:w-auto lg:min-w-[130px]">
            <label className="block text-xs text-gray-500 mb-1 ml-1 font-medium">Alış Tarihi</label>
            <div className="relative w-full h-12 border border-gray-300 rounded-xl focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200 flex items-center">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-500 font-light">
                  {pickupDateObj ? format(pickupDateObj, 'd MMM yyyy', { locale: tr }) : 'Tarih seçin'}
                </span>
              </div>
              <DateInput
                value={pickupDateObj}
                onChange={(d) => setPickupDate(d ? format(d, 'yyyy-MM-dd') : '')}
                hideTriggerContent
                className="w-full h-full min-h-0 pl-[7.5rem] pr-4 rounded-xl border-0 bg-transparent focus:outline-none focus:ring-0"
                showPrices={false}
              />
            </div>
          </div>
          {/* Alış Saati - otel takvim popup ile uyumlu saat popup */}
          <div className="w-full lg:w-auto lg:min-w-[90px]">
            <label className="block text-xs text-gray-500 mb-1 ml-1 font-medium">Saat</label>
            <div className="relative w-full h-12 border border-gray-300 rounded-xl focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200 flex items-center">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10">
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-500 font-light">
                  {pickupTime || '10:00'}
                </span>
              </div>
              <TimeInput
                value={pickupTime}
                onChange={setPickupTime}
                placeholder="Saat"
                hideTriggerContent
                className="w-full h-full min-h-0"
              />
            </div>
          </div>
          
          {/* Teslim Tarihi - otel ile aynı takvim popup */}
          <div className="w-full lg:w-auto lg:min-w-[130px]">
            <label className="block text-xs text-gray-500 mb-1 ml-1 font-medium">Teslim Tarihi</label>
            <div className="relative w-full h-12 border border-gray-300 rounded-xl focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200 flex items-center">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-500 font-light">
                  {dropoffDateObj ? format(dropoffDateObj, 'd MMM yyyy', { locale: tr }) : 'Tarih seçin'}
                </span>
              </div>
              <DateInput
                value={dropoffDateObj}
                onChange={(d) => setDropoffDate(d ? format(d, 'yyyy-MM-dd') : '')}
                hideTriggerContent
                className="w-full h-full min-h-0 pl-[7.5rem] pr-4 rounded-xl border-0 bg-transparent focus:outline-none focus:ring-0"
                showPrices={false}
              />
            </div>
          </div>
          {/* Teslim Saati */}
          <div className="w-full lg:w-auto lg:min-w-[90px]">
            <label className="block text-xs text-gray-500 mb-1 ml-1 font-medium">Saat</label>
            <div className="relative w-full h-12 border border-gray-300 rounded-xl focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200 flex items-center">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10">
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-500 font-light">
                  {dropoffTime || '10:00'}
                </span>
              </div>
              <TimeInput
                value={dropoffTime}
                onChange={setDropoffTime}
                placeholder="Saat"
                hideTriggerContent
                className="w-full h-full min-h-0"
              />
            </div>
          </div>
          
          {/* Arama Butonu - diğer kutularla aynı hizada (üstte label boşluğu) */}
          <div className="w-full lg:w-auto lg:flex-1 lg:min-w-[120px] lg:max-w-[160px]">
            <label className="block text-xs text-gray-500 mb-1 ml-1 font-medium invisible select-none">Ara</label>
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full h-12 bg-green-500 text-white py-0 rounded-xl font-semibold text-lg shadow-md hover:bg-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}
