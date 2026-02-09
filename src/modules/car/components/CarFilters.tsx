'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import type { CarFiltersType, CarCategory } from '../types';
import {
  CAR_CATEGORY_LABELS,
  TRANSMISSION_LABELS,
  MILEAGE_TYPE_LABELS
} from '../types';

interface CarFiltersProps {
  filters: CarFiltersType;
  onFiltersChange: (filters: CarFiltersType) => void;
  suppliers?: { id: number; name: string; count: number }[];
  priceRange?: { min: number; max: number };
}

export default function CarFilters({
  filters,
  onFiltersChange,
  suppliers = [],
  priceRange = { min: 0, max: 1000 }
}: CarFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleCategoryToggle = (category: CarCategory) => {
    const current = filters.carCategories || [];
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    
    onFiltersChange({ ...filters, carCategories: updated });
  };
  
  const handleTransmissionChange = (type: 'automatic' | 'manual' | null) => {
    onFiltersChange({ ...filters, transmissionType: type || undefined });
  };
  
  const handleMileageChange = (type: 'unlimited' | 'limited' | null) => {
    onFiltersChange({ ...filters, mileageType: type || undefined });
  };
  
  const handleSupplierToggle = (supplierId: number) => {
    const current = filters.supplierIds || [];
    const updated = current.includes(supplierId)
      ? current.filter(id => id !== supplierId)
      : [...current, supplierId];
    
    onFiltersChange({ ...filters, supplierIds: updated });
  };
  
  const handlePriceRangeChange = (min: number, max: number) => {
    onFiltersChange({ ...filters, priceRange: { min, max } });
  };
  
  const handleSeatsChange = (seats: number | undefined) => {
    onFiltersChange({ ...filters, numberOfSeats: seats });
  };
  
  const handleAirConditioningChange = (value: boolean | undefined) => {
    onFiltersChange({ ...filters, airConditioning: value });
  };
  
  const clearFilters = () => {
    onFiltersChange({});
  };
  
  const activeFilterCount = 
    (filters.carCategories?.length || 0) +
    (filters.transmissionType ? 1 : 0) +
    (filters.mileageType ? 1 : 0) +
    (filters.supplierIds?.length || 0) +
    (filters.numberOfSeats ? 1 : 0) +
    (filters.airConditioning !== undefined ? 1 : 0) +
    (filters.priceRange ? 1 : 0);
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Mobil: Filtre butonu */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filtreler</span>
            {activeFilterCount > 0 && (
              <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <X className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-0' : 'rotate-45'}`} />
        </button>
      </div>
      
      {/* Filtre içeriği */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:block mt-4 md:mt-0 space-y-6`}>
        {/* Başlık ve temizle butonu */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Filtreler</h3>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-green-600 hover:text-green-700"
            >
              Temizle
            </button>
          )}
        </div>
        
        {/* Araç Kategorisi */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Araç Kategorisi</h4>
          <div className="space-y-2">
            {(Object.keys(CAR_CATEGORY_LABELS) as CarCategory[]).map(category => (
              <label key={category} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.carCategories?.includes(category) || false}
                  onChange={() => handleCategoryToggle(category)}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">
                  {CAR_CATEGORY_LABELS[category]}
                </span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Vites Tipi */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Vites Tipi</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="transmission"
                checked={!filters.transmissionType}
                onChange={() => handleTransmissionChange(null)}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Tümü</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="transmission"
                checked={filters.transmissionType === 'automatic'}
                onChange={() => handleTransmissionChange('automatic')}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">
                {TRANSMISSION_LABELS.automatic}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="transmission"
                checked={filters.transmissionType === 'manual'}
                onChange={() => handleTransmissionChange('manual')}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">
                {TRANSMISSION_LABELS.manual}
              </span>
            </label>
          </div>
        </div>
        
        {/* Kilometre */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Kilometre</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mileage"
                checked={!filters.mileageType}
                onChange={() => handleMileageChange(null)}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Tümü</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mileage"
                checked={filters.mileageType === 'unlimited'}
                onChange={() => handleMileageChange('unlimited')}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">
                {MILEAGE_TYPE_LABELS.unlimited}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mileage"
                checked={filters.mileageType === 'limited'}
                onChange={() => handleMileageChange('limited')}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">
                {MILEAGE_TYPE_LABELS.limited}
              </span>
            </label>
          </div>
        </div>
        
        {/* Koltuk Sayısı */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Minimum Koltuk</h4>
          <div className="space-y-2">
            {[null, 5, 7, 9].map(seats => (
              <label key={seats || 'all'} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="seats"
                  checked={filters.numberOfSeats === seats}
                  onChange={() => handleSeatsChange(seats || undefined)}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">
                  {seats ? `${seats}+ Kişi` : 'Tümü'}
                </span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Klima */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Özellikler</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.airConditioning === true}
                onChange={(e) => handleAirConditioningChange(e.target.checked ? true : undefined)}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Klimalı</span>
            </label>
          </div>
        </div>
        
        {/* Tedarikçiler */}
        {suppliers.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Tedarikçi</h4>
            <div className="space-y-2">
              {suppliers.map(supplier => (
                <label key={supplier.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.supplierIds?.includes(supplier.id) || false}
                    onChange={() => handleSupplierToggle(supplier.id)}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    {supplier.name}
                    <span className="text-gray-400 ml-1">({supplier.count})</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
        
        {/* Fiyat Aralığı */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Fiyat Aralığı</h4>
          <div className="space-y-3">
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={filters.priceRange?.max || priceRange.max}
              onChange={(e) => handlePriceRangeChange(
                filters.priceRange?.min || priceRange.min,
                parseInt(e.target.value)
              )}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{priceRange.min} EUR</span>
              <span>{filters.priceRange?.max || priceRange.max} EUR</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
