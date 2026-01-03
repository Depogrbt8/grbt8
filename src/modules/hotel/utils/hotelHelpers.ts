// Otel Modülü - Yardımcı Fonksiyonlar

import type { Hotel, Rate, HotelFilters } from '../types';
import { MEAL_PLAN_LABELS, CANCELLATION_LABELS } from '../types';

/**
 * Fiyatı formatla
 */
export function formatPrice(price: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

/**
 * Tarih formatla (Türkçe)
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

/**
 * Kısa tarih formatla
 */
export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short'
  }).format(date);
}

/**
 * Gece sayısı hesapla
 */
export function getNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Yıldız rating'i yıldız emojisine çevir
 */
export function getStarDisplay(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

/**
 * Review score'u renk sınıfına çevir
 */
export function getScoreColor(score: number): string {
  if (score >= 9) return 'bg-green-600';
  if (score >= 8) return 'bg-green-500';
  if (score >= 7) return 'bg-yellow-500';
  if (score >= 6) return 'bg-orange-500';
  return 'bg-red-500';
}

/**
 * Review score'u metin olarak çevir
 */
export function getScoreText(score: number): string {
  if (score >= 9) return 'Mükemmel';
  if (score >= 8) return 'Çok İyi';
  if (score >= 7) return 'İyi';
  if (score >= 6) return 'Orta';
  return 'Kötü';
}

/**
 * Meal plan etiketini al
 */
export function getMealPlanLabel(mealPlan: string): string {
  return MEAL_PLAN_LABELS[mealPlan] || mealPlan;
}

/**
 * İptal politikası etiketini al
 */
export function getCancellationLabel(policy: string): string {
  return CANCELLATION_LABELS[policy] || policy;
}

/**
 * İptal politikası rengini al
 */
export function getCancellationColor(policy: string): string {
  switch (policy) {
    case 'free':
      return 'text-green-600';
    case 'partial':
      return 'text-yellow-600';
    case 'non-refundable':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Mesafe formatla
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * En düşük fiyatlı rate'i bul
 */
export function getLowestRate(rates: Rate[]): Rate | null {
  if (!rates || rates.length === 0) return null;
  return rates.reduce((lowest, rate) => 
    rate.price < lowest.price ? rate : lowest
  );
}

/**
 * Otel amenity'lerini grupla
 */
export function groupAmenities(amenities: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {
    'Popüler': [],
    'Oda': [],
    'Tesisler': [],
    'Diğer': []
  };

  const popularAmenities = ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Parking'];
  const roomAmenities = ['TV', 'Air Conditioning', 'Mini Bar', 'Safe', 'Balcony', 'Sea View', 'City View'];
  const facilityAmenities = ['Conference Room', 'Business Center', 'Laundry', 'Room Service', 'Kids Club'];

  amenities.forEach(amenity => {
    if (popularAmenities.includes(amenity)) {
      groups['Popüler'].push(amenity);
    } else if (roomAmenities.includes(amenity)) {
      groups['Oda'].push(amenity);
    } else if (facilityAmenities.includes(amenity)) {
      groups['Tesisler'].push(amenity);
    } else {
      groups['Diğer'].push(amenity);
    }
  });

  // Boş grupları temizle
  Object.keys(groups).forEach(key => {
    if (groups[key].length === 0) {
      delete groups[key];
    }
  });

  return groups;
}

/**
 * URL query string'inden search params oluştur
 */
export function parseSearchParams(searchParams: URLSearchParams): {
  location: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
} {
  return {
    location: searchParams.get('location') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    adults: parseInt(searchParams.get('adults') || '2', 10),
    children: parseInt(searchParams.get('children') || '0', 10),
    rooms: parseInt(searchParams.get('rooms') || '1', 10)
  };
}

/**
 * Search params'tan URL query string oluştur
 */
export function buildSearchUrl(params: {
  location: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  filters?: HotelFilters;
}): string {
  const query = new URLSearchParams();
  query.set('location', params.location);
  query.set('checkIn', params.checkIn);
  query.set('checkOut', params.checkOut);
  query.set('adults', params.adults.toString());
  query.set('children', params.children.toString());
  query.set('rooms', params.rooms.toString());

  if (params.filters?.sortBy) {
    query.set('sortBy', params.filters.sortBy);
  }

  return `/hotels/search?${query.toString()}`;
}

/**
 * Amenity ikonunu al (Türkçe isimlerle)
 */
export const AMENITY_ICONS: Record<string, string> = {
  'WiFi': '📶',
  'Pool': '🏊',
  'Spa': '💆',
  'Gym': '🏋️',
  'Restaurant': '🍽️',
  'Bar': '🍸',
  'Parking': '🅿️',
  'Room Service': '🛎️',
  'Beach Access': '🏖️',
  'Conference Room': '📊',
  'Kids Club': '👶',
  'TV': '📺',
  'Air Conditioning': '❄️',
  'Mini Bar': '🍾',
  'Safe': '🔐',
  'Balcony': '🏠',
  'Sea View': '🌊',
  'City View': '🏙️',
  'Jacuzzi': '🛁',
  'Marina': '⛵',
  'Water Sports': '🚤',
  'Thermal Pool': '♨️'
};

/**
 * Amenity Türkçe karşılıkları
 */
export const AMENITY_LABELS: Record<string, string> = {
  'WiFi': 'Wi-Fi',
  'Pool': 'Havuz',
  'Spa': 'Spa',
  'Gym': 'Fitness',
  'Restaurant': 'Restoran',
  'Bar': 'Bar',
  'Parking': 'Otopark',
  'Room Service': 'Oda Servisi',
  'Beach Access': 'Plaj Erişimi',
  'Conference Room': 'Toplantı Salonu',
  'Kids Club': 'Çocuk Kulübü',
  'TV': 'TV',
  'Air Conditioning': 'Klima',
  'Mini Bar': 'Mini Bar',
  'Safe': 'Kasa',
  'Balcony': 'Balkon',
  'Sea View': 'Deniz Manzarası',
  'City View': 'Şehir Manzarası',
  'Jacuzzi': 'Jakuzi',
  'Marina': 'Marina',
  'Water Sports': 'Su Sporları',
  'Thermal Pool': 'Termal Havuz'
};

