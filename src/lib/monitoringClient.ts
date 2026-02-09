// Client-side monitoring veri toplama sistemi

import { logger } from '@/lib/logger';

interface PerformanceMetrics {
  timestamp: string;
  page: string;
  loadTime: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
  timeToInteractive?: number;
  userAgent: string;
  connectionType?: string;
  deviceType: string;
}

interface SecurityEvent {
  timestamp: string;
  eventType: 'LOGIN_ATTEMPT' | 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'BRUTE_FORCE' | 'SUSPICIOUS_ACTIVITY' | 'RATE_LIMIT';
  ip: string;
  userAgent: string;
  userId?: string;
  details?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  page: string;
  action?: string;
}

interface UserActivity {
  timestamp: string;
  eventType: 'USER_REGISTERED' | 'USER_LOGIN' | 'USER_LOGOUT' | 'PROFILE_UPDATED' | 'PASSWORD_CHANGED' | 'FLIGHT_SEARCH' | 'BOOKING_CREATED';
  userId: string;
  email?: string;
  ip?: string;
  userAgent: string;
  details?: string;
  metadata?: Record<string, any>;
}

class MonitoringClient {
  private isEnabled: boolean = true;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeMonitoring();
  }

  private generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  private initializeMonitoring() {
    if (typeof window === 'undefined') return;

    // Sayfa yükleme performansını ölç
    this.measurePagePerformance();
    
    // Kullanıcı aktivitelerini dinle
    this.trackUserActivities();
    
    // Güvenlik olaylarını dinle
    this.trackSecurityEvents();
  }

  private measurePagePerformance() {
    if (typeof window === 'undefined') return;

    // Sayfa yüklendikten sonra performans metriklerini topla
    // Not: getEntriesByType('largest-contentful-paint') deprecated; LCP için PerformanceObserver kullanılıyor
    let lcpValue: number | undefined;
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) lcpValue = last.startTime;
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      // Tarayıcı desteklemiyorsa yok say
    }

    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');

        const metrics: PerformanceMetrics = {
          timestamp: new Date().toISOString(),
          page: window.location.pathname,
          loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
          firstContentfulPaint: fcp ? fcp.startTime : undefined,
          largestContentfulPaint: lcpValue,
          cumulativeLayoutShift: 0,
          userAgent: navigator.userAgent,
          deviceType: this.getDeviceType(),
          connectionType: (navigator as any).connection?.effectiveType
        };

        this.sendPerformanceMetrics(metrics);
      }, 2000);
    });
  }

  private trackUserActivities() {
    if (typeof window === 'undefined') return;

    // Sayfa değişikliklerini takip et
    let currentPath = window.location.pathname;
    
    const trackPageView = () => {
      if (currentPath !== window.location.pathname) {
        currentPath = window.location.pathname;
        this.sendUserActivity({
          eventType: 'PAGE_VIEW' as any,
          userId: this.getCurrentUserId(),
          details: `Sayfa görüntülendi: ${currentPath}`
        });
      }
    };

    // Popstate event (geri/ileri butonları)
    window.addEventListener('popstate', trackPageView);
    
    // Programmatic navigation için interval
    setInterval(trackPageView, 1000);
  }

  private trackSecurityEvents() {
    if (typeof window === 'undefined') return;

    // Failed login attempts
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.matches('button[type="submit"]') || target.closest('form')) {
        const form = target.closest('form');
        if (form && form.action.includes('/api/auth/login')) {
          // Login form submission detected
          setTimeout(() => {
            // Check if login failed (this would need to be integrated with actual login logic)
            this.sendSecurityEvent({
              eventType: 'LOGIN_ATTEMPT',
              details: 'Giriş denemesi',
              severity: 'MEDIUM'
            });
          }, 1000);
        }
      }
    });

    // Suspicious activities
    let clickCount = 0;
    let lastClickTime = 0;
    
    document.addEventListener('click', () => {
      const now = Date.now();
      if (now - lastClickTime < 100) { // Çok hızlı tıklamalar
        clickCount++;
        if (clickCount > 10) {
          this.sendSecurityEvent({
            eventType: 'SUSPICIOUS_ACTIVITY',
            details: 'Şüpheli tıklama aktivitesi',
            severity: 'HIGH'
          });
          clickCount = 0;
        }
      } else {
        clickCount = 0;
      }
      lastClickTime = now;
    });
  }

  private getDeviceType(): string {
    if (typeof window === 'undefined') return 'unknown';
    
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getCurrentUserId(): string {
    // Bu fonksiyon gerçek uygulamada session'dan user ID alır
    return localStorage.getItem('userId') || 'anonymous';
  }

  private async sendPerformanceMetrics(metrics: PerformanceMetrics) {
    if (!this.isEnabled) return;
    
    try {
      await fetch('/api/monitoring/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics)
      });
    } catch (error) {
      logger.error('Performance metrics gönderilemedi:', error);
    }
  }

  private async sendSecurityEvent(event: Partial<SecurityEvent>) {
    if (!this.isEnabled) return;
    
    const securityEvent: SecurityEvent = {
      timestamp: new Date().toISOString(),
      eventType: event.eventType || 'SUSPICIOUS_ACTIVITY',
      ip: 'client-side', // Server-side'da gerçek IP alınır
      userAgent: navigator.userAgent,
      userId: event.userId || this.getCurrentUserId(),
      details: event.details || '',
      severity: event.severity || 'MEDIUM',
      page: window.location.pathname,
      action: event.action
    };

    try {
      await fetch('/api/monitoring/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(securityEvent)
      });
    } catch (error) {
      logger.error('Security event gönderilemedi:', error);
    }
  }

  private async sendUserActivity(activity: Partial<UserActivity>) {
    if (!this.isEnabled) return;
    
    const userActivity: UserActivity = {
      timestamp: new Date().toISOString(),
      eventType: activity.eventType || 'USER_LOGIN',
      userId: activity.userId || this.getCurrentUserId(),
      email: activity.email,
      ip: 'client-side',
      userAgent: navigator.userAgent,
      details: activity.details,
      metadata: activity.metadata
    };

    try {
      await fetch('/api/monitoring/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userActivity)
      });
    } catch (error) {
      logger.error('User activity gönderilemedi:', error);
    }
  }

  // Public methods
  public trackLoginAttempt(success: boolean, userId?: string) {
    this.sendSecurityEvent({
      eventType: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILURE',
      userId,
      severity: success ? 'LOW' : 'MEDIUM',
      details: success ? 'Başarılı giriş' : 'Başarısız giriş denemesi'
    });
  }

  public trackUserRegistration(userId: string, email: string) {
    this.sendUserActivity({
      eventType: 'USER_REGISTERED',
      userId,
      email,
      details: 'Yeni kullanıcı kaydı'
    });
  }

  public trackFlightSearch(searchData: any) {
    this.sendUserActivity({
      eventType: 'FLIGHT_SEARCH',
      details: `Uçuş arama: ${searchData.departure} → ${searchData.arrival}`,
      metadata: searchData
    });
  }

  public enable() {
    this.isEnabled = true;
  }

  public disable() {
    this.isEnabled = false;
  }
}

// Global instance
export const monitoringClient = new MonitoringClient();

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  // Sayfa yüklendiğinde otomatik başlat
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      logger.debug('Monitoring client initialized');
    });
  } else {
    logger.debug('Monitoring client initialized');
  }
}
