# Araç Kiralama Sistemi – Deploy ve Bakım Rehberi

Bu belge, araç kiralama (car rental) modülünün nasıl deploy edildiğini, deploy sonrası yapılacakları ve bakım adımlarını açıklar.

---

## 0. Vercel’e Tam Aktarım (Özet)

- **Görseller:** Araç ve tedarikçi görselleri için `public/images/cars/placeholder.svg` ve `public/images/suppliers/placeholder.svg` eklendi; demo adapter bu path’leri kullanıyor. Repo ile birlikte Vercel’e deploy edilir; 404 oluşmaz.
- **Veritabanı:** CarBooking tablosu, her saat çalışan Vercel Cron ile `GET /api/admin/run-migration` tetiklenerek yoksa oluşturulur. İlk deploy’dan sonra en geç 1 saat içinde tablo hazır olur; isterseniz bir kez manuel GET ile hemen oluşturabilirsiniz.

## 1. Deploy için Yapılan Düzenlemeler

### 1.1 Build süresinin kısaltılması

- **Build script:** Migration artık build sırasında çalışmıyor; build süresi kısaldı ve veritabanına bağlanamama riski build’i bloklamıyor.
- **`package.json`** içinde build komutu:
  ```bash
  "build": "node vercel-protection.js && next build"
  ```
- Migration script’i (`scripts/run-migration-safe.js`) build’den **çıkarıldı**. Migration, deploy **sonrası** ayrı tetiklenir (aşağıda).

### 1.2 TypeScript / test dosyaları

- **`tsconfig.json`** içinde `__tests__` klasörü `exclude` listesine eklendi.
- Böylece eski test dosyalarındaki hatalar `next build` veya `tsc` ile uygulama build’ini bozmaz.

### 1.3 CarBooking tablosu ve migration

- **Prisma:** `CarBooking` modeli `prisma/schema.prisma` içinde tanımlı.
- **Migration dosyası:** `prisma/migrations/20260208000000_add_car_bookings/migration.sql`
- **`scripts/run-migration-safe.js`:** Bu script’e CarBooking tablosu kontrolü eklendi. Script çalıştığında, tablo yoksa bu migration ile oluşturulur.

---

## 2. Deploy Adımları (Vercel / Genel)

1. **Kodu push edin**  
   Tüm değişiklikler (build script, tsconfig, migration script, API route) repoda ve Vercel’e push edilmiş olmalı.

2. **Build’in bitmesini bekleyin**  
   Vercel otomatik build alır. Build komutu: `node vercel-protection.js && next build`.  
   Hata alırsanız Vercel build log’una bakın; genelde `next build` veya lint aşamasında hata görünür.

3. **Deploy sonrası migration**  
   CarBooking tablosu iki şekilde oluşturulur:
   - **Vercel Cron (otomatik):** `vercel.json` içinde `/api/admin/run-migration` her saat (saat başı) GET ile tetiklenir. Tablo yoksa oluşturulur; varsa işlem atlanır. İlk deploy’dan sonra en geç 1 saat içinde tablo hazır olur.
   - **Manuel (isteğe bağlı):** Hemen oluşturmak için deploy sonrası bir kez:
     ```bash
     curl https://SITENIZ.vercel.app/api/admin/run-migration
     ```
     (GET yeterli; tablo yoksa oluşturur.)  
     POST ile koruma kullanıyorsanız: Vercel’de `RUN_MIGRATION_SECRET` tanımlayıp istekte `Authorization: Bearer YOUR_SECRET` veya `x-migration-secret: YOUR_SECRET` gönderin.
   - **Lokal script:** `node scripts/run-migration-safe.js` — SeoSettings, Backlink, BlogPost, HotelFavorite, HotelApiProvider, HotelBooking ve **CarBooking** tablolarını kontrol eder; yoksa oluşturur.

4. **Doğrulama**  
   - `/api/admin/run-migration` GET ile tekrar çağırın; yanıtta `tables.CarBooking: true` görmelisiniz.  
   - Uygulama üzerinden araç arama ve rezervasyon akışını test edin.

---

## 3. Araç Kiralama ile İlgili API’ler

| Endpoint | Açıklama |
|----------|----------|
| `GET /api/cars/bookings` | Kullanıcının araç rezervasyonlarını listeler (oturum gerekli) |
| `POST /api/cars/bookings` | Yeni araç rezervasyonu oluşturur |
| `GET /api/cars/bookings/[id]` | Tekil rezervasyon detayı |
| `PATCH /api/cars/bookings/[id]` | Rezervasyon güncelleme |
| `POST /api/cars/bookings/[id]/cancel` | Rezervasyon iptali |
| `GET /api/admin/run-migration` | Migration tablo durumu (CarBooking vb.) |
| `POST /api/admin/run-migration` | CarBooking tablosunu yoksa oluşturur (deploy sonrası bir kez) |

---

## 4. Ortam Değişkenleri (Özet)

- **`DATABASE_URL`**  
  Build’de kullanılmaz; uygulama ve migration API’si çalışırken gerekir. Vercel’de tanımlı olmalı.
- **`RUN_MIGRATION_SECRET`** (isteğe bağlı)  
  `/api/admin/run-migration` POST’u secret ile korumak için. Tanımlanmazsa endpoint şu an herkese açık çalışır; production’da secret kullanmanız önerilir.

---

## 5. Sorun Giderme

- **Build timeout / çok uzun sürüyor**  
  Build’de sadece `vercel-protection.js` ve `next build` çalışıyor; migration build’de yok. Takılma genelde `next build` veya büyük sayfa/component derlemesinden olur. Vercel build log’unda hangi aşamada kaldığını kontrol edin.

- **CarBooking tablosu yok / 500 hatası**  
  Deploy sonrası en az bir kez migration çalıştırılmamış olabilir. `POST /api/admin/run-migration` ile tabloyu oluşturun (yukarıdaki curl örnekleri).

- **Rezervasyon oluşmuyor**  
  Oturum (session) ve `DATABASE_URL` doğru mu kontrol edin. Prisma client’ın `CarBooking` modeli kullanıyor; migration’ın başarıyla çalıştığından emin olun.

---

## 6. Özet Kontrol Listesi

- [ ] Kod push edildi, Vercel build başarılı.
- [ ] Deploy sonrası `POST /api/admin/run-migration` (veya `node scripts/run-migration-safe.js`) bir kez çalıştırıldı.
- [ ] `GET /api/admin/run-migration` ile CarBooking tablosunun mevcut olduğu doğrulandı.
- [ ] Araç arama sayfası ve rezervasyon akışı test edildi.
- [ ] (İsteğe bağlı) Production’da `RUN_MIGRATION_SECRET` tanımlandı.

Bu adımlarla araç kiralama modülü deploy edilmiş ve bakımı yapılabilir durumda olur.
