"use client";

import React, { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { tr } from 'date-fns/locale/tr';

interface DateInputProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  label?: string;
  showPrices?: boolean;
  /** true ise tetikleyici buton içeriği gösterilmez (üstte özel gösterim varsa) */
  hideTriggerContent?: boolean;
}

function PriceDayContent(props: any) {
  const date = props.date;
  if (!(date instanceof Date) || isNaN(date.getTime())) return null;
  const price = Math.floor(100 + (date.getDate() * 7) % 100);
  return (
    <div className="flex flex-col items-center justify-center min-h-[36px] min-w-[32px] gap-0.5 px-0.5 py-0.5 text-sm font-normal">
      <span className="text-xs font-normal text-gray-800">{date.getDate()}</span>
      <span className="text-xs text-green-600 font-normal">{price} €</span>
    </div>
  );
}

function DefaultDayContent(props: any) {
  const date = props.date;
  if (!(date instanceof Date) || isNaN(date.getTime())) return null;
  return (
    <div className="flex items-center justify-center min-h-[36px] min-w-[32px] px-0.5 py-0.5 text-sm font-semibold text-gray-800">
      {date.getDate()}
    </div>
  );
}

const DateInput: React.FC<DateInputProps> = ({ value, onChange, disabled, className, placeholder, label, showPrices = true, hideTriggerContent = false }) => {
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState<Date | undefined>(value);
  const inputRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [visibleMonths, setVisibleMonths] = useState<Date[]>([]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // İlk açılışta 2 ay göster
  useEffect(() => {
    if (show && isMobile) {
      const now = selected || new Date();
      const months = [new Date(now.getFullYear(), now.getMonth(), 1), new Date(now.getFullYear(), now.getMonth() + 1, 1)];
      setVisibleMonths(months);
    }
  }, [show, isMobile, selected]);

  // Scroll ile yeni ay ekle
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
      // Son ayı bul ve bir sonraki ayı ekle
      const lastMonth = visibleMonths[visibleMonths.length - 1];
      const nextMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 1);
      setVisibleMonths((prev) => {
        // Aynı ay tekrar eklenmesin
        if (prev.some(m => m.getFullYear() === nextMonth.getFullYear() && m.getMonth() === nextMonth.getMonth())) return prev;
        return [...prev, nextMonth];
      });
    }
  };

  // Dışarı tıklanınca popup'ı kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShow(false);
      }
    }
    if (show && !isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show, isMobile]);

  // Seçimi uygula
  const handleApply = () => {
    onChange(selected);
    setShow(false);
  };

  // İptal
  const handleCancel = () => {
    setSelected(value);
    setShow(false);
  };

  // Kısa gün isimleri
  const shortWeekdays = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];

  // Başlık formatı
  const formatCaption = (month: Date) =>
    month.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  // Mobilde tarih seçilince hemen uygula
  const handleMobileSelect = (date: Date | undefined) => {
    setSelected(date);
    if (isMobile && date) {
      onChange(date);
      setShow(false);
    }
  };

  return (
    <div className={`relative ${className || ''}`} ref={inputRef}>
            <button
        type="button"
        className="w-full h-full text-center focus:outline-none focus:border-none focus:ring-0 disabled:opacity-50 flex items-center justify-center text-[14px] font-normal text-black flight-search-input transition-all duration-200"
        onClick={() => setShow(!show)}
        disabled={disabled}
        style={{ 
          textAlign: 'center', 
          outline: 'none !important',
          color: selected ? 'rgb(0 0 0)' : (isMobile ? 'rgb(0 0 0)' : 'rgb(0 0 0)')
        }}
      >
        {!hideTriggerContent && (selected ? selected.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }) : (placeholder || label || 'Tarih seçin'))}
      </button>
      {/* Masaüstü popup */}
      {show && !isMobile && (
        <div className="absolute z-[9999] mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 min-w-[500px] left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-0">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={setSelected}
            locale={tr}
            numberOfMonths={2}
            className="mb-4 flex flex-row text-sm font-normal"
            showOutsideDays
            components={{
              DayContent: showPrices ? PriceDayContent : DefaultDayContent
            }}
            classNames={{
              day_selected: "bg-gray-200 border border-gray-500 text-gray-900",
              day: `rounded-lg text-sm ${showPrices ? 'font-normal' : 'font-semibold'}`
            }}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={handleCancel} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50">İptal</button>
            <button onClick={handleApply} className="px-4 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600">Tarihi ayarla</button>
          </div>
        </div>
      )}
      {/* Mobil tam ekran scrollable modal */}
      {show && isMobile && (
        <div className="fixed inset-0 z-[9999] bg-black bg-opacity-40 flex items-end">
          <div className="w-full bg-white rounded-t-2xl p-4 pb-8 shadow-2xl animate-slide-up max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-lg text-gray-800">{label || placeholder || 'Tarih Seç'}</span>
              <button onClick={handleCancel} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-2xl text-gray-500">×</span>
              </button>
            </div>
            <div className="overflow-y-scroll max-h-[55vh]" onScroll={handleScroll}>
              {visibleMonths.map((month, idx) => (
                <div key={month.toISOString()} className="mb-6">
                  <DayPicker
                    mode="single"
                    selected={selected}
                    onSelect={handleMobileSelect}
                    locale={tr}
                    month={month}
                    numberOfMonths={1}
                    showOutsideDays
                    components={{
                      DayContent: showPrices ? PriceDayContent : DefaultDayContent
                    }}
                    className="mb-2 text-base font-normal"
                    classNames={{
                      day_selected: "bg-green-100 border border-green-500 text-green-900",
                      day: `rounded-lg text-base ${showPrices ? 'font-semibold' : 'font-bold'} min-w-[40px] min-h-[40px] flex items-center justify-center`,
                      caption: "text-center text-base font-semibold mb-2",
                      table: "w-full border-collapse",
                      head_row: "",
                      head_cell: "text-xs text-gray-400 font-medium p-1",
                      row: "",
                      cell: "p-0",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateInput; 