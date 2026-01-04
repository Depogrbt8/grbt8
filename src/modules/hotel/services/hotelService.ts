// Otel Service - Business Logic Layer

import type {
  HotelSearchParams,
  HotelSearchResult,
  HotelDetails,
  BookingRequest,
  BookingResponse,
  CancelResponse,
  LocationSuggestion
} from '../types';

import {
  searchHotelsDemo,
  getHotelDetailsDemo,
  searchLocationsDemo,
  createBookingDemo,
  cancelBookingDemo
} from './adapters/demoHotelApi';

import { HotelApiError, HOTEL_ERROR_CODES } from './hotelApi';

// Demo mu gerçek API mi?
const USE_DEMO = process.env.NEXT_PUBLIC_USE_DEMO_HOTEL_API !== 'false';

/**
 * Otel Arama
 */
export async function searchHotels(params: HotelSearchParams): Promise<HotelSearchResult> {
  try {
    // Parametre validasyonu
    if (!params.location) {
      throw new HotelApiError(HOTEL_ERROR_CODES.INVALID_PARAMS, 'Konum gereklidir');
    }
    if (!params.checkIn || !params.checkOut) {
      throw new HotelApiError(HOTEL_ERROR_CODES.INVALID_PARAMS, 'Giriş ve çıkış tarihleri gereklidir');
    }
    if (!params.guests?.adults || params.guests.adults < 1) {
      throw new HotelApiError(HOTEL_ERROR_CODES.INVALID_PARAMS, 'En az 1 yetişkin gereklidir');
    }

    if (USE_DEMO) {
      return await searchHotelsDemo(params);
    } else {
      // Gerçek API çağrısı (gelecekte eklenecek)
      // return await searchHotelsAmadeus(params);
      return await searchHotelsDemo(params); // Fallback
    }
  } catch (error) {
    console.error('Otel arama hatası:', error);
    
    // Hata durumunda demo veriye fallback
    if (!USE_DEMO) {
      console.log('Gerçek API başarısız, demo veriye geçiliyor...');
      return await searchHotelsDemo(params);
    }
    
    throw error;
  }
}

/**
 * Otel Detayları
 */
export async function getHotelDetails(
  hotelId: string, 
  params?: Partial<HotelSearchParams>
): Promise<HotelDetails | null> {
  try {
    if (!hotelId) {
      throw new HotelApiError(HOTEL_ERROR_CODES.INVALID_PARAMS, 'Otel ID gereklidir');
    }

    if (USE_DEMO) {
      return await getHotelDetailsDemo(hotelId);
    } else {
      // Gerçek API çağrısı (gelecekte eklenecek)
      return await getHotelDetailsDemo(hotelId); // Fallback
    }
  } catch (error) {
    console.error('Otel detay hatası:', error);
    
    if (!USE_DEMO) {
      return await getHotelDetailsDemo(hotelId);
    }
    
    throw error;
  }
}

/**
 * Konum Arama (Autocomplete)
 */
export async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  try {
    if (!query || query.length < 2) {
      return [];
    }

    if (USE_DEMO) {
      return await searchLocationsDemo(query);
    } else {
      // Gerçek API çağrısı (gelecekte eklenecek)
      return await searchLocationsDemo(query); // Fallback
    }
  } catch (error) {
    console.error('Konum arama hatası:', error);
    return [];
  }
}

/**
 * Rezervasyon Oluşturma
 */
export async function createBooking(request: BookingRequest): Promise<BookingResponse> {
  try {
    // Validasyon
    if (!request.hotelId || !request.roomTypeId || !request.rateId) {
      throw new HotelApiError(HOTEL_ERROR_CODES.INVALID_PARAMS, 'Otel, oda ve fiyat seçimi gereklidir');
    }
    if (!request.checkIn || !request.checkOut) {
      throw new HotelApiError(HOTEL_ERROR_CODES.INVALID_PARAMS, 'Tarihler gereklidir');
    }
    if (!request.guestInfo?.firstName || !request.guestInfo?.lastName || !request.guestInfo?.email) {
      throw new HotelApiError(HOTEL_ERROR_CODES.INVALID_PARAMS, 'Misafir bilgileri gereklidir');
    }

    if (USE_DEMO) {
      return await createBookingDemo(request);
    } else {
      // Gerçek API çağrısı (gelecekte eklenecek)
      return await createBookingDemo(request); // Fallback
    }
  } catch (error) {
    console.error('Rezervasyon hatası:', error);
    throw error;
  }
}

/**
 * Rezervasyon İptali
 */
export async function cancelBooking(bookingId: string): Promise<CancelResponse> {
  try {
    if (!bookingId) {
      throw new HotelApiError(HOTEL_ERROR_CODES.INVALID_PARAMS, 'Rezervasyon ID gereklidir');
    }

    if (USE_DEMO) {
      return await cancelBookingDemo(bookingId);
    } else {
      // Gerçek API çağrısı (gelecekte eklenecek)
      return await cancelBookingDemo(bookingId); // Fallback
    }
  } catch (error) {
    console.error('İptal hatası:', error);
    throw error;
  }
}

/**
 * Gece sayısını hesapla
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Toplam fiyat hesapla
 */
export function calculateTotalPrice(
  pricePerNight: number, 
  nights: number, 
  rooms: number
): number {
  return pricePerNight * nights * rooms;
}



