'use client';

import { useState, useEffect } from 'react';
import { Plane, X, ArrowRightLeft, User } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface RecentSearch {
  id: string;
  fromAirport: { code: string; name: string; city: string };
  toAirport: { code: string; name: string; city: string };
  departureDate: string; // ISO string
  returnDate?: string; // ISO string (opsiyonel)
  tripType: 'oneWay' | 'roundTrip';
  passengers: number;
  timestamp: number; // Unix timestamp
}

interface RecentSearchesProps {
  onSearchSelect: (search: RecentSearch) => void;
}

const STORAGE_KEY = 'flight_recent_searches';
const MAX_RECENT_SEARCHES = 10; // Maksimum 10 arama sakla

export default function RecentSearches({ onSearchSelect }: RecentSearchesProps) {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    // LocalStorage'dan arama geçmişini yükle
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const searches = JSON.parse(stored);
        // En son 2 aramayı göster (resimdeki gibi)
        setRecentSearches(searches.slice(0, 2));
      } catch (e) {
        console.error('Arama geçmişi yüklenemedi', e);
      }
    }
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Kart tıklamasını engelle
    const updated = recentSearches.filter(s => s.id !== id);
    setRecentSearches(updated);
    
    // LocalStorage'dan da sil
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const allSearches = JSON.parse(stored);
        const filtered = allSearches.filter((s: RecentSearch) => s.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      } catch (e) {
        console.error('Arama geçmişi silinemedi', e);
      }
    }
  };

  if (recentSearches.length === 0) {
    return null; // Arama geçmişi yoksa gösterilme
  }

  return (
    <div className="block sm:hidden w-full px-4 mb-4">
      <h3 className="text-lg font-bold text-gray-800 mb-3">Son aramalarım</h3>
      <div className="grid grid-cols-2 gap-2">
        {recentSearches.map((search) => (
          <div
            key={search.id}
            onClick={() => onSearchSelect(search)}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 cursor-pointer active:bg-gray-50 transition-colors relative"
          >
            {/* Silme butonu */}
            <button
              onClick={(e) => handleDelete(search.id, e)}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Aramayı sil"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>

            {/* Kalkış - Varış */}
            <div className="flex items-center gap-1 mb-2 pr-6">
              <Plane className="w-4 h-4 text-gray-800 flex-shrink-0" />
              <span className="text-sm font-semibold text-gray-800 truncate">
                {search.fromAirport.city || search.fromAirport.name}
              </span>
              <ArrowRightLeft className="w-3 h-3 text-gray-800 flex-shrink-0" />
              <span className="text-sm font-semibold text-gray-800 truncate">
                {search.toAirport.city || search.toAirport.name}
              </span>
            </div>

            {/* Tarihler */}
            <div className="text-xs text-gray-600 mb-1">
              {search.tripType === 'oneWay' ? (
                format(new Date(search.departureDate + 'T00:00:00'), 'd MMM', { locale: tr })
              ) : (
                <>
                  {format(new Date(search.departureDate + 'T00:00:00'), 'd MMM', { locale: tr })} -{' '}
                  {search.returnDate && format(new Date(search.returnDate + 'T00:00:00'), 'd MMM', { locale: tr })}
                </>
              )}
            </div>

            {/* Yolcu sayısı */}
            <div className="flex items-center gap-1">
              <User className="w-3 h-3 text-gray-600" />
              <span className="text-xs text-gray-600">{search.passengers}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Arama geçmişine ekleme fonksiyonu (dışarıdan kullanılacak)
export function addToRecentSearches(search: Omit<RecentSearch, 'id' | 'timestamp'>) {
  const newSearch: RecentSearch = {
    ...search,
    id: Date.now().toString(),
    timestamp: Date.now(),
  };

  const stored = localStorage.getItem(STORAGE_KEY);
  let searches: RecentSearch[] = [];

  if (stored) {
    try {
      searches = JSON.parse(stored);
    } catch (e) {
      console.error('Arama geçmişi okunamadı', e);
    }
  }

  // Aynı aramayı kontrol et (duplicate önleme)
  const isDuplicate = searches.some(
    (s) =>
      s.fromAirport.code === newSearch.fromAirport.code &&
      s.toAirport.code === newSearch.toAirport.code &&
      s.departureDate === newSearch.departureDate &&
      s.returnDate === newSearch.returnDate &&
      s.tripType === newSearch.tripType
  );

  if (!isDuplicate) {
    // Yeni aramayı başa ekle
    searches.unshift(newSearch);
    // Maksimum sayıyı kontrol et
    searches = searches.slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  }
}

