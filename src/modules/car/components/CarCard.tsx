'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Users, Briefcase, Fuel, Gauge, Info, DoorOpen } from 'lucide-react';
import type { Car } from '../types';
import {
  TRANSMISSION_LABELS,
  FUEL_TYPE_LABELS,
  MILEAGE_TYPE_LABELS,
  CANCELLATION_TYPE_LABELS,
  CAR_CATEGORY_LABELS
} from '../types';

interface CarCardProps {
  car: Car;
  searchToken: string;
}

export default function CarCard({ car, searchToken }: CarCardProps) {
  const [imgError, setImgError] = useState(false);
  const detailUrl = `/cars/${car.id}?token=${searchToken}`;
  const categoryLabel = CAR_CATEGORY_LABELS[car.category] || car.category;

  return (
    <Link href={detailUrl} className="block">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        {/* Mobil: kompakt layout (resim solda, bilgi sağda + alt gri bar) */}
        <div className="md:hidden">
          <div className="flex">
            {/* Sol: küçük görsel */}
            <div className="relative w-28 h-24 flex-shrink-0 bg-gray-100">
              {!imgError ? (
                <Image
                  src={car.imageUrl}
                  alt={car.name}
                  fill
                  className="object-cover"
                  sizes="112px"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">🚗</div>
              )}
            </div>
            {/* Sağ: isim, özellikler */}
            <div className="flex-1 min-w-0 p-2.5 flex flex-col justify-center space-y-2">
              <h3 className="font-bold text-sm text-gray-900 line-clamp-1">{car.name}</h3>
              <p className="text-xs text-gray-500">veya benzeri · {categoryLabel}</p>
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  {car.seats}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                  {car.largeBags}B+{car.smallBags}K
                </span>
                <span className="flex items-center gap-1">
                  <DoorOpen className="w-3.5 h-3.5 text-gray-400" />
                  {car.doors}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-500">
                <span>{TRANSMISSION_LABELS[car.transmission]}</span>
                <span>·</span>
                <span>{MILEAGE_TYPE_LABELS[car.mileage.type]} KM</span>
                {car.airConditioning && <><span>·</span><span>Klimalı</span></>}
              </div>
            </div>
          </div>
          {/* Alt bar: bilgi + fiyat */}
          <div className="flex justify-between items-center px-2.5 py-2 bg-gray-50 border-t border-gray-100">
            <div className="text-xs text-gray-600 space-y-1.5">
              {car.supplierRating != null && (
                <div>
                  <span className="inline-block bg-gray-800 text-white font-bold px-1.5 py-0.5 rounded text-[10px] mr-1">
                    {car.supplierRating.toFixed(1)}
                  </span>
                  <span className="text-gray-600">Teklif mükemmel</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Info className="w-3 h-3 shrink-0" />
                <span>{CANCELLATION_TYPE_LABELS[car.cancellation.type]}</span>
              </div>
              {car.depositAmount != null && (
                <div className="text-gray-500">
                  Depozito: {car.depositAmount} {car.currency}
                </div>
              )}
              <div className="text-gray-500">
                <span>{car.supplierName}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[10px] text-gray-500">Toplam fiyat</div>
              <div className="text-lg font-bold text-green-600">
                {car.totalPrice.toLocaleString('tr-TR')} {car.currency}
              </div>
              <div className="text-[10px] text-gray-400">
                ({car.pricePerDay.toLocaleString('tr-TR')} {car.currency}/gün)
              </div>
            </div>
          </div>
        </div>

        {/* Masaüstü: mevcut geniş layout */}
        <div className="hidden md:flex flex-col md:flex-row">
          <div className="relative w-full md:w-72 h-48 md:h-auto flex-shrink-0 bg-gray-100">
            {!imgError ? (
              <Image
                src={car.imageUrl}
                alt={car.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 288px"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">🚗</div>
            )}
          </div>
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start gap-2 mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{car.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {car.supplierLogo && (
                      <div className="relative w-16 h-6">
                        <Image src={car.supplierLogo} alt={car.supplierName} fill className="object-contain" sizes="64px" />
                      </div>
                    )}
                    <span className="text-sm text-gray-600">{car.supplierName}</span>
                    {car.supplierRating != null && (
                      <span className="text-xs text-gray-500">⭐ {car.supplierRating.toFixed(1)}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{car.seats} Kişi</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span>{car.largeBags}B + {car.smallBags}K</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Gauge className="w-4 h-4 text-gray-400" />
                  <span>{TRANSMISSION_LABELS[car.transmission]}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Fuel className="w-4 h-4 text-gray-400" />
                  <span>{FUEL_TYPE_LABELS[car.fuelType]}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {car.airConditioning && (
                  <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">❄️ Klima</span>
                )}
                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                  {MILEAGE_TYPE_LABELS[car.mileage.type]} KM
                </span>
                {car.mileage.type === 'limited' && car.mileage.distance != null && (
                  <span className="text-xs text-gray-500">({car.mileage.distance} km/gün)</span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-end mt-4 pt-3 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                <div className="flex items-center gap-1 text-xs">
                  <Info className="w-3 h-3" />
                  <span>{CANCELLATION_TYPE_LABELS[car.cancellation.type]}</span>
                </div>
                {car.depositAmount != null && (
                  <div className="text-xs text-gray-500 mt-1">Depozito: {car.depositAmount} {car.currency}</div>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Toplam fiyat</div>
                <div className="text-2xl font-bold text-green-600">
                  {car.totalPrice.toLocaleString('tr-TR')} {car.currency}
                </div>
                <div className="text-xs text-gray-400">({car.pricePerDay.toLocaleString('tr-TR')} {car.currency}/gün)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
