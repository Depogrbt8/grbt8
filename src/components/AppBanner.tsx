export default function AppBanner() {
  return (
    <>
      {/* Mobil App Banner - sadece mobilde */}
      <div className="block sm:hidden w-full px-2 mt-4">
        <div className="w-full bg-gradient-to-r from-green-700 via-teal-600 to-green-800 rounded-2xl shadow-lg px-3 py-3 flex flex-col sm:flex-col items-center text-center relative">
          {/* Mobilde yatay hizalama */}
          <div className="flex flex-row sm:flex-col items-center w-full justify-center">
            {/* Telefon ikonu sola */}
            <div className="block sm:hidden flex-shrink-0 flex items-center justify-center mr-2" style={{ minWidth: 60 }}>
              <svg width="56" height="84" viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="14" y="8" width="52" height="104" rx="12" fill="#fff" stroke="#222" strokeWidth="3"/>
                <rect x="30" y="16" width="20" height="4" rx="2" fill="#e5e7eb"/>
                <rect x="37" y="104" width="6" height="4" rx="2" fill="#e5e7eb"/>
                <circle cx="40" cy="24" r="2" fill="#222"/>
                <rect x="34" y="100" width="12" height="2" rx="1" fill="#222" opacity="0.2"/>
                {/* gurbetbiz logo */}
                <g>
                  <foreignObject x="16" y="44" width="48" height="24">
                    <div style={{display:'flex',justifyContent:'center',alignItems:'center',width:'100%',height:'100%'}}>
                      <span style={{color:'#16a34a',fontWeight:'800',fontSize:'10px',fontFamily:'inherit'}}>gurbet</span><span style={{color:'#222',fontWeight:'800',fontSize:'10px',fontFamily:'inherit'}}>biz</span>
                    </div>
                  </foreignObject>
                </g>
              </svg>
            </div>
            {/* Yazılar sağda */}
            <div className="flex flex-col items-start text-left justify-center flex-1">
              <div className="flex items-center mb-1">
                <span className="text-white text-lg font-extrabold">gurbet</span><span className="text-black text-lg font-extrabold">biz</span>
                <span className="text-black text-xs font-medium ml-2">Mobil Uygulama</span>
              </div>
              <div className="text-white text-base font-normal mb-1">Avrupa'dan Türkiye'ye Yol arkadasiniz</div>
              <div className="text-white text-lg font-extrabold mb-2">
                <span className="text-white">Hemen </span>
                <span className="text-white uppercase tracking-wider">İNDİR !</span>
              </div>
            </div>
          </div>
          {/* Store badge'leri */}
          <div className="flex gap-4 justify-center w-full mt-2 items-center">
            <a href="#" className="block">
              <img
                src="/images/app-store.png"
                alt="App Store"
                className="h-11 w-[140px] object-contain"
              />
            </a>
            <a href="#" className="block">
              <img
                src="/images/google-play.png"
                alt="Google Play"
                className="h-11 w-[140px] object-contain"
              />
            </a>
          </div>
        </div>
      </div>

      {/* Masaüstü Uygulama Banner */}
      <div className="hidden sm:block w-full sm:container sm:mx-auto px-0 sm:px-4 mt-10">
        <div className="bg-green-500 rounded-[32px] shadow-lg p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 via-white/20 to-green-400/30 pointer-events-none"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-8">
              {/* Telefon İkonu */}
              <div className="w-12 h-12">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 4C14 2.89543 14.8954 2 16 2H32C33.1046 2 34 2.89543 34 4V44C34 45.1046 33.1046 46 32 46H16C14.8954 46 14 45.1046 14 44V4Z" stroke="white" strokeWidth="2" fill="none"/>
                  <path d="M22 6H26" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h3 className="text-[28px] leading-tight">
                  <span className="text-white font-bold">gurbet</span>
                  <span className="text-black font-bold">biz</span>
                  <span className="text-white font-normal text-xl font-semibold ml-2">Uygulaması</span>
                </h3>
                <p className="text-white text-lg mt-1">Avrupa'dan Türkiye'ye Yol Arkadaşınız</p>
              </div>
            </div>
            <div className="flex gap-4">
              {/* App Store Butonu */}
              <a href="#" className="block">
                <div className="bg-black text-white rounded-lg px-4 py-2 flex items-center gap-2 h-[44px]">
                  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
                    <path d="M16.5 3.49997C15.953 3.53628 15.1084 3.89749 14.4734 4.54749C13.8971 5.13249 13.4513 5.96997 13.5672 6.78747C14.1738 6.85497 14.7992 6.48247 15.3992 5.85497C15.9742 5.25497 16.4326 4.42497 16.5 3.49997ZM19.5 17.3375C19.5 17.3375 19.0604 18.6604 18.1229 20.0104C17.3479 21.1229 16.5 22.5 15.2396 22.5C14.0771 22.5 13.6125 21.7125 12.2521 21.7125C10.8646 21.7125 10.3479 22.5 9.22461 22.5C7.96419 22.5 7.07919 21.0604 6.30419 19.9479C4.69419 17.625 3.42169 13.3125 5.10419 10.3125C5.93169 8.83747 7.37919 7.87497 8.95419 7.87497C10.1542 7.87497 11.1167 8.69997 11.8125 8.69997C12.4813 8.69997 13.6125 7.79997 15.0375 7.79997C15.8771 7.79997 17.4146 8.11497 18.4688 9.48747C15.2396 11.2125 15.8396 15.675 19.5 17.3375Z"/>
                  </svg>
                  <div>
                    <div className="text-[10px] leading-none">Download on the</div>
                    <div className="text-xl font-semibold leading-none mt-1">App Store</div>
                  </div>
                </div>
              </a>
              {/* Google Play Butonu */}
              <a href="#" className="block">
                <div className="bg-black text-white rounded-lg px-4 py-2 flex items-center gap-2 h-[44px]">
                  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a2.012 2.012 0 0 1-.465-.635 2.006 2.006 0 0 1-.171-.817V3.266c0-.283.059-.557.17-.817.113-.26.271-.494.465-.635zm1.318-.814l10.196 10.196L19.85 6.47A2.004 2.004 0 0 0 20.016 4a2.004 2.004 0 0 0-2.47-1.166L4.927 1zm0 22l12.619-1.834A2.004 2.004 0 0 0 20.016 20a2.004 2.004 0 0 0-.166-2.47l-4.727-4.726L4.927 23z"/>
                  </svg>
                  <div>
                    <div className="text-[10px] leading-none">GET IT ON</div>
                    <div className="text-xl font-semibold leading-none mt-1">Google Play</div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 