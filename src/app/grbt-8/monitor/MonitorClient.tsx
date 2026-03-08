'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

export default function MonitorClient() {
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d'>('24h');
  const [perf, setPerf] = useState<any>(null);
  const [sys, setSys] = useState<any>(null);
  const [errs, setErrs] = useState<any>(null);
  const [security, setSecurity] = useState<any>(null);
  const [perfRaw, setPerfRaw] = useState<any[]>([]);
  const [errsRaw, setErrsRaw] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/monitoring/performance?timeframe=${timeframe}`).then(r => r.json()).catch(() => null),
      fetch(`/api/monitoring/system?timeframe=${timeframe}`).then(r => r.json()).catch(() => null),
      fetch(`/api/monitoring/errors?timeframe=${timeframe}`).then(r => r.json()).catch(() => null),
      fetch(`/api/monitoring/security?timeframe=${timeframe}`).then(r => r.json()).catch(() => null),
    ]).then(([p, s, e, sec]) => {
      setPerf(p?.data?.stats || null);
      setPerfRaw(p?.data?.recentMetrics || []);
      setSys(s?.data?.stats || null);
      setErrs(e?.data?.stats || null);
      setErrsRaw(e?.data?.recentErrors || []);
      setSecurity(sec?.data?.stats || null);
      setLoading(false);
    });
  }, [timeframe]);

  const slowPages = useMemo(() => {
    const arr: Array<{ page: string; avg: number }> = [];
    (perf?.slowestPages || []).forEach((p: any) => arr.push({ page: p.page, avg: Math.round(p.avgTime) }));
    return arr.slice(0, 8);
  }, [perf]);

  const errorRate = useMemo(() => {
    const totalReq = perf?.totalRequests || 0;
    const totalErr = errs?.totalErrors || 0;
    return totalReq > 0 ? (totalErr / totalReq) * 100 : 0;
  }, [perf, errs]);

  const cpuVal = sys?.averageCpuUsage != null ? sys.averageCpuUsage : null;
  const slo = useMemo(() => {
    const lcp = Math.round(perf?.averageLCP || 0);
    const resp = Math.round(sys?.averageResponseTime || 0);
    const cpu = cpuVal != null ? Math.round(cpuVal) : null;
    const mem = Math.round(sys?.averageMemoryUsage || 0);
    const secScore = security?.securityScore || 100;
    return {
      errorRate: { value: errorRate, ok: errorRate < 1 },
      lcp: { value: lcp, ok: lcp < 2500 },
      resp: { value: resp, ok: resp < 2000 },
      cpu: { value: cpu, ok: cpu == null ? true : cpu < 80 },
      mem: { value: mem, ok: mem < 85 },
      security: { value: secScore, ok: secScore >= 70 },
    };
  }, [errorRate, perf, sys, security, cpuVal]);

  const errTypes = useMemo(() => {
    const map = errs?.errorsByType || {};
    return Object.keys(map)
      .map(k => ({ type: k, count: map[k] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [errs]);

  const topErrorPages = useMemo(() => {
    return (errs?.topErrorPages || []).slice(0, 6);
  }, [errs]);

  if (loading) return <div className="p-4">Monitoring verileri yükleniyor...</div>;

  const riskItems = [
    !slo.errorRate.ok && 'Error Rate (>1%)',
    !slo.lcp.ok && 'LCP (>=2500 ms)',
    !slo.resp.ok && 'Response Time (>=2000 ms)',
    !slo.cpu.ok && 'CPU (>=80%)',
    !slo.mem.ok && 'Memory (>=85%)',
    !slo.security.ok && 'Security Score (<70)',
  ].filter(Boolean) as string[];
  const riskCount = riskItems.length;

  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <main className="flex-1">
        <div className={`p-6 space-y-3 text-sm ${security?.isRisky ? 'border-2 border-red-500 bg-red-50' : ''}`}>
          <div className="flex items-center justify-between">        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold">Monitor</h1>
          {riskCount > 0 && (
            <button
              onClick={() => setShowAlerts(true)}
              className="text-xs px-2 py-0.5 rounded border border-red-400 text-red-700 hover:bg-red-50"
              aria-label={`Uyarı: ${riskCount}`}
            >
              Uyarı: {riskCount}
            </button>
          )}
        </div>
        <select className="border rounded px-2 py-1 text-xs" value={timeframe} onChange={e => setTimeframe(e.target.value as any)}>
          <option value="1h">1 saat</option>
          <option value="24h">24 saat</option>
          <option value="7d">7 gün</option>
        </select>
      </div>

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

      {/* SLO / Sağlık Rozetleri */}
      <div className="grid gap-2 md:grid-cols-6">
        <div className={`border rounded p-2 ${slo.errorRate.ok ? 'border-green-300' : 'border-red-300'}`}>
          <div className="text-[10px] text-gray-500">Error Rate</div>
          <div className="text-sm">{errorRate.toFixed(2)}% <span className="text-[10px] text-gray-500">(hedef &lt; 1%)</span></div>
        </div>
        <div className={`border rounded p-2 ${slo.lcp.ok ? 'border-green-300' : 'border-red-300'}`}>
          <div className="text-[10px] text-gray-500">LCP P50</div>
          <div className="text-sm">{Math.round(perf?.averageLCP || 0)} ms <span className="text-[10px] text-gray-500">(hedef &lt; 2500 ms)</span></div>
        </div>
        <div className={`border rounded p-2 ${slo.resp.ok ? 'border-green-300' : 'border-red-300'}`}>
          <div className="text-[10px] text-gray-500">Resp P50</div>
          <div className="text-sm">{Math.round(sys?.averageResponseTime || 0)} ms <span className="text-[10px] text-gray-500">(hedef &lt; 2000 ms)</span></div>
        </div>
        <div className={`border rounded p-2 ${slo.cpu.ok ? 'border-green-300' : 'border-red-300'}`}>
          <div className="text-[10px] text-gray-500">CPU Avg</div>
          <div className="text-sm">{cpuVal != null ? `${Math.round(cpuVal)}%` : '—'} <span className="text-[10px] text-gray-500">(hedef &lt; 80%, serverless’ta N/A)</span></div>
        </div>
        <div className={`border rounded p-2 ${slo.mem.ok ? 'border-green-300' : 'border-red-300'}`}>
          <div className="text-[10px] text-gray-500">Memory Avg</div>
          <div className="text-sm">{Math.round(sys?.averageMemoryUsage || 0)}% <span className="text-[10px] text-gray-500">(hedef &lt; 85%)</span></div>
        </div>
        <div className={`border rounded p-2 ${slo.security.ok ? 'border-green-300' : 'border-red-300'}`}>
          <div className="text-[10px] text-gray-500">Security Score</div>
          <div className="text-sm">{security?.securityScore || 100} <span className="text-[10px] text-gray-500">(hedef ≥ 70)</span></div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className={`border rounded p-3 ${slo.resp.ok ? 'border-gray-200' : 'border-red-300'}`}>
          <div className="text-xs text-gray-500">Avg Load</div>
          <div className="text-lg">{Math.round(perf?.averageLoadTime || 0)} ms <span className="text-[10px] text-gray-500">(düşük daha iyi)</span></div>
        </div>
        <div className={`border rounded p-3 ${slo.lcp.ok ? 'border-gray-200' : 'border-red-300'}`}>
          <div className="text-xs text-gray-500">Avg FCP</div>
          <div className="text-lg">{Math.round(perf?.averageFCP || 0)} ms <span className="text-[10px] text-gray-500">(hedef &lt; 1800 ms)</span></div>
        </div>
        <div className={`border rounded p-3 ${slo.lcp.ok ? 'border-gray-200' : 'border-red-300'}`}>
          <div className="text-xs text-gray-500">Avg LCP</div>
          <div className="text-lg">{Math.round(perf?.averageLCP || 0)} ms <span className="text-[10px] text-gray-500">(hedef &lt; 2500 ms)</span></div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className={`border rounded p-3 ${slo.cpu.ok ? 'border-gray-200' : 'border-red-300'}`}>
          <div className="text-xs text-gray-500">Avg CPU</div>
          <div className="text-lg">{cpuVal != null ? `${Math.round(cpuVal)}%` : '—'} <span className="text-[10px] text-gray-500">(hedef &lt; 80%)</span></div>
        </div>
        <div className={`border rounded p-3 ${slo.mem.ok ? 'border-gray-200' : 'border-red-300'}`}>
          <div className="text-xs text-gray-500">Avg Memory</div>
          <div className="text-lg">{Math.round(sys?.averageMemoryUsage || 0)}% <span className="text-[10px] text-gray-500">(hedef &lt; 85%)</span></div>
        </div>
        <div className={`border rounded p-3 ${slo.resp.ok ? 'border-gray-200' : 'border-red-300'}`}>
          <div className="text-xs text-gray-500">Avg Resp Time</div>
          <div className="text-lg">{Math.round(sys?.averageResponseTime || 0)} ms <span className="text-[10px] text-gray-500">(hedef &lt; 2000 ms)</span></div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <section className="border rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-medium">En Yavaş Sayfalar</h2>
            <span className="text-xs text-gray-500">top {slowPages.length}</span>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-1">Sayfa</th>
                <th className="py-1 w-24 text-right">Ort. (ms)</th>
              </tr>
            </thead>
            <tbody>
              {slowPages.map((p) => (
                <tr key={p.page} className="border-t">
                  <td className="py-1 truncate max-w-[240px]">{p.page}</td>
                  <td className="py-1 text-right">{p.avg}</td>
                </tr>
              ))}
              {slowPages.length === 0 && (
                <tr><td className="py-2 text-gray-500" colSpan={2}>Kayıt yok</td></tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="border rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-medium">Kritik Hatalar (son 24s)</h2>
            <span className="text-xs text-gray-500">{errs?.criticalErrors || 0}</span>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-1">Tip</th>
                <th className="py-1">Sayfa</th>
                <th className="py-1 w-24">Seviye</th>
              </tr>
            </thead>
            <tbody>
              {errsRaw
                .filter((e: any) => e.severity === 'CRITICAL')
                .slice(-10)
                .reverse()
                .map((e: any, i: number) => (
                  <tr key={i} className="border-t">
                    <td className="py-1 truncate max-w-[160px]">{e.errorType}</td>
                    <td className="py-1 truncate max-w-[180px]">{e.page || '-'}</td>
                    <td className="py-1 text-xs">{e.severity}</td>
                  </tr>
                ))}
              {(!errsRaw || errsRaw.filter((e: any) => e.severity === 'CRITICAL').length === 0) && (
                <tr><td className="py-2 text-gray-500" colSpan={3}>Kayıt yok</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <section className="border rounded p-3">
          <h2 className="font-medium mb-2">Hata Dağılımı (Türe Göre)</h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-1">Tür</th>
                <th className="py-1 w-16 text-right">Adet</th>
              </tr>
            </thead>
            <tbody>
              {errTypes.map((t) => (
                <tr key={t.type} className="border-t">
                  <td className="py-1 truncate max-w-[220px]">{t.type}</td>
                  <td className="py-1 text-right">{t.count}</td>
                </tr>
              ))}
              {errTypes.length === 0 && (
                <tr><td className="py-2 text-gray-500" colSpan={2}>Kayıt yok</td></tr>
              )}
            </tbody>
          </table>
        </section>
        <section className="border rounded p-3">
          <h2 className="font-medium mb-2">En Çok Hata Veren Sayfalar</h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-1">Sayfa</th>
                <th className="py-1 w-16 text-right">Hata</th>
                <th className="py-1 w-20 text-right">Kritik</th>
              </tr>
            </thead>
            <tbody>
              {topErrorPages.map((p: any, i: number) => (
                <tr key={i} className="border-t">
                  <td className="py-1 truncate max-w-[220px]">{p.page}</td>
                  <td className="py-1 text-right">{p.count}</td>
                  <td className="py-1 text-right">{p.criticalCount}</td>
                </tr>
              ))}
              {topErrorPages.length === 0 && (
                <tr><td className="py-2 text-gray-500" colSpan={3}>Kayıt yok</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>

      {/* Güvenlik Paneli - Kompakt */}
      {security && (
        <section className="border rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-medium">Güvenlik Durumu</h2>
            <span className={`text-xs px-2 py-0.5 rounded ${
              security.threatLevel === 'LOW' ? 'bg-green-100 text-green-700' :
              security.threatLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {security.threatLevel}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <div className="text-gray-500">Login Success</div>
              <div className="font-medium">{security.loginSuccessRate}%</div>
            </div>
            <div>
              <div className="text-gray-500">Failed Logins</div>
              <div className="font-medium">{security.failedLogins}</div>
            </div>
            <div>
              <div className="text-gray-500">Suspicious</div>
              <div className="font-medium">{security.suspiciousActivities}</div>
            </div>
            <div>
              <div className="text-gray-500">Recent Logins</div>
              <div className="font-medium">{security.recentLogins}</div>
            </div>
          </div>
        </section>
      )}
        </div>
      </main>
    </div>
  );
}
