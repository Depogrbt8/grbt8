'use client';

import { CarReservation } from '@/types/travel';

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

  return (
    <div className="border rounded-xl sm:p-4 p-2 bg-gray-50">
      <div className="flex gap-3 sm:gap-4 items-stretch">
        {/* Sol: araç ikonu / görsel alanı */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-white flex items-center justify-center text-3xl">
          <span role="img" aria-hidden>
            🚗
          </span>
        </div>

        {/* Sağ: araç özet bilgileri */}
        <div className="flex-1 flex justify-between">
          <div className="min-w-0">
            <div className="font-semibold sm:text-lg text-base text-gray-900">{car.car}</div>
            <div className="text-xs text-gray-500 mt-0.5">Rez. No: {car.reservationNo}</div>

            <div className="mt-1 text-sm text-gray-600">
              Alış: {car.pickupLocation} ({car.pickupCity}) {formatDate(car.pickupDate)} {car.pickupTime}
            </div>
            <div className="text-sm text-gray-600">
              Bırakış: {car.dropoffLocation} ({car.dropoffCity}) {formatDate(car.dropoffDate)} {car.dropoffTime}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Kiralayan: {car.renter}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 ml-2">
            <div className="sm:text-lg text-base font-bold text-gray-800">{car.price}</div>
            <div className="text-xs text-green-600">{car.status}</div>
            <button
              type="button"
              className="mt-2 px-4 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
              onClick={() => onToggleDetail(car.id)}
            >
              {isOpen ? 'Kapat' : 'Detay'}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 p-4 bg-white rounded-xl border text-left">
          <div className="mb-2 text-base font-semibold text-gray-700">Araç Bilgileri</div>
          <div className="mb-2 text-sm text-gray-700"><b>Plaka:</b> {car.plate}</div>
          <div className="mb-2 text-sm text-gray-700"><b>Rezervasyon No:</b> {car.reservationNo}</div>
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