import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/auth/check-email
 * Body: { email: string }
 * Response: { exists: boolean } | { error: string }
 *
 * Üye olma formunda e-posta inputu focus'tan çıkınca (onBlur) çağrılır.
 * Oturum / kimlik doğrulama gerektirmez; sadece e-postanın daha önce
 * kayıtlı olup olmadığını döner. Şifre veya diğer bilgiler asla dönmez.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null) as { email?: string } | null;
    const email = body?.email?.toString().trim().toLowerCase() ?? '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Geçersiz e-posta adresi' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return NextResponse.json({ exists: Boolean(user) });
  } catch (error) {
    console.error('check-email error:', error);
    // Hata durumunda UI'da blocker olmaması için exists:false dönüyoruz
    return NextResponse.json({ exists: false });
  }
}
