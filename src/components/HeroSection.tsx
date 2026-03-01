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
      {/* Yeşil alan - ikonlar */}
      <div className="bg-green-500 text-white pt-[2rem] sm:pt-8 pb-6 sm:pb-8 rounded-b-[16px] sm:rounded-b-[32px]">
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

        {/* İkon kutuları - yuvarlak değil, kare/rounded (resimdeki gibi) */}
        <div className="container mx-auto px-4 mt-4 sm:mt-6">
          <div className="flex justify-center gap-3 sm:gap-6 flex-wrap">
            {SERVICES.map(({ id, label, Icon }) => {
              const isActive = activeService === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleServiceClick(id)}
                  className="flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-green-500 rounded-xl"
                  aria-label={label}
                >
                  <div
                    className={`rounded-xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center border-2 transition-all duration-200 ${
                      isActive
                        ? 'bg-white border-white shadow-lg'
                        : 'bg-green-600 border-green-400'
                    }`}
                  >
                    <Icon
                      className={`w-7 h-7 sm:w-8 sm:h-8 ${isActive ? 'text-green-600' : 'text-white'}`}
                      strokeWidth={2}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alt kısım - noktalı beyaz zemin + yazılar (UÇAK, OTEL, ARAÇ, E SIM) */}
      <div
        className="bg-white pt-2 pb-4 sm:pb-6 -mt-1"
        style={{
          backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '12px 12px',
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
            {SERVICES.map(({ id, label }) => {
              const isActive = activeService === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleServiceClick(id)}
                  className={`rounded-t-xl px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
                    isActive
                      ? 'bg-white text-green-700 shadow-md'
                      : 'bg-white/80 text-green-600 hover:bg-white hover:text-green-700'
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
