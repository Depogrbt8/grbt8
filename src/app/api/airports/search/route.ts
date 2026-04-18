import { successResponse } from '@/utils/errorResponse';
import { filterStaticAirports } from '@/data/airportsStatic';

/** Yerel indeks (Duffel’de metin araması yok); harici API anahtarı gerektirmez */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return successResponse([]);
  }

  return successResponse(filterStaticAirports(query));
}
