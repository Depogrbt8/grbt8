'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, CalendarDays, Users, ChevronDown, X, Minus, Plus } from 'lucide-react';
import { format, addDays, isAfter, isBefore } from 'date-fns';
import { tr } from 'date-fns/locale';
import { searchLocations } from '../services';
import { buildSearchUrl } from '../utils';
import type { LocationSuggestion } from '../types';
import DateInput from '@/components/DateInput';

interface HotelSearchFormProps {
  initialLocation?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialAdults?: number;
  initialChildren?: number;
  initialRooms?: number;
  onSearch?: (params: SearchParams) => void;
  className?: string;
  isMobile?: boolean;
}

interface SearchParams {
  location: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  childAges: number[];
}

export default function HotelSearchForm({
  initialLocation = '',
  initialCheckIn = '',
  initialCheckOut = '',
  initialAdults = 2,
  initialChildren = 0,
  initialRooms = 1,
  onSearch,
  className = '',
  isMobile = false
}: HotelSearchFormProps) {
  const router = useRouter();
  
  // State
  const [location, setLocation] = useState(initialLocation);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(
    initialCheckIn ? new Date(initialCheckIn) : addDays(new Date(), 7)
  );
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(
    initialCheckOut ? new Date(initialCheckOut) : addDays(new Date(), 9)
  );
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [childAges, setChildAges] = useState<number[]>(
    Array.from({ length: initialChildren }, () => 7)
  );
  const [rooms, setRooms] = useState(initialRooms);
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const locationInputRef = useRef<HTMLInputElement>(null);
  const locationContainerRef = useRef<HTMLDivElement>(null);
  const guestSelectorRef = useRef<HTMLDivElement>(null);

  // Konum arama
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (location.length >= 2) {
        const suggestions = await searchLocations(location);
        setLocationSuggestions(suggestions);
        setShowLocationSuggestions(true);
      } else {
        setLocationSuggestions([]);
        setShowLocationSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [location]);

  // Dışarı tıklama
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationContainerRef.current && !locationContainerRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false);
      }
      if (guestSelectorRef.current && !guestSelectorRef.current.contains(event.target as Node)) {
        setShowGuestSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Konum seç
  const handleSelectLocation = (suggestion: LocationSuggestion) => {
    setLocation(suggestion.name);
    setShowLocationSuggestions(false);
  };

  // Arama yap
  const handleSearch = () => {
    if (!location) {
      locationInputRef.current?.focus();
      return;
    }

    setIsLoading(true);

    const params: SearchParams = {
      location,
      checkIn: checkInDate ? format(checkInDate, 'yyyy-MM-dd') : '',
      checkOut: checkOutDate ? format(checkOutDate, 'yyyy-MM-dd') : '',
      adults,
      children,
      rooms,
      childAges: childAges.slice(0, children)
    };

    if (onSearch) {
      onSearch(params);
    } else {
      const url = buildSearchUrl(params);
      router.push(url);
    }

    setIsLoading(false);
  };

  // Misafir özeti
  const guestSummary = () => {
    const totalGuests = adults + children;
    return `${rooms} Oda, ${totalGuests} Misafir`;
  };

  // Mobil için misafir özeti (resimdeki gibi)
  const guestSummaryMobile = () => {
    return `${adults} Yetişkin, ${rooms} Oda`;
  };

  return (
    <>
      {/* Mobil görünüm - FlightSearchForm ile aynı breakpoint */}
      <div className={`block sm:hidden w-full px-4 mt-8 ${className}`}>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col">
          {/* Konum */}
          <div className="relative w-full mb-2" ref={locationContainerRef}>
            <div className="bg-white border border-gray-300 rounded-lg px-2.5 h-10 shadow-none hover:border-green-500 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200 flex flex-col justify-center">
              <div className="flex items-center justify-start gap-1">
                <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <input
                  ref={locationInputRef}
                  type="text"
                  placeholder="Şehir veya otel adı"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium placeholder-gray-600 text-black focus:outline-none focus:ring-0 focus:border-none min-w-0"
                />
                {location && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation('');
                    }} 
                    className="p-1"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Konum önerileri */}
            {showLocationSuggestions && locationSuggestions.length > 0 && (
              <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg top-full">
                {locationSuggestions.map(suggestion => (
                  <li
                    key={suggestion.id}
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onMouseDown={() => handleSelectLocation(suggestion)}
                  >
                    <div className="font-semibold text-gray-800 text-sm">{suggestion.name}</div>
                    <div className="text-xs text-gray-500">{suggestion.country} • {suggestion.hotelCount} otel</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Tarih kutuları */}
          <div className="flex gap-2 w-full mb-2">
            <div className="flex-1">
              <div className="relative w-full h-10 border border-gray-300 rounded-lg bg-white focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200">
                <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
                <DateInput
                  value={checkInDate}
                  onChange={(date) => {
                    if (date && checkOutDate && isAfter(date, checkOutDate)) {
                      setCheckOutDate(addDays(date, 2));
                    }
                    setCheckInDate(date || undefined);
                  }}
                  className="w-full h-full pl-10 pr-2 text-center bg-transparent border-none outline-none text-[15px] font-medium placeholder-black text-black focus:outline-none focus:ring-0"
                  placeholder="Giriş tarihi"
                  showPrices={false}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="relative w-full h-10 border border-gray-300 rounded-lg bg-white focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200">
                <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
                <DateInput
                  value={checkOutDate}
                  onChange={(date) => {
                    if (date && checkInDate && isBefore(date, checkInDate)) {
                      setCheckInDate(addDays(date, -2));
                    }
                    setCheckOutDate(date || undefined);
                  }}
                  className="w-full h-full pl-10 pr-2 text-center bg-transparent border-none outline-none text-[15px] font-medium placeholder-black text-black focus:outline-none focus:ring-0"
                  placeholder="Çıkış tarihi"
                  showPrices={false}
                />
              </div>
            </div>
          </div>

          {/* Misafir seçimi - Tarihlerin altında, çerçeve içinde */}
          <div className="relative w-full mb-3">
            <div className="bg-white border border-gray-300 rounded-lg px-2.5 h-10 shadow-none hover:border-green-500 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200 flex flex-col justify-center">
              <div className="flex items-center justify-between w-full">
                <span className="text-[15px] font-medium text-gray-800">
                  {guestSummaryMobile()}
                </span>
                <button
                  type="button"
                  onClick={() => setShowGuestSelector(true)}
                  className="flex items-center gap-1.5 text-[15px] font-medium text-gray-800 hover:text-gray-900"
                >
                  <Plus className="w-5 h-5" />
                  <span>Konuk Ekle</span>
                </button>
              </div>
            </div>
          </div>

          {/* Misafir seçimi modal */}
          {showGuestSelector && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
              <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:w-96 max-h-[80vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Misafir ve Oda</h3>
                  <button
                    onClick={() => setShowGuestSelector(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Odalar */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b">
                  <span className="text-gray-700 font-medium">Oda</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setRooms(Math.max(1, rooms - 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                      disabled={rooms <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{rooms}</span>
                    <button
                      type="button"
                      onClick={() => setRooms(rooms + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Yetişkinler */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b">
                  <span className="text-gray-700 font-medium">Yetişkin</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                      disabled={adults <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{adults}</span>
                    <button
                      type="button"
                      onClick={() => setAdults(adults + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Çocuklar */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-gray-700 font-medium block">Çocuk</span>
                    <p className="text-xs text-gray-500">0-17 yaş</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                  onClick={() => {
                    setChildren(Math.max(0, children - 1));
                    setChildAges((prev) => prev.slice(0, Math.max(0, children - 1)));
                  }}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                      disabled={children <= 0}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{children}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setChildren(children + 1);
                        setChildAges((prev) => [...prev, 7]);
                      }}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {children > 0 && (
                  <div className="space-y-3">
                    {Array.from({ length: children }).map((_, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-gray-700">Çocuk {idx + 1} Yaşı</span>
                        <select
                          className="border border-gray-300 rounded-lg px-3 py-1 text-gray-800"
                          value={childAges[idx] ?? 7}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setChildAges((prev) => {
                              const next = [...prev];
                              next[idx] = Number.isNaN(val) ? 7 : val;
                              return next;
                            });
                          }}
                        >
                          {Array.from({ length: 18 }).map((_, age) => (
                            <option key={age} value={age}>{age}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowGuestSelector(false)}
                  className="w-full mt-4 bg-green-500 text-white py-3 rounded-xl font-semibold text-base"
                >
                  Tamam
                </button>
              </div>
            </div>
          )}

          {/* Otel Ara Butonu */}
          <button
            type="button"
            onClick={handleSearch}
            disabled={isLoading}
            className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold text-lg shadow-sm hover:bg-green-600 transition-all"
          >
            {isLoading ? 'Aranıyor...' : 'Otel Ara'}
          </button>
        </div>
      </div>

      {/* Desktop görünüm - FlightSearchForm ile aynı yapı */}
      <div className={`hidden sm:block w-full sm:container sm:mx-auto px-0 sm:px-4 mt-24 ${className}`}>
      <div className="bg-white rounded-[32px] shadow-lg p-8 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          {/* Konum */}
          <div className="md:col-span-1">
            <label className="text-xs text-gray-500 mb-1 ml-1 font-medium">Konum</label>
            <div className="relative h-12 border border-gray-300 rounded-xl focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200" ref={locationContainerRef}>
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                ref={locationInputRef}
                type="text"
                placeholder="Şehir veya otel"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onFocus={() => {
                  if (location.length >= 2) {
                    setShowLocationSuggestions(true);
                  }
                }}
                className="w-full pl-10 pr-10 h-12 text-base text-gray-700 placeholder-gray-400 focus:ring-0 outline-none bg-transparent border-none"
                style={{ outline: 'none !important' }}
              />
              {location && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setLocation('');
                  }} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
              
              {/* Konum önerileri */}
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-64 overflow-y-auto shadow-lg top-full">
                  {locationSuggestions.map(suggestion => (
                    <li
                      key={suggestion.id}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onMouseDown={() => handleSelectLocation(suggestion)}
                    >
                      <div className="font-semibold text-gray-800 text-sm">{suggestion.name}</div>
                      <div className="text-xs text-gray-500">{suggestion.country} • {suggestion.hotelCount} otel</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Giriş Tarihi */}
          <div className="flex flex-col md:col-span-1">
            <label className="text-xs text-gray-500 mb-1 ml-1 font-medium">Giriş Tarihi</label>
            <div className="relative w-full flex items-center">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" strokeWidth={1.5} />
              <DateInput
                value={checkInDate}
                onChange={(date) => {
                  if (date && checkOutDate && isAfter(date, checkOutDate)) {
                    setCheckOutDate(addDays(date, 2));
                  }
                  setCheckInDate(date || undefined);
                }}
                className="w-full pl-10 pr-4 h-12 leading-[44px] py-0 text-sm text-gray-500 placeholder-gray-400 focus:outline-none focus:border-none focus:ring-0 bg-white border border-gray-300 rounded-xl focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200 text-left font-light"
                placeholder="Giriş tarihi"
                showPrices={false}
              />
            </div>
          </div>

          {/* Çıkış Tarihi */}
          <div className="flex flex-col md:col-span-1">
            <label className="text-xs text-gray-500 mb-1 ml-1 font-medium">Çıkış Tarihi</label>
            <div className="relative w-full flex items-center">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" strokeWidth={1.5} />
              <DateInput
                value={checkOutDate}
                onChange={(date) => {
                  if (date && checkInDate && isBefore(date, checkInDate)) {
                    setCheckInDate(addDays(date, -2));
                  }
                  setCheckOutDate(date || undefined);
                }}
                className="w-full pl-10 pr-4 h-12 leading-[44px] py-0 text-sm text-gray-500 placeholder-gray-400 focus:outline-none focus:border-none focus:ring-0 bg-white border border-gray-300 rounded-xl focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200 text-left font-light"
                placeholder="Çıkış tarihi"
                showPrices={false}
              />
            </div>
          </div>

          {/* Misafirler */}
          <div className="flex flex-col relative md:col-span-1" ref={guestSelectorRef}>
            <label className="text-xs text-gray-500 mb-1 ml-1 font-medium">Misafirler</label>
            <div className="relative w-full flex items-center">
              <Users className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowGuestSelector(!showGuestSelector)}
                className="w-full pl-10 pr-4 h-12 text-base text-gray-700 text-left focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white border border-gray-300 rounded-xl appearance-none cursor-pointer hover:border-green-500 transition-all duration-200"
              >
                {guestSummary()}
              </button>
              
              {/* Misafir Seçimi Dropdown */}
              {showGuestSelector && (
                <div className="absolute z-20 w-72 right-0 bg-white border border-gray-200 rounded-lg mt-1 p-4 shadow-lg top-full">
                  {/* Odalar */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <span className="text-gray-700">Oda</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                      onClick={() => setRooms(Math.max(1, rooms - 1))}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                        disabled={rooms <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center font-semibold">{rooms}</span>
                      <button
                        type="button"
                        onClick={() => setRooms(rooms + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Yetişkinler */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <span className="text-gray-700">Yetişkin</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                        disabled={adults <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center font-semibold">{adults}</span>
                      <button
                        type="button"
                        onClick={() => setAdults(adults + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Çocuklar */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-gray-700">Çocuk</span>
                      <p className="text-xs text-gray-500">0-17 yaş</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                      onClick={() => {
                        setChildren(Math.max(0, children - 1));
                        setChildAges((prev) => prev.slice(0, Math.max(0, children - 1)));
                      }}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                        disabled={children <= 0}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center font-semibold">{children}</span>
                      <button
                        type="button"
                      onClick={() => {
                        setChildren(children + 1);
                        setChildAges((prev) => [...prev, 7]);
                      }}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                {children > 0 && (
                  <div className="space-y-3 border-t pt-4 mt-2">
                    {Array.from({ length: children }).map((_, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-gray-700">Çocuk {idx + 1} Yaşı</span>
                        <select
                          className="border border-gray-300 rounded-lg px-3 py-1 text-gray-800"
                          value={childAges[idx] ?? 7}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setChildAges((prev) => {
                              const next = [...prev];
                              next[idx] = Number.isNaN(val) ? 7 : val;
                              return next;
                            });
                          }}
                        >
                          {Array.from({ length: 18 }).map((_, age) => (
                            <option key={age} value={age}>{age}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowGuestSelector(false)}
                  className="w-full mt-4 py-2 bg-green-500 text-white rounded-lg font-semibold"
                >
                  Tamam
                </button>
                </div>
              )}
            </div>
          </div>

          {/* Otel Ara Butonu */}
          <div className="flex flex-col justify-end md:col-span-1">
            <button
              type="button"
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold text-lg shadow-md hover:bg-green-600 transition-all"
            >
              {isLoading ? 'Aranıyor...' : 'Otel Ara'}
            </button>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
