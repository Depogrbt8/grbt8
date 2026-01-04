// Otel API Interface - Ana API tanımları

import type {
  HotelSearchParams,
  HotelSearchResult,
  HotelDetails,
  BookingRequest,
  BookingResponse,
  CancelResponse,
  LocationSuggestion
} from '../types';

/**
 * Otel API Interface
 * Tüm API adapter'ları bu interface'i implement etmeli
 */
export interface HotelApiInterface {
  searchHotels(params: HotelSearchParams): Promise<HotelSearchResult>;
  getHotelDetails(hotelId: string, params?: Partial<HotelSearchParams>): Promise<HotelDetails | null>;
  searchLocations(query: string): Promise<LocationSuggestion[]>;
  createBooking(request: BookingRequest): Promise<BookingResponse>;
  cancelBooking(bookingId: string): Promise<CancelResponse>;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * API Error sınıfı
 */
export class HotelApiError extends Error {
  code: string;
  
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'HotelApiError';
  }
}

// Error codes
export const HOTEL_ERROR_CODES = {
  NOT_FOUND: 'HOTEL_NOT_FOUND',
  INVALID_PARAMS: 'INVALID_PARAMS',
  NO_AVAILABILITY: 'NO_AVAILABILITY',
  BOOKING_FAILED: 'BOOKING_FAILED',
  CANCEL_FAILED: 'CANCEL_FAILED',
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR'
} as const;



