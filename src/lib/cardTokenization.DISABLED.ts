/**
 * ⚠️ BU DOSYA GÜVENLİK NEDENİYLE DEVRE DIŞI BIRAKILDI
 * 
 * SORUN: Kart bilgileri memory'de saklanıyordu (PCI-DSS ihlali)
 * ÇÖZÜM: BiletDukkani'nin kendi payment gateway'ini kullanıyoruz
 * 
 * Tarih: ${new Date().toISOString()}
 */

// Bu dosya artık kullanılmıyor.
// Eğer eski kodu görüntülemek isterseniz git history'den bakabilirsiniz.

export function tokenizeCard() {
  throw new Error('Kart tokenization devre dışı. BiletDukkani payment gateway kullanın.');
}

export function getCardFromToken() {
  throw new Error('Kart tokenization devre dışı. BiletDukkani payment gateway kullanın.');
}

