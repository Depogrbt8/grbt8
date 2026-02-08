// Araç Arama Hook

import { useState, useEffect } from 'react';
import { searchCars } from '../services';
import type { CarSearchParams, CarSearchResult } from '../types';

export function useCarSearch(params: CarSearchParams | null) {
  const [result, setResult] = useState<CarSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!params) return;
    
    const performSearch = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const searchResult = await searchCars(params);
        setResult(searchResult);
      } catch (err) {
        console.error('Car search error:', err);
        setError('Araç arama sırasında bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    
    performSearch();
  }, [params]);
  
  return { result, loading, error };
}
