'use client';

import { CarReservation } from '@/types/travel';
import { useState } from 'react';

interface CarCardProps {
  car: CarReservation;
  openDetailId: string | null;
  onToggleDetail: (carId: string) => void;
}

export default function CarCard({ car, openDetailId, onToggleDetail }: CarCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isOpen = openDetailId === car.id;
  const [imgError, setImgError] = useState(false);

  const formatDateRangeOneLine = () => {
    const d1 = new Date(car.pickupDate);
    const d2 = new Date(car.dropoffDate);
    const fmt = (d: Date) => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
    return `${fmt(d1)} - ${fmt(d2)} ${d1.getFullYear()}`;
  };

  const imageSrc = !imgError && car.imageUrl ? car.imageUrl : undefined;

  return (
    <div className="border rounded-xl sm:p-4 p-2 bg-gray-50">
      <div className="flex gap-3 sm:gap-4">
        {/* Sol: araç görseli / ikon */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-white flex-shrink-0 flex items-center justify-center">
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={car.car}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span role="img" aria-hidden className="text-3xl">
              🚗
            </span>
          )}
        </div>

        {/* Sağ: araç özet bilgileri */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="font-bold sm:text-lg text-base text-gray-900 truncate">{car.car}</div>
            <div className="text-sm text-gray-600 mt-0.5">{formatDateRangeOneLine()}</div>
            <div className="text-xs text-gray-500 mt-1">Rez. No: {car.reservationNo}</div>
          </div>
          <div className="flex items-center justify-between gap-2 mt-2">
            <span className="text-xs font-medium text-green-600">{car.status}</span>
            <button
              type="button"
              className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-300"
              onClick={() => onToggleDetail(car.id)}
            >
              {isOpen ? 'Kapat' : 'Detay'}
            </button>
          </div>
        </div>
        <div className="flex flex-col items-end justify-end shrink-0">
          <div className="sm:text-lg text-base font-bold text-gray-800">{car.price}</div>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 p-4 bg-white rounded-xl border text-left">
          <div className="mb-2 text-base font-semibold text-gray-700">Araç Bilgileri</div>
          <div className="mb-2 text-sm text-gray-700"><b>Plaka:</b> {car.plate}</div>
          <div className="mb-2 text-sm text-gray-700"><b>Rezervasyon No:</b> {car.reservationNo}</div>
          <div className="mb-2 text-sm text-gray-700"><b>Kiralayan:</b> {car.renter}</div>
          <div className="mb-2 text-sm text-gray-700"><b>Durum:</b> {car.status}</div>
          <div className="mb-2 text-sm text-gray-700"><b>Ödeme:</b> {car.payment}</div>
          <div className="mb-2 text-sm text-gray-700">
            <b>Ek Hizmetler:</b> {car.services?.length ? car.services.join(', ') : 'Yok'}
          </div>
          <div className="mb-2 text-sm text-gray-700"><b>Kurallar:</b> {car.rules}</div>
          <div className="mb-2 text-sm text-gray-700"><b>Ofis Tel:</b> {car.officePhone}</div>
          <div className="mb-2 text-sm text-gray-700"><b>Notlar:</b> {car.notes}</div>
        </div>
      )}
    </div>
  );
} 