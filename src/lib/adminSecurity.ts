import { createHash } from 'crypto';
import { logger } from '@/lib/logger';

// Güvenli PIN validation ve doğrulama sistemi
export class AdminPinSecurity {
  private static readonly PIN_MIN_LENGTH = 8;
  private static readonly PIN_MAX_ATTEMPTS = 3;
  private static readonly PIN_LOCKOUT_DURATION = 15 * 60 * 1000; // 15 dakika
  
  // PIN deneme sayacı (production'da Redis kullanılmalı)
  private static pinAttempts = new Map<string, { count: number; lockedUntil?: number }>();

  /**
   * PIN güvenlik gereksinimlerini kontrol et
   */
  static validatePinStrength(pin: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (pin.length < this.PIN_MIN_LENGTH) {
      errors.push(`PIN en az ${this.PIN_MIN_LENGTH} karakter olmalıdır`);
    }

    if (!/[A-Z]/.test(pin)) {
      errors.push('PIN en az bir büyük harf içermelidir');
    }

    if (!/[a-z]/.test(pin)) {
      errors.push('PIN en az bir küçük harf içermelidir');
    }

    if (!/\d/.test(pin)) {
      errors.push('PIN en az bir rakam içermelidir');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pin)) {
      errors.push('PIN en az bir özel karakter içermelidir');
    }

    // Yaygın PIN'leri engelle
    const commonPins = ['12345678', 'password', 'admin123', '7000', '0000', '1111', 'admin', 'root'];
    if (commonPins.includes(pin.toLowerCase())) {
      errors.push('PIN çok yaygın, daha güvenli bir PIN seçin');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * PIN doğrulama (timing attack korumalı)
   */
  static async verifyPin(inputPin: string, correctPin: string, clientIP: string): Promise<{
    isValid: boolean;
    isLocked: boolean;
    remainingAttempts: number;
    lockoutTime?: number;
  }> {
    const now = Date.now();
    
    // Kilit kontrolü
    const attempts = this.pinAttempts.get(clientIP);
    if (attempts?.lockedUntil && now < attempts.lockedUntil) {
      return {
        isValid: false,
        isLocked: true,
        remainingAttempts: 0,
        lockoutTime: attempts.lockedUntil
      };
    }

    // Timing attack koruması için sabit süre bekle
    const startTime = Date.now();
    
    // PIN'leri hash'le ve karşılaştır
    const inputHash = createHash('sha256').update(inputPin).digest('hex');
    const correctHash = createHash('sha256').update(correctPin).digest('hex');
    
    // Sabit süre bekle (timing attack koruması)
    const elapsed = Date.now() - startTime;
    const minDelay = 1000; // 1 saniye minimum
    if (elapsed < minDelay) {
      await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
    }

    const isValid = inputHash === correctHash;

    if (!isValid) {
      // Başarısız deneme sayısını artır
      const currentAttempts = attempts || { count: 0 };
      currentAttempts.count++;
      
      if (currentAttempts.count >= this.PIN_MAX_ATTEMPTS) {
        currentAttempts.lockedUntil = now + this.PIN_LOCKOUT_DURATION;
        
        // Güvenlik logu
        logger.security('ADMIN_PIN_BRUTE_FORCE', {
          ip: clientIP,
          attempts: currentAttempts.count,
          lockedUntil: currentAttempts.lockedUntil
        });
      }
      
      this.pinAttempts.set(clientIP, currentAttempts);
    } else {
      // Başarılı giriş - deneme sayacını sıfırla
      this.pinAttempts.delete(clientIP);
    }

    return {
      isValid,
      isLocked: false,
      remainingAttempts: Math.max(0, this.PIN_MAX_ATTEMPTS - (attempts?.count || 0))
    };
  }

  /**
   * Environment variable'dan PIN al (güvenli)
   */
  static getAdminPin(): string {
    const pin = process.env.ADMIN_PIN;
    
    if (!pin) {
      throw new Error('ADMIN_PIN environment variable tanımlanmamış');
    }

    // PIN güçlülüğünü kontrol et
    const validation = this.validatePinStrength(pin);
    if (!validation.isValid) {
      throw new Error(`ADMIN_PIN güvenlik gereksinimlerini karşılamıyor: ${validation.errors.join(', ')}`);
    }

    return pin;
  }

  /**
   * Güvenli PIN oluştur (yardımcı fonksiyon)
   */
  static generateSecurePin(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let pin = '';
    
    // En az bir büyük harf
    pin += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    
    // En az bir küçük harf
    pin += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    
    // En az bir rakam
    pin += '0123456789'[Math.floor(Math.random() * 10)];
    
    // En az bir özel karakter
    pin += '!@#$%^&*'[Math.floor(Math.random() * 8)];
    
    // Kalan karakterleri rastgele doldur
    for (let i = 4; i < this.PIN_MIN_LENGTH; i++) {
      pin += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Karakterleri karıştır
    return pin.split('').sort(() => Math.random() - 0.5).join('');
  }
}
