import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';
import { checkAdminAccess } from '@/lib/adminAuth';

// GET: Provider listesi
export async function GET(request: NextRequest) {
  try {
    // Admin panel veya normal kullanıcı authentication kontrolü
    const authCheck = await checkAdminAccess(request);
    if (!authCheck.authorized) {
      return authCheck.error!;
    }

    const providers = await prisma.hotelApiProvider.findMany({
      orderBy: [
        { priority: 'asc' },
        { displayName: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        displayName: true,
        isActive: true,
        isTestMode: true,
        apiUrl: true,
        timeout: true,
        retryCount: true,
        priority: true,
        lastSyncAt: true,
        lastTestAt: true,
        healthStatus: true,
        errorCount: true,
        lastErrorAt: true,
        lastErrorMessage: true,
        description: true,
        documentationUrl: true,
        supportEmail: true,
        createdAt: true,
        updatedAt: true,
        // API key ve secret gösterilmez (güvenlik)
      }
    });

    return NextResponse.json({
      success: true,
      data: providers
    });
  } catch (error) {
    console.error('Hotel API provider list error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch providers' },
      { status: 500 }
    );
  }
}

// POST: Yeni provider oluştur
export async function POST(request: NextRequest) {
  try {
    // Admin panel veya normal kullanıcı authentication kontrolü
    const authCheck = await checkAdminAccess(request);
    if (!authCheck.authorized) {
      return authCheck.error!;
    }

    const body = await request.json();
    const {
      name,
      displayName,
      apiKey,
      apiSecret,
      apiUrl,
      accessToken,
      refreshToken,
      timeout,
      retryCount,
      retryDelay,
      priority,
      maxConcurrentRequests,
      healthCheckUrl,
      description,
      documentationUrl,
      supportEmail,
      isTestMode = true
    } = body;

    // Validasyon
    if (!name || !displayName) {
      return NextResponse.json(
        { success: false, error: 'Name and displayName are required' },
        { status: 400 }
      );
    }

    // API key ve secret şifrele
    const encryptedApiKey = apiKey ? encrypt(apiKey) : null;
    const encryptedApiSecret = apiSecret ? encrypt(apiSecret) : null;
    const encryptedAccessToken = accessToken ? encrypt(accessToken) : null;
    const encryptedRefreshToken = refreshToken ? encrypt(refreshToken) : null;

    const provider = await prisma.hotelApiProvider.create({
      data: {
        name,
        displayName,
        apiKey: encryptedApiKey,
        apiSecret: encryptedApiSecret,
        apiUrl,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        timeout: timeout || 30000,
        retryCount: retryCount || 3,
        retryDelay: retryDelay || 1000,
        priority: priority || 1,
        maxConcurrentRequests: maxConcurrentRequests || 10,
        healthCheckUrl,
        description,
        documentationUrl,
        supportEmail,
        isTestMode,
        isActive: false, // Yeni provider varsayılan olarak pasif
        healthStatus: 'unknown'
      }
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
    }, { status: 201 });
  } catch (error: any) {
    console.error('Hotel API provider create error:', error);
    
    // Unique constraint hatası
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Provider with this name already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create provider' },
      { status: 500 }
    );
  }
}

