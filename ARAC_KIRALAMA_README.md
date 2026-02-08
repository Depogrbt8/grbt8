# Araç Kiralama Modülü - Kullanım Kılavuzu

## 🚀 Kurulum

### 1. Database Migration

Production'da migration'ı çalıştırın:

```bash
npx prisma migrate deploy
npx prisma generate
```

Migration dosyası: `prisma/migrations/20260208000000_add_car_bookings/migration.sql`

### 2. API Initialization

Sistem otomatik olarak demo API ile başlar. Gerçek API'ye geçmek için:

```typescript
// src/modules/car/init.ts dosyasını düzenle:
import { rentalcarsAPI } from './services/adapters/rentalcars';
setCarRentalAPI(rentalcarsAPI);
```

## 📁 Modül Yapısı

```
src/modules/car/
├── types/              # TypeScript type definitions
│   ├── car.ts         # Ana tipler (Booking.com uyumlu)
│   └── index.ts       # Export
├── services/          # API ve servisler
│   ├── adapters/      # API adapter'ları
│   │   └── demo.ts   # Demo API (mock data)
│   ├── api.ts        # API interface
│   ├── email.ts      # Email servisi
│   ├── sms.ts        # SMS servisi
│   ├── payment.ts    # Ödeme servisi
│   └── index.ts      # Export
├── components/        # React component'leri
│   ├── CarCard.tsx   # Liste görünümü
│   ├── CarList.tsx   # Araç listesi
│   ├── CarSearchForm.tsx  # Arama formu
│   ├── CarFilters.tsx     # Filtreler
│   └── index.ts      # Export
├── hooks/            # Custom hooks
│   ├── useCarSearch.ts    # Arama hook
│   ├── useCarDetails.ts   # Detay hook
│   └── index.ts      # Export
├── utils/            # Yardımcı fonksiyonlar
│   └── index.ts      # Formatters, validators
├── init.ts           # Modül initialization
└── index.ts          # Ana export

src/app/
├── cars/
│   ├── search/page.tsx    # Arama sonuçları
│   ├── [id]/page.tsx      # Araç detay
│   └── booking/page.tsx   # Rezervasyon formu
├── api/cars/bookings/
│   ├── route.ts           # GET, POST
│   ├── [id]/route.ts      # GET, PATCH
│   └── [id]/cancel/route.ts  # POST
└── grbt-8/
    └── arac-rezervasyonlari/page.tsx  # Admin panel
```

## 🎯 Özellikler

### ✅ Tamamlanan

1. **Modüler Yapı**
   - Booking.com Cars API uyumlu
   - Adapter pattern ile kolay API değişimi
   - TypeScript ile tam tip güvenliği

2. **Component'ler**
   - Mobil responsive
   - Otel/uçuş ile tutarlı UI
   - Loading ve error states

3. **API Routes**
   - RESTful yapı
   - Authentication
   - Error handling

4. **Database**
   - Prisma ORM
   - JSON field'lar (esnek yapı)
   - Index'ler (performans)

5. **Bildirimler**
   - Email (onay, iptal, hatırlatma)
   - SMS (onay, iptal, hatırlatma)

6. **Ödeme**
   - 3D Secure desteği
   - İade sistemi
   - Durum takibi

7. **Admin Panel**
   - Rezervasyon listesi
   - Filtreleme ve arama
   - CSV export
   - İstatistikler

## 📊 Database Schema

```prisma
model CarBooking {
  id                  String    @id @default(cuid())
  userId              String
  bookingNumber       String    @unique
  
  // Araç bilgileri (JSON)
  carId               String
  carName             String
  carCategory         String
  transmission        String
  fuelType            String
  seats               Int
  
  // Tedarikçi
  supplierId          Int
  supplierName        String
  
  // Rota (JSON field'lar)
  pickupLocation      String    // JSON: CarLocation
  dropoffLocation     String    // JSON: CarLocation
  pickupDateTime      DateTime
  dropoffDateTime     DateTime
  
  // Sürücü (JSON)
  driver              String    // JSON: Driver
  additionalDrivers   String?   // JSON: Driver[]
  
  // Hizmetler (JSON)
  extras              String?   // JSON: ExtraService[]
  insurance           String?   // JSON: InsuranceOption
  
  // Fiyat (JSON)
  priceBreakdown      String    // JSON: PriceBreakdown
  totalPrice          Float
  currency            String    @default("EUR")
  
  // Durum
  status              String    @default("pending")
  
  // İlişkiler
  user                User      @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([status])
  @@index([bookingNumber])
  @@index([pickupDateTime])
}
```

## 🔄 API Endpoints

### Kullanıcı API'leri

```typescript
// Rezervasyon listesi
GET /api/cars/bookings
Query: page, limit, status
Response: { bookings, pagination }

// Rezervasyon oluştur
POST /api/cars/bookings
Body: CarBookingData
Response: { booking }

// Rezervasyon detay
GET /api/cars/bookings/[id]
Response: { booking }

// Rezervasyon güncelle
PATCH /api/cars/bookings/[id]
Body: { status, ... }
Response: { booking }

// Rezervasyon iptal
POST /api/cars/bookings/[id]/cancel
Body: { reason }
Response: { booking, refundAmount, message }
```

## 🎨 Component Kullanımı

### Arama Formu

```tsx
import { CarSearchForm } from '@/modules/car/components';

<CarSearchForm
  initialValues={{
    pickupLocationId: 'IST-airport',
    dropoffLocationId: 'IST-airport',
    pickupDate: '2026-03-01',
    pickupTime: '10:00',
    dropoffDate: '2026-03-07',
    dropoffTime: '10:00',
    driverAge: 30
  }}
/>
```

### Araç Listesi

```tsx
import { CarList } from '@/modules/car/components';

<CarList
  cars={cars}
  searchToken={searchToken}
  loading={loading}
/>
```

### Filtreler

```tsx
import { CarFilters } from '@/modules/car/components';

<CarFilters
  filters={filters}
  onFiltersChange={setFilters}
  suppliers={supplierStats}
  priceRange={{ min: 0, max: 1000 }}
/>
```

## 🔧 Servis Kullanımı

### Araç Arama

```typescript
import { searchCars } from '@/modules/car/services';

const result = await searchCars({
  route: {
    pickup: {
      location: { id: 'IST-airport', ... },
      datetime: '2026-03-01T10:00:00'
    },
    dropoff: {
      location: { id: 'IST-airport', ... },
      datetime: '2026-03-07T10:00:00'
    }
  },
  driver: { age: 30 },
  booker: { country: 'tr' },
  currency: 'EUR'
});
```

### Rezervasyon Oluşturma

```typescript
import { createBooking } from '@/modules/car/services';

const booking = await createBooking({
  carId: 'car-123',
  searchToken: 'token...',
  route: { ... },
  driver: { ... },
  payment: {
    method: 'credit_card',
    timing: 'pay_online_now'
  }
});
```

### Email Gönderme

```typescript
import { sendBookingConfirmationEmail } from '@/modules/car/services';

await sendBookingConfirmationEmail(booking);
```

### SMS Gönderme

```typescript
import { sendBookingConfirmationSMS } from '@/modules/car/services';

await sendBookingConfirmationSMS(booking);
```

### Ödeme İşlemi

```typescript
import { initiatePayment, completePayment } from '@/modules/car/services';

// 1. Ödeme başlat
const result = await initiatePayment(booking, 'credit_card');

// 2. 3D Secure varsa yönlendir
if (result.redirectUrl) {
  window.location.href = result.redirectUrl;
}

// 3. Ödeme tamamla
const complete = await completePayment(result.paymentId, booking.id);
```

## 🔐 Güvenlik

- ✅ Authentication (next-auth)
- ✅ Authorization (user ownership)
- ✅ Input validation
- ✅ SQL injection koruması (Prisma)
- ✅ XSS koruması (React)
- ✅ CSRF koruması

## 📈 Performans

- ✅ Database index'leri
- ✅ API pagination
- ✅ Lazy loading (dynamic imports)
- ✅ Image optimization (next/image)
- ✅ Caching (search token 90 dakika)

## 🧪 Test

```bash
# Unit testler
npm test

# E2E testler
npm run test:e2e

# Type check
npm run type-check
```

## 📝 Yapılacaklar (Opsiyonel)

- [ ] Gerçek API entegrasyonu (Rentalcars.com)
- [ ] Cron job'lar (hatırlatma email/SMS)
- [ ] Analytics entegrasyonu
- [ ] A/B testing
- [ ] Multi-language support
- [ ] PWA özellikleri

## 🆘 Sorun Giderme

### Database bağlantı hatası

```bash
# .env dosyasını kontrol et
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"

# Migration'ı çalıştır
npx prisma migrate deploy
```

### API hatası

```typescript
// init.ts dosyasını kontrol et
// Demo API aktif mi?
import { demoCarAPI } from './services/adapters/demo';
setCarRentalAPI(demoCarAPI);
```

### Email/SMS gönderilmiyor

```typescript
// API endpoint'leri kontrol et
// /api/email/send
// /api/sms/send
```

## 📞 Destek

Sorularınız için: [GitHub Issues](https://github.com/Depogrbt8/grbt8/issues)

---

**Versiyon:** 1.0.0  
**Son Güncelleme:** 8 Şubat 2026  
**Geliştirici:** Gurbetbiz Team
