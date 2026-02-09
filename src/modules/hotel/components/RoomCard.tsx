'use client';

import Image from 'next/image';
import { Users, Bed, Maximize, Check } from 'lucide-react';
import type { RoomType } from '../types';
import { formatPrice, getLowestRate, AMENITY_LABELS } from '../utils';

interface RoomCardProps {
  room: RoomType;
  nights: number;
  roomsNeeded: number;
  onSelect: () => void;
}

export default function RoomCard({ room, nights, roomsNeeded, onSelect }: RoomCardProps) {
  const lowestRate = getLowestRate(room.rates);
  const totalPrice = lowestRate ? lowestRate.price * nights * roomsNeeded : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Görsel */}
      <div className="relative h-40">
        <Image
          src={room.images[0] || '/images/campaigns/placeholder.svg'}
          alt={room.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Bilgiler */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-2">{room.name}</h3>
        
        {/* Özellikler */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>Max {room.maxOccupancy}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span>{room.bedType}</span>
          </div>
          {room.size && (
            <div className="flex items-center gap-1">
              <Maximize className="w-4 h-4" />
              <span>{room.size} m²</span>
            </div>
          )}
        </div>

        {/* Amenity'ler */}
        <div className="flex flex-wrap gap-1 mb-4">
          {room.amenities.slice(0, 4).map(amenity => (
            <span
              key={amenity}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
            >
              <Check className="w-3 h-3" />
              {AMENITY_LABELS[amenity] || amenity}
            </span>
          ))}
          {room.amenities.length > 4 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
              +{room.amenities.length - 4}
            </span>
          )}
        </div>

        {/* Fiyat ve buton */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <div className="text-xs text-gray-500">
              {nights} gece, {roomsNeeded} oda
            </div>
            <div className="text-xl font-bold text-green-600">
              {lowestRate ? formatPrice(totalPrice, lowestRate.currency) : '-'}
            </div>
          </div>
          <button
            onClick={onSelect}
            className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
          >
            Seç
          </button>
        </div>
      </div>
    </div>
  );
}



