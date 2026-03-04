// Yuvarlak ikonlar: grbt8-mobile GlobalHeader ile aynı set (Ionicons: airplane, business, car, wifi)
import React from 'react';
import { IoAirplane, IoBusiness, IoCar, IoWifi } from 'react-icons/io5';

type IconProps = { className?: string };
const Icons = {
  flight: IoAirplane as React.ComponentType<IconProps>,
  hotel: IoBusiness as React.ComponentType<IconProps>,
  car: IoCar as React.ComponentType<IconProps>,
  esim: IoWifi as React.ComponentType<IconProps>,
};

export type ServiceType = 'flight' | 'hotel' | 'car' | 'esim';

interface HeroSectionProps {
  activeService?: ServiceType;
  onServiceChange?: (service: ServiceType) => void;
}

export default function HeroSection({ activeService = 'flight', onServiceChange }: HeroSectionProps) {
  const handleServiceClick = (service: ServiceType) => {
    if (onServiceChange) {
      onServiceChange(service);
    }
  };

  const getIconClasses = () => {
    return 'rounded-full w-20 h-20 flex items-center justify-center shadow-lg hover:shadow-2xl mb-2 border border-gray-200 bg-white transition-all duration-200 cursor-pointer pointer-events-auto';
  };

  const getIconColor = () => 'text-black';

  const getLabelClasses = (service: ServiceType) => {
    const isActive = activeService === service;
    return `text-xs sm:text-sm pointer-events-auto ${
      isActive ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'
    }`;
  };

  return (
    <div className="bg-green-500 text-center text-white pb-5 sm:pb-32 pt-[2rem] sm:pt-8 relative z-10">
      <div className="container mx-auto px-4">
        {/* Masaüstü Logo ve Slogan */}
        <div className="hidden sm:block sm:relative mb-0 sm:mb-0 z-30">
          <div className="text-2xl sm:text-5xl font-bold">
            <span className="text-white">gurbet</span>
            <span className="text-black">biz</span>
          </div>
        </div>
        <h2 className="hidden sm:block text-xs sm:text-xl font-light">Gurbetten Memlekete, Yol Arkadaşınız!</h2>
        
        {/* H1 SEO için - Desktop ve Mobil */}
        <h1 className="sr-only">Avrupa'dan Türkiye'ye Yol Arkadaşınız</h1>
      </div>
      {/* Service Icons - grbt8-mobile ile aynı (Ionicons: airplane, business, car, wifi) */}
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-[55%] sm:translate-y-[70%] z-20 flex justify-center w-full">
        <div className="flex gap-8 bg-transparent scale-75 sm:scale-100">
          <div className="flex flex-col items-center" onClick={() => handleServiceClick('flight')}>
            <div className={getIconClasses()}>
              <Icons.flight className="w-7 h-7 text-black" />
            </div>
            <span className={getLabelClasses('flight')}>UÇAK</span>
          </div>
          <div className="flex flex-col items-center" onClick={() => handleServiceClick('hotel')}>
            <div className={getIconClasses()}>
              <Icons.hotel className="w-7 h-7 text-black" />
            </div>
            <span className={getLabelClasses('hotel')}>OTEL</span>
          </div>
          <div className="flex flex-col items-center" onClick={() => handleServiceClick('car')}>
            <div className={getIconClasses()}>
              <Icons.car className="w-8 h-8 text-black" />
            </div>
            <span className={getLabelClasses('car')}>ARAÇ</span>
          </div>
          <div className="flex flex-col items-center" onClick={() => handleServiceClick('esim')}>
            <div className={getIconClasses()}>
              <Icons.esim className="w-7 h-7 text-black" />
            </div>
            <span className={getLabelClasses('esim')}>E SIM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
