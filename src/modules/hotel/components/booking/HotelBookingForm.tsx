'use client';

import React, { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import type { ContactInfo, HotelGuest } from '../../types';
import GuestInfoSection from './GuestInfoSection';
import ContactForm from '@/components/booking/ContactForm';
import type { Session } from 'next-auth';

export type HotelBookingSubmitPayload = {
  contactInfo: ContactInfo;
  guestDetails: HotelGuest[];
  specialRequests?: string;
};

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
  onSubmit: (payload: HotelBookingSubmitPayload) => void;
  isLoading?: boolean;
  session?: Session | null;
  onLoginClick?: () => void;
}

const HotelBookingForm = React.forwardRef<HTMLFormElement, HotelBookingFormProps>(({
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
  isLoading = false,
  session,
  onLoginClick
}, ref) => {
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+90');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');
  const [guestDetails, setGuestDetails] = useState<HotelGuest[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setContactEmail(session.user?.email || '');
      setContactPhone((session.user as any)?.phone || '');
    }
  }, [session]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const total = guests.adults + guests.children;

    for (let i = 0; i < Math.min(guests.adults, guestDetails.length); i++) {
      const g = guestDetails[i];
      if (!g) continue;
      if (!g.firstName?.trim() || g.firstName.trim().length < 2) {
        newErrors[`guest_${i}_firstName`] = 'Ad en az 2 karakter olmalıdır';
      }
      if (!g.lastName?.trim() || g.lastName.trim().length < 2) {
        newErrors[`guest_${i}_lastName`] = 'Soyad en az 2 karakter olmalıdır';
      }
    }

    for (let i = guests.adults; i < total && i < guestDetails.length; i++) {
      const g = guestDetails[i];
      if (!g) continue;
      if (!g.firstName?.trim() || g.firstName.trim().length < 2) {
        newErrors[`guest_${i}_firstName`] = 'Ad en az 2 karakter olmalıdır';
      }
      if (!g.lastName?.trim() || g.lastName.trim().length < 2) {
        newErrors[`guest_${i}_lastName`] = 'Soyad en az 2 karakter olmalıdır';
      }
    }

    if (!agreedToTerms) {
      newErrors.terms = 'Şartları kabul etmelisiniz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit({
        contactInfo: {
          email: contactEmail,
          phone: contactPhone,
          countryCode
        },
        guestDetails,
        specialRequests: specialRequests || undefined
      });
    }
  };

  return (
    <form ref={ref} onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-3">
              <Mail className="w-5 h-5" /> İletişim Bilgileri
            </h2>
            {!session && onLoginClick && (
              <p className="text-sm text-gray-600">
                Hızlı rezervasyon için{' '}
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="text-green-600 font-semibold underline hover:text-green-700 transition"
                >
                  giriş yap
                </button>
              </p>
            )}
          </div>
          <ContactForm
            userEmail={contactEmail}
            userPhone={contactPhone}
            onEmailChange={setContactEmail}
            onPhoneChange={setContactPhone}
            onCountryCodeChange={setCountryCode}
            marketingConsent={marketingConsent}
            onMarketingConsentChange={setMarketingConsent}
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Misafir Bilgileri</h2>
          <p className="text-sm text-gray-500 mb-4">
            {guests.adults} yetişkin{guests.children > 0 ? `, ${guests.children} çocuk` : ''} için bilgileri girin.
          </p>
          <GuestInfoSection
            guests={guests}
            guestDetails={guestDetails}
            onChange={setGuestDetails}
            errors={errors}
          />
        </div>

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
    </form>
  );
});

HotelBookingForm.displayName = 'HotelBookingForm';

export default HotelBookingForm;
