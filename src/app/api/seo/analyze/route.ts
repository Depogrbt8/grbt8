import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Gerçek SEO analizi yapmak için fetch kullan
    const analysis = await performSEOAnalysis(url);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('SEO Analysis error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function performSEOAnalysis(url: string) {
  try {
    // URL'yi normalize et
    const normalizedUrl = url.startsWith('http') ? url : `https://gurbetbiz.app${url}`;
    
    // Sayfayı fetch et
    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'SEO-Analyzer/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    // SEO analizi yap
    const analysis = {
      url: url,
      title: extractTitle(html),
      description: extractDescription(html),
      keywords: extractKeywords(html),
      h1: extractH1(html),
      h2: extractH2(html),
      h3: extractH3(html),
      metaRobots: extractMetaRobots(html),
      canonical: extractCanonical(html),
      ogTitle: extractOGTitle(html),
      ogDescription: extractOGDescription(html),
      ogImage: extractOGImage(html),
      twitterTitle: extractTwitterTitle(html),
      twitterDescription: extractTwitterDescription(html),
      twitterImage: extractTwitterImage(html),
      schemaJson: extractSchema(html),
      seoScore: calculateSEOScore(html),
      issues: findSEOIssues(html),
      lastChecked: new Date().toISOString(),
    };

    return analysis;
  } catch (error) {
    console.error('SEO Analysis fetch error:', error);
    return {
      url: url,
      error: 'Sayfa analiz edilemedi',
      seoScore: 0,
      issues: ['Sayfa erişilemedi veya analiz hatası'],
      lastChecked: new Date().toISOString(),
    };
  }
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>(.*?)<\/title>/i);
  return match ? match[1].trim() : '';
}

function extractDescription(html: string): string {
  const match = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  return match ? match[1].trim() : '';
}

function extractKeywords(html: string): string {
  const match = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  return match ? match[1].trim() : '';
}

function extractH1(html: string): string {
  const match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  return match ? match[1].replace(/<[^>]*>/g, '').trim() : '';
}

function extractH2(html: string): string {
  const matches = html.match(/<h2[^>]*>(.*?)<\/h2>/gi);
  return matches ? matches.map(m => m.replace(/<[^>]*>/g, '').trim()).join(', ') : '';
}

function extractH3(html: string): string {
  const matches = html.match(/<h3[^>]*>(.*?)<\/h3>/gi);
  return matches ? matches.map(m => m.replace(/<[^>]*>/g, '').trim()).join(', ') : '';
}

function extractMetaRobots(html: string): string {
  const match = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  return match ? match[1].trim() : '';
}

function extractCanonical(html: string): string {
  const match = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i);
  return match ? match[1].trim() : '';
}

function extractOGTitle(html: string): string {
  const match = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  return match ? match[1].trim() : '';
}

function extractOGDescription(html: string): string {
  const match = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  return match ? match[1].trim() : '';
}

function extractOGImage(html: string): string {
  const match = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  return match ? match[1].trim() : '';
}

function extractTwitterTitle(html: string): string {
  const match = html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  return match ? match[1].trim() : '';
}

function extractTwitterDescription(html: string): string {
  const match = html.match(/<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  return match ? match[1].trim() : '';
}

function extractTwitterImage(html: string): string {
  const match = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  return match ? match[1].trim() : '';
}

function extractSchema(html: string): string {
  const matches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gi);
  if (matches) {
    const schemas = matches.map(m => {
      const content = m.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
      try {
        return JSON.parse(content);
      } catch {
        return null;
      }
    }).filter(Boolean);
    return JSON.stringify(schemas);
  }
  return '';
}

function calculateSEOScore(html: string): number {
  let score = 0;
  const issues: string[] = [];

  // Title kontrolü (0-20 puan)
  if (extractTitle(html)) {
    score += 20;
  } else {
    issues.push('Title tag eksik');
  }

  // Description kontrolü (0-20 puan)
  if (extractDescription(html)) {
    score += 20;
  } else {
    issues.push('Meta description eksik');
  }

  // H1 kontrolü (0-15 puan)
  if (extractH1(html)) {
    score += 15;
  } else {
    issues.push('H1 tag eksik');
  }

  // Meta robots kontrolü (0-10 puan)
  if (extractMetaRobots(html)) {
    score += 10;
  }

  // Canonical kontrolü (0-10 puan)
  if (extractCanonical(html)) {
    score += 10;
  }

  // Open Graph kontrolü (0-15 puan)
  if (extractOGTitle(html) && extractOGDescription(html)) {
    score += 15;
  } else {
    issues.push('Open Graph meta tags eksik');
  }

  // Twitter Cards kontrolü (0-10 puan)
  if (extractTwitterTitle(html) && extractTwitterDescription(html)) {
    score += 10;
  } else {
    issues.push('Twitter Cards meta tags eksik');
  }

  return Math.min(score, 100);
}

function findSEOIssues(html: string): string[] {
  const issues: string[] = [];
  
  if (!extractTitle(html)) issues.push('Title tag eksik');
  if (!extractDescription(html)) issues.push('Meta description eksik');
  if (!extractH1(html)) issues.push('H1 tag eksik');
  if (!extractOGTitle(html)) issues.push('Open Graph title eksik');
  if (!extractOGDescription(html)) issues.push('Open Graph description eksik');
  if (!extractCanonical(html)) issues.push('Canonical URL eksik');
  
  // Title uzunluk kontrolü
  const title = extractTitle(html);
  if (title && title.length > 60) issues.push('Title çok uzun (60 karakterden fazla)');
  
  // Description uzunluk kontrolü
  const description = extractDescription(html);
  if (description && description.length > 160) issues.push('Description çok uzun (160 karakterden fazla)');
  
  return issues;
}
