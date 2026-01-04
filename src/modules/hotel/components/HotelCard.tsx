'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Wifi, Car, Coffee, Dumbbell, Heart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import LoginModal from '@/components/LoginModal';
import type { Hotel } from '../types';
import { formatPrice, getScoreColor, getScoreText, formatDistance } from '../utils';
import { useHotelFavorite } from '../hooks/useHotelFavorite';

interface HotelCardProps {
  hotel: Hotel;
  checkIn?: string;
  checkOut?: string;
  guests?: { adults: number; children: number; rooms: number };
}

// Amenity ikonları
const amenityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="w-4 h-4" />,
  'Parking': <Car className="w-4 h-4" />,
  'Restaurant': <Coffee className="w-4 h-4" />,
  'Gym': <Dumbbell className="w-4 h-4" />
};

export default function HotelCard({ hotel, checkIn, checkOut, guests }: HotelCardProps) {
  const { data: session, status } = useSession();
  const { isFavorite, isLoading, toggleFavorite } = useHotelFavorite(hotel.id);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Detay sayfası URL'i
  const detailUrl = `/hotels/${hotel.id}${checkIn ? `?checkIn=${checkIn}&checkOut=${checkOut}&adults=${guests?.adults || 2}&children=${guests?.children || 0}&rooms=${guests?.rooms || 1}` : ''}`;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (status !== 'authenticated') {
      setShowLoginModal(true);
      return;
    }
    
    toggleFavorite();
  };

  return (
    <>
      <Link href={detailUrl} className="block">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer relative">
          <div className="flex flex-col md:flex-row">
            {/* Otel Görseli */}
            <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0">
              <Image
                src={hotel.images[0] || '/images/hotel-placeholder.jpg'}
                alt={hotel.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 256px"
              />
              {/* Yıldız rating */}
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
                {Array.from({ length: hotel.rating }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              {/* Favori butonu */}
              <button
                onClick={handleFavoriteClick}
                disabled={isLoading}
                className={`absolute top-2 right-2 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isFavorite
                    ? 'bg-green-500 text-white'
                    : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                title={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

          {/* Otel Bilgileri */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              {/* Üst kısım: İsim ve puan */}
              <div className="flex justify-between items-start gap-2 mb-2">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                    {hotel.name}
                  </h3>
                  <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{hotel.location.city}, {hotel.location.country}</span>
                    {hotel.location.distanceFromCenter && (
                      <span className="text-gray-400">
                        • Merkeze {formatDistance(hotel.location.distanceFromCenter)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Review score */}
                {hotel.reviewScore && (
                  <div className="flex flex-col items-end">
                    <div className={`${getScoreColor(hotel.reviewScore)} text-white px-2 py-1 rounded-md text-sm font-bold`}>
                      {hotel.reviewScore.toFixed(1)}
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {getScoreText(hotel.reviewScore)}
                    </span>
                    {hotel.reviewCount && (
                      <span className="text-xs text-gray-400">
                        {hotel.reviewCount.toLocaleString('tr-TR')} yorum
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-2 mt-3">
                {hotel.amenities.slice(0, 4).map(amenity => (
                  <span
                    key={amenity}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs"
                  >
                    {amenityIcons[amenity] || null}
                    {amenity}
                  </span>
                ))}
                {hotel.amenities.length > 4 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-xs">
                    +{hotel.amenities.length - 4}
                  </span>
                )}
              </div>
            </div>

            {/* Alt kısım: Fiyat */}
            <div className="flex justify-between items-end mt-4 pt-3 border-t border-gray-100">
              <div className="text-sm text-gray-500">
                {hotel.hotelChain && (
                  <span className="text-gray-400">{hotel.hotelChain}</span>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Gecelik fiyat</div>
                <div className="text-xl font-bold text-green-600">
                  {formatPrice(hotel.priceRange.min, hotel.priceRange.currency)}
                </div>
                <div className="text-xs text-gray-400">vergiler dahil</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </Link>
      
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </>
  );
}



