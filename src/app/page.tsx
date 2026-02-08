'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ServiceButtons from '@/components/ServiceButtons';
import HeroSection, { ServiceType } from '@/components/HeroSection';
import { format } from 'date-fns';
import Image from 'next/image';
import CampaignsSection from '@/components/CampaignsSection';
import { logger } from '@/lib/logger';
import Script from 'next/script';
import { breadcrumbSchema } from '@/lib/schemas';

// Dynamic imports - sadece gerektiğinde yüklensin
const FlightSearchForm = dynamic(
  () => import('@/components/FlightSearchForm'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full px-4 md:px-8">
        <div className="bg-white rounded-[32px] shadow-lg p-8 animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }
);

const HotelSearchForm = dynamic(
  () => import('@/modules/hotel/components/HotelSearchForm'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full px-4 md:px-8">
        <div className="bg-white rounded-[32px] shadow-lg p-8 animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }
);

const CarSearchForm = dynamic(
  () => import('@/modules/car/components/CarSearchForm'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full px-4 md:px-8">
        <div className="bg-white rounded-[32px] shadow-lg p-8 animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }
);

// Type tanımları
interface Airport {
  code: string;
  name: string;
  city: string;
}

export default function Home() {
  // Aktif servis state'i (uçuş, otel, araç, esim)
  const [activeService, setActiveService] = useState<ServiceType>('flight');
  
  // Form state'leri
  const [tripType, setTripType] = useState('oneWay');
  const [directOnly, setDirectOnly] = useState(false);
  const [fromAirports, setFromAirports] = useState<Airport[]>([]);
  const [toAirports, setToAirports] = useState<Airport[]>([]);
  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');
  const [departureDate, setDepartureDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  // Havaalanı önerileri state'leri - KALDIRILDI, AirportInput component'inde yönetiliyor

  // Yeni yolcu state'leri
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [infantCount, setInfantCount] = useState(0);
  const [showPassengerModal, setShowPassengerModal] = useState(false);

  // Mobil öneri listelerini kapatmak için ref'ler - KALDIRILDI, AirportInput component'inde yönetiliyor

  // Gidiş tarihi değişince dönüş input'unu aç
  const handleDepartureChange = (date: Date | undefined) => {
    setDepartureDate(date);
  };

  // Mobil öneri listelerini kapatmak için useEffect - KALDIRILDI, AirportInput component'inde yönetiliyor

  // Havaalanı değiştirme fonksiyonu
  const swapAirports = () => {
    const tempFrom = fromAirports;
    const tempTo = toAirports;
    const tempFromInput = fromInput;
    const tempToInput = toInput;
    
    setFromAirports(tempTo);
    setToAirports(tempFrom);
    setFromInput(tempToInput);
    setToInput(tempFromInput);
  };

  // Havaalanı arama fonksiyonu - KALDIRILDI, AirportInput component'inde yönetiliyor

  // Uçuş arama fonksiyonu
  const searchFlights = async () => {
    if (!fromAirports.length || !toAirports.length || !departureDate) {
      alert('Lütfen gerekli alanları doldurun');
      return;
    }

    setIsLoading(true);

    try {
      const searchParams = {
        origin: fromAirports.map(a => a.code).join(','),
        destination: toAirports.map(a => a.code).join(','),
        departureDate: departureDate ? format(departureDate, 'yyyy-MM-dd') : '',
        returnDate: tripType === 'roundTrip' && returnDate ? format(returnDate, 'yyyy-MM-dd') : null,
        passengers: adultCount + childCount + infantCount,
        tripType: tripType,
        directOnly: directOnly
      };

      logger.debug('Uçuş arama parametreleri', { searchParams });

      // Şimdilik demo - gerçek API entegrasyonu yapılacak
      // const response = await fetch('/api/flights/search', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(searchParams)
      // });
      // const data = await response.json();

      // Demo timeout kaldırıldı - sistem daha hızlı
      // await new Promise(resolve => setTimeout(resolve, 2000));

      // URLSearchParams için null değerleri filtrele
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, String(value));
        }
      });

      // Uçuş sonuçları sayfasına yönlendir
      window.location.href = `/flights/search?${params.toString()}`;

    } catch (error) {
      logger.error('Uçuş arama hatası', { error });
      alert('Uçuş arama sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const breadcrumbItems = [
    { name: 'Ana Sayfa', url: 'https://gurbetbiz.app' }
  ];

  return (
    <main className="min-h-screen overflow-x-hidden max-w-full">
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(breadcrumbItems))
        }}
      />
      <Header />
      <div className="relative overflow-x-hidden max-w-full">
        {/* Hero Section - Yeşil alan ve Service Icons */}
        <HeroSection 
          activeService={activeService}
          onServiceChange={setActiveService}
        />
        {/* Beyaz alan ve içerik */}
        <div className="bg-white min-h-screen pt-6">
          {/* Arama Formları - Aktif servise göre */}
          {activeService === 'flight' && (
            <FlightSearchForm
              tripType={tripType}
              onTripTypeChange={setTripType}
              directOnly={directOnly}
              onDirectOnlyChange={setDirectOnly}
              fromAirports={fromAirports}
              toAirports={toAirports}
              fromInput={fromInput}
              toInput={toInput}
              onFromInputChange={setFromInput}
              onToInputChange={setToInput}
              onFromAirportSelect={(airport) => setFromAirports([airport])}
              onToAirportSelect={(airport) => setToAirports([airport])}
              departureDate={departureDate}
              returnDate={returnDate}
              onDepartureDateChange={handleDepartureChange}
              onReturnDateChange={setReturnDate}
              adultCount={adultCount}
              childCount={childCount}
              infantCount={infantCount}
              onPassengerModalOpen={() => setShowPassengerModal(true)}
              onAdultCountChange={setAdultCount}
              onChildCountChange={setChildCount}
              onInfantCountChange={setInfantCount}
              isLoading={isLoading}
              onSearch={searchFlights}
              onSwapAirports={swapAirports}
            />
          )}
          
          {activeService === 'hotel' && (
            <HotelSearchForm />
          )}
          
          {activeService === 'car' && (
            <CarSearchForm />
          )}
          
          {activeService === 'esim' && (
            <div className="w-full px-4 mt-8">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center">
                <p className="text-gray-500">E-SIM hizmeti yakında aktif olacak!</p>
              </div>
            </div>
          )}

          {/* İşlem Butonları */}
          <ServiceButtons />

          {/* Desktop özel geniş banner - Online check-in alanının altında */}
          <div className="hidden sm:block w-full sm:container sm:mx-auto px-0 sm:px-4 mt-6">
            <div className="relative w-full overflow-hidden rounded-xl shadow-lg">
              <Image
                src="/images/mobilappdestkop.png"
                alt="Masaüstü uygulama tanıtım görseli"
                width={2400}
                height={600}
                className="w-full h-auto object-contain bg-gradient-to-r from-green-50 to-blue-50"
                quality={95}
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
              />
            </div>
          </div>

          {/* Uygulama Banner kaldırıldı (eski mobil reklam) */}
          {/* <AppBanner /> */}

          {/* Mobil özel görsel - AppBanner altında */}
          <div className="sm:hidden px-3 mb-4">
            <div className="relative w-full overflow-hidden rounded-xl shadow-sm">
              <Image
                src="/images/Ekran Resmi 2025-09-19 09.25.26.png"
                alt="Mobil ekran görseli"
                width={1200}
                height={800}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>

          {/* Kampanyalar Bölümü */}
          <CampaignsSection />
        </div>
      </div>
      <Footer />
    </main>
  );
}
