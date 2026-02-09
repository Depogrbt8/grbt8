// Araç Kiralama Modülü - TypeScript Tipleri
// Booking.com Cars API yapısına uygun

/**
 * Lokasyon (Alış/Teslim noktası)
 */
export interface CarLocation {
  id: string;
  name: string;
  type: 'airport' | 'city' | 'downtown' | 'railway_station';
  airport?: string; // IATA kodu (AMS, IST, AYT)
  city?: string; // Şehir adı
  cityId?: number; // Booking.com city ID
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  depotLocationType?: 'in_terminal' | 'meet_and_greet' | 'shuttle' | 'downtown';
}

/**
 * Araç Kategorileri (Booking.com standartları)
 */
export type CarCategory = 
  | 'mini'
  | 'economy'
  | 'compact'
  | 'intermediate'
  | 'standard'
  | 'fullsize'
  | 'premium'
  | 'luxury'
  | 'suv'
  | 'minivan'
  | 'convertible'
  | 'estate';

/**
 * Araç (Liste görünümü)
 */
export interface Car {
  id: string; // Booking.com car ID
  name: string; // "Fiat Egea veya benzeri"
  category: CarCategory;
  imageUrl: string;
  
  // Araç özellikleri
  transmission: 'automatic' | 'manual';
  fuelType: 'petrol' | 'diesel' | 'hybrid' | 'electric' | 'lpg';
  airConditioning: boolean;
  seats: number;
  doors: number;
  largeBags: number; // Büyük bavul
  smallBags: number; // Küçük bavul
  
  // Fiyat
  pricePerDay: number;
  totalPrice: number;
  currency: string;
  
  // Tedarikçi
  supplierId: number; // Booking.com supplier ID
  supplierName: string; // "Garenta", "Avis", "Budget"
  supplierLogo?: string;
  supplierRating?: number;
  
  // Politikalar
  mileage: {
    type: 'unlimited' | 'limited';
    distance?: number; // Günlük km limiti
    distanceUnit?: 'kilometers' | 'miles';
    extraCostPerUnit?: number;
  };
  
  fuelPolicy: 'same_to_same' | 'full_to_full' | 'pre_purchase';
  
  cancellation: {
    type: 'free_cancellation' | 'non_refundable' | 'partial_refund';
    freeCancellationBefore?: string; // ISO date
    refundPercentage?: number;
  };
  
  // Ekstra bilgiler
  depositAmount?: number;
  excessAmount?: number; // Hasar muafiyeti
  insuranceIncluded: boolean;
  
  // Lokasyon
  pickupDepot: {
    id: number;
    locationType: 'in_terminal' | 'meet_and_greet' | 'shuttle' | 'downtown';
  };
  dropoffDepot: {
    id: number;
    locationType: 'in_terminal' | 'meet_and_greet' | 'shuttle' | 'downtown';
  };
}

/**
 * Araç Detayları (Detay sayfası)
 */
export interface CarDetails extends Car {
  description: string;
  images: string[];
  
  // Teknik özellikler
  specifications: {
    make?: string; // Marka (Fiat, Renault)
    model?: string; // Model (Egea, Clio)
    year?: number;
    engine?: string;
    power?: string;
    fuelConsumption?: string;
    co2Emission?: string;
  };
  
  // Özellikler
  features: string[];
  
  // Kiralama koşulları
  rentalConditions: {
    minimumAge: number;
    minimumLicenseAge: number; // Ehliyet yaşı (yıl)
    youngDriverFee?: {
      ageRange: string; // "21-25"
      amount: number;
      currency: string;
    };
    additionalDriverFee?: {
      amount: number;
      currency: string;
      perDriver?: boolean;
    };
    crossBorderAllowed: boolean;
    crossBorderFee?: number;
  };
  
  // Sigorta seçenekleri
  insuranceOptions: InsuranceOption[];
  
  // Ekstra hizmetler
  extraServices: ExtraService[];
  
  // Detaylı politikalar
  policies: {
    cancellation: string;
    amendment: string;
    lateReturn: string;
    earlyReturn: string;
    damage: string;
    theft: string;
  };
  
  // Tedarikçi bilgileri
  supplier: {
    id: number;
    name: string;
    logo?: string;
    rating?: number;
    reviewCount?: number;
    phone?: string;
    email?: string;
    workingHours?: string;
  };
}

/**
 * Sigorta Seçeneği
 */
export interface InsuranceOption {
  id: string;
  name: string;
  description: string;
  coverage: string[];
  excessReduction: number; // Muafiyet azaltma miktarı
  price: number; // Günlük fiyat
  currency: string;
  included: boolean;
  recommended?: boolean;
}

/**
 * Ekstra Hizmet
 */
export interface ExtraService {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  unit: 'per_day' | 'per_rental'; // Fiyatlandırma birimi
  icon?: string;
  maxQuantity?: number;
  mandatory?: boolean;
}

/**
 * Araç Arama Parametreleri (Booking.com formatı)
 */
export interface CarSearchParams {
  // Rota
  route: {
    pickup: {
      location: CarLocation;
      datetime: string; // ISO 8601: "2025-11-05T11:05:00"
    };
    dropoff: {
      location: CarLocation;
      datetime: string;
    };
  };
  
  // Sürücü
  driver: {
    age: number; // 18-99
    country?: string; // ISO 3166-1 alpha-2
  };
  
  // Rezervasyon yapan kişi
  booker: {
    country: string; // ISO 3166-1 alpha-2 (lowercase)
  };
  
  // Para birimi
  currency: string; // ISO 4217 (EUR, TL, USD)
  
  // Filtreler (opsiyonel)
  filters?: CarFiltersType;
  
  // Ödeme tercihi
  payment?: {
    timings?: ('pay_online_now' | 'pay_partial_online_now' | 'pay_at_pickup')[];
  };
  
  // Sayfalama ve sıralama
  maximumResults?: number; // 10-500, default 100
  sort?: {
    by: 'price' | 'distance' | 'review_score';
    direction?: 'ascending' | 'descending';
  };
  page?: string; // Pagination token
}

/**
 * Araç Filtreleri (Type)
 */
export interface CarFiltersType {
  carCategories?: CarCategory[];
  transmissionType?: 'automatic' | 'manual';
  mileageType?: 'unlimited' | 'limited';
  depotLocationType?: 'in_terminal' | 'meet_and_greet' | 'shuttle' | 'downtown';
  numberOfSeats?: number;
  airConditioning?: boolean;
  supplierIds?: number[];
  priceRange?: {
    min: number;
    max: number;
  };
}

/**
 * Araç Arama Sonucu
 */
export interface CarSearchResult {
  requestId: string;
  data: Car[];
  metadata: {
    totalResults: number;
    nextPage?: string; // Pagination token
    searchToken: string; // 90 dakika geçerli
  };
  searchParams: CarSearchParams;
}

/**
 * Sürücü Bilgileri
 */
export interface Driver {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string; // Telefon ülke kodu (+90)
  dateOfBirth: string; // ISO date (YYYY-MM-DD)
  age: number;
  
  // Ehliyet bilgileri
  license: {
    number: string;
    issueDate: string; // ISO date
    expiryDate: string; // ISO date
    issueCountry: string; // ISO 3166-1 alpha-2
  };
  
  // Kimlik
  identity: {
    type: 'passport' | 'id_card' | 'driving_license';
    number: string;
    issueCountry: string;
    expiryDate?: string;
  };
  
  // Adres
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

/**
 * Rezervasyon Verisi (Booking.com formatı)
 */
export interface CarBookingData {
  // Araç ve rota
  carId: string;
  searchToken: string; // Search'ten gelen token
  
  route: {
    pickup: {
      depotId: number;
      datetime: string;
    };
    dropoff: {
      depotId: number;
      datetime: string;
    };
  };
  
  // Sürücü
  driver: Driver;
  
  // Ek sürücüler
  additionalDrivers?: Driver[];
  
  // Seçilen ekstralar
  extras?: {
    serviceId: string;
    quantity: number;
  }[];
  
  // Sigorta
  insurance?: {
    optionId: string;
  };
  
  // Ödeme
  payment: {
    method: 'credit_card' | 'debit_card';
    timing: 'pay_online_now' | 'pay_partial_online_now' | 'pay_at_pickup';
  };
  
  // İletişim tercihleri
  contactPreferences?: {
    email: boolean;
    sms: boolean;
  };
  
  // Özel istekler
  specialRequests?: string;
}

/**
 * Fiyat Detayı
 */
export interface PriceBreakdown {
  // Temel fiyat
  basePrice: number;
  pricePerDay: number;
  days: number;
  
  // Ekstra ücretler
  extras: {
    name: string;
    amount: number;
  }[];
  extrasTotal: number;
  
  // Sigorta
  insurance: number;
  
  // Özel ücretler
  youngDriverFee: number; // 21-25 yaş
  additionalDriverFee: number;
  oneWayFee: number; // Farklı lokasyon teslim
  airportFee: number; // Havalimanı hizmet ücreti
  
  // Ara toplam
  subtotal: number;
  
  // Vergiler
  tax: number;
  taxRate: number; // %18
  
  // Genel toplam
  total: number;
  currency: string;
  
  // Depozito
  deposit?: number;
  excess?: number; // Hasar muafiyeti
}

/**
 * Rezervasyon
 */
export interface CarBooking {
  id: string;
  bookingNumber: string; // "GRB-CAR-12345678"
  bookingReference?: string; // Provider booking reference
  
  // Araç bilgileri
  car: Car;
  
  // Rota
  route: {
    pickup: {
      location: CarLocation;
      depot: {
        id: number;
        name: string;
        address: string;
        phone: string;
        workingHours: string;
      };
      datetime: string;
    };
    dropoff: {
      location: CarLocation;
      depot: {
        id: number;
        name: string;
        address: string;
        phone: string;
        workingHours: string;
      };
      datetime: string;
    };
  };
  
  // Sürücü
  driver: Driver;
  additionalDrivers?: Driver[];
  
  // Seçilen hizmetler
  extras: ExtraService[];
  insurance?: InsuranceOption;
  
  // Fiyat
  priceBreakdown: PriceBreakdown;
  
  // Durum
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  
  // Tarihler
  createdAt: string;
  updatedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  
  // İletişim
  confirmationEmail: string;
  confirmationSms?: string;
  
  // Politikalar
  cancellationPolicy: string;
  amendmentPolicy?: string;
  
  // Provider bilgisi
  provider: string; // 'demo', 'rentalcars', 'cartrawler', 'garenta'
  providerBookingId?: string;
}

/**
 * Basitleştirilmiş Arama Parametreleri (Frontend için)
 */
export interface SimpleCarSearchParams {
  pickupLocationId: string;
  dropoffLocationId: string;
  pickupDate: string; // YYYY-MM-DD
  pickupTime: string; // HH:mm
  dropoffDate: string;
  dropoffTime: string;
  driverAge: number;
  driverCountry?: string;
}

/**
 * Araç Filtre Seçenekleri
 */
export interface CarFilterOptions {
  categories: { value: CarCategory; label: string; count: number }[];
  suppliers: { id: number; name: string; count: number }[];
  priceRange: { min: number; max: number };
  transmissionTypes: { value: string; label: string; count: number }[];
  fuelTypes: { value: string; label: string; count: number }[];
  seatCounts: number[];
}

/**
 * Sıralama Seçenekleri
 */
export type CarSortOption = 
  | 'price_asc'
  | 'price_desc'
  | 'rating'
  | 'distance'
  | 'recommended';

/**
 * Lokasyon Arama Sonucu
 */
export interface LocationSearchResult {
  id: string;
  name: string;
  type: 'airport' | 'city' | 'downtown';
  city: string;
  country: string;
  airport?: string; // IATA
  highlight?: string; // Vurgulanan kısım
}

// Kategori etiketleri (Türkçe)
export const CAR_CATEGORY_LABELS: Record<CarCategory, string> = {
  mini: 'Mini',
  economy: 'Ekonomi',
  compact: 'Kompakt',
  intermediate: 'Orta',
  standard: 'Standart',
  fullsize: 'Büyük',
  premium: 'Premium',
  luxury: 'Lüks',
  suv: 'SUV',
  minivan: 'Minivan',
  convertible: 'Cabrio',
  estate: 'Station Wagon'
};

// Vites tipi etiketleri
export const TRANSMISSION_LABELS = {
  automatic: 'Otomatik',
  manual: 'Manuel'
} as const;

// Yakıt tipi etiketleri
export const FUEL_TYPE_LABELS = {
  petrol: 'Benzin',
  diesel: 'Dizel',
  hybrid: 'Hybrid',
  electric: 'Elektrik',
  lpg: 'LPG'
} as const;

// Kilometre tipi etiketleri
export const MILEAGE_TYPE_LABELS = {
  unlimited: 'Sınırsız',
  limited: 'Sınırlı'
} as const;

// İptal politikası etiketleri
export const CANCELLATION_TYPE_LABELS = {
  free_cancellation: 'Ücretsiz İptal',
  non_refundable: 'İade Edilemez',
  partial_refund: 'Kısmi İade'
} as const;
