'use client';

import Image from 'next/image';
import { Users, Bed, Maximize } from 'lucide-react';
import type { RoomType, Rate } from '../types';
import { 
  formatPrice, 
  getMealPlanLabel, 
  getCancellationLabel, 
  getNights,
  AMENITY_LABELS 
} from '../utils';

interface RoomSelectorProps {
  rooms: RoomType[];
  checkIn: string;
  checkOut: string;
  guests: { adults: number; children: number; rooms: number };
  onSelect: (roomId: string, rateId: string) => void;
}

export default function RoomSelector({
  rooms,
  checkIn,
  checkOut,
  guests,
  onSelect
}: RoomSelectorProps) {
  const nights = getNights(checkIn, checkOut);

  return (
    <div className="space-y-8">
      {rooms.map(room => (
        <div key={room.id} className="border-b border-gray-200 pb-8 last:border-0 last:pb-0">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Oda Görseli */}
            <div className="relative w-full md:w-64 h-48 md:h-64 flex-shrink-0 bg-gray-100">
              <Image
                src={room.images[0] || '/images/room-placeholder.jpg'}
                alt={room.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Oda Bilgileri */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-light text-gray-900 mb-3 break-words">{room.name}</h3>
              
              {/* Oda özellikleri */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Max {room.maxOccupancy} kişi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4" />
                  <span className="break-words">{room.bedType}</span>
                </div>
                {room.size && (
                  <div className="flex items-center gap-2">
                    <Maximize className="w-4 h-4" />
                    <span>{room.size} m²</span>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-4 leading-relaxed break-words">
                {room.description}
              </p>

              {/* Oda amenity'leri */}
              <div className="flex flex-wrap gap-3 mb-6">
                {room.amenities.slice(0, 6).map(amenity => (
                  <span
                    key={amenity}
                    className="text-xs text-gray-500 uppercase tracking-wide"
                  >
                    {AMENITY_LABELS[amenity] || amenity}
                  </span>
                ))}
              </div>

              {/* Rate seçenekleri */}
              <div className="space-y-4 border-t border-gray-200 pt-4">
                {room.rates.map(rate => (
                  <RateOption
                    key={rate.id}
                    rate={rate}
                    nights={nights}
                    roomsNeeded={guests.rooms}
                    onSelect={() => onSelect(room.id, rate.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Rate Option Component
interface RateOptionProps {
  rate: Rate;
  nights: number;
  roomsNeeded: number;
  onSelect: () => void;
}

function RateOption({ rate, nights, roomsNeeded, onSelect }: RateOptionProps) {
  const totalPrice = rate.price * nights * roomsNeeded;
  const isLowAvailability = rate.roomsLeft && rate.roomsLeft <= 3;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <span className="text-sm font-light text-gray-900 break-words">{rate.name}</span>
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {getMealPlanLabel(rate.mealPlan)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <span>{getCancellationLabel(rate.cancellationPolicy)}</span>
          {isLowAvailability && (
            <span className="uppercase tracking-wide">
              Son {rate.roomsLeft} oda
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0">
        <div className="text-left sm:text-right">
          {rate.originalPrice && rate.originalPrice > rate.price && (
            <div className="text-xs text-gray-400 line-through mb-1">
              {formatPrice(rate.originalPrice * nights * roomsNeeded, rate.currency)}
            </div>
          )}
          <div className="text-xl font-light text-gray-900">
            {formatPrice(totalPrice, rate.currency)}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">
            {nights} gece, {roomsNeeded} oda
          </div>
        </div>

        <button
          onClick={onSelect}
          disabled={!rate.availability}
          className={`px-6 py-2 border border-gray-900 text-gray-900 text-sm uppercase tracking-wide whitespace-nowrap transition-all flex-shrink-0 ${
            rate.availability
              ? 'hover:bg-gray-900 hover:text-white'
              : 'opacity-50 cursor-not-allowed border-gray-300'
          }`}
        >
          {rate.availability ? 'Seç' : 'Müsait Değil'}
        </button>
      </div>
    </div>
  );
}



