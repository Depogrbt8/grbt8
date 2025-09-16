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

  const inputClass = "w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring-0 transition-colors text-[16px] bg-white";
  const selectClass = "w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring-0 transition-colors text-[16px] bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

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
      firstName: '',
      lastName: '',
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
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-green-300 hover:shadow-md transition-all duration-300"
                >
                  {editingId === address.id ? (
                    <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                      <div className="space-y-6">
                        {/* Adres Tipi ve Başlık */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>Adres Tipi</label>
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={selectClass}>
                              <option value="personal">Bireysel</option>
                              <option value="corporate">Kurumsal</option>
                            </select>
                          </div>
                          <div>
                            <label className={labelClass}>Adres Başlığı *</label>
                            <input 
                              value={form.title} 
                              onChange={e => setForm({ ...form, title: e.target.value })} 
                              placeholder="Örn: Ev Adresi, İş Adresi" 
                              className={inputClass} 
                            />
                          </div>
                        </div>

                        {/* Bireysel/Kurumsal Bilgiler */}
                        {form.type === 'personal' ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={labelClass}>Ad *</label>
                              <input 
                                value={form.firstName || ''} 
                                onChange={e => setForm({ ...form, firstName: e.target.value, name: (e.target.value + ' ' + (form.lastName || '')).trim() })} 
                                placeholder="Adınız" 
                                className={inputClass} 
                              />
                            </div>
                            <div>
                              <label className={labelClass}>Soyad *</label>
                              <input 
                                value={form.lastName || ''} 
                                onChange={e => setForm({ ...form, lastName: e.target.value, name: ((form.firstName || '') + ' ' + e.target.value).trim() })} 
                                placeholder="Soyadınız" 
                                className={inputClass} 
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className={labelClass}>TC Kimlik No *</label>
                              <input 
                                value={form.tcNo} 
                                onChange={e => setForm({ ...form, tcNo: e.target.value })} 
                                placeholder="11 haneli TC kimlik numaranız" 
                                className={inputClass} 
                                maxLength={11}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <label className={labelClass}>Şirket Adı *</label>
                              <input 
                                value={form.companyName} 
                                onChange={e => setForm({ ...form, companyName: e.target.value })} 
                                placeholder="Şirket unvanı" 
                                className={inputClass} 
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className={labelClass}>Vergi Dairesi *</label>
                                <input 
                                  value={form.taxOffice} 
                                  onChange={e => setForm({ ...form, taxOffice: e.target.value })} 
                                  placeholder="Vergi dairesi adı" 
                                  className={inputClass} 
                                />
                              </div>
                              <div>
                                <label className={labelClass}>Vergi No *</label>
                                <input 
                                  value={form.taxNo} 
                                  onChange={e => setForm({ ...form, taxNo: e.target.value })} 
                                  placeholder="10 haneli vergi numarası" 
                                  className={inputClass} 
                                  maxLength={10}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Adres Bilgileri */}
                        <div className="space-y-4">
                          <div>
                            <label className={labelClass}>Adres *</label>
                            <textarea 
                              value={form.address} 
                              onChange={e => setForm({ ...form, address: e.target.value })} 
                              placeholder="Mahalle, sokak, cadde, bina no, daire no" 
                              className={inputClass + " min-h-[80px] resize-none"} 
                              rows={3}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={labelClass}>İlçe *</label>
                              <input 
                                value={form.district} 
                                onChange={e => setForm({ ...form, district: e.target.value })} 
                                placeholder="İlçe seçiniz" 
                                className={inputClass} 
                              />
                            </div>
                            <div>
                              <label className={labelClass}>Şehir *</label>
                              <input 
                                value={form.city} 
                                onChange={e => setForm({ ...form, city: e.target.value })} 
                                placeholder="Şehir seçiniz" 
                                className={inputClass} 
                              />
                            </div>
                          </div>
                        </div>

                        {/* Butonlar */}
                        <div className="flex gap-3 pt-4 border-t border-gray-300">
                          <button 
                            onClick={handleSave} 
                            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors flex-1 md:flex-none"
                          >
                            Kaydet
                          </button>
                          <button 
                            onClick={() => { setEditingId(null); setForm(null); }} 
                            className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-semibold transition-colors flex-1 md:flex-none"
                          >
                            Vazgeç
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-full ${address.type === 'personal' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                            {address.type === 'personal' ? (
                              <Home className="w-6 h-6 text-blue-600" />
                            ) : (
                              <Building2 className="w-6 h-6 text-purple-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-800 mb-1">{address.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              address.type === 'personal' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {address.type === 'personal' ? 'Bireysel' : 'Kurumsal'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            className="p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors" 
                            onClick={() => handleEdit(address)}
                            title="Düzenle"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button 
                            className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors" 
                            onClick={() => handleDelete(address.id)}
                            title="Sil"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {address.type === 'personal' ? (
                            <>
                              <div>
                                <span className="font-semibold text-gray-700">Ad Soyad:</span>
                                <p className="text-gray-900 mt-1">{address.name}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700">TC Kimlik No:</span>
                                <p className="text-gray-900 mt-1">{address.tcNo}</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <span className="font-semibold text-gray-700">Şirket Adı:</span>
                                <p className="text-gray-900 mt-1">{address.companyName}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700">Vergi Dairesi:</span>
                                <p className="text-gray-900 mt-1">{address.taxOffice}</p>
                              </div>
                              <div className="md:col-span-2">
                                <span className="font-semibold text-gray-700">Vergi No:</span>
                                <p className="text-gray-900 mt-1">{address.taxNo}</p>
                              </div>
                            </>
                          )}
                          <div className="md:col-span-2">
                            <span className="font-semibold text-gray-700">Adres:</span>
                            <p className="text-gray-900 mt-1">{address.address}</p>
                          </div>
                          <div className="md:col-span-2">
                            <span className="font-semibold text-gray-700">Şehir / İlçe:</span>
                            <p className="text-gray-900 mt-1">{address.city} / {address.district}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  </div>
                ))
                )}
                {/* Yeni adres ekleme formu */}
              {isAdding && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-200 mt-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-green-600" />
                      Yeni Adres Ekle
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Fatura bilgilerinizi ekleyerek hızlı rezervasyon yapabilirsiniz.</p>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Adres Tipi ve Başlık */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Adres Tipi</label>
                        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={selectClass}>
                          <option value="personal">Bireysel</option>
                          <option value="corporate">Kurumsal</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Adres Başlığı *</label>
                        <input 
                          value={form.title} 
                          onChange={e => setForm({ ...form, title: e.target.value })} 
                          placeholder="Örn: Ev Adresi, İş Adresi" 
                          className={inputClass} 
                        />
                      </div>
                    </div>

                    {/* Bireysel/Kurumsal Bilgiler */}
                    {form.type === 'personal' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Ad *</label>
                          <input 
                            value={form.firstName || ''} 
                            onChange={e => setForm({ ...form, firstName: e.target.value, name: (e.target.value + ' ' + (form.lastName || '')).trim() })} 
                            placeholder="Adınız" 
                            className={inputClass} 
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Soyad *</label>
                          <input 
                            value={form.lastName || ''} 
                            onChange={e => setForm({ ...form, lastName: e.target.value, name: ((form.firstName || '') + ' ' + e.target.value).trim() })} 
                            placeholder="Soyadınız" 
                            className={inputClass} 
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className={labelClass}>TC Kimlik No *</label>
                          <input 
                            value={form.tcNo} 
                            onChange={e => setForm({ ...form, tcNo: e.target.value })} 
                            placeholder="11 haneli TC kimlik numaranız" 
                            className={inputClass} 
                            maxLength={11}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className={labelClass}>Şirket Adı *</label>
                          <input 
                            value={form.companyName} 
                            onChange={e => setForm({ ...form, companyName: e.target.value })} 
                            placeholder="Şirket unvanı" 
                            className={inputClass} 
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>Vergi Dairesi *</label>
                            <input 
                              value={form.taxOffice} 
                              onChange={e => setForm({ ...form, taxOffice: e.target.value })} 
                              placeholder="Vergi dairesi adı" 
                              className={inputClass} 
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Vergi No *</label>
                            <input 
                              value={form.taxNo} 
                              onChange={e => setForm({ ...form, taxNo: e.target.value })} 
                              placeholder="10 haneli vergi numarası" 
                              className={inputClass} 
                              maxLength={10}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Adres Bilgileri */}
                    <div className="space-y-4">
                      <div>
                        <label className={labelClass}>Adres *</label>
                        <textarea 
                          value={form.address} 
                          onChange={e => setForm({ ...form, address: e.target.value })} 
                          placeholder="Mahalle, sokak, cadde, bina no, daire no" 
                          className={inputClass + " min-h-[80px] resize-none"} 
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>İlçe *</label>
                          <input 
                            value={form.district} 
                            onChange={e => setForm({ ...form, district: e.target.value })} 
                            placeholder="İlçe seçiniz" 
                            className={inputClass} 
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Şehir *</label>
                          <input 
                            value={form.city} 
                            onChange={e => setForm({ ...form, city: e.target.value })} 
                            placeholder="Şehir seçiniz" 
                            className={inputClass} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Butonlar */}
                    <div className="flex gap-3 pt-4 border-t border-gray-300">
                      <button 
                        onClick={handleSave} 
                        className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors flex-1 md:flex-none shadow-lg"
                      >
                        <Plus className="w-4 h-4 inline mr-2" />
                        Adres Ekle
                      </button>
                      <button 
                        onClick={() => { setIsAdding(false); setForm(null); }} 
                        className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-semibold transition-colors flex-1 md:flex-none"
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