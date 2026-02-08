'use client';

import { useState, useEffect } from 'react';
import { Car, Calendar, MapPin, User, Phone, Mail, CreditCard, Filter, Download } from 'lucide-react';

interface CarBooking {
  id: string;
  bookingNumber: string;
  carName: string;
  carCategory: string;
  supplierName: string;
  pickupDateTime: string;
  dropoffDateTime: string;
  pickupLocation: any;
  dropoffLocation: any;
  driver: any;
  totalPrice: number;
  currency: string;
  status: string;
  createdAt: string;
  confirmationEmail: string;
}

export default function AracRezervasyonlariPage() {
  const [bookings, setBookings] = useState<CarBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchBookings();
  }, []);
  
  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/cars/bookings?limit=100');
      if (res.ok) {
        const json = await res.json();
        const bookings = json?.data?.bookings ?? [];
        setBookings(bookings);
      }
    } catch (error) {
      console.error('Rezervasyonlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredBookings = bookings.filter(b => {
    const matchesFilter = filter === 'all' || b.status === filter;
    const matchesSearch = 
      b.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.carName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.confirmationEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  
  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    completed: bookings.filter(b => b.status === 'completed').length
  };
  
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    
    const labels: Record<string, string> = {
      confirmed: 'Onaylandı',
      pending: 'Beklemede',
      cancelled: 'İptal',
      completed: 'Tamamlandı'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };
  
  const exportToCSV = () => {
    const headers = ['Rezervasyon No', 'Araç', 'Tedarikçi', 'Alış Tarihi', 'Teslim Tarihi', 'Sürücü', 'Email', 'Telefon', 'Fiyat', 'Durum'];
    const rows = filteredBookings.map(b => {
      const driver = JSON.parse(b.driver);
      const pickupLoc = JSON.parse(b.pickupLocation);
      return [
        b.bookingNumber,
        b.carName,
        b.supplierName,
        new Date(b.pickupDateTime).toLocaleString('tr-TR'),
        new Date(b.dropoffDateTime).toLocaleString('tr-TR'),
        `${driver.firstName} ${driver.lastName}`,
        driver.email,
        driver.phone,
        `${b.totalPrice} ${b.currency}`,
        b.status
      ];
    });
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arac-rezervasyonlari-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Araç Rezervasyonları</h1>
        <p className="text-gray-600">Tüm araç kiralama rezervasyonlarını görüntüleyin ve yönetin</p>
      </div>
      
      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Toplam</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Onaylı</div>
          <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Bekleyen</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">İptal</div>
          <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Tamamlanan</div>
          <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
        </div>
      </div>
      
      {/* Filtreler */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rezervasyon no, araç, email ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="confirmed">Onaylı</option>
              <option value="pending">Bekleyen</option>
              <option value="cancelled">İptal</option>
              <option value="completed">Tamamlanan</option>
            </select>
            
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Export</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Rezervasyon Listesi */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rezervasyon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Araç</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarihler</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sürücü</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiyat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Rezervasyon bulunamadı
                  </td>
                </tr>
              ) : (
                filteredBookings.map(booking => {
                  const driver = JSON.parse(booking.driver);
                  const pickupLoc = JSON.parse(booking.pickupLocation);
                  const dropoffLoc = JSON.parse(booking.dropoffLocation);
                  
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{booking.bookingNumber}</div>
                        <div className="text-sm text-gray-500">{booking.supplierName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{booking.carName}</div>
                        <div className="text-sm text-gray-500">{booking.carCategory}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-gray-900">
                            <MapPin className="w-3 h-3" />
                            {pickupLoc.name}
                          </div>
                          <div className="text-gray-500">
                            {new Date(booking.pickupDateTime).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                        <div className="text-sm mt-1">
                          <div className="flex items-center gap-1 text-gray-900">
                            <MapPin className="w-3 h-3" />
                            {dropoffLoc.name}
                          </div>
                          <div className="text-gray-500">
                            {new Date(booking.dropoffDateTime).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {driver.firstName} {driver.lastName}
                          </div>
                          <div className="text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {driver.email}
                          </div>
                          <div className="text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {driver.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {booking.totalPrice.toLocaleString('tr-TR')} {booking.currency}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
