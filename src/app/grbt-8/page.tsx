import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import { isAdminEmail } from '@/lib/adminAuth';

export default async function GRBT8Dashboard() {
  const bypass = (process.env.ADMIN_BYPASS || '').toLowerCase() === 'true';
  const session = await getServerSession(authOptions);

  if (!bypass && (!session?.user?.email || !isAdminEmail(session.user.email))) {
    redirect('/grbt-8/giris');
  }
  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <main className="flex-1">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            GRBT-8 Dashboard
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Raporlar Kartı */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                📊 Satış Raporları
              </h2>
              <p className="text-gray-600 mb-4">
                Detaylı satış analizleri ve performans metrikleri
              </p>
              <a 
                href="/grbt-8/raporlar" 
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Raporları Görüntüle
              </a>
            </div>

            {/* Kampanyalar Kartı */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                🎯 Kampanya Yönetimi
              </h2>
              <p className="text-gray-600 mb-4">
                Banner kampanyaları ve promosyon yönetimi
              </p>
              <a 
                href="/grbt-8/kampanyalar" 
                className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Kampanyaları Yönet
              </a>
            </div>

            {/* Monitor Kartı */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                🔍 Sistem İzleme
              </h2>
              <p className="text-gray-600 mb-4">
                Performans metrikleri ve güvenlik durumu
              </p>
              <a 
                href="/grbt-8/monitor" 
                className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                Sistemi İzle
              </a>
            </div>

            {/* SEO Kartı */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                🚀 SEO Yönetimi
              </h2>
              <p className="text-gray-600 mb-4">
                Anahtar kelime analizi ve SEO optimizasyonu
              </p>
              <a 
                href="/grbt-8/seo" 
                className="inline-block bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
              >
                SEO'yu Yönet
              </a>
            </div>

            {/* Araç Rezervasyonları Kartı */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                🚗 Araç Rezervasyonları
              </h2>
              <p className="text-gray-600 mb-4">
                Araç kiralama rezervasyonlarını görüntüle ve yönet
              </p>
              <a 
                href="/grbt-8/arac-rezervasyonlari" 
                className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Rezervasyonları Görüntüle
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


