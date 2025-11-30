import { PlaneTakeoff, Building, Car, Wifi } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="bg-green-500 text-center text-white pb-5 sm:pb-32 pt-[2rem] sm:pt-8 relative z-10 rounded-b-[16px] sm:rounded-b-[32px]">
      <div className="container mx-auto px-4">
        {/* Masaüstü Logo ve Slogan */}
        <div className="hidden sm:block sm:relative z-30">
          {/* Logo - SEO için H1 içinde ama görsel olarak logo */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-2 sm:mb-3 leading-tight">
            <span className="text-white">gurbet</span>
            <span className="text-black">biz</span>
          </h1>
          {/* Slogan */}
          <p className="text-sm sm:text-lg md:text-xl font-light text-white">
            Gurbetten Memlekete, Yol Arkadaşınız!
          </p>
        </div>
        {/* Mobil Logo ve Slogan */}
        <div className="sm:hidden z-30">
          <h1 className="text-2xl font-bold mb-1 leading-tight">
            <span className="text-white">gurbet</span>
            <span className="text-black">biz</span>
          </h1>
          <p className="text-xs font-light text-white">
            Gurbetten Memlekete, Yol Arkadaşınız!
          </p>
        </div>
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