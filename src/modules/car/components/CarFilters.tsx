'use client';

import { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
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
  /**
   * Mobilde üstte ekstra bir "Filtreler" butonu göstermeden
   * panel içeriğini doğrudan açık göstermek için.
   * Araç arama sayfasında, sayfanın kendi Filtrele butonu kullanılıyor.
   */
  hideMobileToggle?: boolean;
}

export default function CarFilters({
  filters,
  onFiltersChange,
  suppliers = [],
  priceRange = { min: 0, max: 1000 },
  hideMobileToggle = false
}: CarFiltersProps) {
  // Eğer hideMobileToggle true ise, mobilde içerik varsayılan olarak açık gelsin
  const [isOpen, setIsOpen] = useState(!hideMobileToggle);
  /** Filtre başlıklarına tıklanınca ilgili bölüm açılsın (akordeon) */
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

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
  
  // Mobilde içerik görünürlüğü: toggle gizliyse her zaman açık
  const isContentVisibleOnMobile = hideMobileToggle ? true : isOpen;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Mobil: Filtre butonu (isteğe bağlı). Araç arama sayfasında,
          sayfanın kendi Filtrele butonu kullanıldığı için gizlenebilir. */}
      {!hideMobileToggle && (
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
      )}
      
      {/* Filtre içeriği */}
      <div className={`${isContentVisibleOnMobile ? 'block' : 'hidden'} md:block mt-4 md:mt-0 space-y-6`}>
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
        <div className="border-b border-gray-100 pb-2">
          <button
            type="button"
            onClick={() => toggleSection('category')}
            className="w-full flex items-center justify-between py-2 text-left"
          >
            <h4 className="font-medium text-gray-900">Araç Kategorisi</h4>
            <ChevronDown className={`w-5 h-5 text-gray-500 shrink-0 transition-transform ${openSections.category ? 'rotate-180' : ''}`} />
          </button>
          {openSections.category && (
            <div className="space-y-2 pt-1">
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
          )}
        </div>

        {/* Vites Tipi */}
        <div className="border-b border-gray-100 pb-2">
          <button
            type="button"
            onClick={() => toggleSection('transmission')}
            className="w-full flex items-center justify-between py-2 text-left"
          >
            <h4 className="font-medium text-gray-900">Vites Tipi</h4>
            <ChevronDown className={`w-5 h-5 text-gray-500 shrink-0 transition-transform ${openSections.transmission ? 'rotate-180' : ''}`} />
          </button>
          {openSections.transmission && (
          <div className="space-y-2 pt-1">
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
          )}
        </div>

        {/* Kilometre */}
        <div className="border-b border-gray-100 pb-2">
          <button
            type="button"
            onClick={() => toggleSection('mileage')}
            className="w-full flex items-center justify-between py-2 text-left"
          >
            <h4 className="font-medium text-gray-900">Kilometre</h4>
            <ChevronDown className={`w-5 h-5 text-gray-500 shrink-0 transition-transform ${openSections.mileage ? 'rotate-180' : ''}`} />
          </button>
          {openSections.mileage && (
          <div className="space-y-2 pt-1">
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
          )}
        </div>

        {/* Koltuk Sayısı */}
        <div className="border-b border-gray-100 pb-2">
          <button
            type="button"
            onClick={() => toggleSection('seats')}
            className="w-full flex items-center justify-between py-2 text-left"
          >
            <h4 className="font-medium text-gray-900">Minimum Koltuk</h4>
            <ChevronDown className={`w-5 h-5 text-gray-500 shrink-0 transition-transform ${openSections.seats ? 'rotate-180' : ''}`} />
          </button>
          {openSections.seats && (
          <div className="space-y-2 pt-1">
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
          )}
        </div>

        {/* Özellikler */}
        <div className="border-b border-gray-100 pb-2">
          <button
            type="button"
            onClick={() => toggleSection('features')}
            className="w-full flex items-center justify-between py-2 text-left"
          >
            <h4 className="font-medium text-gray-900">Özellikler</h4>
            <ChevronDown className={`w-5 h-5 text-gray-500 shrink-0 transition-transform ${openSections.features ? 'rotate-180' : ''}`} />
          </button>
          {openSections.features && (
          <div className="space-y-2 pt-1">
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
          )}
        </div>

        {/* Tedarikçiler */}
        {suppliers.length > 0 && (
          <div className="border-b border-gray-100 pb-2">
            <button
              type="button"
              onClick={() => toggleSection('suppliers')}
              className="w-full flex items-center justify-between py-2 text-left"
            >
              <h4 className="font-medium text-gray-900">Tedarikçi</h4>
              <ChevronDown className={`w-5 h-5 text-gray-500 shrink-0 transition-transform ${openSections.suppliers ? 'rotate-180' : ''}`} />
            </button>
            {openSections.suppliers && (
            <div className="space-y-2 pt-1">
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
            )}
          </div>
        )}

        {/* Fiyat Aralığı */}
        <div className="border-b border-gray-100 pb-2">
          <button
            type="button"
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between py-2 text-left"
          >
            <h4 className="font-medium text-gray-900">Fiyat Aralığı</h4>
            <ChevronDown className={`w-5 h-5 text-gray-500 shrink-0 transition-transform ${openSections.price ? 'rotate-180' : ''}`} />
          </button>
          {openSections.price && (
          <div className="space-y-3 pt-1">
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
          )}
        </div>
      </div>
    </div>
  );
}
