'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Users, Search, ChevronDown, X, Minus, Plus } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { searchLocations } from '../services';
import { buildSearchUrl } from '../utils';
import type { LocationSuggestion } from '../types';

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
  const [checkIn, setCheckIn] = useState(initialCheckIn || format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  const [checkOut, setCheckOut] = useState(initialCheckOut || format(addDays(new Date(), 9), 'yyyy-MM-dd'));
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
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
      checkIn,
      checkOut,
      adults,
      children,
      rooms
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

  // Mobil görünüm
  if (isMobile) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-4 ${className}`}>
        {/* Konum */}
        <div className="relative mb-3" ref={locationContainerRef}>
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 h-12 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200">
            <MapPin className="w-5 h-5 text-gray-500" />
            <input
              ref={locationInputRef}
              type="text"
              placeholder="Şehir veya otel adı"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 outline-none text-[15px] placeholder-gray-500"
            />
            {location && (
              <button onClick={() => setLocation('')} className="p-1">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
          
          {/* Konum önerileri */}
          {showLocationSuggestions && locationSuggestions.length > 0 && (
            <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
              {locationSuggestions.map(suggestion => (
                <li
                  key={suggestion.id}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSelectLocation(suggestion)}
                >
                  <div className="font-semibold text-gray-800">{suggestion.name}</div>
                  <div className="text-xs text-gray-500">
                    {suggestion.country} • {suggestion.hotelCount} otel
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tarihler */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 h-12 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200">
              <Calendar className="w-5 h-5 text-gray-500" />
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="flex-1 outline-none text-[15px] bg-transparent"
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 h-12 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200">
              <Calendar className="w-5 h-5 text-gray-500" />
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || format(new Date(), 'yyyy-MM-dd')}
                className="flex-1 outline-none text-[15px] bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Misafir Seçimi */}
        <div className="relative mb-3" ref={guestSelectorRef}>
          <button
            type="button"
            onClick={() => setShowGuestSelector(!showGuestSelector)}
            className="w-full flex items-center justify-between gap-2 border border-gray-300 rounded-lg px-3 h-12 hover:border-green-500"
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              <span className="text-[15px] text-gray-700">{guestSummary()}</span>
            </div>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </button>

          {/* Misafir dropdown */}
          {showGuestSelector && (
            <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg mt-1 p-4 shadow-lg">
              {/* Odalar */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700">Oda</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setRooms(Math.max(1, rooms - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
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
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700">Yetişkin</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
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
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-700">Çocuk</span>
                  <p className="text-xs text-gray-500">0-17 yaş</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    disabled={children <= 0}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center font-semibold">{children}</span>
                  <button
                    type="button"
                    onClick={() => setChildren(children + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

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

        {/* Ara butonu */}
        <button
          type="button"
          onClick={handleSearch}
          disabled={isLoading}
          className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold text-lg shadow-sm hover:bg-green-600 transition-all flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          {isLoading ? 'Aranıyor...' : 'Otel Ara'}
        </button>
      </div>
    );
  }

  // Desktop görünüm
  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Konum */}
        <div className="relative md:col-span-1" ref={locationContainerRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Konum</label>
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 h-12 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200">
            <MapPin className="w-5 h-5 text-gray-500" />
            <input
              ref={locationInputRef}
              type="text"
              placeholder="Şehir veya otel adı"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 outline-none text-[15px] placeholder-gray-500"
            />
          </div>
          
          {showLocationSuggestions && locationSuggestions.length > 0 && (
            <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-64 overflow-y-auto shadow-lg">
              {locationSuggestions.map(suggestion => (
                <li
                  key={suggestion.id}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSelectLocation(suggestion)}
                >
                  <div className="font-semibold text-gray-800">{suggestion.name}</div>
                  <div className="text-xs text-gray-500">
                    {suggestion.country} • {suggestion.hotelCount} otel
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Check-in */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giriş Tarihi</label>
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 h-12 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200">
            <Calendar className="w-5 h-5 text-gray-500" />
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="flex-1 outline-none text-[15px] bg-transparent"
            />
          </div>
        </div>

        {/* Check-out */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Çıkış Tarihi</label>
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 h-12 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200">
            <Calendar className="w-5 h-5 text-gray-500" />
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || format(new Date(), 'yyyy-MM-dd')}
              className="flex-1 outline-none text-[15px] bg-transparent"
            />
          </div>
        </div>

        {/* Misafirler */}
        <div className="relative" ref={guestSelectorRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Misafirler</label>
          <button
            type="button"
            onClick={() => setShowGuestSelector(!showGuestSelector)}
            className="w-full flex items-center justify-between gap-2 border border-gray-300 rounded-lg px-3 h-12 hover:border-green-500"
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              <span className="text-[15px] text-gray-700">{guestSummary()}</span>
            </div>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </button>

          {showGuestSelector && (
            <div className="absolute z-20 w-72 right-0 bg-white border border-gray-200 rounded-lg mt-1 p-4 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700">Oda</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setRooms(Math.max(1, rooms - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
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

              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700">Yetişkin</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
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

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-700">Çocuk</span>
                  <p className="text-xs text-gray-500">0-17 yaş</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    disabled={children <= 0}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center font-semibold">{children}</span>
                  <button
                    type="button"
                    onClick={() => setChildren(children + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

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

      {/* Ara butonu (Desktop) */}
      <button
        type="button"
        onClick={handleSearch}
        disabled={isLoading}
        className="w-full mt-4 bg-green-500 text-white py-3 rounded-xl font-semibold text-lg shadow-sm hover:bg-green-600 transition-all flex items-center justify-center gap-2"
      >
        <Search className="w-5 h-5" />
        {isLoading ? 'Aranıyor...' : 'Otel Ara'}
      </button>
    </div>
  );
}

