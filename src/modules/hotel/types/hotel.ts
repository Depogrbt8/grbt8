// Otel Modülü - TypeScript Tipleri

// Otel Konum
export interface HotelLocation {
  city: string;
  address: string;
  country?: string;
  coordinates?: { lat: number; lng: number };
  distanceFromCenter?: number; // km
}

// Otel
export interface Hotel {
  id: string;
  name: string;
  location: HotelLocation;
  rating: number; // 1-5 yıldız
  reviewScore?: number; // 1-10 puan
  reviewCount?: number;
  priceRange: { min: number; max: number; currency: string };
  images: string[];
  amenities: string[];
  availability: boolean;
  description?: string;
  hotelChain?: string;
}

// Oda Tipi
export interface RoomType {
  id: string;
  name: string;
  description: string;
  maxOccupancy: number;
  bedType: string; // "1 Double Bed", "2 Single Beds"
  size?: number; // m²
  amenities: string[];
  images: string[];
  rates: Rate[];
}

// Fiyatlandırma
export interface Rate {
  id: string;
  name: string; // "Standart Oda", "Deluxe Suite"
  price: number;
  currency: string;
  originalPrice?: number; // İndirimli fiyat için
  cancellationPolicy: 'free' | 'non-refundable' | 'partial'; 
  cancellationDeadline?: string; // ISO date string
  mealPlan: 'room_only' | 'breakfast' | 'half_board' | 'full_board' | 'all_inclusive';
  availability: boolean;
  roomsLeft?: number;
}

// Otel Politikaları
export interface HotelPolicies {
  cancellation: string;
  checkIn: string; // "14:00"
  checkOut: string; // "11:00"
  petsAllowed: boolean;
  smokingAllowed: boolean;
  childrenAllowed: boolean;
  ageRestrictions?: string;
  paymentMethods?: string[];
}

// Yorum
export interface Review {
  id: string;
  author: string;
  rating: number;
  title?: string;
  comment: string;
  date: string; // ISO date string
  verified: boolean;
  pros?: string[];
  cons?: string[];
}

// Otel Detayları (genişletilmiş)
export interface HotelDetails extends Hotel {
  description: string;
  rooms: RoomType[];
  policies: HotelPolicies;
  reviews?: Review[];
  nearbyAttractions?: { name: string; distance: string }[];
}

// Otel Arama Parametreleri
export interface HotelSearchParams {
  location: string;
  checkIn: string; // ISO date string (YYYY-MM-DD)
  checkOut: string; // ISO date string (YYYY-MM-DD)
  guests: {
    adults: number;
    children: number;
    rooms: number;
  };
  filters?: HotelFilters;
}

// Otel Filtreleri
export interface HotelFilters {
  priceRange?: { min: number; max: number };
  rating?: number[]; // [3, 4, 5] - seçili yıldızlar
  amenities?: string[];
  mealPlan?: string[];
  hotelChain?: string[];
  cancellationPolicy?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'distance' | 'popularity';
}

// Otel Arama Sonucu
export interface HotelSearchResult {
  hotels: Hotel[];
  totalCount: number;
  searchParams: HotelSearchParams;
  filters: {
    availableAmenities: string[];
    priceRange: { min: number; max: number };
    availableChains: string[];
  };
}

// Rezervasyon İsteği
export interface BookingRequest {
  hotelId: string;
  roomTypeId: string;
  rateId: string;
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
    rooms: number;
  };
  guestInfo?: GuestInfo; // Legacy format (tek kişi)
  contactInfo?: ContactInfo; // Yeni format: iletişim bilgileri
  guestDetails?: HotelGuest[]; // Yeni format: tüm misafir bilgileri
  specialRequests?: string;
  paymentMethod?: string;
}

// İletişim Bilgileri (rezervasyon sahibi)
export interface ContactInfo {
  email: string;
  phone: string;
  countryCode?: string;
}

// Otel misafiri (API uyumlu)
export interface HotelGuest {
  type: 'adult' | 'child';
  firstName: string;
  lastName: string;
  identityNumber?: string;
  isForeigner: boolean;
  passportNumber?: string;
  birthDay?: string;
  birthMonth?: string;
  birthYear?: string;
  gender?: 'male' | 'female';
  roomIndex?: number;
  passengerId?: string;
}

// Misafir Bilgileri (legacy - tek kişi)
export interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode?: string;
  address?: string;
  city?: string;
  country?: string;
  gender?: string; // 'male' | 'female'
  birthDay?: string;
  birthMonth?: string;
  birthYear?: string;
  identityNumber?: string;
  isForeigner?: boolean;
}

// Rezervasyon Yanıtı
export interface BookingResponse {
  bookingId: string;
  confirmationNumber: string;
  hotel: Hotel;
  room: RoomType;
  rate: Rate;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
  currency: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  guestInfo: GuestInfo;
  createdAt: string;
}

// Rezervasyon İptal Yanıtı
export interface CancelResponse {
  success: boolean;
  bookingId: string;
  refundAmount?: number;
  refundCurrency?: string;
  message: string;
}

// Location Suggestion (Şehir arama için)
export interface LocationSuggestion {
  id: string;
  name: string;
  type: 'city' | 'region' | 'hotel' | 'airport';
  country: string;
  countryCode: string;
  hotelCount?: number;
}

// Amenity Kategorileri
export const AMENITY_CATEGORIES = {
  popular: ['WiFi', 'Parking', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Room Service'],
  room: ['Air Conditioning', 'TV', 'Mini Bar', 'Safe', 'Balcony', 'Sea View', 'City View'],
  facilities: ['Conference Room', 'Business Center', 'Laundry', 'Concierge', 'Kids Club'],
  accessibility: ['Wheelchair Access', 'Elevator', 'Accessible Bathroom']
} as const;

// Meal Plan Labels
export const MEAL_PLAN_LABELS: Record<string, string> = {
  room_only: 'Sadece Oda',
  breakfast: 'Kahvaltı Dahil',
  half_board: 'Yarım Pansiyon',
  full_board: 'Tam Pansiyon',
  all_inclusive: 'Her Şey Dahil'
};

// Cancellation Policy Labels
export const CANCELLATION_LABELS: Record<string, string> = {
  free: 'Ücretsiz İptal',
  non_refundable: 'İade Yok',
  partial: 'Kısmi İade'
};



