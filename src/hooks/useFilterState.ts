"use client";

import { useState, useEffect, useMemo } from 'react';
import { Airline } from '@/types/airline';
import type { SearchFlight } from '@/types/searchFlight';

interface UseFilterStateProps {
  allFlights: SearchFlight[];
  airlinesList: Airline[];
}

export function useFilterState({ allFlights, airlinesList }: UseFilterStateProps) {
  // Filtre state'leri
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [departureHourRange, setDepartureHourRange] = useState<[number, number]>([0, 24]);
  const [arrivalHourRange, setArrivalHourRange] = useState<[number, number]>([0, 24]);
  const [flightDurationRange, setFlightDurationRange] = useState<[number, number]>([0, 24]);
  const [maxStops, setMaxStops] = useState<number>(2);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('EUR');
  const [selectedCabinClass, setSelectedCabinClass] = useState<string>('economy');

  // Havayolu listesi
  const airlines = useMemo(() => {
    if (allFlights.length === 0) return [];
    const allAirlines = allFlights.map(f => f.airlineName).filter(Boolean);
    return Array.from(new Set(allAirlines));
  }, [allFlights]);

  // Fiyat aralığını güncelle
  useEffect(() => {
    if (allFlights.length > 0) {
      const prices = allFlights.map(f => f.price);
      const min = Math.floor(Math.min(...prices));
      const max = Math.ceil(Math.max(...prices));
      setPriceRange([min, max]);
      setMaxPrice(max);
    }
  }, [allFlights]);

  // Havayolu değişikliği
  const handleAirlineChange = (airline: string) => {
    setSelectedAirlines(prev =>
      prev.includes(airline)
        ? prev.filter(a => a !== airline)
        : [...prev, airline]
    );
  };

  // Filtrelenmiş uçuşlar
  const filteredFlights = useMemo(() => {
    return allFlights.filter(flight => {
      const airlineMatch = selectedAirlines.length === 0 || selectedAirlines.includes(flight.airlineName);
      const priceMatch = flight.price <= maxPrice;
      
      // Kalkış saati filtresi
      const departureHour = parseInt(flight.departureTime.slice(11, 13), 10);
      const departureHourMatch = departureHour >= departureHourRange[0] && departureHour <= departureHourRange[1];
      
      // Varış saati filtresi
      const arrivalHour = parseInt(flight.arrivalTime.slice(11, 13), 10);
      const arrivalHourMatch = arrivalHour >= arrivalHourRange[0] && arrivalHour <= arrivalHourRange[1];
      
      // Uçuş süresi filtresi (saat cinsinden)
      const durationMatch = flight.duration ? (() => {
        const durationStr = flight.duration;
        const hoursMatch = durationStr.match(/(\d+)s/);
        const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
        return hours >= flightDurationRange[0] && hours <= flightDurationRange[1];
      })() : true;
      
      // Aktarma sayısı filtresi
      const stopsMatch = flight.direct ? (maxStops >= 0) : (maxStops >= 1);

      return airlineMatch && priceMatch && 
             departureHourMatch && arrivalHourMatch && durationMatch && stopsMatch;
    });
  }, [allFlights, selectedAirlines, maxPrice, 
      departureHourRange, arrivalHourRange, flightDurationRange, maxStops]);

  return {
    // State'ler
    selectedAirlines,
    priceRange,
    maxPrice,
    departureHourRange,
    arrivalHourRange,
    flightDurationRange,
    maxStops,
    selectedCurrency,
    selectedCabinClass,
    airlines,
    
    // Setter'lar
    setSelectedAirlines,
    setPriceRange,
    setMaxPrice,
    setDepartureHourRange,
    setArrivalHourRange,
    setFlightDurationRange,
    setMaxStops,
    setSelectedCurrency,
    setSelectedCabinClass,
    
    // Handler'lar
    handleAirlineChange,
    
    // Computed values
    filteredFlights,
  };
} 