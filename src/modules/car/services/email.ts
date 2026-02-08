// Araç Kiralama Email Servisi

import type { CarBooking } from '../types';

/**
 * Rezervasyon onay emaili gönder
 */
export async function sendBookingConfirmationEmail(booking: CarBooking): Promise<boolean> {
  try {
    const emailData = {
      recipient: booking.confirmationEmail,
      subject: `Araç Kiralama Rezervasyonunuz Onaylandı - ${booking.bookingNumber}`,
      templateId: 'car-booking-confirmation',
      data: {
        bookingNumber: booking.bookingNumber,
        carName: booking.car.name,
        supplierName: booking.car.supplierName,
        pickupLocation: booking.route.pickup.location.name,
        pickupDateTime: new Date(booking.route.pickup.datetime).toLocaleString('tr-TR'),
        dropoffLocation: booking.route.dropoff.location.name,
        dropoffDateTime: new Date(booking.route.dropoff.datetime).toLocaleString('tr-TR'),
        driverName: `${booking.driver.firstName} ${booking.driver.lastName}`,
        totalPrice: booking.priceBreakdown.total,
        currency: booking.priceBreakdown.currency,
        pickupDepot: booking.route.pickup.depot,
        dropoffDepot: booking.route.dropoff.depot,
        cancellationPolicy: booking.cancellationPolicy
      }
    };
    
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    });
    
    return response.ok;
  } catch (error) {
    console.error('Email gönderme hatası:', error);
    return false;
  }
}

/**
 * Rezervasyon iptal emaili gönder
 */
export async function sendBookingCancellationEmail(
  booking: CarBooking,
  refundAmount: number
): Promise<boolean> {
  try {
    const emailData = {
      recipient: booking.confirmationEmail,
      subject: `Araç Kiralama Rezervasyonunuz İptal Edildi - ${booking.bookingNumber}`,
      templateId: 'car-booking-cancellation',
      data: {
        bookingNumber: booking.bookingNumber,
        carName: booking.car.name,
        pickupDateTime: new Date(booking.route.pickup.datetime).toLocaleString('tr-TR'),
        refundAmount,
        currency: booking.priceBreakdown.currency,
        cancellationReason: booking.cancellationReason || 'Kullanıcı isteği'
      }
    };
    
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    });
    
    return response.ok;
  } catch (error) {
    console.error('Email gönderme hatası:', error);
    return false;
  }
}

/**
 * Alış hatırlatma emaili gönder (24 saat öncesi)
 */
export async function sendPickupReminderEmail(booking: CarBooking): Promise<boolean> {
  try {
    const emailData = {
      recipient: booking.confirmationEmail,
      subject: `Araç Alış Hatırlatması - ${booking.bookingNumber}`,
      templateId: 'car-pickup-reminder',
      data: {
        bookingNumber: booking.bookingNumber,
        carName: booking.car.name,
        pickupLocation: booking.route.pickup.location.name,
        pickupDateTime: new Date(booking.route.pickup.datetime).toLocaleString('tr-TR'),
        pickupDepot: booking.route.pickup.depot,
        driverName: `${booking.driver.firstName} ${booking.driver.lastName}`,
        requiredDocuments: [
          'Sürücü belgesi',
          'Kimlik kartı veya pasaport',
          'Kredi kartı (depozito için)'
        ]
      }
    };
    
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    });
    
    return response.ok;
  } catch (error) {
    console.error('Email gönderme hatası:', error);
    return false;
  }
}

/**
 * Teslim hatırlatma emaili gönder (2 saat öncesi)
 */
export async function sendDropoffReminderEmail(booking: CarBooking): Promise<boolean> {
  try {
    const emailData = {
      recipient: booking.confirmationEmail,
      subject: `Araç Teslim Hatırlatması - ${booking.bookingNumber}`,
      templateId: 'car-dropoff-reminder',
      data: {
        bookingNumber: booking.bookingNumber,
        carName: booking.car.name,
        dropoffLocation: booking.route.dropoff.location.name,
        dropoffDateTime: new Date(booking.route.dropoff.datetime).toLocaleString('tr-TR'),
        dropoffDepot: booking.route.dropoff.depot,
        fuelPolicy: booking.car.fuelPolicy,
        reminders: [
          'Aracı temiz teslim edin',
          'Yakıt seviyesini kontrol edin',
          'Tüm eşyalarınızı aldığınızdan emin olun'
        ]
      }
    };
    
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    });
    
    return response.ok;
  } catch (error) {
    console.error('Email gönderme hatası:', error);
    return false;
  }
}
