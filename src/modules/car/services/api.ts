// Araç Kiralama API Servisi - Interface
// Gerçek API'ye geçişte sadece bu interface'i implement eden adapter değiştirilecek

import type {
  CarSearchParams,
  CarSearchResult,
  CarDetails,
  CarBookingData,
  CarBooking,
  LocationSearchResult
} from '../types';

/**
 * Araç Kiralama API Interface
 * Tüm provider'lar (Demo, Rentalcars, CartrawLer, Garenta) bu interface'i implement eder
 */
export interface CarRentalAPI {
  /**
   * Araç ara
   */
  searchCars(params: CarSearchParams): Promise<CarSearchResult>;
  
  /**
   * Araç detaylarını getir
   */
  getCarDetails(carId: string, searchToken: string): Promise<CarDetails>;
  
  /**
   * Müsaitlik kontrolü
   */
  checkAvailability(carId: string, searchToken: string): Promise<{
    available: boolean;
    price?: number;
    message?: string;
  }>;
  
  /**
   * Rezervasyon oluştur
   */
  createBooking(data: CarBookingData): Promise<CarBooking>;
  
  /**
   * Rezervasyon detayını getir
   */
  getBooking(bookingId: string): Promise<CarBooking>;
  
  /**
   * Rezervasyonu iptal et
   */
  cancelBooking(bookingId: string, reason?: string): Promise<{
    success: boolean;
    refundAmount?: number;
    message?: string;
  }>;
  
  /**
   * Lokasyon ara (havalimanı, şehir, merkez)
   */
  searchLocations(query: string, type?: 'airport' | 'city' | 'all'): Promise<LocationSearchResult[]>;
  
  /**
   * Popüler lokasyonları getir
   */
  getPopularLocations(country?: string): Promise<LocationSearchResult[]>;
}

/**
 * Varsayılan API instance
 * Gerçek API'ye geçişte burası değiştirilecek
 */
let apiInstance: CarRentalAPI;

/**
 * API instance'ını ayarla
 */
export function setCarRentalAPI(api: CarRentalAPI) {
  apiInstance = api;
}

/**
 * Aktif API instance'ını getir
 * Sunucu (API route) tarafında init çağrılmadığı için lazy init: ilk kullanımda demo API set edilir
 */
export function getCarRentalAPI(): CarRentalAPI {
  if (!apiInstance) {
    const { demoCarAPI } = require('./adapters/demo');
    setCarRentalAPI(demoCarAPI);
  }
  return apiInstance!;
}

/**
 * API Helper Functions
 */

/**
 * Araç ara
 */
export async function searchCars(params: CarSearchParams): Promise<CarSearchResult> {
  return getCarRentalAPI().searchCars(params);
}

/**
 * Araç detaylarını getir
 */
export async function getCarDetails(carId: string, searchToken: string): Promise<CarDetails> {
  return getCarRentalAPI().getCarDetails(carId, searchToken);
}

/**
 * Müsaitlik kontrolü
 */
export async function checkAvailability(carId: string, searchToken: string) {
  return getCarRentalAPI().checkAvailability(carId, searchToken);
}

/**
 * Rezervasyon oluştur
 */
export async function createBooking(data: CarBookingData): Promise<CarBooking> {
  return getCarRentalAPI().createBooking(data);
}

/**
 * Rezervasyon detayını getir
 */
export async function getBooking(bookingId: string): Promise<CarBooking> {
  return getCarRentalAPI().getBooking(bookingId);
}

/**
 * Rezervasyonu iptal et
 */
export async function cancelBooking(bookingId: string, reason?: string) {
  return getCarRentalAPI().cancelBooking(bookingId, reason);
}

/**
 * Lokasyon ara
 */
export async function searchLocations(
  query: string,
  type?: 'airport' | 'city' | 'all'
): Promise<LocationSearchResult[]> {
  return getCarRentalAPI().searchLocations(query, type);
}

/**
 * Popüler lokasyonları getir
 */
export async function getPopularLocations(country?: string): Promise<LocationSearchResult[]> {
  return getCarRentalAPI().getPopularLocations(country);
}
