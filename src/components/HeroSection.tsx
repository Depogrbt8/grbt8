import { PlaneTakeoff, Building, Car, Wifi } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="bg-green-500 text-center text-white pb-5 sm:pb-32 pt-[2rem] sm:pt-8 relative z-10 rounded-b-[16px] sm:rounded-b-[32px]">
      <div className="container mx-auto px-4">
        {/* Masaüstü Logo ve Slogan - Eski Tasarım */}
        <h1 className="hidden sm:block sm:relative text-2xl sm:text-5xl font-bold mb-0 sm:mb-0 z-30">
          <span className="text-white">gurbet</span>
          <span className="text-black">biz</span>
        </h1>
        <h2 className="hidden sm:block text-xs sm:text-xl font-light">Gurbetten Memlekete, Yol Arkadaşınız!</h2>
        
        {/* Mobil: Logo ve slogan gizli (Header'da zaten var) */}
      </div>
      {/* Service Icons - overlap border */}
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-[45%] sm:translate-y-[65%] z-20 flex justify-center w-full pointer-events-none">
        <div className="flex gap-8 bg-transparent scale-75 sm:scale-100">
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-full w-20 h-20 flex items-center justify-center shadow-2xl hover:shadow-3xl mb-2 border-4 border-white transition-all duration-500 hover:scale-110 hover:rotate-3 cursor-pointer">
              <PlaneTakeoff className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <span className="text-green-600 text-xs sm:text-sm pointer-events-auto font-bold">UÇAK</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-full w-20 h-20 flex items-center justify-center shadow-2xl hover:shadow-3xl mb-2 border-4 border-white transition-all duration-500 hover:scale-110 hover:rotate-3 cursor-pointer">
              <Building className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <span className="text-green-600 text-xs sm:text-sm pointer-events-auto font-bold">OTEL</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-full w-20 h-20 flex items-center justify-center shadow-2xl hover:shadow-3xl mb-2 border-4 border-white transition-all duration-500 hover:scale-110 hover:rotate-3 cursor-pointer">
              <Car className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
            <span className="text-green-600 text-xs sm:text-sm pointer-events-auto font-bold">ARAÇ</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-full w-20 h-20 flex items-center justify-center shadow-2xl hover:shadow-3xl mb-2 border-4 border-white transition-all duration-500 hover:scale-110 hover:rotate-3 cursor-pointer">
              <Wifi className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <span className="text-green-600 text-xs sm:text-sm pointer-events-auto font-bold">E SIM</span>
          </div>
        </div>
      </div>
    </div>
  );
} 