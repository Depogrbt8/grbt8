"use client";

import React from 'react';
import { format, addDays, subDays, isSameDay, startOfDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { PlaneTakeoff, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface PriceDateSelectorProps {
  // Temel veriler
  origin: string;
  destination: string;
  departurePrices: Array<{ date: Date; price: number; currency: string }>;
  selectedDeparture: Date | null;
  onDateSelect: (date: Date) => void;
  
  // Loading ve error durumları
  loadingPrices: boolean;
  errorPrices: string | null;
  
  // Mobil için özel state'ler
  mobilePriceBarStartDate: Date;
  onMobilePriceBarStartDateChange: (date: Date) => void;
  
  // Trip type (round trip için)
  tripType?: string;
  onStepChange?: (step: "departure" | "return") => void;
  // Başlık/rota metinlerini gizlemek için opsiyonel bayrak (yalnızca belirli sayfalarda)
  hideTitles?: boolean;
  // Mobil buton satırı için tetikleyiciler (opsiyonel)
  onOpenPriceAlert?: () => void;
  onOpenFavorite?: () => void;
  onOpenMobileFilter?: () => void;
  onOpenSort?: () => void;
  // Aktarmasız toggle için
  onToggleDirectOnly?: () => void;
  isDirectOnlyActive?: boolean;
}

export default function PriceDateSelector({
  origin,
  destination,
  departurePrices,
  selectedDeparture,
  onDateSelect,
  loadingPrices,
  errorPrices,
  mobilePriceBarStartDate,
  onMobilePriceBarStartDateChange,
  tripType = 'oneWay',
  onStepChange,
  hideTitles = false,
  onOpenPriceAlert,
  onOpenFavorite,
  onOpenMobileFilter,
  onOpenSort,
  onToggleDirectOnly,
  isDirectOnlyActive = false
}: PriceDateSelectorProps) {
  
  // Desktop için merkez tarih state'i
  const [desktopCenterDate, setDesktopCenterDate] = React.useState<Date>(mobilePriceBarStartDate);
  
  // Seçili tarih değiştiğinde desktop merkez tarihini güncelle
  React.useEffect(() => {
    if (selectedDeparture) {
      setDesktopCenterDate(selectedDeparture);
    }
  }, [selectedDeparture]);
  
         // Desktop için tarih kartları oluşturma (9 gün göster, seçili tarih ortada)
         const createDesktopDateCards = () => {
           if (loadingPrices) {
             return (
               <div className="flex items-center justify-center w-full h-32 text-gray-400">
                 <Loader2 className="w-6 h-6 animate-spin" />
               </div>
             );
           }
           
           if (errorPrices) {
             return <div className="text-red-500 text-sm">{errorPrices}</div>;
           }
           
           // Desktop merkez tarihini kullan
           const centerDate = desktopCenterDate;
           
           // 9 gün üret: 4 önceki + seçili + 4 sonraki
           const days = Array.from({ length: 9 }, (_, i) => addDays(centerDate, i - 4));
           
           return days.map((date) => {
             // departurePrices'da bu güne ait fiyat var mı?
             const found = departurePrices.find(p => isSameDay(p.date, date));
             const price = found ? found.price : null;
             const currency = found ? found.currency : null;
             const isSelected = selectedDeparture ? isSameDay(date, selectedDeparture) : false;
             const dayStr = format(date, "dd MMM", { locale: tr });
             const weekDay = format(date, "EEE", { locale: tr });
             
             return (
               <button
                 key={date.toISOString()}
                 onClick={() => {
                   onDateSelect(date);
                   if (tripType === "roundTrip" && onStepChange) {
                     onStepChange("return");
                   }
                 }}
                 className={`group relative flex flex-col items-center min-w-[60px] w-16 p-2 rounded-lg transition-all duration-300 cursor-pointer select-none
                   ${isSelected 
                     ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25 scale-105" 
                     : "bg-white hover:bg-gray-50 border border-gray-200 hover:border-green-300 hover:shadow-md"
                   }
                 `}
                 style={{ outline: 'none' }}
               >
                 {/* Fiyat */}
                 <div className={`text-center mb-1 ${isSelected ? "text-white" : "text-gray-800"}`}>
                   <div className={`text-sm font-semibold ${isSelected ? "text-white" : "text-gray-700"}`}>
                     {price !== null ? `${price.toLocaleString()} €` : '-'}
                   </div>
                 </div>
                 
                 {/* Tarih ve gün */}
                 <div className="text-center">
                   <div className={`text-xs font-semibold ${isSelected ? "text-white" : "text-gray-700"}`}>
                     {dayStr}
                   </div>
                   <div className={`text-xs ${isSelected ? "text-green-100" : "text-gray-500"}`}>
                     {weekDay}
                   </div>
                 </div>
                 
                 {/* Hover efekti için alt çizgi */}
                 <div className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-b-lg transition-all duration-300
                   ${isSelected ? "bg-white" : "bg-transparent group-hover:bg-green-400"}
                 `} />
               </button>
             );
           });
         };

  // Mobil için tarih kartları oluşturma
  const createMobileDateCards = () => {
    if (loadingPrices) {
      return (
        <div className="flex items-center justify-center w-full h-full text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      );
    }
    
    if (errorPrices) {
      return <div className="text-red-500 text-sm">{errorPrices}</div>;
    }
    
    const today = new Date();
    // 7 gün üret
    const days = Array.from({ length: 7 }, (_, i) => addDays(mobilePriceBarStartDate, i));
    
    return days.map((date, idx) => {
      // departurePrices'da bu güne ait fiyat var mı?
      const found = departurePrices.find(p => isSameDay(p.date, date));
      const price = found ? found.price : null;
      const currency = found ? found.currency : null;
      const isSelected = selectedDeparture ? isSameDay(date, selectedDeparture) : false;
      const isToday = isSameDay(date, today);
      const dayNum = format(date, "d", { locale: tr });
      const weekDay = format(date, "EEE", { locale: tr });
      
      // Fiyat kutusu
      let priceBox = (
        <span className={`w-full px-2.5 py-1 text-center text-[13px] font-normal mb-1 rounded-none whitespace-nowrap flex items-center justify-center ${isSelected ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'}`}>
          {price !== null ? (<>{price.toLocaleString()} <span className="ml-0.5 text-[13px]">€</span></>) : <span className="opacity-50">-</span>}
        </span>
      );
      
      // Tarih ve gün stilleri
      let dayClass = 'text-[15px] font-semibold leading-tight';
      let weekClass = 'text-xs';
      if (isSelected) {
        dayClass += ' text-green-600 font-bold';
        weekClass += ' text-green-600 font-bold';
      } else if (isToday) {
        dayClass += ' text-blue-600 font-bold';
        weekClass += ' text-blue-600 font-bold';
      } else {
        dayClass += ' text-gray-700';
        weekClass += ' text-gray-400';
      }
      
      return (
        <React.Fragment key={date.toISOString()}>
          <div className="flex flex-col items-center min-w-[48px] px-0 py-0 mx-0 focus:outline-none" style={{scrollSnapAlign: 'center'}} onClick={() => onDateSelect(date)}>
            {priceBox}
            <span className={dayClass}>{dayNum}</span>
            <span className={weekClass}>{weekDay}</span>
          </div>
          {idx !== days.length - 1 && (
            <div className="h-7 w-2 bg-white rounded-sm" />
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="mt-1 mb-1 md:mt-6 md:mb-6">
      {/* Mobil özel fiyat-tarih kutuları */}
      <div className="md:hidden flex flex-col items-center w-full">
        <div className="w-full flex flex-col items-center">
          <div className="flex items-center w-full justify-center gap-2 relative">
            <button 
              className="absolute left-0 z-10 bg-white rounded-full p-1 shadow-md" 
              style={{top: '50%', transform: 'translateY(-50%)'}}
              onClick={() => {
                onMobilePriceBarStartDateChange(subDays(mobilePriceBarStartDate, 7));
              }}
            >
              <span className="text-green-600 text-2xl">&#60;</span>
            </button>
            
            <div 
              id="mobile-date-scroll" 
              className="flex gap-0 overflow-x-auto no-scrollbar px-8 py-2 w-full" 
              style={{scrollSnapType: 'x mandatory'}}
            >
              {createMobileDateCards()}
            </div>
            
            <button 
              className="absolute right-0 z-10 bg-white rounded-full p-1 shadow-md" 
              style={{top: '50%', transform: 'translateY(-50%)'}}
              onClick={() => {
                onMobilePriceBarStartDateChange(addDays(mobilePriceBarStartDate, 7));
              }}
            >
              <span className="text-green-600 text-2xl">&#62;</span>
            </button>
          </div>
          
          {/* Ay adı ve çizgiler */}
          <div className="flex items-center w-full mt-1 mb-2">
            <div className="flex-1 border-t border-gray-200"></div>
            <div className="px-3 text-sm text-gray-700 font-semibold" style={{whiteSpace:'nowrap'}}>
              {format(mobilePriceBarStartDate, 'MMMM', { locale: tr })}
            </div>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

        {/* Mobil: Ay etiketinin altında Aktarmasız/Alarm/Filtre/Sırala butonları */}
        {(onToggleDirectOnly || onOpenPriceAlert || onOpenMobileFilter || onOpenSort) && (
          <div className="flex items-center justify-between w-full gap-2 mt-1 mb-2">
            {onToggleDirectOnly && (
              <button
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border shadow-sm flex-1 min-w-0 transition-colors ${
                  isDirectOnlyActive 
                    ? 'bg-green-500 border-green-600 text-white active:bg-green-600' 
                    : 'bg-white border-gray-200 text-gray-800 active:bg-green-100'
                }`}
                onClick={onToggleDirectOnly}
              >
                <span className="text-[14px] font-semibold whitespace-nowrap">Aktarmasız</span>
              </button>
            )}
            {onOpenPriceAlert && (
              <button
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 shadow-sm flex-1 min-w-0 active:bg-green-100"
                onClick={onOpenPriceAlert}
              >
                <span className="text-[14px] font-semibold text-gray-800 whitespace-nowrap">Alarm</span>
              </button>
            )}
            {onOpenMobileFilter && (
              <button
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 shadow-sm flex-1 min-w-0 active:bg-green-100"
                onClick={onOpenMobileFilter}
              >
                <span className="text-[14px] font-semibold text-gray-800 whitespace-nowrap">Filtreler</span>
              </button>
            )}
            {onOpenSort && (
              <button
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 shadow-sm flex-1 min-w-0 active:bg-green-100"
                onClick={onOpenSort}
              >
                <span className="text-[14px] font-semibold text-gray-800 whitespace-nowrap">Sırala</span>
              </button>
            )}
          </div>
        )}
        </div>
        
        {!hideTitles && (
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-lg font-bold text-gray-800">Gidiş Uçuşları</span>
          </div>
        )}
        {!hideTitles && (
          <div className="text-gray-500 text-sm mt-0 mb-1">{origin} → {destination}</div>
        )}
      </div>
      
      {/* Desktop modern kart tasarımı */}
      <div className="hidden md:flex flex-col items-center w-full">
        <div className="w-full max-w-4xl mx-auto px-4">
                 {/* Başlık - Desktop'ta gizli */}
                 <div className="flex items-center justify-center gap-2 mb-4 md:hidden">
                   <PlaneTakeoff className="w-4 h-4 text-green-600" />
                   <span className="text-lg font-semibold text-gray-800">Gidiş Tarihi Seçimi</span>
                 </div>
          <div className="text-gray-500 text-sm mb-6 text-center md:hidden">{origin} → {destination}</div>
          
          {/* Fiyat kartları */}
          <div className="relative flex items-center justify-center">
            {/* Sol ok */}
            <button 
              className="absolute left-0 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
              onClick={() => {
                setDesktopCenterDate(subDays(desktopCenterDate, 5));
              }}
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            
            {/* Kartlar */}
            <div className="flex gap-2 pb-2">
              {createDesktopDateCards()}
            </div>
            
            {/* Sağ ok */}
            <button 
              className="absolute right-0 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
              onClick={() => {
                setDesktopCenterDate(addDays(desktopCenterDate, 5));
              }}
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 