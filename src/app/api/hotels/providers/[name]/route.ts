import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';
import { checkAdminAccess } from '@/lib/adminAuth';

// GET: Provider detayı
export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    // Admin panel veya normal kullanıcı authentication kontrolü
    const authCheck = await checkAdminAccess(request);
    if (!authCheck.authorized) {
      return authCheck.error!;
    }

    const provider = await prisma.hotelApiProvider.findUnique({
      where: { name: params.name },
      include: {
        _count: {
          select: { bookings: true }
        }
      }
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }

    // API key ve secret gösterilmez, sadece varlığı belirtilir
    return NextResponse.json({
      success: true,
      data: {
        ...provider,
        apiKey: provider.apiKey ? '***encrypted***' : null,
        apiSecret: provider.apiSecret ? '***encrypted***' : null,
        accessToken: provider.accessToken ? '***encrypted***' : null,
        refreshToken: provider.refreshToken ? '***encrypted***' : null,
        bookingCount: provider._count.bookings
      }
    });
  } catch (error) {
    console.error('Hotel API provider detail error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch provider' },
      { status: 500 }
    );
  }
}

// PUT: Provider güncelleme
export async function PUT(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    // Admin panel veya normal kullanıcı authentication kontrolü
    const authCheck = await checkAdminAccess(request);
    if (!authCheck.authorized) {
      return authCheck.error!;
    }

    const body = await request.json();
    const updateData: any = {};

    // Sadece gönderilen alanları güncelle
    if (body.displayName !== undefined) updateData.displayName = body.displayName;
    if (body.apiUrl !== undefined) updateData.apiUrl = body.apiUrl;
    if (body.timeout !== undefined) updateData.timeout = body.timeout;
    if (body.retryCount !== undefined) updateData.retryCount = body.retryCount;
    if (body.retryDelay !== undefined) updateData.retryDelay = body.retryDelay;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.maxConcurrentRequests !== undefined) updateData.maxConcurrentRequests = body.maxConcurrentRequests;
    if (body.healthCheckUrl !== undefined) updateData.healthCheckUrl = body.healthCheckUrl;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.documentationUrl !== undefined) updateData.documentationUrl = body.documentationUrl;
    if (body.supportEmail !== undefined) updateData.supportEmail = body.supportEmail;
    if (body.isTestMode !== undefined) updateData.isTestMode = body.isTestMode;

    // API key ve secret şifreleme ile güncelle
    if (body.apiKey !== undefined) {
      updateData.apiKey = body.apiKey ? encrypt(body.apiKey) : null;
    }
    if (body.apiSecret !== undefined) {
      updateData.apiSecret = body.apiSecret ? encrypt(body.apiSecret) : null;
    }
    if (body.accessToken !== undefined) {
      updateData.accessToken = body.accessToken ? encrypt(body.accessToken) : null;
    }
    if (body.refreshToken !== undefined) {
      updateData.refreshToken = body.refreshToken ? encrypt(body.refreshToken) : null;
    }

    const provider = await prisma.hotelApiProvider.update({
      where: { name: params.name },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: {
        id: provider.id,
        name: provider.name,
        displayName: provider.displayName,
        isActive: provider.isActive,
        isTestMode: provider.isTestMode,
        healthStatus: provider.healthStatus
      }
    });
  } catch (error: any) {
    console.error('Hotel API provider update error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update provider' },
      { status: 500 }
    );
  }
}

// DELETE: Provider silme
export async function DELETE(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    // Admin panel veya normal kullanıcı authentication kontrolü
    const authCheck = await checkAdminAccess(request);
    if (!authCheck.authorized) {
      return authCheck.error!;
    }

    // Aktif provider silinemez
    const provider = await prisma.hotelApiProvider.findUnique({
      where: { name: params.name }
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }

    if (provider.isActive) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete active provider. Please deactivate first.' },
        { status: 400 }
      );
    }

    await prisma.hotelApiProvider.delete({
      where: { name: params.name }
    });

    return NextResponse.json({
      success: true,
      message: 'Provider deleted successfully'
    });
  } catch (error) {
    console.error('Hotel API provider delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete provider' },
      { status: 500 }
    );
  }
}

