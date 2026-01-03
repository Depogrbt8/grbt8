'use client';

import { useState, useCallback } from 'react';
import type { 
  HotelDetails, 
  RoomType, 
  Rate, 
  BookingRequest, 
  BookingResponse,
  GuestInfo 
} from '../types';
import { createBooking, calculateNights, calculateTotalPrice } from '../services';

interface BookingState {
  hotel: HotelDetails | null;
  selectedRoom: RoomType | null;
  selectedRate: Rate | null;
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
    rooms: number;
  };
  guestInfo: GuestInfo | null;
  totalPrice: number;
  nights: number;
  loading: boolean;
  error: string | null;
  booking: BookingResponse | null;
}

const initialState: BookingState = {
  hotel: null,
  selectedRoom: null,
  selectedRate: null,
  checkIn: '',
  checkOut: '',
  guests: { adults: 2, children: 0, rooms: 1 },
  guestInfo: null,
  totalPrice: 0,
  nights: 0,
  loading: false,
  error: null,
  booking: null
};

export function useHotelBooking() {
  const [state, setState] = useState<BookingState>(initialState);

  // Otel seç
  const setHotel = useCallback((hotel: HotelDetails | null) => {
    setState(prev => ({ ...prev, hotel, selectedRoom: null, selectedRate: null }));
  }, []);

  // Oda seç
  const selectRoom = useCallback((room: RoomType | null) => {
    setState(prev => ({ 
      ...prev, 
      selectedRoom: room, 
      selectedRate: room?.rates[0] || null 
    }));
  }, []);

  // Rate seç
  const selectRate = useCallback((rate: Rate | null) => {
    setState(prev => {
      const nights = prev.checkIn && prev.checkOut 
        ? calculateNights(prev.checkIn, prev.checkOut) 
        : 0;
      const totalPrice = rate 
        ? calculateTotalPrice(rate.price, nights, prev.guests.rooms) 
        : 0;
      
      return { 
        ...prev, 
        selectedRate: rate,
        nights,
        totalPrice
      };
    });
  }, []);

  // Tarih güncelle
  const setDates = useCallback((checkIn: string, checkOut: string) => {
    setState(prev => {
      const nights = calculateNights(checkIn, checkOut);
      const totalPrice = prev.selectedRate 
        ? calculateTotalPrice(prev.selectedRate.price, nights, prev.guests.rooms) 
        : 0;
      
      return { 
        ...prev, 
        checkIn, 
        checkOut,
        nights,
        totalPrice
      };
    });
  }, []);

  // Misafir sayısı güncelle
  const setGuests = useCallback((guests: { adults: number; children: number; rooms: number }) => {
    setState(prev => {
      const totalPrice = prev.selectedRate && prev.nights
        ? calculateTotalPrice(prev.selectedRate.price, prev.nights, guests.rooms) 
        : 0;
      
      return { 
        ...prev, 
        guests,
        totalPrice
      };
    });
  }, []);

  // Misafir bilgilerini güncelle
  const setGuestInfo = useCallback((info: GuestInfo) => {
    setState(prev => ({ ...prev, guestInfo: info }));
  }, []);

  // Rezervasyon yap
  const submitBooking = useCallback(async () => {
    const { hotel, selectedRoom, selectedRate, checkIn, checkOut, guests, guestInfo } = state;

    if (!hotel || !selectedRoom || !selectedRate || !guestInfo) {
      setState(prev => ({ ...prev, error: 'Eksik bilgi' }));
      return null;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const request: BookingRequest = {
        hotelId: hotel.id,
        roomTypeId: selectedRoom.id,
        rateId: selectedRate.id,
        checkIn,
        checkOut,
        guests,
        guestInfo
      };

      const booking = await createBooking(request);
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        booking,
        error: null
      }));

      return booking;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Rezervasyon hatası';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return null;
    }
  }, [state]);

  // State'i sıfırla
  const resetBooking = useCallback(() => {
    setState(initialState);
  }, []);

  // Rezervasyon özeti
  const bookingSummary = {
    hotel: state.hotel?.name || '',
    room: state.selectedRoom?.name || '',
    rate: state.selectedRate?.name || '',
    checkIn: state.checkIn,
    checkOut: state.checkOut,
    nights: state.nights,
    guests: state.guests,
    totalPrice: state.totalPrice,
    currency: state.selectedRate?.currency || 'EUR'
  };

  return {
    ...state,
    setHotel,
    selectRoom,
    selectRate,
    setDates,
    setGuests,
    setGuestInfo,
    submitBooking,
    resetBooking,
    bookingSummary
  };
}

