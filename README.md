# GRBT - Gurbet.biz Web Uygulaması

Modern Next.js tabanlı web uygulaması.

## ⚠️ Geçici Çözümler ve Yapılması Gerekenler

### Veritabanı Geçici Çözümü
Şu anda PostgreSQL kurulumu tamamlanana kadar kullanıcı bilgileri geçici olarak JSON dosyasında saklanmaktadır:
- Kullanıcı bilgileri `data/users.json` dosyasında tutulmaktadır
- Bu geçici bir çözümdür ve production'da kullanılmamalıdır
- PostgreSQL kurulumu tamamlandığında bu yapı kaldırılacaktır

### Yapılması Gerekenler
1. PostgreSQL kurulumu
2. Prisma migration'larının oluşturulması
3. Kullanıcı verilerinin PostgreSQL'e taşınması
4. JSON dosya yapısının kaldırılmasıbi

## Geliştirme Ortamı

```bash
# Node.js sürümünü ayarla
nvm use 18.17.0

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

## Önemli Notlar ve Best Practices

### 1. Client/Server Component Yapısı
- Next.js'de component'leri mümkün olduğunca basit tutun
- Client ve Server component'leri net bir şekilde ayırın
- Her component'in sorumluluğunu minimize edin
- State yönetimini sadece gerekli yerlerde kullanın

### 2. Routing ve Navigation
- Modal yerine sayfa routing'i tercih edin
- Link component'ini kullanın (onClick event handler yerine)
- Her sayfanın kendi state'ini yönetmesine izin verin
- Dynamic routing için loading ve error state'lerini unutmayın

### 3. State Yönetimi
- Global state'i minimize edin
- Component'lerde local state kullanın
- State updates'i optimize edin
- Hydration sorunlarına dikkat edin

### 4. Performance İyileştirmeleri
- Image optimizasyonlarını kullanın
- Code splitting'i etkin kullanın
- Lazy loading uygulayın
- Bundle size'ı kontrol edin

### 5. Debug ve Geliştirme
- Development modunda debug tool'ları kullanın
- Error boundary'leri implement edin
- Console logları temiz tutun
- Hot reload'u optimize edin

## Proje Yapısı

```
src/
  ├── app/                    # Next.js 13 app router
  │   ├── layout.tsx         # Root layout
  │   ├── page.tsx           # Ana sayfa
  │   └── ...               # Diğer sayfalar
  ├── components/            # Shared components
  │   ├── Header.tsx        # Site header
  │   └── ...               # Diğer componentler
  └── styles/               # Global styles
data/                      # Geçici JSON dosyaları (kaldırılacak)
  └── users.json           # Kullanıcı bilgileri (geçici)
```

## Sık Karşılaşılan Sorunlar ve Çözümleri

1. **Hydration Hataları**
   - Client/Server component ayrımını net yapın
   - useState hook'unu doğru yerde kullanın
   - Modal yerine sayfa routing tercih edin

2. **Performance Sorunları**
   - Component'leri basit tutun
   - Gereksiz re-render'ları önleyin
   - Image optimizasyonlarını kullanın

3. **State Yönetimi**
   - Global state yerine local state tercih edin
   - Props drilling'den kaçının
   - Context API'yi dikkatli kullanın

## [YAPILAN DEĞİŞİKLİKLER]
### Import Path (Yol) Düzeltmeleri ve Modül Çözümleme Hatalarının Giderilmesi

#### Amaç:
VS Code ve TypeScript'te görülen "Cannot find module" ve kırmızı dosya noktası hatalarını gidermek, import path aliaslarının (yol takma adlarının) projenin tsconfig.json ayarlarına uygun şekilde kullanılmasını sağlamak.

#### Yapılanlar:
1. **Import Path Düzeltmeleri:**
   - Tüm dosyalarda `@/src/services/...` şeklindeki importlar, `@/services/...` olarak değiştirildi.
   - Aynı şekilde, `@/src/components/...` → `@/components/...` ve benzeri tüm `@/src/` ile başlayan yollar düzeltildi.
   - Bu değişiklik, projenin kökünde yer alan `tsconfig.json` dosyasındaki aşağıdaki ayara uygun olarak yapıldı:
     ```json
     "paths": {
       "@/*": ["./src/*"]
     }
     ```
   - Artık tüm importlar, `@/` ile başlayıp doğrudan `src` altındaki klasöre işaret edecek şekilde olmalı.

2. **Hata Kaynakları ve Çözüm:**
   - VS Code'da ve terminalde görülen "Cannot find module ..." hataları, yanlış import path'lerinden kaynaklanıyordu.
   - Doğru alias kullanımı ile bu hatalar giderildi.
   - Bu değişiklikler sonrası, dosya ve klasörler üzerinde kırmızı hata noktaları kaybolacak.

3. **Ek Notlar:**
   - Eğer ileride yeni bir klasör veya dosya eklenirse, import path'lerinde mutlaka `@/` ile başlayıp, `src`'yi tekrar yazmadan doğrudan alt klasöre işaret edilmeli.
   - Örnek:  
     ```ts
     // Yanlış: 
     import X from '@/src/components/X';
     // Doğru:
     import X from '@/components/X';
     ```

4. **Ekstra Kontrol:**
   - Değişiklik sonrası, projenin tamamı derlenip, VS Code'da "Reload Window" yapılmalı.
   - Hala hata varsa, `tsconfig.json` ve import path'leri tekrar gözden geçirilmeli.

### Import Path Düzeltme Kayıtları (2024-06-29)

Aşağıdaki dosyalarda sadece import path düzeltmesi yapılmıştır. Her dosyada sadece ilgili import satırı değiştirilmiş, başka hiçbir kod değiştirilmemiştir.

1. src/app/api/agency-balance/detail/route.ts
   - import { getAgencyBalanceBiletDukkani } from '@/src/services/biletdukkaniAgencyBalance';
     → import { getAgencyBalanceBiletDukkani } from '@/services/biletdukkaniAgencyBalance';

2. src/app/api/reports/sales/route.ts
   - import { getSalesReportBiletDukkani } from '@/src/services/biletdukkaniSalesReport';
     → import { getSalesReportBiletDukkani } from '@/services/biletdukkaniSalesReport';

3. src/app/api/lookups/providers/route.ts
   - import { getProvidersBiletDukkani } from '@/src/services/biletdukkaniProviders';
     → import { getProvidersBiletDukkani } from '@/services/biletdukkaniProviders';

Bu düzeltmeler, VS Code ve TypeScript'te yaşanan modül çözümleme ve kırmızı dosya noktası hatalarını gidermek için yapılmıştır.

## Deployment

```bash
# Production build
npm run build

# Production sunucusu başlat
npm run start
```

## Lisans
MIT

## Teknoloji Sürümleri

- Node.js: 18.17.0 LTS (Sabit sürüm)
- Next.js: 13.5.6
- React: 18.2.0
- TypeScript: 5.0.4
- PostgreSQL: 16 (kurulum bekliyor)
- Tailwind CSS: 3.3.5

## Node.js Sürüm Kontrolü

Bu proje Node.js 18.17.0 sürümüne sabitlenmiştir. Sürüm kontrolü 3 farklı yerde yapılmaktadır:

1. `./nvmrc` dosyası - nvm için sürüm kontrolü
   ```
   18.17.0
   ```

2. `./package.json` içinde engines kısmı - npm için sürüm kontrolü
   ```json
   "engines": {
     "node": "18.17.0",
     "npm": "9.6.7"
   }
   ```

3. `./check-version.js` - runtime sürüm kontrolü
   ```javascript
   if (process.version !== 'v18.17.0') {
     console.error('🚨 HATA: Bu proje SADECE Node.js 18.17.0 ile çalışır!');
     process.exit(1);
   }
   ```

⚠️ Proje sadece Node.js 18.17.0 ile çalışır. Farklı bir sürüm kullanıldığında:
- nvm otomatik olarak 18.17.0'a geçiş yapar
- npm install sırasında uyarı verir
- npm run dev çalıştırıldığında hata verir

## Yolcu Bilgileri Yönetimi

### Veritabanı Şeması
Yolcu bilgileri `Passenger` modeli ile yönetilmektedir:

```prisma
model Passenger {
  id              String    @id @default(cuid())
  userId          String
  firstName       String
  lastName        String
  identityNumber  String?
  isForeigner     Boolean   @default(false)
  birthDay        String
  birthMonth      String
  birthYear       String
  gender          String
  countryCode     String?
  phone           String?
  hasMilCard      Boolean   @default(false)
  hasPassport     Boolean   @default(false)
  passportNumber  String?
  passportExpiry  DateTime?
  milCardNumber   String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  status          String    @default("active")

  user            User      @relation(fields: [userId], references: [id])
}
```

### API Endpointleri

1. **Yolcu Listesi** - `GET /api/passengers`
   - Oturum açmış kullanıcının yolcularını listeler
   - Aktif durumdaki yolcuları getirir
   - Oluşturulma tarihine göre sıralı

2. **Yolcu Ekleme** - `POST /api/passengers`
   - Yeni yolcu kaydı oluşturur
   - Zorunlu alanlar: ad, soyad, doğum tarihi, cinsiyet
   - TC kimlik numarası validasyonu (11 hane)

3. **Yolcu Detayı** - `GET /api/passengers/[id]`
   - Belirli bir yolcunun detaylarını getirir
   - Yolcu ID ve kullanıcı kontrolü yapılır

4. **Yolcu Güncelleme** - `PUT /api/passengers/[id]`
   - Mevcut yolcu bilgilerini günceller
   - Tüm validasyonlar tekrar kontrol edilir
   - Pasaport ve MilKart bilgileri opsiyonel

5. **Yolcu Silme** - `DELETE /api/passengers/[id]`
   - Soft delete uygular (status = "deleted")
   - Yolcu kaydı veritabanından silinmez

### Güvenlik Kontrolleri

1. **Oturum Kontrolü**
   - Tüm API endpointleri oturum kontrolü yapar
   - `getServerSession` ile NextAuth.js entegrasyonu

2. **Veri Validasyonu**
   - TC Kimlik numarası kontrolü (11 hane)
   - Zorunlu alan kontrolleri
   - Tarih formatı kontrolleri

3. **Yetki Kontrolü**
   - Her kullanıcı sadece kendi yolcularına erişebilir
   - Yolcu-kullanıcı ilişkisi kontrol edilir

### Kullanım Örneği

```typescript
// Yeni yolcu ekleme
const response = await fetch('/api/passengers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    birthDay: '01',
    birthMonth: '01',
    birthYear: '1990',
    gender: 'male',
    identityNumber: '12345678901',
    isForeigner: false
  })
});

// Yolcu listesi alma
const passengers = await fetch('/api/passengers').then(res => res.json());
```

### Hata Yönetimi

- 400: Validasyon hataları
- 401: Oturum hatası
- 404: Yolcu bulunamadı
- 500: Sunucu hatası

Her hata durumu için detaylı hata mesajları döndürülür.

## TODO / Yapılacaklar Listesi

- [ ] Google ile Giriş (OAuth) ayarları tamamlanacak
    - Google Cloud Console'da doğru redirect URI'ler eklenecek
    - .env dosyasında GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET ve NEXTAUTH_URL doğru olacak
    - Uygulama çalıştığı port ile birebir aynı URI kullanılacak
- [ ] Facebook ile Giriş (OAuth) ayarları yapılacak
    - Facebook Developers Console'da uygulama oluşturulacak
    - Facebook Login > Settings kısmında Valid OAuth Redirect URIs olarak aşağıdakiler eklenecek:
        - http://localhost:3002/api/auth/callback/facebook
        - http://localhost:3003/api/auth/callback/facebook
        - http://localhost:3004/api/auth/callback/facebook
        - http://localhost:3005/api/auth/callback/facebook
    - .env dosyasında FACEBOOK_CLIENT_ID ve FACEBOOK_CLIENT_SECRET doğru olacak
    - Uygulama çalıştığı port ile birebir aynı URI kullanılacak
- [ ] Diğer geliştirme başlıkları buraya eklenebilir

> Not: Google veya Facebook ile girişte "redirect_uri_mismatch" hatası alınırsa, yukarıdaki adımlar tekrar kontrol edilmeli.

## Takvim Özelliği

### Kullanılan Bileşen
- `react-day-picker` ile modern, popup olarak açılan bir takvim kullanıldı.
- Takvim açıldığında **iki ay yan yana** gösterilir.
- **Her günün altında fiyat** (şu an demo, ileride API'den alınacak) gösterilir.
- Fiyatlar ileride API'den çekilecek şekilde altyapı hazırdır.
- Seçili gün vurgulanır, kullanıcı dostu ve hızlıdır.

### Temel Kullanım
```tsx
import { DayPicker } from 'react-day-picker';

function CustomDayContent(props: any) {
  const date = props.date;
  if (!(date instanceof Date) || isNaN(date.getTime())) return <div />;
  // Şu an demo fiyat, ileride API'den alınacak
  const price = Math.floor(100 + (date.getDate() * 7) % 100);
  return (
    <div className="flex flex-col items-center justify-center min-h-[38px]">
      <span className="text-base font-medium text-gray-800 leading-none">{date.getDate()}</span>
      <span className="text-xs text-green-700 font-semibold mt-0.5 leading-none">{price} €</span>
    </div>
  );
}

<DayPicker
  mode="single"
  selected={selectedDate}
  onSelect={setSelectedDate}
  numberOfMonths={2}
  showOutsideDays={true}
  locale={tr}
  components={{
    DayContent: CustomDayContent
  }}
/>
```

### Özellikler
- Takvim inputa tıklanınca popup olarak açılır.
- **İki ay yan yana** görünür.
- Her günün altında fiyat gösterilir (şu an demo, ileride API'den alınacak).
- Fiyatlar için custom DayContent componenti kullanılır.
- Fiyatlar ileride API'den çekilecek şekilde kolayca entegre edilebilir.

### İleride API'den Fiyat Çekmek İçin
- Şu an fiyatlar demo olarak gösteriliyor.
- Gerçek fiyatlar API'den çekilmek istendiğinde, CustomDayContent fonksiyonunda ilgili güne ait fiyatı API'den/stateden almak yeterlidir:
  ```tsx
  const price = fiyatVerisi[dateString] || null;
  // veya
  const price = getPriceForDate(date);
  ```
- Fiyat verisi yoksa, gün yine gösterilir ama fiyat alanı boş bırakılabilir.

### Notlar
- Takvim altyapısı, Kiwi.com gibi modern uçuş sitelerindeki fiyatlı takvimlere benzer şekilde çalışır.
- Fiyatlar ve günler hızlıca güncellenebilir, API entegrasyonuna tamamen hazırdır.

## Uçuş API'si Bilgileri

Bu projede uçuş arama ve havalimanı/şehir autocomplete için dış uçuş API'si (ör. BiletDukkani) ile entegrasyon yapılmaya hazır altyapı bulunmaktadır.

### Havalimanı/Şehir Autocomplete
- Kullanıcı arama kutusuna yazdıkça, API'ye (ör. `GET https://api.biletdukkani.com/airports?search=...`) istek atılır.
- API anahtarı gerekiyorsa, kodda header'a eklenebilecek şekilde açıklama ve TODO bırakılmıştır.
- API'dan veri gelmezse veya hata olursa, otomatik olarak demo veriyle çalışmaya devam eder.
- API anahtarınızı aldıktan sonra, ilgili satırı açıp anahtarı eklemeniz yeterlidir.

Örnek kod:
```js
const response = await fetch(`https://api.biletdukkani.com/airports?search=${encodeURIComponent(query)}` /* , {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY', // <-- Buraya API anahtarınızı ekleyin
  },
} */);
```

### Notlar
- Gerçek API ile canlı veri çekebilmek için API sağlayıcısından (ör. BiletDukkani) bir hesap açıp, API anahtarı almanız gerekir.
- API anahtarı olmadan, sadece demo veriyle çalışır.
- Kodun altyapısı gerçek API'ye hazırdır, anahtar eklenince hemen canlıya geçiş yapılabilir.

Daha fazla bilgi için: [BiletDukkani API Dokümantasyonu](https://documenter.getpostman.com/view/10027817/TVsyeQwy#intro)

## Fiyat Alarmı Cron Job Entegrasyonu

- Tüm aktif PriceAlert kayıtları belirli aralıklarla (örn. her saat) kontrol edilir.
- Her alarm için ilgili uçuşun güncel fiyatı (şimdilik demo, ileride gerçek API ile) alınır.
- Fiyat değişmişse kullanıcıya e-posta gönderilir.
- Son gönderilen fiyat PriceAlert kaydında saklanır (lastNotifiedPrice).
- Uçuş API'si geldiğinde `scripts/check-price-alerts.js` içindeki `getCurrentFlightPrice` fonksiyonu gerçek API ile entegre edilmelidir.

Cron job örneği:
```
0 * * * * node scripts/check-price-alerts.js
```

Script dosyası: `scripts/check-price-alerts.js`

## BiletDukkani API Hazırlığı

Bu projede BiletDukkani API entegrasyonu için altyapı hazırlığı yapılmıştır.

### 1. Token Alma Fonksiyonu
- `src/services/biletdukkaniAuth.ts` dosyasında iki fonksiyon bulunmaktadır:
  - `getBiletDukkaniTokenDemo()`: Demo amaçlı, sahte (dummy) bir token döndürür.
  - `getBiletDukkaniTokenReal()`: Gerçek API bilgileri girildiğinde canlı token alır (şu an için devre dışı).
- Gerçek API bilgileri `.env.local` dosyasına eklenecektir:
  - `BILETDUKKANI_CLIENT_ID`
  - `BILETDUKKANI_CLIENT_SECRET`
  - `BILETDUKKANI_USERNAME`
  - `BILETDUKKANI_PASSWORD`

### 2. Sonraki Adımlar
- Token alma fonksiyonu, BiletDukkani API ile yapılacak tüm isteklerde kullanılacaktır.
- Her API çağrısı öncesi geçerli bir token alınacak ve isteklerin `Authorization` header'ında kullanılacaktır.
- Gerçek API erişim bilgileri alındığında, demo fonksiyonu yerine gerçek fonksiyon aktif edilecektir.

### 3. Rezervasyon ve Biletleme UI/Entegrasyon Notları (2024-06)

- Uçuş rezervasyon/biletleme adımında, kullanıcıya "Rezervasyon Yap" veya "Bileti Al" seçimi sunan radio button'lar eklendi.
- Kullanıcı seçim yaptıktan sonra "Devam Et" butonuna basınca, POST /orders (reserve to book) fonksiyonu çağrılır ve seçime göre `bookingType: 'reserve'` veya `'book'` parametresi gönderilir.
- Eğer rezervasyon seçilirse, API'den dönen rezervasyon bilgileri (PNR, rezervasyon süresi, ücret) modern bir popup (modal) ile kullanıcıya gösterilir. Kullanıcı "Tamam" dediğinde modal kapanır.
- Demo fonksiyonunda rezervasyon süresi ve ücret simüle edilmektedir. Gerçek API'ya geçildiğinde bu alanlar doğrudan API yanıtından alınacaktır.
- Kod, gerçek API'ye geçiş için hazırdır. Sadece demo fonksiyonu yerine gerçek fonksiyon kullanılmalıdır.
- Tüm UI popup ve yazı stilleri, projenin genel tasarımına uygun olarak güncellenmiştir.

> Detaylı akış ve örnekler için: `src/app/flights/booking/page.tsx` ve `src/services/flightApi.ts` dosyalarına bakınız.

### 4. Siparişe Not Ekleme/Güncelleme (PUT /orders/:orderId/note) Demo

- Admin/kontrol paneli için, siparişe not ekleme/güncelleme (PUT /orders/:orderId/note) işleminin demo fonksiyonu eklendi.
- Kullanım: `updateOrderNoteBiletDukkaniDemo(orderId, note)`
- Bu fonksiyon, gerçek API'ya geçişte kolayca uyarlanabilir.
- Son kullanıcıya açık değildir, sadece admin/operasyon paneli için altyapı amaçlıdır.

> Detaylı örnek ve kullanım için: `src/services/flightApi.ts` dosyasına bakınız.

### 5. Get User Info Demo Fonksiyonu
- `src/services/biletdukkaniAuth.ts` dosyasına `getBiletDukkaniUserInfoDemo(token)` fonksiyonu eklendi.
- Bu fonksiyon, verilen token ile demo kullanıcı bilgisi döndürür.
- Gerçek API erişimi olduğunda `getBiletDukkaniUserInfoReal(token)` fonksiyonu kullanılacak.

#### Kullanım Akışı (Çok Basit Anlatım)
1. Önce demo token alınır:
   ```js
   const tokenData = await getBiletDukkaniTokenDemo();
   const token = tokenData.access_token;
   ```
2. Sonra bu token ile kullanıcı bilgisi alınır:
   ```js
   const userInfo = await getBiletDukkaniUserInfoDemo(token);
   console.log(userInfo);
   ```
3. Gerçek API bilgileriyle aynı akış geçerli olacak, sadece fonksiyonlar değişecek.

### 6. POST /flights/search Demo Fonksiyonu
- `src/services/flightApi.ts` dosyasına `searchFlightsBiletDukkaniDemoPost(params)` fonksiyonu eklendi.
- Bu fonksiyon, BiletDukkani API dokümantasyonundaki parametrelerle örnek uçuş verisi döndürür.
- Gerçek API erişimi olduğunda, aynı parametrelerle gerçek uçuş arama yapılacak.

#### Kullanım Örneği
```js
const flights = await searchFlightsBiletDukkaniDemoPost({
  OriginCode: 'IST',
  OriginType: 'airport',
  DestinationCode: 'SAW',
  DestinationType: 'airport',
  DepartDate: '06.25.2025',
  Adults: '1'
});
console.log(flights);
```

### 7. POST /flights/fare Demo Fonksiyonu
- `src/services/flightApi.ts` dosyasına `fareFlightsBiletDukkaniDemo(params)` fonksiyonu eklendi.
- Bu fonksiyon, BiletDukkani API dokümantasyonundaki parametrelerle örnek fiyatlandırma verisi döndürür.
- Gerçek API erişimi olduğunda, aynı parametrelerle gerçek fiyatlandırma yapılacak.

#### Kullanım Örneği
```js
const result = await fareFlightsBiletDukkaniDemo({
  adults: 2,
  children: 1,
  infants: 0,
  flightBrandList: [
    { flightId: 'demo-flight-id-1', brandId: 'demo-brand-id-1' }
  ]
});
console.log(result);
```

### 8. GET /flights/fare/:fareIds Demo Fonksiyonu
- `src/services/flightApi.ts` dosyasına `getFareDetailsBiletDukkaniDemo(fareIds)` fonksiyonu eklendi.
- Bu fonksiyon, verilen fareIds parametresi ile örnek fare detayları döndürür.
- Gerçek API erişimi olduğunda, aynı parametrelerle gerçek fare detayları alınacak.

#### Kullanım Örneği
```js
const fareDetails = await getFareDetailsBiletDukkaniDemo('demo-fare-id-12345');
console.log(fareDetails);
// Dönen veri:
// {
//   fareId: 'demo-fare-id-12345',
//   flights: [...],
//   totalPrice: 150,
//   currency: 'EUR',
//   validUntil: '2025-01-XX...',
//   bookingClass: 'Y',
//   fareType: 'Public'
// }
```

### 9. POST /flights/fare-extra-baggage Demo ve Gerçek Fonksiyonları
- `src/services/flightApi.ts` dosyasına `addExtraBaggageBiletDukkaniDemo(params)` ve `addExtraBaggageBiletDukkaniReal(params, token)` fonksiyonları eklendi.
- Demo fonksiyon, ek bagaj ekleme işlemini simüle eder ve başarılı döner.
- Gerçek fonksiyon, canlı API bilgileriyle ek bagaj ekler (şu an için devre dışı, hazırlık amaçlıdır).

#### Kullanım Örneği (Demo)
```js
const result = await addExtraBaggageBiletDukkaniDemo({
  fareExtraBaggages: [
    {
      fareId: 'demo-fare-id-12345',
      flightId: 'demo-flight-id-1',
      extraBaggageId: 'demo-baggage-id-1',
      passengerIndex: 0,
      passengerType: 'adult'
    }
  ]
});
console.log(result);
// { success: true, message: 'Ekstra bagaj başarıyla eklendi (DEMO)', request: ... }
```

#### Kullanım Örneği (Gerçek API)
```js
const token = '...'; // BiletDukkani token
await addExtraBaggageBiletDukkaniReal({
  fareExtraBaggages: [
    {
      fareId: 'gercek-fare-id',
      flightId: 'gercek-flight-id',
      extraBaggageId: 'gercek-baggage-id',
      passengerIndex: 0,
      passengerType: 'adult'
    }
  ]
}, token);
// Başarılı olursa { success: true } döner, hata olursa exception fırlatır
```

### 10. GET /flights/air-rules Demo ve Gerçek Fonksiyonları
- `src/services/flightApi.ts` dosyasına `getAirRulesBiletDukkaniDemo(params)` ve `getAirRulesBiletDukkaniReal(params, token)` fonksiyonları eklendi.
- Demo fonksiyon, örnek kural verisi döndürür.
- Gerçek fonksiyon, canlı API'den uçuş ve paket kurallarını çeker (şu an için devre dışı, hazırlık amaçlıdır).

#### Kullanım Örneği (Demo)
```js
const rules = await getAirRulesBiletDukkaniDemo({
  fareId: 'demo-fare-id-12345',
  flightId: 'demo-flight-id-1',
  brandId: 'demo-brand-id-1'
});
console.log(rules);
// [ { title: 'Bagaj Kuralları', detail: 'Her yolcu için 20kg bagaj dahildir...' }, ... ]
```

#### Kullanım Örneği (Gerçek)
```js
const rules = await getAirRulesBiletDukkaniReal({
  fareId: 'gercek-fare-id',
  flightId: 'gercek-flight-id',
  brandId: 'gercek-brand-id'
}, 'BEARER_TOKEN');
console.log(rules);
```

### 11. POST /orders (reserve to book) Demo ve Gerçek Fonksiyonları
- `src/services/flightApi.ts` dosyasındaki `createOrderBiletDukkaniDemo` ve `createOrderBiletDukkaniReal` fonksiyonları, **bookingType** (`'book'` veya `'reserve'`) ve **orderType** (`'individual'` veya `'corporate'`) parametreleriyle güncellendi.
- Artık sistem, BiletDukkani'nin hem **rezervasyon** hem de **biletleme** akışını destekliyor.
- Demo fonksiyon, bu parametrelerle örnek sipariş/rezervasyon döndürüyor.
- Gerçek API fonksiyonu, canlıya geçildiğinde aynı parametrelerle çalışacak şekilde hazır.
- İleride sadece gerçek API anahtarlarını `.env.local` dosyasına ekleyip, demo fonksiyonları gerçek fonksiyonlarla değiştirmeniz yeterli olacak.

#### Kullanım Örneği (Demo)
```js
const orderResult = await createOrderBiletDukkaniDemo({
  fareIds: ['demo-fare-id-12345'],
  passengers: [...],
  contactInfo: {...},
  bookingType: 'reserve', // veya 'book'
  orderType: 'individual', // veya 'corporate'
  marketingConsent: true
});
```

#### Kullanım Örneği (Gerçek)
```js
const orderResult = await createOrderBiletDukkaniReal({
  fareIds: ['gercek-fare-id'],
  passengers: [...],
  contactInfo: {...},
  bookingType: 'book',
  orderType: 'individual',
  marketingConsent: true
}, token);
```

> **Not:** Artık sisteminiz, BiletDukkani'nin hem rezervasyon hem biletleme uçtan uca akışına hazırdır. Sadece gerçek API anahtarlarını ekleyip canlıya geçebilirsiniz!

### 12. searchAirports Fonksiyonu
- `src/services/flightApi.ts` dosyasına `searchAirports(query)` fonksiyonu eklendi.
- Demo modda örnek havalimanı verileri döndürür.
- Gerçek API anahtarı varsa BiletDukkani API'sinden havalimanı arama yapar.
- FlightSearchBox bileşeninde kullanılır.

#### Kullanım Örneği
```js
const airports = await searchAirports('istanbul');
console.log(airports);
// [{ code: 'IST', name: 'İstanbul Havalimanı', city: 'İstanbul' }, ...]
```

### 13. Rezervasyon ve Biletleme Akışı (POST /orders - reserve to book)
- `src/services/flightApi.ts` dosyasındaki `createOrderBiletDukkaniDemo` ve `createOrderBiletDukkaniReal` fonksiyonları, **bookingType** (`'book'` veya `'reserve'`) ve **orderType** (`'individual'` veya `'corporate'`) parametreleriyle güncellendi.
- Artık sistem, BiletDukkani'nin hem **rezervasyon** hem de **biletleme** akışını destekliyor.
- Demo fonksiyon, bu parametrelerle örnek sipariş/rezervasyon döndürüyor.
- Gerçek API fonksiyonu, canlıya geçildiğinde aynı parametrelerle çalışacak şekilde hazır.
- İleride sadece gerçek API anahtarlarını `.env.local` dosyasına ekleyip, demo fonksiyonları gerçek fonksiyonlarla değiştirmeniz yeterli olacak.

#### Kullanım Örneği (Demo)
```js
const orderResult = await createOrderBiletDukkaniDemo({
  fareIds: ['demo-fare-id-12345'],
  passengers: [...],
  contactInfo: {...},
  bookingType: 'reserve', // veya 'book'
  orderType: 'individual', // veya 'corporate'
  marketingConsent: true
});
```

#### Kullanım Örneği (Gerçek)
```js
const orderResult = await createOrderBiletDukkaniReal({
  fareIds: ['gercek-fare-id'],
  passengers: [...],
  contactInfo: {...},
  bookingType: 'book',
  orderType: 'individual',
  marketingConsent: true
}, token);
```

> **Not:** Artık sisteminiz, BiletDukkani'nin hem rezervasyon hem biletleme uçtan uca akışına hazırdır. Sadece gerçek API anahtarlarını ekleyip canlıya geçebilirsiniz!

### 14. Yolcu Ekleme (POST /customers) Entegrasyonu
- Sisteme, gerçek BiletDukkani API ile yolcu ekleme (POST /customers) fonksiyonu eklendi.
- Müşteri paneli ve admin paneli için yolcu ekleme işlemi artık gerçek API'ye entegre edilebilir.
- Kod, gerçek API anahtarı ile kolayca canlıya alınabilir.
- Detaylar ve örnek kullanım için: `src/services/flightApi.ts` dosyasına bakınız.

### 15. Yolcu Güncelleme (PUT /customers/:id) Entegrasyonu
- Sisteme, gerçek BiletDukkani API ile yolcu güncelleme (PUT /customers/:id) fonksiyonu eklendi.
- Müşteri paneli ve admin paneli için yolcu güncelleme işlemi artık gerçek API'ye entegre edilebilir.
- Kod, gerçek API anahtarı ile kolayca canlıya alınabilir.
- Detaylar ve örnek kullanım için: `src/services/flightApi.ts` dosyasına bakınız.

### 16. Yolcu Listesi (GET /customers) Entegrasyonu
- Sisteme, gerçek BiletDukkani API ile yolcu listesi çekme (GET /customers) fonksiyonu eklendi.
- Müşteri paneli ve admin paneli için yolcu listesi işlemi artık gerçek API'ye entegre edilebilir.
- Kod, gerçek API anahtarı ile kolayca canlıya alınabilir.
- Detaylar ve örnek kullanım için: `src/services/flightApi.ts` dosyasına bakınız.

### 17. Seyahatlerim Sayfasında Bilet Detayları Entegrasyonu

- Kullanıcı panelindeki "Seyahatlerim" sayfasında, uçak rezervasyonları için demo/gerçek bilet detayları artık `getOrderRouteTicketsBiletDukkaniDemo` fonksiyonu ile çekilip ekranda gösterilmektedir.
- Kod, gerçek API fonksiyonuna (`getOrderRouteTicketsBiletDukkaniReal`) kolayca geçiş yapacak şekilde hazırlanmıştır.
- Bilet detayları (PNR, yolcu, koltuk, bilet tipi, fiyat, durum, vs.) otomatik olarak API'den doldurulmaktadır.
- Detaylar için: `src/app/hesabim/seyahatlerim/page.tsx` ve `src/services/flightApi.ts` dosyalarına bakınız.

### 18. Sipariş/Rota Bazında Bilet Kuralları (Air-Rules) Entegrasyonu

- Sisteme `getOrderRouteAirRulesBiletDukkaniReal(orderId, routeId, token)` fonksiyonu eklendi.
- Bu fonksiyon, gerçek BiletDukkani API'den bir sipariş ve rotaya ait bilet/havayolu kurallarını çeker.
- Kullanıcıya "Bilet Kuralları" veya "Uçuş Kuralları" başlığı altında gösterilmesi önerilir.
- Kod, demo fonksiyon ile kolayca değiştirilebilir ve gerçek API'ye hazırdır.
- Detaylar ve örnek kullanım için: `src/services/flightApi.ts` dosyasına bakınız.

### 19. Bilet İptal Akışı (Müşteri ve Admin Paneli)
- Müşteri panelinde, PNR ve soyadı ile bilet sorgulama ve iptal akışı hazırlandı.
- İptal öncesi, air-rules/fare rules endpointlerinden iptal/iade kuralları çekilip kullanıcıya gösteriliyor.
- İptal işlemi, gerçek BiletDukkani API (DELETE /orders/{orderId}) ile entegre edilmeye hazır.
- Admin paneli için de sipariş/bilet iptal butonu ve fonksiyonu hazırlığı yapıldı.
- Kod, gerçek API anahtarı ile kolayca canlıya alınabilir.
- Detaylar ve örnekler için: `src/app/bilet-iptal/page.tsx` ve `src/services/flightApi.ts` dosyalarına bakınız.

### 20. Bilet İptal/İade Akışı ve İade Tutarı Bilgilendirmesi
- Müşteri ve admin panelinde, bilet iptal/iade akışında refund_validate (PUT /orders/{orderId}/refund_validate) ile iade/ceza bilgisi kullanıcıya gösteriliyor.
- Kullanıcı, iptal/iade butonuna bastığında iade alacağı miktar ve ceza detaylarını popup ile görebiliyor.
- Onay sonrası gerçek iptal işlemi başlatılıyor.
- Kod, gerçek API anahtarı ile kolayca canlıya alınabilir.
- Detaylar ve örnekler için: `src/app/bilet-iptal/page.tsx` ve `src/services/flightApi.ts` dosyasına bakınız.

### 21. Hata Yönetimi Entegrasyonu (API Error Handling)
- BiletDukkani API'den dönen tüm hata mesajları standart bir JSON formatında gelir (type, title, status, detail, instance).
- **Backend'de:** Tüm API çağrılarında dönen hata mesajları loglanmalı, instance/trace bilgisi kaydedilmeli.
- **Admin Panelinde:** Sadece yetkili kullanıcılara özel bir "Hata Kayıtları" veya "Sistem Logları" sayfası eklenmeli. Burada son X hata, hata tipi, zamanı, detayları ve instance (trace) bilgisi gösterilmeli.
- **Kullanıcıya:** Son kullanıcıya asla teknik detay veya trace gösterilmemeli. API'den dönen title veya status'a göre sade, anlaşılır bir hata mesajı gösterilmeli (örn. "Sipariş bulunamadı", "İşlem sırasında bir hata oluştu, lütfen tekrar deneyin.").
- **Geliştirici Logları:** Tüm hata detayları sunucu tarafında log dosyasına veya bir hata izleme servisine (örn. Sentry, LogRocket) kaydedilmeli.
- Hata yönetimi entegrasyonu için örnek hata mesajı formatı ve kullanım önerileri BiletDukkani dokümantasyonunda yer almaktadır.

## Silinen Dosyalar

- postcss.config.mjs: Projede aktif olarak kullanılmadığı için silindi. Yedeği Mac'in masaüstüne (Desktop/postcss.config.mjs.yedek) alındı.
- tailwind.config.ts: Projede aktif olarak kullanılmadığı için silindi. Yedeği Mac'in masaüstüne (Desktop/tailwind.config.ts.yedek) alındı.
- temp_backup_page.tsx: Projede aktif olarak kullanılmadığı için silindi. Yedeği Mac'in masaüstüne (Desktop/temp_backup_page.tsx.yedek) alındı.
- tommy_conversation.md: Projede aktif olarak kullanılmadığı için silindi. Yedeği Mac'in masaüstüne (Desktop/tommy_conversation.md.yedek) alındı.
- mae_yedek_22/: Projede aktif olarak kullanılmadığı için silindi. Yedeği Mac'in masaüstüne (Desktop/mae_yedek_22_backup) alındı.
- .DS_Store: macOS sistem dosyası, proje için gereksiz. .gitignore'da zaten mevcut olduğu için silindi.

### Son Yapılan Düzeltmeler ve Notlar (2024-06-29)

1. **bilet-iptal/page.tsx dosyasında cancelBooking fonksiyonu kaldırıldı:**
   - Import satırından `cancelBooking` fonksiyonu silindi.
   - Gerekçe: Projede ve BiletDukkani API'de böyle bir fonksiyon yok, yanlışlıkla eklenmişti.

2. **bilet-iptal/page.tsx dosyasında getReservationByPNR fonksiyonu gerçek API hazırlığı için yorum satırı yapıldı:**
   - Import satırında ve kodda kullanımı `//` ile yorum satırı haline getirildi.
   - Yanına şu not eklendi: `// TODO: getReservationByPNR fonksiyonu gerçek API entegrasyonu tamamlandığında aktif edilecek.`
   - Gerekçe: Bu fonksiyon henüz projede yok, gerçek API geldiğinde tekrar aktif edilecek.

3. **Tüm import path düzeltmeleri ve yapılanlar adım adım kaydedildi:**
   - `@/src/` ile başlayan tüm import path'leri `@/` ile düzeltildi.
   - Hangi dosyada ne değiştiği, yapılan değişiklikler bölümünde ve burada detaylıca kaydedildi.

Bu notlar, kodun sürdürülebilirliği ve ileride yapılacak entegrasyonlar için referans olarak eklenmiştir.

## Mobil Görünüm

Mobil tasarımda ana referans genişliği olarak **375px** (iPhone X/11/12/13/14) kullanılır. Tasarım ve geliştirme mobil-first yaklaşımıyla yapılır. 320px (en küçük), 414px ve 430px (en büyük) gibi ekranlarda da test edilir ve gerekirse küçük düzeltmeler eklenir. Responsive utility sınıfları (ör. Tailwind) ile farklı boyutlarda uyumluluk sağlanır. Tüm mobil geliştirme bu prensiplere göre yapılacaktır.

## Çoklu Havaalanı ve Kombinasyonlu Uçuş Arama (2024-07-04)

### Amaç
Kullanıcıların kalkış ve varış için birden fazla havaalanı seçebilmesi ve sistemin bu seçimler arasında tüm olası kombinasyonlarla uygun uçuşları bulabilmesi.

### Yapılanlar (Frontend)
- Kalkış ve varış için çoklu seçimli chip/tag input geliştirildi.
- Kullanıcı en fazla 3 kalkış ve 3 varış havaalanı seçebiliyor.
- Seçilen havaalanları kutucuk (chip/tag) olarak gösteriliyor ve silinebiliyor.
- Arama butonuna basınca, seçilen tüm kalkış ve varış kodları alınarak API'ye gönderiliyor.
- (Multi-leg değil, paralel kombinasyon araması!)

### Gereksinimler (Backend)
- API, birden fazla kalkış ve varış kodunu alabilmeli.
- Tüm kombinasyonlar için uygun uçuşları dönebilmeli.
- Eğer multi-leg (çoklu bacak) desteği istenirse, aşağıdaki gibi bir payload ile POST yapılmalı:

```json
{
  "adults": 2,
  "children": 1,
  "infants": 0,
  "students": 0,
  "disabledPersons": 0,
  "providers": "THY",
  "airlines": "TK,AJ",
  "cabin": "Economy",
  "stop": 1,
  "luggage": 1,
  "routes": [
    {
      "index": "0",
      "originCode": "AYT",
      "originType": "airport",
      "destinationCode": "SAW",
      "destinationType": "airport",
      "departDate": "01.19.2021"
    },
    {
      "index": "1",
      "originCode": "IST",
      "originType": "airport",
      "destinationCode": "ESB",
      "destinationType": "airport",
      "departDate": "02.11.2021"
    }
  ]
}
```
- Sadece paralel kombinasyon araması için, frontend seçilen kalkış ve varış kodlarının tüm kombinasyonlarını üretip, her biri için bir route objesi oluşturup gönderebilir.

### Notlar
- Frontend ve backend arasında parametre formatı (virgülle ayrılmış string mi, array mi?) netleştirilmeli.
- API dokümanında çoklu kod desteği olup olmadığı kontrol edilmeli.
- Gerekirse backend ekibiyle iletişime geçilmeli.

---

## Next.js Kapanma Sorunu ve Çözümü (2024-07-17)

### Sorun
Next.js geliştirme sunucusu (`npm run dev`) sayfa yenilenirken kendi kendini durduruyordu. Bu durum şu sebeplerden kaynaklanıyordu:

1. **Dosya İzleme Sorunu**: Next.js çok fazla dosya değişikliği izlemeye çalışırken hot reload mekanizması çöküyordu
2. **Bellek Yönetimi Sorunu**: Node.js çok fazla RAM kullanıyor ve sayfa yenilenirken bellek temizlenmiyordu
3. **Port Çakışması**: 3000 portunda başka bir uygulama çalışıyor olabilirdi

### Çözüm
Next.js'i background'da çalıştırmak sorunu çözdü:

```bash
nohup npm run dev -- -p 3001 > dev.log 2>&1 &
```

**Bu komut ne yapıyor:**
- `nohup`: Süreci terminal'den bağımsız çalıştırır
- `-p 3001`: Farklı port kullanır (port çakışmasını önler)
- `> dev.log 2>&1`: Logları dosyaya yazar
- `&`: Background'da çalıştırır

### Sonuç
Artık Next.js kendi kendini durdurmuyor ve sistem kararlı çalışıyor. Site `http://localhost:3001` adresinden erişilebilir.

### Alternatif Çözümler
Eğer background çalıştırma istemiyorsanız:
1. **Port değiştirme**: `npm run dev -- -p 3001`
2. **Cache temizleme**: `rm -rf .next && npm run dev`
3. **Dosya izleme limitini artırma**: `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf`
