'use client';

import { useState, useCallback } from 'react';
import type { Hotel, HotelSearchParams, HotelSearchResult, HotelFilters } from '../types';
import { searchHotels } from '../services';

interface HotelState {
  hotels: Hotel[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  searchParams: HotelSearchParams | null;
  availableFilters: HotelSearchResult['filters'] | null;
}

const initialState: HotelState = {
  hotels: [],
  totalCount: 0,
  loading: false,
  error: null,
  searchParams: null,
  availableFilters: null
};

export function useHotelState() {
  const [state, setState] = useState<HotelState>(initialState);

  const search = useCallback(async (params: HotelSearchParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await searchHotels(params);
      
      setState({
        hotels: result.hotels,
        totalCount: result.totalCount,
        loading: false,
        error: null,
        searchParams: params,
        availableFilters: result.filters
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Otel arama hatası';
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage,
        hotels: [],
        totalCount: 0
      }));
      throw error;
    }
  }, []);

  const updateFilters = useCallback(async (filters: HotelFilters) => {
    if (!state.searchParams) return;

    const newParams: HotelSearchParams = {
      ...state.searchParams,
      filters
    };

    await search(newParams);
  }, [state.searchParams, search]);

  const clearSearch = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    search,
    updateFilters,
    clearSearch
  };
}

