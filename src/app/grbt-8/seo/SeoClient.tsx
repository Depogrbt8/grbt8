'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

interface SeoSettings {
  id?: string;
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string;
  googleAnalytics?: string;
  googleSearchConsole?: string;
  facebookPixel?: string;
  bingWebmaster?: string;
  twitterSite?: string;
  twitterCreator?: string;
  schemaOrgJson?: string;
  robotsTxt?: string;
  sitemapUrl?: string;
  faviconUrl?: string;
  logoUrl?: string;
  ogImageUrl?: string;
  twitterImageUrl?: string;
}

interface SeoPage {
  id?: string;
  url: string;
  title: string;
  description?: string;
  keywords?: string;
  h1?: string;
  h2?: string;
  h3?: string;
  metaRobots?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  schemaJson?: string;
  seoScore?: number;
  lastChecked?: string;
}

interface SeoKeyword {
  id?: string;
  keyword: string;
  targetUrl?: string;
  currentPosition?: number;
  targetPosition?: number;
  searchVolume?: number;
  difficulty?: number;
  cpc?: number;
  trend?: string;
  lastChecked?: string;
}

interface Backlink {
  id?: string;
  url: string;
  domain: string;
  anchorText?: string;
  type?: string;
  status?: string;
  qualityScore?: number;
  domainAuthority?: number;
  pageAuthority?: number;
  notes?: string;
  targetPage?: string;
  lastChecked?: string;
  createdAt?: string;
}

export default function SeoClient() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SeoSettings>({
    siteName: '',
    siteDescription: '',
    siteUrl: '',
    defaultTitle: '',
    defaultDescription: '',
    defaultKeywords: '',
  });
  const [pages, setPages] = useState<SeoPage[]>([]);
  const [keywords, setKeywords] = useState<SeoKeyword[]>([]);
  const [editingPage, setEditingPage] = useState<SeoPage | null>(null);
  const [editingKeyword, setEditingKeyword] = useState<SeoKeyword | null>(null);
  const [analyzeUrl, setAnalyzeUrl] = useState('');
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkKeywordsText, setBulkKeywordsText] = useState('');
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [editingBacklink, setEditingBacklink] = useState<Backlink | null>(null);
  const [showBulkAddBacklink, setShowBulkAddBacklink] = useState(false);
  const [bulkBacklinksText, setBulkBacklinksText] = useState('');

  const tabs = [
    { id: 'general', label: 'Genel SEO', icon: '🌐' },
    { id: 'meta', label: 'Meta Tags', icon: '<>' },
    { id: 'social', label: 'Sosyal Medya', icon: 'f' },
    { id: 'security', label: 'Güvenlik', icon: '🛡️' },
    { id: 'schema', label: 'Schema.org', icon: '⚙️' },
    { id: 'analytics', label: 'Analiz', icon: '📊' },
    { id: 'backlinks', label: 'Backlink\'ler', icon: '🔗' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsRes, pagesRes, keywordsRes, backlinksRes] = await Promise.all([
        fetch('/api/seo/settings'),
        fetch('/api/seo/pages'),
        fetch('/api/seo/keywords'),
        fetch('/api/seo/backlinks'),
      ]);

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }

      if (pagesRes.ok) {
        const pagesData = await pagesRes.json();
        setPages(pagesData);
      }

      if (keywordsRes.ok) {
        const keywordsData = await keywordsRes.json();
        setKeywords(keywordsData);
      }

      if (backlinksRes.ok) {
        const backlinksData = await backlinksRes.json();
        setBacklinks(backlinksData);
      }
    } catch (error) {
      console.error('Data loading error:', error);
    }
    setLoading(false);
  };

  const saveSettings = async (data: SeoSettings) => {
    try {
      setLoading(true);
      const response = await fetch('/api/seo/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, id: settings.id }),
      });

      if (response.ok) {
        const savedSettings = await response.json();
        setSettings(savedSettings);
        alert('Ayarlar kaydedildi!');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }));
        console.error('Save settings error:', errorData);
        alert(`Kaydetme hatası: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Save settings error:', error);
      alert(`Kaydetme hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
    }
  };

  const savePage = async (data: SeoPage) => {
    try {
      const response = await fetch('/api/seo/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const savedPage = await response.json();
        setPages(prev => prev.filter(p => p.url !== data.url).concat(savedPage));
        setEditingPage(null);
        alert('Sayfa kaydedildi!');
      }
    } catch (error) {
      console.error('Save page error:', error);
      alert('Kaydetme hatası!');
    }
  };

  const saveKeyword = async (data: SeoKeyword) => {
    try {
      const response = await fetch('/api/seo/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const savedKeyword = await response.json();
        setKeywords(prev => prev.filter(k => k.keyword !== data.keyword).concat(savedKeyword));
        setEditingKeyword(null);
        alert('Anahtar kelime kaydedildi!');
      }
    } catch (error) {
      console.error('Save keyword error:', error);
      alert('Kaydetme hatası!');
    }
  };

  const saveBulkKeywords = async () => {
    if (!bulkKeywordsText.trim()) {
      alert('Anahtar kelime girin!');
      return;
    }

    setLoading(true);
    try {
      // Satırlara ayır ve boş satırları filtrele
      const keywordList = bulkKeywordsText
        .split('\n')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      if (keywordList.length === 0) {
        alert('Geçerli anahtar kelime bulunamadı!');
        setLoading(false);
        return;
      }

      let added = 0;
      let updated = 0;
      let errors = 0;

      // Her anahtar kelimeyi tek tek ekle
      for (const keyword of keywordList) {
        try {
          const response = await fetch('/api/seo/keywords', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              keyword: keyword,
              trend: 'stable',
            }),
          });

          if (response.ok) {
            const savedKeyword = await response.json();
            // Mevcut listede var mı kontrol et
            const existing = keywords.find(k => k.keyword === keyword);
            if (existing) {
              updated++;
            } else {
              added++;
            }
            // Listeyi güncelle
            setKeywords(prev => prev.filter(k => k.keyword !== keyword).concat(savedKeyword));
          } else {
            errors++;
          }
        } catch (error) {
          errors++;
          console.error(`Keyword ekleme hatası (${keyword}):`, error);
        }
      }

      // Sonuçları göster ve listeyi yeniden yükle
      await loadData();
      setBulkKeywordsText('');
      setShowBulkAdd(false);
      alert(`✅ ${added} yeni kelime eklendi\n🔄 ${updated} kelime güncellendi\n❌ ${errors} hata`);
    } catch (error) {
      console.error('Bulk add error:', error);
      alert('Toplu ekleme hatası!');
    } finally {
      setLoading(false);
    }
  };

  const analyzePage = async () => {
    if (!analyzeUrl) {
      alert('URL girin!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/seo/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: analyzeUrl }),
      });

      if (response.ok) {
        const analysis = await response.json();
        setEditingPage(analysis);
        alert('Sayfa analiz edildi!');
      } else {
        alert('Analiz hatası!');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Analiz hatası!');
    }
    setLoading(false);
  };

  const deletePage = async (id: string) => {
    if (!confirm('Bu sayfayı silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/seo/pages?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPages(prev => prev.filter(p => p.id !== id));
        alert('Sayfa silindi!');
      }
    } catch (error) {
      console.error('Delete page error:', error);
      alert('Silme hatası!');
    }
  };

  const deleteKeyword = async (id: string) => {
    if (!confirm('Bu anahtar kelimeyi silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/seo/keywords?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setKeywords(prev => prev.filter(k => k.id !== id));
        alert('Anahtar kelime silindi!');
      }
    } catch (error) {
      console.error('Delete keyword error:', error);
      alert('Silme hatası!');
    }
  };

  const renderGeneralSeo = () => (
    <div className="space-y-6">
      {/* SEO Dashboard Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ortalama Pozisyon</p>
              <p className="text-2xl font-bold text-gray-900">
                {keywords.length > 0 ? (keywords.reduce((sum, k) => sum + (k.currentPosition || 0), 0) / keywords.length).toFixed(1) : '0'}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-green-600 text-xl">📈</span>
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">↗ +2.3 pozisyon</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aylık Trafik Tahmini</p>
              <p className="text-2xl font-bold text-gray-900">
                {keywords.reduce((sum, k) => sum + (k.searchVolume || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <span className="text-purple-600 text-xl">👥</span>
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">↗ +15% bu ay</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ortalama SEO Skoru</p>
              <p className="text-2xl font-bold text-gray-900">
                {pages.length > 0 ? (pages.reduce((sum, p) => sum + (p.seoScore || 0), 0) / pages.length).toFixed(0) : '0'}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <span className="text-orange-600 text-xl">🎯</span>
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">↗ +5 puan</p>
        </div>
      </div>

      {/* Site Ayarları */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Genel Site Ayarları</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Adı</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({...settings, siteName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site URL</label>
            <input
              type="url"
              value={settings.siteUrl}
              onChange={(e) => setSettings({...settings, siteUrl: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Açıklaması</label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Varsayılan Başlık</label>
            <input
              type="text"
              value={settings.defaultTitle}
              onChange={(e) => setSettings({...settings, defaultTitle: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Varsayılan Açıklama</label>
            <textarea
              value={settings.defaultDescription}
              onChange={(e) => setSettings({...settings, defaultDescription: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Varsayılan Anahtar Kelimeler</label>
            <input
              type="text"
              value={settings.defaultKeywords}
              onChange={(e) => setSettings({...settings, defaultKeywords: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="kelime1, kelime2, kelime3"
            />
          </div>
        </div>
        <button
          onClick={() => saveSettings(settings)}
          disabled={loading}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      {/* Son Aktiviteler */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
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
              <p className="text-sm text-gray-900">Yeni sayfa analiz edildi: /hakkimizda</p>
              <p className="text-xs text-gray-500">1 gün önce</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMetaTags = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Sayfa Meta Tags</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={analyzeUrl}
              onChange={(e) => setAnalyzeUrl(e.target.value)}
              placeholder="/sayfa-url"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={analyzePage}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Analiz...' : 'Analiz Et'}
            </button>
          </div>
        </div>

        {editingPage && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-gray-900 mb-3">Sayfa Analizi: {editingPage.url}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                <input
                  type="text"
                  value={editingPage.title || ''}
                  onChange={(e) => setEditingPage({...editingPage, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <input
                  type="text"
                  value={editingPage.description || ''}
                  onChange={(e) => setEditingPage({...editingPage, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">H1</label>
                <input
                  type="text"
                  value={editingPage.h1 || ''}
                  onChange={(e) => setEditingPage({...editingPage, h1: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SEO Skoru</label>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className={`h-2 rounded-full ${
                        (editingPage.seoScore || 0) >= 80 ? 'bg-green-500' : 
                        (editingPage.seoScore || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${editingPage.seoScore || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{editingPage.seoScore || 0}/100</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => savePage(editingPage)}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Kaydet
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Başlık</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SEO Skoru</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pages.map((page) => (
                <tr key={page.id}>
                  <td className="px-4 py-4 text-sm text-gray-900">{page.url}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{page.title}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            (page.seoScore || 0) >= 80 ? 'bg-green-500' : 
                            (page.seoScore || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${page.seoScore || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{page.seoScore || 0}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium">
                    <button
                      onClick={() => setEditingPage(page)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => page.id && deletePage(page.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSocialMedia = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sosyal Medya Ayarları</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Facebook Pixel ID</label>
            <input
              type="text"
              value={settings.facebookPixel || ''}
              onChange={(e) => setSettings({...settings, facebookPixel: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bing Webmaster Tools</label>
            <input
              type="text"
              value={settings.bingWebmaster || ''}
              onChange={(e) => setSettings({...settings, bingWebmaster: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Verification code"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Twitter Site</label>
            <input
              type="text"
              value={settings.twitterSite || ''}
              onChange={(e) => setSettings({...settings, twitterSite: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="@username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Twitter Creator</label>
            <input
              type="text"
              value={settings.twitterCreator || ''}
              onChange={(e) => setSettings({...settings, twitterCreator: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="@username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">OG Image URL</label>
            <input
              type="url"
              value={settings.ogImageUrl || ''}
              onChange={(e) => setSettings({...settings, ogImageUrl: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          onClick={() => saveSettings(settings)}
          disabled={loading}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Güvenlik Ayarları</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Robots.txt</label>
            <textarea
              value={settings.robotsTxt || ''}
              onChange={(e) => setSettings({...settings, robotsTxt: e.target.value})}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sitemap URL</label>
              <input
                type="url"
                value={settings.sitemapUrl || ''}
                onChange={(e) => setSettings({...settings, sitemapUrl: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Favicon URL</label>
              <input
                type="url"
                value={settings.faviconUrl || ''}
                onChange={(e) => setSettings({...settings, faviconUrl: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <button
          onClick={() => saveSettings(settings)}
          disabled={loading}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </div>
  );

  const renderSchema = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Schema.org Yapılandırması</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Schema.org JSON</label>
          <textarea
            value={settings.schemaOrgJson || ''}
            onChange={(e) => setSettings({...settings, schemaOrgJson: e.target.value})}
            rows={15}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder='{"@context": "https://schema.org", "@type": "Organization", ...}'
          />
        </div>
        <button
          onClick={() => saveSettings(settings)}
          disabled={loading}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </div>
  );

  // Backlink yönetimi fonksiyonları
  const saveBacklink = async (backlink: Backlink) => {
    try {
      setLoading(true);
      const response = await fetch('/api/seo/backlinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backlink),
      });

      if (response.ok) {
        const savedBacklink = await response.json();
        setBacklinks([...backlinks.filter(b => b.id !== savedBacklink.id), savedBacklink]);
        setEditingBacklink(null);
        alert('Backlink kaydedildi!');
        loadData();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }));
        alert(`Kaydetme hatası: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Save backlink error:', error);
      alert(`Kaydetme hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteBacklink = async (id: string) => {
    if (!confirm('Bu backlink\'i silmek istediğinizden emin misiniz?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/seo/backlinks?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBacklinks(backlinks.filter(b => b.id !== id));
        alert('Backlink silindi!');
      } else {
        alert('Silme hatası!');
      }
    } catch (error) {
      console.error('Delete backlink error:', error);
      alert('Silme hatası!');
    } finally {
      setLoading(false);
    }
  };

  const bulkAddBacklinks = async () => {
    if (!bulkBacklinksText.trim()) {
      alert('Lütfen en az bir backlink URL\'si girin!');
      return;
    }

    try {
      setLoading(true);
      const lines = bulkBacklinksText.split('\n').filter(line => line.trim());
      const backlinksData = lines.map(line => {
        const url = line.trim();
        try {
          const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
          const domain = urlObj.hostname.replace('www.', '');
          return {
            url: url.startsWith('http') ? url : `https://${url}`,
            domain,
            status: 'active',
            type: 'dofollow',
          };
        } catch (e) {
          return {
            url: url.startsWith('http') ? url : `https://${url}`,
            domain: url.split('/')[0].replace('www.', ''),
            status: 'active',
            type: 'dofollow',
          };
        }
      });

      const response = await fetch('/api/seo/backlinks/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backlinks: backlinksData }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Başarılı! ${result.added} yeni, ${result.updated} güncellenmiş backlink eklendi.`);
        setBulkBacklinksText('');
        setShowBulkAddBacklink(false);
        loadData();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }));
        alert(`Hata: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Bulk add backlinks error:', error);
      alert(`Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
    }
  };

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Analitik Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organik Trafik Trendi */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Organik Trafik Trendi</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <p className="text-gray-500">Grafik buraya gelecek</p>
              <p className="text-sm text-gray-400 mt-1">Son 30 gün</p>
            </div>
          </div>
        </div>

        {/* Anahtar Kelime Pozisyon Trendi */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Anahtar Kelime Pozisyon Trendi</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-500">Grafik buraya gelecek</p>
              <p className="text-sm text-gray-400 mt-1">Son 7 gün</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performans Gösteren Sayfalar */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performans Sayfalar</h3>
        <div className="space-y-3">
          {pages.slice(0, 5).map((page, index) => (
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
                <div className="text-sm font-medium text-gray-900">{page.seoScore || 0}/100</div>
                <div className="text-xs text-gray-500">SEO Skoru</div>
              </div>
            </div>
          ))}
          {pages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📄</div>
              <p>Henüz analiz edilmiş sayfa yok</p>
            </div>
          )}
        </div>
      </div>

      {/* Analitik Ayarları */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analitik Ayarları</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Google Analytics ID</label>
            <input
              type="text"
              value={settings.googleAnalytics || ''}
              onChange={(e) => setSettings({...settings, googleAnalytics: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="GA-XXXXXXXXX-X"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Google Search Console</label>
            <input
              type="text"
              value={settings.googleSearchConsole || ''}
              onChange={(e) => setSettings({...settings, googleSearchConsole: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Verification code"
            />
          </div>
        </div>
        <button
          onClick={() => saveSettings(settings)}
          disabled={loading}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Anahtar Kelimeler</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowBulkAdd(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              📝 Toplu Ekle
            </button>
            <button
              onClick={() => setEditingKeyword({ keyword: '', targetPosition: 1 })}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              + Ekle
            </button>
          </div>
        </div>

        {showBulkAdd && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4 border-2 border-blue-200">
            <h4 className="font-medium text-gray-900 mb-3">Toplu Anahtar Kelime Ekle</h4>
            <p className="text-sm text-gray-600 mb-3">
              Her satıra bir anahtar kelime yazın. Boş satırlar otomatik olarak atlanacaktır.
            </p>
            <textarea
              value={bulkKeywordsText}
              onChange={(e) => setBulkKeywordsText(e.target.value)}
              placeholder="Almanya Türkiye ucuz uçak bileti&#10;Fransa Türkiye uçuş fırsatları&#10;Belçika Türkiye uçak bileti kampanyası&#10;..."
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => {
                  setShowBulkAdd(false);
                  setBulkKeywordsText('');
                }}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={saveBulkKeywords}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Ekleniyor...' : '✅ Tümünü Ekle'}
              </button>
            </div>
          </div>
        )}

        {editingKeyword && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-gray-900 mb-3">Anahtar Kelime Ekle/Düzenle</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Anahtar Kelime</label>
                <input
                  type="text"
                  value={editingKeyword.keyword}
                  onChange={(e) => setEditingKeyword({...editingKeyword, keyword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hedef Pozisyon</label>
                <input
                  type="number"
                  value={editingKeyword.targetPosition || ''}
                  onChange={(e) => setEditingKeyword({...editingKeyword, targetPosition: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arama Hacmi</label>
                <input
                  type="number"
                  value={editingKeyword.searchVolume || ''}
                  onChange={(e) => setEditingKeyword({...editingKeyword, searchVolume: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
            <button
              onClick={() => saveKeyword(editingKeyword)}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Kaydet
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Anahtar Kelime</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hedef Pozisyon</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Arama Hacmi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {keywords.map((keyword) => (
                <tr key={keyword.id}>
                  <td className="px-4 py-4 text-sm text-gray-900">{keyword.keyword}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {keyword.targetPosition ? `#${keyword.targetPosition}` : '-'}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {keyword.searchVolume ? keyword.searchVolume.toLocaleString() : '-'}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium">
                    <button
                      onClick={() => setEditingKeyword(keyword)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => keyword.id && deleteKeyword(keyword.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const addPredefinedBacklinks = async () => {
    if (!confirm('Önceden tanımlanmış 13 backlink eklenecek. Devam etmek istiyor musunuz?')) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/seo/backlinks/add-predefined', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ Başarılı!\n\n${result.added} yeni backlink eklendi\n${result.updated} backlink güncellendi${result.errors > 0 ? `\n❌ ${result.errors} hata` : ''}`);
        loadData();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }));
        alert(`Hata: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Add predefined backlinks error:', error);
      alert(`Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
    }
  };

  const renderBacklinks = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Backlink Yönetimi</h3>
          <div className="flex gap-2">
          <button
              onClick={addPredefinedBacklinks}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              title="Havayolu şirketleri ve seyahat siteleri"
            >
              ⚡ Hazır Backlink'leri Ekle (13)
            </button>
          <button
              onClick={() => setShowBulkAddBacklink(!showBulkAddBacklink)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              {showBulkAddBacklink ? 'İptal' : 'Toplu Ekle'}
            </button>
            <button
              onClick={() => setEditingBacklink({
                url: '',
                domain: '',
                status: 'active',
                type: 'dofollow',
                qualityScore: 0,
              })}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              + Yeni Backlink
            </button>
          </div>
        </div>

        {showBulkAddBacklink && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Toplu Backlink Ekle</h4>
            <p className="text-sm text-gray-600 mb-3">Her satıra bir backlink URL'si yazın:</p>
            <textarea
              value={bulkBacklinksText}
              onChange={(e) => setBulkBacklinksText(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm mb-3"
              placeholder="https://example.com/page1&#10;https://example2.com/page2&#10;..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setBulkBacklinksText('');
                  setShowBulkAddBacklink(false);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={bulkAddBacklinks}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Ekleniyor...' : 'Ekle'}
              </button>
            </div>
          </div>
        )}

        {editingBacklink && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-4">
              {editingBacklink.id ? 'Backlink Düzenle' : 'Yeni Backlink Ekle'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
                <input
                  type="url"
                  value={editingBacklink.url}
                  onChange={(e) => setEditingBacklink({...editingBacklink, url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/page"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                <input
                  type="text"
                  value={editingBacklink.domain}
                  onChange={(e) => setEditingBacklink({...editingBacklink, domain: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Anchor Text</label>
                <input
                  type="text"
                  value={editingBacklink.anchorText || ''}
                  onChange={(e) => setEditingBacklink({...editingBacklink, anchorText: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={editingBacklink.type || 'dofollow'}
                  onChange={(e) => setEditingBacklink({...editingBacklink, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="dofollow">Dofollow</option>
                  <option value="nofollow">Nofollow</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editingBacklink.status || 'active'}
                  onChange={(e) => setEditingBacklink({...editingBacklink, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="removed">Removed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quality Score (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingBacklink.qualityScore || 0}
                  onChange={(e) => setEditingBacklink({...editingBacklink, qualityScore: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Page</label>
                <input
                  type="text"
                  value={editingBacklink.targetPage || ''}
                  onChange={(e) => setEditingBacklink({...editingBacklink, targetPage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="/blog/example"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={editingBacklink.notes || ''}
                  onChange={(e) => setEditingBacklink({...editingBacklink, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditingBacklink(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => saveBacklink(editingBacklink)}
                disabled={loading || !editingBacklink.url}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {backlinks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Henüz backlink eklenmemiş. Yeni backlink eklemek için yukarıdaki butona tıklayın.
                  </td>
                </tr>
              ) : (
                backlinks.map((backlink) => (
                  <tr key={backlink.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <a
                        href={backlink.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm truncate max-w-xs block"
                        title={backlink.url}
                      >
                        {backlink.url}
                      </a>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{backlink.domain}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        backlink.type === 'dofollow' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {backlink.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        backlink.status === 'active' ? 'bg-green-100 text-green-800' :
                        backlink.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        backlink.status === 'removed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {backlink.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{backlink.qualityScore || 0}/100</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setEditingBacklink(backlink)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => backlink.id && deleteBacklink(backlink.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (loading && !settings.siteName) {
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
            {activeTab === 'general' && renderGeneralSeo()}
            {activeTab === 'meta' && renderMetaTags()}
            {activeTab === 'social' && renderSocialMedia()}
            {activeTab === 'security' && renderSecurity()}
            {activeTab === 'schema' && renderSchema()}
            {activeTab === 'analytics' && renderAnalytics()}
            {activeTab === 'backlinks' && renderBacklinks()}
          </div>
        </div>
      </main>
    </div>
  );
}