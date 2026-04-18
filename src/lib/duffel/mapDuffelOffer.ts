import type { SearchFlight } from '@/types/searchFlight';

type Carrier = { name?: string; iata_code?: string } | null | undefined;

type Segment = {
  origin?: { iata_code?: string };
  destination?: { iata_code?: string };
  departing_at?: string;
  arriving_at?: string;
  operating_carrier?: Carrier;
  marketing_carrier?: Carrier;
  marketing_flight_number?: string;
};

type Slice = {
  segments?: Segment[];
  duration?: string | null;
};

type DuffelOffer = {
  id: string;
  total_amount: string;
  total_currency: string;
  slices: Slice[];
};

function isoDurationToDisplay(iso: string): string {
  if (!iso) return '0s 0d';
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const h = m?.[1] ? parseInt(m[1], 10) : 0;
  const min = m?.[2] ? parseInt(m[2], 10) : 0;
  return `${h}s ${min}d`;
}

function mapSlice(
  offer: DuffelOffer,
  sliceIndex: number,
  legSuffix: '_out' | '_in'
): SearchFlight | null {
  const slice = offer.slices[sliceIndex];
  const segs = slice?.segments;
  if (!segs?.length) return null;

  const first = segs[0];
  const last = segs[segs.length - 1];
  const carrier = first.operating_carrier || first.marketing_carrier;
  const airlineName = carrier?.name || 'Airline';
  const iata = first.marketing_carrier?.iata_code || first.operating_carrier?.iata_code || '';
  const num = first.marketing_flight_number || '';
  const flightNumber = `${iata}${num}`.trim() || '—';

  const origin = first.origin?.iata_code || '';
  const destination = last.destination?.iata_code || '';
  const departureTime = first.departing_at || '';
  const arrivalTime = last.arriving_at || '';
  const direct = segs.length === 1;
  const duration = isoDurationToDisplay(slice.duration || '');
  const price = parseFloat(offer.total_amount) || 0;
  const currency = offer.total_currency || 'EUR';

  return {
    id: `${offer.id}${legSuffix}`,
    duffelOfferId: offer.id,
    airlineName,
    flightNumber,
    origin,
    destination,
    departureTime,
    arrivalTime,
    duration,
    price,
    currency,
    direct,
    baggage: 'Bagaj: teklife göre',
  };
}

export function mapDuffelOffersToSearchFlights(offers: DuffelOffer[]): {
  departureFlights: SearchFlight[];
  returnFlights: SearchFlight[];
} {
  const departureFlights: SearchFlight[] = [];
  const returnFlights: SearchFlight[] = [];

  for (const offer of offers) {
    if (!offer?.slices?.length) continue;
    const out = mapSlice(offer, 0, '_out');
    if (out) departureFlights.push(out);
    if (offer.slices.length > 1) {
      const inn = mapSlice(offer, 1, '_in');
      if (inn) returnFlights.push(inn);
    }
  }

  departureFlights.sort((a, b) => a.price - b.price);
  returnFlights.sort((a, b) => a.price - b.price);

  return { departureFlights, returnFlights };
}
