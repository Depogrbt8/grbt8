'use client'

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import { logger } from '@/lib/logger';

// Dynamic import to prevent SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => <div className="p-8 text-center">API dokümantasyonu yükleniyor...</div>
});

export default function ApiDocsPage() {
  const [swaggerDoc, setSwaggerDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSwaggerDoc = async () => {
      try {
        const response = await fetch('/api/docs');
        if (!response.ok) {
          throw new Error('API dokümantasyonu yüklenemedi');
        }
        const doc = await response.json();
        setSwaggerDoc(doc);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
      } finally {
        setLoading(false);
      }
    };

    fetchSwaggerDoc();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">API dokümantasyonu yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Hata Oluştu</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">API Dokümantasyonu</h1>
              <p className="text-gray-600 mt-1">GRBT8 Seyahat Sitesi API Referansı</p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                ← Ana Sayfaya Dön
              </a>
              <a
                href="/api/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
              >
                JSON Formatında Görüntüle
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {swaggerDoc && (
            <SwaggerUI
              spec={swaggerDoc}
              docExpansion="list"
              defaultModelsExpandDepth={2}
              defaultModelExpandDepth={2}
              displayRequestDuration={true}
              tryItOutEnabled={true}
              requestInterceptor={(request) => {
                // CORS için gerekli header'ları ekle
                request.headers['Content-Type'] = 'application/json';
                return request;
              }}
              responseInterceptor={(response) => {
                // Response'u işle
                return response;
              }}
              onComplete={() => {
                // Swagger UI yüklendiğinde çalışır
                logger.debug('Swagger UI yüklendi');
              }}
            />
          )}
        </div>
      </div>

      {/* Footer bilgileri */}
      <div className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">API Bilgileri</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• OpenAPI 3.0.0 uyumlu</li>
                <li>• RESTful API tasarımı</li>
                <li>• JSON formatında veri alışverişi</li>
                <li>• JWT token tabanlı kimlik doğrulama</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Güvenlik</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• HTTPS zorunlu</li>
                <li>• Rate limiting aktif</li>
                <li>• CORS koruması</li>
                <li>• Input validation</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Destek</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Email: destek@grbt8.com</li>
                <li>• Dokümantasyon: /api/docs</li>
                <li>• Status: https://status.grbt8.com</li>
                <li>• GitHub: github.com/grbt8</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
