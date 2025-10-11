'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import DeleteAccountModal from '@/components/DeleteAccountModal';
import { useSession, signOut } from 'next-auth/react';
import { User, Plane, Users, Star, Receipt, Search, Bell, Heart } from 'lucide-react';
import { useCSRFToken } from '@/hooks/useCSRFToken';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  birthDay: string | number;
  birthMonth: string | number;
  birthYear: string | number;
  gender: string;
  identityNumber: string;
  isForeigner: boolean;
}

export default function HesabimPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { token: csrfToken } = useCSRFToken();
  const [isLoading, setIsLoading] = useState(false);
  const [authTokenUser, setAuthTokenUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Auth-token kontrolü
  useEffect(() => {
    const checkAuthToken = async () => {
      try {
        // Auth-token cookie'sini kontrol et
        const authToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth-token='))
          ?.split('=')[1];

        if (authToken && !session) {
          // Auth-token varsa kullanıcı bilgilerini al
          const response = await fetch('/api/auth/token-user', {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });

          if (response.ok) {
            const userData = await response.json();
            setAuthTokenUser(userData);
          }
        }
      } catch (error) {
        console.error('Auth token check error:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthToken();
  }, [session]);

  const [userData, setUserData] = useState<Partial<UserData>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+90',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    gender: '',
    identityNumber: '',
    isForeigner: false,
  });
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);

  // Profil verisini API'den çek (session gecikmelerinde eski veri kalmasın)
  const fetchProfile = async () => {
    try {
      // Auth-token varsa onu kullan, yoksa normal session
      const authToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      const headers: any = { cache: 'no-store' };
      if (authToken && !session) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch('/api/user/profile', headers);
      if (!res.ok) return;
      const data = await res.json();
      setUserData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        countryCode: data.countryCode || '+90',
        birthDay: data.birthDay || '',
        birthMonth: data.birthMonth || '',
        birthYear: data.birthYear || '',
        gender: data.gender || '',
        identityNumber: data.identityNumber || '',
        isForeigner: !!data.isForeigner,
      });
    } catch {}
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/giris');
    } else if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setUserData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Boş string/null/undefined olan alanları payload'dan çıkar
      const payload: Record<string, unknown> = {};
      Object.entries(userData).forEach(([key, value]) => {
        if (value === '' || value === null || typeof value === 'undefined') return;
        payload[key] = value as unknown;
      });

      // CSRF token'ı garanti altına al
      let token = csrfToken;
      if (!token) {
        try {
          const tRes = await fetch('/api/csrf-token', { method: 'GET', credentials: 'include' });
          const tJson = await tRes.json();
          token = tJson.csrfToken as string;
        } catch {}
      }

      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': token || '',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Bilgileriniz başarıyla güncellendi.');
        await fetch('/api/auth/session?update');
        await fetchProfile();
      } else {
        let errorText = 'Bir hata oluştu.';
        try {
          const errorData = await response.json();
          errorText = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
        } catch {}
        toast.error(errorText);
      }
    } catch (error) {
      toast.error('Güncelleme sırasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading durumları
  if (status === 'loading' || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Giriş kontrolü - NextAuth session veya auth-token
  if (!session && !authTokenUser) {
    // Giriş yapmamış kullanıcıyı giriş sayfasına yönlendir
    router.push('/giris');
    return null;
  }

  const handleLogout = () => { signOut({ callbackUrl: '/' }); };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="sm:container sm:mx-auto sm:px-4 sm:py-8 container mx-auto px-2 py-4">
        <div className="sm:flex sm:gap-8 flex flex-col gap-2">
          <div className="flex-1 bg-white rounded-lg shadow-sm sm:p-6 p-2">
            <h1 className="sm:text-2xl text-lg font-bold text-gray-800 mb-4">Hesap Bilgileri</h1>
            <form onSubmit={handleSubmit} className="sm:space-y-6 space-y-3">
              <div className="sm:grid sm:grid-cols-3 sm:gap-6 grid grid-cols-1 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                  <input
                    type="text"
                    name="firstName"
                    value={userData.firstName || ''}
                    onChange={handleChange}
                    className="w-full px-2 py-2 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-green-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
                  <input
                    type="text"
                    name="lastName"
                    value={userData.lastName || ''}
                    onChange={handleChange}
                    className="w-full px-2 py-2 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-green-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TC Kimlik No</label>
                  <input
                    type="text"
                    name="identityNumber"
                    value={userData.identityNumber || ''}
                    onChange={handleChange}
                    className="w-full px-2 py-2 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-green-500 text-sm"
                    maxLength={11}
                    disabled={!!userData.isForeigner}
                  />
                  <div className="mt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isForeigner"
                        checked={!!userData.isForeigner}
                        onChange={handleChange}
                        className="rounded text-green-500 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">TC Vatandaşı Değil</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="sm:grid sm:grid-cols-3 sm:gap-8 grid grid-cols-1 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doğum Tarihi</label>
                  <div className="flex gap-1 min-w-[220px]">
                    <select
                      name="birthDay"
                      value={userData.birthDay || ''}
                      onChange={handleChange}
                      className="w-12 px-1 py-2 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-green-500 text-sm"
                    >
                      <option value="">Gün</option>
                      {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                    <select
                      name="birthMonth"
                      value={userData.birthMonth || ''}
                      onChange={handleChange}
                      className="w-20 px-1 py-2 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-green-500 text-sm"
                    >
                      <option value="">Ay</option>
                      {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                    <select
                      name="birthYear"
                      value={userData.birthYear || ''}
                      onChange={handleChange}
                      className="w-20 px-1 py-2 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-green-500 text-sm"
                    >
                      <option value="">Yıl</option>
                      {Array.from({length: 100}, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <div className="flex gap-2 items-end">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ülke Kodu</label>
                      <select
                        name="countryCode"
                        value={userData.countryCode || '+90'}
                        onChange={handleChange}
                        className="w-32 px-2 py-2 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-green-500 text-sm"
                      >
                        <option value="+90">🇹🇷 TR (+90)</option>
                        <option value="+49">🇩🇪 DE (+49)</option>
                        <option value="+44">🇬🇧 UK (+44)</option>
                        <option value="+33">🇫🇷 FR (+33)</option>
                        <option value="+32">🇧🇪 BE (+32)</option>
                        <option value="+31">🇳🇱 NL (+31)</option>
                        <option value="+41">🇨🇭 CH (+41)</option>
                        <option value="+45">🇩🇰 DK (+45)</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cep Telefonu</label>
                      <input
                        type="text"
                        name="phone"
                        value={userData.phone || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-2 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-green-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-end pb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cinsiyet</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={userData.gender === 'male'}
                        onChange={handleChange}
                        className="text-green-500 focus:ring-green-500"
                      />
                      <span>Erkek</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={userData.gender === 'female'}
                        onChange={handleChange}
                        className="text-green-500 focus:ring-green-500"
                      />
                      <span>Kadın</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 flex-col sm:flex-row">
                <div className="w-full sm:w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-Posta</label>
                  <input
                    type="email"
                    name="email"
                    value={userData.email || ''}
                    onChange={handleChange}
                    className="w-full px-2 py-2 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-green-500 text-sm"
                    disabled
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t gap-2">
                <div className="flex gap-2 flex-wrap">
                  <button type="button" className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 text-xs">Pasaport Ekle</button>
                  <button type="button" className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 text-xs">Mil Kart Ekle</button>
                  <button type="button" onClick={() => setIsChangePasswordModalOpen(true)} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 text-xs">Şifre Değiştir</button>
                  <button type="button" onClick={() => setIsDeleteAccountModalOpen(true)} className="flex items-center gap-2 px-3 py-2 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 text-xs">Hesabı Sil</button>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 text-xs ${
                    isLoading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ChangePasswordModal isOpen={isChangePasswordModalOpen} onClose={() => setIsChangePasswordModalOpen(false)} />
      <DeleteAccountModal isOpen={isDeleteAccountModalOpen} onClose={() => setIsDeleteAccountModalOpen(false)} />
    </main>
  );
}
