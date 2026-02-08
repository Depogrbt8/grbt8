// Araç Detay Hook

import { useState, useEffect } from 'react';
import { getCarDetails } from '../services';
import type { CarDetails } from '../types';

export function useCarDetails(carId: string, searchToken: string) {
  const [car, setCar] = useState<CarDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!carId || !searchToken) {
      setError('Geçersiz parametreler');
      setLoading(false);
      return;
    }
    
    const loadDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const details = await getCarDetails(carId, searchToken);
        setCar(details);
      } catch (err) {
        console.error('Car details error:', err);
        setError('Araç detayları yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    
    loadDetails();
  }, [carId, searchToken]);
  
  return { car, loading, error };
}
