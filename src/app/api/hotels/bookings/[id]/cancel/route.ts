import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAdminAccess } from '@/lib/adminAuth';
import { getUserIdFromRequest } from '@/lib/jwtAuth';

// POST: Otel rezervasyonu iptal et
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Rezervasyon ID gereklidir' },
        { status: 400 }
      );
    }

    // Auth kontrolü: Admin panel veya normal kullanıcı
    const adminCheck = await checkAdminAccess(request);
    let userId: string | null = null;
    let isAdmin = false;

    if (adminCheck.authorized && adminCheck.isAdminPanel) {
      // Admin panel'den gelen iptal isteği
      isAdmin = true;
    } else {
      // JWT token (mobil) veya NextAuth session (web) ile userId al
      const currentUserId = await getUserIdFromRequest(request);
      if (!currentUserId) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
      userId = currentUserId;

      // Veritabanından admin kontrolü
      const currentUser = await prisma.user.findUnique({
        where: { id: currentUserId },
        select: { role: true }
      });
      if (currentUser?.role === 'admin') {
        isAdmin = true;
      }
    }

    // Rezervasyonu bul
    const booking = await prisma.hotelBooking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Rezervasyon bulunamadı' },
        { status: 404 }
      );
    }

    // Normal kullanıcı sadece kendi rezervasyonunu iptal edebilir
    if (!isAdmin && booking.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Bu rezervasyonu iptal etme yetkiniz yok' },
        { status: 403 }
      );
    }

    // Zaten iptal edilmiş mi kontrol et
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { success: false, error: 'Bu rezervasyon zaten iptal edilmiş' },
        { status: 400 }
      );
    }

    // İptal nedeni (opsiyonel)
    let cancellationReason: string | undefined;
    try {
      const body = await request.json();
      cancellationReason = body.reason;
    } catch {
      // Body boş olabilir, sorun değil
    }

    // Rezervasyonu iptal et
    const updatedBooking = await prisma.hotelBooking.update({
      where: { id: bookingId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: cancellationReason || 'Kullanıcı talebi ile iptal edildi'
      }
    });

    // İade tutarını hesapla (cancellation policy'ye göre)
    let refundAmount = 0;
    let refundMessage = '';

    if (booking.cancellationPolicy === 'free' || booking.cancellationPolicy?.includes('free') || booking.cancellationPolicy?.includes('Ücretsiz')) {
      refundAmount = booking.totalPrice;
      refundMessage = 'Tam iade yapılacaktır.';
    } else if (booking.cancellationPolicy === 'partial' || booking.cancellationPolicy?.includes('partial') || booking.cancellationPolicy?.includes('Kısmi')) {
      refundAmount = booking.totalPrice * 0.5;
      refundMessage = 'Kısmi iade (%50) yapılacaktır.';
    } else {
      refundAmount = 0;
      refundMessage = 'İade yapılmayacaktır (non-refundable).';
    }

    return NextResponse.json({
      success: true,
      data: {
        booking: updatedBooking,
        refundAmount,
        refundCurrency: booking.currency,
        message: `Rezervasyon başarıyla iptal edildi. ${refundMessage}`
      }
    });
  } catch (error) {
    console.error('Hotel booking cancel error:', error);
    return NextResponse.json(
      { success: false, error: 'Rezervasyon iptal edilirken hata oluştu' },
      { status: 500 }
    );
  }
}
