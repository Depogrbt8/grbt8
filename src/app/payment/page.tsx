"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { logger } from "@/lib/logger";

// BIN bilgileri için tip tanımı (v2)
interface SchemaRule {
  panMinDigitCount: number;
  panMaxDigitCount: number;
  cvvDigitCount: number;
  format: string;
}

interface BinInfo {
  memberNo: number;
  memberName: string;
  prefixNo: number;
  cardType: string;
  brand: string;
  schema: string;
  schemaRule?: SchemaRule;
  logoUrl?: string;
  installments: any[];
  businessCard: boolean;
  directPaymentActive: boolean;
  secure3dPaymentActive: boolean;
  isThreeD: boolean;
}

interface Errors {
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  name?: string;
}

const cardBrands = [
  { name: "Visa", regex: /^4/, logo: "/images/payment/visa.png" },
  { name: "MasterCard", regex: /^5[1-5]/, logo: "/images/payment/mastercard.png" },
  { name: "Amex", regex: /^3[47]/, logo: "/images/payment/amex.png" },
];

function detectCardBrand(number: string) {
  for (const brand of cardBrands) {
    if (brand.regex.test(number.replace(/\s/g, ""))) return brand;
  }
  return null;
}

export default function PaymentPage() {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const [showBack, setShowBack] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  
  // BIN bilgileri için state'ler
  const [binInfo, setBinInfo] = useState<BinInfo | null>(null);
  const [binLoading, setBinLoading] = useState(false);
  const [binError, setBinError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const brand = detectCardBrand(cardNumber);

  // Kart numarası değiştiğinde BIN bilgisi çek (GÜVENLİ POST)
  useEffect(() => {
    const fetchBinInfo = async () => {
      const cleanCardNumber = cardNumber.replace(/\s/g, '');
      
      // En az 6 hane girildiğinde BIN bilgisi çek
      if (cleanCardNumber.length >= 6) {
        setBinLoading(true);
        setBinError(null);
        
        try {
          // GÜVENLİ: Kart numarasını POST body'de gönder
          const response = await fetch('/api/payment/bin-info', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              cardNumber: cleanCardNumber,
              price: 95,
              productType: 'flight',
              currencyCode: 'EUR'
            })
          });
          
          const result = await response.json();
          
          if (result.success) {
            setBinInfo(result.data);
          } else {
            throw new Error(result.error || 'BIN bilgisi alınamadı');
          }
        } catch (error) {
          logger.error('BIN bilgisi alınamadı', { error });
          setBinError('Kart bilgileri doğrulanamadı');
          setBinInfo(null);
        } finally {
          setBinLoading(false);
        }
      } else {
        setBinInfo(null);
        setBinError(null);
      }
    };

    // Debounce ile API çağrısını geciktir
    const timeoutId = setTimeout(fetchBinInfo, 500);
    return () => clearTimeout(timeoutId);
  }, [cardNumber]);

  const validate = (): Errors => {
    const errs: Errors = {};
    
    // Kart numarası validasyonu (schemaRule kullanarak)
    const cleanCardNumber = cardNumber.replace(/\s/g, "");
    if (binInfo?.schemaRule) {
      if (cleanCardNumber.length < binInfo.schemaRule.panMinDigitCount || 
          cleanCardNumber.length > binInfo.schemaRule.panMaxDigitCount) {
        errs.cardNumber = `Kart numarası ${binInfo.schemaRule.panMinDigitCount} hane olmalıdır.`;
      }
    } else {
      if (!/^\d{16}$/.test(cleanCardNumber)) {
        errs.cardNumber = "Geçerli bir kart numarası girin.";
      }
    }
    
    if (!/^\d{2}\/\d{2}$/.test(expiry)) errs.expiry = "AA/YY formatında girin.";
    
    // CVV validasyonu (schemaRule kullanarak)
    if (binInfo?.schemaRule) {
      if (cvv.length !== binInfo.schemaRule.cvvDigitCount) {
        errs.cvv = `CVV ${binInfo.schemaRule.cvvDigitCount} hane olmalıdır.`;
      }
    } else {
      if (!/^\d{3,4}$/.test(cvv)) errs.cvv = "Geçerli bir CVV girin.";
    }
    
    if (!name.trim()) errs.name = "Kart üzerindeki isim gerekli.";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    
    if (Object.keys(errs).length === 0) {
      setLoading(true);
      
      try {
        // 1. Önce kart bilgilerini tokenize et
        const tokenizeResponse = await fetch('/api/payment/tokenize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            number: cardNumber,
            expiryMonth: expiry.split('/')[0],
            expiryYear: '20' + expiry.split('/')[1],
            cvv: cvv,
            name: name
          })
        });
        
        const tokenizeResult = await tokenizeResponse.json();
        
        if (!tokenizeResult.success) {
          throw new Error(tokenizeResult.error || 'Kart bilgileri işlenemedi');
        }
        
        // 2. Token ile ödeme işlemini başlat
        const paymentResponse = await fetch('/api/payment/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cardToken: tokenizeResult.token,
            amount: 95,
            currency: 'EUR',
            description: 'Uçuş rezervasyonu',
            requires3D: binInfo?.isThreeD || false
          })
        });
        
        const paymentResult = await paymentResponse.json();
        
        if (paymentResult.success) {
          logger.payment('Ödeme başarılı', { transactionId: paymentResult.transactionId });
          setSuccess(true);
        } else {
          throw new Error(paymentResult.error || 'Ödeme işlemi başarısız');
        }
        
      } catch (error) {
        // Detaylı error bilgisini logger'a kaydet (güvenli)
        logger.error('Ödeme hatası', { 
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        });
        
        // Kullanıcıya generic mesaj göster (güvenli)
        setErrors({ cardNumber: 'Ödeme işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.' });
      } finally {
        setLoading(false);
      }
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
        <svg className="w-16 h-16 text-green-600 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2l4 -4" /></svg>
        <h2 className="text-2xl font-bold text-green-700 mb-2">Ödeme Başarılı!</h2>
        <p className="text-gray-700 mb-6">Siparişiniz alınmıştır. Teşekkür ederiz.</p>
        <button onClick={() => setSuccess(false)} className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">Yeni Ödeme</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Ödeme Yap</h1>
      <div className="w-full max-w-3xl grid md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-xl p-8">
        {/* Kart Formu */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Kart numarası */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kart Numarası</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={19}
              value={cardNumber}
              onChange={e => setCardNumber(e.target.value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim())}
              className={`w-full px-3 py-2 border ${errors.cardNumber ? 'border-red-400' : 'border-gray-300'} rounded-lg font-mono text-lg tracking-widest`}
              placeholder={binInfo?.schemaRule?.format || "•••• •••• •••• ••••"}
            />
            {errors.cardNumber && <div className="text-xs text-red-500 mt-1">{errors.cardNumber}</div>}
            
            {/* BIN Bilgisi Gösterimi */}
            {binLoading && (
              <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Kart bilgileri kontrol ediliyor...</span>
              </div>
            )}
            
            {binError && (
              <div className="text-xs text-red-500 mt-1">{binError}</div>
            )}
            
            {binInfo && !binLoading && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {binInfo.logoUrl ? (
                      <Image src={binInfo.logoUrl} alt={binInfo.brand} width={24} height={24} className="h-6" />
                    ) : (
                      <div className="w-6 h-6 bg-gray-300 rounded flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600">{binInfo.brand.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{binInfo.memberName}</div>
                      <div className="text-xs text-gray-500">{binInfo.brand} • {binInfo.schema}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-green-600 font-medium">
                      {binInfo.secure3dPaymentActive ? '3D Secure Destekli' : 'Standart Ödeme'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {binInfo.directPaymentActive ? 'Direkt Ödeme' : 'Yönlendirmeli Ödeme'}
                    </div>
                    {binInfo.isThreeD && (
                      <div className="text-xs text-orange-600 font-medium">
                        3D Ödeme Gerekli
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Kart Formatı Bilgisi */}
                {binInfo.schemaRule && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      Kart Formatı: {binInfo.schemaRule.format} • 
                      CVV: {binInfo.schemaRule.cvvDigitCount} hane
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Son kullanma tarihi ve CVV */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Son Kullanma Tarihi</label>
              <input
                type="text"
                maxLength={5}
                value={expiry}
                onChange={e => setExpiry(e.target.value.replace(/[^\d/]/g, '').replace(/^(\d{2})(\d{1,2})?$/, (m, a, b) => b ? `${a}/${b}` : a))}
                className={`w-full px-3 py-2 border ${errors.expiry ? 'border-red-400' : 'border-gray-300'} rounded-lg font-mono text-lg`}
                placeholder="AA/YY"
              />
              {errors.expiry && <div className="text-xs text-red-500 mt-1">{errors.expiry}</div>}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV {binInfo?.schemaRule && `(${binInfo.schemaRule.cvvDigitCount} hane)`}
              </label>
              <input
                type="password"
                maxLength={4}
                value={cvv}
                onFocus={() => setShowBack(true)}
                onBlur={() => setShowBack(false)}
                onChange={e => setCvv(e.target.value.replace(/[^\d]/g, ''))}
                className={`w-full px-3 py-2 border ${errors.cvv ? 'border-red-400' : 'border-gray-300'} rounded-lg font-mono text-lg`}
                placeholder={binInfo?.schemaRule ? `••${binInfo.schemaRule.cvvDigitCount === 4 ? '•' : ''}` : "•••"}
              />
              {errors.cvv && <div className="text-xs text-red-500 mt-1">{errors.cvv}</div>}
            </div>
          </div>
          
          {/* Kart üzerindeki isim */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kart Üzerindeki İsim</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value.toUpperCase())}
              className={`w-full px-3 py-2 border ${errors.name ? 'border-red-400' : 'border-gray-300'} rounded-lg text-lg tracking-wide`}
              placeholder="KART ÜZERİNDEKİ İSİM"
            />
            {errors.name && <div className="text-xs text-red-500 mt-1">{errors.name}</div>}
          </div>
          
          {/* Kartı kaydet */}
          <label className="flex items-center gap-2 mt-2">
            <input type="checkbox" checked={saveCard} onChange={e => setSaveCard(e.target.checked)} className="h-5 w-5 rounded text-green-600 focus:ring-green-500 border-gray-300" />
            <span className="text-sm text-gray-700">Kartımı güvenli bir şekilde kaydet</span>
          </label>
          
          {/* Güvenlik */}
          <div className="flex items-center gap-2 mt-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="7" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            <span className="text-xs text-gray-500">
              256-bit SSL ile korunuyor • 
              {binInfo?.secure3dPaymentActive ? '3D Secure desteklenir' : 'Standart güvenlik'}
            </span>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>İşleniyor...</span>
              </div>
            ) : (
              binInfo?.isThreeD ? '3D Secure ile Öde' : 'Ödemeyi Tamamla'
            )}
          </button>
        </form>
        
        {/* Sipariş Özeti */}
        <div className="bg-gray-50 rounded-xl p-6 flex flex-col gap-4 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-700 mb-2">Sipariş Özeti</h2>
          <div className="flex justify-between text-sm">
            <span>Uçuş</span>
            <span>İstanbul → Berlin</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tarih</span>
            <span>12 Temmuz 2024</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Yolcu</span>
            <span>Ali Yılmaz</span>
          </div>
          <div className="flex justify-between text-base font-semibold mt-2">
            <span>Toplam</span>
            <span>95 EUR</span>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2l4 -4" /></svg>
            <span className="text-xs text-green-700">Güvenli ödeme altyapısı</span>
          </div>
        </div>
      </div>
    </div>
  );
}