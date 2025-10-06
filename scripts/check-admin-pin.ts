#!/usr/bin/env ts-node
import { AdminPinSecurity } from '../src/lib/adminSecurity';

console.log('🔐 Admin PIN Güvenlik Kontrolü\n');

try {
  const pin = AdminPinSecurity.getAdminPin();
  const validation = AdminPinSecurity.validatePinStrength(pin);
  
  if (validation.isValid) {
    console.log('✅ PIN güvenlik gereksinimlerini karşılıyor');
    console.log(`📏 Uzunluk: ${pin.length} karakter`);
    console.log('🔒 Güvenlik seviyesi: YÜKSEK');
  } else {
    console.log('❌ PIN güvenlik gereksinimlerini karşılamıyor:');
    validation.errors.forEach(error => console.log(`   - ${error}`));
  }
} catch (error) {
  console.log('❌ Hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
  console.log('\n💡 Çözüm:');
  console.log('   1. .env dosyasına ADMIN_PIN=GüvenliPin123! ekleyin');
  console.log('   2. PIN en az 8 karakter olmalı');
  console.log('   3. Büyük/küçük harf, rakam ve özel karakter içermeli');
}

console.log('\n🛡️ Güvenlik önerileri:');
console.log('   - PIN\'i düzenli olarak değiştirin');
console.log('   - PIN\'i kimseyle paylaşmayın');
console.log('   - Güçlü bir PIN kullanın');

// Örnek güvenli PIN oluştur
console.log('\n🎲 Örnek güvenli PIN:', AdminPinSecurity.generateSecurePin());
