'use client';

import { User } from 'lucide-react';
import type { GuestInfo } from '../../types';

interface GuestFormProps {
  guestInfo: GuestInfo;
  onChange: (info: GuestInfo) => void;
  errors?: Record<string, string>;
}

export default function GuestForm({ guestInfo, onChange, errors = {} }: GuestFormProps) {
  const handleChange = (field: keyof GuestInfo, value: string | boolean) => {
    onChange({
      ...guestInfo,
      [field]: value
    } as GuestInfo);
  };

  return (
    <div className="space-y-4">
      {/* Cinsiyet */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Cinsiyet:</label>
        <div className="flex items-center gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="male"
              checked={guestInfo.gender === 'male'}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="form-radio text-green-600 focus:ring-green-500"
            />
            <span className="ml-2 text-sm text-gray-700">Erkek</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="female"
              checked={guestInfo.gender === 'female'}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="form-radio text-green-600 focus:ring-green-500"
            />
            <span className="ml-2 text-sm text-gray-700">Kadın</span>
          </label>
        </div>
      </div>

      {/* Ad Soyad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adı*
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
            Soyadı*
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

      {/* Doğum Tarihi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Doğum Tarihi*
        </label>
        <div className="flex gap-2">
          <select
            value={guestInfo.birthDay || ''}
            onChange={(e) => handleChange('birthDay', e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
          >
            <option value="">Gün</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
              <option key={day} value={day.toString().padStart(2, '0')}>{day}</option>
            ))}
          </select>
          <select
            value={guestInfo.birthMonth || ''}
            onChange={(e) => handleChange('birthMonth', e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
          >
            <option value="">Ay</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month.toString().padStart(2, '0')}>{month}</option>
            ))}
          </select>
          <select
            value={guestInfo.birthYear || ''}
            onChange={(e) => handleChange('birthYear', e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
          >
            <option value="">Yıl</option>
            {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year.toString()}>{year}</option>
            ))}
          </select>
        </div>
        {(errors.birthDay || errors.birthMonth || errors.birthYear) && (
          <p className="text-red-500 text-sm mt-1">Doğum tarihi gereklidir</p>
        )}
      </div>

      {/* TC Kimlik No */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          TC Kimlik No
        </label>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={guestInfo.identityNumber || ''}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 11);
              handleChange('identityNumber', value);
            }}
            placeholder="TC Kimlik Numaranız"
            disabled={guestInfo.isForeigner}
            className={`flex-1 px-4 py-3 border rounded-lg outline-none transition-colors ${
              guestInfo.isForeigner 
                ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' 
                : errors.identityNumber
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'
            }`}
          />
          <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={guestInfo.isForeigner || false}
              onChange={(e) => {
                handleChange('isForeigner', e.target.checked);
                if (e.target.checked) {
                  handleChange('identityNumber', '');
                }
              }}
              className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">T.C. Vatandaşı Değil</span>
          </label>
        </div>
        {errors.identityNumber && (
          <p className="text-red-500 text-sm mt-1">{errors.identityNumber}</p>
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



