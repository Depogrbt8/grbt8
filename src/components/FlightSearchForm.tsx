'use client';

import { CalendarDays, User, ArrowRightLeft, ChevronDown } from 'lucide-react';
import TripTypeSelector from './TripTypeSelector';
import AirportInput from './AirportInput';
import DateInput from './DateInput';
import PassengerSelector from './PassengerSelector';
import { useState } from 'react';

interface Airport {
  code: string;
  name: string;
  city: string;
}

interface FlightSearchFormProps {
  // Trip type props
  tripType: string;
  onTripTypeChange: (type: string) => void;
  directOnly: boolean;
  onDirectOnlyChange: (direct: boolean) => void;
  
  // Airport props
  fromAirports: Airport[];
  toAirports: Airport[];
  fromInput: string;
  toInput: string;
  onFromInputChange: (value: string) => void;
  onToInputChange: (value: string) => void;
  onFromAirportSelect: (airport: Airport) => void;
  onToAirportSelect: (airport: Airport) => void;
  
  // Date props
  departureDate: Date | undefined;
  returnDate: Date | undefined;
  onDepartureDateChange: (date: Date | undefined) => void;
  onReturnDateChange: (date: Date | undefined) => void;
  
  // Passenger props
  adultCount: number;
  childCount: number;
  infantCount: number;
  onPassengerModalOpen: () => void;
  onAdultCountChange: (count: number) => void;
  onChildCountChange: (count: number) => void;
  onInfantCountChange: (count: number) => void;
  
  // Search props
  isLoading: boolean;
  onSearch: () => void;
  onSwapAirports: () => void;
}

export default function FlightSearchForm({
  tripType,
  onTripTypeChange,
  directOnly,
  onDirectOnlyChange,
  fromAirports,
  toAirports,
  fromInput,
  toInput,
  onFromInputChange,
  onToInputChange,
  onFromAirportSelect,
  onToAirportSelect,
  departureDate,
  returnDate,
  onDepartureDateChange,
  onReturnDateChange,
  adultCount,
  childCount,
  infantCount,
  onPassengerModalOpen,
  onAdultCountChange,
  onChildCountChange,
  onInfantCountChange,
  isLoading,
  onSearch,
  onSwapAirports
}: FlightSearchFormProps) {
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  
  return (
    <>
      {/* Masaüstü için uçuş arama formu */}
      <div className="hidden sm:block w-full sm:container sm:mx-auto px-0 sm:px-4 mt-24">
        <div className="bg-white rounded-[32px] shadow-lg p-8 border border-gray-200">
          {/* Uçuş tipi ve aktarmasız seçenekleri */}
          <TripTypeSelector
            tripType={tripType}
            onTripTypeChange={onTripTypeChange}
            directOnly={directOnly}
            onDirectOnlyChange={onDirectOnlyChange}
            isMobile={false}
          />
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            {/* Nereden */}
            <div className="md:col-span-1">
              <label className="text-xs text-gray-500 mb-1 ml-1 font-medium">Nereden</label>
              <div className="relative h-12 border border-gray-300 rounded-xl focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200">
                <AirportInput
                  label=""
                  placeholder="Şehir veya havali"
                  value={fromInput}
                  onChange={onFromInputChange}
                  onAirportSelect={onFromAirportSelect}
                  selectedAirports={fromAirports}
                  isMobile={false}
                />
              </div>
            </div>
            {/* Nereye */}
            <div className="md:col-span-1">
              <label className="text-xs text-gray-500 mb-1 ml-1 font-medium">Nereye</label>
              <div className="relative h-12 border border-gray-300 rounded-xl focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200">
                <AirportInput
                  label=""
                  placeholder="Şehir veya havali"
                  value={toInput}
                  onChange={onToInputChange}
                  onAirportSelect={onToAirportSelect}
                  selectedAirports={toAirports}
                  isMobile={false}
                />
              </div>
            </div>
            {/* Gidiş Tarihi */}
            <div className="flex flex-col md:col-span-1">
              <label className="text-xs text-gray-500 mb-1 ml-1 font-medium">Gidiş Tarihi</label>
              <div className="relative w-full flex items-center">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" strokeWidth={1.5} />
                <DateInput
                  value={departureDate}
                  onChange={onDepartureDateChange}
                  className="w-full pl-10 pr-4 h-12 leading-[44px] py-0 text-sm text-gray-500 placeholder-gray-400 focus:outline-none focus:border-none focus:ring-0 bg-white border border-gray-300 rounded-xl focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200 text-left font-light"
                  placeholder="gg.aa.yyyy"
                />
              </div>
            </div>
            {/* Dönüş Tarihi */}
            <div className="flex flex-col md:col-span-1">
              <label className="text-xs text-gray-500 mb-1 ml-1 font-medium">Dönüş Tarihi</label>
              <div className="relative w-full flex items-center">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" strokeWidth={1.5} />
                <DateInput
                  value={returnDate}
                  onChange={onReturnDateChange}
                  className={`w-full pl-10 pr-4 h-12 leading-[44px] py-0 text-sm text-gray-500 placeholder-gray-400 focus:outline-none focus:border-none focus:ring-0 bg-white border border-gray-300 rounded-xl focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200 text-left font-light ${tripType === 'oneWay' ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
                  placeholder="gg.aa.yyyy"
                  disabled={tripType === 'oneWay'}
                />
              </div>
            </div>
            {/* Yolcu */}
            <div className="flex flex-col relative md:col-span-1">
              <label className="text-xs text-gray-500 mb-1 ml-1 font-medium">Yolcu</label>
              <div className="relative w-full flex items-center">
                <User className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassengerModal(!showPassengerModal)}
                  className="w-full pl-10 pr-4 h-12 text-base text-gray-700 text-left focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white border border-gray-300 rounded-xl appearance-none cursor-pointer hover:border-green-500 transition-all duration-200"
                >
                  {adultCount} Yetişkin{childCount > 0 ? `, ${childCount} Çocuk` : ''}{infantCount > 0 ? `, ${infantCount} Bebek` : ''}
                </button>
                {/* Yolcu Seçimi Dropdown */}
                <PassengerSelector
                  isOpen={showPassengerModal}
                  onClose={() => setShowPassengerModal(false)}
                  adultCount={adultCount}
                  childCount={childCount}
                  infantCount={infantCount}
                  onAdultCountChange={onAdultCountChange}
                  onChildCountChange={onChildCountChange}
                  onInfantCountChange={onInfantCountChange}
                />
              </div>
            </div>
            {/* Uçuş Ara Butonu */}
            <div className="flex flex-col justify-end md:col-span-1">
              <button
                type="submit"
                className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold text-lg shadow-md hover:bg-green-600 transition-all"
                onClick={onSearch}
                disabled={isLoading}
              >
                {isLoading ? 'Aranıyor...' : 'Uçuş Ara'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobil için özel uçuş arama kutusu */}
      <div className="block sm:hidden w-full px-4 mt-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col">
          {/* Tek yön / Gidiş-dönüş */}
          <div className="flex items-center w-full gap-3 mb-5 justify-between">
            <TripTypeSelector
              tripType={tripType}
              onTripTypeChange={onTripTypeChange}
              directOnly={directOnly}
              onDirectOnlyChange={onDirectOnlyChange}
              isMobile={true}
            />
            {/* Yolcu seçimi - sağda */}
            <button
              type="button"
              onClick={() => setShowPassengerModal(true)}
              className="flex items-center gap-1 whitespace-nowrap"
            >
              <span className="text-[14px] font-normal text-[#23272F] underline whitespace-nowrap">
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
                  value={fromInput}
                  onChange={onFromInputChange}
                  onAirportSelect={onFromAirportSelect}
                  selectedAirports={fromAirports}
                  isMobile={true}
                />
              </div>
              <div className="w-full">
                <AirportInput
                  label="Nereye"
                  placeholder="Nereye"
                  value={toInput}
                  onChange={onToInputChange}
                  onAirportSelect={onToAirportSelect}
                  selectedAirports={toAirports}
                  isMobile={true}
                />
              </div>
            </div>
            {/* Swap butonu - ortada */}
            <button
              type="button"
              onClick={onSwapAirports}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-all duration-200 z-10"
              aria-label="Kalkış/Varış değiştir"
            >
              <ArrowRightLeft className="w-5 h-5 text-green-600" strokeWidth={1.5} />
            </button>
          </div>
          {/* Tarih kutuları */}
          <div className="flex gap-2 w-full mb-3">
            <div className="flex-1">
              <div className="relative w-full h-10 border border-gray-300 rounded-lg bg-white focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200">
                <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 pointer-events-none" />
                <DateInput
                  value={departureDate}
                  onChange={onDepartureDateChange}
                  className="w-full h-full h-10 text-center bg-transparent border-none outline-none text-[15px] font-medium placeholder-black text-black focus:outline-none focus:ring-0"
                  placeholder="Gidiş Tarihi"
                />
              </div>
            </div>
            <div className="flex-1">
              <div className={`relative w-full h-10 border border-gray-300 rounded-lg ${tripType === 'oneWay' ? 'bg-gray-100' : 'bg-white'} focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200`}>
                <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 pointer-events-none" />
                <DateInput
                  value={returnDate}
                  onChange={onReturnDateChange}
                  className={`w-full h-full h-10 text-center bg-transparent border-none outline-none text-[15px] font-medium placeholder-black text-black focus:outline-none focus:ring-0 ${tripType === 'oneWay' ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            onClick={onSearch}
            disabled={isLoading}
          >
            {isLoading ? 'Aranıyor...' : 'Uçuş Ara'}
          </button>
        </div>
      </div>

      {/* Mobil için PassengerSelector */}
      <PassengerSelector
        isOpen={showPassengerModal}
        onClose={() => setShowPassengerModal(false)}
        adultCount={adultCount}
        childCount={childCount}
        infantCount={infantCount}
        onAdultCountChange={onAdultCountChange}
        onChildCountChange={onChildCountChange}
        onInfantCountChange={onInfantCountChange}
      />
    </>
  );
} 