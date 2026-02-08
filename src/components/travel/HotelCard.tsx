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
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isOpen = openDetailId === hotel.id;
  const guestsList = Array.isArray(hotel.guests) ? hotel.guests : [];
  const guestNames = guestsList.map(g => (g.name || '').trim()).filter(Boolean).join(', ') || '—';

  return (
    <div className="border rounded-xl sm:p-4 p-2 bg-gray-50">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-bold sm:text-lg text-base text-gray-900">{hotel.hotelName}</div>
          <div className="text-sm text-gray-600">
            {formatDate(hotel.checkIn)} • {hotel.checkInTime || '14:00'} / {hotel.checkOutTime || '12:00'} • {hotel.roomType}
          </div>
          <div className="text-xs text-gray-500 mt-1">Rez. No: {hotel.reservationNo}</div>
          <div className="text-xs text-gray-500">
            Konuklar: {guestNames}
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold sm:text-xl text-base text-gray-900">{hotel.price}</div>
          <div className="text-xs text-green-600">{hotel.status}</div>
          <button
            type="button"
            className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-300 mt-1"
            onClick={() => onToggleDetail(hotel.id)}
          >
            {isOpen ? 'Kapat' : 'Detay'}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="mb-2 text-sm font-semibold text-gray-700">Konuklar</div>
          {guestsList.length > 0 ? (
            <table className="w-full mb-2 text-xs">
              <thead>
                <tr className="text-gray-500">
                  <th className="text-left py-1">Ad Soyad</th>
                  <th className="text-left py-1">Tip</th>
                </tr>
              </thead>
              <tbody>
                {guestsList.map((g, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="py-1">{(g.name || '').trim() || '—'}</td>
                    <td className="py-1">{g.type === 'child' ? 'Çocuk' : 'Yetişkin'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-xs text-gray-500 mb-2">Konuk bilgisi yok</div>
          )}
          <div className="grid grid-cols-2 gap-1 mb-2 text-xs text-gray-700">
            <div><b>Rezervasyon No:</b> {hotel.reservationNo}</div>
            <div><b>Otel:</b> {hotel.hotelName}</div>
            <div><b>Giriş:</b> {formatDate(hotel.checkIn)} {hotel.checkInTime || '14:00'}</div>
            <div><b>Çıkış:</b> {formatDate(hotel.checkOut)} {hotel.checkOutTime || '12:00'}</div>
            <div><b>Oda:</b> {hotel.roomType}</div>
            <div><b>Durum:</b> {hotel.status}</div>
            <div><b>Fiyat:</b> {hotel.price}</div>
          </div>
          {hotel.rules && (
            <div className="mb-2 text-xs text-gray-700"><b>İptal:</b> {hotel.rules}</div>
          )}
          {hotel.notes && (
            <div className="text-xs text-gray-700"><b>Not:</b> {hotel.notes}</div>
          )}
        </div>
      )}
    </div>
  );
} 