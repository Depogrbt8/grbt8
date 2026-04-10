'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import LoginModal from '@/components/LoginModal';

export default function ComingSoonPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

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

  const handleRegisterClick = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsOpen(false);
      setShowRegisterModal(true);
    }, 300);
  };

  return (
    <>
      <LoginModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        initialTab="register"
      />

      {isOpen && (
        // data-nosnippet ve aria-hidden Google indexlemesini engeller
        <div
          data-nosnippet
          aria-hidden="true"
          className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 transition-all duration-300 ${
            isAnimating ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

          {/* Popup */}
          <div
            className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 transform transition-all duration-300 ${
              isAnimating ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
            }`}
          >
            {/* X Butonu - Sol üst */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            {/* İçerik */}
            <div className="text-center pt-4">
              <p className="text-sm sm:text-base text-gray-600 mb-3 font-medium">
                Çok yakında hizmetinizdeyiz
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-green-600 mb-6 leading-tight">
                Birlikte daha güçlüyüz.
              </h2>

              <button
                type="button"
                onClick={handleRegisterClick}
                className="w-full py-3 px-4 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors mb-6"
              >
                Üye ol
              </button>

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
      )}
    </>
  );
}
