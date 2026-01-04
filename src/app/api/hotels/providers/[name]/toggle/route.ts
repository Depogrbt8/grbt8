import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST: Aktif/Pasif toggle
export async function POST(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Admin kontrolü
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin only' },
        { status: 403 }
      );
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

