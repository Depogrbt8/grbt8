# 📱 Mobil Uygulama Geliştiricisi İçin JWT Token Notu

> **Tarih:** Aralık 2024  
> **Konu:** `/api/passengers` endpoint'i JWT token desteği eklendi

---

## ✅ Yapılan Değişiklik

`/api/passengers` endpoint'i artık **hem JWT token hem de NextAuth session** destekliyor.

### Öncesi
- ❌ Sadece NextAuth session (cookie-based) kabul ediyordu
- ❌ Mobil uygulamadan 401 Unauthorized hatası alınıyordu

### Sonrası
- ✅ JWT token ile API çağrısı yapılabilir
- ✅ NextAuth session da çalışmaya devam ediyor (web sitesi için)
- ✅ Fallback mekanizması: JWT yoksa NextAuth kullanılıyor

---

## 🔑 JWT Token Formatı

### Token İçeriği
JWT token'ın payload'ında `id` claim'i olmalı ve bu değer kullanıcının `userId`'si olmalı:

```json
{
  "id": "clx1234567890abcdef",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### Token Doğrulama
- **Secret:** `NEXTAUTH_SECRET` environment variable'ı kullanılıyor
- **Algorithm:** HS256
- **Expiry:** Token'ın geçerlilik süresi kontrol ediliyor

---

## 📡 API Kullanımı

### Request Formatı

```typescript
// Authorization header'ında Bearer token gönder
const response = await fetch('https://gurbetbiz.app/api/passengers', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

### Örnek: Yolcu Listesi Getir

```typescript
// src/services/api/passengers.ts
import { apiClient } from './client'; // Axios instance

export async function getPassengers(accessToken: string) {
  const response = await apiClient.get('/api/passengers', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.data;
}
```

### Örnek: Yeni Yolcu Ekle

```typescript
export async function createPassenger(
  accessToken: string,
  passengerData: {
    firstName: string;
    lastName: string;
    birthDay: string;
    birthMonth: string;
    birthYear: string;
    gender: string;
    identityNumber?: string;
    isForeigner?: boolean;
    countryCode?: string;
    phone?: string;
  }
) {
  const response = await apiClient.post(
    '/api/passengers',
    passengerData,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  return response.data;
}
```

---

## 🔄 Axios Interceptor Örneği

Token'ı her istekte otomatik eklemek için:

```typescript
// src/services/api/client.ts
import axios from 'axios';
import { secureStorage } from '../storage/secureStore';

export const apiClient = axios.create({
  baseURL: 'https://gurbetbiz.app',
  timeout: 30000,
});

// Request interceptor - Token'ı otomatik ekle
apiClient.interceptors.request.use(async (config) => {
  const token = await secureStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - 401 hatasında token yenile
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token yenileme mantığı buraya
      // await refreshToken();
    }
    return Promise.reject(error);
  }
);
```

---

## ⚠️ Önemli Notlar

### 1. Token Formatı
- Token mutlaka `Bearer ` prefix'i ile gönderilmeli
- Boşluk önemli: `Bearer <token>` (Bearer'den sonra boşluk var)

### 2. Fallback Mekanizması
- JWT token geçersizse veya yoksa, sistem otomatik olarak NextAuth session'a geçer
- Bu durumda mobil uygulamadan 401 hatası alırsınız (çünkü NextAuth cookie'si yok)
- **Çözüm:** Geçerli bir JWT token gönderin

### 3. Hata Durumları

| Durum | HTTP Status | Açıklama |
|-------|------------|----------|
| Token yok | 401 | Authorization header eksik veya geçersiz |
| Token geçersiz | 401 | Token süresi dolmuş veya imza hatalı |
| Token'da userId yok | 401 | Token payload'ında `id` claim'i yok |
| Başarılı | 200 | İşlem başarılı |

### 4. Token Yenileme
- Token süresi dolduğunda `/api/auth/refresh` endpoint'ini kullanın (henüz eklenmedi, eklenmeli)
- Veya kullanıcıyı tekrar login yaptırın

---

## 🧪 Test Senaryoları

### 1. Başarılı İstek
```bash
curl -X GET https://gurbetbiz.app/api/passengers \
  -H "Authorization: Bearer YOUR_VALID_JWT_TOKEN"
```

### 2. Token Olmadan İstek (401 beklenir)
```bash
curl -X GET https://gurbetbiz.app/api/passengers
```

### 3. Geçersiz Token (401 beklenir)
```bash
curl -X GET https://gurbetbiz.app/api/passengers \
  -H "Authorization: Bearer invalid_token_12345"
```

---

## 📋 Yapılması Gerekenler (Mobil Uygulama Tarafı)

1. ✅ **Login Endpoint:** JWT token döndüren login endpoint'i kullan
2. ✅ **Token Storage:** Token'ı `expo-secure-store` ile güvenli sakla
3. ✅ **API Client:** Axios interceptor ile token'ı otomatik ekle
4. ⏳ **Token Refresh:** Token yenileme mekanizması ekle (henüz backend'de yok)
5. ✅ **Error Handling:** 401 hatasında kullanıcıyı login sayfasına yönlendir

---

## 🔗 İlgili Dosyalar

- **Backend:** `src/lib/jwtAuth.ts` - JWT doğrulama fonksiyonu
- **Backend:** `src/app/api/passengers/route.ts` - Güncellenmiş endpoint
- **Dokümantasyon:** `MOBIL_APP_REHBERI.md` - Genel mobil app rehberi

---

## 💡 Örnek Kullanım Senaryosu

```typescript
// 1. Kullanıcı login olur
const loginResponse = await login(email, password);
// Response: { accessToken: "...", refreshToken: "...", user: {...} }

// 2. Token'ı güvenli sakla
await secureStorage.setTokens(
  loginResponse.accessToken,
  loginResponse.refreshToken
);

// 3. API çağrısı yap (token otomatik eklenir)
const passengers = await getPassengers();

// 4. Yeni yolcu ekle
const newPassenger = await createPassenger({
  firstName: 'Ahmet',
  lastName: 'Yılmaz',
  birthDay: '01',
  birthMonth: '01',
  birthYear: '1990',
  gender: 'male',
  identityNumber: '12345678901'
});
```

---

## ❓ Sorular ve Destek

Herhangi bir sorunuz varsa veya ek bilgiye ihtiyacınız varsa:
- Backend geliştiricisi ile iletişime geçin
- `MOBIL_APP_REHBERI.md` dosyasına bakın
- API endpoint'lerini test edin

---

## 🔍 Mobil Uygulama Kontrol Listesi (Backend Geliştiricisi İçin)

Mobil uygulama tarafında kod yapısı doğru görünüyor, ancak backend'de kontrol edilmesi gereken noktalar:

### ✅ Mobil Uygulamada Doğru Olanlar:
1. **Axios Interceptor:** Token'ı `Bearer ${token}` formatında otomatik ekliyor
2. **Token Storage:** `expo-secure-store` ile güvenli saklanıyor
3. **API URL:** `https://gurbetbiz.app/api` doğru yapılandırılmış
4. **Service Layer:** `passengerService` `apiClient` kullanıyor (interceptor otomatik çalışıyor)

### ⚠️ Backend'de Kontrol Edilmesi Gerekenler:

#### 1. Login Endpoint'i (`/api/auth/mobile-login`)
**Kontrol:** Endpoint JWT token döndürüyor mu?

**Beklenen Response Formatı:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clx1234567890abcdef",
    "email": "user@example.com",
    "name": "Kullanıcı Adı"
  }
}
```

**Önemli:** `accessToken` mutlaka JWT formatında olmalı ve payload'ında `id` claim'i bulunmalı.

#### 2. JWT Token Payload Kontrolü
**Kontrol:** Token'ın payload'ında `id` (userId) claim'i var mı?

**Beklenen Token Payload:**
```json
{
  "id": "clx1234567890abcdef",  // ← Bu mutlaka olmalı!
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234571490
}
```

**Test:** Token'ı decode edip payload'ını kontrol et:
- JWT.io veya `jose` kütüphanesi ile decode et
- `id` claim'i var mı kontrol et
- `id` değeri kullanıcının gerçek `userId`'si mi kontrol et

#### 3. Refresh Token Endpoint (`/api/auth/refresh`)
**Kontrol:** Endpoint mevcut mu ve doğru çalışıyor mu?

**Beklenen Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Beklenen Response:**
```json
{
  "success": true,
  "accessToken": "yeni_access_token...",
  "refreshToken": "yeni_refresh_token..."
}
```

**Not:** Mobil uygulamada refresh endpoint'i şu şekilde çağrılıyor:
```typescript
`${config.API_URL}/api/auth/refresh`
// config.API_URL = 'https://gurbetbiz.app/api'
// Sonuç: 'https://gurbetbiz.app/api/api/auth/refresh' ❌
```

**Düzeltme Gerekiyor:** Mobil uygulamada `client.ts` dosyasında refresh endpoint çağrısı düzeltilmeli:
```typescript
// ❌ Yanlış:
`${config.API_URL}/api/auth/refresh`

// ✅ Doğru:
`${config.API_URL}/auth/refresh`
// veya
`${config.API_URL.replace('/api', '')}/api/auth/refresh`
```

#### 4. Network Test
**Kontrol:** Gerçek isteklerde token gönderiliyor mu?

**Test Adımları:**
1. Mobil uygulamada login yap
2. Network tab'ında (React Native Debugger veya Flipper) `/passengers` isteğini kontrol et
3. Request headers'da `Authorization: Bearer <token>` var mı kontrol et
4. Token'ın geçerli olduğunu doğrula

**Curl Test:**
```bash
# Login yap ve token al
curl -X POST https://gurbetbiz.app/api/auth/mobile-login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Token'ı kullanarak passengers endpoint'ini test et
curl -X GET https://gurbetbiz.app/api/passengers \
  -H "Authorization: Bearer <ALINAN_TOKEN>"
```

### 🐛 Olası Hata Senaryoları:

| Hata | Olası Neden | Çözüm |
|------|-------------|-------|
| 401 Unauthorized | Token payload'ında `id` yok | Login endpoint'inde token oluştururken `id` claim'ini ekle |
| 401 Unauthorized | Token formatı yanlış | JWT token formatını kontrol et |
| 401 Unauthorized | Token süresi dolmuş | Refresh token mekanizmasını kontrol et |
| 404 Not Found | Endpoint yanlış | `/api/auth/mobile-login` endpoint'inin var olduğunu kontrol et |
| Network Error | API URL yanlış | `config.API_URL` değerini kontrol et |

### 📝 Yapılacaklar Özeti:

1. ✅ `/api/auth/mobile-login` endpoint'inin JWT token döndürdüğünü doğrula
2. ✅ JWT token payload'ında `id` claim'inin olduğunu doğrula
3. ✅ `/api/auth/refresh` endpoint'inin çalıştığını doğrula
4. ⚠️ Mobil uygulamada refresh endpoint URL'ini düzelt (çift `/api` sorunu)
5. ✅ Network test yaparak gerçek istekleri kontrol et

---

## 🎉 Endpoint'ler Hazır! (Güncelleme: Aralık 2024)

### ✅ Oluşturulan Endpoint'ler

1. **`/api/auth/mobile-login`** - Mobil uygulama için login
   - ✅ JWT token döndürüyor
   - ✅ Token payload'ında `id` claim'i mevcut
   - ✅ Access token: **1 saat** geçerli
   - ✅ Refresh token: **30 gün** geçerli
   - ✅ Brute force koruması aktif
   - ✅ Kullanıcı durumu kontrolü yapılıyor

2. **`/api/auth/refresh`** - Token yenileme
   - ✅ Refresh token doğrulama
   - ✅ Yeni access ve refresh token döndürüyor
   - ✅ Kullanıcı durumu kontrolü yapılıyor

3. **`/api/passengers`** - JWT token desteği
   - ✅ Hem JWT token hem NextAuth session destekliyor
   - ✅ Fallback mekanizması çalışıyor

### 📋 Endpoint Detayları

#### `/api/auth/mobile-login` (POST)

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Başarılı):**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clx1234567890abcdef",
    "email": "user@example.com",
    "name": "Kullanıcı Adı",
    "firstName": "Ad",
    "lastName": "Soyad",
    "phone": "+905551234567",
    "customerNo": "#ABC123"
  }
}
```

**Response (Hata):**
```json
{
  "success": false,
  "message": "Geçersiz e-posta veya şifre"
}
```

#### `/api/auth/refresh` (POST)

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Başarılı):**
```json
{
  "success": true,
  "accessToken": "yeni_access_token...",
  "refreshToken": "yeni_refresh_token..."
}
```

**Response (Hata):**
```json
{
  "success": false,
  "message": "Geçersiz veya süresi dolmuş refresh token"
}
```

### 🔐 Güvenlik Özellikleri

- ✅ **Brute Force Koruması:** 5 başarısız denemeden sonra 15 dakika kilitlenme
- ✅ **Token Süreleri:** Access token kısa süreli (1 saat), refresh token uzun süreli (30 gün)
- ✅ **Kullanıcı Durumu Kontrolü:** Sadece aktif kullanıcılar giriş yapabilir
- ✅ **Token Doğrulama:** HS256 algoritması ile imzalı token'lar
- ✅ **Secret Key:** `NEXTAUTH_SECRET` environment variable'ı kullanılıyor

### ⚠️ Önemli Notlar

1. **Token Süreleri:**
   - Access token: **1 saat** - Kısa süreli güvenlik için
   - Refresh token: **30 gün** - Uzun süreli oturum için
   - Access token süresi dolduğunda refresh token ile yenileyin

2. **Token Payload:**
   - Access token payload: `{ id: "userId", email: "user@example.com" }`
   - Refresh token payload: `{ id: "userId", email: "user@example.com", type: "refresh" }`
   - **Önemli:** `id` claim'i mutlaka mevcut (userId için gerekli)

3. **Hata Yönetimi:**
   - 401: Geçersiz token veya kimlik bilgileri
   - 403: Hesap aktif değil
   - 429: Çok fazla giriş denemesi (brute force koruması)
   - 500: Sunucu hatası

4. **Mobil Uygulama URL Düzeltmesi:**
   - Refresh endpoint çağrısında çift `/api` sorunu var
   - `config.API_URL = 'https://gurbetbiz.app/api'` ise
   - ❌ Yanlış: `${config.API_URL}/api/auth/refresh` → `https://gurbetbiz.app/api/api/auth/refresh`
   - ✅ Doğru: `${config.API_URL}/auth/refresh` → `https://gurbetbiz.app/api/auth/refresh`

### 🧪 Test Komutları

```bash
# 1. Login yap ve token al
curl -X POST https://gurbetbiz.app/api/auth/mobile-login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 2. Token ile passengers endpoint'ini test et
curl -X GET https://gurbetbiz.app/api/passengers \
  -H "Authorization: Bearer <ALINAN_ACCESS_TOKEN>"

# 3. Token yenile
curl -X POST https://gurbetbiz.app/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<REFRESH_TOKEN>"}'

# 4. Yeni yolcu ekle
curl -X POST https://gurbetbiz.app/api/passengers \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Ahmet",
    "lastName": "Yılmaz",
    "birthDay": "01",
    "birthMonth": "01",
    "birthYear": "1990",
    "gender": "male",
    "identityNumber": "12345678901"
  }'
```

---

*Son güncelleme: Aralık 2024 - Endpoint'ler oluşturuldu ve test edildi ✅*

