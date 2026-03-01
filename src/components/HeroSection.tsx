import { PlaneTakeoff, Building, Car, Wifi } from 'lucide-react';

export type ServiceType = 'flight' | 'hotel' | 'car' | 'esim';

interface HeroSectionProps {
  activeService?: ServiceType;
  onServiceChange?: (service: ServiceType) => void;
}

const SERVICES: { id: ServiceType; label: string; Icon: typeof PlaneTakeoff }[] = [
  { id: 'flight', label: 'UÇAK', Icon: PlaneTakeoff },
  { id: 'hotel', label: 'OTEL', Icon: Building },
  { id: 'car', label: 'ARAÇ', Icon: Car },
  { id: 'esim', label: 'E SIM', Icon: Wifi },
];

export default function HeroSection({ activeService = 'flight', onServiceChange }: HeroSectionProps) {
  const handleServiceClick = (service: ServiceType) => {
    if (onServiceChange) onServiceChange(service);
  };

  return (
    <div className="relative z-10">
      {/* Yeşil alan - sadece ikonlar, çerçeve yok */}
      <div className="bg-green-500 text-white pt-[2rem] sm:pt-8 pb-5 sm:pb-7 rounded-b-[16px] sm:rounded-b-[32px]">
        <div className="container mx-auto px-4">
          <div className="hidden sm:block sm:relative mb-0 z-30">
            <div className="text-2xl sm:text-5xl font-bold">
              <span className="text-white">gurbet</span>
              <span className="text-black">biz</span>
            </div>
          </div>
          <h2 className="hidden sm:block text-xs sm:text-xl font-light">Gurbetten Memlekete, Yol Arkadaşınız!</h2>
          <h1 className="sr-only">Avrupa&apos;dan Türkiye&apos;ye Yol Arkadaşınız</h1>
        </div>

        <div className="container mx-auto px-4 mt-4 sm:mt-6">
          <div className="flex justify-center gap-6 sm:gap-10 flex-wrap">
            {SERVICES.map(({ id, label, Icon }) => {
              const isActive = activeService === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleServiceClick(id)}
                  className="flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-green-500 rounded-lg"
                  aria-label={label}
                >
                  <Icon
                    className={`w-8 h-8 sm:w-10 sm:h-10 transition-opacity ${isActive ? 'text-white opacity-100' : 'text-white opacity-90 hover:opacity-100'}`}
                    strokeWidth={2}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Beyaz alan - sadece yazılar, yeşile yakın, nokta yok */}
      <div className="bg-white pt-1 pb-4 sm:pb-5 -mt-0.5">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-3 sm:gap-6 flex-wrap">
            {SERVICES.map(({ id, label }) => {
              const isActive = activeService === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleServiceClick(id)}
                  className={`rounded-t-lg px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-bold text-green-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
                    isActive ? 'bg-gray-100' : 'bg-gray-50 hover:bg-gray-100 text-green-600'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
