'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import type { HotelDetails as HotelDetailsType } from '../types';
import { 
  groupAmenities,
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
      <div className="relative h-64 sm:h-80 md:h-96 bg-gray-100">
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
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" />
            </button>
          </>
        )}

        {/* Görsel sayacı */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded text-xs">
          {currentImageIndex + 1} / {hotel.images.length}
        </div>
      </div>

      {/* Otel Bilgileri */}
      <div className="p-4 sm:p-6 md:p-8">
        {/* Başlık ve Puan */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 md:mb-8 border-b border-gray-200 pb-6">
          <div className="flex-1 min-w-0">
            {/* Otel adı */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-3 break-words tracking-tight">
              {hotel.name}
            </h1>

            {/* Konum */}
            <div className="flex items-start gap-2 text-gray-500 text-sm sm:text-base mb-3">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="break-words">{hotel.location.address}, {hotel.location.city}</span>
            </div>

            {/* Yıldızlar ve zincir */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: hotel.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gray-400 text-gray-400" />
                ))}
              </div>
              {hotel.hotelChain && (
                <span className="text-xs text-gray-400 uppercase tracking-wide">{hotel.hotelChain}</span>
              )}
            </div>
          </div>

          {/* Puan kutusu */}
          {hotel.reviewScore && (
            <div className="flex items-center gap-4 md:flex-col md:items-end flex-shrink-0">
              <div className="text-right">
                <div className="text-3xl md:text-4xl font-light text-gray-900 mb-1">
                  {hotel.reviewScore.toFixed(1)}
                </div>
                {hotel.reviewCount && (
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    {hotel.reviewCount.toLocaleString('tr-TR')} değerlendirme
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Açıklama */}
        <div className="mb-8">
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-3xl">{hotel.description}</p>
        </div>

        {/* Otel Özellikleri */}
        <div className="mb-8 border-t border-gray-200 pt-6">
          <h2 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-4">Otel Özellikleri</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Object.entries(groupedAmenities).map(([group, amenities]) => (
              <div key={group} className="space-y-3">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">{group}</h3>
                <div className="space-y-2">
                  {amenities.slice(0, showAllAmenities ? undefined : 4).map(amenity => (
                    <div key={amenity} className="text-sm text-gray-700">
                      {AMENITY_LABELS[amenity] || amenity}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {hotel.amenities.length > 12 && (
            <button
              onClick={() => setShowAllAmenities(!showAllAmenities)}
              className="mt-4 text-xs text-gray-500 hover:text-gray-900 uppercase tracking-wide"
            >
              {showAllAmenities ? 'Daha az göster' : `Tümünü göster (${hotel.amenities.length})`}
            </button>
          )}
        </div>

        {/* Otel Politikaları */}
        <div className="mb-8 border-t border-gray-200 pt-6">
          <h2 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-4">Otel Kuralları</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Giriş</div>
              <div className="text-sm text-gray-900">{hotel.policies.checkIn}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Çıkış</div>
              <div className="text-sm text-gray-900">{hotel.policies.checkOut}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Evcil Hayvan</div>
              <div className="text-sm text-gray-900">{hotel.policies.petsAllowed ? 'Kabul edilir' : 'Kabul edilmez'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Sigara</div>
              <div className="text-sm text-gray-900">{hotel.policies.smokingAllowed ? 'Serbest' : 'Yasak'}</div>
            </div>
          </div>
          {hotel.policies.cancellation && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-xs text-gray-500 uppercase tracking-wide mb-2">İptal Politikası</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{hotel.policies.cancellation}</p>
            </div>
          )}
        </div>

        {/* Oda Seçimi */}
        <div className="mb-8 border-t border-gray-200 pt-6">
          <h2 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-4">Oda Seçin</h2>
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
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-4">Misafir Yorumları</h2>
            <div className="space-y-6">
              {hotel.reviews.slice(0, 5).map(review => (
                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-3 gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="text-sm font-medium text-gray-900">{review.author}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(review.date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      </div>
                      {review.verified && (
                        <div className="text-xs text-gray-400 uppercase tracking-wide">Doğrulanmış misafir</div>
                      )}
                    </div>
                    <div className="text-sm font-light text-gray-900 flex-shrink-0">
                      {review.rating}/10
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed break-words">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



