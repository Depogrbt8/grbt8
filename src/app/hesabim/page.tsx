'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import AccountSidebar from '@/components/AccountSidebar';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import DeleteAccountModal from '@/components/DeleteAccountModal';
import { useSession, signOut } from 'next-auth/react';
import { User, Plane, Users, Receipt, Search, Bell, Heart } from 'lucide-react';
import SurveyPopup from '@/components/SurveyPopup';
import Footer from '@/components/Footer';
import { logger } from '@/lib/logger';
import './hesabim-tasarim.css';
import { useCSRFToken } from '@/hooks/useCSRFToken';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  gender: string;
  identityNumber: string;
  isForeigner: boolean;
}

export default function HesabimPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const { token: csrfToken } = useCSRFToken();
  
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

  // Kullanıcı verilerini yükle
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setUserData(prev => ({
            ...prev,
            ...data,
            countryCode: data.countryCode || '+90',
          }));
        }
      } catch (error) {
        logger.error('Kullanıcı verisi yükleme hatası', { error });
      }
    };

    if (status === 'authenticated') {
      fetchUserData();
    }
  }, [status]);

  // Oturum kontrolü
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/giris');
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
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken || ''
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        toast.success('Bilgileriniz başarıyla güncellendi.');
        // Session'ı güncelle
        await fetch('/api/auth/session?update');
        // Sayfayı yenile
        window.location.reload();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Bir hata oluştu.');
      }
    } catch (error) {
      logger.error('Kullanıcı güncelleme hatası', { error });
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <main className="hesabim-page">
      <div className="hesabim-container">
        <div className="hesabim-layout">
          <div className="hesabim-content-card">
            <h1 className="hesabim-title">Hesap Bilgileri</h1>
            
              <form onSubmit={handleSubmit} className="hesabim-form">
                {/* Ad / Soyad / TC aynı satır */}
                <div className="hesabim-grid-3">
                  <div className="hesabim-form-group">
                    <label htmlFor="firstName" className="hesabim-label">Ad *</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={userData.firstName || ''}
                      onChange={handleChange}
                      required
                      className="hesabim-input"
                    />
                  </div>
                  <div className="hesabim-form-group">
                    <label htmlFor="lastName" className="hesabim-label">Soyad *</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={userData.lastName || ''}
                      onChange={handleChange}
                      required
                      className="hesabim-input"
                    />
                  </div>
                  <div className="hesabim-form-group">
                    <label htmlFor="identityNumber" className="hesabim-label">TC Kimlik No</label>
                    <input
                      type="text"
                      id="identityNumber"
                      name="identityNumber"
                      value={userData.identityNumber || ''}
                      onChange={handleChange}
                      maxLength={11}
                      className="hesabim-input"
                    />
                    {/* TC Vatandaşı Değil - TC alanının altında */}
                    <label className="hesabim-checkbox-label mt-3">
                      <input
                        type="checkbox"
                        id="isForeigner"
                        name="isForeigner"
                        checked={userData.isForeigner || false}
                        onChange={handleChange}
                        className="hesabim-checkbox"
                      />
                      TC Vatandaşı Değil
                    </label>
                  </div>
                </div>

                {/* E-posta ve Telefon (Kod + Telefon) */}
                <div className="hesabim-grid-3">
                  <div className="hesabim-form-group">
                    <label className="hesabim-label">E-Posta</label>
                    <input
                      type="email"
                      value={userData.email || ''}
                      disabled
                      className="hesabim-input"
                    />
                    <p className="text-xs text-gray-500 mt-1">E-posta adresi değiştirilemez</p>
                  </div>
                  <div className="hesabim-phone-container">
                    <div className="hesabim-country-code">
                      <label className="hesabim-label">Kod</label>
                      <select
                        name="countryCode"
                        value={userData.countryCode || '+90'}
                        onChange={handleChange}
                        className="hesabim-select"
                      >
                        <option value="+90">+90</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+49">+49</option>
                        <option value="+33">+33</option>
                      </select>
                    </div>
                    <div className="hesabim-phone-input">
                      <label className="hesabim-label">Cep Telefonu</label>
                      <input
                        type="tel"
                        name="phone"
                        value={userData.phone || ''}
                        onChange={handleChange}
                        placeholder="_ _ _  _ _ _  _ _ _ _"
                        className="hesabim-input"
                      />
                    </div>
                  </div>
                  <div></div>
                </div>

                {/* Cinsiyet + Doğum Tarihi aynı satır */}
                <div className="hesabim-grid-3">
                  <div className="hesabim-form-group hesabim-gender-container">
                    <label htmlFor="gender" className="hesabim-label">Cinsiyet</label>
                    <select
                      id="gender"
                      name="gender"
                      value={userData.gender || ''}
                      onChange={handleChange}
                      className="hesabim-select"
                    >
                      <option value="">Seçiniz</option>
                      <option value="male">Erkek</option>
                      <option value="female">Kadın</option>
                      <option value="other">Diğer</option>
                    </select>
                  </div>
                  <div className="hesabim-birthdate-container">
                    <select 
                      id="birthDay"
                      name="birthDay"
                      value={userData.birthDay || ''}
                      onChange={handleChange}
                      className="hesabim-select hesabim-birthdate-day"
                    >
                      <option value="">Gün</option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day.toString().padStart(2, '0')}>{day}</option>
                      ))}
                    </select>
                    <select 
                      id="birthMonth"
                      name="birthMonth"
                      value={userData.birthMonth || ''}
                      onChange={handleChange}
                      className="hesabim-select hesabim-birthdate-month"
                    >
                      <option value="">Ay</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <option key={month} value={month.toString().padStart(2, '0')}>{month}</option>
                      ))}
                    </select>
                    <select 
                      id="birthYear"
                      name="birthYear"
                      value={userData.birthYear || ''}
                      onChange={handleChange}
                      className="hesabim-select hesabim-birthdate-year"
                    >
                      <option value="">Yıl</option>
                      {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year.toString()}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div></div>
                </div>

                {/* Form Footer */}
                <div className="hesabim-form-footer">
                  <div className="hesabim-action-buttons">
                    <button
                      type="button"
                      className="hesabim-button-secondary"
                    >
                      Pasaport Ekle
                    </button>
                    <button
                      type="button"
                      className="hesabim-button-secondary"
                    >
                      Mil Kart Ekle
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsChangePasswordModalOpen(true)}
                      className="hesabim-button-secondary"
                    >
                      Şifre Değiştir
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDeleteAccountModalOpen(true)}
                      className="hesabim-button-danger"
                    >
                      Hesabı Sil
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="hesabim-button-primary flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Kaydediliyor...
                      </>
                    ) : (
                      'Kaydet'
                    )}
                  </button>
                </div>
              </form>

              
            </div>
          </div>
        </div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
      
      <DeleteAccountModal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
      />

      <SurveyPopup />
      <Footer />
    </main>
  );
}
