/**
 * Anahtar kelimelere göre otomatik içerik oluşturma helper'ı
 */

// İngilizce keyword'leri Türkçeye çevir
function translateKeyword(keyword: string): string {
  const translations: { [key: string]: string } = {
    'Buy now pay later flight Turkey': 'Şimdi Al Sonra Öde Türkiye Uçak Bileti',
    'Installment flight tickets Europe Turkey': 'Taksitli Uçak Bileti Avrupa Türkiye',
    'Europe Turkey installment travel platform': 'Avrupa Türkiye Taksitli Seyahat Platformu',
    'Cheap flights to Turkey': 'Türkiye\'ye Ucuz Uçak Biletleri',
    'Flights to Turkey from Europe': 'Avrupa\'dan Türkiye\'ye Uçuşlar',
    'Turkey travel deals': 'Türkiye Seyahat Fırsatları',
    'flights Turkey': 'Türkiye uçuşları',
    'flight Turkey': 'Türkiye uçuşu',
    'cheap flights': 'ucuz uçak biletleri',
    'installment': 'taksitli',
    'buy now pay later': 'şimdi al sonra öde',
    'travel deals': 'seyahat fırsatları',
    'Turkey hotels': 'Türkiye otelleri',
    'hotel': 'otel',
    'hotels': 'oteller',
    'rent a car': 'araç kiralama',
    'car rental': 'araç kiralama',
  };

  // Tam eşleşme kontrolü
  if (translations[keyword]) {
    return translations[keyword];
  }

  // Kısmi eşleşme (case-insensitive)
  let translatedKeyword = keyword;
  for (const [english, turkish] of Object.entries(translations)) {
    const regex = new RegExp(english, 'gi');
    translatedKeyword = translatedKeyword.replace(regex, turkish);
  }

  return translatedKeyword;
}

export function generateSlug(keyword: string): string {
  return keyword
    .toLowerCase()
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateBlogTitle(keyword: string): string {
  // İngilizce keyword'leri Türkçeye çevir
  const translatedKeyword = translateKeyword(keyword);
  
  // Başlığı oluştur
  if (translatedKeyword.includes('ucuz uçak bileti') || translatedKeyword.includes('uçuş') || translatedKeyword.includes('uçak bileti')) {
    return `${translatedKeyword} | Gurbetbiz Rehberi`;
  } else if (translatedKeyword.includes('otel') || translatedKeyword.includes('konaklama')) {
    return `${translatedKeyword} | Gurbetbiz'de En Uygun Fiyatlar`;
  } else if (translatedKeyword.includes('villa') || translatedKeyword.includes('kiralık')) {
    return `${translatedKeyword} | Gurbetbiz'de Güvenli Rezervasyon`;
  } else if (translatedKeyword.includes('araç') || translatedKeyword.includes('araba') || translatedKeyword.includes('kiralama')) {
    return `${translatedKeyword} | Gurbetbiz'de Hızlı Rezervasyon`;
  }
  return `${translatedKeyword} | Gurbetbiz Seyahat Rehberi`;
}

export function generateBlogDescription(keyword: string): string {
  // İngilizce keyword'leri Türkçeye çevir
  const translatedKeyword = translateKeyword(keyword);
  
  const descriptions: { [key: string]: string } = {
    'ucuz uçak bileti': `En uygun fiyatlı ${translatedKeyword} için Gurbetbiz'i tercih edin. Avrupa'dan Türkiye'ye en ucuz uçak biletleri, anında rezervasyon, güvenli ödeme.`,
    'uçak bileti': `En uygun fiyatlı ${translatedKeyword} için Gurbetbiz'i tercih edin. Avrupa'dan Türkiye'ye en ucuz uçak biletleri, anında rezervasyon, güvenli ödeme.`,
    'taksitli': `${translatedKeyword} ile Gurbetbiz'de kolayca ödeme yapın. Şimdi al sonra öde seçeneği, taksit imkanı, güvenli rezervasyon.`,
    'otel': `${translatedKeyword} için Gurbetbiz'de binlerce otel seçeneği. En uygun fiyat garantisi, ücretsiz iptal, güvenli rezervasyon.`,
    'villa': `${translatedKeyword} için Gurbetbiz'de özel villalar. Havuzlu, deniz manzaralı, özel villalar en uygun fiyatlarla.`,
    'araç': `${translatedKeyword} için Gurbetbiz'de havalimanı teslim. En uygun fiyatlar, sigorta dahil, güvenli rezervasyon.`,
  };

  for (const [key, desc] of Object.entries(descriptions)) {
    if (translatedKeyword.toLowerCase().includes(key)) {
      return desc;
    }
  }

  return `${translatedKeyword} için Gurbetbiz'de en uygun fiyatlar. Güvenli rezervasyon, anında onay, 7/24 müşteri desteği.`;
}

export function generateBlogContent(keyword: string): string {
  // İngilizce keyword'leri Türkçeye çevir
  const translatedKeyword = translateKeyword(keyword);
  
  const contentTemplates = {
    'ucuz uçak bileti': generateFlightContent(translatedKeyword),
    'uçak bileti': generateFlightContent(translatedKeyword),
    'uçuş': generateFlightContent(translatedKeyword),
    'taksitli': generateInstallmentFlightContent(translatedKeyword),
    'otel': generateHotelContent(translatedKeyword),
    'hotel': generateHotelContent(translatedKeyword),
    'villa': generateVillaContent(translatedKeyword),
    'araç': generateCarContent(translatedKeyword),
    'araba': generateCarContent(translatedKeyword),
    'kiralama': generateCarContent(translatedKeyword),
  };

  for (const [key, generator] of Object.entries(contentTemplates)) {
    if (translatedKeyword.toLowerCase().includes(key)) {
      return generator;
    }
  }

  return generateGenericContent(translatedKeyword);
}

function generateFlightContent(keyword: string): string {
  const country = keyword.includes('Almanya') ? 'Almanya' :
                  keyword.includes('Fransa') ? 'Fransa' :
                  keyword.includes('Belçika') ? 'Belçika' :
                  keyword.includes('Hollanda') ? 'Hollanda' :
                  keyword.includes('Danimarka') ? 'Danimarka' : 'Avrupa';

  return `
    <h2>${keyword}: Gurbetçiler İçin Kapsamlı Rehber</h2>
    <p>${country}'da yaşayan gurbetçiler için Türkiye'ye en uygun fiyatlı uçak biletleri Gurbetbiz'de. Yılların deneyimi ile ${country}'dan Türkiye'ye giden tüm havayollarının fiyatlarını karşılaştırıyoruz.</p>
    
    <h3>${keyword} İçin Neden Gurbetbiz?</h3>
    <ul>
      <li>Avrupa'dan Türkiye'ye tüm rotalar için en uygun fiyatlar</li>
      <li>Anında rezervasyon ve onay</li>
      <li>Güvenli ödeme sistemi</li>
      <li>7/24 Türkçe müşteri desteği</li>
      <li>Fiyat alarmı ile en iyi fırsatları kaçırmayın</li>
    </ul>

    <h3>${keyword} Rezervasyon İpuçları</h3>
    <p>En uygun fiyatlı ${keyword} için erken rezervasyon yapın. Özellikle bayram ve yaz sezonu için en az 3 ay önceden rezervasyon yapmanızı öneriyoruz. Gurbetbiz fiyat alarmı özelliği ile ideal fiyatı yakalayın.</p>

    <h3>${country}'dan Türkiye'ye Uçuş Seçenekleri</h3>
    <p>Gurbetbiz'de ${country}'dan Türkiye'ye direkt ve aktarmalı uçuş seçenekleri bulabilirsiniz. İstanbul, Ankara, İzmir, Antalya ve diğer Türk şehirlerine uçuş seçenekleri mevcuttur.</p>

    <div class="bg-green-50 border-l-4 border-green-500 p-6 my-8">
      <h3 class="text-lg font-semibold text-green-800 mb-2">Gurbetbiz Özel İpucu</h3>
      <p class="text-green-700">
        ${keyword} için en uygun fiyatları bulmak için esnek tarih araması yapın. Birkaç gün önce veya sonra uçuş yaparak %30'a varan tasarruf sağlayabilirsiniz!
      </p>
    </div>
  `;
}

function generateInstallmentFlightContent(keyword: string): string {
  return `
    <h2>${keyword}: Esnek Ödeme ile Türkiye'ye Uçun</h2>
    <p>Gurbetbiz'de şimdi al sonra öde ve taksitli ödeme seçenekleriyle Türkiye'ye uçmak artık çok daha kolay! Bütçenize uygun ödeme planlarıyla vatan yolculuğunuzu planlayın.</p>
    
    <h3>Taksitli Uçak Bileti Avantajları</h3>
    <ul>
      <li>Şimdi al sonra öde imkanı</li>
      <li>3, 6, 9 veya 12 taksit seçenekleri</li>
      <li>Faiz oranları rekabetçi</li>
      <li>Kredi kartı veya banka transferi ile ödeme</li>
      <li>Anında rezervasyon onayı</li>
      <li>7/24 Türkçe müşteri desteği</li>
    </ul>

    <h3>Nasıl Çalışır?</h3>
    <p>Gurbetbiz'de ${keyword} için rezervasyon yaparken ödeme adımında "Taksitli Ödeme" seçeneğini seçin. İstediğiniz taksit sayısını belirleyin ve güvenli ödeme ile rezervasyonunuzu tamamlayın. İlk taksit hemen alınır, kalan ödemeler belirlediğiniz tarihlerde otomatik olarak çekilir.</p>

    <h3>Kimler Yararlanabilir?</h3>
    <p>Avrupa'da yaşayan tüm gurbetçiler taksitli uçak bileti imkanından yararlanabilir. Kredi kartınız veya banka hesabınız olması yeterli.</p>

    <div class="bg-green-50 border-l-4 border-green-500 p-6 my-8">
      <h3 class="text-lg font-semibold text-green-800 mb-2">Gurbetbiz Özel Fırsat</h3>
      <p class="text-green-700">
        İlk rezervasyonunuzda 12 taksit seçeneği ile ilk 3 ay faizsiz ödeme imkanı! Şimdi kayıt olun ve özel fırsatlardan yararlanın.
      </p>
    </div>
  `;
}

function generateHotelContent(keyword: string): string {
  const city = keyword.includes('Antalya') ? 'Antalya' :
               keyword.includes('Muğla') || keyword.includes('Mugla') ? 'Muğla' :
               keyword.includes('İstanbul') ? 'İstanbul' : 'Türkiye';

  return `
    <h2>${keyword}: ${city}'de En İyi Fırsatlar</h2>
    <p>${city}'de ${keyword} için Gurbetbiz'de binlerce otel seçeneği. Beş yıldızlı lüks otellerden butik otellere kadar tüm konaklama seçenekleri en uygun fiyatlarla.</p>

    <h3>${city}'de Otel Rezervasyonu İçin Gurbetbiz Avantajları</h3>
    <ul>
      <li>En uygun fiyat garantisi - Daha uygun bulursanız farkı ödüyoruz</li>
      <li>Ücretsiz iptal seçeneği</li>
      <li>Merkezi konumda oteller</li>
      <li>Güvenli rezervasyon ve ödeme</li>
      <li>Türkçe müşteri desteği</li>
    </ul>

    <h3>${city}'de Gurbetçilerin Tercih Ettiği Oteller</h3>
    <p>Gurbetbiz olarak, ${city}'de gurbetçilerin sıklıkla tercih ettiği otelleri özenle seçiyoruz. Aile dostu, merkezi konumda ve uygun fiyatlı oteller listemizde.</p>

    <h3>${keyword} Paket Fırsatları</h3>
    <p>Uçak bileti + otel paketleri ile ekstra tasarruf sağlayın. ${city} tatilinizde hem uçak hem otel rezervasyonunu birlikte yaparak %20'ye varan indirim kazanın.</p>
  `;
}

function generateVillaContent(keyword: string): string {
  const city = keyword.includes('Antalya') ? 'Antalya' :
               keyword.includes('Muğla') || keyword.includes('Mugla') ? 'Muğla' : 'Türkiye';

  return `
    <h2>${keyword}: ${city}'de Özel Tatil Deneyimi</h2>
    <p>${city}'de ${keyword} için Gurbetbiz'de özel villalar. Havuzlu, deniz manzaralı, tam donanımlı villalar en uygun fiyatlarla rezervasyonunuzu bekliyor.</p>

    <h3>${city}'de Villa Kiralama Avantajları</h3>
    <ul>
      <li>Özel havuzlu villalar</li>
      <li>Deniz manzaralı konumlar</li>
      <li>Tam donanımlı mutfak</li>
      <li>Güvenli ve özel ortam</li>
      <li>Aile dostu tesisler</li>
    </ul>

    <h3>${keyword} Paket Seçenekleri</h3>
    <p>Villa + uçak bileti paketleri ile tatilinizi planlayın. ${city}'de villa kiralama ile birlikte uçak biletinizi de Gurbetbiz'den alın, ekstra indirim kazanın.</p>
  `;
}

function generateCarContent(keyword: string): string {
  return `
    <h2>${keyword}: Türkiye'de Özgürce Seyahat</h2>
    <p>${keyword} için Gurbetbiz'de havalimanı teslim araç kiralama. Türkiye'de özgürce seyahat etmek için en uygun fiyatlı araç kiralama seçenekleri.</p>

    <h3>Araç Kiralama Avantajları</h3>
    <ul>
      <li>Havalimanı teslim ve teslim alma</li>
      <li>Sigorta dahil fiyatlar</li>
      <li>Yeni model araçlar</li>
      <li>Otomatik ve manuel şanzıman</li>
      <li>Uzun dönem kiralama indirimleri</li>
    </ul>

    <h3>${keyword} Rezervasyon İpuçları</h3>
    <p>En uygun fiyatlı ${keyword} için erken rezervasyon yapın. Uzun dönem kiralama yaparak günlük fiyattan %30'a varan tasarruf sağlayabilirsiniz.</p>
  `;
}

function generateGenericContent(keyword: string): string {
  return `
    <h2>${keyword}: Gurbetbiz ile En İyi Fırsatlar</h2>
    <p>${keyword} için Gurbetbiz'de en uygun fiyatlar ve güvenli rezervasyon. Avrupa'dan Türkiye'ye seyahat eden gurbetçiler için özel hizmetler.</p>

    <h3>Neden Gurbetbiz?</h3>
    <ul>
      <li>En uygun fiyat garantisi</li>
      <li>Güvenli ödeme</li>
      <li>Anında rezervasyon</li>
      <li>7/24 Türkçe destek</li>
      <li>Gurbetçilere özel fırsatlar</li>
    </ul>

    <h3>${keyword} İçin Rezervasyon Yapın</h3>
    <p>${keyword} için hemen rezervasyon yapın ve en uygun fiyatlardan yararlanın. Gurbetbiz ile memlekete dönüş yolculuğunuz kolay ve ekonomik.</p>
  `;
}

// Landing page'ler için kısa, conversion odaklı içerik
export function generateLandingPageContent(keyword: string, type: 'flight' | 'hotel' | 'villa' | 'car'): string {
  const city = keyword.includes('Antalya') ? 'Antalya' :
               keyword.includes('Muğla') || keyword.includes('Mugla') ? 'Muğla' :
               keyword.includes('İstanbul') ? 'İstanbul' : 'Türkiye';

  if (type === 'flight') {
    return `
      <p class="text-lg text-gray-700 mb-6">
        ${keyword} arayışınızda Gurbetbiz, Avrupa'dan Türkiye'ye tüm rotalar için en uygun fiyatları karşılaştırıyor. 
        Anında rezervasyon, güvenli ödeme ve 7/24 Türkçe müşteri desteği ile yanınızdayız.
      </p>
      <h3 class="text-xl font-bold text-gray-800 mb-4">Neden Gurbetbiz?</h3>
      <ul class="space-y-2 mb-6">
        <li>✅ Tüm havayollarının fiyatlarını tek platformda</li>
        <li>✅ En uygun fiyat garantisi</li>
        <li>✅ Anında rezervasyon ve onay</li>
        <li>✅ Güvenli ödeme sistemi</li>
        <li>✅ 7/24 Türkçe destek</li>
      </ul>
    `;
  }

  if (type === 'hotel') {
    return `
      <p class="text-lg text-gray-700 mb-6">
        ${city}'de ${keyword} için Gurbetbiz'de binlerce otel seçeneği. 
        Beş yıldızlı lüks otellerden butik otellere kadar tüm konaklama seçenekleri en uygun fiyatlarla.
      </p>
      <h3 class="text-xl font-bold text-gray-800 mb-4">Otel Rezervasyon Avantajları</h3>
      <ul class="space-y-2 mb-6">
        <li>✅ En uygun fiyat garantisi</li>
        <li>✅ Ücretsiz iptal seçeneği</li>
        <li>✅ Merkezi konumda oteller</li>
        <li>✅ Güvenli rezervasyon</li>
        <li>✅ Türkçe müşteri desteği</li>
      </ul>
    `;
  }

  if (type === 'villa') {
    return `
      <p class="text-lg text-gray-700 mb-6">
        ${city}'de ${keyword} için Gurbetbiz'de özel villalar. 
        Havuzlu, deniz manzaralı, tam donanımlı villalar en uygun fiyatlarla rezervasyonunuzu bekliyor.
      </p>
      <h3 class="text-xl font-bold text-gray-800 mb-4">Villa Kiralama Avantajları</h3>
      <ul class="space-y-2 mb-6">
        <li>✅ Özel havuzlu villalar</li>
        <li>✅ Deniz manzaralı konumlar</li>
        <li>✅ Tam donanımlı mutfak</li>
        <li>✅ Güvenli ve özel ortam</li>
        <li>✅ Aile dostu tesisler</li>
      </ul>
    `;
  }

  if (type === 'car') {
    return `
      <p class="text-lg text-gray-700 mb-6">
        ${keyword} için Gurbetbiz'de havalimanı teslim araç kiralama. 
        Türkiye'de özgürce seyahat etmek için en uygun fiyatlı araç kiralama seçenekleri.
      </p>
      <h3 class="text-xl font-bold text-gray-800 mb-4">Araç Kiralama Avantajları</h3>
      <ul class="space-y-2 mb-6">
        <li>✅ Havalimanı teslim ve teslim alma</li>
        <li>✅ Sigorta dahil fiyatlar</li>
        <li>✅ Yeni model araçlar</li>
        <li>✅ Uzun dönem kiralama indirimleri</li>
        <li>✅ Otomatik ve manuel şanzıman</li>
      </ul>
    `;
  }

  return '';
}

