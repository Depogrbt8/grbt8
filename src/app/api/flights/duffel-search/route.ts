import { ApiError, successResponse } from '@/utils/errorResponse';
import { duffelFetch, sleep } from '@/lib/duffel/client';
import { mapDuffelOffersToSearchFlights } from '@/lib/duffel/mapDuffelOffer';
import { parseAirport } from '@/utils/airport';

const MAX_OFFERS = 75;
const POLL_ATTEMPTS = 45;
const POLL_MS = 1000;

type OfferRequestResponse = {
  data: {
    id: string;
    offers?: unknown[];
    [key: string]: unknown;
  };
};

async function readDuffelErrorMessage(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { errors?: { message?: string; title?: string }[] };
    const e = j?.errors?.[0];
    const msg = e?.message || e?.title;
    if (msg) return msg;
  } catch {
    /* ignore */
  }
  return `Duffel yanıtı başarısız (${res.status})`;
}

async function pollOfferRequest(id: string): Promise<OfferRequestResponse['data']> {
  let last: OfferRequestResponse['data'] | null = null;
  for (let i = 0; i < POLL_ATTEMPTS; i++) {
    const res = await duffelFetch(`/air/offer_requests/${id}`);
    if (!res.ok) {
      throw new Error(await readDuffelErrorMessage(res));
    }
    const body = (await res.json()) as OfferRequestResponse;
    last = body.data;
    const offers = last.offers;
    if (Array.isArray(offers) && offers.length > 0) {
      return last;
    }
    await sleep(POLL_MS);
  }
  if (!last) {
    throw new Error('Duffel teklif isteği yanıt vermedi');
  }
  return last;
}

export async function POST(request: Request) {
  try {
    let body: {
      origin?: string;
      destination?: string;
      departureDate?: string;
      returnDate?: string | null;
      tripType?: string;
      passengers?: number;
      cabinClass?: string;
    };
    try {
      body = await request.json();
    } catch {
      return ApiError.validationError('Geçersiz JSON gövdesi');
    }

    const originCode = parseAirport(body.origin || '').code;
    const destCode = parseAirport(body.destination || '').code;
    const departureDate = body.departureDate?.trim();
    const returnDate = body.returnDate?.trim() || '';
    const tripType = body.tripType || 'oneWay';
    const passengers = Math.min(9, Math.max(1, Number(body.passengers) || 1));
    const cabinClass = body.cabinClass || 'economy';

    if (!originCode || !destCode || !departureDate) {
      return ApiError.validationError('origin, destination ve departureDate zorunludur');
    }

    if (tripType === 'roundTrip' && !returnDate) {
      return ApiError.validationError('Gidiş-dönüş için returnDate zorunludur');
    }

    const slices =
      tripType === 'roundTrip'
        ? [
            {
              origin: originCode,
              destination: destCode,
              departure_date: departureDate,
            },
            {
              origin: destCode,
              destination: originCode,
              departure_date: returnDate,
            },
          ]
        : [
            {
              origin: originCode,
              destination: destCode,
              departure_date: departureDate,
            },
          ];

    const passengersPayload = Array.from({ length: passengers }, () => ({ type: 'adult' as const }));

    const createRes = await duffelFetch(
      '/air/offer_requests?return_offers=true&supplier_timeout=20000',
      {
        method: 'POST',
        body: JSON.stringify({
          data: {
            slices,
            passengers: passengersPayload,
            cabin_class: cabinClass,
          },
        }),
      }
    );

    if (!createRes.ok) {
      return ApiError.externalApiError('Duffel arama', new Error(await readDuffelErrorMessage(createRes)));
    }

    const created = (await createRes.json()) as OfferRequestResponse;
    let data = created.data;
    let offers = data.offers;
    if (!Array.isArray(offers) || offers.length === 0) {
      data = await pollOfferRequest(data.id);
      offers = data.offers;
    }

    if (!Array.isArray(offers) || offers.length === 0) {
      return successResponse({
        departureFlights: [],
        returnFlights: [],
        offerRequestId: data.id,
      });
    }

    const limited = offers.slice(0, MAX_OFFERS) as Parameters<typeof mapDuffelOffersToSearchFlights>[0];
    const { departureFlights, returnFlights } = mapDuffelOffersToSearchFlights(limited);

    return successResponse({
      departureFlights,
      returnFlights,
      offerRequestId: data.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
    if (message.includes('DUFFEL_ACCESS_TOKEN')) {
      return ApiError.internalError(new Error('Duffel erişim anahtarı yapılandırılmamış'));
    }
    return ApiError.externalApiError('Duffel arama', err instanceof Error ? err : new Error(message));
  }
}
