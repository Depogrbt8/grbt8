'use client';

import { useState } from 'react';
import type { GuestInfo } from '../../types';
import GuestForm from './GuestForm';
import HotelPriceSummary from './HotelPriceSummary';

interface HotelBookingFormProps {
  hotelName: string;
  roomName: string;
  rateName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: { adults: number; children: number; rooms: number };
  totalPrice: number;
  currency: string;
  onSubmit: (guestInfo: GuestInfo, specialRequests?: string) => void;
  isLoading?: boolean;
}

export default function HotelBookingForm({
  hotelName,
  roomName,
  rateName,
  checkIn,
  checkOut,
  nights,
  guests,
  totalPrice,
  currency,
  onSubmit,
  isLoading = false
}: HotelBookingFormProps) {
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [specialRequests, setSpecialRequests] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Form validasyonu
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!guestInfo.firstName || guestInfo.firstName.length < 2) {
      newErrors.firstName = 'Ad en az 2 karakter olmalıdır';
    }
    if (!guestInfo.lastName || guestInfo.lastName.length < 2) {
      newErrors.lastName = 'Soyad en az 2 karakter olmalıdır';
    }
    if (!guestInfo.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestInfo.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    if (!guestInfo.phone || guestInfo.phone.length < 10) {
      newErrors.phone = 'Geçerli bir telefon numarası giriniz';
    }
    if (!agreedToTerms) {
      newErrors.terms = 'Şartları kabul etmelisiniz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form gönderme
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(guestInfo, specialRequests || undefined);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol taraf - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Misafir bilgileri */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Misafir Bilgileri</h2>
            <GuestForm
              guestInfo={guestInfo}
              onChange={setGuestInfo}
              errors={errors}
            />
          </div>

          {/* Özel istekler */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Özel İstekler</h2>
            <p className="text-sm text-gray-500 mb-3">
              Özel istekleriniz garanti edilmez ancak otel elinizden geleni yapmaya çalışacaktır.
            </p>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Örn: Yüksek katta oda, erken check-in..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm resize-none h-24 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </div>

          {/* Şartlar ve koşullar */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-green-500 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">
                Rezervasyon koşullarını, gizlilik politikasını ve iptal kurallarını okudum ve kabul ediyorum.
              </span>
            </label>
            {errors.terms && (
              <p className="text-red-500 text-sm mt-2">{errors.terms}</p>
            )}
          </div>
        </div>

        {/* Sağ taraf - Özet */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <HotelPriceSummary
              hotelName={hotelName}
              roomName={roomName}
              rateName={rateName}
              checkIn={checkIn}
              checkOut={checkOut}
              nights={nights}
              guests={guests}
              totalPrice={totalPrice}
              currency={currency}
            />

            {/* Rezervasyon butonu */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-green-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'İşleniyor...' : 'Rezervasyonu Tamamla'}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              Ödeme güvenli bağlantı üzerinden yapılacaktır
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}

