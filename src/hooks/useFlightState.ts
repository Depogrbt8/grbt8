"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { parseAirport } from '@/utils/airport';
import type { SearchFlight } from '@/types/searchFlight';

interface UseFlightStateProps {
  origin: string;
  destination: string;
  tripType: string;
  selectedDeparture: Date | null;
  selectedReturn: Date | null;
  passengers: number;
}

export function useFlightState({
  origin,
  destination,
  tripType,
  selectedDeparture,
  selectedReturn,
  passengers,
}: UseFlightStateProps) {
  const [departureFlights, setDepartureFlights] = useState<SearchFlight[]>([]);
  const [returnFlights, setReturnFlights] = useState<SearchFlight[]>([]);
  const [loadingDeparture, setLoadingDeparture] = useState(false);
  const [loadingReturn, setLoadingReturn] = useState(false);
  const [errorDeparture, setErrorDeparture] = useState<string | null>(null);
  const [errorReturn, setErrorReturn] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDeparture) return;

    if (tripType === 'roundTrip' && !selectedReturn) {
      setDepartureFlights([]);
      setReturnFlights([]);
      setLoadingDeparture(false);
      setLoadingReturn(false);
      setErrorDeparture(null);
      setErrorReturn(null);
      return;
    }

    const originCode = parseAirport(origin).code;
    const destCode = parseAirport(destination).code;

    let cancelled = false;

    (async () => {
      setLoadingDeparture(true);
      setLoadingReturn(tripType === 'roundTrip');
      setErrorDeparture(null);
      setErrorReturn(null);

      try {
        const departureDate = format(selectedDeparture, 'yyyy-MM-dd');
        const returnDate =
          tripType === 'roundTrip' && selectedReturn ? format(selectedReturn, 'yyyy-MM-dd') : undefined;

        const res = await fetch('/api/flights/duffel-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: originCode,
            destination: destCode,
            departureDate,
            returnDate: returnDate || null,
            tripType: tripType === 'roundTrip' ? 'roundTrip' : 'oneWay',
            passengers,
            cabinClass: 'economy',
          }),
        });

        const json = await res.json();

        if (!res.ok) {
          const msg =
            json?.message ||
            json?.error ||
            (Array.isArray(json?.errors) ? json.errors[0]?.message : null) ||
            'Uçuş araması başarısız';
          throw new Error(typeof msg === 'string' ? msg : 'Uçuş araması başarısız');
        }

        if (cancelled) return;

        const data = json.data || {};
        setDepartureFlights(Array.isArray(data.departureFlights) ? data.departureFlights : []);
        setReturnFlights(Array.isArray(data.returnFlights) ? data.returnFlights : []);
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : 'Uçuşlar yüklenirken hata oluştu.';
        setErrorDeparture(msg);
        setErrorReturn(msg);
        setDepartureFlights([]);
        setReturnFlights([]);
      } finally {
        if (!cancelled) {
          setLoadingDeparture(false);
          setLoadingReturn(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedDeparture, selectedReturn, tripType, origin, destination, passengers]);

  return {
    departureFlights,
    returnFlights,
    loadingDeparture,
    loadingReturn,
    errorDeparture,
    errorReturn,
  };
}
