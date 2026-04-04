import axios from 'axios';
import { logger } from '@/lib/logger';

const BASE_URL = '/api/euro-rate';

export interface ExchangeRateResponse {
  eurTry: number | null;
  eurUsd?: number | null;
  source: string;
  timestamp: string;
}

function parseRate(data: { eurTry?: unknown; rate?: unknown }): number | null {
  const v = data.eurTry ?? data.rate;
  if (typeof v === 'number' && v > 0 && Number.isFinite(v)) return v;
  return null;
}

export async function getEuroRate(): Promise<number | null> {
  try {
    const response = await axios.get(BASE_URL);
    return parseRate(response.data);
  } catch (error) {
    logger.error('Döviz kuru çekilirken hata', { error });
    return null;
  }
}

export async function getExchangeRates(): Promise<ExchangeRateResponse> {
  try {
    const response = await axios.get(BASE_URL);
    const eurTry = parseRate(response.data);
    const eurUsd = response.data.eurUsd;
    return {
      eurTry,
      eurUsd: typeof eurUsd === 'number' && Number.isFinite(eurUsd) ? eurUsd : null,
      source: response.data.source ?? 'live',
      timestamp: response.data.timestamp ?? new Date().toISOString()
    };
  } catch (error) {
    logger.error('Döviz kurları çekilirken hata', { error });
    return {
      eurTry: null,
      eurUsd: null,
      source: 'error',
      timestamp: new Date().toISOString()
    };
  }
}
