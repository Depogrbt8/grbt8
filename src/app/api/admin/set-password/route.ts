import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { AdminPinSecurity } from '@/lib/adminSecurity';

const schema = z.object({
  pin: z.string().min(8),
  email: z.string().email(),
  newPassword: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pin, email, newPassword } = schema.parse(body);

    // Verify admin PIN strictly (exact match)
    const correctPin = AdminPinSecurity.getAdminPin();
    if (pin !== correctPin) {
      return NextResponse.json({ success: false, error: 'INVALID_PIN' }, { status: 401 });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    const updated = await prisma.user.update({
      where: { email },
      data: { password: hash },
      select: { id: true, email: true },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    const message = err?.message || 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}


