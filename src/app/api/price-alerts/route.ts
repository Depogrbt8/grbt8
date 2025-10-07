import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { logger } from '@/lib/logger';

async function sendPriceAlertMail(to: string, alert: any) {
  const subject = 'Fiyat Alarmınız Oluşturuldu';
  const text = `Fiyat alarmınız başarıyla oluşturuldu!\n\nRota: ${alert.origin} -> ${alert.destination}\nTarih: ${alert.departureDate}${alert.targetPrice ? `\nHedef Fiyat: ${alert.targetPrice} EUR` : ''}`;
  const html = `<b>Fiyat alarmınız başarıyla oluşturuldu!</b><br/>Rota: ${alert.origin} → ${alert.destination}<br/>Tarih: ${alert.departureDate}${alert.targetPrice ? `<br/>Hedef Fiyat: ${alert.targetPrice} EUR` : ''}`;

  // If RESEND is configured, prefer it (optional dynamic import to avoid hard dependency during build)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const mod = await import('resend');
      const Resend = mod?.Resend as any;
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: process.env.RESEND_FROM || 'Gurbet.biz <no-reply@gurbet.biz>',
        to,
        subject,
        text,
        html,
      });
      return;
    } catch (e) {
      // Resend paketi ortamda yoksa sessizce SMTP fallback'e geç
      logger.warn('RESEND module not available, falling back to SMTP');
    }
  }

  // Fallback to SMTP (secure in production)
  const isProd = process.env.NODE_ENV === 'production';
  const useStartTLS = process.env.SMTP_STARTTLS === 'true';
  const port = isProd ? (useStartTLS ? 587 : 465) : Number(process.env.SMTP_PORT || 587);
  const secure = isProd ? !useStartTLS : false; // 465=>true, 587=>false
  const requireTLS = isProd ? !!useStartTLS : false;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    requireTLS,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'Gurbet.biz <no-reply@gurbet.biz>',
    to,
    subject,
    text,
    html,
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { origin, destination, departureDate, targetPrice } = await req.json();
    if (!origin || !destination || !departureDate) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
    }
    const alert = await prisma.priceAlert.create({
      data: {
        userId: session.user.id,
        origin,
        destination,
        departureDate: new Date(departureDate),
        targetPrice: targetPrice ? parseFloat(targetPrice) : null,
      },
    });
    // E-posta gönderimi
    if (session.user.email) {
      try {
        await sendPriceAlertMail(session.user.email, alert);
      } catch (e) {
        logger.error('E-posta gönderilemedi', { error: e });
      }
    }
    return NextResponse.json({ success: true, alert });
  } catch (error: any) {
    logger.error('API error', { error });
    return NextResponse.json({ error: error?.message || 'Bilinmeyen hata' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const alerts = await prisma.priceAlert.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ alerts });
  } catch (error: any) {
    logger.error('API error', { error });
    return NextResponse.json({ error: error?.message || 'Bilinmeyen hata' }, { status: 500 });
  }
} 