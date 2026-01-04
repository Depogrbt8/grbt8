'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface UseHotelFavoriteReturn {
  isFavorite: boolean;
  isLoading: boolean;
  toggleFavorite: () => Promise<void>;
  error: string | null;
}

export function useHotelFavorite(hotelId: string): UseHotelFavoriteReturn {
  const { data: session, status } = useSession();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Favori durumunu kontrol et
  useEffect(() => {
    if (status === 'authenticated' && session?.user && hotelId) {
      checkFavoriteStatus();
    } else {
      setIsFavorite(false);
    }
  }, [status, session, hotelId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/hotel-favorites?hotelId=${hotelId}`);
      const data = await response.json();
      
      if (response.ok) {
        setIsFavorite(data.isFavorite || false);
      }
    } catch (err) {
      // Sessizce hata yok say (kullanıcı giriş yapmamış olabilir)
      setIsFavorite(false);
    }
  };

  const toggleFavorite = async () => {
    if (status !== 'authenticated' || !session?.user) {
      setError('Favorilere eklemek için giriş yapmalısınız');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isFavorite) {
        // Favorilerden çıkar
        const response = await fetch(`/api/hotel-favorites?hotelId=${hotelId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setIsFavorite(false);
        } else {
          const data = await response.json();
          throw new Error(data.error || 'Favorilerden çıkarma hatası');
        }
      } else {
        // Favorilere ekle
        const response = await fetch('/api/hotel-favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hotelId })
        });
        
        if (response.ok) {
          setIsFavorite(true);
        } else {
          const data = await response.json();
          throw new Error(data.error || 'Favorilere ekleme hatası');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
      console.error('Favorite toggle error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isFavorite,
    isLoading,
    toggleFavorite,
    error
  };
}

