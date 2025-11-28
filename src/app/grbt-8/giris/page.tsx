 
'use client';

import LoginModal from '@/components/LoginModal';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 bg-white shadow-lg rounded-xl p-8">
        <div className="text-center space-y-1">
          <p className="text-xs uppercase tracking-widest text-gray-400">GRBT-8 Admin</p>
          <h1 className="text-2xl font-semibold text-gray-900">Kontrol Paneline Giriş</h1>
          <p className="text-sm text-gray-500">
            Sadece yetkili admin hesapları bu ekrana erişebilir.
          </p>
        </div>

        <div className="space-y-4">
          <LoginModal isOpen={true} onClose={() => router.push('/')} />
          <div className="text-center text-sm text-gray-500">
            <p>Giriş yaptıktan sonra otomatik olarak Admin Paneline yönlendirilirsiniz.</p>
            <a
              href="/sifremi-unuttum"
              className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-medium"
            >
              Şifremi unuttum
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
