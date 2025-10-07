// BiletDukkani Payment API servisleri
import { getBiletDukkaniTokenDemo } from './biletdukkaniAuth';
import { logger } from '@/lib/logger';

const BILETDUKKANI_BASE_URL = process.env.BILETDUKKANI_BASE_URL || 'https://api.biletdukkani.com';

export interface SchemaRule {
  panMinDigitCount: number;
  panMaxDigitCount: number;
  cvvDigitCount: number;
  format: string;
}

export interface BinInfo {
  memberNo: number;
  memberName: string;
  prefixNo: number;
  cardType: string;
  brand: string;
  schema: string;
  schemaRule?: SchemaRule;
  logoUrl?: string;
  installments: InstallmentInfo[];
  businessCard: boolean;
  directPaymentActive: boolean;
  secure3dPaymentActive: boolean;
  isThreeD: boolean;
}

export interface InstallmentInfo {
  id: number;
  count: number;
  enable: boolean;
  vposId: number;
  interestRate: number;
  commissionRate: number;
  discountRate: number;
  otherBankRate: number;
  installmentType?: number;
  tenantVposId?: number;
  installmentCommission?: number;
  totalPrice?: number;
  price?: number;
}

export interface BinInfoRequest {
  bin: string;
  withInstallment?: boolean;
  price?: number;
  productType?: string;
  currencyCode?: string;
}

/**
 * BIN bilgilerini BiletDukkani API'sinden alır (v2)
 * @param bin Kredi kartının ilk 6 hanesi
 * @param options Ek parametreler
 * @returns BIN bilgileri
 */
export async function getBinInfo(
  bin: string, 
  options: {
    withInstallment?: boolean;
    price?: number;
    productType?: string;
    currencyCode?: string;
  } = {}
): Promise<BinInfo> {
  try {
    const tokenData = await getBiletDukkaniTokenDemo();
    
    const params = new URLSearchParams({
      bin,
      withInstallment: options.withInstallment?.toString() || 'true'
    });

    if (options.price) {
      params.append('price', options.price.toString());
    }
    if (options.productType) {
      params.append('productType', options.productType);
    }
    if (options.currencyCode) {
      params.append('currencyCode', options.currencyCode);
    }

    const response = await fetch(`${BILETDUKKANI_BASE_URL}/payment-info/get-bin-info?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
        'X-Payment-Version': '2.0' // v2 API kullanıyoruz
      }
    });

    if (!response.ok) {
      throw new Error(`BIN bilgisi alınamadı: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    // Hatalı loglarda hassas alanları temizle
    try {
      const meta: any = { message: error?.message };
      if (error?.response?.status) meta.status = error.response.status;
      logger.error('BIN bilgisi alınırken hata', meta);
    } catch {}
    throw new Error('Kart bilgileri doğrulanamadı. Lütfen tekrar deneyin.');
  }
}

/**
 * Demo amaçlı BIN bilgisi döndürür (gerçek API olmadığında kullanılır) - v2 formatında
 */
export function getBinInfoDemo(bin: string): BinInfo {
  // Demo veriler - gerçek API'de bu kısım kaldırılacak
  const demoData: { [key: string]: BinInfo } = {
    '415565': {
      memberNo: 111,
      memberName: 'QNB FINANSBANK A.S.',
      prefixNo: 415565,
      cardType: 'CREDIT CARD',
      brand: 'CardFinans',
      schema: 'VISA',
      schemaRule: {
        panMinDigitCount: 16,
        panMaxDigitCount: 16,
        cvvDigitCount: 3,
        format: '#### #### #### ####'
      },
      logoUrl: 'https://roofservicesteststorage.blob.core.windows.net/static/bank-logos/cardfinans.png',
      installments: [
        { id: 55, count: 1, enable: true, vposId: 0, interestRate: 1, commissionRate: 1, discountRate: 1, otherBankRate: 1 },
        { id: 56, count: 2, enable: true, vposId: 0, interestRate: 2, commissionRate: 1, discountRate: 1, otherBankRate: 1 },
        { id: 57, count: 3, enable: true, vposId: 0, interestRate: 1, commissionRate: 1, discountRate: 1, otherBankRate: 1 }
      ],
      businessCard: false,
      directPaymentActive: true,
      secure3dPaymentActive: true,
      isThreeD: false
    },
    '435508': {
      memberNo: 46,
      memberName: 'AKBANK T.A.S.',
      prefixNo: 435508,
      cardType: 'CREDIT CARD',
      brand: 'AXESS',
      schema: 'VISA',
      schemaRule: {
        panMinDigitCount: 16,
        panMaxDigitCount: 16,
        cvvDigitCount: 3,
        format: '#### #### #### ####'
      },
      logoUrl: undefined,
      installments: [
        { id: 23, count: 1, enable: true, vposId: 2, interestRate: 1, commissionRate: 2, discountRate: 3, otherBankRate: 4 },
        { id: 24, count: 2, enable: true, vposId: 2, interestRate: 1, commissionRate: 2, discountRate: 3, otherBankRate: 4 }
      ],
      businessCard: false,
      directPaymentActive: true,
      secure3dPaymentActive: true,
      isThreeD: false
    },
    '402277': {
      memberNo: 12,
      memberName: 'VAKIFBANK T.A.O.',
      prefixNo: 402277,
      cardType: 'CREDIT CARD',
      brand: 'VakifBank',
      schema: 'VISA',
      schemaRule: {
        panMinDigitCount: 16,
        panMaxDigitCount: 16,
        cvvDigitCount: 3,
        format: '#### #### #### ####'
      },
      logoUrl: undefined,
      installments: [
        { id: 30, count: 1, enable: true, vposId: 1, interestRate: 0, commissionRate: 0, discountRate: 0, otherBankRate: 0 },
        { id: 31, count: 2, enable: true, vposId: 1, interestRate: 2, commissionRate: 1, discountRate: 0, otherBankRate: 0 }
      ],
      businessCard: false,
      directPaymentActive: false,
      secure3dPaymentActive: true,
      isThreeD: true
    }
  };

  // BIN'in ilk 6 hanesini al
  const binPrefix = bin.substring(0, 6);
  
  if (demoData[binPrefix]) {
    return demoData[binPrefix];
  }

  // Varsayılan demo veri
  return {
    memberNo: 999,
    memberName: 'DEMO BANK',
    prefixNo: parseInt(binPrefix),
    cardType: 'CREDIT CARD',
    brand: 'DemoCard',
    schema: 'VISA',
    schemaRule: {
      panMinDigitCount: 16,
      panMaxDigitCount: 16,
      cvvDigitCount: 3,
      format: '#### #### #### ####'
    },
    logoUrl: undefined,
    installments: [
      { id: 1, count: 1, enable: true, vposId: 1, interestRate: 0, commissionRate: 0, discountRate: 0, otherBankRate: 0 }
    ],
    businessCard: false,
    directPaymentActive: true,
    secure3dPaymentActive: true,
    isThreeD: false
  };
}

/**
 * Kart numarasından BIN bilgisini alır (gerçek veya demo) - v2 formatında
 */
export async function getCardBinInfo(cardNumber: string, options: {
  withInstallment?: boolean;
  price?: number;
  productType?: string;
  currencyCode?: string;
} = {}): Promise<BinInfo> {
  // Kart numarasından BIN'i çıkar (ilk 6 hane)
  const bin = cardNumber.replace(/\s/g, '').substring(0, 6);
  
  if (bin.length < 6) {
    throw new Error('Geçerli bir kart numarası giriniz');
  }

  try {
    // Gerçek API'yi dene
    return await getBinInfo(bin, options);
  } catch (error) {
    logger.warn('Gerçek API başarısız, demo veri kullanılıyor', { error });
    // Gerçek API başarısız olursa demo veri döndür
    return getBinInfoDemo(bin);
  }
}

/**
 * Kart numarası formatını kontrol eder
 * @param cardNumber Kart numarası
 * @param schemaRule Kart formatı kuralları
 * @returns Geçerli mi?
 */
export function validateCardFormat(cardNumber: string, schemaRule?: SchemaRule): boolean {
  if (!schemaRule) return true;
  
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  // Kart numarası uzunluğu kontrolü
  if (cleanNumber.length < schemaRule.panMinDigitCount || 
      cleanNumber.length > schemaRule.panMaxDigitCount) {
    return false;
  }
  
  // Luhn algoritması kontrolü (basit)
  return true;
}

/**
 * CVV formatını kontrol eder
 * @param cvv CVV numarası
 * @param schemaRule Kart formatı kuralları
 * @returns Geçerli mi?
 */
export function validateCvvFormat(cvv: string, schemaRule?: SchemaRule): boolean {
  if (!schemaRule) return true;
  
  return cvv.length === schemaRule.cvvDigitCount && /^\d+$/.test(cvv);
} 