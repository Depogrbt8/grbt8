import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAdminAccess } from '@/lib/adminAuth';

// POST: Aktif/Pasif toggle
export async function POST(
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
      where: { name: params.name }
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Toggle işlemi
    const updatedProvider = await prisma.hotelApiProvider.update({
      where: { name: params.name },
      data: {
        isActive: !provider.isActive
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        name: updatedProvider.name,
        displayName: updatedProvider.displayName,
        isActive: updatedProvider.isActive
      }
    });
  } catch (error) {
    console.error('Hotel API provider toggle error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle provider' },
      { status: 500 }
    );
  }
}

