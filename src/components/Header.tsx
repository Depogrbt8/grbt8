'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { User, LogOut, TrendingDown, Menu, X, Plane, Users, Receipt, Search, Bell, Heart } from '@/components/common/Icons';
import LanguageDropdown from './LanguageDropdown';
import LoginModal from './LoginModal';
import { getEuroRate } from '@/services/exchangeRate';
import Image from 'next/image';
import AccountSidebar from './AccountSidebar';
import { logger } from '@/lib/logger';

export default function Header() {
    const { data: session, status } = useSession();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [euroRate, setEuroRate] = useState<number | null>(null); // Başlangıçta null
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAccountSidebarOpen, setIsAccountSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchRate = async () => {
            try {
                const rate = await getEuroRate();
                setEuroRate(rate);
            } catch (error) {
                logger.error('Döviz kuru alınamadı', { error });
                // Fallback değer kaldırıldı - sadece "Yükleniyor..." gösterilecek
            }
        };
        
        // İlk yükleme
        fetchRate();
        
        // Her 2 dakikada bir güncelle (API cache 2 dakika)
        const interval = setInterval(fetchRate, 2 * 60 * 1000);
        
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        signOut({ callbackUrl: '/' });
    };

    const menuItems = [
        { icon: User, label: 'Hesabım', href: '/hesabim' },
        { icon: Plane, label: 'Seyahatlerim', href: '/hesabim/seyahatlerim' },
        { icon: Users, label: 'Yolcularım', href: '/hesabim/yolcularim' },
        // { icon: Star, label: 'Puanlarım', href: '/hesabim/puanlarim' }, // Geçici olarak gizlendi
        { icon: Receipt, label: 'Fatura Bilgilerim', href: '/hesabim/fatura' },
        { icon: Search, label: 'Aramalarım', href: '/hesabim/aramalarim' },
        { icon: Bell, label: 'Fiyat Alarmlarım', href: '/hesabim/alarmlar' },
        { icon: Heart, label: 'Favorilerim', href: '/hesabim/favoriler' },
    ];

    return (
        <>
            <header className="bg-green-500 text-white relative z-50">
                <div className="px-4">
                    {/* Mobil: Üstte sağda ikonlar, ortada ve aşağıda logo */}
                    <div className="sm:hidden w-full">
                        <div className="flex flex-row justify-end items-center pt-3.5 w-full gap-2">
                            {/* Döviz alanı - Sadece mobilde görünür */}
                            <span className="flex items-center flex-nowrap whitespace-nowrap text-sm mr-auto">
                                <span className="font-medium">€ = {euroRate?.toFixed(2) || 'Yükleniyor...'} TL</span>
                            </span>
                            <LanguageDropdown />
                            <button onClick={() => setIsMenuOpen(true)} style={{ lineHeight: 0 }}>
                                <Menu className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex justify-center items-center -mt-3 mb-0">
                            <Link href="/" className="text-2xl font-bold text-white leading-tight hover:text-gray-100 transition-colors">
                                <span className="text-white">gurbet</span>
                                <span className="text-black">biz</span>
                            </Link>
                        </div>
                    </div>
                    {/* Masaüstü: Eski yapı */}
                    <div className="hidden sm:flex flex-row justify-between items-center py-3.5">
                        <div className="flex items-center gap-2">
                            <Link href="/" className="text-sm font-normal text-white leading-tight underline hover:text-gray-100 transition-colors">gurbetbiz.app</Link>
                            {/* Döviz alanı - Sadece masaüstünde görünür */}
                            <span className="sm:ml-6 ml-2 items-center flex-nowrap whitespace-nowrap text-sm sm:text-base flex">
                                <span className="font-medium">€ = {euroRate?.toFixed(2) || 'Yükleniyor...'} TL</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-6 mr-4">
                            <LanguageDropdown />
                            {status === 'authenticated' && (
                                <Link href="/hesabim" className="flex items-center gap-0.5 text-sm font-medium hover:text-gray-100 transition-colors">
                                    <User className="w-5 h-5" />
                                    <span>
                                        {session?.user?.firstName 
                                            ? session.user.firstName 
                                            : session?.user?.email 
                                                ? session.user.email.split('@')[0] 
                                                : 'Hesabım'
                                        }
                                    </span>
                                </Link>
                            )}
                            {status === 'authenticated' && (
                                <button onClick={handleLogout} className="flex items-center gap-1 text-sm font-medium hover:text-gray-100 transition-colors">
                                    <LogOut className="w-5 h-5" />
                                    <span>Çıkış Yap</span>
                                </button>
                            )}
                            {status !== 'authenticated' && (
                                <button onClick={() => setIsLoginModalOpen(true)} className="flex items-center gap-1 text-sm font-medium hover:text-gray-100 transition-colors">
                                    <User className="w-5 h-5" />
                                    <span>Giriş yap</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>
            {/* Mobil Hamburger Drawer */}
            {isMenuOpen && !isAccountSidebarOpen && (
                <div className="fixed inset-0 z-[9999] bg-black/40">
                    <div className={`fixed right-0 top-0 h-full bg-white w-4/5 max-w-xs shadow-lg flex flex-col transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        <button className="absolute top-4 right-4 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                            <X className="w-7 h-7" />
                        </button>
                        <div className="p-6 flex flex-col gap-4 mt-2">
                            {/* Giriş Yap butonu */}
                            {status !== 'authenticated' && (
                                <button onClick={() => { setIsLoginModalOpen(true); setIsMenuOpen(false); }} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold text-base">
                                    <User className="w-5 h-5" />
                                    <span>Giriş yap</span>
                                </button>
                            )}
                            {status === 'authenticated' && (
                                <button onClick={() => { setIsAccountSidebarOpen(true); setIsMenuOpen(false); }} className="flex items-center gap-0.5 px-4 py-2 bg-green-50 text-green-700 rounded-lg font-semibold text-base">
                                    <User className="w-5 h-5" />
                                    <span>
                                        {session?.user?.firstName 
                                            ? session.user.firstName 
                                            : session?.user?.email 
                                                ? session.user.email.split('@')[0] 
                                                : 'Hesabım'
                                        }
                                    </span>
                                </button>
                            )}
                            {/* Ana menü linkleri */}
                            <Link href="/" className="py-2 px-2 text-gray-800 rounded hover:bg-gray-100 font-medium">Uçak Bileti Ara</Link>
                            <Link href="#kampanyalar" className="py-2 px-2 text-gray-800 rounded hover:bg-gray-100 font-medium">Kampanyalar</Link>
                            <Link href="/check-in" className="py-2 px-2 text-gray-800 rounded hover:bg-gray-100 font-medium">Online Check-in</Link>
                            <Link href="/pnr-sorgula" className="py-2 px-2 text-gray-800 rounded hover:bg-gray-100 font-medium">PNR Sorgula</Link>
                            <Link href="/bilet-iptal" className="py-2 px-2 text-gray-800 rounded hover:bg-gray-100 font-medium">Biletimi İptal Et</Link>
                            <Link href="/yardim" className="py-2 px-2 text-gray-800 rounded hover:bg-gray-100 font-medium">Yardım</Link>
                            <a href="#" className="py-2 px-2 text-gray-800 rounded hover:bg-gray-100 font-medium">Mobil Uygulama İndir</a>
                        </div>
                    </div>
                    {/* Drawer dışına tıklayınca kapansın */}
                    <div className="w-full h-full" onClick={() => setIsMenuOpen(false)} />
                </div>
            )}
            {/* Mobil Hesap Slidebar */}
            {isAccountSidebarOpen && (
                <div className="fixed inset-0 z-[9999] bg-black/40">
                    <div className={`fixed right-0 top-0 h-full bg-white w-4/5 max-w-xs shadow-lg flex flex-col transition-transform duration-300 ${isAccountSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        <button className="absolute top-4 right-4 text-gray-700" onClick={() => setIsAccountSidebarOpen(false)}>
                            <X className="w-7 h-7" />
                        </button>
                        <AccountSidebar items={menuItems} onLogout={handleLogout} isDrawer onItemClick={() => setIsAccountSidebarOpen(false)} />
                    </div>
                    <div className="w-full h-full" onClick={() => setIsAccountSidebarOpen(false)} />
                </div>
            )}
            {isLoginModalOpen && <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />}
        </>
    );
}
