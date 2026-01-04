'use client';

import { Calendar, Users, Building2 } from 'lucide-react';
import { formatPrice, formatDate } from '../../utils';

interface HotelPriceSummaryProps {
  hotelName: string;
  roomName: string;
  rateName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: { adults: number; children: number; rooms: number };
  totalPrice: number;
  currency: string;
}

export default function HotelPriceSummary({
  hotelName,
  roomName,
  rateName,
  checkIn,
  checkOut,
  nights,
  guests,
  totalPrice,
  currency
}: HotelPriceSummaryProps) {
  const pricePerNight = totalPrice / nights / guests.rooms;
  const totalGuests = guests.adults + guests.children;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Rezervasyon Özeti</h3>

      {/* Otel bilgisi */}
      <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{hotelName}</h4>
          <p className="text-sm text-gray-600">{roomName}</p>
          <p className="text-xs text-gray-500">{rateName}</p>
        </div>
      </div>

      {/* Tarihler */}
      <div className="flex items-center gap-3 mb-3">
        <Calendar className="w-5 h-5 text-gray-400" />
        <div>
          <p className="text-sm text-gray-600">
            {formatDate(checkIn)} - {formatDate(checkOut)}
          </p>
          <p className="text-xs text-gray-500">{nights} gece</p>
        </div>
      </div>

      {/* Misafirler */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
        <Users className="w-5 h-5 text-gray-400" />
        <div>
          <p className="text-sm text-gray-600">
            {guests.rooms} oda, {totalGuests} misafir
          </p>
          <p className="text-xs text-gray-500">
            {guests.adults} yetişkin{guests.children > 0 ? `, ${guests.children} çocuk` : ''}
          </p>
        </div>
      </div>

      {/* Fiyat detayları */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Gecelik fiyat ({guests.rooms} oda)
          </span>
          <span className="text-gray-800">
            {formatPrice(pricePerNight * guests.rooms, currency)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            {nights} gece x {guests.rooms} oda
          </span>
          <span className="text-gray-800">
            {formatPrice(totalPrice, currency)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Vergiler ve ücretler</span>
          <span className="text-green-600">Dahil</span>
        </div>
      </div>

      {/* Toplam */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <span className="font-bold text-gray-900">Toplam</span>
        <span className="text-2xl font-bold text-green-600">
          {formatPrice(totalPrice, currency)}
        </span>
      </div>
    </div>
  );
}



