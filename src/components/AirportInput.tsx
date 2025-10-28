"use client";

import { useState, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';

// Type tanımları
interface Airport {
  code: string;
  name: string;
  city: string;
}

interface AirportInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onAirportSelect: (airport: Airport) => void;
  selectedAirports: Airport[];
  isMobile?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function AirportInput({
  label,
  placeholder,
  value,
  onChange,
  onAirportSelect,
  selectedAirports,
  isMobile = false,
  disabled = false,
  className = ""
}: AirportInputProps) {
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mobil öneri listelerini kapatmak için useEffect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Havaalanı arama fonksiyonu (Gerçek API'ye hazır)
  const searchAirports = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      // TODO: API anahtarını eklemeniz gerekebilir
      const response = await fetch(`https://api.biletdukkani.com/airports?search=${encodeURIComponent(query)}` /* , {
        headers: {
          'Authorization': 'Bearer YOUR_API_KEY', // <-- Buraya API anahtarınızı ekleyin
        },
      } */);
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      setSuggestions(data.airports || data || []);
    } catch (error) {
      // Genişletilmiş demo havalimanı listesi
      const demoAirports: Airport[] = [
        { code: 'IST', name: 'İstanbul Havalimanı', city: 'İstanbul' },
        { code: 'SAW', name: 'Sabiha Gökçen', city: 'İstanbul' },
        { code: 'AYT', name: 'Antalya Havalimanı', city: 'Antalya' },
        { code: 'ADB', name: 'Adnan Menderes', city: 'İzmir' },
        { code: 'ESB', name: 'Esenboğa', city: 'Ankara' },
        { code: 'BRU', name: 'Brussels Airport', city: 'Brüksel' },
        { code: 'AMS', name: 'Schiphol', city: 'Amsterdam' },
        { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris' },
        { code: 'LHR', name: 'Heathrow', city: 'Londra' },
        { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt' },
        { code: 'ZRH', name: 'Zürich Airport', city: 'Zürih' },
        { code: 'VIE', name: 'Vienna International', city: 'Viyana' },
        { code: 'IST', name: 'İstanbul Havalimanı', city: 'İstanbul' },
        { code: 'SAW', name: 'Sabiha Gökçen', city: 'İstanbul' },
      ];
      // İlk 3 harf eşleşmesi (kod, isim veya şehirde)
      const q = query.toLowerCase();
      const filtered = demoAirports.filter(airport =>
        airport.code.toLowerCase().startsWith(q) ||
        airport.name.toLowerCase().startsWith(q) ||
        airport.city.toLowerCase().startsWith(q) ||
        airport.name.toLowerCase().includes(q) ||
        airport.city.toLowerCase().includes(q)
      );
      setSuggestions(filtered);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(true);
    searchAirports(newValue);
  };

  const handleAirportSelect = (airport: Airport) => {
    onChange(`${airport.code} - ${airport.name}`);
    onAirportSelect(airport);
    setShowSuggestions(false);
  };

  const handleFocus = () => {
    setShowSuggestions(true);
  };

  // Desktop versiyonu
  if (!isMobile) {
    return (
      <div className={`flex flex-col ${className}`}>
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={handleFocus}
            disabled={disabled}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 h-12 text-base text-gray-700 placeholder-gray-400 focus:ring-0 outline-none bg-transparent border-none"
            style={{ outline: 'none !important' }}
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg sm:block">
              {suggestions.map(airport => (
                <li
                  key={airport.code}
                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onMouseDown={() => handleAirportSelect(airport)}
                >
                  <div className="font-semibold text-gray-800">{airport.name}</div>
                  <div className="text-sm text-gray-500">{airport.code} • {airport.city}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  // Mobil versiyonu
  return (
    <div className="w-full relative">
      <div className="bg-white border-0 rounded-2xl px-4 py-2.5 shadow-md hover:shadow-lg focus-within:shadow-lg transition-all duration-200 h-14 flex flex-col justify-center">
        <div className="flex items-center justify-center gap-2 mb-0.5">
          <MapPin className="w-4 h-4 text-green-500" />
          <div className="text-[14px] leading-none text-gray-600 font-medium">
            {label}
          </div>
        </div>
        <div className="flex items-center justify-center">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-[18px] font-extrabold placeholder-black text-black text-center focus:outline-none focus:ring-0 focus:border-none min-w-0 tracking-tight"
            placeholder={placeholder}
            value={value}
            disabled={disabled}
            onChange={handleInputChange}
            onFocus={handleFocus}
            style={{ outline: 'none !important' }}
          />
        </div>
      </div>
      {/* Mobil havaalanı önerileri */}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg top-full">
          {suggestions.map(airport => (
            <li
              key={airport.code}
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              onMouseDown={() => handleAirportSelect(airport)}
            >
              <div className="font-semibold text-gray-800 text-sm">{airport.name}</div>
              <div className="text-xs text-gray-500">{airport.code} • {airport.city}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 