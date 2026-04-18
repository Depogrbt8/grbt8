'use client';

import { format } from 'date-fns';
import { formatFlightPrice } from '@/lib/formatFlightPrice';

interface Airline {
  name: string;
  logoUrl?: string;
}

interface CompactFlightCardProps {
  flight: any;
  airlinesList: Airline[];
  isSelected: boolean;
  onSelect: () => void;
}

export default function CompactFlightCard({ 
  flight, 
  airlinesList, 
  isSelected, 
  onSelect 
}: CompactFlightCardProps) {
  const airlineObj = airlinesList.find((a: Airline) => 
    a.name.toLowerCase() === (flight.airlineName || flight.airline || '').toLowerCase()
  );
  
  const departureTimeStr = flight.departureTime ? format(new Date(flight.departureTime), 'HH:mm') : '--:--';
  const arrivalTimeStr = flight.arrivalTime ? format(new Date(flight.arrivalTime), 'HH:mm') : '--:--';

  return (
    <div
      className={`bg-white border border-gray-200 p-3 mb-2 rounded-lg shadow-sm transition-all duration-200 cursor-pointer ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'hover:border-gray-300 hover:bg-gray-50 hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      {/* 1. SATIR: Havayolu + Saatler + Fiyat */}
      <div className="flex items-center justify-between mb-1">
        {/* Sol: Havayolu */}
        <div className="flex items-center gap-2">
          {airlineObj?.logoUrl ? (
            <img src={airlineObj.logoUrl} alt={airlineObj.name} className="h-5 w-5 object-contain" />
          ) : (
            <div className="h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold text-white">
              {(flight.airlineName || flight.airline || 'P')[0]}
            </div>
          )}
          <span className="text-sm font-medium text-gray-900">
            {airlineObj?.name || flight.airlineName || flight.airline || "Pegasus"}
          </span>
        </div>
        
        {/* Orta: Saatler */}
        <div className="text-sm font-medium text-gray-900">
          {departureTimeStr} → {arrivalTimeStr}
        </div>
        
        {/* Sağ: Fiyat */}
        <div className="text-lg font-bold text-gray-900">
          {formatFlightPrice(Number(flight.price) || 0, flight.currency || 'EUR')}
        </div>
      </div>

      {/* 2. SATIR: Rota + Direkt + Bagaj */}
      <div className="flex items-center justify-between">
        {/* Sol: Rota */}
        <div className="text-xs text-gray-600">
          {flight.origin} &gt; {flight.destination}
        </div>
        
        {/* Orta: Direkt etiketi */}
        {flight.direct && (
          <div className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
            Direkt
          </div>
        )}
        
        {/* Sağ: Bagaj bilgisi */}
        <div className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-500">
            <rect x="5" y="7" width="14" height="10" rx="2" fill="currentColor"/>
            <rect x="9" y="4" width="6" height="3" rx="1" fill="currentColor"/>
            <rect x="7" y="11" width="2" height="4" rx="1" fill="white"/>
            <rect x="15" y="11" width="2" height="4" rx="1" fill="white"/>
          </svg>
          <span className="text-xs text-gray-600">{flight.baggage || 'El çantası'}</span>
        </div>
      </div>
    </div>
  );
}
