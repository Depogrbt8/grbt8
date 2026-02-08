# ARAÇ KİRALAMA SİSTEMİ İMPLEMENTASYON RAPORU
## Gurbetbiz - Araç Kiralama Arama, Liste ve Rezervasyon Sistemi

**Tarih:** 2026  
**Proje:** Gurbetbiz Araç Kiralama Modülü  
**Durum:** Planlama Aşaması

---

## 📋 İÇİNDEKİLER

1. [Genel Bakış](#genel-bakış)
2. [Mevcut Sistem Analizi](#mevcut-sistem-analizi)
3. [Araç Kiralama Sistemi Mimarisi](#araç-kiralama-sistemi-mimarisi)
4. [Modüler Yapı](#modüler-yapı)
5. [Dosya Yapısı](#dosya-yapısı)
6. [API Yapısı ve Servisler](#api-yapısı-ve-servisler)
7. [Component Yapısı](#component-yapısı)
8. [Veri Modelleri](#veri-modelleri)
9. [Implementasyon Adımları](#implementasyon-adımları)
10. [Admin Panel Entegrasyonu](#admin-panel-entegrasyonu)
11. [API Entegrasyon Stratejisi](#api-entegrasyon-stratejisi)
12. [Teknik Detaylar](#teknik-detaylar)

---

## 🎯 GENEL BAKIŞ

### Amaç
Mevcut uçuş ve otel sistemlerine benzer şekilde, araç kiralama arama, liste görüntüleme ve rezervasyon yapma özelliklerini eklemek. Sistem, gerçek API'lere hazır bir demo yapı ile başlayacak ve ileride Rentalcars.com, CarTrawler, Garenta veya Enterprise gibi sağlayıcılarla entegre edilebilecek.

### Hedef Kullanıcı
- **Gurbetçiler:** Türkiye'ye tatile gelirken havalimanından araç kiralama
- **Yurt içi kullanıcılar:** Şehir içi veya şehirlerarası araç kiralama
- **Kurumsal müşteriler:** Toplu araç kiralama ihtiyaçları

### Temel Özellikler
- ✅ Araç arama formu (alış/teslim lokasyonu, tarih, saat)
- ✅ Araç listesi ve filtreleme (araç tipi, fiyat, yakıt, vites)
- ✅ Araç detay sayfası (özellikler, sigorta, ekstra hizmetler)
- ✅ Rezervasyon işlemi (sürücü bilgileri, ek hizmetler)
- ✅ Ödeme entegrasyonu (mevcut sistemle uyumlu)
- ✅ Rezervasyon yönetimi (iptal, değişiklik)

### Kullanım Senaryoları

#### Senaryo 1: Havalimanı Araç Kiralama
```
Kullanıcı: Almanya'dan Antalya'ya tatile gelen gurbetçi
Akış:
1. Antalya Havalimanı (AYT) - Alış lokasyonu
2. Antalya Havalimanı (AYT) - Teslim lokasyonu
3. 15 Ağustos 10:00 - 25 Ağustos 10:00 (10 gün)
4. Araç seç: Ekonomi / Kompakt / SUV
5. Ekstra: Çocuk koltuğu, GPS, Tam sigorta
6. Rezervasyon tamamla
```

#### Senaryo 2: Şehirlerarası Araç Kiralama
```
Kullanıcı: İstanbul'dan İzmir'e gidecek
Akış:
1. İstanbul Sabiha Gökçen - Alış
2. İzmir Adnan Menderes - Teslim (tek yön)
3. Farklı lokasyon ücreti hesaplanır
4. Araç seç ve rezerve et
```

#### Senaryo 3: Şehir İçi Kiralama
```
Kullanıcı: Ankara'da 3 günlük araç ihtiyacı
Akış:
1. Ankara Merkez Ofis - Alış
2. Ankara Merkez Ofis - Teslim
3. Kısa süreli kiralama (günlük fiyat)
```

---

## 🔍 MEVCUT SİSTEM ANALİZİ

### Uçuş ve Otel Sistemi Yapısı (Referans)

#### Ortak Pattern'ler

**1. Modüler Yapı**
```
modules/
├── flight/          # Uçuş modülü
│   ├── components/
│   ├── services/
│   ├── hooks/
│   └── types/
└── hotel/           # Otel modülü
    ├── components/
    ├── services/
    ├── hooks/
    └── types/
```

**2. Service Layer Pattern**
```typescript
// API Abstraction
interface FlightAPI {
  search(params): Promise<Flight[]>
  getDetails(id): Promise<FlightDetails>
  book(data): Promise<Booking>
}

// Adapter Pattern
class BiletDukkaniAdapter implements FlightAPI { ... }
class DemoFlightAPI implements FlightAPI { ... }
```

**3. Component Pattern**
- **SearchForm:** Arama parametreleri
- **List:** Sonuç listesi
- **Card:** Tek item görünümü
- **Filters:** Filtreleme seçenekleri
- **Booking:** Rezervasyon akışı

#### Araç Kiralama İçin Uyarlanacak Yapı

**Benzerlikler:**
- Arama formu (tarih, lokasyon)
- Liste görünümü (filtreleme)
- Detay sayfası
- Rezervasyon akışı
- Ödeme entegrasyonu

**Farklılıklar:**
- **Lokasyon:** Havalimanı + şehir merkezi ofisleri
- **Tek Yön:** Farklı alış/teslim lokasyonu
- **Ekstra Hizmetler:** Çocuk koltuğu, GPS, ek sürücü, sigorta
- **Yaş Kısıtı:** Sürücü yaşı kontrolü (genelde 21-25 yaş minimum)
- **Ehliyet:** Ehliyet bilgisi ve süresi
- **Yakıt Politikası:** Dolu/dolu, dolu/boş seçenekleri

---

## 🏗️ ARAÇ KİRALAMA SİSTEMİ MİMARİSİ

### Mimari Yaklaşım
```
┌─────────────────────────────────────────┐
│   Frontend Layer (Next.js)              │
│   - CarSearchForm                        │
│   - CarList                              │
│   - CarDetails                           │
│   - BookingPage                          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   API Service Layer (Abstraction)        │
│   - carApi.ts (Interface)                │
│   - carService.ts (Business Logic)       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Provider Adapters                      │
│   - rentalcarsAdapter.ts                 │
│   - carTrawlerAdapter.ts                 │
│   - garentaAdapter.ts                    │
│   - enterpriseAdapter.ts                 │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Demo API / Real API                    │
│   - Demo data (Initial)                   │
│   - Rentalcars / CarTrawler (Future)     │
└─────────────────────────────────────────┘
```

### Tasarım Prensipleri
1. **Mevcut Sistemle Uyumluluk:** Uçuş ve otel sistemi ile aynı pattern'leri kullan
2. **API Abstraction:** Gerçek API'ye geçişi kolaylaştıran katman
3. **Demo First:** Önce demo verilerle çalışan sistem, sonra gerçek API
4. **Modüler Yapı:** Her özellik ayrı component/service
5. **TypeScript:** Tip güvenliği için TypeScript kullanımı
6. **Responsive:** Mobil ve desktop uyumlu

---

## 📦 MODÜLER YAPI

### Modül Yaklaşımı

Araç kiralama sistemi, tüm kodların tek bir modül altında toplandığı **modüler bir yapı** ile oluşturulacaktır. Bu yaklaşım, uçuş ve otel modülleri ile tutarlılık sağlar.

### Modül Yapısı

Tüm araç kiralama ile ilgili kodlar `modules/car/` klasörü altında toplanacaktır:

```
src/
├── modules/
│   └── car/                            # Araç Kiralama Modülü
│       ├── components/                 # Tüm araç componentleri
│       │   ├── index.ts                # Component exports
│       │   ├── CarSearchForm.tsx       # Arama formu
│       │   ├── CarCard.tsx             # Araç kartı
│       │   ├── CarList.tsx             # Araç listesi
│       │   ├── CarFilters.tsx          # Filtreleme
│       │   ├── CarDetails.tsx          # Araç detayı
│       │   ├── LocationSelector.tsx    # Lokasyon seçici
│       │   ├── ExtraServices.tsx       # Ekstra hizmetler
│       │   └── booking/                # Rezervasyon componentleri
│       │       ├── index.ts
│       │       ├── CarBookingForm.tsx
│       │       ├── DriverForm.tsx
│       │       ├── InsuranceSelector.tsx
│       │       └── CarPriceSummary.tsx
│       │
│       ├── services/                   # API servisleri
│       │   ├── index.ts                # Service exports
│       │   ├── carApi.ts               # Ana API interface
│       │   ├── carService.ts           # Business logic
│       │   └── adapters/               # API adapters
│       │       ├── index.ts
│       │       ├── demoCarApi.ts       # Demo API
│       │       ├── rentalcarsAdapter.ts
│       │       ├── carTrawlerAdapter.ts
│       │       ├── garentaAdapter.ts
│       │       └── enterpriseAdapter.ts
│       │
│       ├── hooks/                      # Custom hooks
│       │   ├── index.ts                # Hook exports
│       │   ├── useCarState.ts
│       │   ├── useCarFilters.ts
│       │   ├── useCarBooking.ts
│       │   └── useLocationSearch.ts
│       │
│       ├── types/                      # TypeScript tipleri
│       │   ├── index.ts                # Type exports
│       │   └── car.ts
│       │
│       ├── utils/                      # Yardımcı fonksiyonlar
│       │   ├── index.ts                # Util exports
│       │   ├── carHelpers.ts
│       │   ├── carValidation.ts
│       │   ├── priceCalculator.ts
│       │   └── locationHelpers.ts
│       │
│       └── index.ts                    # Ana modül export
│
└── app/
    └── cars/                           # Next.js sayfaları (routing)
        ├── search/
        │   └── page.tsx                # Araç arama sonuçları
        ├── [id]/
        │   └── page.tsx                # Araç detay sayfası
        └── booking/
            └── page.tsx                # Rezervasyon sayfası
```

### Modül Export Yapısı

#### Ana Modül Export (`modules/car/index.ts`)

```typescript
// modules/car/index.ts
// Tüm modül export'ları buradan yapılır

export * from './components';
export * from './services';
export * from './hooks';
export * from './types';
export * from './utils';
```

#### Component Exports (`modules/car/components/index.ts`)

```typescript
// modules/car/components/index.ts
export { default as CarSearchForm } from './CarSearchForm';
export { default as CarCard } from './CarCard';
export { default as CarList } from './CarList';
export { default as CarFilters } from './CarFilters';
export { default as CarDetails } from './CarDetails';
export { default as LocationSelector } from './LocationSelector';
export { default as ExtraServices } from './ExtraServices';

// Booking components
export * from './booking';
```

#### Service Exports (`modules/car/services/index.ts`)

```typescript
// modules/car/services/index.ts
export * from './carApi';
export * from './carService';
export * from './adapters';
```

#### Hook Exports (`modules/car/hooks/index.ts`)

```typescript
// modules/car/hooks/index.ts
export { useCarState } from './useCarState';
export { useCarFilters } from './useCarFilters';
export { useCarBooking } from './useCarBooking';
export { useLocationSearch } from './useLocationSearch';
```

#### Type Exports (`modules/car/types/index.ts`)

```typescript
// modules/car/types/index.ts
export * from './car';
```

### Kullanım Örnekleri

#### Sayfa Kullanımı (`app/cars/search/page.tsx`)

```typescript
// app/cars/search/page.tsx
'use client';

import { 
  CarSearchForm, 
  CarCard, 
  CarFilters 
} from '@/modules/car/components';
import { searchCars } from '@/modules/car/services';
import { useCarState, useCarFilters } from '@/modules/car/hooks';
import type { Car, CarSearchParams } from '@/modules/car/types';

export default function CarSearchPage() {
  const { cars, loading, searchParams } = useCarState();
  const { filters, applyFilters } = useCarFilters();
  
  // ...
}
```

#### Component İçinde Kullanım

```typescript
// modules/car/components/CarList.tsx
import { CarCard } from './CarCard';
import type { Car } from '../types';
import { useCarFilters } from '../hooks';

export default function CarList({ cars }: { cars: Car[] }) {
  // ...
}
```

### Modüler Yapının Avantajları

1. **Kod Organizasyonu**
   - Tüm araç kiralama kodu tek bir yerde
   - Kolay bulma ve erişim
   - Net dosya yapısı

2. **Bakım Kolaylığı**
   - Değişiklikler sadece modül içinde
   - Diğer modüllerle (flight, hotel) çakışma yok
   - Test edilebilirlik

3. **Bağımsızlık**
   - Modül bağımsız çalışabilir
   - Diğer sistemlerle entegrasyon kolay
   - Gelecekte ayrı paket olarak çıkarılabilir

4. **Ölçeklenebilirlik**
   - Yeni özellikler modüle eklenebilir
   - API değişiklikleri sadece adapter'larda
   - Yeni provider eklemek kolay

5. **Import Kolaylığı**
   - Tek bir import noktası: `@/modules/car`
   - Tree-shaking desteği
   - TypeScript tip güvenliği

---

## 📁 DOSYA YAPISI

### Detaylı Dosya Organizasyonu

```
src/
├── modules/
│   └── car/                                    # Araç Kiralama Modülü
│       ├── index.ts                            # Ana modül export
│       │
│       ├── components/                         # Component'ler
│       │   ├── index.ts                        # Component exports
│       │   │
│       │   ├── CarSearchForm.tsx               # Arama formu
│       │   │   # - Alış/teslim lokasyonu
│       │   │   # - Tarih/saat seçimi
│       │   │   # - Sürücü yaşı
│       │   │   # - Tek yön checkbox
│       │   │
│       │   ├── CarCard.tsx                     # Araç kartı (liste)
│       │   │   # - Araç görseli
│       │   │   # - Araç özellikleri
│       │   │   # - Fiyat bilgisi
│       │   │   # - "Rezerve Et" butonu
│       │   │
│       │   ├── CarList.tsx                     # Araç listesi container
│       │   │   # - CarCard'ları listeler
│       │   │   # - Pagination
│       │   │   # - Loading state
│       │   │
│       │   ├── CarFilters.tsx                  # Filtreleme
│       │   │   # - Araç tipi (Ekonomi, SUV, vb.)
│       │   │   # - Fiyat aralığı
│       │   │   # - Vites tipi (Manuel/Otomatik)
│       │   │   # - Yakıt tipi
│       │   │   # - Kiralama şirketi
│       │   │   # - Sigorta dahil
│       │   │
│       │   ├── CarDetails.tsx                  # Araç detay görünümü
│       │   │   # - Araç fotoğraf galerisi
│       │   │   # - Teknik özellikler
│       │   │   # - Kiralama koşulları
│       │   │   # - Sigorta seçenekleri
│       │   │   # - Müsaitlik takvimi
│       │   │
│       │   ├── LocationSelector.tsx            # Lokasyon seçici
│       │   │   # - Havalimanı listesi
│       │   │   # - Şehir merkezi ofisleri
│       │   │   # - Arama (autocomplete)
│       │   │   # - Harita entegrasyonu (opsiyonel)
│       │   │
│       │   ├── ExtraServices.tsx               # Ekstra hizmetler
│       │   │   # - Çocuk koltuğu
│       │   │   # - GPS
│       │   │   # - Ek sürücü
│       │   │   # - Tam sigorta
│       │   │   # - Fiyat hesaplama
│       │   │
│       │   └── booking/                        # Rezervasyon componentleri
│       │       ├── index.ts
│       │       │
│       │       ├── CarBookingForm.tsx          # Ana rezervasyon formu
│       │       │   # - Sürücü bilgileri
│       │       │   # - İletişim bilgileri
│       │       │   # - Ekstra hizmetler
│       │       │   # - Ödeme bilgileri
│       │       │
│       │       ├── DriverForm.tsx              # Sürücü bilgileri
│       │       │   # - Ad/Soyad
│       │       │   # - Doğum tarihi (yaş kontrolü)
│       │       │   # - Ehliyet bilgileri
│       │       │   # - Ehliyet tarihi
│       │       │   # - Telefon/Email
│       │       │
│       │       ├── InsuranceSelector.tsx       # Sigorta seçimi
│       │       │   # - Temel sigorta (dahil)
│       │       │   # - Tam kasko
│       │       │   # - Cam/lastik sigortası
│       │       │   # - Fiyat karşılaştırma
│       │       │
│       │       └── CarPriceSummary.tsx         # Fiyat özeti
│       │           # - Günlük fiyat
│       │           # - Toplam gün
│       │           # - Ekstra hizmetler
│       │           # - Sigorta
│       │           # - Vergiler
│       │           # - Toplam tutar
│       │
│       ├── services/                           # API servisleri
│       │   ├── index.ts                        # Service exports
│       │   │
│       │   ├── carApi.ts                       # Ana API interface
│       │   │   # - searchCars()
│       │   │   # - getCarDetails()
│       │   │   # - getLocations()
│       │   │   # - calculatePrice()
│       │   │   # - createBooking()
│       │   │   # - cancelBooking()
│       │   │
│       │   ├── carService.ts                   # Business logic
│       │   │   # - Fiyat hesaplama
│       │   │   # - Müsaitlik kontrolü
│       │   │   # - Validasyon
│       │   │   # - Rezervasyon yönetimi
│       │   │
│       │   └── adapters/                       # API adapters
│       │       ├── index.ts
│       │       │
│       │       ├── demoCarApi.ts               # Demo API
│       │       │   # - Statik demo veriler
│       │       │   # - Türkiye lokasyonları
│       │       │   # - Çeşitli araç tipleri
│       │       │
│       │       ├── rentalcarsAdapter.ts        # Rentalcars.com adapter
│       │       │   # - API entegrasyonu
│       │       │   # - Veri dönüşümü
│       │       │   # - Hata yönetimi
│       │       │
│       │       ├── carTrawlerAdapter.ts        # CarTrawler adapter
│       │       │   # - B2B API
│       │       │   # - White-label desteği
│       │       │
│       │       ├── garentaAdapter.ts           # Garenta adapter
│       │       │   # - Türkiye'ye özel
│       │       │   # - Doğrudan entegrasyon
│       │       │
│       │       └── enterpriseAdapter.ts        # Enterprise adapter
│       │           # - Kurumsal API
│       │           # - Toplu rezervasyon
│       │
│       ├── hooks/                              # Custom hooks
│       │   ├── index.ts                        # Hook exports
│       │   │
│       │   ├── useCarState.ts                  # Araç state yönetimi
│       │   │   # - Arama sonuçları
│       │   │   # - Loading states
│       │   │   # - Error handling
│       │   │
│       │   ├── useCarFilters.ts                # Filtreleme hook'u
│       │   │   # - Filtre state
│       │   │   # - Filtre uygulama
│       │   │   # - Filtre sıfırlama
│       │   │
│       │   ├── useCarBooking.ts                # Rezervasyon hook'u
│       │   │   # - Rezervasyon state
│       │   │   # - Form validation
│       │   │   # - Ödeme işlemi
│       │   │
│       │   └── useLocationSearch.ts            # Lokasyon arama
│       │       # - Autocomplete
│       │       # - Debounce
│       │       # - Lokasyon filtreleme
│       │
│       ├── types/                              # TypeScript tipleri
│       │   ├── index.ts                        # Type exports
│       │   │
│       │   └── car.ts                          # Araç tipleri
│       │       # - Car interface
│       │       # - CarSearchParams
│       │       # - Location
│       │       # - Booking
│       │       # - ExtraService
│       │       # - Insurance
│       │       # - Driver
│       │
│       └── utils/                              # Yardımcı fonksiyonlar
│           ├── index.ts                        # Util exports
│           │
│           ├── carHelpers.ts                   # Genel yardımcılar
│           │   # - Tarih formatla
│           │   # - Gün hesapla
│           │   # - Araç tipi çevir
│           │
│           ├── carValidation.ts                # Validasyon
│           │   # - Yaş kontrolü
│           │   # - Ehliyet kontrolü
│           │   # - Tarih validasyonu
│           │
│           ├── priceCalculator.ts              # Fiyat hesaplama
│           │   # - Günlük fiyat
│           │   # - Ekstra hizmet fiyatı
│           │   # - Sigorta fiyatı
│           │   # - Vergi hesaplama
│           │
│           └── locationHelpers.ts              # Lokasyon yardımcıları
│               # - Lokasyon arama
│               # - Mesafe hesaplama
│               # - Havalimanı kodu çözümleme
│
└── app/
    └── cars/                                   # Next.js sayfaları
        ├── page.tsx                            # Ana sayfa (arama formu)
        │   # - CarSearchForm
        │   # - Popüler lokasyonlar
        │   # - Kampanyalar
        │
        ├── search/
        │   └── page.tsx                        # Arama sonuçları
        │       # - CarList
        │       # - CarFilters
        │       # - Sıralama
        │       # - Pagination
        │
        ├── [id]/
        │   └── page.tsx                        # Araç detay sayfası
        │       # - CarDetails
        │       # - ExtraServices
        │       # - "Rezerve Et" butonu
        │
        └── booking/
            └── page.tsx                        # Rezervasyon sayfası
                # - CarBookingForm
                # - DriverForm
                # - InsuranceSelector
                # - CarPriceSummary
                # - Ödeme
```

---

## 🔌 API YAPISI VE SERVİSLER

### Ana API Interface (`modules/car/services/carApi.ts`)

```typescript
// modules/car/services/carApi.ts

import type { 
  Car, 
  CarSearchParams, 
  CarDetails, 
  Location,
  Booking,
  BookingData,
  PriceBreakdown
} from '../types';

/**
 * Araç Kiralama API Interface
 * Tüm provider'ların implement etmesi gereken ana interface
 */
export interface CarRentalAPI {
  /**
   * Araç arama
   * @param params - Arama parametreleri
   * @returns Müsait araçlar listesi
   */
  searchCars(params: CarSearchParams): Promise<Car[]>;

  /**
   * Araç detaylarını getir
   * @param carId - Araç ID
   * @param params - Arama parametreleri (fiyat hesaplama için)
   * @returns Araç detayları
   */
  getCarDetails(carId: string, params: CarSearchParams): Promise<CarDetails>;

  /**
   * Lokasyonları getir
   * @param query - Arama terimi (opsiyonel)
   * @param type - Lokasyon tipi (airport, city)
   * @returns Lokasyon listesi
   */
  getLocations(query?: string, type?: 'airport' | 'city' | 'all'): Promise<Location[]>;

  /**
   * Fiyat hesapla
   * @param carId - Araç ID
   * @param params - Rezervasyon parametreleri
   * @returns Detaylı fiyat bilgisi
   */
  calculatePrice(carId: string, params: BookingData): Promise<PriceBreakdown>;

  /**
   * Rezervasyon oluştur
   * @param bookingData - Rezervasyon bilgileri
   * @returns Rezervasyon detayları
   */
  createBooking(bookingData: BookingData): Promise<Booking>;

  /**
   * Rezervasyonu iptal et
   * @param bookingId - Rezervasyon ID
   * @returns İptal durumu
   */
  cancelBooking(bookingId: string): Promise<{ success: boolean; refundAmount?: number }>;

  /**
   * Rezervasyon detaylarını getir
   * @param bookingId - Rezervasyon ID
   * @returns Rezervasyon detayları
   */
  getBooking(bookingId: string): Promise<Booking>;
}

/**
 * API Provider Config
 */
export interface CarAPIConfig {
  provider: 'demo' | 'rentalcars' | 'cartrawler' | 'garenta' | 'enterprise';
  apiKey?: string;
  apiSecret?: string;
  baseUrl?: string;
  timeout?: number;
}
```

### Business Logic Service (`modules/car/services/carService.ts`)

```typescript
// modules/car/services/carService.ts

import type { CarRentalAPI, CarAPIConfig } from './carApi';
import { DemoCarAPI } from './adapters/demoCarApi';
import type { Car, CarSearchParams, Location } from '../types';

/**
 * Araç Kiralama Servisi
 * Business logic ve API abstraction katmanı
 */
class CarService {
  private api: CarRentalAPI;
  private config: CarAPIConfig;

  constructor(config: CarAPIConfig) {
    this.config = config;
    this.api = this.initializeAPI(config);
  }

  /**
   * API provider'ı başlat
   */
  private initializeAPI(config: CarAPIConfig): CarRentalAPI {
    switch (config.provider) {
      case 'demo':
        return new DemoCarAPI();
      case 'rentalcars':
        // return new RentalcarsAdapter(config);
        throw new Error('Rentalcars adapter not implemented yet');
      case 'cartrawler':
        // return new CarTrawlerAdapter(config);
        throw new Error('CarTrawler adapter not implemented yet');
      case 'garenta':
        // return new GarentaAdapter(config);
        throw new Error('Garenta adapter not implemented yet');
      case 'enterprise':
        // return new EnterpriseAdapter(config);
        throw new Error('Enterprise adapter not implemented yet');
      default:
        return new DemoCarAPI();
    }
  }

  /**
   * Araç ara
   */
  async searchCars(params: CarSearchParams): Promise<Car[]> {
    // Validasyon
    this.validateSearchParams(params);

    // API çağrısı
    const cars = await this.api.searchCars(params);

    // Business logic (fiyat hesaplama, filtreleme vb.)
    return this.processCars(cars, params);
  }

  /**
   * Lokasyon ara
   */
  async searchLocations(query: string, type?: 'airport' | 'city' | 'all'): Promise<Location[]> {
    if (query.length < 2) {
      return [];
    }

    const locations = await this.api.getLocations(query, type);
    return locations.slice(0, 10); // İlk 10 sonuç
  }

  /**
   * Arama parametrelerini valide et
   */
  private validateSearchParams(params: CarSearchParams): void {
    const { pickupDate, dropoffDate, pickupLocation, dropoffLocation, driverAge } = params;

    // Tarih kontrolü
    const pickup = new Date(pickupDate);
    const dropoff = new Date(dropoffDate);
    const now = new Date();

    if (pickup < now) {
      throw new Error('Alış tarihi geçmiş olamaz');
    }

    if (dropoff <= pickup) {
      throw new Error('Teslim tarihi alış tarihinden sonra olmalı');
    }

    // Lokasyon kontrolü
    if (!pickupLocation || !dropoffLocation) {
      throw new Error('Alış ve teslim lokasyonu gerekli');
    }

    // Yaş kontrolü
    if (driverAge < 18) {
      throw new Error('Sürücü yaşı minimum 18 olmalı');
    }

    if (driverAge < 21) {
      console.warn('21 yaş altı sürücüler için ekstra ücret uygulanabilir');
    }
  }

  /**
   * Araçları işle (fiyat hesaplama, sıralama vb.)
   */
  private processCars(cars: Car[], params: CarSearchParams): Car[] {
    // Gün sayısını hesapla
    const days = this.calculateDays(params.pickupDate, params.dropoffDate);

    // Her araç için toplam fiyatı hesapla
    return cars.map(car => ({
      ...car,
      totalPrice: car.pricePerDay * days,
      days
    }));
  }

  /**
   * Gün sayısını hesapla
   */
  private calculateDays(pickupDate: string, dropoffDate: string): number {
    const pickup = new Date(pickupDate);
    const dropoff = new Date(dropoffDate);
    const diffTime = Math.abs(dropoff.getTime() - pickup.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays); // Minimum 1 gün
  }
}

// Singleton instance
let carServiceInstance: CarService | null = null;

/**
 * CarService instance'ını al
 */
export function getCarService(config?: CarAPIConfig): CarService {
  if (!carServiceInstance) {
    carServiceInstance = new CarService(config || { provider: 'demo' });
  }
  return carServiceInstance;
}

/**
 * Convenience functions
 */
export async function searchCars(params: CarSearchParams): Promise<Car[]> {
  const service = getCarService();
  return service.searchCars(params);
}

export async function searchLocations(query: string, type?: 'airport' | 'city' | 'all'): Promise<Location[]> {
  const service = getCarService();
  return service.searchLocations(query, type);
}
```

### Demo API Adapter (`modules/car/services/adapters/demoCarApi.ts`)

```typescript
// modules/car/services/adapters/demoCarApi.ts

import type { CarRentalAPI } from '../carApi';
import type { 
  Car, 
  CarSearchParams, 
  CarDetails, 
  Location,
  Booking,
  BookingData,
  PriceBreakdown
} from '../../types';

/**
 * Demo Araç Kiralama API
 * Gerçek API'ye geçene kadar kullanılacak demo implementasyon
 */
export class DemoCarAPI implements CarRentalAPI {
  
  /**
   * Demo araçlar
   */
  private demoCars: Car[] = [
    {
      id: 'car-1',
      name: 'Fiat Egea',
      category: 'Ekonomi',
      type: 'Sedan',
      transmission: 'Manuel',
      fuelType: 'Benzin',
      seats: 5,
      doors: 4,
      luggage: 2,
      airConditioning: true,
      pricePerDay: 350,
      currency: 'TL',
      supplier: 'Garenta',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
      features: ['Klima', 'ABS', 'Airbag'],
      unlimited Kilometers: true
    },
    {
      id: 'car-2',
      name: 'Renault Clio',
      category: 'Ekonomi',
      type: 'Hatchback',
      transmission: 'Manuel',
      fuelType: 'Dizel',
      seats: 5,
      doors: 4,
      luggage: 2,
      airConditioning: true,
      pricePerDay: 380,
      currency: 'TL',
      supplier: 'Budget',
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
      features: ['Klima', 'ABS', 'Airbag', 'Bluetooth'],
      unlimitedKilometers: true
    },
    {
      id: 'car-3',
      name: 'Volkswagen Golf',
      category: 'Kompakt',
      type: 'Hatchback',
      transmission: 'Otomatik',
      fuelType: 'Benzin',
      seats: 5,
      doors: 4,
      luggage: 3,
      airConditioning: true,
      pricePerDay: 550,
      currency: 'TL',
      supplier: 'Avis',
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400',
      features: ['Klima', 'ABS', 'Airbag', 'Bluetooth', 'Cruise Control'],
      unlimitedKilometers: true
    },
    {
      id: 'car-4',
      name: 'Toyota Corolla',
      category: 'Kompakt',
      type: 'Sedan',
      transmission: 'Otomatik',
      fuelType: 'Hybrid',
      seats: 5,
      doors: 4,
      luggage: 3,
      airConditioning: true,
      pricePerDay: 650,
      currency: 'TL',
      supplier: 'Enterprise',
      image: 'https://images.unsplash.com/photo-1623869675781-80aa31f0e4f6?w=400',
      features: ['Klima', 'ABS', 'Airbag', 'Bluetooth', 'Cruise Control', 'Kamera'],
      unlimitedKilometers: true
    },
    {
      id: 'car-5',
      name: 'Dacia Duster',
      category: 'SUV',
      type: 'SUV',
      transmission: 'Manuel',
      fuelType: 'Dizel',
      seats: 5,
      doors: 4,
      luggage: 4,
      airConditioning: true,
      pricePerDay: 700,
      currency: 'TL',
      supplier: 'Garenta',
      image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400',
      features: ['Klima', 'ABS', 'Airbag', '4x4'],
      unlimitedKilometers: true
    },
    {
      id: 'car-6',
      name: 'Nissan Qashqai',
      category: 'SUV',
      type: 'SUV',
      transmission: 'Otomatik',
      fuelType: 'Dizel',
      seats: 5,
      doors: 4,
      luggage: 4,
      airConditioning: true,
      pricePerDay: 850,
      currency: 'TL',
      supplier: 'Avis',
      image: 'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=400',
      features: ['Klima', 'ABS', 'Airbag', 'Bluetooth', 'Cruise Control', 'Kamera', 'Park Sensörü'],
      unlimitedKilometers: true
    },
    {
      id: 'car-7',
      name: 'Mercedes C-Class',
      category: 'Lüks',
      type: 'Sedan',
      transmission: 'Otomatik',
      fuelType: 'Dizel',
      seats: 5,
      doors: 4,
      luggage: 3,
      airConditioning: true,
      pricePerDay: 1500,
      currency: 'TL',
      supplier: 'Enterprise',
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400',
      features: ['Klima', 'ABS', 'Airbag', 'Bluetooth', 'Cruise Control', 'Kamera', 'Park Sensörü', 'Deri Koltuk', 'Navigasyon'],
      unlimitedKilometers: true
    },
    {
      id: 'car-8',
      name: 'Ford Transit',
      category: 'Minivan',
      type: 'Van',
      transmission: 'Manuel',
      fuelType: 'Dizel',
      seats: 9,
      doors: 4,
      luggage: 6,
      airConditioning: true,
      pricePerDay: 900,
      currency: 'TL',
      supplier: 'Budget',
      image: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=400',
      features: ['Klima', 'ABS', 'Airbag', '9 Kişilik'],
      unlimitedKilometers: false,
      dailyKilometerLimit: 300
    }
  ];

  /**
   * Demo lokasyonlar
   */
  private demoLocations: Location[] = [
    // Havalimanları
    { id: 'ist-airport', name: 'İstanbul Havalimanı', code: 'IST', type: 'airport', city: 'İstanbul', country: 'Türkiye' },
    { id: 'saw-airport', name: 'Sabiha Gökçen Havalimanı', code: 'SAW', type: 'airport', city: 'İstanbul', country: 'Türkiye' },
    { id: 'ayt-airport', name: 'Antalya Havalimanı', code: 'AYT', type: 'airport', city: 'Antalya', country: 'Türkiye' },
    { id: 'esb-airport', name: 'Esenboğa Havalimanı', code: 'ESB', type: 'airport', city: 'Ankara', country: 'Türkiye' },
    { id: 'adz-airport', name: 'Adnan Menderes Havalimanı', code: 'ADB', type: 'airport', city: 'İzmir', country: 'Türkiye' },
    { id: 'bjv-airport', name: 'Milas-Bodrum Havalimanı', code: 'BJV', type: 'airport', city: 'Bodrum', country: 'Türkiye' },
    { id: 'dlm-airport', name: 'Dalaman Havalimanı', code: 'DLM', type: 'airport', city: 'Dalaman', country: 'Türkiye' },
    { id: 'gzt-airport', name: 'Gaziantep Havalimanı', code: 'GZT', type: 'airport', city: 'Gaziantep', country: 'Türkiye' },
    
    // Şehir Merkezleri
    { id: 'ist-city', name: 'İstanbul Merkez', code: 'IST-CITY', type: 'city', city: 'İstanbul', country: 'Türkiye', address: 'Taksim' },
    { id: 'ank-city', name: 'Ankara Merkez', code: 'ANK-CITY', type: 'city', city: 'Ankara', country: 'Türkiye', address: 'Kızılay' },
    { id: 'izm-city', name: 'İzmir Merkez', code: 'IZM-CITY', type: 'city', city: 'İzmir', country: 'Türkiye', address: 'Alsancak' },
    { id: 'ant-city', name: 'Antalya Merkez', code: 'AYT-CITY', type: 'city', city: 'Antalya', country: 'Türkiye', address: 'Kaleiçi' },
    { id: 'bod-city', name: 'Bodrum Merkez', code: 'BOD-CITY', type: 'city', city: 'Bodrum', country: 'Türkiye', address: 'Merkez' },
  ];

  /**
   * Araç ara
   */
  async searchCars(params: CarSearchParams): Promise<Car[]> {
    // Simüle edilmiş gecikme
    await this.delay(500);

    // Basit filtreleme (gerçek API'de daha kompleks olacak)
    let results = [...this.demoCars];

    // Kategori filtresi varsa uygula
    if (params.category) {
      results = results.filter(car => car.category === params.category);
    }

    // Vites tipi filtresi
    if (params.transmission) {
      results = results.filter(car => car.transmission === params.transmission);
    }

    // Fiyat hesapla
    const days = this.calculateDays(params.pickupDate, params.dropoffDate);
    results = results.map(car => ({
      ...car,
      totalPrice: car.pricePerDay * days,
      days
    }));

    return results;
  }

  /**
   * Araç detaylarını getir
   */
  async getCarDetails(carId: string, params: CarSearchParams): Promise<CarDetails> {
    await this.delay(300);

    const car = this.demoCars.find(c => c.id === carId);
    if (!car) {
      throw new Error('Araç bulunamadı');
    }

    const days = this.calculateDays(params.pickupDate, params.dropoffDate);

    return {
      ...car,
      days,
      totalPrice: car.pricePerDay * days,
      description: `${car.name} - ${car.category} sınıfı araç. ${car.transmission} vites, ${car.fuelType} yakıt. ${car.seats} kişilik.`,
      images: [
        car.image,
        'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800',
        'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800',
      ],
      specifications: {
        engine: '1.6L',
        power: '110 HP',
        fuelConsumption: '5.5 L/100km',
        co2Emission: '120 g/km'
      },
      termsAndConditions: [
        'Minimum yaş: 21',
        'Ehliyet süresi: En az 1 yıl',
        'Yakıt politikası: Dolu/Dolu',
        'Kilometre sınırı: Sınırsız',
        'İptal: 24 saat öncesine kadar ücretsiz'
      ],
      insuranceOptions: [
        {
          id: 'basic',
          name: 'Temel Sigorta',
          description: 'Zorunlu trafik sigortası dahil',
          price: 0,
          included: true
        },
        {
          id: 'full',
          name: 'Tam Kasko',
          description: 'Hasar durumunda muafiyet yok',
          price: 150,
          included: false
        },
        {
          id: 'glass',
          name: 'Cam/Lastik Sigortası',
          description: 'Cam ve lastik hasarları dahil',
          price: 50,
          included: false
        }
      ],
      extraServices: [
        {
          id: 'gps',
          name: 'GPS Navigasyon',
          description: 'Günlük GPS kiralama',
          price: 30,
          unit: 'gün'
        },
        {
          id: 'child-seat',
          name: 'Çocuk Koltuğu',
          description: 'Bebek/çocuk koltuğu',
          price: 40,
          unit: 'gün'
        },
        {
          id: 'additional-driver',
          name: 'Ek Sürücü',
          description: 'İkinci sürücü ekleme',
          price: 80,
          unit: 'rezervasyon'
        },
        {
          id: 'wifi',
          name: 'Mobil WiFi',
          description: 'Araç içi internet',
          price: 50,
          unit: 'gün'
        }
      ]
    };
  }

  /**
   * Lokasyonları getir
   */
  async getLocations(query?: string, type?: 'airport' | 'city' | 'all'): Promise<Location[]> {
    await this.delay(200);

    let results = [...this.demoLocations];

    // Tip filtresi
    if (type && type !== 'all') {
      results = results.filter(loc => loc.type === type);
    }

    // Arama filtresi
    if (query && query.length >= 2) {
      const searchTerm = query.toLowerCase();
      results = results.filter(loc => 
        loc.name.toLowerCase().includes(searchTerm) ||
        loc.city.toLowerCase().includes(searchTerm) ||
        (loc.code && loc.code.toLowerCase().includes(searchTerm))
      );
    }

    return results;
  }

  /**
   * Fiyat hesapla
   */
  async calculatePrice(carId: string, params: BookingData): Promise<PriceBreakdown> {
    await this.delay(300);

    const car = this.demoCars.find(c => c.id === carId);
    if (!car) {
      throw new Error('Araç bulunamadı');
    }

    const days = this.calculateDays(params.pickupDate, params.dropoffDate);
    const basePrice = car.pricePerDay * days;

    // Ekstra hizmetler
    let extrasTotal = 0;
    if (params.extras) {
      params.extras.forEach(extra => {
        if (extra.unit === 'gün') {
          extrasTotal += extra.price * days;
        } else {
          extrasTotal += extra.price;
        }
      });
    }

    // Sigorta
    let insuranceTotal = 0;
    if (params.insurance && !params.insurance.included) {
      insuranceTotal = params.insurance.price * days;
    }

    // Genç sürücü ücreti (21-25 yaş)
    let youngDriverFee = 0;
    if (params.driverAge && params.driverAge < 25 && params.driverAge >= 21) {
      youngDriverFee = 50 * days;
    }

    // Tek yön ücreti
    let oneWayFee = 0;
    if (params.pickupLocation !== params.dropoffLocation) {
      oneWayFee = 200;
    }

    const subtotal = basePrice + extrasTotal + insuranceTotal + youngDriverFee + oneWayFee;
    const tax = subtotal * 0.18; // KDV %18
    const total = subtotal + tax;

    return {
      basePrice,
      days,
      pricePerDay: car.pricePerDay,
      extras: extrasTotal,
      insurance: insuranceTotal,
      youngDriverFee,
      oneWayFee,
      subtotal,
      tax,
      total,
      currency: car.currency
    };
  }

  /**
   * Rezervasyon oluştur
   */
  async createBooking(bookingData: BookingData): Promise<Booking> {
    await this.delay(1000);

    const car = this.demoCars.find(c => c.id === bookingData.carId);
    if (!car) {
      throw new Error('Araç bulunamadı');
    }

    const priceBreakdown = await this.calculatePrice(bookingData.carId, bookingData);

    const booking: Booking = {
      id: `BK${Date.now()}`,
      bookingNumber: `GRB-CAR-${Date.now().toString().slice(-8)}`,
      carId: bookingData.carId,
      car: car,
      pickupLocation: bookingData.pickupLocation,
      dropoffLocation: bookingData.dropoffLocation,
      pickupDate: bookingData.pickupDate,
      dropoffDate: bookingData.dropoffDate,
      driver: bookingData.driver,
      extras: bookingData.extras || [],
      insurance: bookingData.insurance,
      priceBreakdown,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      confirmationEmail: bookingData.driver.email
    };

    return booking;
  }

  /**
   * Rezervasyonu iptal et
   */
  async cancelBooking(bookingId: string): Promise<{ success: boolean; refundAmount?: number }> {
    await this.delay(500);

    // Demo: Her zaman başarılı
    return {
      success: true,
      refundAmount: 0 // İptal politikasına göre hesaplanacak
    };
  }

  /**
   * Rezervasyon detaylarını getir
   */
  async getBooking(bookingId: string): Promise<Booking> {
    await this.delay(300);

    // Demo: Basit bir rezervasyon döndür
    throw new Error('Rezervasyon bulunamadı');
  }

  /**
   * Yardımcı: Gecikme simülasyonu
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Yardımcı: Gün sayısı hesapla
   */
  private calculateDays(pickupDate: string, dropoffDate: string): number {
    const pickup = new Date(pickupDate);
    const dropoff = new Date(dropoffDate);
    const diffTime = Math.abs(dropoff.getTime() - pickup.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  }
}
```

---

## 🎨 COMPONENT YAPISI

### 1. CarSearchForm Component

**Dosya:** `modules/car/components/CarSearchForm.tsx`

**Amaç:** Araç arama formu - Ana sayfada ve arama sayfasında kullanılır

**Props:**
```typescript
interface CarSearchFormProps {
  initialValues?: Partial<CarSearchParams>;
  onSearch: (params: CarSearchParams) => void;
  loading?: boolean;
  compact?: boolean; // Kompakt görünüm (arama sayfasında)
}
```

**Özellikler:**
- Alış lokasyonu seçimi (autocomplete)
- Teslim lokasyonu seçimi (autocomplete)
- "Farklı lokasyona teslim" checkbox
- Alış tarihi ve saati
- Teslim tarihi ve saati
- Sürücü yaşı
- "Ara" butonu
- Form validasyonu
- Responsive tasarım

**Kullanım:**
```typescript
<CarSearchForm
  initialValues={searchParams}
  onSearch={handleSearch}
  loading={isSearching}
/>
```

### 2. CarCard Component

**Dosya:** `modules/car/components/CarCard.tsx`

**Amaç:** Araç kartı - Liste görünümünde tek bir aracı gösterir

**Props:**
```typescript
interface CarCardProps {
  car: Car;
  onSelect: (carId: string) => void;
  days: number;
}
```

**Özellikler:**
- Araç görseli
- Araç adı ve kategori
- Temel özellikler (vites, yakıt, koltuk, bagaj)
- Günlük ve toplam fiyat
- Kiralama şirketi logosu
- "Detay" ve "Rezerve Et" butonları
- Hover efektleri

**Kullanım:**
```typescript
<CarCard
  car={car}
  onSelect={handleSelect}
  days={searchParams.days}
/>
```

### 3. CarFilters Component

**Dosya:** `modules/car/components/CarFilters.tsx`

**Amaç:** Filtreleme paneli - Arama sonuçlarını filtreler

**Props:**
```typescript
interface CarFiltersProps {
  filters: CarFilters;
  onFilterChange: (filters: CarFilters) => void;
  cars: Car[]; // Filtre seçeneklerini dinamik oluşturmak için
}
```

**Filtre Seçenekleri:**
- Araç kategorisi (Ekonomi, Kompakt, SUV, Lüks, vb.)
- Fiyat aralığı (slider)
- Vites tipi (Manuel, Otomatik)
- Yakıt tipi (Benzin, Dizel, Hybrid, Elektrik)
- Koltuk sayısı
- Kiralama şirketi
- Özellikler (Klima, GPS, vb.)
- Sınırsız kilometre

**Kullanım:**
```typescript
<CarFilters
  filters={activeFilters}
  onFilterChange={setActiveFilters}
  cars={allCars}
/>
```

### 4. CarDetails Component

**Dosya:** `modules/car/components/CarDetails.tsx`

**Amaç:** Araç detay sayfası - Aracın tüm bilgilerini gösterir

**Props:**
```typescript
interface CarDetailsProps {
  car: CarDetails;
  searchParams: CarSearchParams;
  onBook: () => void;
}
```

**Bölümler:**
- Fotoğraf galerisi (carousel)
- Araç özellikleri ve teknik detaylar
- Fiyat bilgisi
- Sigorta seçenekleri
- Ekstra hizmetler
- Kiralama koşulları
- Lokasyon bilgisi
- "Rezerve Et" butonu

**Kullanım:**
```typescript
<CarDetails
  car={carDetails}
  searchParams={searchParams}
  onBook={handleBooking}
/>
```

### 5. LocationSelector Component

**Dosya:** `modules/car/components/LocationSelector.tsx`

**Amaç:** Lokasyon seçici - Autocomplete ile lokasyon arama

**Props:**
```typescript
interface LocationSelectorProps {
  value: Location | null;
  onChange: (location: Location) => void;
  placeholder: string;
  type?: 'airport' | 'city' | 'all';
  error?: string;
}
```

**Özellikler:**
- Autocomplete arama
- Debounce (300ms)
- Havalimanı ve şehir merkezi filtreleme
- Lokasyon ikonu ve detayları
- Klavye navigasyonu
- Responsive

**Kullanım:**
```typescript
<LocationSelector
  value={pickupLocation}
  onChange={setPickupLocation}
  placeholder="Alış lokasyonu"
  type="all"
/>
```

### 6. ExtraServices Component

**Dosya:** `modules/car/components/ExtraServices.tsx`

**Amaç:** Ekstra hizmet seçimi - GPS, çocuk koltuğu vb.

**Props:**
```typescript
interface ExtraServicesProps {
  services: ExtraService[];
  selected: string[];
  onChange: (selected: string[]) => void;
  days: number;
}
```

**Özellikler:**
- Hizmet listesi (checkbox)
- Günlük/rezervasyon bazlı fiyatlandırma
- Toplam fiyat hesaplama
- Açıklama ve görseller

**Kullanım:**
```typescript
<ExtraServices
  services={availableServices}
  selected={selectedExtras}
  onChange={setSelectedExtras}
  days={rentalDays}
/>
```

### 7. Booking Components

#### CarBookingForm
**Dosya:** `modules/car/components/booking/CarBookingForm.tsx`

Ana rezervasyon formu - Tüm rezervasyon adımlarını yönetir

#### DriverForm
**Dosya:** `modules/car/components/booking/DriverForm.tsx`

Sürücü bilgileri formu:
- Ad/Soyad
- Doğum tarihi (yaş kontrolü)
- Ehliyet bilgileri
- İletişim bilgileri

#### InsuranceSelector
**Dosya:** `modules/car/components/booking/InsuranceSelector.tsx`

Sigorta seçimi:
- Temel sigorta (dahil)
- Tam kasko
- Cam/lastik sigortası
- Karşılaştırma tablosu

#### CarPriceSummary
**Dosya:** `modules/car/components/booking/CarPriceSummary.tsx`

Fiyat özeti:
- Günlük fiyat × gün sayısı
- Ekstra hizmetler
- Sigorta
- Vergiler
- Toplam tutar

---

## 📊 VERİ MODELLERİ

### TypeScript Interfaces (`modules/car/types/car.ts`)

```typescript
// modules/car/types/car.ts

/**
 * Araç
 */
export interface Car {
  id: string;
  name: string;
  category: CarCategory;
  type: CarType;
  transmission: 'Manuel' | 'Otomatik';
  fuelType: 'Benzin' | 'Dizel' | 'Hybrid' | 'Elektrik' | 'LPG';
  seats: number;
  doors: number;
  luggage: number;
  airConditioning: boolean;
  pricePerDay: number;
  totalPrice?: number; // Hesaplanmış toplam fiyat
  days?: number; // Kiralama gün sayısı
  currency: string;
  supplier: string; // Kiralama şirketi
  image: string;
  features: string[];
  unlimitedKilometers: boolean;
  dailyKilometerLimit?: number; // Günlük km limiti (unlimited false ise)
}

/**
 * Araç Kategorileri
 */
export type CarCategory = 
  | 'Ekonomi'
  | 'Kompakt'
  | 'Orta'
  | 'SUV'
  | 'Lüks'
  | 'Minivan'
  | 'Premium';

/**
 * Araç Tipleri
 */
export type CarType =
  | 'Sedan'
  | 'Hatchback'
  | 'SUV'
  | 'Van'
  | 'Coupe'
  | 'Convertible'
  | 'Wagon';

/**
 * Araç Detayları
 */
export interface CarDetails extends Car {
  description: string;
  images: string[];
  specifications: {
    engine: string;
    power: string;
    fuelConsumption: string;
    co2Emission: string;
  };
  termsAndConditions: string[];
  insuranceOptions: InsuranceOption[];
  extraServices: ExtraService[];
}

/**
 * Lokasyon
 */
export interface Location {
  id: string;
  name: string;
  code?: string; // Havalimanı kodu (IATA)
  type: 'airport' | 'city';
  city: string;
  country: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * Arama Parametreleri
 */
export interface CarSearchParams {
  pickupLocation: string; // Location ID
  dropoffLocation: string; // Location ID
  pickupDate: string; // ISO date string
  pickupTime: string; // HH:mm
  dropoffDate: string; // ISO date string
  dropoffTime: string; // HH:mm
  driverAge: number;
  category?: CarCategory;
  transmission?: 'Manuel' | 'Otomatik';
}

/**
 * Filtreler
 */
export interface CarFilters {
  categories: CarCategory[];
  priceRange: {
    min: number;
    max: number;
  };
  transmission: ('Manuel' | 'Otomatik')[];
  fuelTypes: string[];
  seats: number[];
  suppliers: string[];
  features: string[];
  unlimitedKilometers?: boolean;
}

/**
 * Sigorta Seçeneği
 */
export interface InsuranceOption {
  id: string;
  name: string;
  description: string;
  price: number; // Günlük fiyat
  included: boolean; // Temel sigorta dahil mi?
  coverage: string[];
}

/**
 * Ekstra Hizmet
 */
export interface ExtraService {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: 'gün' | 'rezervasyon'; // Fiyatlandırma birimi
  icon?: string;
  maxQuantity?: number;
}

/**
 * Sürücü Bilgileri
 */
export interface Driver {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  licenseNumber: string;
  licenseIssueDate: string;
  licenseCountry: string;
}

/**
 * Rezervasyon Verisi
 */
export interface BookingData {
  carId: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;
  driver: Driver;
  driverAge: number;
  extras?: ExtraService[];
  insurance?: InsuranceOption;
}

/**
 * Fiyat Detayı
 */
export interface PriceBreakdown {
  basePrice: number; // Temel araç fiyatı
  days: number;
  pricePerDay: number;
  extras: number; // Ekstra hizmetler toplamı
  insurance: number; // Sigorta toplamı
  youngDriverFee: number; // Genç sürücü ücreti
  oneWayFee: number; // Tek yön ücreti
  subtotal: number; // Ara toplam
  tax: number; // Vergiler
  total: number; // Genel toplam
  currency: string;
}

/**
 * Rezervasyon
 */
export interface Booking {
  id: string;
  bookingNumber: string;
  carId: string;
  car: Car;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
  driver: Driver;
  extras: ExtraService[];
  insurance?: InsuranceOption;
  priceBreakdown: PriceBreakdown;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt?: string;
  confirmationEmail: string;
  cancellationPolicy?: string;
}
```

---

## 🚀 İMPLEMENTASYON ADIMLARI

### Faz 1: Temel Yapı (1-2 Hafta)

#### Adım 1.1: Modül Yapısını Oluştur
```bash
# Klasör yapısını oluştur
mkdir -p src/modules/car/{components,services,hooks,types,utils}
mkdir -p src/modules/car/components/booking
mkdir -p src/modules/car/services/adapters
mkdir -p src/app/cars/{search,[id],booking}
```

#### Adım 1.2: TypeScript Tiplerini Tanımla
- [ ] `modules/car/types/car.ts` oluştur
- [ ] Tüm interface'leri tanımla
- [ ] Export dosyasını (`types/index.ts`) oluştur

#### Adım 1.3: Demo API'yi Implement Et
- [ ] `services/carApi.ts` - Interface tanımla
- [ ] `services/adapters/demoCarApi.ts` - Demo implementasyon
- [ ] Demo araç verilerini ekle
- [ ] Demo lokasyon verilerini ekle

#### Adım 1.4: Service Layer'ı Oluştur
- [ ] `services/carService.ts` - Business logic
- [ ] Validasyon fonksiyonları
- [ ] Fiyat hesaplama
- [ ] Export dosyasını oluştur

### Faz 2: Component'ler (2-3 Hafta)

#### Adım 2.1: Arama Formu
- [ ] `components/CarSearchForm.tsx`
- [ ] `components/LocationSelector.tsx`
- [ ] Form validasyonu
- [ ] Responsive tasarım

#### Adım 2.2: Liste ve Filtreleme
- [ ] `components/CarList.tsx`
- [ ] `components/CarCard.tsx`
- [ ] `components/CarFilters.tsx`
- [ ] Sıralama özellikleri

#### Adım 2.3: Detay Sayfası
- [ ] `components/CarDetails.tsx`
- [ ] Fotoğraf galerisi
- [ ] `components/ExtraServices.tsx`
- [ ] Sigorta seçenekleri

#### Adım 2.4: Rezervasyon
- [ ] `components/booking/CarBookingForm.tsx`
- [ ] `components/booking/DriverForm.tsx`
- [ ] `components/booking/InsuranceSelector.tsx`
- [ ] `components/booking/CarPriceSummary.tsx`

### Faz 3: Sayfalar (1 Hafta)

#### Adım 3.1: Ana Sayfa Entegrasyonu
- [ ] Ana sayfaya arama formu ekle
- [ ] Popüler lokasyonlar bölümü
- [ ] Kampanyalar (opsiyonel)

#### Adım 3.2: Arama Sonuçları Sayfası
- [ ] `app/cars/search/page.tsx`
- [ ] URL parametreleri yönetimi
- [ ] Filtreleme ve sıralama
- [ ] Pagination

#### Adım 3.3: Detay Sayfası
- [ ] `app/cars/[id]/page.tsx`
- [ ] SEO optimizasyonu
- [ ] Breadcrumb
- [ ] Benzer araçlar

#### Adım 3.4: Rezervasyon Sayfası
- [ ] `app/cars/booking/page.tsx`
- [ ] Ödeme entegrasyonu
- [ ] Onay sayfası
- [ ] Email bildirimi

### Faz 4: Hooks ve Utils (1 Hafta)

#### Adım 4.1: Custom Hooks
- [ ] `hooks/useCarState.ts`
- [ ] `hooks/useCarFilters.ts`
- [ ] `hooks/useCarBooking.ts`
- [ ] `hooks/useLocationSearch.ts`

#### Adım 4.2: Utility Functions
- [ ] `utils/carHelpers.ts`
- [ ] `utils/carValidation.ts`
- [ ] `utils/priceCalculator.ts`
- [ ] `utils/locationHelpers.ts`

### Faz 5: Database ve API Routes (1 Hafta)

#### Adım 5.1: Prisma Schema
```prisma
model CarBooking {
  id                  String    @id @default(cuid())
  userId              String
  carId               String
  carName             String
  supplier            String
  pickupLocation      String
  dropoffLocation     String
  pickupDate          DateTime
  dropoffDate         DateTime
  driverInfo          String    // JSON
  extras              String?   // JSON
  insurance           String?   // JSON
  totalPrice          Float
  currency            String
  status              String    @default("pending")
  bookingNumber       String    @unique
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  user                User      @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([status])
  @@index([bookingNumber])
}
```

#### Adım 5.2: API Routes
- [ ] `app/api/cars/search/route.ts`
- [ ] `app/api/cars/[id]/route.ts`
- [ ] `app/api/cars/bookings/route.ts`
- [ ] `app/api/cars/locations/route.ts`

### Faz 6: Admin Panel (1 Hafta)

#### Adım 6.1: Rezervasyon Yönetimi
- [ ] Rezervasyon listesi
- [ ] Rezervasyon detayı
- [ ] İptal işlemi
- [ ] Durum güncelleme

#### Adım 6.2: Raporlama
- [ ] Rezervasyon istatistikleri
- [ ] Gelir raporu
- [ ] Popüler araçlar
- [ ] Lokasyon analizi

### Faz 7: Test ve Optimizasyon (1 Hafta)

#### Adım 7.1: Testing
- [ ] Unit testler
- [ ] Integration testler
- [ ] E2E testler
- [ ] Performance testleri

#### Adım 7.2: Optimizasyon
- [ ] Code splitting
- [ ] Image optimization
- [ ] Caching stratejisi
- [ ] SEO optimizasyonu

### Faz 8: Gerçek API Entegrasyonu (2-3 Hafta)

#### Adım 8.1: API Provider Seçimi
- [ ] Rentalcars.com API dokümantasyonu
- [ ] CarTrawler API dokümantasyonu
- [ ] Test hesabı oluştur
- [ ] API anahtarları al

#### Adım 8.2: Adapter Implementation
- [ ] `services/adapters/rentalcarsAdapter.ts`
- [ ] Veri dönüşümü (mapping)
- [ ] Hata yönetimi
- [ ] Rate limiting

#### Adım 8.3: Testing ve Deployment
- [ ] Sandbox ortamda test
- [ ] Production API geçişi
- [ ] Monitoring ve logging
- [ ] Fallback stratejisi

---

## 🎛️ ADMIN PANEL ENTEGRASYONU

### Admin Panel Sayfaları

#### 1. Rezervasyon Listesi
**Yol:** `/grbt-8/car-bookings`

**Özellikler:**
- Tüm rezervasyonları listele
- Filtreleme (tarih, durum, lokasyon)
- Arama (rezervasyon no, sürücü adı)
- Sıralama
- Export (Excel, PDF)

**Tablo Kolonları:**
- Rezervasyon No
- Sürücü Adı
- Araç
- Alış/Teslim Lokasyonu
- Tarih Aralığı
- Toplam Fiyat
- Durum
- İşlemler

#### 2. Rezervasyon Detayı
**Yol:** `/grbt-8/car-bookings/[id]`

**Bölümler:**
- Rezervasyon bilgileri
- Araç bilgileri
- Sürücü bilgileri
- Fiyat detayı
- Ekstra hizmetler
- Sigorta
- Durum geçmişi
- İşlem butonları (İptal, Güncelle)

#### 3. İstatistikler
**Yol:** `/grbt-8/car-stats`

**Metrikler:**
- Toplam rezervasyon sayısı
- Toplam gelir
- Ortalama rezervasyon değeri
- Popüler araç kategorileri
- Popüler lokasyonlar
- Aylık trend grafikleri
- Doluluk oranı

#### 4. API Provider Yönetimi
**Yol:** `/grbt-8/car-providers`

**Özellikler:**
- Provider listesi
- Aktif/pasif durumu
- API anahtarları
- Test modu
- İstatistikler (başarı oranı, response time)

### Admin API Routes

```typescript
// app/api/admin/cars/bookings/route.ts
GET    /api/admin/cars/bookings       # Liste
POST   /api/admin/cars/bookings       # Yeni rezervasyon (manuel)
GET    /api/admin/cars/bookings/[id]  # Detay
PATCH  /api/admin/cars/bookings/[id]  # Güncelle
DELETE /api/admin/cars/bookings/[id]  # İptal

// app/api/admin/cars/stats/route.ts
GET    /api/admin/cars/stats           # İstatistikler

// app/api/admin/cars/providers/route.ts
GET    /api/admin/cars/providers       # Provider listesi
PATCH  /api/admin/cars/providers/[id]  # Provider güncelle
```

---

## 🔗 API ENTEGRASYON STRATEJİSİ

### API Provider Karşılaştırması

| Provider | Avantajlar | Dezavantajlar | Maliyet | Önerilen Kullanım |
|----------|-----------|---------------|---------|-------------------|
| **Rentalcars.com** | - En geniş kapsam<br>- Kolay entegrasyon<br>- İyi dokümantasyon | - Komisyon yüksek<br>- Fiyat kontrolü az | Komisyon bazlı | İlk entegrasyon |
| **CarTrawler** | - B2B odaklı<br>- White-label<br>- Özelleştirilebilir | - Kurulum karmaşık<br>- Minimum hacim gerekli | Aylık + komisyon | Büyüme sonrası |
| **Garenta** | - Türkiye'ye özel<br>- Doğrudan anlaşma<br>- Daha iyi komisyon | - Tek tedarikçi<br>- Sınırlı lokasyon | Anlaşmaya bağlı | Türkiye odaklı |
| **Enterprise** | - Kurumsal<br>- Güvenilir<br>- Geniş filo | - Pahalı<br>- B2B odaklı | Anlaşmaya bağlı | Kurumsal müşteriler |

### Önerilen Strateji

#### Faz 1: Demo ile Başlangıç (Hemen)
```typescript
// Demo API ile sistem tamamlanır
const carService = getCarService({ provider: 'demo' });
```

**Avantajlar:**
- Hızlı geliştirme
- API maliyeti yok
- Test ve geliştirme kolay

#### Faz 2: Rentalcars.com Entegrasyonu (3-6 ay sonra)
```typescript
// Gerçek API'ye geçiş
const carService = getCarService({
  provider: 'rentalcars',
  apiKey: process.env.RENTALCARS_API_KEY,
  apiSecret: process.env.RENTALCARS_API_SECRET
});
```

**Gereksinimler:**
- API hesabı oluştur
- Test ortamında dene
- Veri mapping'i yap
- Hata yönetimi ekle

#### Faz 3: Multi-Provider (1 yıl sonra)
```typescript
// Birden fazla provider kullan
const providers = [
  { provider: 'rentalcars', priority: 1 },
  { provider: 'garenta', priority: 2 },
  { provider: 'demo', priority: 3 } // Fallback
];

// En iyi fiyatı bul
const results = await Promise.all(
  providers.map(p => getCarService(p).searchCars(params))
);
const bestDeals = mergAndSortResults(results);
```

### API Adapter Pattern

Her provider için ayrı adapter oluşturulur:

```typescript
// Rentalcars Adapter
class RentalcarsAdapter implements CarRentalAPI {
  async searchCars(params: CarSearchParams): Promise<Car[]> {
    // 1. Parametreleri Rentalcars formatına çevir
    const apiParams = this.mapToRentalcarsFormat(params);
    
    // 2. API çağrısı yap
    const response = await fetch(this.baseUrl + '/search', {
      method: 'POST',
      body: JSON.stringify(apiParams),
      headers: this.getHeaders()
    });
    
    // 3. Response'u kendi formatımıza çevir
    const data = await response.json();
    return this.mapFromRentalcarsFormat(data);
  }
  
  private mapToRentalcarsFormat(params: CarSearchParams) {
    // Veri dönüşümü
  }
  
  private mapFromRentalcarsFormat(data: any): Car[] {
    // Veri dönüşümü
  }
}
```

Bu sayede:
- Frontend kodu değişmez
- Provider değiştirmek kolay
- Her provider'ın özelliklerini kullanabilirsin
- Fallback stratejisi uygulayabilirsin

---

## ⚙️ TEKNİK DETAYLAR

### Environment Variables

```env
# .env.local

# Araç Kiralama API
CAR_RENTAL_PROVIDER=demo  # demo | rentalcars | cartrawler | garenta
CAR_RENTAL_API_KEY=your-api-key
CAR_RENTAL_API_SECRET=your-api-secret
CAR_RENTAL_BASE_URL=https://api.rentalcars.com/v1

# Garenta (Türkiye'ye özel)
GARENTA_API_KEY=your-garenta-key
GARENTA_API_URL=https://api.garenta.com.tr

# Enterprise
ENTERPRISE_API_KEY=your-enterprise-key
ENTERPRISE_API_URL=https://api.enterprise.com
```

### Next.js Configuration

```typescript
// next.config.js

module.exports = {
  images: {
    domains: [
      'images.unsplash.com', // Demo görseller
      'cdn.rentalcars.com',  // Rentalcars görselleri
      'static.garenta.com.tr' // Garenta görselleri
    ]
  },
  
  // API route timeout (araç arama uzun sürebilir)
  experimental: {
    proxyTimeout: 60000 // 60 saniye
  }
};
```

### Caching Stratejisi

```typescript
// Lokasyonları cache'le (sık değişmez)
const locations = await cache(
  () => carService.getLocations(),
  ['car-locations'],
  { revalidate: 3600 } // 1 saat
);

// Araç arama sonuçlarını kısa süreli cache'le
const cars = await cache(
  () => carService.searchCars(params),
  ['car-search', JSON.stringify(params)],
  { revalidate: 300 } // 5 dakika
);
```

### Error Handling

```typescript
// services/carService.ts

try {
  const cars = await this.api.searchCars(params);
  return cars;
} catch (error) {
  // Log hatayı
  logger.error('Car search error', { error, params });
  
  // Kullanıcıya anlamlı mesaj
  if (error.code === 'NO_AVAILABILITY') {
    throw new Error('Seçtiğiniz tarihlerde müsait araç bulunamadı');
  }
  
  if (error.code === 'LOCATION_NOT_FOUND') {
    throw new Error('Geçersiz lokasyon');
  }
  
  // Fallback: Demo API'ye geç
  if (this.config.provider !== 'demo') {
    logger.warn('Falling back to demo API');
    const demoService = new DemoCarAPI();
    return demoService.searchCars(params);
  }
  
  throw error;
}
```

### Performance Optimization

**1. Code Splitting**
```typescript
// Lazy load booking components
const CarBookingForm = dynamic(
  () => import('@/modules/car/components/booking/CarBookingForm'),
  { loading: () => <LoadingSpinner /> }
);
```

**2. Image Optimization**
```typescript
// Next.js Image component kullan
import Image from 'next/image';

<Image
  src={car.image}
  alt={car.name}
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
/>
```

**3. Debounce Search**
```typescript
// Lokasyon aramasını debounce et
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    searchLocations(query);
  }, 300),
  []
);
```

### SEO Optimization

```typescript
// app/cars/[id]/page.tsx

export async function generateMetadata({ params }): Promise<Metadata> {
  const car = await getCarDetails(params.id);
  
  return {
    title: `${car.name} Araç Kiralama | Gurbetbiz`,
    description: `${car.name} - ${car.category} sınıfı araç kiralama. Günlük ${car.pricePerDay} TL'den başlayan fiyatlarla.`,
    openGraph: {
      title: `${car.name} Araç Kiralama`,
      description: car.description,
      images: [car.image]
    }
  };
}
```

### Analytics ve Tracking

```typescript
// Araç arama tracking
trackEvent('car_search', {
  pickup_location: params.pickupLocation,
  dropoff_location: params.dropoffLocation,
  days: calculateDays(params.pickupDate, params.dropoffDate),
  driver_age: params.driverAge
});

// Rezervasyon tracking
trackEvent('car_booking_completed', {
  car_id: booking.carId,
  car_name: booking.car.name,
  total_price: booking.priceBreakdown.total,
  days: booking.priceBreakdown.days,
  extras: booking.extras.map(e => e.id)
});
```

---

## 📝 NOTLAR VE ÖNERİLER

### Geliştirme Öncelikleri

1. **Önce Demo, Sonra Gerçek API**
   - Demo ile tüm sistemi tamamla
   - Kullanıcı testleri yap
   - Gerçek API entegrasyonuna geç

2. **Mobil First**
   - Gurbetçiler çoğunlukla mobil kullanır
   - Responsive tasarıma öncelik ver
   - Touch-friendly UI

3. **Performans**
   - Araç görselleri optimize et
   - Lazy loading kullan
   - API response'ları cache'le

4. **Kullanıcı Deneyimi**
   - Basit ve anlaşılır form
   - Net fiyat gösterimi
   - Hızlı rezervasyon akışı

### Gelecek Özellikler

- [ ] Harita entegrasyonu (lokasyon seçimi)
- [ ] Araç karşılaştırma
- [ ] Favori araçlar
- [ ] Fiyat alarmı
- [ ] Mobil uygulama
- [ ] WhatsApp destek
- [ ] Çoklu dil desteği
- [ ] Para birimi seçimi

### Güvenlik

- [ ] Rate limiting (API abuse önleme)
- [ ] Input validation (XSS, SQL injection)
- [ ] HTTPS zorunlu
- [ ] API anahtarları güvenli saklama
- [ ] PCI-DSS compliance (ödeme)
- [ ] GDPR compliance (kişisel veri)

### Test Senaryoları

- [ ] Havalimanı araç kiralama
- [ ] Şehir içi kiralama
- [ ] Tek yön kiralama
- [ ] Uzun süreli kiralama (1 ay+)
- [ ] Genç sürücü (21-25 yaş)
- [ ] Ekstra hizmetlerle rezervasyon
- [ ] Rezervasyon iptali
- [ ] Farklı para birimleri

---

## 🎯 SONUÇ

Bu implementasyon raporu, Gurbetbiz araç kiralama modülünün eksiksiz bir planını sunmaktadır. Modüler yapı sayesinde:

- **Kolay Geliştirme:** Her özellik ayrı modül
- **Kolay Bakım:** Değişiklikler izole
- **Kolay Test:** Her modül bağımsız test edilebilir
- **Kolay Ölçekleme:** Yeni özellikler kolayca eklenir
- **API Esnekliği:** Provider değiştirmek kolay

**Tahmini Süre:** 8-12 hafta (tam zamanlı 1 geliştirici)

**Öncelik Sırası:**
1. Demo API ile temel sistem (4 hafta)
2. Admin panel entegrasyonu (1 hafta)
3. Test ve optimizasyon (1 hafta)
4. Gerçek API entegrasyonu (2-3 hafta)

---

**Son Güncelleme:** 2026-02-08  
**Versiyon:** 1.0  
**Durum:** Planlama Aşaması
