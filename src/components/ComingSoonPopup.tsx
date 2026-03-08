'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';

export default function ComingSoonPopup() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Admin panelde popup gösterme (overlay sayfayı bloklamasın)
  if (pathname?.startsWith('/grbt-8')) return null;

  useEffect(() => {
    // Session başına sadece 1 kez göster
    const hasShown = sessionStorage.getItem('comingSoonPopupShown');
    
    if (!hasShown) {
      // 3 saniye sonra aç
      const timer = setTimeout(() => {
        setIsOpen(true);
        setIsAnimating(true);
        sessionStorage.setItem('comingSoonPopupShown', 'true');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setIsOpen(false), 300);
  };

  if (!isOpen) return null;

  return (
    // data-nosnippet ve aria-hidden Google indexlemesini engeller
    <div 
      data-nosnippet
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 transition-all duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 transform transition-all duration-300 ${
          isAnimating ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* X Butonu - Sol üst */}
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* İçerik */}
        <div className="text-center pt-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-green-600 mb-6">
            Çok yakında hizmetinizdeyiz
          </h2>
          
          {/* 3 nokta yükleniyor animasyonu */}
          <div className="flex justify-center gap-2">
            <span 
              className="w-3 h-3 rounded-full bg-green-500 animate-bounce" 
              style={{ animationDelay: '0ms' }} 
            />
            <span 
              className="w-3 h-3 rounded-full bg-green-500 animate-bounce" 
              style={{ animationDelay: '150ms' }} 
            />
            <span 
              className="w-3 h-3 rounded-full bg-green-500 animate-bounce" 
              style={{ animationDelay: '300ms' }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
