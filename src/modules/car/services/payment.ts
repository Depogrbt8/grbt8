// Araç Kiralama Ödeme Servisi

import type { CarBooking, PriceBreakdown } from '../types';

/**
 * Ödeme işlemi başlat
 */
export async function initiatePayment(
  booking: CarBooking,
  paymentMethod: 'credit_card' | 'debit_card',
  cardDetails?: {
    cardNumber: string;
    cardHolderName: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
  }
): Promise<{
  success: boolean;
  paymentId?: string;
  redirectUrl?: string; // 3D Secure için
  error?: string;
}> {
  try {
    const response = await fetch('/api/payment/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: booking.id,
        bookingType: 'car',
        amount: booking.priceBreakdown.total,
        currency: booking.priceBreakdown.currency,
        paymentMethod,
        cardDetails,
        description: `Araç Kiralama - ${booking.car.name}`,
        customerInfo: {
          name: `${booking.driver.firstName} ${booking.driver.lastName}`,
          email: booking.driver.email,
          phone: booking.driver.phone
        }
      })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      return {
        success: true,
        paymentId: result.paymentId,
        redirectUrl: result.redirectUrl
      };
    }
    
    return {
      success: false,
      error: result.error || 'Ödeme başlatılamadı'
    };
  } catch (error) {
    console.error('Ödeme başlatma hatası:', error);
    return {
      success: false,
      error: 'Ödeme işlemi sırasında bir hata oluştu'
    };
  }
}

/**
 * 3D Secure doğrulama tamamlandıktan sonra ödemeyi tamamla
 */
export async function completePayment(
  paymentId: string,
  bookingId: string
): Promise<{
  success: boolean;
  transactionId?: string;
  error?: string;
}> {
  try {
    const response = await fetch('/api/payment/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentId,
        bookingId,
        bookingType: 'car'
      })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      return {
        success: true,
        transactionId: result.transactionId
      };
    }
    
    return {
      success: false,
      error: result.error || 'Ödeme tamamlanamadı'
    };
  } catch (error) {
    console.error('Ödeme tamamlama hatası:', error);
    return {
      success: false,
      error: 'Ödeme işlemi sırasında bir hata oluştu'
    };
  }
}

/**
 * İade işlemi başlat
 */
export async function initiateRefund(
  bookingId: string,
  amount: number,
  reason: string
): Promise<{
  success: boolean;
  refundId?: string;
  error?: string;
}> {
  try {
    const response = await fetch('/api/payment/refund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId,
        bookingType: 'car',
        amount,
        reason
      })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      return {
        success: true,
        refundId: result.refundId
      };
    }
    
    return {
      success: false,
      error: result.error || 'İade işlemi başlatılamadı'
    };
  } catch (error) {
    console.error('İade başlatma hatası:', error);
    return {
      success: false,
      error: 'İade işlemi sırasında bir hata oluştu'
    };
  }
}

/**
 * Ödeme durumunu sorgula
 */
export async function checkPaymentStatus(
  paymentId: string
): Promise<{
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/payment/status/${paymentId}`);
    const result = await response.json();
    
    if (response.ok) {
      return {
        status: result.status,
        transactionId: result.transactionId
      };
    }
    
    return {
      status: 'failed',
      error: result.error || 'Durum sorgulanamadı'
    };
  } catch (error) {
    console.error('Ödeme durumu sorgulama hatası:', error);
    return {
      status: 'failed',
      error: 'Durum sorgulama sırasında bir hata oluştu'
    };
  }
}

/**
 * Fiyat hesaplama (güncellenmiş)
 */
export function calculateTotalPrice(
  basePrice: number,
  days: number,
  extras: { price: number; quantity: number; unit: 'per_day' | 'per_rental' }[],
  insurance?: { price: number },
  fees?: {
    youngDriverFee?: number;
    additionalDriverFee?: number;
    oneWayFee?: number;
    airportFee?: number;
  }
): PriceBreakdown {
  const pricePerDay = basePrice;
  const basePriceTotal = basePrice * days;
  
  // Ekstralar
  const extrasTotal = extras.reduce((sum, extra) => {
    const amount = extra.unit === 'per_day' 
      ? extra.price * days * extra.quantity
      : extra.price * extra.quantity;
    return sum + amount;
  }, 0);
  
  // Sigorta
  const insuranceTotal = insurance ? insurance.price * days : 0;
  
  // Özel ücretler
  const youngDriverFee = fees?.youngDriverFee || 0;
  const additionalDriverFee = fees?.additionalDriverFee || 0;
  const oneWayFee = fees?.oneWayFee || 0;
  const airportFee = fees?.airportFee || 0;
  
  const subtotal = basePriceTotal + extrasTotal + insuranceTotal + 
                   youngDriverFee + additionalDriverFee + oneWayFee + airportFee;
  
  const taxRate = 18; // %18 KDV
  const tax = Math.round((subtotal * taxRate) / 100);
  const total = subtotal + tax;
  
  return {
    basePrice: basePriceTotal,
    pricePerDay,
    days,
    extras: extras.map(e => ({
      name: 'Extra Service',
      amount: e.unit === 'per_day' ? e.price * days * e.quantity : e.price * e.quantity
    })),
    extrasTotal,
    insurance: insuranceTotal,
    youngDriverFee,
    additionalDriverFee,
    oneWayFee,
    airportFee,
    subtotal,
    tax,
    taxRate,
    total,
    currency: 'EUR'
  };
}
