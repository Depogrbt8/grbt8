# 📱 GURBETBİZ MOBİL UYGULAMA REHBERİ

> **Tarih:** Aralık 2024  
> **Amaç:** Web sitesindeki hataları tekrarlamamak için baştan doğru mimari kararlar

---

## 📋 İçindekiler

1. [Proje Vizyonu](#proje-vizyonu)
2. [Sistem Mimarisi](#sistem-mimarisi)
3. [Teknoloji Seçimleri](#teknoloji-seçimleri)
4. [Proje Kurulumu](#proje-kurulumu)
5. [Klasör Yapısı](#klasör-yapısı)
6. [Web Sitesinden Kullanılacaklar](#web-sitesinden-kullanılacaklar)
7. [Authentication Mimarisi](#authentication-mimarisi)
8. [API Client Yapısı](#api-client-yapısı)
9. [Güvenlik Checklist](#güvenlik-checklist)
10. [Test Strategy](#test-strategy)
11. [Migration Checklist](#migration-checklist)
12. [Geliştirme Roadmap](#geliştirme-roadmap)

---

## Proje Vizyonu

```
┌─────────────────────────────────────────────────────────────┐
│              🌍 GURBETBİZ SUPER APP 🌍                      │
├─────────────────────────────────────────────────────────────┤
│   ✈️ UÇAK BİLETİ          → Mevcut API'ler kullanılacak    │
│   💸 PARA TRANSFERİ       → Rapyd/Wise API entegrasyonu    │
│   🎮 OYUNLAR              → Tavla, Okey, Batak             │
│   💬 SOSYAL               → Sohbet, Arkadaşlar             │
└─────────────────────────────────────────────────────────────┘
```

**Hedef Kitle:** Avrupa'daki ~5 milyon Türk gurbetçi

---

## Sistem Mimarisi

### 🏗️ Genel Mimari

Gurbetbiz ekosistemi **3 ayrı frontend projesi** ve **1 ortak backend** üzerine kurulu:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Bilet Dükkanı API (External Service)                      │
│  └── Uçuş arama, rezervasyon, ödeme                         │
│       ↑                                                      │
│       │                                                      │
│  ┌────┴────┐                                               │
│  │         │                                               │
│  │  Web Backend (Next.js API Routes)                       │
│  │  https://gurbetbiz.app/api                              │
│  │  ├── /api/flights/*                                     │
│  │  ├── /api/reservations/*                                │
│  │  ├── /api/auth/*                                        │
│  │  └── /api/payment/*                                      │
│  │                                                          │
│  └────┬────┘                                               │
│       │                                                      │
│       ├──────────────┬──────────────┬──────────────┐       │
│       ↓              ↓              ↓              ↓      │
│                                                             │
│  Web Site          Admin Panel     Mobil App     (Future)   │
│  (grbt8)           (grbt8ap)       (grbt8-mobile)          │
│  gurbetbiz.app     grbt8.store     (Yakında)              │
│                                                             │
│  ───────────────────────────────────────────────────────   │
│  Hepsi AYNI Database & API kullanıyor! ✅                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 📦 Proje Yapısı

| Proje | Klasör | URL | Teknoloji | Amaç |
|-------|--------|-----|-----------|------|
| **Web Site** | `Desktop/grbt8` | `gurbetbiz.app` | Next.js + React | Kullanıcılar için ana site |
| **Admin Panel** | `Desktop/grbt8ap` | `grbt8.store` | Next.js + React | Admin yönetim paneli |
| **Mobil App** | `Desktop/grbt8-mobile` | (Yakında) | React Native + Expo | Mobil uygulama |

### 🔗 Ortak Kaynaklar

Tüm projeler **aynı kaynakları** paylaşıyor:

#### 1. Backend API'leri

```
https://gurbetbiz.app/api/flights/search
https://gurbetbiz.app/api/flights/book
https://gurbetbiz.app/api/reservations
https://gurbetbiz.app/api/auth/*
https://gurbetbiz.app/api/payment/*
```

**Önemli:** Mobil app **direkt Bilet Dükkanı API'sine gitmez**, web backend üzerinden gider.

#### 2. Database

- **Prisma Schema:** `grbt8/prisma/schema.prisma`
- **PostgreSQL:** Aynı database instance
- **Redis (Upstash):** Aynı cache instance

#### 3. Authentication

- **NextAuth.js:** Web ve Admin panel için
- **JWT Tokens:** Mobil app için (aynı backend'den)

### 🔄 Veri Akışı Örneği

```
1. Kullanıcı mobil app'ten uçuş arar
   ↓
2. Mobil App → Backend API: GET /api/flights/search
   ↓
3. Backend → Bilet Dükkanı API: External API call
   ↓
4. Sonuçlar database'e kaydedilir (cache için)
   ↓
5. Backend → Mobil App: JSON response
   ↓
6. Admin panel'de görülebilir (grbt8.store)
   ↓
7. Web sitesinde de görülebilir (gurbetbiz.app)
```

### 🎯 Mobil App İçin Sonuçlar

| Özellik | Durum |
|---------|-------|
| **API Endpoint'leri** | ✅ Web'deki aynı endpoint'ler kullanılacak |
| **Database** | ✅ Aynı database'e bağlanacak |
| **Authentication** | ✅ Aynı backend'den JWT alacak |
| **Cache** | ✅ Aynı Redis cache paylaşılacak |
| **Admin Panel Entegrasyonu** | ✅ Admin panel'deki veriler görülebilir |

### ⚠️ Önemli Notlar

1. **API Key Güvenliği:**
   - Bilet Dükkanı API key'leri sadece backend'de
   - Mobil app direkt erişemez ✅

2. **Rate Limiting:**
   - Backend'de merkezi kontrol
   - Tüm client'lar için aynı limitler

3. **Error Handling:**
   - Backend'de tek noktadan yönetim
   - Tüm client'lar aynı error formatını alır

4. **Cache Stratejisi:**
   - Backend'de Redis cache
   - Mobil app'te React Query cache (client-side)

---

## Teknoloji Seçimleri

### ✅ Kesin Kararlar

| Kategori | Seçim | Neden |
|----------|-------|-------|
| **Framework** | React Native + Expo | Hızlı geliştirme, cross-platform |
| **Language** | TypeScript | Web ile aynı, type safety |
| **Navigation** | React Navigation v6 | Standart, stable |
| **State** | Zustand | Basit, performanslı |
| **API Client** | Axios + React Query | Caching, retry |
| **Storage** | expo-secure-store | Şifreli depolama |
| **UI Kit** | NativeWind | Tailwind benzeri |
| **Forms** | React Hook Form + Zod | Web ile aynı |

### ❌ Kullanılmayacaklar

| Teknoloji | Neden Hayır |
|-----------|-------------|
| Redux | Çok karmaşık |
| AsyncStorage (hassas veri) | Şifreleme yok |
| Fetch API (direkt) | Interceptor yok |

---

## Proje Kurulumu

```bash
# Expo projesi oluştur
npx create-expo-app@latest gurbetbiz-mobile --template expo-template-blank-typescript

cd gurbetbiz-mobile

# Gerekli paketler
npx expo install expo-secure-store expo-notifications expo-updates
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install zustand axios @tanstack/react-query
npm install react-hook-form zod @hookform/resolvers
npm install nativewind tailwindcss
npm install react-native-reanimated react-native-gesture-handler
```

### tsconfig.json

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@hooks/*": ["src/hooks/*"],
      "@services/*": ["src/services/*"],
      "@types/*": ["src/types/*"],
      "@store/*": ["src/store/*"]
    }
  }
}
```

---

## Klasör Yapısı

```
gurbetbiz-mobile/
├── App.tsx
├── src/
│   ├── components/          # UI components
│   │   ├── ui/              # Button, Input, Card
│   │   ├── flight/          # Flight-specific
│   │   └── game/            # Game components
│   │
│   ├── screens/             # Screen components
│   │   ├── auth/            # Login, Register
│   │   ├── flights/         # Flight search, results
│   │   ├── transfer/        # Money transfer
│   │   ├── games/           # Game screens
│   │   └── profile/         # User profile
│   │
│   ├── navigation/          # Navigation config
│   ├── services/            # API services
│   │   ├── api/             # Axios client
│   │   ├── socket/          # WebSocket
│   │   └── storage/         # SecureStore
│   │
│   ├── store/               # Zustand stores
│   ├── hooks/               # Custom hooks
│   ├── types/               # TypeScript types
│   ├── utils/               # Utilities
│   └── constants/           # Config, colors
```

---

## Web Sitesinden Kullanılacaklar

### ✅ Direkt Kopyalanacak

Web projesinden (`Desktop/grbt8`) mobil projeye direkt kopyalanacak dosyalar:

```
Web (grbt8)                    →    Mobil (grbt8-mobile)
────────────────────────────────────────────────────────
src/types/flight.ts            →    src/types/flight.ts
src/types/passenger.ts         →    src/types/passenger.ts
src/types/airline.ts           →    src/types/airline.ts
src/utils/validation.ts        →    src/utils/validation.ts
src/utils/format.ts            →    src/utils/format.ts
src/data/countries.ts         →    src/constants/countries.ts
```

### ✅ Aynı Backend API'leri

Mobil app, web sitesi ve admin panel ile **aynı backend API'lerini** kullanır:

```
https://gurbetbiz.app/api/flights/search      → Uçuş arama
https://gurbetbiz.app/api/flights/book        → Rezervasyon
https://gurbetbiz.app/api/airports             → Havalimanı listesi
https://gurbetbiz.app/api/auth/*               → Kimlik doğrulama
https://gurbetbiz.app/api/reservations         → Rezervasyonlar
https://gurbetbiz.app/api/payment/*            → Ödeme işlemleri
```

**Önemli:** 
- Mobil app **direkt Bilet Dükkanı API'sine gitmez**
- Tüm istekler web backend üzerinden yapılır
- API key'ler backend'de güvende kalır

### 🔗 Admin Panel Entegrasyonu

Admin panel (`grbt8ap` - `grbt8.store`) ile mobil app **aynı database'i** kullanır:

- Admin panel'de yapılan değişiklikler mobil app'te görülebilir
- Mobil app'teki rezervasyonlar admin panel'de görülebilir
- Kullanıcı verileri her iki yerde de senkronize

**Örnek Akış:**
```
1. Kullanıcı mobil app'ten rezervasyon yapar
   ↓
2. Rezervasyon database'e kaydedilir
   ↓
3. Admin panel'de (grbt8.store) görülebilir
   ↓
4. Admin rezervasyonu onaylar/iptal eder
   ↓
5. Mobil app'te kullanıcı durumu görür
```

---

## Authentication Mimarisi

> **💡 Not:** Web'deki NextAuth zaten JWT strategy kullanıyor (`jose` paketi ile). 
> Mobil için ayrı endpoint eklemek yerine, mevcut NextAuth'u JWT response döndürecek şekilde genişletebiliriz.

> **📌 ÖNEMLİ:** `/api/passengers` endpoint'i artık JWT token desteği eklenmiş durumda! 
> Detaylı bilgi için: `MOBIL_APP_JWT_NOTU.md` dosyasına bakın.

### JWT Flow (NextAuth ile uyumlu)

```
1. LOGIN
   User → App → API (/api/auth/login)
   ↓
   API returns: { accessToken, refreshToken, user }
   ↓
   App stores tokens in SecureStore

2. API REQUESTS
   Every request: Authorization: Bearer <accessToken>

3. TOKEN REFRESH
   401 error → Auto refresh → Retry request
```

### Secure Storage

```typescript
// src/services/storage/secureStore.ts
import * as SecureStore from 'expo-secure-store';

export const secureStorage = {
  async setTokens(accessToken: string, refreshToken: string) {
    await SecureStore.setItemAsync('access_token', accessToken);
    await SecureStore.setItemAsync('refresh_token', refreshToken);
  },

  async getAccessToken() {
    return SecureStore.getItemAsync('access_token');
  },

  async clearAll() {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
  },
};
```

---

## API Client Yapısı

### Axios with Interceptors

```typescript
// src/services/api/client.ts
import axios from 'axios';
import { secureStorage } from '../storage/secureStore';
import { API_URL } from '@/constants/config';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Request - Add token
apiClient.interceptors.request.use(async (config) => {
  const token = await secureStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response - Handle 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token logic here
    }
    return Promise.reject(error);
  }
);
```

---

## Güvenlik Checklist

### ✅ BAŞTAN Yapılacaklar

| # | Konu | Nasıl | Öncelik |
|---|------|-------|---------|
| 1 | **Token Storage** | expo-secure-store KULLAN | 🔴 Kritik |
| 2 | **API URL** | Environment variable | 🔴 Kritik |
| 3 | **HTTPS** | Tüm API çağrıları | 🔴 Kritik |
| 4 | **Input Validation** | Client + Server | 🔴 Kritik |
| 5 | **Logout** | Tüm token'ları temizle | 🔴 Kritik |

### Web'de Yaşanan Sorunlar → Mobil'de Çözüm

| Web Sorunu | Mobil Çözüm |
|------------|-------------|
| CORS hataları | Mobil'de CORS yok! ✅ |
| Cookie yönetimi | Token tabanlı auth |
| CSP sorunları | Mobil'de CSP yok ✅ |
| SEO endişeleri | Mobil'de SEO yok ✅ |

---

## Test Strategy

### Test Kütüphaneleri

```bash
# Test paketleri
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
npm install --save-dev jest-expo
```

### Test Yapısı

```
__tests__/
├── components/           # Component testleri
│   ├── ui/
│   │   └── Button.test.tsx
│   └── flight/
│       └── FlightCard.test.tsx
│
├── screens/              # Screen testleri
│   └── auth/
│       └── LoginScreen.test.tsx
│
├── hooks/                # Hook testleri
│   └── useAuth.test.ts
│
├── utils/                # Utility testleri
│   └── validation.test.ts
│
└── services/             # API mock testleri
    └── api/
        └── flights.test.ts
```

### Test Kategorileri

| Kategori | Araç | Kapsam |
|----------|------|--------|
| **Unit** | Jest | Utils, hooks, pure functions |
| **Component** | React Native Testing Library | UI components |
| **Integration** | Jest + MSW | API calls |
| **E2E** | Detox (opsiyonel) | Full user flows |

### Örnek Test

```typescript
// __tests__/utils/validation.test.ts
import { userSchema } from '@/utils/validation';

describe('userSchema.login', () => {
  it('should validate correct email', () => {
    const result = userSchema.login.safeParse({
      email: 'test@example.com',
      password: '12345678'
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = userSchema.login.safeParse({
      email: 'invalid-email',
      password: '12345678'
    });
    expect(result.success).toBe(false);
  });
});
```

### Web'den Aktarılacak Testler

```
Web (grbt8)                      →    Mobil
────────────────────────────────────────────────
__tests__/utils/*.ts             →    __tests__/utils/*.ts ✅
__tests__/lib/schemas.test.ts    →    Adapte edilecek
Test helpers/mocks               →    Adapte edilecek
```

---

## Migration Checklist

### ✅ HAZIR (Kopyala-Yapıştır)

Direkt kopyalanacak, değişiklik gerekmez:

- [ ] `src/types/flight.ts`
- [ ] `src/types/passenger.ts`
- [ ] `src/types/airline.ts`
- [ ] `src/utils/validation.ts` (Zod schemas)
- [ ] `src/utils/format.ts` (genişletilecek)
- [ ] `src/data/countries.ts`

### 🔧 ADAPTE EDİLECEK

Mantık aynı, syntax/import değişecek:

- [ ] `src/services/biletdukkani/*` → Axios'a çevir
- [ ] API error handling patterns
- [ ] Test utilities & mocks
- [ ] Date/time formatting (date-fns uyumu)

### 📝 YENİ YAZILACAK

Sıfırdan yazılacak:

- [ ] `/api/auth/mobile-login` endpoint (backend)
- [ ] `/api/auth/refresh` endpoint (backend)
- [ ] Zustand stores (authStore, flightStore, gameStore)
- [ ] React Navigation setup
- [ ] SecureStore wrapper
- [ ] Socket.io client (oyunlar için)
- [ ] Game engines (Tavla, Okey, Batak)
- [ ] Push notification handlers

### 📦 format.ts Genişletme Listesi

Mevcut `format.ts`'e eklenecekler:

```typescript
// Mobil için eklenecek formatlar

// Para birimi formatı (locale-aware)
export const formatCurrency = (amount: number, currency: string, locale = 'tr-TR') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

// Tarih formatı (kısa)
export const formatDateShort = (date: string | Date) => {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(date));
};

// Saat formatı
export const formatTime = (date: string | Date) => {
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Uçuş süresi formatı
export const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}s ${mins}dk`;
};

// Telefon numarası formatı
export const formatPhone = (phone: string) => {
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
};

// IBAN formatı
export const formatIBAN = (iban: string) => {
  return iban.replace(/(.{4})/g, '$1 ').trim();
};
```

---

## Geliştirme Roadmap

### FAZ 1: Temel Altyapı (2 hafta)
- [ ] Expo projesi kurulumu
- [ ] Navigation setup
- [ ] Auth flow
- [ ] API client
- [ ] Base UI components

### FAZ 2: Uçak Bileti (3 hafta)
- [ ] Uçuş arama formu
- [ ] Arama sonuçları
- [ ] Rezervasyon
- [ ] Ödeme entegrasyonu

### FAZ 3: Profil & Hesap (1 hafta)
- [ ] Profil sayfası
- [ ] Rezervasyon geçmişi
- [ ] Ayarlar

### FAZ 4: Para Transferi (3 hafta)
- [ ] Rapyd/Wise entegrasyonu
- [ ] Transfer formu
- [ ] KYC flow
- [ ] Transfer geçmişi

### FAZ 5: Multiplayer Oyunlar (6 hafta)
- [ ] Game server (Socket.io)
- [ ] Tavla
- [ ] Okey
- [ ] Batak

### FAZ 6: Sosyal (2 hafta)
- [ ] Arkadaş listesi
- [ ] Oyun daveti
- [ ] Sohbet

### FAZ 7: Launch (2 hafta)
- [ ] Performance
- [ ] Error tracking
- [ ] Store publish

---

## En Önemli 5 Kural

1. **Token'ları SecureStore'da sakla** - AsyncStorage KULLANMA
2. **API URL'yi env variable'dan al** - Hardcode ETME
3. **TypeScript strict mode** - Hataları erken yakala
4. **Error boundary'leri baştan koy** - Crash önle
5. **Navigation types baştan tanımla** - Tip güvenliği

---

## Faydalı Kaynaklar

- **Expo Docs:** https://docs.expo.dev
- **React Navigation:** https://reactnavigation.org
- **Zustand:** https://github.com/pmndrs/zustand
- **NativeWind:** https://nativewind.dev
- **Socket.io:** https://socket.io

---

## 🔍 Web vs Mobil Karşılaştırma Analizi

### Web Projesi (grbt8) Mevcut Durum

| Kategori | Web Projesi | Mobil'e Aktarım |
|----------|-------------|-----------------|
| **Framework** | Next.js 13.5.6 | - |
| **Language** | TypeScript 5.5.3 (strict) | ✅ Aynı |
| **UI** | React 18.2 + Tailwind 3.4.4 | NativeWind |
| **Database** | Prisma + PostgreSQL | Backend'de kalır |
| **Auth** | NextAuth 4.24.5 | JWT + SecureStore |
| **Validation** | Zod 3.22.4 | ✅ Aynı |
| **State** | Custom hooks | Zustand |
| **Path Aliases** | `@/*` | ✅ Aynı |

### Direkt Kopyalanacak Dosyalar

```
WEB                              →    MOBİL
────────────────────────────────────────────────
src/types/flight.ts              →    src/types/flight.ts ✅
src/types/passenger.ts           →    src/types/passenger.ts ✅
src/types/airline.ts             →    src/types/airline.ts ✅
src/utils/validation.ts          →    src/utils/validation.ts ✅
src/utils/format.ts              →    src/utils/format.ts ✅
src/data/countries.ts            →    src/constants/countries.ts ✅
```

### Backend Değişiklik Gereksinimi

⚠️ **JWT Endpoint Eklenmeli:**

```typescript
// Yeni endpoint: /api/auth/mobile-login
// Response: { accessToken, refreshToken, user }

// Yeni endpoint: /api/auth/refresh
// Response: { accessToken, refreshToken }
```

### Uyum Skoru: 9/10 🎯

| Kriter | Durum |
|--------|-------|
| Teknoloji uyumu | ✅ |
| Kod paylaşımı | ✅ |
| Backend uyumu | ✅ |
| Web hatalarından kaçınma | ✅ |
| Güvenlik | ✅ |

### Web'de Yaşanan → Mobil'de Yok

- ❌ CORS hataları → Mobil'de CORS yok
- ❌ Cookie/Session karmaşası → JWT basit
- ❌ CSP sorunları → Mobil'de CSP yok
- ❌ SEO endişeleri → Mobil'de SEO yok

---

*Son güncelleme: Aralık 2024*

