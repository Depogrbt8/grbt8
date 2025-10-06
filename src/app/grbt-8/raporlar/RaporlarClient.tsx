'use client';

import SalesReportTable from '@/components/SalesReportTable';
import AdminSidebar from '@/components/AdminSidebar';

export default function RaporlarClient() {
  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <main className="flex-1">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Satış Raporları</h1>
          <SalesReportTable />
        </div>
      </main>
    </div>
  );
}
