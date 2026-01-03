'use client';

import { User, Mail, Phone } from 'lucide-react';
import type { GuestInfo } from '../../types';

interface GuestFormProps {
  guestInfo: GuestInfo;
  onChange: (info: GuestInfo) => void;
  errors?: Record<string, string>;
}

export default function GuestForm({ guestInfo, onChange, errors = {} }: GuestFormProps) {
  const handleChange = (field: keyof GuestInfo, value: string) => {
    onChange({
      ...guestInfo,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      {/* Ad Soyad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ad
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={guestInfo.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="Adınız"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-colors ${
                errors.firstName 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'
              }`}
            />
          </div>
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Soyad
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={guestInfo.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="Soyadınız"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-colors ${
                errors.lastName 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'
              }`}
            />
          </div>
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* E-posta */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          E-posta
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={guestInfo.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="ornek@email.com"
            className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-colors ${
              errors.email 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'
            }`}
          />
        </div>
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Rezervasyon onayı bu adrese gönderilecektir
        </p>
      </div>

      {/* Telefon */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Telefon
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="tel"
            value={guestInfo.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+90 5XX XXX XX XX"
            className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-colors ${
              errors.phone 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'
            }`}
          />
        </div>
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
        )}
      </div>

      {/* Ülke (opsiyonel) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ülke <span className="text-gray-400">(opsiyonel)</span>
        </label>
        <select
          value={guestInfo.country || ''}
          onChange={(e) => handleChange('country', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
        >
          <option value="">Seçiniz</option>
          <option value="TR">Türkiye</option>
          <option value="DE">Almanya</option>
          <option value="NL">Hollanda</option>
          <option value="BE">Belçika</option>
          <option value="AT">Avusturya</option>
          <option value="FR">Fransa</option>
          <option value="GB">İngiltere</option>
          <option value="CH">İsviçre</option>
          <option value="OTHER">Diğer</option>
        </select>
      </div>
    </div>
  );
}

