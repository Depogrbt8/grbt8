'use client';

import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useMonitoringAlert } from '@/hooks/useMonitoringAlert';
import { useState } from 'react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { riskCount, riskItems, loading } = useMonitoringAlert('24h');
  const [showAlerts, setShowAlerts] = useState(false);

  const menuItems = [
    { href: '/grbt-8/raporlar', label: 'Raporlar', icon: '📊' },
    { href: '/grbt-8/kampanyalar', label: 'Kampanyalar', icon: '🎯' },
    { href: '/grbt-8/monitor', label: 'Monitor', icon: '🔍' },
  ];

  return (
    <aside className="w-56 border-r p-4 bg-gray-50 min-h-screen">
      <div className="text-sm text-gray-500 mb-2 font-semibold">GRBT-8 Admin</div>
      
      {/* Uyarı Bilgisi */}
      {!loading && riskCount > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowAlerts(true)}
            className="w-full text-xs px-2 py-1 rounded border border-red-400 text-red-700 hover:bg-red-50 text-left"
            aria-label={`Uyarı: ${riskCount}`}
          >
            ⚠️ Uyarı: {riskCount}
          </button>
        </div>
      )}
      
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              pathname === item.href
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="mt-4 w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm border border-gray-300 hover:bg-gray-100"
      >
        <span>🚪</span>
        <span>Çıkış</span>
      </button>

      <div className="mt-8 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-400">
          Sistem Durumu: ✅ Aktif
        </div>
      </div>

      {/* Popup Modal */}
      {showAlerts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowAlerts(false)} />
          <div className="relative bg-white rounded shadow border w-full max-w-sm p-3 text-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Riskli Birimler</div>
              <button className="text-xs text-gray-600 hover:underline" onClick={() => setShowAlerts(false)}>Kapat</button>
            </div>
            {riskItems.length === 0 ? (
              <div className="text-gray-600">Risk bulunamadı.</div>
            ) : (
              <ul className="list-disc pl-4 space-y-1">
                {riskItems.map((item) => (
                  <li key={item} className="text-red-700">{item}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
