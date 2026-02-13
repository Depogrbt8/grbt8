'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Clock, Search, Loader2 } from 'lucide-react';
import { format, parse } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { LocationSearchResult } from '../types';
import { searchLocations, getPopularLocations } from '../services';
import { getLastCarSearch, setLastCarSearch } from '@/lib/lastSearch';
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
    pickupName?: string;
    dropoffName?: string;
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

  // Mobil görünüm (etiketleri kutu içine taşımak için)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  
  // Araç kiralama API'sini başlat (ana sayfa vb. sayfalarda init çağrılmamış olabilir)
  useEffect(() => {
    initCarRentalModule();
  }, []);

  // Ana sayfa: initialValues yoksa son aramayı formda doldur (giriş yapmış/yapmamış fark etmez)
  useEffect(() => {
    if (initialValues?.pickupDate && initialValues?.dropoffDate) return;
    const last = getLastCarSearch();
    if (!last) return;
    const pickup: LocationSearchResult = {
      id: last.pickupLocationId,
      name: last.pickupName || '',
      type: 'city',
      city: '',
      country: ''
    };
    const dropoff: LocationSearchResult = {
      id: last.dropoffLocationId,
      name: last.dropoffName || '',
      type: 'city',
      city: '',
      country: ''
    };
    setPickupLocation(pickup);
    setPickupQuery(pickup.name);
    setDropoffLocation(dropoff);
    setDropoffQuery(dropoff.name);
    setPickupDate(last.pickupDate);
    setPickupTime(last.pickupTime);
    setDropoffDate(last.dropoffDate);
    setDropoffTime(last.dropoffTime);
    setSameLocation(last.pickupLocationId === last.dropoffLocationId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sonuç sayfası: URL'den gelen lokasyon id/isimlerini formda göster (Alış/Teslim lokasyonu alanları dolu olsun)
  useEffect(() => {
    if (!initialValues?.pickupLocationId) return;
    const pickup: LocationSearchResult = {
      id: initialValues.pickupLocationId,
      name: initialValues.pickupName || initialValues.pickupLocationId,
      type: 'city',
      city: '',
      country: ''
    };
    const dropoff: LocationSearchResult = {
      id: initialValues.dropoffLocationId || initialValues.pickupLocationId,
      name: initialValues.dropoffName || initialValues.dropoffLocationId || initialValues.pickupLocationId,
      type: 'city',
      city: '',
      country: ''
    };
    setPickupLocation(pickup);
    setPickupQuery(pickup.name);
    setDropoffLocation(dropoff);
    setDropoffQuery(dropoff.name);
    setSameLocation(initialValues.pickupLocationId === (initialValues.dropoffLocationId || initialValues.pickupLocationId));
  }, [initialValues?.pickupLocationId, initialValues?.dropoffLocationId, initialValues?.pickupName, initialValues?.dropoffName]);

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
    
    // Arama parametrelerini oluştur (sonuç sayfasında özet göstermek için isimler de eklenir)
    const params = new URLSearchParams({
      pickupLocationId: pickupLocation.id,
      dropoffLocationId: sameLocation ? pickupLocation.id : dropoffLocation!.id,
      pickupDate,
      pickupTime,
      dropoffDate,
      dropoffTime,
      driverAge: '30'
    });
    params.set('pickupName', pickupLocation.name);
    params.set('dropoffName', sameLocation ? pickupLocation.name : dropoffLocation!.name);

    setLastCarSearch({
      pickupLocationId: pickupLocation.id,
      dropoffLocationId: sameLocation ? pickupLocation.id : dropoffLocation!.id,
      pickupDate,
      pickupTime,
      dropoffDate,
      dropoffTime,
      driverAge: 30,
      pickupName: pickupLocation.name,
      dropoffName: sameLocation ? pickupLocation.name : dropoffLocation!.name
    });

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
    ? 'w-full px-4 sm:container sm:mx-auto sm:px-4 mt-8 sm:mt-24'
    : 'w-full px-4 md:px-8';

  return (
    <div className={wrapperClass}>
      <div className="bg-white rounded-2xl sm:rounded-[32px] border border-gray-200 shadow-sm sm:shadow-lg p-4 sm:p-8 relative">
        {/* Mobil: Farklı yerde teslim sağ üst köşede */}
        <div className="absolute right-4 top-4 z-10 lg:hidden">
          <label className="flex items-center gap-1.5 cursor-pointer">
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
              className="w-[14px] h-[14px] text-green-600 rounded focus:ring-green-500 flex-shrink-0"
            />
            <span className="text-xs text-gray-900 font-medium whitespace-nowrap">Farklı yerde teslim</span>
          </label>
        </div>
        {/* Alanlar: mobilde alt alta, desktop'ta tek satır; tüm inputlar aynı hizada */}
        <div className="flex flex-col gap-2 lg:gap-4 pt-6 lg:pt-0">
          {/* Desktop: tek satır, tüm kutular items-end ile hizalı; checkbox ayrı satırda */}
          <div className="flex flex-col lg:flex-row lg:items-end gap-2 lg:gap-[1rem] flex-wrap lg:flex-nowrap">
            {/* Alış Lokasyonu - desktop'ta sadece etiket + kutu (checkbox aşağıda) */}
            <div className="relative flex-1 min-w-0 lg:min-w-[140px] flex flex-col lg:items-stretch">
              <label className="hidden lg:block text-xs text-gray-900 mb-1 ml-1 font-semibold">Alış Lokasyonu</label>
              <div className="relative h-12 border border-gray-300 rounded-xl focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200 flex-shrink-0">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={pickupQuery}
                  onChange={(e) => {
                    setPickupQuery(e.target.value);
                    setShowPickupSuggestions(true);
                  }}
                  onFocus={() => setShowPickupSuggestions(true)}
                  placeholder={isMobile ? 'Alış Lokasyonu' : 'Havalimanı veya şehir'}
                  className="w-full pl-10 pr-4 h-12 text-base text-gray-900 placeholder-gray-700 focus:ring-0 outline-none bg-transparent border-none rounded-xl font-medium"
                />
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
            <div className="relative flex-1 min-w-0 lg:min-w-[140px] flex flex-col lg:items-stretch">
              <label className="hidden lg:block text-xs text-gray-900 mb-1 ml-1 font-semibold">Teslim Lokasyonu</label>
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
                  placeholder={isMobile ? 'Teslim Lokasyonu' : 'Havalimanı veya şehir'}
                  className="w-full pl-10 pr-4 h-12 text-base text-gray-900 placeholder-gray-700 focus:ring-0 outline-none bg-transparent border-none rounded-xl font-medium"
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
          
          {/* Tarih + Saat + Buton alanları (mobilde üst boşluk ana gap ile aynı) */}
          <div className="w-full lg:flex-1">
            {/* Mobil / tablet düzeni (otel arama formu ile aynı yatay/dikey boşluk: gap-2) */}
            <div className="flex flex-col gap-2 lg:hidden">
              {/* Alış Tarihi + Saat */}
              <div className="w-full flex flex-row flex-wrap gap-2">
                {/* Alış Tarihi */}
                <div className="flex-1 min-w-[150px]">
                  <label className="hidden lg:block text-xs text-gray-900 mb-1 ml-1 font-semibold">Alış Tarihi</label>
                  <div className="relative w-full flex items-center h-10 border border-gray-300 rounded-lg bg-white focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200">
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-[15px] text-gray-900 font-semibold">
                        {pickupDateObj ? format(pickupDateObj, 'd MMM', { locale: tr }) : (isMobile ? 'Alış Tarihi' : 'Tarih seçin')}
                      </span>
                    </div>
                    <DateInput
                      value={pickupDateObj}
                      onChange={(d) => setPickupDate(d ? format(d, 'yyyy-MM-dd') : '')}
                      className="w-full h-full pl-9 pr-2 bg-transparent border-none outline-none text-left focus:outline-none focus:ring-0 text-transparent placeholder-transparent [&_button]:text-transparent [&_button]:placeholder-transparent"
                      placeholder={isMobile ? 'Alış Tarihi' : 'Tarih seçin'}
                      showPrices={false}
                      hideTriggerContent
                    />
                  </div>
                </div>
                {/* Alış Saati */}
                <div className="flex-1 min-w-[110px]">
                  <label className="hidden lg:block text-xs text-gray-900 mb-1 ml-1 font-semibold">Saat</label>
                  <div className="relative w-full h-10 border border-gray-300 rounded-lg bg-white focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200 flex items-center">
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10">
                      <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-[15px] text-gray-900 font-semibold">
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
              </div>

              {/* Teslim Tarihi + Saat */}
              <div className="w-full flex flex-row flex-wrap gap-2">
                {/* Teslim Tarihi */}
                <div className="flex-1 min-w-[150px]">
                  <label className="hidden lg:block text-xs text-gray-900 mb-1 ml-1 font-semibold">Teslim Tarihi</label>
                  <div className="relative w-full flex items-center h-10 border border-gray-300 rounded-lg bg-white focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200">
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-[15px] text-gray-900 font-semibold">
                        {dropoffDateObj ? format(dropoffDateObj, 'd MMM', { locale: tr }) : (isMobile ? 'Teslim Tarihi' : 'Tarih seçin')}
                      </span>
                    </div>
                    <DateInput
                      value={dropoffDateObj}
                      onChange={(d) => setDropoffDate(d ? format(d, 'yyyy-MM-dd') : '')}
                      className="w-full h-full pl-9 pr-2 bg-transparent border-none outline-none text-left focus:outline-none focus:ring-0 text-transparent placeholder-transparent [&_button]:text-transparent [&_button]:placeholder-transparent"
                      placeholder={isMobile ? 'Teslim Tarihi' : 'Tarih seçin'}
                      showPrices={false}
                      hideTriggerContent
                    />
                  </div>
                </div>
                {/* Teslim Saati */}
                <div className="flex-1 min-w-[110px]">
                  <label className="hidden lg:block text-xs text-gray-900 mb-1 ml-1 font-semibold">Saat</label>
                  <div className="relative w-full h-10 border border-gray-300 rounded-lg bg-white focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200 flex items-center">
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10">
                      <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-[15px] text-gray-900 font-semibold">
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
              </div>

              {/* Arama Butonu */}
              <div className="w-full">
                <label className="block text-xs text-gray-900 mb-1 ml-1 font-semibold invisible select-none">Ara</label>
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

            {/* Desktop: tüm kutular tek satırda, kutular arası yatay boşluk ana satırla aynı (1rem) */}
            <div className="hidden lg:flex lg:flex-row lg:items-end gap-[1rem] w-full">
              {/* Alış Tarihi */}
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs text-gray-900 mb-1 ml-1 font-semibold">Alış Tarihi</label>
                <div className="relative w-full flex items-center h-12 border border-gray-300 rounded-xl bg-white focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-[15px] text-gray-900 font-semibold">
                      {pickupDateObj ? format(pickupDateObj, 'd MMM yyyy', { locale: tr }) : 'Tarih seçin'}
                    </span>
                  </div>
                  <DateInput
                    value={pickupDateObj}
                    onChange={(d) => setPickupDate(d ? format(d, 'yyyy-MM-dd') : '')}
                    className="w-full h-full pl-9 pr-2 bg-transparent border-none outline-none text-left focus:outline-none focus:ring-0 text-transparent placeholder-transparent [&_button]:text-transparent [&_button]:placeholder-transparent"
                    placeholder="Tarih seçin"
                    showPrices={false}
                    hideTriggerContent
                  />
                </div>
              </div>

              {/* Alış Saati */}
              <div className="flex-none w-[88px]">
                <label className="block text-xs text-gray-900 mb-1 ml-1 font-semibold">Saat</label>
                <div className="relative w-full h-12 border border-gray-300 rounded-xl bg-white focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200 flex items-center">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10">
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-[15px] text-gray-900 font-semibold">
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

              {/* Teslim Tarihi */}
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs text-gray-900 mb-1 ml-1 font-semibold">Teslim Tarihi</label>
                <div className="relative w-full flex items-center h-12 border border-gray-300 rounded-xl bg-white focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-[15px] text-gray-900 font-semibold">
                      {dropoffDateObj ? format(dropoffDateObj, 'd MMM yyyy', { locale: tr }) : 'Tarih seçin'}
                    </span>
                  </div>
                  <DateInput
                    value={dropoffDateObj}
                    onChange={(d) => setDropoffDate(d ? format(d, 'yyyy-MM-dd') : '')}
                    className="w-full h-full pl-9 pr-2 bg-transparent border-none outline-none text-left focus:outline-none focus:ring-0 text-transparent placeholder-transparent [&_button]:text-transparent [&_button]:placeholder-transparent"
                    placeholder="Tarih seçin"
                    showPrices={false}
                    hideTriggerContent
                  />
                </div>
              </div>

              {/* Teslim Saati */}
              <div className="flex-none w-[88px]">
                <label className="block text-xs text-gray-900 mb-1 ml-1 font-semibold">Saat</label>
                <div className="relative w-full h-12 border border-gray-300 rounded-xl bg-white focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200 flex items-center">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10">
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-[15px] text-gray-900 font-semibold">
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

              {/* Arama Butonu */}
              <div className="flex-none w-[160px]">
                <label className="block text-xs text-gray-900 mb-1 ml-1 font-semibold invisible select-none">Ara</label>
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

          {/* Desktop: Farklı yerde teslim alış kutusunun altında, sol tarafa hizalı */}
          <div className="hidden lg:block mt-1">
            <label className="flex items-center gap-1.5 cursor-pointer w-fit">
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
                className="w-[14px] h-[14px] text-green-600 rounded focus:ring-green-500 flex-shrink-0"
              />
              <span className="text-xs text-gray-900 font-medium whitespace-nowrap">Farklı yerde teslim</span>
            </label>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
