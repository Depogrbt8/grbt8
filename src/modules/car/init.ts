// Araç Kiralama Modülü - Initialization
// API adapter'ını buradan ayarlıyoruz

import { setCarRentalAPI } from './services/api';
import { demoCarAPI } from './services/adapters/demo';

/**
 * Araç kiralama modülünü başlat
 * Gerçek API'ye geçişte sadece bu dosyayı değiştireceğiz:
 * 
 * import { rentalcarsAPI } from './services/adapters/rentalcars';
 * setCarRentalAPI(rentalcarsAPI);
 */
export function initCarRentalModule() {
  // Şimdilik demo API kullan
  setCarRentalAPI(demoCarAPI);
  
  console.log('[Car Rental] Module initialized with Demo API');
}

// Auto-initialize (client-side)
if (typeof window !== 'undefined') {
  initCarRentalModule();
}
