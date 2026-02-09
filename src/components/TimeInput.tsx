'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TimeInputProps {
  value: string; // "HH:mm"
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  /** true ise tetikleyici içeriği gizlenir (üstte özel gösterim varsa çift yazı olmaması için) */
  hideTriggerContent?: boolean;
}

const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

const TimeInput: React.FC<TimeInputProps> = ({ value, onChange, disabled, className, placeholder = 'Saat seçin', hideTriggerContent = false }) => {
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState(value);
  const inputRef = useRef<HTMLDivElement>(null);
  const [popupRect, setPopupRect] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-time-popup]')) setShow(false);
      }
    }
    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
      const el = inputRef.current;
      if (el) {
        const r = el.getBoundingClientRect();
        setPopupRect({ top: r.bottom + 8, left: r.left, width: r.width });
      }
    } else {
      setPopupRect(null);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show]);

  const handleApply = () => {
    onChange(selected);
    setShow(false);
  };

  const handleCancel = () => {
    setSelected(value);
    setShow(false);
  };

  const popupContent = show && popupRect && typeof document !== 'undefined' && (
    <div
      data-time-popup
      className="fixed z-[9999] bg-white rounded-2xl shadow-xl border border-gray-200 p-4 min-w-[280px]"
      style={{
        top: popupRect.top,
        left: popupRect.left,
      }}
    >
      <p className="text-sm font-medium text-gray-700 mb-3">Saat seçin</p>
      <div className="grid grid-cols-4 gap-1.5 max-h-[220px] overflow-y-auto overflow-x-visible">
        {TIME_OPTIONS.map((time) => (
          <button
            key={time}
            type="button"
            onClick={() => setSelected(time)}
            className={`py-2 px-2 rounded-lg text-sm font-medium transition-colors ${
              selected === time
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {time}
          </button>
        ))}
      </div>
      <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium"
        >
          İptal
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="px-4 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 text-sm"
        >
          Tamam
        </button>
      </div>
    </div>
  );

  return (
    <div className={`relative ${className || ''}`} ref={inputRef}>
      <button
        type="button"
        className="w-full h-full text-left focus:outline-none focus:border-none focus:ring-0 disabled:opacity-50 flex items-center justify-center text-[14px] font-normal text-black transition-all duration-200"
        onClick={() => !disabled && setShow(!show)}
        disabled={disabled}
      >
        {!hideTriggerContent && (
          value ? (
            <span className="text-gray-700">{value}</span>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )
        )}
      </button>
      {typeof document !== 'undefined' && popupContent && createPortal(popupContent, document.body)}
    </div>
  );
};

export default TimeInput;
