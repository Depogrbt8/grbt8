'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Star, X, SlidersHorizontal } from 'lucide-react';
import type { HotelFilters as HotelFiltersType } from '../types';
import { AMENITY_LABELS, formatPrice } from '../utils';

interface HotelFiltersProps {
  filters: HotelFiltersType;
  availableFilters?: {
    availableAmenities: string[];
    priceRange: { min: number; max: number };
    availableChains: string[];
  };
  onFiltersChange: (filters: HotelFiltersType) => void;
  className?: string;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

// Sıralama seçenekleri
const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popülerlik' },
  { value: 'price_asc', label: 'Fiyat (Düşükten Yükseğe)' },
  { value: 'price_desc', label: 'Fiyat (Yüksekten Düşüğe)' },
  { value: 'rating', label: 'Puan' },
  { value: 'distance', label: 'Merkeze Uzaklık' }
];

export default function HotelFilters({
  filters,
  availableFilters,
  onFiltersChange,
  className = '',
  isMobile = false,
  isOpen = true,
  onClose
}: HotelFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['price', 'rating', 'amenities']);

  // Section toggle
  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Rating toggle
  const handleRatingToggle = (rating: number) => {
    const currentRatings = filters.rating || [];
    const newRatings = currentRatings.includes(rating)
      ? currentRatings.filter(r => r !== rating)
      : [...currentRatings, rating];
    
    onFiltersChange({
      ...filters,
      rating: newRatings.length > 0 ? newRatings : undefined
    });
  };

  // Amenity toggle
  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = filters.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    
    onFiltersChange({
      ...filters,
      amenities: newAmenities.length > 0 ? newAmenities : undefined
    });
  };

  // Fiyat aralığı değiştir
  const handlePriceChange = (min: number, max: number) => {
    onFiltersChange({
      ...filters,
      priceRange: { min, max }
    });
  };

  // Sıralama değiştir
  const handleSortChange = (sortBy: HotelFiltersType['sortBy']) => {
    onFiltersChange({
      ...filters,
      sortBy
    });
  };

  // Filtreleri temizle
  const clearAllFilters = () => {
    onFiltersChange({});
  };

  // Aktif filtre sayısı
  const activeFilterCount = 
    (filters.rating?.length || 0) +
    (filters.amenities?.length || 0) +
    (filters.priceRange ? 1 : 0);

  // Mobil modal
  if (isMobile) {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
        <div 
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-lg">Filtreler</h3>
              {activeFilterCount > 0 && (
                <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <button onClick={onClose} className="p-2">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-4 space-y-6">
            {/* Sıralama */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Sıralama</h4>
              <div className="grid grid-cols-2 gap-2">
                {SORT_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value as HotelFiltersType['sortBy'])}
                    className={`px-3 py-2 rounded-lg text-sm border ${
                      filters.sortBy === option.value
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Yıldız rating */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Otel Sınıfı</h4>
              <div className="flex flex-wrap gap-2">
                {[5, 4, 3, 2, 1].map(rating => (
                  <button
                    key={rating}
                    onClick={() => handleRatingToggle(rating)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg border ${
                      filters.rating?.includes(rating)
                        ? 'bg-green-50 border-green-500'
                        : 'border-gray-200'
                    }`}
                  >
                    <span className="text-sm">{rating}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities */}
            {availableFilters?.availableAmenities && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Otel Özellikleri</h4>
                <div className="grid grid-cols-2 gap-2">
                  {availableFilters.availableAmenities.slice(0, 10).map(amenity => (
                    <button
                      key={amenity}
                      onClick={() => handleAmenityToggle(amenity)}
                      className={`px-3 py-2 rounded-lg text-sm border text-left ${
                        filters.amenities?.includes(amenity)
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : 'border-gray-200 text-gray-700'
                      }`}
                    >
                      {AMENITY_LABELS[amenity] || amenity}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
            <button
              onClick={clearAllFilters}
              className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700"
            >
              Temizle
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold"
            >
              Uygula
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop sidebar
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-gray-800">Filtreler</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-green-600 hover:underline"
          >
            Temizle
          </button>
        )}
      </div>

      {/* Sıralama */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-2">Sıralama</h4>
        <select
          value={filters.sortBy || 'popularity'}
          onChange={(e) => handleSortChange(e.target.value as HotelFiltersType['sortBy'])}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          {SORT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Fiyat Aralığı */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full font-medium text-gray-700 mb-2"
        >
          <span>Fiyat Aralığı</span>
          {expandedSections.includes('price') ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
        
        {expandedSections.includes('price') && availableFilters?.priceRange && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange?.min || ''}
                onChange={(e) => handlePriceChange(
                  parseInt(e.target.value) || availableFilters.priceRange.min,
                  filters.priceRange?.max || availableFilters.priceRange.max
                )}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange?.max || ''}
                onChange={(e) => handlePriceChange(
                  filters.priceRange?.min || availableFilters.priceRange.min,
                  parseInt(e.target.value) || availableFilters.priceRange.max
                )}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="text-xs text-gray-500 text-center">
              {formatPrice(availableFilters.priceRange.min)} - {formatPrice(availableFilters.priceRange.max)}
            </div>
          </div>
        )}
      </div>

      {/* Yıldız Rating */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('rating')}
          className="flex items-center justify-between w-full font-medium text-gray-700 mb-2"
        >
          <span>Otel Sınıfı</span>
          {expandedSections.includes('rating') ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
        
        {expandedSections.includes('rating') && (
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => (
              <label
                key={rating}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.rating?.includes(rating) || false}
                  onChange={() => handleRatingToggle(rating)}
                  className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-500"
                />
                <span className="flex items-center gap-1">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Amenities */}
      {availableFilters?.availableAmenities && (
        <div className="mb-6">
          <button
            onClick={() => toggleSection('amenities')}
            className="flex items-center justify-between w-full font-medium text-gray-700 mb-2"
          >
            <span>Otel Özellikleri</span>
            {expandedSections.includes('amenities') ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
          
          {expandedSections.includes('amenities') && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableFilters.availableAmenities.map(amenity => (
                <label
                  key={amenity}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.amenities?.includes(amenity) || false}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    {AMENITY_LABELS[amenity] || amenity}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}



