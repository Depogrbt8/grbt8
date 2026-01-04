'use client';

import { Hotel } from '../types';
import HotelCard from './HotelCard';
import { Loader2, Building2 } from 'lucide-react';

interface HotelListProps {
  hotels: Hotel[];
  loading?: boolean;
  checkIn?: string;
  checkOut?: string;
  guests?: { adults: number; children: number; rooms: number };
}

export default function HotelList({ 
  hotels, 
  loading = false,
  checkIn,
  checkOut,
  guests
}: HotelListProps) {
  // Loading durumu
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-10 h-10 text-green-500 animate-spin mb-4" />
        <p className="text-gray-500">Oteller aranıyor...</p>
      </div>
    );
  }

  // Boş sonuç
  if (hotels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <Building2 className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Otel bulunamadı
        </h3>
        <p className="text-gray-500 text-center max-w-md">
          Arama kriterlerinize uygun otel bulunamadı. 
          Farklı tarihler veya konum deneyin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sonuç sayısı */}
      <div className="text-sm text-gray-500 mb-2">
        {hotels.length} otel bulundu
      </div>

      {/* Otel kartları */}
      {hotels.map(hotel => (
        <HotelCard
          key={hotel.id}
          hotel={hotel}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
        />
      ))}
    </div>
  );
}



