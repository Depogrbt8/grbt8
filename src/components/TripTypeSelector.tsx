"use client";

import { useState } from 'react';

interface TripTypeSelectorProps {
  tripType: string;
  onTripTypeChange: (type: string) => void;
  directOnly: boolean;
  onDirectOnlyChange: (direct: boolean) => void;
  isMobile?: boolean;
  className?: string;
}

export default function TripTypeSelector({
  tripType,
  onTripTypeChange,
  directOnly,
  onDirectOnlyChange,
  isMobile = false,
  className = ""
}: TripTypeSelectorProps) {
  // Desktop versiyonu
  if (!isMobile) {
    return (
      <div className={`flex flex-wrap items-start gap-6 mb-8 ${className}`}>
        <div className="flex gap-4">
          {/* Tek yön */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="radio"
              name="tripType"
              value="oneWay"
              checked={tripType === 'oneWay'}
              onChange={e => onTripTypeChange(e.target.value)}
              className="hidden peer accent-green-500"
            />
            <span className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center peer-checked:bg-green-500 transition">
              {tripType === 'oneWay' && <span className="w-2.5 h-2.5 rounded-full bg-white"></span>}
            </span>
            <span className="text-gray-700">Tek yön</span>
          </label>
          {/* Gidiş-dönüş */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="radio"
              name="tripType"
              value="roundTrip"
              checked={tripType === 'roundTrip'}
              onChange={e => onTripTypeChange(e.target.value)}
              className="hidden peer accent-green-500"
            />
            <span className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center peer-checked:bg-green-500 transition">
              {tripType === 'roundTrip' && <span className="w-2.5 h-2.5 rounded-full bg-white"></span>}
            </span>
            <span className="text-gray-700">Gidiş-dönüş</span>
          </label>
          {/* Çoklu uçuş */}
          <label className="flex items-center gap-2 cursor-pointer select-none group relative">
            <input
              type="radio"
              name="tripType"
              value="multiCity"
              checked={tripType === 'multiCity'}
              onChange={e => onTripTypeChange(e.target.value)}
              className="hidden peer accent-green-500"
            />
            <span className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center peer-checked:bg-green-500 transition">
              {tripType === 'multiCity' && <span className="w-2.5 h-2.5 rounded-full bg-white"></span>}
            </span>
            <span className="text-gray-700">Çoklu uçuş</span>
          </label>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <input
            type="checkbox"
            checked={directOnly}
            onChange={e => onDirectOnlyChange(e.target.checked)}
            className="accent-green-500"
            id="directOnly"
          />
          <label htmlFor="directOnly" className="text-gray-700 cursor-pointer">Aktarmasız</label>
        </div>
      </div>
    );
  }

  // Mobil versiyonu
  return (
    <div className={`flex items-center w-full gap-3 mb-0 mt-0 ${className}`}>
      <div className="flex gap-3 flex-shrink-0 items-center">
        {/* Tek yön */}
        <label className="flex items-center gap-1 cursor-pointer select-none text-[14px] font-normal">
          <input
            type="radio"
            name="tripTypeMobile"
            value="oneWay"
            checked={tripType === 'oneWay'}
            onChange={() => onTripTypeChange('oneWay')}
            className="hidden peer"
          />
          <span className="w-4 h-4 rounded-full border-2 border-green-500 flex items-center justify-center peer-checked:bg-green-500 transition">
            {tripType === 'oneWay' && <span className="w-2 h-2 rounded-full bg-white"></span>}
          </span>
          <span className="text-[#23272F]">Tek yön</span>
        </label>
        {/* Gidiş-dönüş */}
        <label className="flex items-center gap-1 cursor-pointer select-none text-[14px] font-normal">
          <input
            type="radio"
            name="tripTypeMobile"
            value="roundTrip"
            checked={tripType === 'roundTrip'}
            onChange={() => onTripTypeChange('roundTrip')}
            className="hidden peer"
          />
          <span className="w-4 h-4 rounded-full border-2 border-green-500 flex items-center justify-center peer-checked:bg-green-500 transition">
            {tripType === 'roundTrip' && <span className="w-2 h-2 rounded-full bg-white"></span>}
          </span>
          <span className="text-[#23272F]">Gidiş-dönüş</span>
        </label>
      </div>
    </div>
  );
} 