import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Güvenlik: Sadece admin veya belirli bir secret key ile erişim
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== process.env.MIGRATION_SECRET) {
      return NextResponse.json({ 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    // HotelFavorite tablosunu kontrol et
    const tableCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'HotelFavorite'
      );
    `;
    
    const tableExists = (tableCheck as any)[0]?.exists || false;

    if (tableExists) {
      return NextResponse.json({ 
        success: true,
        message: 'HotelFavorite tablosu zaten mevcut',
        tableExists: true
      });
    }

    // Migration SQL'ini oku ve çalıştır
    const migrationPath = join(process.cwd(), 'prisma/migrations/20241201120000_add_hotel_favorites/migration.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    await prisma.$executeRawUnsafe(migrationSQL);
    
    // Prisma Client'ı yeniden generate et (runtime'da etkili olmayabilir)
    // await exec('npx prisma generate');

    return NextResponse.json({ 
      success: true,
      message: 'HotelFavorite tablosu başarıyla oluşturuldu',
      tableExists: false,
      created: true
    });

  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    // Tablo durumunu kontrol et
    const tableCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'HotelFavorite'
      );
    `;
    
    const tableExists = (tableCheck as any)[0]?.exists || false;

    return NextResponse.json({ 
      success: true,
      tableExists,
      message: tableExists 
        ? 'HotelFavorite tablosu mevcut' 
        : 'HotelFavorite tablosu mevcut değil'
    });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false,
      error: error.message
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

