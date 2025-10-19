import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GitHub yapılandırması
const GITHUB_TOKEN = process.env.GITHUB_BACKUP_TOKEN || '';
const DEFAULT_GITHUB_REPO = 'grbt8yedek/cronbackup';
// Güvenlik: default değer KALDIRILDI. Env yoksa 500 dön.
const BACKUP_SECRET = process.env.BACKUP_SECRET_TOKEN;
const BACKUP_ALLOWED_IPS = (process.env.BACKUP_ALLOWED_IPS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

function getClientIp(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  // @ts-ignore - NextRequest may expose ip in some runtimes
  return (request as any).ip || 'unknown';
}

function ensureSecretAndNetwork(request: NextRequest): NextResponse | null {
  if (!BACKUP_SECRET) {
    return NextResponse.json({ success: false, error: 'Backup secret misconfigured' }, { status: 500 });
  }
  const authHeader = request.headers.get('authorization') || '';
  const hasSecret = authHeader.includes(BACKUP_SECRET);
  const isCron = !!request.headers.get('x-vercel-cron');
  const userAgent = request.headers.get('user-agent') || '';
  
  // DEBUG: Header'ları logla
  console.log('🔍 Backup Debug:', {
    hasSecret: !!hasSecret,
    isCron: !!isCron,
    authHeader: authHeader.substring(0, 10) + '...',
    userAgent: userAgent.substring(0, 50),
    allHeaders: Object.fromEntries(request.headers.entries())
  });
  
  // Prod: cron header varsa secret gerekmez, yoksa secret gerekli
  if (process.env.NODE_ENV === 'production') {
    if (!isCron && !hasSecret) {
      return NextResponse.json({ success: false, error: 'Unauthorized - Need cron header or secret' }, { status: 401 });
    }
  } else {
    // Dev: secret yeterli
    if (!hasSecret) {
      return NextResponse.json({ success: false, error: 'Unauthorized - Need secret' }, { status: 401 });
    }
  }
  // IP allowlist (opsiyonel)
  if (BACKUP_ALLOWED_IPS.length > 0) {
    const ip = getClientIp(request);
    if (!BACKUP_ALLOWED_IPS.includes(ip)) {
      return NextResponse.json({ success: false, error: 'IP not allowed' }, { status: 403 });
    }
  }
  return null;
}

// Son backup zamanını kontrol et
async function getLastBackupTime(): Promise<Date | null> {
  try {
    const backupDir = path.join('/tmp', 'backups', 'scheduled');
    if (!fs.existsSync(backupDir)) {
      return null;
    }
    
    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('grbt8-backup-'))
      .sort()
      .reverse();
    
    if (files.length === 0) return null;
    
    const lastFile = files[0];
    const stats = fs.statSync(path.join(backupDir, lastFile));
    return stats.mtime;
  } catch (error) {
    logger.error('Son backup zamanı alınamadı:', error);
    return null;
  }
}

// ZIP fonksiyonu kaldırıldı - artık sadece JSON kullanıyoruz (daha güvenilir ve Vercel uyumlu)

// Tüm database verilerini yedekle
async function createFullBackup(): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join('/tmp', 'backups', 'scheduled');
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  logger.info('🔄 Full database backup oluşturuluyor...');

  // Tüm tabloları yedekle
  function mask(value: any): any {
    if (!value || typeof value !== 'string') return value;
    if (value.length <= 6) return '***';
    return `${value.slice(0, 3)}***${value.slice(-3)}`;
  }

  const backup = {
    metadata: {
      timestamp: new Date().toISOString(),
      version: '2.0',
      environment: process.env.NODE_ENV || 'production',
      backupType: 'scheduled',
      description: 'Otomatik zamanlanmış backup - 6 saatte bir'
    },
    schema: {
      // Prisma schema'yı oku
      prismaSchema: fs.readFileSync(path.join(process.cwd(), 'prisma', 'schema.prisma'), 'utf8')
    },
    data: {
      // Kullanıcılar
      users: await prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          countryCode: true,
          phone: true,
          birthDay: true,
          birthMonth: true,
          birthYear: true,
          gender: true,
          isForeigner: true,
          status: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          passengers: true,
          reservations: true,
          priceAlerts: true,
          searchFavorites: true,
        }
      }),

      // NextAuth / Auth tabloları (hassas alanlar maskelenmiş)
      accounts: await (async () => {
        try {
          const rows = await prisma.account.findMany();
          return rows.map((r: any) => ({
            ...r,
            refresh_token: mask(r.refresh_token),
            access_token: mask(r.access_token),
            id_token: mask(r.id_token),
            session_state: mask(r.session_state),
          }));
        } catch { return []; }
      })(),
      sessions: await (async () => {
        try {
          const rows = await prisma.session.findMany();
          return rows.map((r: any) => ({ ...r, sessionToken: mask(r.sessionToken) }));
        } catch { return []; }
      })(),
      verificationTokens: await (async () => {
        try {
          const rows = await prisma.verificationToken.findMany();
          return rows.map((r: any) => ({ ...r, token: mask(r.token) }));
        } catch { return []; }
      })(),
      
      // Rezervasyonlar
      reservations: await prisma.reservation.findMany({
        include: {
          user: true,
          payment: true
        }
      }),
      
      // Yolcular
      passengers: await prisma.passenger.findMany({
        include: {
          user: true
        }
      }),
      
      // Kampanyalar
      campaigns: await prisma.campaign.findMany(),
      
      // Fiyat alarmları
      priceAlerts: await prisma.priceAlert.findMany({
        include: {
          user: true
        }
      }),
      
      // Arama favorileri
      searchFavorites: await prisma.searchFavorite.findMany({
        include: {
          user: true
        }
      }),
      
      // Anket yanıtları
      surveyResponses: await prisma.surveyResponse.findMany(),

      // Email ile ilgili tablolar kritik değil; yoksa boş döndür
      emailQueue: await (async () => {
        try { return await prisma.emailQueue.findMany(); } catch { return []; }
      })(),

      // Sistem ayarları
      systemSettings: await prisma.systemSettings.findMany(),

      emailTemplates: await (async () => {
        try { return await prisma.emailTemplate.findMany(); } catch { return []; }
      })(),

      // E-mail logları (PII maskeleme)
      emailLogs: await (async () => {
        try {
          const rows = await prisma.emailLog.findMany();
          return rows.map((r: any) => ({
            ...r,
            recipient: r.recipient ? mask(r.recipient) : null,
            cc: r.cc ? mask(r.cc) : null,
            bcc: r.bcc ? mask(r.bcc) : null,
          }));
        } catch { return []; }
      })(),

      emailSettings: await (async () => {
        try { return await prisma.emailSettings.findMany(); } catch { return []; }
      })(),
      
      // Sistem logları (kısıtlı alanlar, kısa mesaj)
      systemLogs: await (async () => {
        try {
          const rows = await prisma.systemLog.findMany({ orderBy: { timestamp: 'desc' }, take: 2000 });
          return rows.map((r: any) => ({ id: r.id, level: r.level, source: r.source, message: (r.message || '').slice(0, 200), timestamp: r.timestamp }));
        } catch { return []; }
      })(),

      // Ödemeler (ayrık liste)
      payments: await (async () => { try { return await prisma.payment.findMany(); } catch { return []; } })(),
      
      // Faturalama bilgileri
      billingInfos: await prisma.billingInfo.findMany()
    },
    statistics: {
      totalUsers: 0,
      totalReservations: 0,
      totalPassengers: 0,
      totalCampaigns: 0,
      totalPriceAlerts: 0,
      totalSearchFavorites: 0,
      totalSurveyResponses: 0,
      totalEmailTemplates: 0,
      totalSystemLogs: 0,
      backupSize: 0
    }
  };

  // İstatistikleri hesapla
  backup.statistics.totalUsers = backup.data.users.length;
  backup.statistics.totalReservations = backup.data.reservations.length;
  backup.statistics.totalPassengers = backup.data.passengers.length;
  backup.statistics.totalCampaigns = backup.data.campaigns.length;
  backup.statistics.totalPriceAlerts = backup.data.priceAlerts.length;
  backup.statistics.totalSearchFavorites = backup.data.searchFavorites.length;
  backup.statistics.totalSurveyResponses = backup.data.surveyResponses.length;
  backup.statistics.totalEmailTemplates = backup.data.emailTemplates.length;
  backup.statistics.totalSystemLogs = backup.data.systemLogs.length;

  // JSON dosyasını oluştur
  const jsonData = JSON.stringify(backup, null, 2);
  backup.statistics.backupSize = Buffer.byteLength(jsonData, 'utf8');

  // JSON dosyasını kaydet (ZIP yerine doğrudan JSON kullan - daha güvenilir)
  const jsonFile = path.join(backupDir, `grbt8-backup-${timestamp}.json`);
  fs.writeFileSync(jsonFile, jsonData);
  
  logger.info(`✅ JSON backup oluşturuldu: ${jsonFile} (${(backup.statistics.backupSize / 1024 / 1024).toFixed(2)} MB)`);
  return jsonFile;
}

// GitHub'a backup yükle
async function pushToGitHub(filePath: string, repoOverride?: string): Promise<boolean> {
  try {
    if (!GITHUB_TOKEN) {
      logger.info('⚠️ GitHub token bulunamadı, backup yerel olarak saklanacak');
      return false;
    }

    const fileName = path.basename(filePath);
    const fileContent = fs.readFileSync(filePath);
    const base64Content = fileContent.toString('base64');

    const targetRepo = repoOverride || DEFAULT_GITHUB_REPO;
    // GitHub API ile dosya yükle
    const response = await fetch(`https://api.github.com/repos/${targetRepo}/contents/${fileName}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Otomatik backup - ${new Date().toISOString()}`,
        content: base64Content,
        branch: 'main'
      })
    });

    if (response.ok) {
      logger.info(`✅ GitHub'a yüklendi: ${fileName}`);
      return true;
    } else {
      const errorData = await response.json();
      logger.error('❌ GitHub yükleme hatası:', errorData);
      return false;
    }
  } catch (error) {
    logger.error('❌ GitHub push hatası:', error);
    return false;
  }
}

// GitHub'dan eski backup'ları sil (10 günden eski)
async function cleanupOldGitHubBackups(repoOverride?: string): Promise<void> {
  try {
    if (!GITHUB_TOKEN) {
      logger.info('⚠️ GitHub token yok, temizlik atlanıyor');
      return;
    }

    logger.info('🧹 GitHub temizlik başlatılıyor (10 günden eski dosyalar)...');

    // GitHub'dan dosya listesi al
    const targetRepo = repoOverride || DEFAULT_GITHUB_REPO;
    const response = await fetch(`https://api.github.com/repos/${targetRepo}/contents`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      logger.error('❌ GitHub dosya listesi alınamadı');
      return;
    }

    const files = await response.json();
    const backupFiles = files.filter((file: any) => 
      file.name.startsWith('grbt8-backup-') && (file.name.endsWith('.zip') || file.name.endsWith('.json'))
    );

    const now = new Date();
    const tenDaysAgo = new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000));
    let deletedCount = 0;

    for (const file of backupFiles) {
      try {
        // Dosya tarihini parse et (hem .zip hem .json destekle)
        const match = file.name.match(/grbt8-backup-(.+)\.(zip|json)/);
        if (!match) continue;
        
        const dateStr = match[1].replace(/T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z/, 'T$1:$2:$3.$4Z');
        const fileDate = new Date(dateStr);
        
        if (fileDate < tenDaysAgo) {
          // 10 günden eski dosyayı sil
          const deleteResponse = await fetch(`https://api.github.com/repos/${targetRepo}/contents/${file.name}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `token ${GITHUB_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: `Otomatik temizlik - 10 günden eski backup silindi: ${file.name}`,
              sha: file.sha,
              branch: 'main'
            })
          });

          if (deleteResponse.ok) {
            logger.info(`🗑️ GitHub'dan eski backup silindi: ${file.name} (${fileDate.toLocaleDateString('tr-TR')})`);
            deletedCount++;
          } else {
            logger.error(`❌ GitHub'dan silinemedi: ${file.name}`);
          }
        }
      } catch (error) {
        logger.error(`❌ Dosya işleme hatası: ${file.name}`, error);
      }
    }

    logger.info(`✅ GitHub temizlik tamamlandı: ${deletedCount} eski dosya silindi`);
  } catch (error) {
    logger.error('❌ GitHub temizlik hatası:', error);
  }
}

async function runScheduledBackupFlow(repoOverride?: string): Promise<{ uploaded: boolean }> {
  // Full backup oluştur
  const backupFilePath = await createFullBackup();
  // GitHub'a yükle
  const uploaded = await pushToGitHub(backupFilePath, repoOverride);
  // GitHub'da eski backup'ları temizle (10 günden eski)
  await cleanupOldGitHubBackups(repoOverride);
  // Yerel dosyayı sil (opsiyonel)
  if (uploaded) {
    fs.unlinkSync(backupFilePath);
    logger.info('🗑️ Yerel backup dosyası silindi');
  }
  // Eski backup'ları temizle (son 10 tanesini sakla)
  const backupDir = path.join('/tmp', 'backups', 'scheduled');
  if (fs.existsSync(backupDir)) {
    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('grbt8-backup-'))
      .sort()
      .reverse();
    if (files.length > 10) {
      files.slice(10).forEach(file => {
        fs.unlinkSync(path.join(backupDir, file));
        logger.info(`🗑️ Eski backup silindi: ${file}`);
      });
    }
  }
  return { uploaded };
}

export async function POST(request: NextRequest) {
  try {
    // Güvenlik kontrolleri
    const sec = ensureSecretAndNetwork(request);
    if (sec) return sec;

    const url = new URL(request.url);
    const force = url.searchParams.get('force') === '1';
    // Son backup zamanını kontrol et (6 saatlik interval) - force=1 ise atla
    const lastBackup = await getLastBackupTime();
    const now = new Date();
    if (!force && lastBackup) {
      const hoursDiff = (now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60);
      if (hoursDiff < 6) {
        logger.info(`⏰ Henüz 6 saat geçmedi (${hoursDiff.toFixed(1)} saat), backup atlanıyor`);
        return NextResponse.json({
          success: true,
          skipped: true,
          message: 'Backup atlandı - henüz 6 saat geçmedi',
          lastBackup: lastBackup.toISOString(),
          nextBackup: new Date(lastBackup.getTime() + (6 * 60 * 60 * 1000)).toISOString(),
          hoursSinceLastBackup: hoursDiff
        });
      }
    }

    logger.info(`🚀 Zamanlanmış backup başlatılıyor... (force=${force ? 'true' : 'false'})`);

    const repoParam = url.searchParams.get('repo') || undefined;
    const result = await runScheduledBackupFlow(repoParam);

    return NextResponse.json({
      success: true,
      message: 'Backup başarıyla oluşturuldu, GitHub\'a yüklendi ve eski dosyalar temizlendi',
      timestamp: now.toISOString(),
      uploaded: result.uploaded,
      githubCleanup: true,
      retentionDays: 10,
      nextBackup: new Date(now.getTime() + (6 * 60 * 60 * 1000)).toISOString()
    });

  } catch (error: any) {
    // Detaylı error bilgisini logger'a kaydet (güvenli)
    logger.error('❌ Scheduled backup hatası', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    // Kullanıcıya generic mesaj döndür (güvenli)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Backup işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
        errorCode: 'BACKUP_ERROR',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET endpoint - backup durumunu kontrol et
export async function GET(request: NextRequest) {
  try {
    // Production'da GET ile tetikleme - cron header veya secret ile izin ver
    const isCron = !!request.headers.get('x-vercel-cron');
    const userAgent = request.headers.get('user-agent') || '';
    
    // Vercel cron job'ları için daha esnek kontrol
    if (process.env.NODE_ENV === 'production') {
      // Cron header varsa veya Vercel'in user agent'ı ise izin ver
      const isVercelCron = isCron || userAgent.includes('vercel') || userAgent.includes('cron');
      
      if (!isVercelCron) {
        // Secret kontrolü yap
        const sec = ensureSecretAndNetwork(request);
        if (sec) return sec;
      }
    } else {
      // Dev/test ortamında secret ile izin ver
      const sec = ensureSecretAndNetwork(request);
      if (sec) return sec;
    }
    
    const url = new URL(request.url);
    const repoParam = url.searchParams.get('repo') || undefined;
    await runScheduledBackupFlow(repoParam);
    return NextResponse.json({ success: true, message: 'Backup (GET) completed' });

  } catch (error: any) {
    // Detaylı error bilgisini logger'a kaydet (güvenli)
    logger.error('Backup durumu kontrol hatası', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    // Kullanıcıya generic mesaj döndür (güvenli)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Backup durumu kontrol edilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
        errorCode: 'BACKUP_STATUS_ERROR'
      },
      { status: 500 }
    );
  }
}
