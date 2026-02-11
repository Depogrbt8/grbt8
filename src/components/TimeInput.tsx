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
  const [popupRect, setPopupRect] = useState<{ top: number; left: number; width: number; maxListHeight?: number } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

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
        const vw = typeof window !== 'undefined' ? window.innerWidth : 800;
        const vh = typeof window !== 'undefined' ? window.innerHeight : 600;
        const padding = 12;
        const popupMinWidth = 220;
        const popupListMaxHeight = 192; // max-h-48
        const popupApproxHeight = 56 + popupListMaxHeight + 52; // başlık + liste + butonlar

        let left = r.left;
        let width = Math.max(r.width, popupMinWidth);
        width = Math.min(width, vw - 2 * padding);
        if (left + width > vw - padding) left = vw - width - padding;
        if (left < padding) left = padding;

        let top = r.bottom + 8;
        const headerAndFooter = 56 + 52;
        let maxListHeight: number | undefined;
        if (top + popupApproxHeight > vh - padding) {
          top = r.top - popupApproxHeight - 8;
          if (top < padding) {
            top = padding;
            maxListHeight = Math.max(120, vh - padding - top - headerAndFooter - 16);
          }
        } else {
          const availableBelow = vh - padding - top - headerAndFooter - 16;
          if (availableBelow < popupListMaxHeight) maxListHeight = Math.max(120, availableBelow);
        }
        setPopupRect({ top, left, width, maxListHeight });

        // Seçili saati kaydırmalı liste içinde ortalamaya çalış
        const listEl = listRef.current;
        if (listEl) {
          const index = TIME_OPTIONS.indexOf(selected || value || '10:00');
          if (index >= 0) {
            const optionHeight = 40;
            const targetCenter = index * optionHeight;
            const offset = targetCenter - listEl.clientHeight / 2 + optionHeight / 2;
            listEl.scrollTop = Math.max(0, offset);
          }
        }
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
      className="fixed z-[9999] bg-white rounded-2xl shadow-xl border border-gray-200 p-4 min-w-[220px]"
      style={{
        top: popupRect.top,
        left: popupRect.left,
        width: popupRect.width,
      }}
    >
      <p className="text-sm font-medium text-gray-700 mb-3">Saat seçin</p>
      <div className="relative">
        {/* Orta satırı vurgulayan şerit */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-9 rounded-lg border border-green-400/70 bg-green-50/40" />

        {/* Kayar saat listesi */}
        <div
          ref={listRef}
          className="relative overflow-y-auto py-4 scroll-smooth snap-y snap-mandatory"
          style={{ maxHeight: popupRect.maxListHeight ?? 192 }}
        >
          {TIME_OPTIONS.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => setSelected(time)}
              className={`w-full h-9 flex items-center justify-center text-sm font-semibold snap-center transition-colors ${
                selected === time
                  ? 'text-green-600'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
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
