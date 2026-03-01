import { PlaneTakeoff, Building, Car, Wifi } from 'lucide-react';

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
    return 'flex items-center justify-center mb-2 transition-all duration-500 hover:scale-110 hover:rotate-3 cursor-pointer pointer-events-auto';
  };

  const getIconColor = () => 'text-white';

  const getLabelClasses = (service: ServiceType) => {
    const isActive = activeService === service;
    return `text-xs sm:text-sm pointer-events-auto font-bold ${
      isActive ? 'text-green-700' : 'text-green-600'
    }`;
  };

  return (
    <div className="bg-green-500 text-center text-white pb-5 sm:pb-32 pt-[2rem] sm:pt-8 relative z-10 rounded-b-[16px] sm:rounded-b-[32px]">
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
        <h1 className="sr-only">Avrupa&apos;dan Türkiye&apos;ye Yol Arkadaşınız</h1>
      </div>
      {/* Service Icons - overlap border */}
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-[45%] sm:translate-y-[65%] z-20 flex justify-center w-full">
        <div className="flex gap-8 bg-transparent scale-[0.9] sm:scale-[1.2]">
          <div className="flex flex-col items-center" onClick={() => handleServiceClick('flight')}>
            <div className={getIconClasses()}>
              <PlaneTakeoff className={`w-7 h-7 ${getIconColor()}`} strokeWidth={2} />
            </div>
            <span className={getLabelClasses('flight')}>UÇAK</span>
          </div>
          <div className="flex flex-col items-center" onClick={() => handleServiceClick('hotel')}>
            <div className={getIconClasses()}>
              <Building className={`w-7 h-7 ${getIconColor()}`} strokeWidth={2} />
            </div>
            <span className={getLabelClasses('hotel')}>OTEL</span>
          </div>
          <div className="flex flex-col items-center" onClick={() => handleServiceClick('car')}>
            <div className={getIconClasses()}>
              <Car className={`w-8 h-8 ${getIconColor()}`} strokeWidth={2} />
            </div>
            <span className={getLabelClasses('car')}>ARAÇ</span>
          </div>
          <div className="flex flex-col items-center" onClick={() => handleServiceClick('esim')}>
            <div className={getIconClasses()}>
              <Wifi className={`w-7 h-7 ${getIconColor()}`} strokeWidth={2} />
            </div>
            <span className={getLabelClasses('esim')}>E SIM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
