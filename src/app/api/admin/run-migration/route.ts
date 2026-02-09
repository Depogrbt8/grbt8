// Deploy sonrası migration tetikleme (CarBooking vb.)
// GET: tablo durumu, POST: CarBooking migration çalıştır

import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import prisma from '@/lib/prisma';

const CAR_BOOKING_MIGRATION = 'prisma/migrations/20260208000000_add_car_bookings/migration.sql';

/** CarBooking tablosu yoksa oluşturur (idempotent). GET Vercel Cron için de kullanılır. */
async function ensureCarBookingTable(): Promise<{ exists: boolean; created: boolean }> {
  const carCheck = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'CarBooking'
    ) as exists;
  `;
  const carBookingExists = carCheck[0]?.exists ?? false;
  if (carBookingExists) return { exists: true, created: false };
  const migrationPath = join(process.cwd(), CAR_BOOKING_MIGRATION);
  const sql = readFileSync(migrationPath, 'utf-8');
  await prisma.$executeRawUnsafe(sql);
  return { exists: true, created: true };
}

export async function GET() {
  try {
    const result = await ensureCarBookingTable();
    return NextResponse.json({
      success: true,
      tables: { CarBooking: result.exists },
      created: result.created,
      message: result.created ? 'CarBooking tablosu oluşturuldu' : 'CarBooking tablosu zaten mevcut',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // İsteğe bağlı: RUN_MIGRATION_SECRET ile koruma
    const secret = process.env.RUN_MIGRATION_SECRET;
    if (secret) {
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.replace(/^Bearer\s+/i, '') || request.headers.get('x-migration-secret');
      if (token !== secret) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
    }

    const result = await ensureCarBookingTable();
    return NextResponse.json({
      success: true,
      message: result.created ? 'CarBooking tablosu oluşturuldu' : 'CarBooking tablosu zaten mevcut',
      created: result.created,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Run migration error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
