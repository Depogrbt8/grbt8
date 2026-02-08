'use client';

import { HotelReservation } from '@/types/travel';

interface HotelCardProps {
  hotel: HotelReservation;
  openDetailId: string | null;
  onToggleDetail: (hotelId: string) => void;
}

export default function HotelCard({ hotel, openDetailId, onToggleDetail }: HotelCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const isOpen = openDetailId === hotel.id;
  const guestsList = Array.isArray(hotel.guests) ? hotel.guests : [];
  const guestNames = guestsList.map(g => (g.name || '').trim()).filter(Boolean).join(', ') || '—';

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-base sm:text-lg text-gray-900">{hotel.hotelName}</div>
          {hotel.location && (
            <div className="text-sm text-gray-500 mt-0.5">{hotel.location}</div>
          )}
          <div className="text-sm text-gray-600 mt-2">
            {formatDate(hotel.checkIn)} – {formatDate(hotel.checkOut)}
            {hotel.checkInTime && hotel.checkOutTime && (
              <span className="text-gray-500"> · {hotel.checkInTime} / {hotel.checkOutTime}</span>
            )}
          </div>
          <div className="text-sm text-gray-600 mt-0.5">Oda: {hotel.roomType}</div>
          {guestNames !== '—' && (
            <div className="text-sm text-gray-600 mt-0.5">Konuklar: {guestNames}</div>
          )}
        </div>
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
          <div className="text-lg font-bold text-gray-800">{hotel.price}</div>
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">{hotel.status}</span>
          <button
            type="button"
            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 active:bg-green-800 min-h-[2.25rem]"
            onClick={() => onToggleDetail(hotel.id)}
          >
            {isOpen ? 'Kapat' : 'Detay'}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-gray-100 text-left space-y-2">
          <div className="text-sm font-medium text-gray-700">Rezervasyon No: {hotel.reservationNo}</div>
          <div className="text-sm text-gray-600"><span className="font-medium">Fiyat:</span> {hotel.price}</div>
          {hotel.rules && (
            <div className="text-sm text-gray-600"><span className="font-medium">İptal:</span> {hotel.rules}</div>
          )}
          {hotel.notes && (
            <div className="text-sm text-gray-600"><span className="font-medium">Not:</span> {hotel.notes}</div>
          )}
          {guestNames !== '—' && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Konuklar:</span>{' '}
              {guestsList.map(g => `${g.name || ''} (${g.type || 'Yetişkin'})`).filter(Boolean).join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 