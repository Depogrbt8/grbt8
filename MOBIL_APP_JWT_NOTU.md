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

*Son güncelleme: Aralık 2024*

