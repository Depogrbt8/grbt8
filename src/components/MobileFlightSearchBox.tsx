import { useState, useEffect } from 'react';
import { CalendarDays, User, ArrowUpDown, ChevronDown } from 'lucide-react';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import TripTypeSelector from './TripTypeSelector';
import AirportInput from './AirportInput';
import PassengerSelector from './PassengerSelector';

interface Airport {
  code: string;
  name: string;
  city: string;
}

const DateInput = dynamic(() => import('@/components/DateInput'), { ssr: false });

interface MobileFlightSearchBoxProps {
  initialTripType?: string;
  initialFromAirports?: Airport[];
  initialToAirports?: Airport[];
  initialDepartureDate?: Date | string;
  initialReturnDate?: Date | string;
  initialAdultCount?: number;
  initialChildCount?: number;
  initialInfantCount?: number;
  onSubmit: (params: {
    fromAirports: Airport[];
    toAirports: Airport[];
    departureDate: Date | undefined;
    returnDate: Date | undefined;
    tripType: string;
    adultCount: number;
    childCount: number;
    infantCount: number;
  }) => void;
}

export default function MobileFlightSearchBox({
  initialTripType = 'oneWay',
  initialFromAirports = [],
  initialToAirports = [],
  initialDepartureDate = undefined,
  initialReturnDate = undefined,
  initialAdultCount = 1,
  initialChildCount = 0,
  initialInfantCount = 0,
  onSubmit,
}: MobileFlightSearchBoxProps) {
  const [tripType, setTripType] = useState(initialTripType);
  const [fromAirports, setFromAirports] = useState<Airport[]>(initialFromAirports);
  const [toAirports, setToAirports] = useState<Airport[]>(initialToAirports);
  const [departureDate, setDepartureDate] = useState<Date | undefined>(initialDepartureDate ? new Date(initialDepartureDate) : undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(initialReturnDate ? new Date(initialReturnDate) : undefined);
  const [adultCount, setAdultCount] = useState(initialAdultCount);
  const [childCount, setChildCount] = useState(initialChildCount);
  const [infantCount, setInfantCount] = useState(initialInfantCount);
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAirports.length || !toAirports.length || !departureDate) return;
    setIsLoading(true);
    onSubmit({
      fromAirports,
      toAirports,
      departureDate,
      returnDate,
      tripType,
      adultCount,
      childCount,
      infantCount,
    });
    setIsLoading(false);
  };

  // AirportInput için gerekli state'leri hazırla
  const [fromInputValue, setFromInputValue] = useState('');
  const [toInputValue, setToInputValue] = useState('');

  useEffect(() => {
    if (fromAirports.length > 0) {
      const airport = fromAirports[0];
      setFromInputValue(airport.city ? `${airport.city} ${airport.code}` : `${airport.code} - ${airport.name}`);
    }
  }, [fromAirports]);

  useEffect(() => {
    if (toAirports.length > 0) {
      const airport = toAirports[0];
      setToInputValue(airport.city ? `${airport.city} ${airport.code}` : `${airport.code} - ${airport.name}`);
    }
  }, [toAirports]);

  const handleFromAirportSelect = (airport: Airport) => {
    setFromAirports([airport]);
    setFromInputValue(airport.city ? `${airport.city} ${airport.code}` : `${airport.code} - ${airport.name}`);
  };

  const handleToAirportSelect = (airport: Airport) => {
    setToAirports([airport]);
    setToInputValue(airport.city ? `${airport.city} ${airport.code}` : `${airport.code} - ${airport.name}`);
  };

  const handleSwapAirports = () => {
    const tempFrom = fromAirports;
    const tempTo = toAirports;
    const tempFromInput = fromInputValue;
    const tempToInput = toInputValue;
    
    setFromAirports(tempTo);
    setToAirports(tempFrom);
    setFromInputValue(tempToInput);
    setToInputValue(tempFromInput);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col w-full">
      {/* Tek yön / Gidiş-dönüş */}
      <div className="flex items-center w-full gap-3 mb-3 justify-between">
        <TripTypeSelector
          tripType={tripType}
          onTripTypeChange={setTripType}
          directOnly={false}
          onDirectOnlyChange={() => {}}
          isMobile={true}
        />
        {/* Yolcu seçimi - sağda */}
        <button
          type="button"
          onClick={() => setShowPassengerModal(true)}
          className="flex items-center gap-1 whitespace-nowrap"
        >
          <span className="text-[14px] font-light text-[#23272F] underline whitespace-nowrap" style={{ fontWeight: 300 }}>
            {adultCount + childCount + infantCount} Yolcu
          </span>
          <ChevronDown className="w-4 h-4 text-[#23272F] flex-shrink-0" />
        </button>
      </div>
      {/* Nereden-Nereye kutuları ve swap */}
      <div className="relative w-full mb-2">
        <div className="flex flex-col gap-2 w-full">
          <div className="w-full">
            <AirportInput
              label="Nereden"
              placeholder="Nereden"
              value={fromInputValue}
              onChange={setFromInputValue}
              onAirportSelect={handleFromAirportSelect}
              selectedAirports={fromAirports}
              isMobile={true}
            />
          </div>
          <div className="w-full">
            <AirportInput
              label="Nereye"
              placeholder="Nereye"
              value={toInputValue}
              onChange={setToInputValue}
              onAirportSelect={handleToAirportSelect}
              selectedAirports={toAirports}
              isMobile={true}
            />
          </div>
        </div>
        {/* Swap butonu - iki kutunun üstüne binecek şekilde sağda */}
        <button
          type="button"
          onClick={handleSwapAirports}
          className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-all duration-200 z-10"
          aria-label="Kalkış/Varış değiştir"
        >
          <ArrowUpDown className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
        </button>
      </div>
      {/* Tarih kutuları */}
      <div className="flex gap-2 w-full mb-3">
        <div className="flex-1">
          <div className="relative w-full h-10 border border-gray-300 rounded-lg bg-white focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200">
            <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
            <DateInput
              value={departureDate}
              onChange={setDepartureDate}
              className="w-full h-full h-10 text-center bg-transparent border-none outline-none text-[15px] font-light placeholder:font-light placeholder-black text-black focus:outline-none focus:ring-0"
              placeholder="Gidiş Tarihi"
            />
          </div>
        </div>
        <div className="flex-1">
          <div className={`relative w-full h-10 border border-gray-300 rounded-lg ${tripType === 'oneWay' ? 'bg-gray-100' : 'bg-white'} focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200`}>
            <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
            <DateInput
              value={returnDate}
              onChange={setReturnDate}
              className={`w-full h-full h-10 text-center bg-transparent border-none outline-none text-[15px] font-light placeholder:font-light placeholder-black text-black focus:outline-none focus:ring-0 ${tripType === 'oneWay' ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="Dönüş Tarihi"
              disabled={tripType === 'oneWay'}
            />
          </div>
        </div>
      </div>
      {/* Uçuş Ara Butonu */}
      <button
        type="submit"
        className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold text-lg shadow-sm hover:bg-green-600 transition-all"
        disabled={isLoading}
      >
        {isLoading ? 'Aranıyor...' : 'Uçuş Ara'}
      </button>

      {/* Mobil için PassengerSelector */}
      <PassengerSelector
        isOpen={showPassengerModal}
        onClose={() => setShowPassengerModal(false)}
        adultCount={adultCount}
        childCount={childCount}
        infantCount={infantCount}
        onAdultCountChange={setAdultCount}
        onChildCountChange={setChildCount}
        onInfantCountChange={setInfantCount}
      />
    </form>
  );
} 