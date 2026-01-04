#!/bin/bash
# Vercel Postbuild Hook - HotelFavorite Migration
# Bu script build sonrası otomatik çalışacak

echo "🔧 Postbuild: HotelFavorite migration kontrolü"

# Prisma generate
npx prisma generate

# Migration script'i çalıştır
node scripts/run-migration-safe.js

echo "✅ Postbuild tamamlandı"

