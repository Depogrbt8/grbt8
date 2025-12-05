'use client';

import { useState, useEffect } from 'react';
import { X, Plane, Globe, MapPin } from 'lucide-react';

export default function ComingSoonPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

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
      {/* Backdrop - Animated gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-black/60 via-green-900/40 to-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Popup Container */}
      <div 
        className={`relative w-full max-w-md mx-auto transform transition-all duration-500 ${
          isAnimating ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-75 animate-pulse" />
        
        {/* Main Card - Glassmorphism */}
        <div className="relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-green-100/50 to-transparent rounded-full animate-spin-slow" style={{ animationDuration: '20s' }} />
            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-emerald-100/50 to-transparent rounded-full animate-spin-slow" style={{ animationDuration: '25s', animationDirection: 'reverse' }} />
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100/80 hover:bg-gray-200/80 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Content */}
          <div className="relative z-10 p-6 sm:p-8">
            {/* Animated Flight Path */}
            <div className="relative h-20 sm:h-24 mb-6 overflow-hidden">
              {/* Flight Path Line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-300 to-transparent transform -translate-y-1/2">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse" />
              </div>
              
              {/* Departure - Europe */}
              <div className="absolute left-4 sm:left-8 top-1/2 transform -translate-y-1/2 flex flex-col items-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <span className="mt-2 text-xs sm:text-sm font-semibold text-gray-600">Avrupa</span>
              </div>

              {/* Animated Plane */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce-slow">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-400 rounded-full blur-md animate-ping opacity-50" />
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-xl">
                    <Plane className="w-5 h-5 sm:w-6 sm:h-6 text-white transform rotate-45" />
                  </div>
                </div>
              </div>

              {/* Destination - Turkey */}
              <div className="absolute right-4 sm:right-8 top-1/2 transform -translate-y-1/2 flex flex-col items-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                  <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <span className="mt-2 text-xs sm:text-sm font-semibold text-gray-600">Türkiye</span>
              </div>
            </div>

            {/* Text Content */}
            <div className="text-center space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight">
                Size en uygun fiyatları sunmak için
                <span className="block text-green-600">çalışıyoruz</span>
              </h2>
              
              <div className="flex items-center justify-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>

              <p className="text-base sm:text-lg text-gray-600 font-medium">
                ✨ Yakında hizmetinizdeyiz! ✨
              </p>

              {/* Features */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 pt-2">
                <span className="px-3 py-1.5 bg-green-50 text-green-700 text-xs sm:text-sm rounded-full font-medium">
                  💰 En iyi fiyatlar
                </span>
                <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs sm:text-sm rounded-full font-medium">
                  🔒 Güvenli ödeme
                </span>
                <span className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs sm:text-sm rounded-full font-medium">
                  🇹🇷 Türkçe destek
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-6 sm:mt-8">
              <button
                onClick={handleClose}
                className="w-full py-3.5 sm:py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
              >
                Tamam, Bekliyorum! 👍
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animation Styles */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-8px); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

