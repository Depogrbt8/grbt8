# Admin Panel - Favori Oteller Entegrasyonu

## Genel Bakış

Ana sitede (`grbt8`) `/api/hotel-favorites` endpoint'i admin panel authentication desteği ile güncellendi. Admin panel tarafında (`grbt8ap`) aşağıdaki değişikliklerin yapılması gerekiyor.

## Yapılması Gerekenler

### 1. Prisma Schema Güncellemesi

**Dosya:** `prisma/schema.prisma`

**User modeline ekle:**
```prisma
model User {
  // ... mevcut alanlar ...
  hotelFavorites  HotelFavorite[]  // Bu satırı ekle
}
```

**Yeni model ekle (dosyanın sonuna):**
```prisma
model HotelFavorite {
  id        String   @id @default(cuid())
  userId    String
  hotelId   String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])

  @@unique([userId, hotelId])
  @@index([userId, createdAt])
  @@index([hotelId])
}
```

**Migration çalıştır:**
```bash
npx prisma migrate dev --name add_hotel_favorites
npx prisma generate
```

### 2. API Endpoint Güncellemesi

**Dosya:** `app/api/users/[id]/route.ts`

**GET fonksiyonunda Prisma select'e ekle:**
```typescript
// Mevcut select içinde (satır 41-48 civarı)
_count: {
  select: {
    passengers: true,
    priceAlerts: true,
    searchFavorites: true,
    reservations: true,
    payments: true,
    hotelFavorites: true  // Bu satırı ekle
  }
},
```

**hotelFavorites select'ini ekle (priceAlerts ve searchFavorites'ten sonra):**
```typescript
searchFavorites: {
  select: {
    id: true,
    origin: true,
    destination: true,
    departureDate: true,
    createdAt: true
  }
},
hotelFavorites: {  // Bu bloğu ekle
  select: {
    id: true,
    hotelId: true,
    createdAt: true
  }
}
```

**Response'a ekle (satır 130-136 civarı):**
```typescript
return NextResponse.json({
  success: true,
  data: formattedUser,
  reservations: user.reservations || [],
  priceAlerts: user.priceAlerts || [],
  searchFavorites: user.searchFavorites || [],
  hotelFavorites: user.hotelFavorites || []  // Bu satırı ekle
})
```

### 3. Frontend State ve Fetch Fonksiyonu

**Dosya:** `app/kullanici/[id]/page.tsx`

**State ekle (satır 53 civarına):**
```typescript
const [hotelFavorites, setHotelFavorites] = useState<any[]>([])
```

**fetchUser fonksiyonunda ekle (satır 380 civarına):**
```typescript
// Fiyat alarmları ve favori aramalar
setPriceAlerts(data.priceAlerts || [])
setFavoriteSearches(data.searchFavorites || [])
setHotelFavorites(data.hotelFavorites || [])  // Bu satırı ekle
```

### 4. UI Eklenmesi

**Dosya:** `app/kullanici/[id]/page.tsx`

**"Favori Arama U." bölümünden sonra ekle (satır 1167'den sonra):**

```typescript
{/* Favori Oteller - Tek satır, sürekli görünür */}
<div className="border-t border-gray-200">
  <div className="w-full flex items-center p-4">
    <div className="flex items-center space-x-2 mr-3">
      <Building className="h-4 w-4 text-gray-400" />
      <span className="text-sm font-medium text-gray-900">Favori Oteller :</span>
    </div>
    <div className="flex flex-wrap gap-2">
      {hotelFavorites && hotelFavorites.length > 0 ? (
        hotelFavorites.map((fav: any) => (
          <div key={fav.id} className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-md">
            {fav.hotelId}
          </div>
        ))
      ) : (
        <span className="text-xs text-gray-500">Kayıtlı favori otel yok</span>
      )}
    </div>
  </div>
</div>
```

**Not:** `Building` icon'u zaten import edilmiş olmalı. Eğer yoksa import'a ekle:
```typescript
import { User, Calendar, Clock, Edit, Save, CreditCard, X, Mail, Phone, MapPin, ChevronDown, ChevronUp, Home, Building, Plane, MessageSquare } from 'lucide-react'
```

## Test Senaryosu

1. Admin panelde bir kullanıcının detay sayfasına git
2. "Favori Oteller" bölümünün göründüğünü kontrol et
3. Kullanıcının favori otelleri varsa, otel ID'lerinin göründüğünü kontrol et
4. Favori otel yoksa "Kayıtlı favori otel yok" mesajının göründüğünü kontrol et

## Notlar

- Ana sitedeki `/api/hotel-favorites` endpoint'i artık `userId` parametresi ile admin panel'den çağrılabilir
- `x-admin-panel-token` header'ı ile authentication yapılır
- Prisma schema güncellemesi yapıldıktan sonra migration çalıştırılmalı
- Frontend'de `priceAlerts` ve `searchFavorites` ile aynı mantık kullanılıyor

