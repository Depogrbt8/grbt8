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

const OPTION_HEIGHT = 36;
const POPUP_WIDTH = 88;
const VISIBLE_ITEMS = 6;
const POPUP_LIST_HEIGHT = OPTION_HEIGHT * VISIBLE_ITEMS;

const TimeInput: React.FC<TimeInputProps> = ({ value, onChange, disabled, className, placeholder = 'Saat seçin', hideTriggerContent = false }) => {
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState(value);
  const inputRef = useRef<HTMLDivElement>(null);
  const [popupRect, setPopupRect] = useState<{ top: number; left: number; maxListHeight?: number } | null>(null);
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

        let left = r.left + (r.width - POPUP_WIDTH) / 2;
        if (left < padding) left = padding;
        if (left + POPUP_WIDTH > vw - padding) left = vw - POPUP_WIDTH - padding;

        let top = r.bottom + 6;
        const popupApproxHeight = POPUP_LIST_HEIGHT + 16;
        let maxListHeight: number | undefined;
        if (top + popupApproxHeight > vh - padding) {
          top = r.top - popupApproxHeight - 6;
          if (top < padding) {
            top = padding;
            maxListHeight = Math.max(OPTION_HEIGHT * 3, vh - padding - top - 16);
          }
        } else {
          const availableBelow = vh - padding - top - 16;
          if (availableBelow < POPUP_LIST_HEIGHT) maxListHeight = Math.max(OPTION_HEIGHT * 3, availableBelow);
        }
        setPopupRect({ top, left, maxListHeight });

        requestAnimationFrame(() => {
          const listEl = listRef.current;
          if (listEl) {
            const current = selected || value || '10:00';
            const index = TIME_OPTIONS.indexOf(current);
            if (index >= 0) {
              const targetScroll = index * OPTION_HEIGHT - listEl.clientHeight / 2 + OPTION_HEIGHT / 2;
              listEl.scrollTop = Math.max(0, targetScroll);
            }
          }
        });
      }
    } else {
      setPopupRect(null);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show, selected, value]);

  const handleSelectTime = (time: string) => {
    setSelected(time);
    onChange(time);
    setShow(false);
  };

  const popupContent = show && popupRect && typeof document !== 'undefined' && (
    <div
      data-time-popup
      className="fixed z-[9999] bg-white rounded-xl shadow-lg border border-gray-200 py-2"
      style={{
        top: popupRect.top,
        left: popupRect.left,
        width: POPUP_WIDTH,
      }}
    >
      <div
        ref={listRef}
        className="overflow-y-auto overflow-x-hidden scroll-smooth py-1"
        style={{ maxHeight: popupRect.maxListHeight ?? POPUP_LIST_HEIGHT }}
      >
        {TIME_OPTIONS.map((time) => (
          <button
            key={time}
            type="button"
            onClick={() => handleSelectTime(time)}
            className={`w-full h-9 flex items-center justify-center text-sm font-medium rounded-md transition-colors ${
              (selected || value) === time
                ? 'bg-green-100 text-green-800'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {time}
          </button>
        ))}
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
