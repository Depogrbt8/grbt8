'use client';

import { useState, useCallback, useMemo } from 'react';
import type { HotelFilters, Hotel } from '../types';

interface UseHotelFiltersOptions {
  initialFilters?: HotelFilters;
}

export function useHotelFilters(options: UseHotelFiltersOptions = {}) {
  const [filters, setFilters] = useState<HotelFilters>(options.initialFilters || {});

  // Fiyat aralığı güncelle
  const setPriceRange = useCallback((min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      priceRange: { min, max }
    }));
  }, []);

  // Yıldız rating güncelle
  const toggleRating = useCallback((rating: number) => {
    setFilters(prev => {
      const currentRatings = prev.rating || [];
      const newRatings = currentRatings.includes(rating)
        ? currentRatings.filter(r => r !== rating)
        : [...currentRatings, rating];
      
      return {
        ...prev,
        rating: newRatings.length > 0 ? newRatings : undefined
      };
    });
  }, []);

  // Amenity toggle
  const toggleAmenity = useCallback((amenity: string) => {
    setFilters(prev => {
      const currentAmenities = prev.amenities || [];
      const newAmenities = currentAmenities.includes(amenity)
        ? currentAmenities.filter(a => a !== amenity)
        : [...currentAmenities, amenity];
      
      return {
        ...prev,
        amenities: newAmenities.length > 0 ? newAmenities : undefined
      };
    });
  }, []);

  // Meal plan toggle
  const toggleMealPlan = useCallback((mealPlan: string) => {
    setFilters(prev => {
      const currentPlans = prev.mealPlan || [];
      const newPlans = currentPlans.includes(mealPlan)
        ? currentPlans.filter(p => p !== mealPlan)
        : [...currentPlans, mealPlan];
      
      return {
        ...prev,
        mealPlan: newPlans.length > 0 ? newPlans : undefined
      };
    });
  }, []);

  // Sıralama güncelle
  const setSortBy = useCallback((sortBy: HotelFilters['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy
    }));
  }, []);

  // Tüm filtreleri temizle
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Aktif filtre sayısı
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.priceRange) count++;
    if (filters.rating && filters.rating.length > 0) count += filters.rating.length;
    if (filters.amenities && filters.amenities.length > 0) count += filters.amenities.length;
    if (filters.mealPlan && filters.mealPlan.length > 0) count += filters.mealPlan.length;
    return count;
  }, [filters]);

  // Filtreleme fonksiyonu (client-side)
  const applyFilters = useCallback((hotels: Hotel[]): Hotel[] => {
    let filtered = [...hotels];

    // Fiyat filtresi
    if (filters.priceRange) {
      filtered = filtered.filter(hotel =>
        hotel.priceRange.min >= filters.priceRange!.min &&
        hotel.priceRange.min <= filters.priceRange!.max
      );
    }

    // Yıldız filtresi
    if (filters.rating && filters.rating.length > 0) {
      filtered = filtered.filter(hotel =>
        filters.rating!.includes(hotel.rating)
      );
    }

    // Amenity filtresi
    if (filters.amenities && filters.amenities.length > 0) {
      filtered = filtered.filter(hotel =>
        filters.amenities!.every(amenity => hotel.amenities.includes(amenity))
      );
    }

    // Sıralama
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          filtered.sort((a, b) => a.priceRange.min - b.priceRange.min);
          break;
        case 'price_desc':
          filtered.sort((a, b) => b.priceRange.min - a.priceRange.min);
          break;
        case 'rating':
          filtered.sort((a, b) => (b.reviewScore || 0) - (a.reviewScore || 0));
          break;
        case 'distance':
          filtered.sort((a, b) => 
            (a.location.distanceFromCenter || 0) - (b.location.distanceFromCenter || 0)
          );
          break;
        case 'popularity':
          filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
          break;
      }
    }

    return filtered;
  }, [filters]);

  return {
    filters,
    setFilters,
    setPriceRange,
    toggleRating,
    toggleAmenity,
    toggleMealPlan,
    setSortBy,
    clearFilters,
    activeFilterCount,
    applyFilters
  };
}



