/** Uçuş arama sonuç kartı (Duffel veya diğer kaynaklar) */
export interface SearchFlight {
  id: string;
  /** Duffel `offer` id — gidiş-dönüşte gidiş ve dönüş satırını eşleştirmek için */
  duffelOfferId: string;
  airlineName: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  direct: boolean;
  baggage: string;
}
