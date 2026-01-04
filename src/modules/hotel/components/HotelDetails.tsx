'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, MapPin, ChevronLeft, ChevronRight, Check, Clock, X } from 'lucide-react';
import type { HotelDetails as HotelDetailsType } from '../types';
import { 
  formatPrice, 
  getScoreColor, 
  getScoreText, 
  groupAmenities,
  AMENITY_ICONS,
  AMENITY_LABELS 
} from '../utils';
import RoomSelector from './RoomSelector';

interface HotelDetailsProps {
  hotel: HotelDetailsType;
  checkIn: string;
  checkOut: string;
  guests: { adults: number; children: number; rooms: number };
  onRoomSelect: (roomId: string, rateId: string) => void;
}

export default function HotelDetails({
  hotel,
  checkIn,
  checkOut,
  guests,
  onRoomSelect
}: HotelDetailsProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  // Görsel navigasyonu
  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === hotel.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? hotel.images.length - 1 : prev - 1
    );
  };

  // Gruplandırılmış amenity'ler
  const groupedAmenities = groupAmenities(hotel.amenities);

  return (
    <div className="bg-white">
      {/* Görsel Galerisi */}
      <div className="relative h-64 sm:h-80 md:h-96 bg-gray-200">
        <Image
          src={hotel.images[currentImageIndex] || '/images/hotel-placeholder.jpg'}
          alt={hotel.name}
          fill
          className="object-cover"
          priority
        />
        
        {/* Navigasyon okları */}
        {hotel.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
            >
              <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 text-gray-700" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
            >
              <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-gray-700" />
            </button>
          </>
        )}

        {/* Görsel sayacı */}
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm">
          {currentImageIndex + 1} / {hotel.images.length}
        </div>

        {/* Küçük görseller (Desktop) */}
        <div className="hidden md:flex absolute bottom-4 left-4 gap-2">
          {hotel.images.slice(0, 5).map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`w-16 h-12 rounded-lg overflow-hidden border-2 ${
                currentImageIndex === idx ? 'border-white' : 'border-transparent'
              }`}
            >
              <Image
                src={img}
                alt={`${hotel.name} ${idx + 1}`}
                width={64}
                height={48}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Otel Bilgileri */}
      <div className="p-3 sm:p-4 md:p-6">
        {/* Başlık ve Puan */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            {/* Yıldızlar */}
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: hotel.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
              ))}
              {hotel.hotelChain && (
                <span className="ml-2 text-xs sm:text-sm text-gray-500 truncate">{hotel.hotelChain}</span>
              )}
            </div>

            {/* Otel adı */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 break-words">
              {hotel.name}
            </h1>

            {/* Konum */}
            <div className="flex items-start gap-1 text-gray-600 text-sm sm:text-base">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
              <span className="break-words">{hotel.location.address}, {hotel.location.city}</span>
            </div>
          </div>

          {/* Puan kutusu */}
          {hotel.reviewScore && (
            <div className="flex items-center gap-3 md:flex-col md:items-end flex-shrink-0">
              <div className={`${getScoreColor(hotel.reviewScore)} text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xl sm:text-2xl font-bold`}>
                {hotel.reviewScore.toFixed(1)}
              </div>
              <div className="text-left md:text-right">
                <div className="font-semibold text-gray-800 text-sm sm:text-base">
                  {getScoreText(hotel.reviewScore)}
                </div>
                {hotel.reviewCount && (
                  <div className="text-xs sm:text-sm text-gray-500">
                    {hotel.reviewCount.toLocaleString('tr-TR')} yorum
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Açıklama */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Otel Hakkında</h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{hotel.description}</p>
        </div>

        {/* Otel Özellikleri */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Otel Özellikleri</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {Object.entries(groupedAmenities).map(([group, amenities]) => (
              <div key={group} className="space-y-2">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500">{group}</h3>
                {amenities.slice(0, showAllAmenities ? undefined : 3).map(amenity => (
                  <div key={amenity} className="flex items-center gap-2 text-gray-700">
                    <span className="text-sm">{AMENITY_ICONS[amenity] || '✓'}</span>
                    <span className="text-xs sm:text-sm break-words">{AMENITY_LABELS[amenity] || amenity}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          {hotel.amenities.length > 12 && (
            <button
              onClick={() => setShowAllAmenities(!showAllAmenities)}
              className="mt-3 text-green-600 text-xs sm:text-sm font-medium hover:underline"
            >
              {showAllAmenities ? 'Daha az göster' : `Tümünü göster (${hotel.amenities.length})`}
            </button>
          )}
        </div>

        {/* Otel Politikaları */}
        <div className="mb-4 sm:mb-6 bg-gray-50 rounded-xl p-3 sm:p-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Otel Kuralları</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs sm:text-sm text-gray-500">Giriş</div>
                <div className="font-medium text-sm sm:text-base">{hotel.policies.checkIn}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs sm:text-sm text-gray-500">Çıkış</div>
                <div className="font-medium text-sm sm:text-base">{hotel.policies.checkOut}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hotel.policies.petsAllowed ? (
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
              ) : (
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
              )}
              <span className="text-xs sm:text-sm break-words">
                Evcil hayvan {hotel.policies.petsAllowed ? 'kabul' : 'yok'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hotel.policies.smokingAllowed ? (
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
              ) : (
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
              )}
              <span className="text-xs sm:text-sm break-words">
                Sigara {hotel.policies.smokingAllowed ? 'serbest' : 'yasak'}
              </span>
            </div>
          </div>
          {hotel.policies.cancellation && (
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
              <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-1">İptal Politikası</h3>
              <p className="text-xs sm:text-sm text-gray-600">{hotel.policies.cancellation}</p>
            </div>
          )}
        </div>

        {/* Oda Seçimi */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Oda Seçin</h2>
          <RoomSelector
            rooms={hotel.rooms}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
            onSelect={onRoomSelect}
          />
        </div>

        {/* Yorumlar */}
        {hotel.reviews && hotel.reviews.length > 0 && (
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Misafir Yorumları</h2>
            <div className="space-y-3 sm:space-y-4">
              {hotel.reviews.slice(0, 5).map(review => (
                <div key={review.id} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-700 font-semibold text-xs sm:text-sm">
                          {review.author.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-800 text-sm sm:text-base truncate">{review.author}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(review.date).toLocaleDateString('tr-TR')}
                          {review.verified && ' • Doğrulanmış'}
                        </div>
                      </div>
                    </div>
                    <div className={`${getScoreColor(review.rating)} text-white px-2 py-1 rounded text-xs sm:text-sm font-bold flex-shrink-0`}>
                      {review.rating}
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm break-words">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



