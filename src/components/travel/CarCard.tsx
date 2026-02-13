'use client';

import { CarReservation } from '@/types/travel';
import { useState } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface CarCardProps {
  car: CarReservation;
  openDetailId: string | null;
  onToggleDetail: (carId: string) => void;
}

export default function CarCard({ car, openDetailId, onToggleDetail }: CarCardProps) {
  const isOpen = openDetailId === car.id;
  const [imgError, setImgError] = useState(false);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  };

  const imageSrc = !imgError && car.imageUrl ? car.imageUrl : undefined;

  return (
    <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5">
        {/* Üst: Araç görseli + ad, kategori, rez no */}
        <div className="flex gap-4">
          <div className="w-24 h-20 sm:w-28 sm:h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
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
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 truncate">{car.car}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{car.type}</p>
            <p className="text-sm text-gray-500 mt-0.5 truncate">Rez. No: {car.reservationNo}</p>
          </div>
        </div>

        {/* Orta: Alış / Teslim timeline */}
        <div className="mt-5 flex">
          <div className="flex flex-col items-center mr-3">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" aria-hidden />
            <div className="w-0.5 flex-1 min-h-[24px] bg-gray-200 my-0.5" aria-hidden />
            <div className="w-2.5 h-2.5 rounded-full bg-gray-400 flex-shrink-0" aria-hidden />
          </div>
          <div className="flex-1 min-w-0 space-y-4">
            <div>
              <p className="font-semibold text-gray-900 text-sm">Alış</p>
              <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-700">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{formatDate(car.pickupDate)}</span>
                <span className="text-gray-400">·</span>
                <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{car.pickupTime}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{car.pickupLocation}</span>
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Teslim</p>
              <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-700">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{formatDate(car.dropoffDate)}</span>
                <span className="text-gray-400">·</span>
                <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{car.dropoffTime}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{car.dropoffLocation}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alt: Fiyat, durum, Detay butonu */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <span className="text-lg font-bold text-gray-900">{car.price}</span>
          <span className="text-sm font-medium text-green-600">{car.status}</span>
          <button
            type="button"
            className="ml-auto text-sm bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-300 shrink-0"
            onClick={() => onToggleDetail(car.id)}
          >
            {isOpen ? 'Kapat' : 'Detay'}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="px-4 sm:px-5 pb-4 pt-0">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-left">
            <div className="mb-2 text-base font-semibold text-gray-700">Araç Bilgileri</div>
            <div className="mb-2 text-sm text-gray-700"><b>Plaka:</b> {car.plate || '—'}</div>
            <div className="mb-2 text-sm text-gray-700"><b>Rezervasyon No:</b> {car.reservationNo}</div>
            <div className="mb-2 text-sm text-gray-700"><b>Kiralayan:</b> {car.renter}</div>
            <div className="mb-2 text-sm text-gray-700"><b>Durum:</b> {car.status}</div>
            <div className="mb-2 text-sm text-gray-700"><b>Ödeme:</b> {car.payment}</div>
            <div className="mb-2 text-sm text-gray-700">
              <b>Ek Hizmetler:</b> {car.services?.length ? car.services.join(', ') : 'Yok'}
            </div>
            <div className="mb-2 text-sm text-gray-700"><b>Kurallar:</b> {car.rules}</div>
            <div className="mb-2 text-sm text-gray-700"><b>Ofis Tel:</b> {car.officePhone || '—'}</div>
            <div className="mb-2 text-sm text-gray-700"><b>Notlar:</b> {car.notes || '—'}</div>
          </div>
        </div>
      )}
    </div>
  );
}
