'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Eye, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { signIn } from 'next-auth/react';
import ValidationPopup from './ValidationPopup';
import { validatePasswordStrength } from '@/lib/authSecurity';
import CountryDropdown from './CountryDropdown';
import { Country, defaultCountry } from '@/data/countries';
import { monitoringClient } from '@/lib/monitoringClient';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationPopup, setShowValidationPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Önceki hataları temizle
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: email,
        password: password,
        redirect: false,
      });

      // NextAuth başarısız olduğunda result.error veya result.ok === false olabilir
      if (result?.error || result?.ok === false) {
        const errorMessage = 'Geçersiz e-posta veya şifre!';
        setError(errorMessage); // Error state'ini set et
        toast.error(errorMessage);
        // Monitoring: Başarısız giriş
        monitoringClient.trackLoginAttempt(false);
        console.log('Login error:', result); // Debug için
      } else if (result?.ok) {
        toast.success('Başarıyla giriş yapıldı!');
        // Monitoring: Başarılı giriş
        monitoringClient.trackLoginAttempt(true);
        
        // Modal'ı kapat ve yönlendir
        onClose();
        
        // Kısa bir gecikme ile yönlendir (modal kapanma animasyonu için)
        setTimeout(() => {
          window.location.href = '/hesabim';
        }, 500);
      } else {
        // Beklenmeyen durum
        const errorMessage = 'Giriş yapılırken bir hata oluştu';
        setError(errorMessage);
        toast.error(errorMessage);
        console.log('Unexpected login result:', result); // Debug için
      }
    } catch (err) {
      const errorMessage = 'Giriş yapılırken bir hata oluştu';
      setError(errorMessage); // Error state'ini set et
      toast.error(errorMessage);
      console.error('Login exception:', err); // Debug için
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors([]);
    
    // Form validasyonu
    const errors: string[] = [];
    
    if (!firstName.trim()) {
      errors.push('Ad alanı zorunludur');
    }
    
    if (!lastName.trim()) {
      errors.push('Soyad alanı zorunludur');
    }
    
    if (!email.trim()) {
      errors.push('E-posta adresi zorunludur');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Geçerli bir e-posta adresi giriniz');
    }
    
    if (!phone.trim()) {
      errors.push('Cep telefonu numarası zorunludur');
    }
    
    if (!password.trim()) {
      errors.push('Şifre alanı zorunludur');
    } else {
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        errors.push(...passwordValidation.errors);
      }
    }
    
    if (!confirmPassword.trim()) {
      errors.push('Şifre tekrar alanı zorunludur');
    } else if (password !== confirmPassword) {
      errors.push('Şifreler eşleşmiyor');
    }
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidationPopup(true);
      return;
    }
    
    setLoading(true);
    
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, firstName, lastName, phone }),
    });

    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      toast.success('Hesabınız başarıyla oluşturuldu!');
      
      // Monitoring: Başarılı kayıt
      monitoringClient.trackUserRegistration(data.user?.id || 'new_user', email);
      
      // Modal'ı kapat
      onClose();
      
      // NextAuth session'ını manuel olarak oluştur
      try {
        await signIn('credentials', {
          email: email,
          password: password,
          redirect: false,
        });
      } catch (error) {
        console.error('Manual sign in error:', error);
      }
      
      // Direkt hesabım sayfasına yönlendir
      setTimeout(() => {
        router.push('/hesabim');
      }, 1000);
    } else {
      const data = await res.json();
      // API error response formatını kontrol et
      if (data.error && typeof data.error === 'object' && data.error.message) {
        // Standart error formatı: { error: { code, message, statusCode } }
        setError(data.error.message);
        toast.error(data.error.message);
      } else if (typeof data.error === 'string') {
        // String format error
        setError(data.error);
        toast.error(data.error);
      } else {
        // Beklenmeyen format
        const errorMessage = 'Bir hata oluştu.';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="p-8 pb-4 flex-shrink-0">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">{activeTab === 'login' ? 'Giriş Yap' : 'Üye Ol'}</h2>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto px-8 pb-8">
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">E-Posta</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:border-gray-300 focus:ring-0 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">Şifre</label>
                    <a href="/sifremi-unuttum" className="text-sm text-gray-600 hover:text-gray-800 hover:underline">
                      Şifremi unuttum
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 w-full p-2 pr-10 border border-gray-300 rounded-lg bg-gray-50 focus:border-gray-300 focus:ring-0 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" disabled={loading} className="w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400">
                  {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                </button>
                <p className="text-center text-sm text-gray-600">
                  Hesabın yok mu?{' '}
                  <button type="button" onClick={() => { setActiveTab('register'); setError(''); }} className="font-semibold text-green-600 hover:underline">
                    Üye Ol
                  </button>
                </p>
              </form>
            )}

            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Adı</label>
                                      <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:border-gray-300 focus:ring-0 focus:outline-none"
                    required
                  />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Soyadı</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-1 w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:border-gray-300 focus:ring-0 focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">E-Posta Adresi</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:border-gray-300 focus:ring-0 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cep Telefonu</label>
                  <div className="flex mt-1">
                    <CountryDropdown
                      selectedCountry={selectedCountry}
                      onCountryChange={setSelectedCountry}
                      className="w-24"
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-r-lg bg-gray-50 focus:border-gray-300 focus:ring-0 focus:outline-none"
                      placeholder="Telefon numaranız"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Şifre</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 w-full p-2 pr-10 border border-gray-300 rounded-lg bg-gray-50 focus:border-gray-300 focus:ring-0 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Şifre Tekrar</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1 w-full p-2 pr-10 border border-gray-300 rounded-lg bg-gray-50 focus:border-gray-300 focus:ring-0 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" disabled={loading} className="w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400">
                  {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
                </button>
                <p className="text-center text-sm text-gray-600">
                  Zaten üye misin?{' '}
                  <button type="button" onClick={() => { setActiveTab('login'); setError(''); }} className="font-semibold text-green-600 hover:underline">
                    Giriş Yap
                  </button>
                </p>
              </form>
            )}

            {/* Social Logins */}
            <div className="mt-6">

              <div className="mt-6 grid grid-cols-1 gap-3">
                <div>
                  <button
                    onClick={() => signIn('google')}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <svg className="w-5 h-5 mr-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84Z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.98 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335"/>
                    </svg>
                    Google ile devam et
                  </button>
                </div>
                <div>
                  <button
                    onClick={() => signIn('facebook')}
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm bg-[#1877F2] text-sm font-medium text-white hover:bg-[#166fe5]"
                  >
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z" clipRule="evenodd"/>
                    </svg>
                    Facebook ile devam et
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-center text-xs text-gray-500">
                Kişisel verileriniz <a href="#" className="underline">Aydınlatma Metni</a> kapsamında işleniyor. Üye olarak <a href="#" className="underline">Kullanım Koşulları</a>'nı kabul ettiğinizi onaylamış olursunuz.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Validation Popup */}
      <ValidationPopup
        isOpen={showValidationPopup}
        onClose={() => setShowValidationPopup(false)}
        errors={validationErrors}
      />
    </>
  );
};

export default LoginModal;
