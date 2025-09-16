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

  const inputClass = "w-full px-3 py-2 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-green-500 text-[16px]";
  const selectClass = "w-full px-3 py-2 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-green-500 text-[16px]";

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
      const url = editingId ? `/api/user/addresses/${editingId}` : '/api/user/addresses';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressData),
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
    setForm({ ...address });
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
    if (!form.title || !form.address || !form.city || !form.district) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    const success = await saveAddress(form);
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
      title: '',
      name: '',
      tcNo: '',
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
                  className="border rounded-lg sm:p-4 p-2 hover:bg-gray-50 transition-colors"
                >
                  {editingId === address.id ? (
                    <div className="sm:space-y-2 space-y-1">
                      <div className="flex sm:gap-2 gap-1">
                        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={selectClass + ' text-xs sm:text-base'}>
                          <option value="personal">Bireysel</option>
                          <option value="corporate">Kurumsal</option>
                        </select>
                        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Başlık" className={inputClass + ' flex-1 text-xs sm:text-base'} />
                      </div>
                      {form.type === 'personal' ? (
                        <>
                          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ad Soyad" className={inputClass + ' text-xs sm:text-base'} />
                          <input value={form.tcNo} onChange={e => setForm({ ...form, tcNo: e.target.value })} placeholder="TC Kimlik No" className={inputClass + ' text-xs sm:text-base'} />
                        </>
                      ) : (
                        <>
                          <input value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} placeholder="Şirket Adı" className={inputClass + ' text-xs sm:text-base'} />
                          <input value={form.taxOffice} onChange={e => setForm({ ...form, taxOffice: e.target.value })} placeholder="Vergi Dairesi" className={inputClass + ' text-xs sm:text-base'} />
                          <input value={form.taxNo} onChange={e => setForm({ ...form, taxNo: e.target.value })} placeholder="Vergi No" className={inputClass + ' text-xs sm:text-base'} />
                        </>
                      )}
                      <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Adres" className={inputClass + ' text-xs sm:text-base'} />
                      <div className="flex sm:gap-2 gap-1">
                        <input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} placeholder="İlçe" className={inputClass + ' flex-1 text-xs sm:text-base'} />
                        <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Şehir" className={inputClass + ' flex-1 text-xs sm:text-base'} />
                      </div>
                      <div className="flex sm:gap-2 gap-1 mt-2">
                        <button onClick={handleSave} className="px-3 py-1 bg-green-500 text-white rounded text-xs sm:text-base">Kaydet</button>
                        <button onClick={() => { setEditingId(null); setForm(null); }} className="px-3 py-1 bg-gray-200 rounded text-xs sm:text-base">Vazgeç</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {address.type === 'personal' ? (
                            <Home className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Building2 className="w-5 h-5 text-purple-600" />
                          )}
                          <h3 className="font-medium text-xs sm:text-base">{address.title}</h3>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button className="p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-100" onClick={() => handleEdit(address)}>
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-gray-100" onClick={() => handleDelete(address.id)}>
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-4 space-y-1 sm:space-y-2 text-gray-600 text-xs sm:text-base">
                        {address.type === 'personal' ? (
                          <>
                            <p>{address.name}</p>
                            <p>TC: {address.tcNo}</p>
                          </>
                        ) : (
                          <>
                            <p>{address.companyName}</p>
                            <p>Vergi Dairesi: {address.taxOffice}</p>
                            <p>Vergi No: {address.taxNo}</p>
                          </>
                        )}
                        <p>{address.address}</p>
                        <p>{address.district} / {address.city}</p>
                      </div>
                    </>
                  )}
                  </div>
                ))
                )}
                {/* Yeni adres ekleme formu */}
              {isAdding && (
                <div className="border rounded-lg sm:p-4 p-2 bg-gray-50 mt-2 sm:mt-4">
                  <div className="sm:space-y-2 space-y-1">
                    <div className="flex sm:gap-2 gap-1">
                      <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={selectClass + ' text-xs sm:text-base'}>
                        <option value="personal">Bireysel</option>
                        <option value="corporate">Kurumsal</option>
                      </select>
                      <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Başlık" className={inputClass + ' flex-1 text-xs sm:text-base'} />
                    </div>
                    {form.type === 'personal' ? (
                      <>
                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ad Soyad" className={inputClass + ' text-xs sm:text-base'} />
                        <input value={form.tcNo} onChange={e => setForm({ ...form, tcNo: e.target.value })} placeholder="TC Kimlik No" className={inputClass + ' text-xs sm:text-base'} />
                      </>
                    ) : (
                      <>
                        <input value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} placeholder="Şirket Adı" className={inputClass + ' text-xs sm:text-base'} />
                        <input value={form.taxOffice} onChange={e => setForm({ ...form, taxOffice: e.target.value })} placeholder="Vergi Dairesi" className={inputClass + ' text-xs sm:text-base'} />
                        <input value={form.taxNo} onChange={e => setForm({ ...form, taxNo: e.target.value })} placeholder="Vergi No" className={inputClass + ' text-xs sm:text-base'} />
                      </>
                    )}
                    <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Adres" className={inputClass + ' text-xs sm:text-base'} />
                    <div className="flex sm:gap-2 gap-1">
                      <input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} placeholder="İlçe" className={inputClass + ' flex-1 text-xs sm:text-base'} />
                      <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Şehir" className={inputClass + ' flex-1 text-xs sm:text-base'} />
                    </div>
                    <div className="flex sm:gap-2 gap-1 mt-2">
                      <button onClick={handleSave} className="px-3 py-1 bg-green-500 text-white rounded text-xs sm:text-base">Kaydet</button>
                      <button onClick={() => { setIsAdding(false); setForm(null); }} className="px-3 py-1 bg-gray-200 rounded text-xs sm:text-base">Vazgeç</button>
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