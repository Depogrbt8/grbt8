import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Geçici olarak güvenlik kontrolü devre dışı (test için)
    console.log('🔧 HotelFavorite migration başlatılıyor...');

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
      console.log('✅ HotelFavorite tablosu zaten mevcut');
      return NextResponse.json({ 
        success: true,
        message: 'HotelFavorite tablosu zaten mevcut',
        tableExists: true
      });
    }

    console.log('📦 HotelFavorite tablosu oluşturuluyor...');

    // Migration SQL'ini oku ve çalıştır
    const migrationPath = join(process.cwd(), 'prisma/migrations/20241201120000_add_hotel_favorites/migration.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    console.log('SQL:', migrationSQL);
    
    await prisma.$executeRawUnsafe(migrationSQL);
    
    console.log('✅ HotelFavorite tablosu oluşturuldu');

    return NextResponse.json({ 
      success: true,
      message: 'HotelFavorite tablosu başarıyla oluşturuldu',
      tableExists: false,
      created: true,
      sql: migrationSQL
    });

  } catch (error: any) {
    console.error('❌ Migration error:', error);
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

    // Tüm tabloları listele
    const allTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    return NextResponse.json({ 
      success: true,
      tableExists,
      message: tableExists 
        ? 'HotelFavorite tablosu mevcut' 
        : 'HotelFavorite tablosu mevcut değil',
      allTables
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

