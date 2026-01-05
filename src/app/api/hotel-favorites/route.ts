import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';

// POST: Otel favorilere ekle
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hotelId, hotelName, hotelLocation, hotelImage } = await req.json();
    if (!hotelId) {
      return NextResponse.json({ error: 'Hotel ID gerekli' }, { status: 400 });
    }

    // Zaten favori mi kontrol et
    const existing = await prisma.hotelFavorite.findUnique({
      where: {
        userId_hotelId: {
          userId: session.user.id,
          hotelId: hotelId
        }
      }
    });

    if (existing) {
      // Mevcut favoriyi güncelle (otel bilgileri değişmiş olabilir)
      const updated = await prisma.hotelFavorite.update({
        where: {
          userId_hotelId: {
            userId: session.user.id,
            hotelId: hotelId
          }
        },
        data: {
          hotelName: hotelName || existing.hotelName,
          hotelLocation: hotelLocation || existing.hotelLocation,
          hotelImage: hotelImage || existing.hotelImage,
          updatedAt: new Date()
        }
      });
      
      return NextResponse.json({ 
        success: true, 
        favorite: updated,
        message: 'Otel zaten favorilerinizde' 
      });
    }

    // Otel bilgisi verilmediyse API'den çek
    let finalHotelName = hotelName;
    let finalHotelLocation = hotelLocation;
    let finalHotelImage = hotelImage;

    if (!hotelName) {
      try {
        const { getHotelDetails } = await import('@/modules/hotel/services');
        const hotel = await getHotelDetails(hotelId);
        if (hotel) {
          finalHotelName = hotel.name;
          finalHotelLocation = hotel.location;
          finalHotelImage = hotel.image;
        }
      } catch (error) {
        // API'den çekilemezse varsayılan değerler
        finalHotelName = 'Unknown Hotel';
      }
    }

    const favorite = await prisma.hotelFavorite.create({
      data: {
        userId: session.user.id,
        hotelId: hotelId,
        hotelName: finalHotelName || 'Unknown Hotel',
        hotelLocation: finalHotelLocation,
        hotelImage: finalHotelImage,
      },
    });

    logger.info('Hotel favori eklendi', { userId: session.user.id, hotelId });
    return NextResponse.json({ success: true, favorite });
  } catch (error: any) {
    logger.error('Hotel favori ekleme hatası', { error });
    
    // Unique constraint hatası (zaten favori)
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        success: true,
        message: 'Otel zaten favorilerinizde' 
      });
    }
    
    return NextResponse.json({ 
      error: error?.message || 'Bilinmeyen hata' 
    }, { status: 500 });
  }
}

// GET: Kullanıcının favori otellerini getir
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get('hotelId');
    const userId = searchParams.get('userId'); // Admin panel için

    // Admin panel authentication kontrolü
    const adminPanelToken = req.headers.get('x-admin-panel-token');
    const adminPanelSecret = process.env.ADMIN_PANEL_SECRET;
    const isAdminPanel = adminPanelToken === adminPanelSecret;

    let targetUserId: string | null = null;

    if (isAdminPanel) {
      // Admin panel'den gelen istek - userId parametresi zorunlu
      if (!userId) {
        return NextResponse.json({ error: 'userId parametresi gerekli' }, { status: 400 });
      }
      targetUserId = userId;
    } else {
      // Normal kullanıcı isteği - session kontrolü
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      targetUserId = session.user.id;
    }

    // Belirli bir otel favori mi kontrol et
    if (hotelId) {
      const favorite = await prisma.hotelFavorite.findUnique({
        where: {
          userId_hotelId: {
            userId: targetUserId,
            hotelId: hotelId
          }
        }
      });
      return NextResponse.json({ 
        isFavorite: !!favorite,
        favorite: favorite || null
      });
    }

    // Tüm favori otelleri getir
    const favorites = await prisma.hotelFavorite.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        hotelId: true,
        hotelName: true,
        hotelLocation: true,
        hotelImage: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ 
      favorites: favorites,
      hotelIds: favorites.map(f => f.hotelId)
    });
  } catch (error: any) {
    logger.error('Hotel favori listesi hatası', { error });
    return NextResponse.json({ 
      error: error?.message || 'Bilinmeyen hata' 
    }, { status: 500 });
  }
}

// DELETE: Otel favorilerden çıkar
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get('hotelId');
    
    if (!hotelId) {
      return NextResponse.json({ error: 'Hotel ID gerekli' }, { status: 400 });
    }

    const favorite = await prisma.hotelFavorite.findUnique({ 
      where: {
        userId_hotelId: {
          userId: session.user.id,
          hotelId: hotelId
        }
      }
    });
    
    if (!favorite) {
      return NextResponse.json({ 
        success: true,
        message: 'Otel favorilerinizde değil' 
      });
    }

    if (favorite.userId !== session.user.id) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    await prisma.hotelFavorite.delete({ 
      where: { 
        id: favorite.id 
      } 
    });
    
    logger.info('Hotel favori silindi', { userId: session.user.id, hotelId });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('Hotel favori silme hatası', { error });
    return NextResponse.json({ 
      error: error?.message || 'Bilinmeyen hata' 
    }, { status: 500 });
  }
}

