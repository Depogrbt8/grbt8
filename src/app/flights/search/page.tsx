"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { format, addDays, subDays, isSameDay, parseISO, startOfDay } from "date-fns";
import { tr } from "date-fns/locale";
import { Bell, Heart, Filter, Users, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import FlightSearchBox from '@/components/FlightSearchBox';
import { useSession } from 'next-auth/react';
import LoginModal from '@/components/LoginModal';
import { getAirRulesBiletDukkaniDemo } from '@/services/flightApi';
import { getAirlines } from '@/services/airlineApi';
import { Airline } from '@/types/airline';
import MobileFlightSearchBox from '@/components/MobileFlightSearchBox';
import FlightFilters from '@/components/FlightFilters';
import PriceDateSelector from '@/components/PriceDateSelector';
import ModalManager from '@/components/ModalManager';
import Footer from '@/components/Footer';
import React from 'react';
import { useFlightState, useFilterState, useModalState, useUIState, usePriceState } from '@/hooks';
import CompactFlightCard from '@/components/CompactFlightCard';
import { logger } from '@/lib/logger';
import Script from 'next/script';
import { breadcrumbSchema, flightServiceSchema } from '@/lib/schemas';

// Demo fiyat verisi fonksiyonu (API'ye hazır)
function getDemoPrices(baseDate: Date, currency: string = "EUR") {
  // baseDate geçerli değilse bugünkü tarihi kullan
  const safeBaseDate = (baseDate instanceof Date && !isNaN(baseDate.getTime())) ? baseDate : new Date();
  return Array.from({ length: 10 }, (_, i) => {
    const date = addDays(subDays(safeBaseDate, 3), i);
    const price = 90 + Math.floor(Math.abs(Math.sin(date.getTime() / 1e9)) * 60);
    return {
      date,
      price,
      currency,
    };
  });
}

// API'den fiyat çekme fonksiyonu (gelecekte kullanılacak)
async function fetchPricesFromAPI(origin: string, destination: string, baseDate: Date, currency: string = "EUR") {
  try {
    // Demo timeout kaldırıldı - sistem daha hızlı
    // await new Promise(resolve => setTimeout(resolve, 1000));
    const demo = getDemoPrices(baseDate, currency);
    if (!demo || demo.length === 0) throw new Error('Demo veri boş');
    return demo;
  } catch (error) {
    logger.error('Fiyat çekme hatası', { error });
    // Hata durumunda demo veri döndür
    return getDemoPrices(baseDate, currency);
  }
}

// --- COMPACT FLIGHTCARD TASARIMI BAŞLANGIÇ ---
function FlightCard({ flight, onSelect, airlinesList }: { flight: any, onSelect: () => void, airlinesList: Airline[] }) {
  return (
    <CompactFlightCard 
      flight={flight}
      airlinesList={airlinesList}
      isSelected={false}
      onSelect={onSelect}
    />
  );
}
// --- MODERN FLIGHTCARD TASARIMI BİTİŞ ---

// Bagaj seçimi modalı
function BaggageModal({ open, onClose, passengers, baggageOptions, onSave }: {
  open: boolean;
  onClose: () => void;
  passengers: { type: string; name: string }[];
  baggageOptions: { weight: string; price: number }[][];
  onSave: (selected: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(passengers.map(() => '0 kg'));
  const ref = useRef<HTMLDivElement>(null);
  // Modal dışına tıklayınca kapat
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (open && ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    if (open) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div ref={ref} className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Ek Bagaj Seçimi</h2>
        <div className="space-y-4">
          {passengers.map((p, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="font-medium text-gray-700">{p.name} <span className="text-xs text-gray-500">({p.type})</span></div>
              <div className="flex gap-2 flex-wrap">
                {baggageOptions[i].map(opt => (
                  <button
                    key={opt.weight}
                    className={`px-3 py-1 rounded-lg border text-sm font-semibold transition ${selected[i] === opt.weight ? 'bg-green-500 text-white border-green-600' : 'bg-white border-gray-200 hover:bg-green-50'}`}
                    onClick={() => setSelected(sel => sel.map((s, idx) => idx === i ? opt.weight : s))}
                  >
                    {opt.weight} {opt.price > 0 && <span className="ml-1 text-xs text-gray-500">+{opt.price} EUR</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700" onClick={onClose}>İptal</button>
          <button className="px-4 py-2 rounded-lg bg-green-500 text-white font-semibold" onClick={() => { onSave(selected); onClose(); }}>Kaydet</button>
        </div>
      </div>
    </div>
  );
}

// Fiyat Alarmı Bileşeni
function PriceAlertBox({ origin, destination, departureDate }: { origin: string, destination: string, departureDate: Date }) {
  const { data: session, status } = useSession();
  const [isAlertCreated, setIsAlertCreated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const handleClick = async () => {
    if (loading || isAlertCreated) return;

    if (status !== 'authenticated' || !session?.user) {
      setShowLogin(true);
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          departureDate: departureDate.toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Bir hata oluştu.');
      }
      
      setIsAlertCreated(true);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-lg bg-white relative mb-4 border border-gray-200">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-semibold text-green-600 text-sm leading-tight">
          Fiyat alarmı
        </h3>
        
        <div
          onClick={handleClick}
          className={`relative inline-flex flex-shrink-0 items-center w-12 h-6 rounded-full transition-colors ${
            isAlertCreated ? 'bg-blue-600' : 'bg-gray-200'
          } ${!isAlertCreated && !loading ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full border border-gray-300 shadow-sm transition-transform flex items-center justify-center ${
              isAlertCreated ? 'translate-x-full' : ''
            }`}
          >
            {loading ? (
              <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Bell size={12} className={isAlertCreated ? "text-blue-600" : "text-gray-500"} />
            )}
          </span>
        </div>
      </div>
      
      <p className="text-sm text-gray-500 mt-2">
        Bu rota için fiyatlar değiştiğinde alarm alın.
      </p>

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      {isAlertCreated && !error && <p className="text-green-600 text-xs mt-2">Alarm başarıyla oluşturuldu!</p>}
      
      {showLogin && <LoginModal isOpen={true} onClose={() => setShowLogin(false)} />}
    </div>
  );
}

// Favoriler Bileşeni
function SearchFavoriteBox({ origin, destination, departureDate }: { origin: string, destination: string, departureDate: Date }) {
  const { data: session, status } = useSession();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const handleClick = async () => {
    if (loading || isFavorite) return;

    if (status !== 'authenticated' || !session?.user) {
      setShowLogin(true);
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch('/api/search-favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          departureDate: departureDate.toISOString()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bir hata oluştu');
      setIsFavorite(true);
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-lg bg-white relative mb-4 border border-gray-200">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-semibold text-green-600 text-sm leading-tight">
          Aramayı favorile
        </h3>
        
        <div
          onClick={handleClick}
          className={`relative inline-flex flex-shrink-0 items-center w-12 h-6 rounded-full transition-colors ${
            isFavorite ? 'bg-blue-600' : 'bg-gray-200'
          } ${!isFavorite && !loading ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full border border-gray-300 shadow-sm transition-transform flex items-center justify-center ${
              isFavorite ? 'translate-x-full' : ''
            }`}
          >
            {loading ? (
              <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Heart size={12} className={isFavorite ? "text-blue-600" : "text-gray-500"} />
            )}
          </span>
        </div>
      </div>
      
      <p className="text-sm text-gray-500 mt-2">
        Bu aramayı daha sonra kolayca tekrar yapmak için kaydet.
      </p>

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      {isFavorite && !error && <p className="text-green-600 text-xs mt-2">Arama favorilere eklendi!</p>}
      
      {showLogin && <LoginModal isOpen={true} onClose={() => setShowLogin(false)} />}
    </div>
  );
}

// Yeni: Paket/brand detaylarını gösteren modern panel
function FlightBrandOptions({ flight, onSelectBrand }: { flight: any, onSelectBrand: (brand: any) => void }) {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rules, setRules] = useState<{ [brandId: string]: { title: string; detail: string }[] }>({});
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    async function fetchBrands() {
      setLoading(true);
      setError(null);
      try {
        setTimeout(() => {
          const demoBrands = [
            { id: 'ecofly', name: 'EcoFly', price: flight.price, baggage: '15 kg', rules: 'İade edilemez, değişiklik ücretli', description: 'En uygun fiyatlı paket. Bagaj hakkı 15 kg.' },
            { id: 'extrafly', name: 'ExtraFly', price: flight.price + 20, baggage: '20 kg', rules: 'İade edilemez, değişiklik ücretsiz', description: 'Daha fazla bagaj ve esnek değişiklik hakkı.' },
            { id: 'primefly', name: 'PrimeFly', price: flight.price + 40, baggage: '30 kg', rules: 'İade ve değişiklik ücretsiz', description: 'En yüksek bagaj ve tam esneklik.' }
          ];
          setBrands(demoBrands);
          // Demo: Her brand için kuralı çek
          demoBrands.forEach(async (brand) => {
            const ruleList = await getAirRulesBiletDukkaniDemo({ fareId: 'demo-fare-id-12345', flightId: flight.id?.toString() || 'demo-flight-id', brandId: brand.id });
            setRules(prev => ({ ...prev, [brand.id]: ruleList }));
          });
          setLoading(false);
        }, 500);
      } catch (e) {
        setError('Paketler yüklenemedi');
        setLoading(false);
      }
    }
    fetchBrands();
  }, [flight]);

  if (loading) return <div className="p-4 text-gray-500">Paketler yükleniyor...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  return (
    <div className="bg-gray-50 border border-green-200 rounded-xl p-4 mt-2 flex flex-col gap-3 animate-fade-in">
      <div className="font-semibold text-green-700 mb-2">Paket Seçenekleri</div>
      <div className="grid md:grid-cols-3 gap-4">
        {brands.map(brand => (
          <div
            key={brand.id}
            className={`bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-2 shadow-sm relative overflow-hidden ${isMobile ? 'cursor-pointer active:bg-gray-100' : ''}`}
            {...(isMobile ? { onClick: () => onSelectBrand(brand), role: 'button', tabIndex: 0 } : {})}
          >
            {/* --- RENKLİ ŞERİT BAŞLANGIÇ --- */}
            {brand.id === 'ecofly' && (
              <div className="absolute top-0 left-0 w-full h-1.5 rounded-t-lg" style={{background: 'linear-gradient(90deg, #ffe259 0%, #ffa751 100%)'}} />
            )}
            {brand.id === 'extrafly' && (
              <div className="absolute top-0 left-0 w-full h-1.5 rounded-t-lg" style={{background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)'}} />
            )}
            {brand.id === 'primefly' && (
              <div className="absolute top-0 left-0 w-full h-1.5 rounded-t-lg" style={{background: 'linear-gradient(90deg, #ff1e56 0%, #ffac41 100%)'}} />
            )}
            {/* --- RENKLİ ŞERİT BİTİŞ --- */}
            <div className="font-bold text-lg text-gray-900">{brand.name}</div>
            <div className="text-gray-700 text-sm">{brand.description}</div>
            <div className="text-xs text-gray-500">Bagaj: {brand.baggage}</div>
            <div className="text-xs text-gray-500">Kurallar: {brand.rules}</div>
            <div className="font-bold text-xl text-green-700 mt-2">{brand.price} EUR</div>
            {/* Kurallar kutusu ve buton mobilde gizli */}
            {!isMobile && rules[brand.id] && (
              <div className="mt-2 p-2 bg-gray-50 border border-gray-100 rounded text-[11px] text-gray-600 leading-tight">
                <div className="font-semibold text-gray-700 mb-1 text-[12px]">Taşıma/Bilet Kuralları</div>
                <ul className="list-disc pl-4">
                  {rules[brand.id].map((rule, idx) => (
                    <li key={idx}><span className="font-bold text-gray-700">{rule.title}:</span> {rule.detail}</li>
                  ))}
                </ul>
              </div>
            )}
            {!isMobile && (
              <button
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
                onClick={() => onSelectBrand(brand)}
              >
                Bu Paketi Seç
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FlightSearchPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [showLogin, setShowLogin] = useState(false);

  // Parametreleri oku
  const origin = params.get("origin") || "IST";
  const destination = params.get("destination") || "SAW";
  const departureDateStr = params.get("departureDate") || format(new Date(), 'yyyy-MM-dd');
  const returnDateStr = params.get("returnDate") || "";
  const tripType = params.get("tripType") || "oneWay";
  const passengersCount = params.get("passengers") || "1";

  // Havalimanı kodundan isim çıkarımı (örnek, gerçek API ile dinamik yapılabilir)
  function parseAirport(val: string) {
    if (!val) return { code: '', name: '' };
    const [code, ...rest] = val.split(' - ');
    return { code: code.trim(), name: rest.join(' - ').trim() };
  }
  const originObj = parseAirport(origin);
  const destinationObj = parseAirport(destination);

  // Tarih formatı
  function formatDate(dateStr: string) {
    if (!dateStr) return '';
    try {
      const d = parseISO(dateStr);
      return format(d, 'dd MMM yyyy EEE', { locale: tr });
    } catch {
      return dateStr;
    }
  }

  // Tarihleri hazırla
  const departureDate = departureDateStr ? parseISO(departureDateStr) : new Date();
  const returnDate = returnDateStr ? parseISO(returnDateStr) : null;

  // Custom hook'ları kullan
  const {
    departurePrices,
    returnPrices,
    loadingPrices,
    errorPrices,
    selectedDeparture,
    selectedReturn,
    mobilePriceBarStartDate,
    setSelectedDeparture,
    setSelectedReturn,
    setMobilePriceBarStartDate,
  } = usePriceState({
    origin,
    destination,
    departureDate,
    returnDate,
    tripType
  });

  const {
    departureFlights,
    returnFlights,
    loadingDeparture,
    loadingReturn,
    errorDeparture,
    errorReturn,
  } = useFlightState({
    origin,
    destination,
    tripType,
    selectedDeparture,
    selectedReturn
  });

  const {
    isClient,
    isMobile,
    step,
    loading,
    setStep,
    setLoading,
    summaryRef,
    searchBoxRef,
  } = useUIState();

  const {
    showPriceAlert,
    showFavorite,
    showMobileFilter,
    showSort,
    showEditModal,
    baggageModalOpen,
    openFlightId,
    openPriceAlert,
    closePriceAlert,
    openFavorite,
    closeFavorite,
    openMobileFilter,
    closeMobileFilter,
    openSort,
    closeSort,
    openEditModal,
    closeEditModal,
    openBaggageModal,
    closeBaggageModal,
    openFlight,
    closeFlight,
  } = useModalState();

  // Fiyat kutuları için API entegrasyonu - KALDIRILDI, usePriceState hook'unda yönetiliyor
  // useEffect(() => {
  //   // setLoadingPrices ve setErrorPrices fonksiyonlarını kaldırıyorum, çünkü bunlar usePriceState hook'u içinde yönetiliyor.
  //   // Buradaki useEffect tamamen kaldırılmalı, çünkü aynı işlevsellik hook içinde zaten var.
  // }, []);

  // Otomatik olarak ortadaki günü seçili yap - KALDIRILDI, usePriceState hook'unda yönetiliyor
  // useEffect(() => {
  //   if (!selectedDeparture && departurePrices.length > 0) {
  //     // Ortadaki günü seçili yap
  //     setSelectedDeparture(departurePrices[3].date);
  //   }
  // }, [departurePrices]);

  useEffect(() => {
    if (tripType === "roundTrip" && !selectedReturn && returnPrices.length > 0 && step === "return") {
      setSelectedReturn(returnPrices[3].date);
    }
  }, [returnPrices, tripType, step, selectedReturn, setSelectedReturn]);

  // Gidiş/dönüş seçim adımı
  const showReturn = tripType === "roundTrip" && step === "return";

  // Seçim handler
  function handleSelect(date: Date) {
    if (step === "departure") {
      setSelectedDeparture(date);
      if (tripType === "roundTrip") {
        setStep("return");
      }
    } else {
      setSelectedReturn(date);
    }
  }

  // Havayolu listesi
  const [airlinesList, setAirlinesList] = useState<Airline[]>([]);
  useEffect(() => {
    getAirlines().then(setAirlinesList);
  }, []);

  const allFlights = useMemo(() => [...departureFlights, ...returnFlights], [departureFlights, returnFlights]);

  // Filter state'lerini hook ile yönet
  const {
    selectedAirlines,
    priceRange,
    maxPrice,
    departureHourRange,
    arrivalHourRange,
    flightDurationRange,
    maxStops,
    selectedCurrency,
    selectedCabinClass,
    airlines,
    setSelectedAirlines,
    setPriceRange,
    setMaxPrice,
    setDepartureHourRange,
    setArrivalHourRange,
    setFlightDurationRange,
    setMaxStops,
    setSelectedCurrency,
    setSelectedCabinClass,
    handleAirlineChange,
    filteredFlights,
  } = useFilterState({
    allFlights,
    airlinesList
  });

  // Demo: Yolcu listesi (3 yolcu)
  const passengers = [
    { type: 'ADT', name: 'Ali Yılmaz' },
    { type: 'ADT', name: 'Ayşe Yılmaz' },
    { type: 'CHD', name: 'Mehmet Yılmaz' },
  ];
  // Demo: Her yolcu için ek bagaj opsiyonları
  const baggageOptions = [
    [ { weight: '0 kg', price: 0 }, { weight: '10 kg', price: 25 }, { weight: '20 kg', price: 40 } ],
    [ { weight: '0 kg', price: 0 }, { weight: '10 kg', price: 25 }, { weight: '20 kg', price: 40 } ],
    [ { weight: '0 kg', price: 0 }, { weight: '10 kg', price: 15 } ],
  ];
  const [baggageSelections, setBaggageSelections] = useState<string[]>(passengers.map(() => '0 kg'));
  const [selectedDepartureFlight, setSelectedDepartureFlight] = useState<any>(null);
  const [showMobileBrandModal, setShowMobileBrandModal] = useState(false);

  const handleBrandSelect = (flight: any, brand: any) => {
    // Seçilen brand ile rezervasyon akışına devam et
    // Örnek: booking sayfasına flight ve brand bilgisini gönder
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      closeFlight();
    }
    const flightData = encodeURIComponent(JSON.stringify({ ...flight, selectedBrand: brand }));
    window.location.href = `/flights/booking?flight=${flightData}`;
  };

  // Tarih formatı (örn: 12 Tem Cts)
  function formatShortDate(dateStr: string) {
    if (!dateStr) return '';
    try {
      const d = parseISO(dateStr);
      return format(d, 'dd MMM EEE', { locale: tr });
    } catch {
      return dateStr;
    }
  }

  // Düzenle butonuna tıklayınca arama kutusuna scroll
  function handleEditClick() {
    openEditModal();
  }

  // Modal state'leri artık useModalState hook'unda yönetiliyor

  const renderMobileFilters = () => (
    <FlightFilters
      airlinesList={airlinesList}
      airlines={airlines}
      selectedAirlines={selectedAirlines}
      onAirlineChange={handleAirlineChange}
      allFlights={allFlights}
      priceRange={priceRange}
      maxPrice={maxPrice}
      onMaxPriceChange={setMaxPrice}
      departureHourRange={departureHourRange}
      onDepartureHourRangeChange={setDepartureHourRange}
      arrivalHourRange={arrivalHourRange}
      onArrivalHourRangeChange={setArrivalHourRange}
      flightDurationRange={flightDurationRange}
      onFlightDurationRangeChange={setFlightDurationRange}
      maxStops={maxStops}
      onMaxStopsChange={setMaxStops}
      selectedCabinClass={selectedCabinClass}
      onCabinClassChange={setSelectedCabinClass}
    />
  );

  const [sortOption, setSortOption] = useState('price');

  const renderSortOptions = () => (
    <div className="space-y-4 text-sm text-gray-600">
      <h4 className="font-semibold mb-2">Sıralama</h4>
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="radio" 
            name="sort" 
            value="price" 
            checked={sortOption === 'price'} 
            onChange={() => {
              setSortOption('price');
              // Fiyata göre sırala
              // Burada gerçek sıralama mantığı eklenecek
              closeSort();
            }}
            className="w-4 h-4 text-green-500 border-green-500 focus:ring-green-500 focus:ring-2"
            style={{ accentColor: '#10b981' }}
          />
          Fiyata göre sırala (En düşük fiyat)
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="radio" 
            name="sort" 
            value="duration" 
            checked={sortOption === 'duration'} 
            onChange={() => {
              setSortOption('duration');
              // Süreye göre sırala
              // Burada gerçek sıralama mantığı eklenecek
              closeSort();
            }}
            className="w-4 h-4 text-green-500 border-green-500 focus:ring-green-500 focus:ring-2"
            style={{ accentColor: '#10b981' }}
          />
          Uçuş süresine göre sırala (En kısa süre)
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="radio" 
            name="sort" 
            value="departureTime" 
            checked={sortOption === 'departureTime'} 
            onChange={() => {
              setSortOption('departureTime');
              // Kalkış saatine göre sırala
              // Burada gerçek sıralama mantığı eklenecek
              closeSort();
            }}
            className="w-4 h-4 text-green-500 border-green-500 focus:ring-green-500 focus:ring-2"
            style={{ accentColor: '#10b981' }}
          />
          Kalkış saatine göre sırala (En erken kalkış)
        </label>
      </div>
    </div>
  );

  // Yardımcı: airport kodunu Airport objesine çevir
  function airportFromCode(code: string): { code: string; name: string; city: string } {
    if (!code) return { code: '', name: '', city: '' };
    // Demo için sadece kodu doldur
    return { code, name: code, city: '' };
  }

  // Mobil fiyat-tarih barı pencere başlangıcı için state artık usePriceState hook'unda yönetiliyor

  // Aktarmasız toggle fonksiyonu
  const handleToggleDirectOnly = () => {
    if (maxStops === 0) {
      setMaxStops(2); // Aktarmasız kapalıysa, tüm uçuşları göster
    } else {
      setMaxStops(0); // Aktarmasız açılsın
    }
  };

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { name: 'Ana Sayfa', url: 'https://gurbetbiz.app' },
    { name: 'Uçuş Arama', url: `https://gurbetbiz.app/flights/search?origin=${origin}&destination=${destination}&departureDate=${departureDateStr || ''}` }
  ], [origin, destination, departureDateStr]);

  // Product schema için ilk uçuş sonucu (varsa)
  const firstFlightProduct = useMemo(() => {
    if (departureFlights && departureFlights.length > 0 && originObj && destinationObj) {
      const flight = departureFlights[0];
      const flightDate = departureDate instanceof Date && !isNaN(departureDate.getTime()) 
        ? departureDate 
        : (departureDateStr ? parseISO(departureDateStr) : new Date());
      return flightServiceSchema({
        name: `${originObj.code} - ${destinationObj.code} Uçuş Bileti`,
        description: `${originObj.code} şehrinden ${destinationObj.code} şehrine uçak bileti. En uygun fiyatlar, anında rezervasyon.`,
        price: flight.price || 0,
        currency: 'EUR', // useFlightState hook'undaki Flight type'ında currency yok, varsayılan EUR kullanıyoruz
        origin: originObj.code || origin,
        destination: destinationObj.code || destination,
        departureDate: format(flightDate, 'yyyy-MM-dd'),
        airline: flight.airlineName || undefined
      });
    }
    return null;
  }, [departureFlights, originObj, destinationObj, departureDateStr, origin, destination]);

  return (
    <>
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(breadcrumbItems))
        }}
      />
      {firstFlightProduct && (
        <Script
          id="flight-service-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(firstFlightProduct)
          }}
        />
      )}
      <Header />
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
        {/* Sol filtre paneli */}
        <aside className="w-full md:w-64 bg-white border-r border-gray-100 p-4 hidden md:block md:ml-6">
          {/* Favoriler kutusu gizlendi - sadece Fiyat Alarmı */}
          {/* <SearchFavoriteBox origin={originObj.code} destination={destinationObj.code} departureDate={departureDate} /> */}
          <PriceAlertBox origin={originObj.code} destination={destinationObj.code} departureDate={departureDate} />
          <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold">
            <Filter className="w-5 h-5" /> Filtreler
          </div>
          <FlightFilters
            airlinesList={airlinesList}
            airlines={airlines}
            selectedAirlines={selectedAirlines}
            onAirlineChange={handleAirlineChange}
            allFlights={allFlights}
            priceRange={priceRange}
            maxPrice={maxPrice}
            onMaxPriceChange={setMaxPrice}
            departureHourRange={departureHourRange}
            onDepartureHourRangeChange={setDepartureHourRange}
            arrivalHourRange={arrivalHourRange}
            onArrivalHourRangeChange={setArrivalHourRange}
            flightDurationRange={flightDurationRange}
            onFlightDurationRangeChange={setFlightDurationRange}
            maxStops={maxStops}
            onMaxStopsChange={setMaxStops}
            selectedCabinClass={selectedCabinClass}
            onCabinClassChange={setSelectedCabinClass}
          />
        </aside>
        {/* Mobil özet kutusu - sadece mobilde göster */}
        {isClient && isMobile && (
          <>
            <div className="block md:hidden sticky top-0 z-30 bg-white border-b border-gray-200" ref={summaryRef}>
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="font-bold text-lg text-gray-900 tracking-tight">{origin} - {destination}</div>
                  <div className="text-gray-500 text-sm mt-0.5 flex items-center gap-2">
                    {formatShortDate(departureDateStr)}
                    {tripType === 'roundTrip' && returnDateStr && (
                      <>
                        <span className="mx-1">/</span>
                        {formatShortDate(returnDateStr)}
                      </>
                    )}
                    <span className="ml-2 flex items-center"><Users className="w-4 h-4 mr-1" />{passengersCount}</span>
                  </div>
                </div>
                <button className="text-green-700 underline font-semibold text-base" onClick={handleEditClick}>Düzenle</button>
              </div>
            </div>
            {/* Düzenle modalı */}
            {showEditModal && (
              <div className="fixed inset-0 z-50 bg-black/30">
                <div className={`fixed left-0 right-0 top-0 z-50 transition-transform duration-300 ${showEditModal ? 'translate-y-0' : '-translate-y-full'}`} style={{maxWidth: '100vw'}}>
                  <div className="bg-white rounded-b-2xl shadow-xl p-4 w-full max-w-md mx-auto relative">
                    <button className="absolute top-2 right-2 text-gray-400 text-2xl" onClick={closeEditModal}>×</button>
                    <MobileFlightSearchBox
                      initialTripType={tripType}
                      initialFromAirports={origin ? [airportFromCode(origin)] : []}
                      initialToAirports={destination ? [airportFromCode(destination)] : []}
                      initialDepartureDate={departureDateStr}
                      initialReturnDate={returnDateStr}
                      initialAdultCount={Number(passengersCount) || 1}
                      initialChildCount={0}
                      initialInfantCount={0}
                      onSubmit={({ fromAirports, toAirports, departureDate, returnDate, tripType, adultCount, childCount, infantCount }) => {
                        closeEditModal();
                        const params = new URLSearchParams();
                        if (fromAirports.length) params.append('origin', fromAirports.map(a => a.code).join(','));
                        if (toAirports.length) params.append('destination', toAirports.map(a => a.code).join(','));
                        if (departureDate) params.append('departureDate', format(departureDate, 'yyyy-MM-dd'));
                        if (tripType === 'roundTrip' && returnDate) params.append('returnDate', format(returnDate, 'yyyy-MM-dd'));
                        params.append('tripType', tripType);
                        params.append('passengers', String(adultCount + childCount + infantCount));
                        window.location.href = `/flights/search?${params.toString()}`;
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            {/* Modal yönetimi artık ModalManager bileşeninde */}
          </>
        )}
        <main className="flex-1 p-2 md:p-8">
          {/* Sadeleştirilmiş Uçuş Arama Kutusu */}
          <div className="mb-6 md:block hidden" ref={searchBoxRef}>
            <FlightSearchBox
              initialOrigin={origin}
              initialDestination={destination}
              initialTripType={tripType}
              initialDepartureDate={departureDateStr}
              initialReturnDate={returnDateStr}
              initialPassengers={passengersCount}
              onSubmit={(params) => {
                // Yeni arama yapıldığında URL parametrelerini güncelle
                const search = new URLSearchParams();
                Object.entries(params).forEach(([key, value]) => {
                  if (value) search.append(key, value);
                });
                window.location.href = `/flights/search?${search.toString()}`;
              }}
            />
          </div>
          {/* Fiyat kutuları ve tarih seçimi */}
          <PriceDateSelector
            origin={origin}
            destination={destination}
            departurePrices={departurePrices}
            selectedDeparture={selectedDeparture}
            onDateSelect={handleSelect}
            loadingPrices={loadingPrices}
            errorPrices={errorPrices}
            mobilePriceBarStartDate={mobilePriceBarStartDate}
            onMobilePriceBarStartDateChange={setMobilePriceBarStartDate}
            tripType={tripType}
            onStepChange={setStep}
            hideTitles={true}
            onOpenPriceAlert={openPriceAlert}
            onToggleDirectOnly={handleToggleDirectOnly}
            isDirectOnlyActive={maxStops === 0}
            onOpenMobileFilter={openMobileFilter}
            onOpenSort={openSort}
          />
          {/* --- Fiyat-tarih barının altındaki başlık ve rota: gizlendi --- */}
          <div className="hidden md:hidden"></div>
          {/* MOBİL: Tek kolon - Sadece Gidiş */}
          <div className="md:hidden">
            <h3 className="hidden">Gidiş Uçuşları</h3>
            <div className="space-y-3 pb-20">
              {loadingDeparture ? (
                <div className="flex flex-col items-center py-8 text-gray-400"><Loader2 className="w-8 h-8 animate-spin mb-2" /> Yükleniyor...</div>
              ) : errorDeparture ? (
                <div className="text-red-500 py-8">{errorDeparture}</div>
              ) : filteredFlights.length === 0 ? (
                <div className="text-gray-400 text-sm italic">Uygun gidiş uçuşu bulunamadı.</div>
              ) : (
                filteredFlights.map((flight, index) => (
                  <CompactFlightCard
                    key={flight.id || index}
                    flight={flight}
                    airlinesList={airlinesList}
                    isSelected={selectedDepartureFlight?.id === flight.id}
                    onSelect={() => { setSelectedDepartureFlight(flight); setShowMobileBrandModal(true); }}
                  />
                ))
              )}
            </div>
          </div>

          {/* DESKTOP: Mevcut layout */}
          <div className="hidden md:block space-y-3">
            {loadingDeparture ? (
              <div className="flex flex-col items-center py-8 text-gray-400"><Loader2 className="w-8 h-8 animate-spin mb-2" /> Yükleniyor...</div>
            ) : errorDeparture ? (
              <div className="text-red-500 py-8">{errorDeparture}</div>
            ) : filteredFlights.length === 0 ? (
              <div className="text-gray-400 text-sm italic">Uygun gidiş uçuşu bulunamadı.</div>
            ) : (
              filteredFlights.map(flight => (
                <div key={flight.id}>
                  <FlightCard flight={flight} onSelect={() => openFlightId === flight.id ? closeFlight() : openFlight(flight.id)} airlinesList={airlinesList} />
                  {openFlightId === flight.id && (
                    <FlightBrandOptions
                      flight={flight}
                      onSelectBrand={brand => handleBrandSelect(flight, brand)}
                    />
                  )}
                </div>
              ))
            )}
          </div>
          {/* Bagaj seçimi modalı artık ModalManager bileşeninde */}
        </main>
      </div>
      
      {/* MOBİL: Alt sabit bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            {selectedDepartureFlight ? (
              <div>
                <div className="text-sm text-gray-600">Seçilen Uçuş</div>
                <div className="font-semibold text-gray-900">
                  {selectedDepartureFlight.origin} → {selectedDepartureFlight.destination}
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {selectedDepartureFlight.price}.00 €
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Uçuş seçin</div>
            )}
          </div>
          <button
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedDepartureFlight
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!selectedDepartureFlight}
            onClick={() => {
              if (selectedDepartureFlight) {
                const flightData = encodeURIComponent(JSON.stringify(selectedDepartureFlight));
                window.location.href = `/flights/booking?flight=${flightData}`;
              }
            }}
          >
            Rezervasyon Yap
          </button>
        </div>
      </div>
      
      {/* MOBİL: Paket seçenekleri bottom sheet */}
      {isClient && isMobile && showMobileBrandModal && selectedDepartureFlight && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileBrandModal(false)} />
          <div className="absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-2xl max-h-[75vh] overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-gray-800">Paket Seçenekleri</div>
              <button className="text-gray-500 text-xl" onClick={() => setShowMobileBrandModal(false)}>×</button>
            </div>
            <FlightBrandOptions
              flight={selectedDepartureFlight}
              onSelectBrand={(brand) => handleBrandSelect(selectedDepartureFlight, brand)}
            />
          </div>
        </div>
      )}

      {/* Modal yönetimi */}
      <ModalManager
        showPriceAlert={showPriceAlert}
        showFavorite={showFavorite}
        showMobileFilter={showMobileFilter}
        showSort={showSort}
        showEditModal={showEditModal}
        baggageModalOpen={baggageModalOpen}
        onPriceAlertClose={closePriceAlert}
        onFavoriteClose={closeFavorite}
        onMobileFilterClose={closeMobileFilter}
        onSortClose={closeSort}
        onEditModalClose={closeEditModal}
        onBaggageModalClose={closeBaggageModal}
        onPriceAlertOpen={openPriceAlert}
        onFavoriteOpen={openFavorite}
        onMobileFilterOpen={openMobileFilter}
        onSortOpen={openSort}
        onEditModalOpen={handleEditClick}
        priceAlertContent={
          <PriceAlertBox 
            origin={originObj.code} 
            destination={destinationObj.code} 
            departureDate={departureDate} 
          />
        }
        searchFavoriteContent={
          <SearchFavoriteBox 
            origin={originObj.code} 
            destination={destinationObj.code} 
            departureDate={departureDate} 
          />
        }
        mobileFilterContent={renderMobileFilters()}
        sortContent={renderSortOptions()}
        editModalContent={
          <MobileFlightSearchBox
            initialTripType={tripType}
            initialFromAirports={origin ? [airportFromCode(origin)] : []}
            initialToAirports={destination ? [airportFromCode(destination)] : []}
            initialDepartureDate={departureDateStr}
            initialReturnDate={returnDateStr}
            initialAdultCount={Number(passengersCount) || 1}
            initialChildCount={0}
            initialInfantCount={0}
            onSubmit={({ fromAirports, toAirports, departureDate, returnDate, tripType, adultCount, childCount, infantCount }) => {
              closeEditModal();
              const params = new URLSearchParams();
              if (fromAirports.length) params.append('origin', fromAirports.map(a => a.code).join(','));
              if (toAirports.length) params.append('destination', toAirports.map(a => a.code).join(','));
              if (departureDate) params.append('departureDate', format(departureDate, 'yyyy-MM-dd'));
              if (tripType === 'roundTrip' && returnDate) params.append('returnDate', format(returnDate, 'yyyy-MM-dd'));
              params.append('tripType', tripType);
              params.append('passengers', String(adultCount + childCount + infantCount));
              window.location.href = `/flights/search?${params.toString()}`;
            }}
          />
        }
        baggageModalContent={
          <BaggageModal
            open={baggageModalOpen}
            onClose={closeBaggageModal}
            passengers={passengers}
            baggageOptions={baggageOptions}
            onSave={setBaggageSelections}
          />
        }
        isMobile={isMobile}
      />
      <Footer />
    </>
  );
} 