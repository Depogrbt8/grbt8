'use client';

import { PlaneTakeoff, PlaneLanding } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface FlightDetailsCardProps {
    flight: any;
    returnFlight?: any; // Opsiyonel dönüş uçuşu
}

export default function FlightDetailsCard({ flight, returnFlight }: FlightDetailsCardProps) {
    // MOBİLDE DAHA KÜÇÜK VE SIKI TASARIM (geri alınabilir)
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (!flight) return null;

    const isRoundTrip = !!returnFlight;

    // Tek uçuş gösterimi
    const renderSingleFlight = (f: any, label?: string) => (
        <>
            {label && (
                <h3 className={`text-lg font-semibold text-gray-800 mb-3 ${isMobile ? 'mb-2 text-base' : ''}`}>
                    {label}
                </h3>
            )}
            <div className={`flex items-center justify-between ${isRoundTrip ? 'border-b pb-4 mb-4' : ''} ${isMobile ? 'pb-2 mb-2' : ''}`}>
                <div className="flex flex-col items-center flex-1">
                    <span className="font-bold text-base sm:text-lg">{f.origin}</span>
                    {isMobile ? (
                      <span className="flex flex-col items-center text-gray-500 text-xs mt-1 w-full">
                        <span className="flex items-center gap-1 justify-center w-full">
                          <PlaneTakeoff className="w-4 h-4 text-green-600" />
                          {f.departureTime ? format(new Date(f.departureTime), 'dd MMM yyyy', { locale: tr }) : ''}
                        </span>
                        <span className="block w-full text-center">{f.departureTime?.slice(11, 16)}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-500 text-sm">
                        <PlaneTakeoff className="w-6 h-6 text-green-600" />
                        {f.departureTime ? format(new Date(f.departureTime), 'dd MMM yyyy', { locale: tr }) : ''} - {f.departureTime?.slice(11, 16)}
                      </span>
                    )}
                </div>
                <div className="flex flex-col items-center flex-1 min-w-0">
                    <span className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}>{f.duration}</span>
                    <span className={`text-green-600 font-semibold ${isMobile ? 'text-xs mt-[-2px]' : 'text-sm'}`}>{f.direct ? 'Direkt' : 'Aktarmalı'}</span>
                    <span className={`text-gray-600 ${isMobile ? 'text-xs mt-1' : 'text-sm mt-1'}`}>{f.airlineName}</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                    <span className="font-bold text-base sm:text-lg">{f.destination}</span>
                    {isMobile ? (
                      <span className="flex flex-col items-center text-gray-500 text-xs mt-1 w-full">
                        <span className="flex items-center gap-1 justify-center w-full">
                          {f.arrivalTime ? format(new Date(f.arrivalTime), 'dd MMM yyyy', { locale: tr }) : ''}
                          <PlaneLanding className="w-4 h-4 text-green-600" />
                        </span>
                        <span className="block w-full text-center">{f.arrivalTime?.slice(11, 16)}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-500 text-sm">
                        {f.arrivalTime ? format(new Date(f.arrivalTime), 'dd MMM yyyy', { locale: tr }) : ''} - {f.arrivalTime?.slice(11, 16)}
                        <PlaneLanding className="w-6 h-6 text-green-600" />
                      </span>
                    )}
                </div>
            </div>
        </>
    );

    return (
        <div className={`bg-white rounded-lg shadow-md ${isMobile ? 'p-3' : 'p-6'} mb-6`}>
            <h2 className={`text-xl font-bold text-gray-800 mb-4 ${isMobile ? 'mb-2' : ''}`}>Uçuş Detayları</h2>
            {renderSingleFlight(flight, isRoundTrip ? 'Gidiş Uçuşu' : undefined)}
            {isRoundTrip && returnFlight && (
                <div className="mt-4">
                    {renderSingleFlight(returnFlight, 'Dönüş Uçuşu')}
                </div>
            )}
        </div>
    );
} 