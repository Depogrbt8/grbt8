// Otel Modülü - Validasyon Fonksiyonları

import type { GuestInfo, HotelSearchParams } from '../types';

/**
 * Email validasyonu
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Telefon validasyonu (Türkiye formatı)
 */
export function isValidPhone(phone: string): boolean {
  // +90 ile başlayabilir, 10-11 haneli
  const cleanPhone = phone.replace(/\s/g, '').replace(/[()-]/g, '');
  const phoneRegex = /^(\+90|0)?[0-9]{10}$/;
  return phoneRegex.test(cleanPhone);
}

/**
 * Tarih validasyonu
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Check-in tarihi bugün veya sonra mı?
 */
export function isValidCheckIn(checkIn: string): boolean {
  if (!isValidDate(checkIn)) return false;
  
  const checkInDate = new Date(checkIn);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return checkInDate >= today;
}

/**
 * Check-out tarihi check-in'den sonra mı?
 */
export function isValidCheckOut(checkIn: string, checkOut: string): boolean {
  if (!isValidDate(checkIn) || !isValidDate(checkOut)) return false;
  
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  return checkOutDate > checkInDate;
}

/**
 * Misafir bilgileri validasyonu
 */
export function validateGuestInfo(info: Partial<GuestInfo>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!info.firstName || info.firstName.trim().length < 2) {
    errors.firstName = 'Ad en az 2 karakter olmalıdır';
  }

  if (!info.lastName || info.lastName.trim().length < 2) {
    errors.lastName = 'Soyad en az 2 karakter olmalıdır';
  }

  if (!info.email || !isValidEmail(info.email)) {
    errors.email = 'Geçerli bir e-posta adresi giriniz';
  }

  if (!info.phone || !isValidPhone(info.phone)) {
    errors.phone = 'Geçerli bir telefon numarası giriniz';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Arama parametreleri validasyonu
 */
export function validateSearchParams(params: Partial<HotelSearchParams>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!params.location || params.location.trim().length < 2) {
    errors.location = 'Konum giriniz';
  }

  if (!params.checkIn) {
    errors.checkIn = 'Giriş tarihi seçiniz';
  } else if (!isValidCheckIn(params.checkIn)) {
    errors.checkIn = 'Geçerli bir giriş tarihi seçiniz';
  }

  if (!params.checkOut) {
    errors.checkOut = 'Çıkış tarihi seçiniz';
  } else if (params.checkIn && !isValidCheckOut(params.checkIn, params.checkOut)) {
    errors.checkOut = 'Çıkış tarihi giriş tarihinden sonra olmalıdır';
  }

  if (!params.guests?.adults || params.guests.adults < 1) {
    errors.adults = 'En az 1 yetişkin gereklidir';
  }

  if (!params.guests?.rooms || params.guests.rooms < 1) {
    errors.rooms = 'En az 1 oda gereklidir';
  }

  // Oda başına maksimum kişi kontrolü
  if (params.guests) {
    const totalGuests = params.guests.adults + (params.guests.children || 0);
    const maxGuestsPerRoom = 4;
    if (totalGuests > params.guests.rooms * maxGuestsPerRoom) {
      errors.rooms = `${totalGuests} misafir için en az ${Math.ceil(totalGuests / maxGuestsPerRoom)} oda gereklidir`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Maksimum konaklama süresi kontrolü
 */
export function validateMaxStay(checkIn: string, checkOut: string, maxNights: number = 30): boolean {
  if (!isValidDate(checkIn) || !isValidDate(checkOut)) return false;
  
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return nights <= maxNights;
}

