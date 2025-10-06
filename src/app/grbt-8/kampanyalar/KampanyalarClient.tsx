'use client';

import CampaignsTab from '@/app/components/campaigns/CampaignsTab';
import AdminSidebar from '@/components/AdminSidebar';

export default function KampanyalarClient() {
  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <main className="flex-1">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Kampanyalar</h1>
          <CampaignsTab />
        </div>
      </main>
    </div>
  );
}
