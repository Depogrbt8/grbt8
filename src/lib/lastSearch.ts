/**
 * Son arama bilgilerini localStorage'da saklar (giriş yapmış/yapmamış tüm kullanıcılar için).
 * Otel ve araç arama formları bu değerlerle varsayılan doldurulur veya parametresiz gelindiğinde yönlendirilir.
 */

const HOTEL_KEY = 'grbt_last_hotel_search';
const CAR_KEY = 'grbt_last_car_search';

export type LastHotelSearch = {
  location: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  childAges?: number[];
};

export type LastCarSearch = {
  pickupLocationId: string;
  dropoffLocationId: string;
  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;
  driverAge: number;
  pickupName?: string;
  dropoffName?: string;
};

function safeJsonParse<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const data = JSON.parse(raw) as T;
    return data;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: object): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota / private mode
  }
}

export function getLastHotelSearch(): LastHotelSearch | null {
  const data = safeJsonParse<LastHotelSearch | null>(HOTEL_KEY, null);
  if (!data || !data.location || !data.checkIn || !data.checkOut) return null;
  return {
    location: data.location,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    adults: typeof data.adults === 'number' ? data.adults : 2,
    children: typeof data.children === 'number' ? data.children : 0,
    rooms: typeof data.rooms === 'number' ? data.rooms : 1,
    childAges: Array.isArray(data.childAges) ? data.childAges : []
  };
}

export function setLastHotelSearch(params: LastHotelSearch): void {
  safeSet(HOTEL_KEY, params);
}

export function getLastCarSearch(): LastCarSearch | null {
  const data = safeJsonParse<LastCarSearch | null>(CAR_KEY, null);
  if (!data || !data.pickupLocationId || !data.pickupDate || !data.dropoffDate) return null;
  return {
    pickupLocationId: data.pickupLocationId,
    dropoffLocationId: data.dropoffLocationId,
    pickupDate: data.pickupDate,
    pickupTime: data.pickupTime || '10:00',
    dropoffDate: data.dropoffDate,
    dropoffTime: data.dropoffTime || '10:00',
    driverAge: typeof data.driverAge === 'number' ? data.driverAge : 30,
    pickupName: data.pickupName,
    dropoffName: data.dropoffName
  };
}

export function setLastCarSearch(params: LastCarSearch): void {
  safeSet(CAR_KEY, params);
}
