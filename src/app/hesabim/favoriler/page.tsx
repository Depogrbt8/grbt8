'use client';

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart, ArrowRight, Calendar, Trash2, Plane, Building2 } from 'lucide-react';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';

export default function FavorilerPage() {
  const { data: session, status } = useSession();
  const [searchFavorites, setSearchFavorites] = useState<any[]>([]);
  const [hotelFavorites, setHotelFavorites] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels'>('flights');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogout = () => { signOut({ callbackUrl: '/' }); };

  useEffect(() => {
    if (status === "authenticated") {
      fetchFavorites();
    } else if (status === "unauthenticated") {
      router.push("/giris");
    }
  }, [status, router]);

  const fetchFavorites = async () => {
    setLoading(true);
    setError("");
    try {
      // Uçuş aramaları favorileri
      const searchRes = await fetch("/api/search-favorites");
      const searchData = await searchRes.json();
      if (!searchRes.ok) throw new Error(searchData.error || "Bir hata oluştu");
      setSearchFavorites(searchData.favorites || []);

      // Otel favorileri
      const hotelRes = await fetch("/api/hotel-favorites");
      const hotelData = await hotelRes.json();
      if (!hotelRes.ok) throw new Error(hotelData.error || "Bir hata oluştu");
      setHotelFavorites(hotelData.favorites || []);
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSearchFavorite = async (id: string) => {
    if (!confirm("Bu aramayı favorilerinizden silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/search-favorites?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silinemedi");
      setSearchFavorites(searchFavorites.filter(f => f.id !== id));
    } catch (err) {
      alert("Silme işlemi başarısız oldu");
    }
  };

  const handleDeleteHotelFavorite = async (hotelId: string) => {
    if (!confirm("Bu oteli favorilerinizden silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/hotel-favorites?hotelId=${hotelId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silinemedi");
      setHotelFavorites(hotelFavorites.filter(f => f.hotelId !== hotelId));
    } catch (err) {
      alert("Silme işlemi başarısız oldu");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="sm:container sm:mx-auto sm:px-4 sm:py-8 container mx-auto px-2 py-4">
        <div className="sm:flex sm:gap-8 flex flex-col gap-2">
          
          <div className="flex-1 bg-white rounded-lg shadow-sm sm:p-6 p-2">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Heart className="w-6 h-6 text-red-500" />
              <h1 className="sm:text-2xl text-lg font-bold text-gray-800">Favorilerim</h1>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('flights')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === 'flights'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Plane className="w-4 h-4" />
                  Uçuş Aramaları ({searchFavorites.length})
                </button>
                <button
                  onClick={() => setActiveTab('hotels')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === 'hotels'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Oteller ({hotelFavorites.length})
                </button>
              </nav>
            </div>
            
            {loading ? (
              <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : (
              <>
                {/* Uçuş Aramaları Tab */}
                {activeTab === 'flights' && (
                  <>
                    {searchFavorites.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        Henüz favori uçuş aramanız bulunmamaktadır.
                      </div>
                    ) : (
                      <div className="sm:space-y-4 space-y-2">
                        {searchFavorites.map((favorite) => (
                          <div 
                            key={favorite.id}
                            className="border rounded-lg sm:p-4 p-2 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className="flex flex-col">
                                    <span className="text-xs sm:text-sm text-gray-500">Nereden</span>
                                    <span className="font-medium text-xs sm:text-base">{favorite.origin}</span>
                                  </div>
                                  <ArrowRight className="w-5 h-5 text-gray-400" />
                                  <div className="flex flex-col">
                                    <span className="text-xs sm:text-sm text-gray-500">Nereye</span>
                                    <span className="font-medium text-xs sm:text-base">{favorite.destination}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <Calendar className="w-5 h-5 text-gray-400" />
                                  <div className="flex flex-col">
                                    <span className="text-xs sm:text-sm text-gray-500">Tarih</span>
                                    <span className="font-medium text-xs sm:text-base">
                                      {new Date(favorite.departureDate).toLocaleDateString("tr-TR")}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs sm:text-sm text-gray-500">Eklenme</span>
                                  <span className="font-medium text-xs sm:text-base">
                                    {new Date(favorite.createdAt).toLocaleDateString("tr-TR")}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2">
                                <button
                                  onClick={() => router.push(`/flights/search?from=${favorite.origin}&to=${favorite.destination}&date=${new Date(favorite.departureDate).toISOString().split('T')[0]}`)}
                                  className="sm:px-4 sm:py-2 px-2 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-xs sm:text-base"
                                >
                                  Uçuşları Gör
                                </button>
                                <button 
                                  onClick={() => handleDeleteSearchFavorite(favorite.id)}
                                  className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-gray-100"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Oteller Tab */}
                {activeTab === 'hotels' && (
                  <>
                    {hotelFavorites.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        Henüz favori oteliniz bulunmamaktadır.
                      </div>
                    ) : (
                      <div className="sm:space-y-4 space-y-2">
                        {hotelFavorites.map((favorite: any) => (
                          <div 
                            key={favorite.id}
                            className="border rounded-lg sm:p-4 p-2 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row gap-4">
                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <h3 className="font-medium text-sm text-gray-900 mb-1">
                                      {favorite.hotelName || `Otel ID: ${favorite.hotelId}`}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <Calendar className="w-3 h-3" />
                                      <span>
                                        {new Date(favorite.createdAt).toLocaleDateString("tr-TR")}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Link
                                      href={`/hotels/${favorite.hotelId}`}
                                      className="sm:px-4 sm:py-2 px-2 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-xs sm:text-base"
                                    >
                                      Oteli Gör
                                    </Link>
                                    <button 
                                      onClick={() => handleDeleteHotelFavorite(favorite.hotelId)}
                                      className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-gray-100"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            <div className="mt-4 sm:mt-6 p-2 sm:p-4 bg-gray-50 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">
                {activeTab === 'flights' 
                  ? 'Favori uçuş aramalarınızı buradan kolayca tekrar yapabilir, fiyatları kontrol edebilirsiniz. Sık uçtuğunuz rotaları favorilerinize ekleyerek daha hızlı bilet alabilirsiniz.'
                  : 'Favori otellerinizi buradan görüntüleyebilir ve kolayca tekrar rezervasyon yapabilirsiniz.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
} 