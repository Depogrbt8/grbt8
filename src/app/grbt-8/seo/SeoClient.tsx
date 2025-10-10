'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

interface KeywordData {
  id: string;
  keyword: string;
  position: number;
  searchVolume: number;
  difficulty: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

interface PageSeoData {
  id: string;
  url: string;
  title: string;
  metaDescription: string;
  h1: string;
  score: number;
  issues: string[];
  lastChecked: string;
}

interface CompetitorData {
  id: string;
  domain: string;
  position: number;
  traffic: number;
  backlinks: number;
  domainAuthority: number;
}

export default function SeoClient() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [pages, setPages] = useState<PageSeoData[]>([]);
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - gerçek uygulamada API'den gelecek
  useEffect(() => {
    const mockKeywords: KeywordData[] = [
      { id: '1', keyword: 'ucak bileti', position: 15, searchVolume: 12000, difficulty: 65, trend: 'up', lastUpdated: '2025-10-08' },
      { id: '2', keyword: 'yurtdışı seyahat', position: 8, searchVolume: 8500, difficulty: 45, trend: 'stable', lastUpdated: '2025-10-08' },
      { id: '3', keyword: 'gurbetçi uçak bileti', position: 3, searchVolume: 3200, difficulty: 25, trend: 'up', lastUpdated: '2025-10-08' },
    ];

    const mockPages: PageSeoData[] = [
      { id: '1', url: '/', title: 'Ana Sayfa', metaDescription: 'Yurt dışı seyahat platformu', h1: 'Avrupa\'dan Türkiye\'ye Yol Arkadaşınız', score: 85, issues: ['Meta description çok kısa'], lastChecked: '2025-10-08' },
      { id: '2', url: '/hakkimizda', title: 'Hakkımızda', metaDescription: 'Gurbetbiz hakkında bilgiler', h1: 'Hakkımızda', score: 92, issues: [], lastChecked: '2025-10-08' },
    ];

    const mockCompetitors: CompetitorData[] = [
      { id: '1', domain: 'example1.com', position: 1, traffic: 150000, backlinks: 2500, domainAuthority: 78 },
      { id: '2', domain: 'example2.com', position: 2, traffic: 98000, backlinks: 1800, domainAuthority: 65 },
    ];

    setTimeout(() => {
      setKeywords(mockKeywords);
      setPages(mockPages);
      setCompetitors(mockCompetitors);
      setLoading(false);
    }, 1000);
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'keywords', label: 'Anahtar Kelimeler', icon: '🔑' },
    { id: 'pages', label: 'Sayfa Analizi', icon: '📄' },
    { id: 'competitors', label: 'Rakip Analizi', icon: '🏆' },
    { id: 'analytics', label: 'SEO Analitik', icon: '📈' },
  ];

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Toplam Anahtar Kelime */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Toplam Anahtar Kelime</p>
            <p className="text-2xl font-bold text-gray-900">{keywords.length}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <span className="text-blue-600 text-xl">🔑</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">+2 bu hafta</p>
      </div>

      {/* Ortalama Pozisyon */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Ortalama Pozisyon</p>
            <p className="text-2xl font-bold text-gray-900">
              {keywords.length > 0 ? (keywords.reduce((sum, k) => sum + k.position, 0) / keywords.length).toFixed(1) : '0'}
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <span className="text-green-600 text-xl">📈</span>
          </div>
        </div>
        <p className="text-sm text-green-600 mt-2">↗ +2.3 pozisyon</p>
      </div>

      {/* Toplam Trafik */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Aylık Trafik Tahmini</p>
            <p className="text-2xl font-bold text-gray-900">
              {keywords.reduce((sum, k) => sum + k.searchVolume, 0).toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-purple-100 rounded-full">
            <span className="text-purple-600 text-xl">👥</span>
          </div>
        </div>
        <p className="text-sm text-green-600 mt-2">↗ +15% bu ay</p>
      </div>

      {/* SEO Skoru */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Ortalama SEO Skoru</p>
            <p className="text-2xl font-bold text-gray-900">
              {pages.length > 0 ? (pages.reduce((sum, p) => sum + p.score, 0) / pages.length).toFixed(0) : '0'}
            </p>
          </div>
          <div className="p-3 bg-orange-100 rounded-full">
            <span className="text-orange-600 text-xl">🎯</span>
          </div>
        </div>
        <p className="text-sm text-green-600 mt-2">↗ +5 puan</p>
      </div>
    </div>
  );

  const renderKeywords = () => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Anahtar Kelimeler</h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            + Yeni Kelime Ekle
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anahtar Kelime</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pozisyon</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arama Hacmi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zorluk</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {keywords.map((keyword) => (
              <tr key={keyword.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{keyword.keyword}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    keyword.position <= 10 ? 'bg-green-100 text-green-800' : 
                    keyword.position <= 20 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    #{keyword.position}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {keyword.searchVolume.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className={`h-2 rounded-full ${
                          keyword.difficulty <= 30 ? 'bg-green-500' : 
                          keyword.difficulty <= 60 ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${keyword.difficulty}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-900">{keyword.difficulty}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                    keyword.trend === 'up' ? 'bg-green-100 text-green-800' : 
                    keyword.trend === 'down' ? 'bg-red-100 text-red-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {keyword.trend === 'up' ? '↗' : keyword.trend === 'down' ? '↘' : '→'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Düzenle</button>
                  <button className="text-red-600 hover:text-red-900">Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPages = () => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Sayfa SEO Analizi</h3>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
            🔍 Tüm Sayfaları Tara
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sayfa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SEO Skoru</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sorunlar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son Kontrol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pages.map((page) => (
              <tr key={page.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{page.title}</div>
                  <div className="text-sm text-gray-500">{page.url}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className={`h-2 rounded-full ${
                          page.score >= 90 ? 'bg-green-500' : 
                          page.score >= 70 ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${page.score}%` }}
                      ></div>
                    </div>
                    <span className={`text-sm font-medium ${
                      page.score >= 90 ? 'text-green-600' : 
                      page.score >= 70 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {page.score}/100
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {page.issues.length === 0 ? (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Sorun Yok
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      {page.issues.length} sorun
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(page.lastChecked).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Analiz Et</button>
                  <button className="text-green-600 hover:text-green-900">Düzenle</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCompetitors = () => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Rakip Analizi</h3>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
            + Rakip Ekle
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pozisyon</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aylık Trafik</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Backlink</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain Authority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {competitors.map((competitor) => (
              <tr key={competitor.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{competitor.domain}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    #{competitor.position}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {competitor.traffic.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {competitor.backlinks.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className={`h-2 rounded-full ${
                          competitor.domainAuthority >= 70 ? 'bg-green-500' : 
                          competitor.domainAuthority >= 50 ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${competitor.domainAuthority}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-900">{competitor.domainAuthority}/100</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Analiz Et</button>
                  <button className="text-red-600 hover:text-red-900">Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Organik Trafik Trendi */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Organik Trafik Trendi</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Grafik buraya gelecek</p>
        </div>
      </div>

      {/* Anahtar Kelime Pozisyon Trendi */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Anahtar Kelime Pozisyon Trendi</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Grafik buraya gelecek</p>
        </div>
      </div>

      {/* Top Performans Gösteren Sayfalar */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performans Sayfalar</h3>
        <div className="space-y-3">
          {pages.map((page, index) => (
            <div key={page.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  {index + 1}
                </span>
                <div>
                  <div className="text-sm font-medium text-gray-900">{page.title}</div>
                  <div className="text-xs text-gray-500">{page.url}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{page.score}/100</div>
                <div className="text-xs text-gray-500">SEO Skoru</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Son Aktiviteler */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Aktiviteler</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">"gurbetçi uçak bileti" anahtar kelimesi #3 pozisyona yükseldi</p>
              <p className="text-xs text-gray-500">2 saat önce</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Ana sayfa SEO skoru 85'ten 88'e yükseldi</p>
              <p className="text-xs text-gray-500">5 saat önce</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Yeni rakip "example.com" eklendi</p>
              <p className="text-xs text-gray-500">1 gün önce</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <AdminSidebar />
        <main className="flex-1">
          <div className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">SEO verileri yükleniyor...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <main className="flex-1">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">SEO Yönetimi</h1>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'keywords' && renderKeywords()}
            {activeTab === 'pages' && renderPages()}
            {activeTab === 'competitors' && renderCompetitors()}
            {activeTab === 'analytics' && renderAnalytics()}
          </div>
        </div>
      </main>
    </div>
  );
}
