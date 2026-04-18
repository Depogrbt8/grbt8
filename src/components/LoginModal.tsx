'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { signIn } from 'next-auth/react';
import { validatePasswordStrength } from '@/lib/authSecurity';
import { monitoringClient } from '@/lib/monitoringClient';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Modal açıldığında gösterilecek sekme (ör. Coming Soon’dan “Üye ol”) */
  initialTab?: 'login' | 'register';
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RegisterFieldErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  kvkkConsent?: string;
};

const LoginModal = ({ isOpen, onClose, initialTab }: LoginModalProps) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [kvkkConsent, setKvkkConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  // Inline alan hataları (register)
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});

  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab ?? 'login');
      setError('');
      setFieldErrors({});
    }
  }, [isOpen, initialTab]);

  // Şifre güç göstergesi
  const passwordChecks = useMemo(() => {
    return {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  }, [password]);

  const passwordScore = useMemo(() => {
    return Object.values(passwordChecks).filter(Boolean).length;
  }, [passwordChecks]);

  const passwordStrengthLabel = useMemo(() => {
    if (!password) return '';
    if (passwordScore <= 2) return 'Zayıf';
    if (passwordScore === 3) return 'Orta';
    if (passwordScore === 4) return 'İyi';
    return 'Güçlü';
  }, [password, passwordScore]);

  const passwordStrengthColor = useMemo(() => {
    if (passwordScore <= 2) return 'bg-red-400';
    if (passwordScore === 3) return 'bg-yellow-400';
    if (passwordScore === 4) return 'bg-lime-500';
    return 'bg-green-600';
  }, [passwordScore]);

  // --- LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error || result?.ok === false) {
        const errorMessage = 'Geçersiz e-posta veya şifre!';
        setError(errorMessage);
        toast.error(errorMessage);
        monitoringClient.trackLoginAttempt(false);
      } else if (result?.ok) {
        toast.success('Başarıyla giriş yapıldı!');
        monitoringClient.trackLoginAttempt(true);
        onClose();
        setTimeout(() => {
          window.location.href = '/hesabim';
        }, 500);
      } else {
        const errorMessage = 'Giriş yapılırken bir hata oluştu';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'Giriş yapılırken bir hata oluştu';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Login exception:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- REGISTER VALIDATION (inline) ---
  const validateFirstName = (v: string) => (!v.trim() ? 'Ad alanı zorunludur' : undefined);
  const validateLastName = (v: string) => (!v.trim() ? 'Soyad alanı zorunludur' : undefined);
  const validateEmailFormat = (v: string) => {
    if (!v.trim()) return 'E-posta adresi zorunludur';
    if (!EMAIL_REGEX.test(v)) return 'Geçerli bir e-posta adresi giriniz';
    return undefined;
  };
  const validatePassword = (v: string) => {
    if (!v.trim()) return 'Şifre alanı zorunludur';
    const { isValid, errors } = validatePasswordStrength(v);
    if (!isValid) return errors[0];
    return undefined;
  };

  const checkEmailAvailable = useCallback(async (value: string) => {
    const formatError = validateEmailFormat(value);
    if (formatError) {
      setFieldErrors((prev) => ({ ...prev, email: formatError }));
      return;
    }
    try {
      setEmailCheckLoading(true);
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.exists) {
        setFieldErrors((prev) => ({ ...prev, email: 'Bu e-posta adresi zaten kayıtlı' }));
      } else {
        setFieldErrors((prev) => ({ ...prev, email: undefined }));
      }
    } catch {
      // Sessiz geç: check-email arızalanırsa submit akışı yine çalışır
    } finally {
      setEmailCheckLoading(false);
    }
  }, []);

  // --- REGISTER ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const nextErrors: RegisterFieldErrors = {
      firstName: validateFirstName(firstName),
      lastName: validateLastName(lastName),
      email: validateEmailFormat(email),
      password: validatePassword(password),
      kvkkConsent: kvkkConsent ? undefined : 'Devam etmek için KVKK ve Kullanım Şartlarını onaylamanız gerekir',
    };

    setFieldErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          kvkkConsent,
          marketingConsent,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('Hesabınız başarıyla oluşturuldu!');
        monitoringClient.trackUserRegistration(data.user?.id || 'new_user', email);

        onClose();

        try {
          await signIn('credentials', { email, password, redirect: false });
        } catch (err) {
          console.error('Manual sign in error:', err);
        }

        setTimeout(() => {
          router.push('/hesabim');
        }, 800);
      } else {
        const data = await res.json().catch(() => ({}));
        if (data?.error && typeof data.error === 'object' && data.error.message) {
          const msg: string = data.error.message;
          if (/e-?posta/i.test(msg) && /kayıt/i.test(msg)) {
            setFieldErrors((prev) => ({ ...prev, email: 'Bu e-posta adresi zaten kayıtlı' }));
          } else {
            setError(msg);
            toast.error(msg);
          }
        } else if (typeof data?.error === 'string') {
          setError(data.error);
          toast.error(data.error);
        } else {
          const msg = 'Bir hata oluştu.';
          setError(msg);
          toast.error(msg);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 z-[100000] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md relative flex flex-col max-h-[92vh] sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobil tutamak */}
        <div className="sm:hidden flex justify-center pt-2">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="px-6 sm:px-8 pt-5 sm:pt-7 pb-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Kapat"
          >
            <X size={22} />
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {activeTab === 'login' ? 'Giriş Yap' : 'Üye Ol'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {activeTab === 'login'
                ? 'Tekrar hoş geldin'
                : 'Dakikalar içinde hesabını oluştur'}
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 sm:px-8 pb-6 sm:pb-8">
          {/* Social Logins - üstte */}
          <div className="grid grid-cols-1 gap-2.5 mb-5">
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/hesabim' })}
              className="w-full inline-flex items-center justify-center h-11 px-4 border border-gray-300 rounded-xl bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84Z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.98 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335" />
              </svg>
              Google ile devam et
            </button>
            <button
              type="button"
              onClick={() => signIn('facebook', { callbackUrl: '/hesabim' })}
              className="w-full inline-flex items-center justify-center h-11 px-4 rounded-xl bg-[#1877F2] text-sm font-medium text-white hover:bg-[#166fe5] transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z" clipRule="evenodd" />
              </svg>
              Facebook ile devam et
            </button>
          </div>

          {/* Ayraç */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-400 uppercase tracking-wide">veya e-posta ile</span>
            </div>
          </div>

          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">E-posta</label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full h-11 px-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition"
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
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full h-11 px-3 pr-10 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>

              <p className="text-center text-sm text-gray-600">
                Hesabın yok mu?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setError('');
                  }}
                  className="font-semibold text-green-600 hover:underline"
                >
                  Üye Ol
                </button>
              </p>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ad</label>
                  <input
                    type="text"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (fieldErrors.firstName) setFieldErrors((p) => ({ ...p, firstName: undefined }));
                    }}
                    onBlur={() => setFieldErrors((p) => ({ ...p, firstName: validateFirstName(firstName) }))}
                    className={`mt-1 w-full h-11 px-3 border rounded-xl bg-gray-50 focus:bg-white outline-none transition focus:ring-2 ${
                      fieldErrors.firstName
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-300 focus:border-green-500 focus:ring-green-500/20'
                    }`}
                  />
                  {fieldErrors.firstName && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {fieldErrors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Soyad</label>
                  <input
                    type="text"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (fieldErrors.lastName) setFieldErrors((p) => ({ ...p, lastName: undefined }));
                    }}
                    onBlur={() => setFieldErrors((p) => ({ ...p, lastName: validateLastName(lastName) }))}
                    className={`mt-1 w-full h-11 px-3 border rounded-xl bg-gray-50 focus:bg-white outline-none transition focus:ring-2 ${
                      fieldErrors.lastName
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-300 focus:border-green-500 focus:ring-green-500/20'
                    }`}
                  />
                  {fieldErrors.lastName && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {fieldErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">E-posta Adresi</label>
                <div className="relative">
                  <input
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
                    }}
                    onBlur={() => {
                      const formatError = validateEmailFormat(email);
                      if (formatError) {
                        setFieldErrors((p) => ({ ...p, email: formatError }));
                      } else {
                        checkEmailAvailable(email);
                      }
                    }}
                    className={`mt-1 w-full h-11 px-3 pr-10 border rounded-xl bg-gray-50 focus:bg-white outline-none transition focus:ring-2 ${
                      fieldErrors.email
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-300 focus:border-green-500 focus:ring-green-500/20'
                    }`}
                  />
                  {emailCheckLoading && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      Kontrol...
                    </span>
                  )}
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Şifre</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
                    }}
                    onBlur={() => setFieldErrors((p) => ({ ...p, password: validatePassword(password) }))}
                    className={`mt-1 w-full h-11 px-3 pr-10 border rounded-xl bg-gray-50 focus:bg-white outline-none transition focus:ring-2 ${
                      fieldErrors.password
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-300 focus:border-green-500 focus:ring-green-500/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </button>
                </div>

                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            i < passwordScore ? passwordStrengthColor : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      <span className="text-gray-500">Şifre gücü</span>
                      <span className="text-gray-700 font-medium">{passwordStrengthLabel}</span>
                    </div>
                    <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-xs">
                      {[
                        { key: 'length', label: 'En az 8 karakter' },
                        { key: 'upper', label: 'Büyük harf (A-Z)' },
                        { key: 'lower', label: 'Küçük harf (a-z)' },
                        { key: 'number', label: 'Rakam (0-9)' },
                        { key: 'special', label: 'Özel karakter (!@#$...)' },
                      ].map((c) => {
                        const ok = passwordChecks[c.key as keyof typeof passwordChecks];
                        return (
                          <li key={c.key} className={`flex items-center gap-1.5 ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                            <Check className={`w-3.5 h-3.5 ${ok ? 'opacity-100' : 'opacity-40'}`} />
                            {c.label}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Onay kutuları */}
              <div className="space-y-2 pt-1">
                <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={kvkkConsent}
                    onChange={(e) => {
                      setKvkkConsent(e.target.checked);
                      if (e.target.checked && fieldErrors.kvkkConsent) {
                        setFieldErrors((p) => ({ ...p, kvkkConsent: undefined }));
                      }
                    }}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span>
                    <a href="/kullanim-sartlari" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-800">
                      Kullanım Şartları
                    </a>
                    ,{' '}
                    <a href="/gizlilik-politikasi" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-800">
                      Gizlilik Politikası
                    </a>{' '}
                    ve{' '}
                    <a href="/kvkk" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-800">
                      KVKK Aydınlatma Metni
                    </a>
                    ’ni okudum, onaylıyorum. <span className="text-red-500">*</span>
                  </span>
                </label>
                {fieldErrors.kvkkConsent && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {fieldErrors.kvkkConsent}
                  </p>
                )}

                <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span>
                    Kampanya ve fırsatlardan haberdar olmak için{' '}
                    <a href="/ticari-elektronik-ileti" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-800">
                      ticari elektronik ileti
                    </a>{' '}
                    almayı kabul ediyorum.
                  </span>
                </label>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur'}
              </button>

              <p className="text-center text-sm text-gray-600">
                Zaten üye misin?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setError('');
                  }}
                  className="font-semibold text-green-600 hover:underline"
                >
                  Giriş Yap
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
