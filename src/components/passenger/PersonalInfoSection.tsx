'use client';

import { PersonalInfoSectionProps } from '@/types/passenger';
import DateSelector from './DateSelector';

export default function PersonalInfoSection({ formData, onFormDataChange }: PersonalInfoSectionProps) {
  const handleChange = (field: keyof typeof formData, value: any) => {
    // TC vatandaşı değil seçildiğinde TC No'yu temizle
    if (field === 'isForeigner' && value === true) {
      onFormDataChange({ 
        [field]: value,
        identityNumber: '' // TC No'yu temizle
      });
    } else {
      onFormDataChange({ [field]: value });
    }
  };

  const handleDateChange = (dateValue: { day: string; month: string; year: string }) => {
    onFormDataChange({
      birthDay: dateValue.day,
      birthMonth: dateValue.month,
      birthYear: dateValue.year
    });
  };

  return (
    <div className="sm:space-y-8 space-y-4">
      {/* 1. Satır: Ad, Soyad, TC Kimlik No */}
      <div className="sm:grid sm:grid-cols-3 sm:gap-6 grid grid-cols-1 gap-2">
        {/* Ad */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Ad</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className="w-full sm:px-4 px-2 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
            required
          />
        </div>
        {/* Soyad */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Soyad</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className="w-full sm:px-4 px-2 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
            required
          />
        </div>
        {/* TC Kimlik */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">TC Kimlik No</label>
          <input
            type="text"
            value={formData.identityNumber || ''}
            onChange={(e) => handleChange('identityNumber', e.target.value)}
            className="w-full sm:px-4 px-2 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm disabled:bg-gray-100 disabled:text-gray-500"
            maxLength={11}
            disabled={formData.isForeigner}
            placeholder={formData.isForeigner ? "TC vatandaşı değil" : "TC Kimlik No"}
          />
          <div className="mt-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isForeigner}
                onChange={(e) => handleChange('isForeigner', e.target.checked)}
                className="w-4 h-4 rounded text-green-500 focus:ring-green-500/20"
              />
              <span className="text-sm text-gray-600">TC Vatandaşı Değil</span>
            </label>
          </div>
        </div>
      </div>

      {/* 2. Satır: Doğum Tarihi, Ülke Kodu + Cep Telefonu, Cinsiyet */}
      <div className="sm:grid sm:grid-cols-3 sm:gap-8 grid grid-cols-1 gap-2">
        {/* Doğum Tarihi */}
        <DateSelector
          value={{
            day: formData.birthDay,
            month: formData.birthMonth,
            year: formData.birthYear
          }}
          onChange={handleDateChange}
          label="Doğum Tarihi"
        />
        
        {/* Ülke Kodu + Cep Telefonu */}
        <div>
          <div className="flex sm:gap-6 gap-2 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Ülke Kodu</label>
              <select
                value={formData.countryCode}
                onChange={(e) => handleChange('countryCode', e.target.value)}
                className="w-20 h-11 sm:px-3 px-1 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
              >
                <option value="">Seç</option>
                <option value="+90">🇹🇷 +90</option>
                <option value="+49">🇩🇪 +49</option>
                <option value="+33">🇫🇷 +33</option>
                <option value="+32">🇧🇪 +32</option>
                <option value="+31">🇳🇱 +31</option>
                <option value="+45">🇩🇰 +45</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+46">🇸🇪 +46</option>
                <option value="+41">🇨🇭 +41</option>
                <option value="+43">🇦🇹 +43</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Cep Telefonu</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full h-11 sm:px-3 px-1 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
                placeholder="555 666 77 77"
              />
            </div>
          </div>
        </div>
        
        {/* Cinsiyet */}
        <div className="flex flex-col justify-end pb-2">
          <label className="block text-sm text-gray-600 mb-2">Cinsiyet</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={formData.gender === 'male'}
                onChange={() => handleChange('gender', 'male')}
                className="w-4 h-4 text-green-500 focus:ring-green-500/20"
                required
              />
              <span className="text-gray-600">Erkek</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={formData.gender === 'female'}
                onChange={() => handleChange('gender', 'female')}
                className="w-4 h-4 text-green-500 focus:ring-green-500/20"
                required
              />
              <span className="text-gray-600">Kadın</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
} 