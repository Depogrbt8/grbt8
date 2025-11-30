/**
 * Anahtar kelimelere göre otomatik içerik oluşturma helper'ı
 */

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
  // Anahtar kelimeyi başlığa dönüştür
  if (keyword.includes('ucuz uçak bileti') || keyword.includes('uçuş')) {
    return `${keyword} | Gurbetbiz Rehberi`;
  } else if (keyword.includes('otel') || keyword.includes('hotel')) {
    return `${keyword} | Gurbetbiz'de En Uygun Fiyatlar`;
  } else if (keyword.includes('villa') || keyword.includes('kiralık')) {
    return `${keyword} | Gurbetbiz'de Güvenli Rezervasyon`;
  } else if (keyword.includes('araç') || keyword.includes('araba') || keyword.includes('rent')) {
    return `${keyword} | Gurbetbiz'de Hızlı Rezervasyon`;
  }
  return `${keyword} | Gurbetbiz Seyahat Rehberi`;
}

export function generateBlogDescription(keyword: string): string {
  const descriptions: { [key: string]: string } = {
    'ucuz uçak bileti': `En uygun fiyatlı ${keyword} için Gurbetbiz'i tercih edin. Avrupa'dan Türkiye'ye en ucuz uçak biletleri, anında rezervasyon, güvenli ödeme.`,
    'otel': `${keyword} için Gurbetbiz'de binlerce otel seçeneği. En uygun fiyat garantisi, ücretsiz iptal, güvenli rezervasyon.`,
    'villa': `${keyword} için Gurbetbiz'de özel villalar. Havuzlu, deniz manzaralı, özel villalar en uygun fiyatlarla.`,
    'araç': `${keyword} için Gurbetbiz'de havalimanı teslim. En uygun fiyatlar, sigorta dahil, güvenli rezervasyon.`,
  };

  for (const [key, desc] of Object.entries(descriptions)) {
    if (keyword.toLowerCase().includes(key)) {
      return desc;
    }
  }

  return `${keyword} için Gurbetbiz'de en uygun fiyatlar. Güvenli rezervasyon, anında onay, 7/24 müşteri desteği.`;
}

export function generateBlogContent(keyword: string): string {
  const contentTemplates = {
    'ucuz uçak bileti': generateFlightContent(keyword),
    'uçuş': generateFlightContent(keyword),
    'otel': generateHotelContent(keyword),
    'hotel': generateHotelContent(keyword),
    'villa': generateVillaContent(keyword),
    'araç': generateCarContent(keyword),
    'araba': generateCarContent(keyword),
    'rent': generateCarContent(keyword),
  };

  for (const [key, generator] of Object.entries(contentTemplates)) {
    if (keyword.toLowerCase().includes(key)) {
      return generator;
    }
  }

  return generateGenericContent(keyword);
}

function generateFlightContent(keyword: string): string {
  const country = keyword.includes('Almanya') ? 'Almanya' :
                  keyword.includes('Fransa') ? 'Fransa' :
                  keyword.includes('Belçika') ? 'Belçika' :
                  keyword.includes('Hollanda') ? 'Hollanda' :
                  keyword.includes('Danimarka') ? 'Danimarka' : 'Avrupa';

  return `
    <h2>${keyword}: Gurbetçiler İçin Kapsamlı Rehber</h2>
    <p>${country}’da yaşayan gurbetçiler için Türkiye’ye en uygun fiyatlı uçak biletleri Gurbetbiz’de. Yılların deneyimi ile ${country}’dan Türkiye’ye giden tüm havayollarının fiyatlarını karşılaştırıyoruz.</p>
    
    <h3>${keyword} İçin Neden Gurbetbiz?</h3>
    <ul>
      <li>Avrupa’dan Türkiye’ye tüm rotalar için en uygun fiyatlar</li>
      <li>Anında rezervasyon ve onay</li>
      <li>Güvenli ödeme sistemi</li>
      <li>7/24 Türkçe müşteri desteği</li>
      <li>Fiyat alarmı ile en iyi fırsatları kaçırmayın</li>
    </ul>

    <h3>${keyword} Rezervasyon İpuçları</h3>
    <p>En uygun fiyatlı ${keyword} için erken rezervasyon yapın. Özellikle bayram ve yaz sezonu için en az 3 ay önceden rezervasyon yapmanızı öneriyoruz. Gurbetbiz fiyat alarmı özelliği ile ideal fiyatı yakalayın.</p>

    <h3>${country}’dan Türkiye’ye Uçuş Seçenekleri</h3>
    <p>Gurbetbiz’de ${country}’dan Türkiye’ye direkt ve aktarmalı uçuş seçenekleri bulabilirsiniz. İstanbul, Ankara, İzmir, Antalya ve diğer Türk şehirlerine uçuş seçenekleri mevcuttur.</p>

    <div class="bg-green-50 border-l-4 border-green-500 p-6 my-8">
      <h3 class="text-lg font-semibold text-green-800 mb-2">Gurbetbiz Özel İpucu</h3>
      <p class="text-green-700">
        ${keyword} için en uygun fiyatları bulmak için esnek tarih araması yapın. Birkaç gün önce veya sonra uçuş yaparak %30'a varan tasarruf sağlayabilirsiniz!
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

