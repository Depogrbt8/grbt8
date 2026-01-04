import crypto from 'crypto';

// Şifreleme anahtarı - Environment variable'dan alınmalı
const ENCRYPTION_KEY = process.env.API_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef'; // 32 karakter hex
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

// Encryption key'i Buffer'a çevir
const getKeyBuffer = (): Buffer => {
  return Buffer.from(ENCRYPTION_KEY, 'hex');
};

/**
 * Metni şifreler
 * @param text Şifrelenecek metin
 * @returns Şifreli metin (IV:EncryptedData formatında)
 */
export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = getKeyBuffer();
    const cipher = crypto.createCipheriv(ALGORITHM, key as any, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // IV ve encrypted data'yı birleştir
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Şifreleme hatası');
  }
}

/**
 * Şifreli metni çözer
 * @param encryptedText Şifreli metin (IV:EncryptedData formatında)
 * @returns Çözülmüş metin
 */
export function decrypt(encryptedText: string): string {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted text format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = parts[1];
    const key = getKeyBuffer();
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key as any, iv);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Şifre çözme hatası');
  }
}

/**
 * Şifreleme anahtarının doğru formatta olup olmadığını kontrol eder
 * @returns True ise geçerli, false ise geçersiz
 */
export function validateEncryptionKey(): boolean {
  try {
    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
      return false;
    }
    
    // Hex formatında olup olmadığını kontrol et
    const hexRegex = /^[0-9a-fA-F]{32}$/;
    return hexRegex.test(ENCRYPTION_KEY);
  } catch (error) {
    return false;
  }
}

/**
 * Yeni bir encryption key oluşturur (sadece setup için)
 * @returns 32 karakter hex key
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(16).toString('hex');
}

