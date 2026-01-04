'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, MapPin, ChevronLeft, ChevronRight, Wifi, Car, Coffee, Dumbbell, Users, Bed, Maximize, Heart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import LoginModal from '@/components/LoginModal';
import type { HotelDetails as HotelDetailsType } from '../types';
import { 
  formatPrice,
  getScoreColor,
  getScoreText,
  groupAmenities,
  AMENITY_LABELS 
} from '../utils';
import RoomSelector from './RoomSelector';
import { useHotelFavorite } from '../hooks/useHotelFavorite';

// Amenity ikonları
const amenityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="w-4 h-4" />,
  'Parking': <Car className="w-4 h-4" />,
  'Restaurant': <Coffee className="w-4 h-4" />,
  'Gym': <Dumbbell className="w-4 h-4" />
};

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
  const { data: session, status } = useSession();
  const { isFavorite, isLoading, toggleFavorite } = useHotelFavorite(hotel.id);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  const handleFavoriteClick = () => {
    if (status !== 'authenticated') {
      setShowLoginModal(true);
      return;
    }
    
    toggleFavorite();
  };

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
    <div className="space-y-4 md:space-y-6">
      {/* Görsel Galerisi */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
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
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </>
          )}

          {/* Favori butonu - Sağ üst köşe */}
          <button
            onClick={handleFavoriteClick}
            disabled={isLoading}
            className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all z-10 ${
              isFavorite
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            title={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
          >
            <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Görsel sayacı */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {hotel.images.length}
          </div>
        </div>
      </div>

      {/* Otel Bilgileri */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6">
          {/* Başlık ve Puan */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4 md:mb-6">
            <div className="flex-1 min-w-0">
              {/* Otel adı */}
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 break-words">
                {hotel.name}
              </h1>

              {/* Konum */}
              <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="break-words">{hotel.location.address}, {hotel.location.city}</span>
              </div>

              {/* Yıldızlar ve zincir */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: hotel.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                {hotel.hotelChain && (
                  <span className="text-xs text-gray-500">{hotel.hotelChain}</span>
                )}
              </div>
            </div>

            {/* Puan kutusu */}
            {hotel.reviewScore && (
              <div className="flex items-center gap-3 md:flex-col md:items-end flex-shrink-0">
                <div className={`${getScoreColor(hotel.reviewScore)} text-white px-3 py-2 rounded-lg text-xl md:text-2xl font-bold`}>
                  {hotel.reviewScore.toFixed(1)}
                </div>
                <div className="text-left md:text-right">
                  <div className="font-semibold text-gray-800 text-sm">
                    {getScoreText(hotel.reviewScore)}
                  </div>
                  {hotel.reviewCount && (
                    <div className="text-xs text-gray-500">
                      {hotel.reviewCount.toLocaleString('tr-TR')} yorum
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Açıklama */}
          <div className="mb-4 md:mb-6">
            <p className="text-sm text-gray-600 leading-relaxed">{hotel.description}</p>
          </div>

          {/* Otel Özellikleri */}
          <div className="mb-4 md:mb-6 border-t border-gray-100 pt-4 md:pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Otel Özellikleri</h2>
            <div className="flex flex-wrap gap-2">
              {hotel.amenities.slice(0, showAllAmenities ? undefined : 8).map(amenity => (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs"
                >
                  {amenityIcons[amenity] || null}
                  {AMENITY_LABELS[amenity] || amenity}
                </span>
              ))}
              {hotel.amenities.length > 8 && !showAllAmenities && (
                <button
                  onClick={() => setShowAllAmenities(true)}
                  className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-xs hover:bg-gray-200"
                >
                  +{hotel.amenities.length - 8} daha
                </button>
              )}
            </div>
            {showAllAmenities && hotel.amenities.length > 8 && (
              <button
                onClick={() => setShowAllAmenities(false)}
                className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Daha az göster
              </button>
            )}
          </div>

          {/* Otel Politikaları */}
          <div className="mb-4 md:mb-6 border-t border-gray-100 pt-4 md:pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Otel Kuralları</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Giriş</div>
                <div className="font-medium text-sm text-gray-900">{hotel.policies.checkIn}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Çıkış</div>
                <div className="font-medium text-sm text-gray-900">{hotel.policies.checkOut}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Evcil Hayvan</div>
                <div className="font-medium text-sm text-gray-900">{hotel.policies.petsAllowed ? 'Kabul edilir' : 'Kabul edilmez'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Sigara</div>
                <div className="font-medium text-sm text-gray-900">{hotel.policies.smokingAllowed ? 'Serbest' : 'Yasak'}</div>
              </div>
            </div>
            {hotel.policies.cancellation && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-700 mb-1">İptal Politikası</h3>
                <p className="text-sm text-gray-600">{hotel.policies.cancellation}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Oda Seçimi */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Oda Seçin</h2>
          <RoomSelector
            rooms={hotel.rooms}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
            onSelect={onRoomSelect}
          />
        </div>
      </div>

      {/* Yorumlar */}
      {hotel.reviews && hotel.reviews.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 md:p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Misafir Yorumları</h2>
            <div className="space-y-4">
              {hotel.reviews.slice(0, 5).map(review => (
                <div key={review.id} className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-700 font-semibold text-xs md:text-sm">
                          {review.author.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-800 text-sm md:text-base truncate">{review.author}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(review.date).toLocaleDateString('tr-TR')}
                          {review.verified && ' • Doğrulanmış'}
                        </div>
                      </div>
                    </div>
                    <div className={`${getScoreColor(review.rating)} text-white px-2 py-1 rounded text-xs md:text-sm font-bold flex-shrink-0`}>
                      {review.rating}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm break-words">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
}



