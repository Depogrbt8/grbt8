# 🔒 GÜVENLİ ÖDEME SİSTEMİ KULLANIM KILAVUZU

## ⚠️ ÖNEMLİ DEĞİŞİKLİK

**Eski sistem (GÜVENSİZ):**
- ❌ Kart bilgileri backend'e gönderiliyordu
- ❌ Memory'de saklanıyordu
- ❌ PCI-DSS ihlali

**Yeni sistem (GÜVENLİ):**
- ✅ Kart bilgileri ASLA backend'e gelmez
- ✅ Direkt BiletDukkani Payment Gateway'e gider
- ✅ PCI-DSS uyumlu
- ✅ 3D Secure destekli

---

## 🚀 NASIL KULLANILIR

### ADIM 1: Frontend'de Ödeme Formu

```typescript
// components/PaymentForm.tsx
'use client';

import { useState } from 'react';

export default function PaymentForm({ orderId, amount, currency, customerEmail, customerPhone }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // ÖNEMLİ: Kart bilgileri backend'e GÖNDERİLMEZ!
      // BiletDukkani'nin iframe veya redirect sistemi kullanılır
      
      const response = await fetch('/api/payment/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount,
          currency,
          customerEmail,
          customerPhone,
          // paymentToken: BiletDukkani'den alınan token (opsiyonel)
        })
      });

      const result = await response.json();

      if (result.requires3DSecure) {
        // 3D Secure doğrulama gerekli
        window.location.href = result.redirectUrl;
        return;
      }

      if (result.success) {
        // Başarılı ödeme
        window.location.href = `/odeme-basarili?orderId=${orderId}`;
      } else {
        setError(result.error || 'Ödeme başarısız');
      }

    } catch (err) {
      setError('Ödeme işlemi sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'İşleniyor...' : 'Ödeme Yap'}
      </button>
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}
```

### ADIM 2: BiletDukkani iframe Entegrasyonu (ÖNERİLEN)

```typescript
// BiletDukkani'nin kendi payment iframe'i kullanılır
// Kart bilgileri direkt onların sistemine gider

import Script from 'next/script';

export default function BiletDukkaniPaymentIframe({ orderId, amount }) {
  return (
    <div>
      <Script 
        src="https://api.biletdukkani.com/payment-widget.js"
        onLoad={() => {
          // @ts-ignore
          window.BiletDukkaniPayment.init({
            orderId,
            amount,
            apiKey: process.env.NEXT_PUBLIC_BILETDUKKANI_API_KEY,
            onSuccess: (transactionId) => {
              window.location.href = `/odeme-basarili?orderId=${orderId}`;
            },
            onError: (error) => {
              console.error('Ödeme hatası:', error);
            }
          });
        }}
      />
      <div id="biletdukkani-payment-form"></div>
    </div>
  );
}
```

---

## 🔧 BACKEND KONFİGÜRASYONU

### Environment Variables (.env)

```bash
# BiletDukkani API
BILETDUKKANI_API_KEY=your-real-api-key-here
BILETDUKKANI_CLIENT_ID=your-client-id
BILETDUKKANI_CLIENT_SECRET=your-client-secret

# Payment Callback URL (production)
PAYMENT_CALLBACK_URL=https://anasite.grbt8.store/api/payment/3d-secure-callback
```

---

## 🔐 GÜVENLİK ÖZELLİKLERİ

1. **Kart Bilgileri Koruması**
   - ✅ Backend'e ASLA gelmez
   - ✅ Loglanmaz
   - ✅ Veritabanına kaydedilmez

2. **3D Secure**
   - ✅ Otomatik tespit
   - ✅ Güvenli redirect
   - ✅ Callback doğrulama

3. **PCI-DSS Uyumlu**
   - ✅ Kart bilgileri BiletDukkani'de
   - ✅ Tokenization onların sistemi
   - ✅ Compliance sorumluluğu onlarda

---

## 📝 ENDPOINTS

### POST /api/payment/process
Ödeme işlemini başlatır (KART BİLGİSİ İÇERMEZ!)

**Request:**
```json
{
  "orderId": "order-123",
  "amount": 150.00,
  "currency": "EUR",
  "customerEmail": "user@example.com",
  "customerPhone": "+905551234567",
  "paymentToken": "optional-biletdukkani-token"
}
```

**Response (Başarılı):**
```json
{
  "success": true,
  "transactionId": "TXN-123456",
  "amount": 150.00,
  "currency": "EUR"
}
```

**Response (3D Secure):**
```json
{
  "success": false,
  "requires3DSecure": true,
  "redirectUrl": "https://3dsecure.bank.com/verify?..."
}
```

### POST /api/payment/3d-secure-callback
3D Secure doğrulaması sonrası callback

---

## ⚡ TEST MODU

Development ortamında otomatik olarak demo modu aktif:

```typescript
// Otomatik tespit
const isDevelopment = process.env.NODE_ENV === 'development';
const paymentResult = isDevelopment
  ? await processSecurePaymentDemo(...)
  : await processSecurePayment(...);
```

---

## 🚨 ESKI SİSTEM KALDIRILDI

Şu dosyalar artık kullanılmıyor:

- ❌ `src/lib/cardTokenization.ts` → `cardTokenization.DISABLED.ts` olarak yeniden adlandırıldı
- ❌ `src/app/api/payment/tokenize/route.ts` → Kullanılmıyor (varsa silin)

**Migration:** Eski API'leri kullanan frontend kodlarını güncelleyin!

---

## 📞 YARDIM

Sorun yaşarsanız:
1. `.env` dosyasını kontrol edin
2. BiletDukkani API dokümantasyonuna bakın
3. Logger'da hataları inceleyin: `docker logs -f` veya Vercel logs

---

## ✅ CHECKLIST

- [ ] BiletDukkani API credentials eklendi (.env)
- [ ] Frontend kodu güncellendi (kart bilgileri backend'e gönderilmiyor)
- [ ] Test ödemesi yapıldı (development mode)
- [ ] 3D Secure test edildi
- [ ] Production'da real API kullanılıyor
- [ ] Eski `cardTokenization.ts` dosyası kaldırıldı veya devre dışı

---

**ARTIK SİSTEMİNİZ GÜVENLİ! 🎉**

