// Araç Kiralama SMS Servisi

import type { CarBooking } from '../types';

/**
 * SMS gönder (Generic)
 */
async function sendSMS(phone: string, message: string): Promise<boolean> {
  try {
    const response = await fetch('/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message })
    });
    
    return response.ok;
  } catch (error) {
    console.error('SMS gönderme hatası:', error);
    return false;
  }
}

/**
 * Rezervasyon onay SMS'i gönder
 */
export async function sendBookingConfirmationSMS(booking: CarBooking): Promise<boolean> {
  if (!booking.confirmationSms) return false;
  
  const message = `Gurbetbiz: Araç kiralama rezervasyonunuz onaylandı. 
Rezervasyon No: ${booking.bookingNumber}
Araç: ${booking.car.name}
Alış: ${new Date(booking.route.pickup.datetime).toLocaleDateString('tr-TR')} ${new Date(booking.route.pickup.datetime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
Lokasyon: ${booking.route.pickup.location.name}
Detaylar için: gurbetbiz.app`;
  
  return sendSMS(booking.confirmationSms, message);
}

/**
 * Rezervasyon iptal SMS'i gönder
 */
export async function sendBookingCancellationSMS(
  booking: CarBooking,
  refundAmount: number
): Promise<boolean> {
  if (!booking.confirmationSms) return false;
  
  const message = `Gurbetbiz: Araç kiralama rezervasyonunuz iptal edildi.
Rezervasyon No: ${booking.bookingNumber}
İade Tutarı: ${refundAmount} ${booking.priceBreakdown.currency}
İade 3-5 iş günü içinde hesabınıza yansıyacaktır.`;
  
  return sendSMS(booking.confirmationSms, message);
}

/**
 * Alış hatırlatma SMS'i gönder (24 saat öncesi)
 */
export async function sendPickupReminderSMS(booking: CarBooking): Promise<boolean> {
  if (!booking.confirmationSms) return false;
  
  const message = `Gurbetbiz: Araç alış hatırlatması!
Rezervasyon: ${booking.bookingNumber}
Araç: ${booking.car.name}
Alış: YARIN ${new Date(booking.route.pickup.datetime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
Lokasyon: ${booking.route.pickup.location.name}
Yanınızda: Ehliyet, kimlik, kredi kartı
Ofis: ${booking.route.pickup.depot.phone}`;
  
  return sendSMS(booking.confirmationSms, message);
}

/**
 * Teslim hatırlatma SMS'i gönder (2 saat öncesi)
 */
export async function sendDropoffReminderSMS(booking: CarBooking): Promise<boolean> {
  if (!booking.confirmationSms) return false;
  
  const message = `Gurbetbiz: Araç teslim hatırlatması!
Rezervasyon: ${booking.bookingNumber}
Teslim: BUGÜN ${new Date(booking.route.dropoff.datetime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
Lokasyon: ${booking.route.dropoff.location.name}
Yakıt politikası: ${booking.car.fuelPolicy}
Ofis: ${booking.route.dropoff.depot.phone}`;
  
  return sendSMS(booking.confirmationSms, message);
}

/**
 * Geç teslim uyarı SMS'i gönder
 */
export async function sendLateDropoffWarningSMS(booking: CarBooking): Promise<boolean> {
  if (!booking.confirmationSms) return false;
  
  const message = `Gurbetbiz: Araç teslim saatiniz geçti!
Rezervasyon: ${booking.bookingNumber}
Lütfen en kısa sürede ${booking.route.dropoff.location.name} ofisine teslim edin.
Geç teslim ek ücrete tabi olabilir.
Ofis: ${booking.route.dropoff.depot.phone}`;
  
  return sendSMS(booking.confirmationSms, message);
}
