'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import type { HotelGuest } from '../../types';

interface PassengerOption {
  id: string;
  firstName: string;
  lastName: string;
  identityNumber?: string | null;
  isForeigner: boolean;
  gender?: string | null;
  birthDay?: string | null;
  birthMonth?: string | null;
  birthYear?: string | null;
}

interface GuestInfoSectionProps {
  guests: { adults: number; children: number; rooms: number };
  guestDetails: HotelGuest[];
  onChange: (details: HotelGuest[]) => void;
  errors?: Record<string, string>;
}

const createEmptyGuest = (type: 'adult' | 'child'): HotelGuest => ({
  type,
  firstName: '',
  lastName: '',
  identityNumber: '',
  isForeigner: false,
  gender: type === 'adult' ? 'male' : undefined
});

export default function GuestInfoSection({
  guests,
  guestDetails,
  onChange,
  errors = {}
}: GuestInfoSectionProps) {
  const [passengerOptions, setPassengerOptions] = useState<PassengerOption[]>([]);

  useEffect(() => {
    async function fetchPassengers() {
      try {
        const res = await fetch('/api/passengers');
        if (res.ok) {
          const data = await res.json();
          setPassengerOptions(data);
        }
      } catch {
        // Kullanıcı giriş yapmamış olabilir
      }
    }
    fetchPassengers();
  }, []);

  // guests sayısı değişirse guestDetails ve expanded state güncelle
  useEffect(() => {
    const total = guests.adults + guests.children;
    const current = guestDetails.length;
    if (current < total) {
      const next = [...guestDetails];
      for (let i = current; i < total; i++) {
        next.push(createEmptyGuest(i < guests.adults ? 'adult' : 'child'));
      }
      onChange(next);
    } else if (current > total) {
      onChange(guestDetails.slice(0, total));
    }
  }, [guests.adults, guests.children]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateGuest = (index: number, updates: Partial<HotelGuest>) => {
    const next = [...guestDetails];
    if (!next[index]) next[index] = createEmptyGuest(index < guests.adults ? 'adult' : 'child');
    next[index] = { ...next[index], ...updates };
    onChange(next);
  };

  const handleSelectPassenger = (guestIndex: number, passengerId: string) => {
    const p = passengerOptions.find((x) => x.id === passengerId);
    if (!p) return;
    updateGuest(guestIndex, {
      firstName: p.firstName,
      lastName: p.lastName,
      identityNumber: p.identityNumber || undefined,
      isForeigner: p.isForeigner,
      gender: (p.gender as 'male' | 'female') || undefined,
      birthDay: p.birthDay || undefined,
      birthMonth: p.birthMonth || undefined,
      birthYear: p.birthYear || undefined,
      passengerId
    });
  };

  const totalGuests = guests.adults + guests.children;
  const guestList = guestDetails.length >= totalGuests
    ? guestDetails.slice(0, totalGuests)
    : [
        ...guestDetails,
        ...Array.from(
          { length: Math.max(0, totalGuests - guestDetails.length) },
          (_, i) => createEmptyGuest(guestDetails.length + i < guests.adults ? 'adult' : 'child')
        )
      ].slice(0, totalGuests);

  let guestIndex = 0;

  return (
    <div className="space-y-6">
      {/* Yetişkinler */}
      {Array.from({ length: guests.adults }).map((_, i) => {
        const idx = guestIndex++;
        const guest = guestList[idx] || createEmptyGuest('adult');

        return (
          <div key={`adult-${i}`} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
            {/* Başlık + Listemden Seç (aynı satırda, üstte - ayrı kutu değil) */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="font-semibold text-gray-800">{i + 1}. Yetişkin</h3>
              <label className="flex items-center gap-1 cursor-pointer group">
                <select
                  value={guest.passengerId || ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v) handleSelectPassenger(idx, v);
                  }}
                  className="text-sm text-gray-600 bg-transparent border-none py-1 pr-1 cursor-pointer appearance-none focus:outline-none focus:ring-0 group-hover:text-green-600 [&>option]:bg-white [&>option]:text-gray-900"
                >
                  <option value="">Listemden Seç</option>
                  {passengerOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-green-500 shrink-0" />
              </label>
            </div>

            {/* Ad, Soyad - yan yana */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                <input
                  type="text"
                  value={guest.firstName}
                  onChange={(e) => updateGuest(idx, { firstName: e.target.value })}
                  placeholder="Ad"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm ${
                    errors[`guest_${idx}_firstName`]
                      ? 'border-red-500'
                      : 'border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-200'
                  }`}
                />
                {errors[`guest_${idx}_firstName`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`guest_${idx}_firstName`]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
                <input
                  type="text"
                  value={guest.lastName}
                  onChange={(e) => updateGuest(idx, { lastName: e.target.value })}
                  placeholder="Soyad"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm ${
                    errors[`guest_${idx}_lastName`]
                      ? 'border-red-500'
                      : 'border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-200'
                  }`}
                />
                {errors[`guest_${idx}_lastName`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`guest_${idx}_lastName`]}</p>
                )}
              </div>
            </div>

            {/* TC vatandaşı değil + TC Kimlik / Pasaport + Cinsiyet - tek satırda düzenli */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
              <label className="flex items-center gap-2 min-h-[42px]">
                <input
                  type="checkbox"
                  checked={guest.isForeigner}
                  onChange={(e) => updateGuest(idx, { isForeigner: e.target.checked })}
                  className="w-4 h-4 rounded text-green-500 focus:ring-green-500 border-gray-300"
                />
                <span className="text-sm text-gray-700">T.C. vatandaşı değil</span>
              </label>
              {!guest.isForeigner ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TC Kimlik No</label>
                  <input
                    type="text"
                    value={guest.identityNumber || ''}
                    onChange={(e) => updateGuest(idx, { identityNumber: e.target.value })}
                    maxLength={11}
                    placeholder="11 haneli"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-green-500 focus:ring-1 focus:ring-green-200"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pasaport No</label>
                  <input
                    type="text"
                    value={guest.passportNumber || ''}
                    onChange={(e) => updateGuest(idx, { passportNumber: e.target.value })}
                    placeholder="Pasaport numarası"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-green-500 focus:ring-1 focus:ring-green-200"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cinsiyet</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={guest.gender === 'male'}
                      onChange={() => updateGuest(idx, { gender: 'male' })}
                      className="w-4 h-4 text-green-500 focus:ring-green-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Erkek</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={guest.gender === 'female'}
                      onChange={() => updateGuest(idx, { gender: 'female' })}
                      className="w-4 h-4 text-green-500 focus:ring-green-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Kadın</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Çocuklar */}
      {Array.from({ length: guests.children }).map((_, i) => {
        const idx = guestIndex++;
        const guest = guestList[idx] || createEmptyGuest('child');

        return (
          <div key={`child-${i}`} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
            {/* Başlık + Listemden Seç (aynı satırda, üstte - ayrı kutu değil) */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="font-semibold text-gray-800">{i + 1}. Çocuk</h3>
              <label className="flex items-center gap-1 cursor-pointer group">
                <select
                  value={guest.passengerId || ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v) handleSelectPassenger(idx, v);
                  }}
                  className="text-sm text-gray-600 bg-transparent border-none py-1 pr-1 cursor-pointer appearance-none focus:outline-none focus:ring-0 group-hover:text-green-600 [&>option]:bg-white [&>option]:text-gray-900"
                >
                  <option value="">Listemden Seç</option>
                  {passengerOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-green-500 shrink-0" />
              </label>
            </div>

            {/* Ad, Soyad - yan yana */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                <input
                  type="text"
                  value={guest.firstName}
                  onChange={(e) => updateGuest(idx, { firstName: e.target.value })}
                  placeholder="Ad"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm ${
                    errors[`guest_${idx}_firstName`]
                      ? 'border-red-500'
                      : 'border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-200'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
                <input
                  type="text"
                  value={guest.lastName}
                  onChange={(e) => updateGuest(idx, { lastName: e.target.value })}
                  placeholder="Soyad"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm ${
                    errors[`guest_${idx}_lastName`]
                      ? 'border-red-500'
                      : 'border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-200'
                  }`}
                />
              </div>
            </div>

            {/* TC vatandaşı değil + TC Kimlik / Pasaport */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <label className="flex items-center gap-2 min-h-[42px]">
                <input
                  type="checkbox"
                  checked={guest.isForeigner}
                  onChange={(e) => updateGuest(idx, { isForeigner: e.target.checked })}
                  className="w-4 h-4 rounded text-green-500 focus:ring-green-500 border-gray-300"
                />
                <span className="text-sm text-gray-700">T.C. vatandaşı değil</span>
              </label>
              {!guest.isForeigner ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TC Kimlik No</label>
                  <input
                    type="text"
                    value={guest.identityNumber || ''}
                    onChange={(e) => updateGuest(idx, { identityNumber: e.target.value })}
                    maxLength={11}
                    placeholder="11 haneli"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-green-500 focus:ring-1 focus:ring-green-200"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pasaport No</label>
                  <input
                    type="text"
                    value={guest.passportNumber || ''}
                    onChange={(e) => updateGuest(idx, { passportNumber: e.target.value })}
                    placeholder="Pasaport numarası"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-green-500 focus:ring-1 focus:ring-green-200"
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
