"use client";

import { useState, useRef, useEffect } from 'react';
import { MapPin, Plane } from 'lucide-react';

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

  // Yerel proxy: geniş statik indeks (BiletDukkani client çağrısı kaldırıldı)
  const searchAirports = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `/api/airports/search?q=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error('Airport search failed');
      const json = await response.json();
      if (json.success && Array.isArray(json.data)) {
        setSuggestions(json.data);
        return;
      }
      setSuggestions([]);
    } catch {
      setSuggestions([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(true);
    searchAirports(newValue);
  };

  const handleAirportSelect = (airport: Airport) => {
    // Mobil görünümde şehir ismi + kod formatında göster
    if (isMobile) {
      onChange(airport.city ? `${airport.city} ${airport.code}` : `${airport.code} - ${airport.name}`);
    } else {
      onChange(`${airport.code} - ${airport.name}`);
    }
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
            className="w-full pl-10 pr-4 h-12 text-[15px] text-gray-900 font-light placeholder-gray-500 placeholder:font-light focus:ring-0 outline-none bg-transparent border-none"
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
  // "Nereye" için uçak ikonunu aşağı bakacak şekilde rotasyon uygula
  const isArrival = label === 'Nereye';
  
  return (
    <div className="w-full relative">
      <div className="bg-white border border-gray-300 rounded-lg px-2.5 h-10 shadow-none hover:border-green-500 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200 flex flex-col justify-center">
        <div className="flex items-center justify-start gap-1">
          <Plane 
            className="w-5 h-5 text-gray-600 flex-shrink-0" 
            style={{ transform: isArrival ? 'rotate(180deg)' : 'rotate(-45deg)' }}
          />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-[15px] text-gray-900 font-light placeholder-gray-500 placeholder:font-light focus:outline-none focus:ring-0 focus:border-none min-w-0"
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