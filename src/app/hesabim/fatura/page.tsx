'use client';

import AccountSidebar from '@/components/AccountSidebar';
import { Building2, Home, Plus, Trash2, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User, Plane, Users, Star, Receipt, Search, Bell, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

interface Address {
  id: string;
  type: 'personal' | 'corporate';
  title: string;
  name?: string;
  tcNo?: string;
  companyName?: string;
  taxOffice?: string;
  taxNo?: string;
  address: string;
  city: string;
  district: string;
}

export default function FaturaPage() {
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-0 transition-colors text-[16px] bg-white";
  const selectClass = "w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-0 transition-colors text-[16px] bg-white";
  const labelClass = "block text-sm font-medium text-gray-600 mb-1";

  // API fonksiyonları
  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/user/addresses');
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      } else if (response.status === 401) {
        // Oturum hatası - popup gösterme, sadece sessizce loading'i bitir
        console.log('Kullanıcı oturumu gerekli');
      } else {
        // Diğer hatalar için popup göster
        toast.error('Adresler yüklenirken hata oluştu');
      }
    } catch (error) {
      // Network hatası vs. - sadece console'a yaz, popup gösterme
      console.error('Adres yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAddress = async (addressData: any) => {
    try {
      // Form verilerini backend formatına çevir
      const backendData: any = {
        type: addressData.type,
        title: addressData.title,
        address: addressData.address,
        city: addressData.city,
        district: addressData.district,
      };

      // Bireysel adres için
      if (addressData.type === 'personal') {
        backendData.name = `${addressData.firstName || ''} ${addressData.lastName || ''}`.trim();
      }

      // Kurumsal adres için
      if (addressData.type === 'corporate') {
        backendData.companyName = addressData.companyName;
        backendData.taxOffice = addressData.taxOffice;
        backendData.taxNo = addressData.taxNo;
      }

      const url = editingId ? `/api/user/addresses/${editingId}` : '/api/user/addresses';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendData),
      });

      if (response.ok) {
        const data = await response.json();
        if (editingId) {
          setAddresses(addresses.map(a => a.id === editingId ? data : a));
          toast.success('Adres güncellendi');
        } else {
          setAddresses([data, ...addresses]);
          toast.success('Adres eklendi');
        }
        return true;
      } else {
        const error = await response.json();
        toast.error(error.error || 'Adres kaydedilirken hata oluştu');
        return false;
      }
    } catch (error) {
      console.error('Adres kaydetme hatası:', error);
      toast.error('Adres kaydedilirken hata oluştu');
      return false;
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const response = await fetch(`/api/user/addresses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAddresses(addresses.filter(a => a.id !== id));
        toast.success('Adres silindi');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Adres silinirken hata oluştu');
      }
    } catch (error) {
      toast.error('Adres silinirken hata oluştu');
    }
  };

  // Sayfa yüklendiğinde adresleri getir
  useEffect(() => {
    if (session) {
      fetchAddresses();
    } else {
      // Session yoksa loading'i bitir
      setLoading(false);
    }
  }, [session]);

  const handleEdit = (address: any) => {
    setEditingId(address.id);
    // name alanını firstName ve lastName'e böl
    const nameParts = address.name ? address.name.split(' ') : ['', ''];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    setForm({ 
      ...address, 
      firstName,
      lastName 
    });
    setIsAdding(false);
  };
  const handleDelete = async (id: string) => {
    if (confirm('Bu adresi silmek istediğinizden emin misiniz?')) {
      await deleteAddress(id);
      if (editingId === id) {
        setEditingId(null);
        setForm(null);
      }
    }
  };

  const handleSave = async () => {
    if (!form.address || !form.city || !form.district) {
      toast.error('Lütfen adres, şehir ve ilçe alanlarını doldurun');
      return;
    }

    // Otomatik başlık oluştur
    const autoTitle = form.type === 'personal' 
      ? `${form.firstName || ''} ${form.lastName || ''}`.trim() || 'Bireysel Adres'
      : form.companyName || 'Kurumsal Adres';
    
    const formWithTitle = { ...form, title: autoTitle };

    const success = await saveAddress(formWithTitle);
    if (success) {
      setEditingId(null);
      setForm(null);
      setIsAdding(false);
    }
  };
  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setForm({
      type: 'personal',
      title: 'Fatura Adresi', // Otomatik başlık
      name: '',
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      district: '',
      companyName: '',
      taxOffice: '',
      taxNo: ''
    });
  };

  const menuItems = [
    { icon: User, label: 'Hesabım', href: '/hesabim' },
    { icon: Plane, label: 'Seyahatlerim', href: '/hesabim/seyahatlerim' },
    { icon: Users, label: 'Yolcularım', href: '/hesabim/yolcularim' },
    { icon: Star, label: 'Puanlarım', href: '/hesabim/puanlarim' },
    { icon: Receipt, label: 'Fatura Bilgilerim', href: '/hesabim/fatura' },
    { icon: Search, label: 'Aramalarım', href: '/hesabim/aramalarim' },
    { icon: Bell, label: 'Fiyat Alarmlarım', href: '/hesabim/alarmlar' },
    { icon: Heart, label: 'Favorilerim', href: '/hesabim/favoriler' },
  ];
  const handleLogout = () => { signOut({ callbackUrl: '/' }); };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="sm:container sm:mx-auto sm:px-4 sm:py-8 container mx-auto px-2 py-4">
        <div className="sm:flex sm:gap-8 flex flex-col gap-2">
          
          <div className="flex-1 bg-white rounded-lg shadow-sm sm:p-6 p-2">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h1 className="sm:text-2xl text-lg font-bold text-gray-800">Fatura Bilgilerim</h1>
              <button
                onClick={handleAdd}
                className="sm:px-4 sm:py-2 px-2 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center gap-2 text-xs sm:text-base"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Adres Ekle</span>
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-gray-500">Adresler yükleniyor...</div>
              </div>
            ) : !session ? (
              <div className="text-center py-8 text-gray-500">
                <p>Adres bilgilerinizi görüntülemek için giriş yapmanız gerekmektedir.</p>
              </div>
            ) : (
              <div className="sm:space-y-4 space-y-2">
                {addresses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Henüz adres eklememişsiniz.</p>
                    <p className="text-sm mt-2">Yeni adres eklemek için yukarıdaki butonu kullanabilirsiniz.</p>
                  </div>
                ) : (
                  addresses.map((address) => (
                <div 
                  key={address.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all duration-200"
                >
                  {editingId === address.id ? (
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="space-y-4">
                        {/* Adres Tipi */}
                        <div>
                          <label className={labelClass}>Adres Tipi</label>
                          <div className="flex gap-6 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="addressType"
                                value="personal"
                                checked={form.type === 'personal'}
                                onChange={e => setForm({ ...form, type: e.target.value })}
                                className="w-4 h-4 text-green-500 border-gray-300 focus:ring-green-500"
                              />
                              <span className="text-gray-700">Bireysel</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="addressType"
                                value="corporate"
                                checked={form.type === 'corporate'}
                                onChange={e => setForm({ ...form, type: e.target.value })}
                                className="w-4 h-4 text-green-500 border-gray-300 focus:ring-green-500"
                              />
                              <span className="text-gray-700">Kurumsal</span>
                            </label>
                          </div>
                        </div>

                        {/* Bireysel/Kurumsal Bilgiler */}
                        {form.type === 'personal' ? (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className={labelClass}>Ad</label>
                              <input 
                                value={form.firstName || ''} 
                                onChange={e => setForm({ ...form, firstName: e.target.value, name: (e.target.value + ' ' + (form.lastName || '')).trim() })} 
                                placeholder="Ad" 
                                className={inputClass} 
                              />
                            </div>
                            <div>
                              <label className={labelClass}>Soyad</label>
                              <input 
                                value={form.lastName || ''} 
                                onChange={e => setForm({ ...form, lastName: e.target.value, name: ((form.firstName || '') + ' ' + e.target.value).trim() })} 
                                placeholder="Soyad" 
                                className={inputClass} 
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <label className={labelClass}>Şirket Adı</label>
                              <input 
                                value={form.companyName} 
                                onChange={e => setForm({ ...form, companyName: e.target.value })} 
                                placeholder="Şirket Adı" 
                                className={inputClass} 
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className={labelClass}>Vergi Dairesi</label>
                                <input 
                                  value={form.taxOffice} 
                                  onChange={e => setForm({ ...form, taxOffice: e.target.value })} 
                                  placeholder="Vergi Dairesi" 
                                  className={inputClass} 
                                />
                              </div>
                              <div>
                                <label className={labelClass}>Vergi No</label>
                                <input 
                                  value={form.taxNo} 
                                  onChange={e => setForm({ ...form, taxNo: e.target.value })} 
                                  placeholder="Vergi No" 
                                  className={inputClass} 
                                  maxLength={10}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Adres Bilgileri */}
                        <div>
                          <label className={labelClass}>Adres</label>
                          <textarea 
                            value={form.address} 
                            onChange={e => setForm({ ...form, address: e.target.value })} 
                            placeholder="Adres" 
                            className={inputClass + " min-h-[60px] resize-none"} 
                            rows={2}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelClass}>İlçe</label>
                            <input 
                              value={form.district} 
                              onChange={e => setForm({ ...form, district: e.target.value })} 
                              placeholder="İlçe" 
                              className={inputClass} 
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Şehir</label>
                            <input 
                              value={form.city} 
                              onChange={e => setForm({ ...form, city: e.target.value })} 
                              placeholder="Şehir" 
                              className={inputClass} 
                            />
                          </div>
                        </div>

                        {/* Butonlar */}
                        <div className="flex gap-2 pt-3">
                          <button 
                            onClick={handleSave} 
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
                          >
                            Kaydet
                          </button>
                          <button 
                            onClick={() => { setEditingId(null); setForm(null); }} 
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm transition-colors"
                          >
                            Vazgeç
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {address.type === 'personal' ? (
                            <Home className="w-4 h-4 text-gray-600" />
                          ) : (
                            <Building2 className="w-4 h-4 text-gray-600" />
                          )}
                          <span className="text-sm text-gray-600">
                            {address.type === 'personal' ? 'Bireysel' : 'Kurumsal'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            className="p-1 text-gray-600 hover:text-blue-600 transition-colors" 
                            onClick={() => handleEdit(address)}
                            title="Düzenle"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1 text-gray-600 hover:text-red-600 transition-colors" 
                            onClick={() => handleDelete(address.id)}
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-3 space-y-2 text-sm">
                        {address.type === 'personal' ? (
                          <>
                            <div>
                              <span className="text-gray-600">Ad Soyad:</span>
                              <p className="text-gray-900">{address.name}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <span className="text-gray-600">Şirket:</span>
                              <p className="text-gray-900">{address.companyName}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-gray-600">Vergi Dairesi:</span>
                                <p className="text-gray-900">{address.taxOffice}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Vergi No:</span>
                                <p className="text-gray-900">{address.taxNo}</p>
                              </div>
                            </div>
                          </>
                        )}
                        <div>
                          <span className="text-gray-600">Adres:</span>
                          <p className="text-gray-900">{address.address}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Şehir/İlçe:</span>
                          <p className="text-gray-900">{address.city} / {address.district}</p>
                        </div>
                      </div>
                    </>
                  )}
                  </div>
                ))
                )}
                {/* Yeni adres ekleme formu */}
              {isAdding && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
                  <div className="space-y-4">
                    {/* Adres Tipi */}
                    <div>
                      <label className={labelClass}>Adres Tipi</label>
                      <div className="flex gap-6 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="newAddressType"
                            value="personal"
                            checked={form.type === 'personal'}
                            onChange={e => setForm({ ...form, type: e.target.value })}
                            className="w-4 h-4 text-green-500 border-gray-300 focus:ring-green-500"
                          />
                          <span className="text-gray-700">Bireysel</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="newAddressType"
                            value="corporate"
                            checked={form.type === 'corporate'}
                            onChange={e => setForm({ ...form, type: e.target.value })}
                            className="w-4 h-4 text-green-500 border-gray-300 focus:ring-green-500"
                          />
                          <span className="text-gray-700">Kurumsal</span>
                        </label>
                      </div>
                    </div>

                    {/* Bireysel/Kurumsal Bilgiler */}
                    {form.type === 'personal' ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Ad</label>
                          <input 
                            value={form.firstName || ''} 
                            onChange={e => setForm({ ...form, firstName: e.target.value, name: (e.target.value + ' ' + (form.lastName || '')).trim() })} 
                            placeholder="Ad" 
                            className={inputClass} 
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Soyad</label>
                          <input 
                            value={form.lastName || ''} 
                            onChange={e => setForm({ ...form, lastName: e.target.value, name: ((form.firstName || '') + ' ' + e.target.value).trim() })} 
                            placeholder="Soyad" 
                            className={inputClass} 
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className={labelClass}>Şirket Adı</label>
                          <input 
                            value={form.companyName} 
                            onChange={e => setForm({ ...form, companyName: e.target.value })} 
                            placeholder="Şirket Adı" 
                            className={inputClass} 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelClass}>Vergi Dairesi</label>
                            <input 
                              value={form.taxOffice} 
                              onChange={e => setForm({ ...form, taxOffice: e.target.value })} 
                              placeholder="Vergi Dairesi" 
                              className={inputClass} 
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Vergi No</label>
                            <input 
                              value={form.taxNo} 
                              onChange={e => setForm({ ...form, taxNo: e.target.value })} 
                              placeholder="Vergi No" 
                              className={inputClass} 
                              maxLength={10}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Adres Bilgileri */}
                    <div>
                      <label className={labelClass}>Adres</label>
                      <textarea 
                        value={form.address} 
                        onChange={e => setForm({ ...form, address: e.target.value })} 
                        placeholder="Adres" 
                        className={inputClass + " min-h-[60px] resize-none"} 
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>İlçe</label>
                        <input 
                          value={form.district} 
                          onChange={e => setForm({ ...form, district: e.target.value })} 
                          placeholder="İlçe" 
                          className={inputClass} 
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Şehir</label>
                        <input 
                          value={form.city} 
                          onChange={e => setForm({ ...form, city: e.target.value })} 
                          placeholder="Şehir" 
                          className={inputClass} 
                        />
                      </div>
                    </div>

                    {/* Butonlar */}
                    <div className="flex gap-2 pt-3">
                      <button 
                        onClick={handleSave} 
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
                      >
                        Kaydet
                      </button>
                      <button 
                        onClick={() => { setIsAdding(false); setForm(null); }} 
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm transition-colors"
                      >
                        Vazgeç
                      </button>
                    </div>
                  </div>
                </div>
              )}
              </div>
            )}

            <div className="mt-4 sm:mt-6 p-2 sm:p-4 bg-gray-50 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">
                Bireysel ve kurumsal fatura bilgilerinizi kaydedebilir, düzenleyebilir veya silebilirsiniz.
                Bilet alırken kayıtlı fatura bilgilerinizi kolayca seçebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 