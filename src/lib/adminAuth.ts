import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/** Tüm /grbt-8 sayfalarında aynı liste kullanılsın (.com ve .store dahil) */
const DEFAULT_ADMIN_EMAILS = 'admin@grbt8.store,admin@grbt8.com,manager@grbt8.store';

export function getAdminAllowEmails(): string[] {
  return (process.env.ADMIN_EMAILS || DEFAULT_ADMIN_EMAILS)
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminAllowEmails().includes(email.trim().toLowerCase());
}

/**
 * Admin panel veya normal kullanıcı authentication kontrolü
 * Admin panel'den gelen istekler için token kontrolü yapar
 * Normal kullanıcı istekleri için session kontrolü yapar
 */
export async function checkAdminAccess(request: NextRequest): Promise<{
  authorized: boolean;
  isAdminPanel: boolean;
  error?: NextResponse;
}> {
  // Admin panel token kontrolü
  const adminPanelToken = request.headers.get('x-admin-panel-token');
  const adminPanelSecret = process.env.ADMIN_PANEL_SECRET;
  const isAdminPanel = adminPanelToken === adminPanelSecret;

  if (isAdminPanel) {
    // Admin panel'den gelen istek - token kontrolü yeterli
    // Admin panel zaten kendi admin kontrolünü yapıyor
    return { authorized: true, isAdminPanel: true };
  }

  // Normal kullanıcı isteği - session kontrolü yap
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return {
      authorized: false,
      isAdminPanel: false,
      error: NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    };
  }

  // Admin kontrolü
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (user?.role !== 'admin') {
    return {
      authorized: false,
      isAdminPanel: false,
      error: NextResponse.json(
        { success: false, error: 'Unauthorized - Admin only' },
        { status: 403 }
      )
    };
  }

  return { authorized: true, isAdminPanel: false };
}

