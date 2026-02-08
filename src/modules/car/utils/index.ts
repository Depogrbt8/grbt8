// Araç Kiralama Utility Functions

import type { CarCategory } from '../types';
import { CAR_CATEGORY_LABELS } from '../types';

/**
 * Fiyat formatlama
 */
export function formatPrice(amount: number, currency: string = 'EUR'): string {
  return `${amount.toLocaleString('tr-TR')} ${currency}`;
}

/**
 * Kategori label'ını getir
 */
export function getCategoryLabel(category: CarCategory): string {
  return CAR_CATEGORY_LABELS[category] || category;
}

/**
 * Tarih formatlama
 */
export function formatDate(dateString: string, format: 'short' | 'long' = 'short'): string {
  const date = new Date(dateString);
  
  if (format === 'short') {
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Tarih aralığı formatlama
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return `${start.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short'
  })} - ${end.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })}`;
}

/**
 * Gün sayısını hesapla
 */
export function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Puan rengi
 */
export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return 'bg-green-600';
  if (rating >= 4.0) return 'bg-blue-600';
  if (rating >= 3.5) return 'bg-yellow-600';
  return 'bg-gray-600';
}

/**
 * Puan metni
 */
export function getRatingText(rating: number): string {
  if (rating >= 4.5) return 'Mükemmel';
  if (rating >= 4.0) return 'Çok İyi';
  if (rating >= 3.5) return 'İyi';
  if (rating >= 3.0) return 'Orta';
  return 'Zayıf';
}

/**
 * URL parametrelerini parse et
 */
export function parseSearchParams(searchParams: URLSearchParams) {
  return {
    pickupLocationId: searchParams.get('pickupLocationId') || '',
    dropoffLocationId: searchParams.get('dropoffLocationId') || '',
    pickupDate: searchParams.get('pickupDate') || '',
    pickupTime: searchParams.get('pickupTime') || '10:00',
    dropoffDate: searchParams.get('dropoffDate') || '',
    dropoffTime: searchParams.get('dropoffTime') || '10:00',
    driverAge: parseInt(searchParams.get('driverAge') || '30')
  };
}

/**
 * Arama URL'i oluştur
 */
export function buildSearchUrl(params: {
  pickupLocationId: string;
  dropoffLocationId: string;
  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;
  driverAge: number;
}): string {
  const searchParams = new URLSearchParams({
    pickupLocationId: params.pickupLocationId,
    dropoffLocationId: params.dropoffLocationId,
    pickupDate: params.pickupDate,
    pickupTime: params.pickupTime,
    dropoffDate: params.dropoffDate,
    dropoffTime: params.dropoffTime,
    driverAge: params.driverAge.toString()
  });
  
  return `/cars/search?${searchParams.toString()}`;
}

/**
 * Yaş kontrolü
 */
export function checkDriverAge(age: number, minimumAge: number): {
  valid: boolean;
  message?: string;
} {
  if (age < minimumAge) {
    return {
      valid: false,
      message: `Minimum sürücü yaşı ${minimumAge} olmalıdır.`
    };
  }
  
  if (age < 18) {
    return {
      valid: false,
      message: 'Sürücü en az 18 yaşında olmalıdır.'
    };
  }
  
  if (age > 99) {
    return {
      valid: false,
      message: 'Geçersiz yaş.'
    };
  }
  
  return { valid: true };
}

/**
 * Ehliyet yaşı kontrolü
 */
export function checkLicenseAge(issueDate: string, minimumYears: number): {
  valid: boolean;
  message?: string;
} {
  const issue = new Date(issueDate);
  const now = new Date();
  const years = (now.getTime() - issue.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  
  if (years < minimumYears) {
    return {
      valid: false,
      message: `Ehliyet en az ${minimumYears} yıllık olmalıdır.`
    };
  }
  
  return { valid: true };
}

/**
 * Telefon numarası formatlama
 */
export function formatPhoneNumber(countryCode: string, phone: string): string {
  return `${countryCode} ${phone}`;
}

/**
 * Rezervasyon numarası oluştur
 */
export function generateBookingNumber(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `GRB-CAR-${timestamp}${random}`;
}

/**
 * Durum badge rengi
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'no_show':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Durum metni
 */
export function getStatusText(status: string): string {
  switch (status) {
    case 'confirmed':
      return 'Onaylandı';
    case 'pending':
      return 'Beklemede';
    case 'cancelled':
      return 'İptal Edildi';
    case 'completed':
      return 'Tamamlandı';
    case 'no_show':
      return 'Gelmedi';
    default:
      return status;
  }
}
