/**
 * Keyword Clustering - Anahtar kelimeleri gruplar
 * 5 benzer keyword = 1 kapsamlı blog yazısı
 */

export interface KeywordCluster {
  id: string;
  mainKeyword: string;
  relatedKeywords: string[];
  allKeywords: string[];
  category: string;
  country?: string;
}

export function clusterKeywords(keywords: string[]): KeywordCluster[] {
  if (keywords.length === 0) return [];

  const clusters: KeywordCluster[] = [];
  const used = new Set<string>();

  // Öncelik sırası: Ülke > Kategori bazlı gruplama
  const countries = ['Almanya', 'Fransa', 'Hollanda', 'Belçika', 'Danimarka', 'İsveç', 'Norveç', 'İsviçre', 'Avusturya'];
  const categories = [
    { name: 'Uçak Bileti', keywords: ['uçak', 'uçuş', 'flight', 'bilet', 'ticket'] },
    { name: 'Otel', keywords: ['otel', 'hotel', 'konaklama'] },
    { name: 'Villa', keywords: ['villa', 'kiralık'] },
    { name: 'Araç Kiralama', keywords: ['araç', 'araba', 'rent', 'car', 'kiralama'] },
    { name: 'Tatil Paketi', keywords: ['tatil', 'paket', 'gurbetçi'] },
  ];

  // Ülke + Kategori kombinasyonları için gruplama
  for (const country of countries) {
    for (const category of categories) {
      const matchingKeywords = keywords.filter(kw => {
        if (used.has(kw)) return false;
        
        const kwLower = kw.toLowerCase();
        const hasCountry = kwLower.includes(country.toLowerCase());
        const hasCategory = category.keywords.some(cat => kwLower.includes(cat));
        
        return hasCountry && hasCategory;
      });

      if (matchingKeywords.length > 0) {
        // Ana keyword'ü seç (en kısa ve genel olanı)
        const mainKeyword = matchingKeywords.sort((a, b) => a.length - b.length)[0];
        const relatedKeywords = matchingKeywords.filter(kw => kw !== mainKeyword);

        clusters.push({
          id: `${country.toLowerCase()}-${category.name.toLowerCase().replace(/\s+/g, '-')}`,
          mainKeyword,
          relatedKeywords,
          allKeywords: matchingKeywords,
          category: category.name,
          country,
        });

        matchingKeywords.forEach(kw => used.add(kw));
      }
    }
  }

  // Sadece kategori bazlı gruplama (ülke yok)
  for (const category of categories) {
    const matchingKeywords = keywords.filter(kw => {
      if (used.has(kw)) return false;
      
      const kwLower = kw.toLowerCase();
      const hasCategory = category.keywords.some(cat => kwLower.includes(cat));
      const hasCountry = countries.some(country => kwLower.includes(country.toLowerCase()));
      
      return hasCategory && !hasCountry;
    });

    if (matchingKeywords.length > 0) {
      const mainKeyword = matchingKeywords.sort((a, b) => a.length - b.length)[0];
      const relatedKeywords = matchingKeywords.filter(kw => kw !== mainKeyword);

      clusters.push({
        id: `genel-${category.name.toLowerCase().replace(/\s+/g, '-')}`,
        mainKeyword,
        relatedKeywords,
        allKeywords: matchingKeywords,
        category: category.name,
      });

      matchingKeywords.forEach(kw => used.add(kw));
    }
  }

  // Kalan keyword'leri genel gruba ekle
  const remainingKeywords = keywords.filter(kw => !used.has(kw));
  if (remainingKeywords.length > 0) {
    // 5'erli gruplara böl
    for (let i = 0; i < remainingKeywords.length; i += 5) {
      const group = remainingKeywords.slice(i, i + 5);
      const mainKeyword = group[0];
      const relatedKeywords = group.slice(1);

      clusters.push({
        id: `genel-${i / 5 + 1}`,
        mainKeyword,
        relatedKeywords,
        allKeywords: group,
        category: 'Genel',
      });
    }
  }

  return clusters;
}

export function getClusterSlug(cluster: KeywordCluster): string {
  return cluster.mainKeyword
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

export function getClusterTitle(cluster: KeywordCluster): string {
  if (cluster.country) {
    return `${cluster.country} ${cluster.category} | Gurbetbiz`;
  }
  return `${cluster.mainKeyword} | Gurbetbiz`;
}

export function getClusterDescription(cluster: KeywordCluster): string {
  const keywordList = cluster.allKeywords.slice(0, 3).join(', ');
  return `${keywordList} ve daha fazlası için Gurbetbiz'de en uygun fiyatlar. Kapsamlı rehber, ipuçları ve fırsatlar.`;
}

