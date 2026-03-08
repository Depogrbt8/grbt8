# Admin panel giriş ve yetki yapısı

## Kim panele girebilir?

Admin panele (**/grbt-8**) sadece şu iki koşul birlikte sağlanırsa giriş yapılır:

1. **Giriş yapılmış olmalı**  
   NextAuth ile (e-posta + şifre veya Google/Facebook) giriş yapılmış olmalı; yani `session` var ve `session.user.email` dolu.

2. **E-posta “admin listesinde” olmalı**  
   Giriş yaptığınız e-posta, sunucudaki **ADMIN_EMAILS** listesinde olmalı.

## ADMIN_EMAILS nereden geliyor?

- **Ortam değişkeni:** Vercel (veya kullandığınız hosting) → Proje → **Settings** → **Environment Variables** → `ADMIN_EMAILS`
- **Örnek değer:** `admin@grbt8.store,manager@grbt8.store`  
  (Virgülle ayrılmış, boşluksuz. İstediğiniz kadar e-posta ekleyebilirsiniz.)
- **Varsayılan (kodda):** `ADMIN_EMAILS` tanımlı değilse otomatik olarak şu kullanılır:  
  `admin@grbt8.store,manager@grbt8.store`  
  Bu varsayılan değer `src/lib/adminAuth.ts` içinde tanımlı.

Yani **admin@grbt8.store** varsayılan listede; ekstra bir “yetki verme” adımı yok, bu mail ile giriş yapan herkes paneli görebilir (giriş şifresi doğruysa).

## Kodda nerede kullanılıyor?

- **Liste ve kontrol:** `src/lib/adminAuth.ts`  
  - `getAdminAllowEmails()` → İzin verilen e-posta listesi (ADMIN_EMAILS’ten veya varsayılandan).  
  - `isAdminEmail(email)` → Verilen e-posta bu listede mi, true/false.
- **Sayfa koruması:** Tüm `/grbt-8` sayfaları (dashboard, raporlar, kampanyalar, monitor, SEO, blog) şunu yapıyor:  
  `session` yoksa veya `session.user.email` listede değilse → **/grbt-8/giris** sayfasına yönlendiriyor.

## “admin@grbt8.store’a yetki verilmedi” ne demek?

- Kod tarafında **admin@grbt8.store** zaten varsayılan listede; “bu maile yetki verilmedi” diye bir özel blokaj yok.
- Eğer bu hesapla giriş yapınca panele giremiyorsanız olasılıklar:
  1. **Vercel’de ADMIN_EMAILS farklı tanımlı**  
     Örneğin sadece `manager@grbt8.store` yazıyorsa, `admin@grbt8.store` listede olmaz.  
     → **Çözüm:** `ADMIN_EMAILS` değerine `admin@grbt8.store` ekleyin (virgülle ayırın).
  2. **Session / cookie sorunu**  
     Giriş yaptığınız halde sayfa sizi “giriş yapmamış” sanıyor (özellikle gizli pencerede cookie kayboluyorsa).  
     → **Çözüm:** Normal pencerede deneyin; çerezleri kabul ettiğinizden emin olun.
  3. **Veritabanında kullanıcı yok veya şifre yanlış**  
     Bu mail ile kayıt yoksa veya şifre hatalıysa zaten giriş yapılamaz; “yetki” aşamasına gelinmez.  
     → **Çözüm:** `admin@grbt8.store` kullanıcısı için `prisma/seed-admin.js` ile oluşturma/güncelleme (şifre: `GRBT8Admin2025!`).

## Gizli pencerede overlay (siyah ekran) neden sadece admin’de oluyor?

- **ComingSoonPopup** her oturumda bir kez (sessionStorage ile) gösteriliyordu; gizli pencerede oturum temiz olduğu için admin ile girişte popup çıkıyor, ekranı kapatıyordu.
- **Yapılan düzeltme:** `/grbt-8` altındaki sayfalarda bu popup artık hiç gösterilmiyor. Deploy sonrası admin ile gizli pencerede de overlay çıkmamalı.
- Başka kullanıcıyla “olmuyor” demeniz, büyük ihtimalle normal pencerede daha önce aynı oturumda popup bir kez gösterildiği için tekrar çıkmıyor olması.

## Kısa kontrol listesi

- [ ] Vercel’de `ADMIN_EMAILS` var mı? Varsa içinde `admin@grbt8.store` var mı?
- [ ] `admin@grbt8.store` ile gerçekten giriş yapılabiliyor mu? (Şifre: seed’deki `GRBT8Admin2025!` veya sizin belirlediğiniz)
- [ ] Admin overlay düzeltmesi deploy edildi mi? (ComingSoonPopup /grbt-8’de kapatıldı)

Bu yapı ile **admin@grbt8.store** zaten yetkili; ekstra “yetki verme” adımı yok, sadece bu mail’in `ADMIN_EMAILS` listesinde olması (veya varsayılan kullanılması) ve giriş yapılmış olması yeterli.
