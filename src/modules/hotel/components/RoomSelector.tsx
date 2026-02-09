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
    <div className="space-y-4">
      {rooms.map(room => (
        <div
          key={room.id}
          className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col md:flex-row">
            {/* Oda Görseli */}
            <div className="relative w-full md:w-48 h-40 md:h-auto flex-shrink-0">
              <Image
                src={room.images[0] || '/images/campaigns/placeholder.svg'}
                alt={room.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Oda Bilgileri */}
            <div className="flex-1 p-4">
              <h3 className="font-bold text-lg text-gray-900 mb-2 break-words">{room.name}</h3>
              
              {/* Oda özellikleri */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>Max {room.maxOccupancy} kişi</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4" />
                  <span className="break-words">{room.bedType}</span>
                </div>
                {room.size && (
                  <div className="flex items-center gap-1">
                    <Maximize className="w-4 h-4" />
                    <span>{room.size} m²</span>
                  </div>
                )}
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2 break-words">
                {room.description}
              </p>

              {/* Oda amenity'leri */}
              <div className="flex flex-wrap gap-2 mb-4">
                {room.amenities.slice(0, 5).map(amenity => (
                  <span
                    key={amenity}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs"
                  >
                    {AMENITY_LABELS[amenity] || amenity}
                  </span>
                ))}
              </div>

              {/* Rate seçenekleri */}
              <div className="space-y-3 border-t border-gray-100 pt-4">
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 rounded-lg p-3">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="font-medium text-gray-800 text-sm sm:text-base break-words">{rate.name}</span>
          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded whitespace-nowrap">
            {getMealPlanLabel(rate.mealPlan)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
          <span className="text-gray-600">
            {getCancellationLabel(rate.cancellationPolicy)}
          </span>
          {isLowAvailability && (
            <span className="text-orange-600 font-medium whitespace-nowrap">
              Son {rate.roomsLeft} oda!
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
        <div className="text-left sm:text-right">
          {rate.originalPrice && rate.originalPrice > rate.price && (
            <div className="text-xs sm:text-sm text-gray-400 line-through">
              {formatPrice(rate.originalPrice * nights * roomsNeeded, rate.currency)}
            </div>
          )}
          <div className="text-lg sm:text-xl font-bold text-green-600">
            {formatPrice(totalPrice, rate.currency)}
          </div>
          <div className="text-xs text-gray-500">
            {nights} gece, {roomsNeeded} oda
          </div>
        </div>

        <button
          onClick={onSelect}
          disabled={!rate.availability}
          className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold whitespace-nowrap text-sm sm:text-base flex-shrink-0 transition-colors ${
            rate.availability
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {rate.availability ? 'Seç' : 'Müsait Değil'}
        </button>
      </div>
    </div>
  );
}



