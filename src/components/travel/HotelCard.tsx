'use client';

import { useState } from 'react';
import { HotelReservation } from '@/types/travel';

interface HotelCardProps {
  hotel: HotelReservation;
  openDetailId: string | null;
  onToggleDetail: (hotelId: string) => void;
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

export default function HotelCard({ hotel, openDetailId, onToggleDetail }: HotelCardProps) {
  const [imgError, setImgError] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const checkIn = hotel.checkIn ? new Date(hotel.checkIn) : null;
  const checkOut = hotel.checkOut ? new Date(hotel.checkOut) : null;
  const nights = checkIn && checkOut ? Math.max(0, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (24 * 60 * 60 * 1000))) : null;

  const isOpen = openDetailId === hotel.id;
  const guestsList = Array.isArray(hotel.guests) ? hotel.guests : [];
  const imageSrc = hotel.imageUrl || '/images/blog/turkey-hotels.jpg';

  return (
    <div className="border rounded-xl sm:p-4 p-2 bg-gray-50">
      <div className="flex gap-3 sm:gap-4">
        {/* Sol: otel görseli */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
          {!imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={hotel.hotelName}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl" aria-hidden>🏨</div>
          )}
        </div>
        {/* Sağ: otel adı, tarih, gece, rez no, durum, detay */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="font-bold sm:text-lg text-base text-gray-900">{hotel.hotelName}</div>
            <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-0.5">
              <CalendarIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span>{formatDate(hotel.checkIn)} - {formatDate(hotel.checkOut)}</span>
            </div>
            {nights != null && <div className="text-sm text-gray-600">{nights} gece</div>}
            <div className="text-xs text-gray-500 mt-1">Rez. No: {hotel.reservationNo}</div>
          </div>
          <div className="flex items-center justify-between gap-2 mt-2">
            <span className="text-xs text-green-600 font-medium">{hotel.status}</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-sm sm:text-base">{hotel.price}</span>
              <button
                type="button"
                className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-300"
                onClick={() => onToggleDetail(hotel.id)}
              >
                {isOpen ? 'Kapat' : 'Detay'}
              </button>
            </div>
          </div>
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