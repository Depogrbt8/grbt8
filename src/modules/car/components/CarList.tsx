'use client';

import CarCard from './CarCard';
import type { Car } from '../types';

interface CarListProps {
  cars: Car[];
  searchToken: string;
  loading?: boolean;
}

export default function CarList({ cars, searchToken, loading }: CarListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-72 h-48 bg-gray-200" />
              <div className="flex-1 p-4 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="grid grid-cols-4 gap-3">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded w-20" />
                  <div className="h-6 bg-gray-200 rounded w-24" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="text-6xl mb-4">🚗</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Araç Bulunamadı
        </h3>
        <p className="text-gray-600">
          Arama kriterlerinize uygun araç bulunamadı. Lütfen farklı tarih veya lokasyon deneyin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 md:space-y-4">
      {cars.map(car => (
        <CarCard key={car.id} car={car} searchToken={searchToken} />
      ))}
    </div>
  );
}
