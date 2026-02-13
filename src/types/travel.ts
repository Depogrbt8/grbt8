// Seyahatlerim sayfası için tip tanımları

export type Passenger = {
  name: string;
  seat: string;
  baggage: string;
  ticketType: string;
};

export type FlightReservation = {
  id: string;
  pnr: string;
  airline: string;
  from: string;
  to: string;
  date: string;
  time: string;
  arrivalTime: string;
  price: string;
  status: string;
  passengers: Passenger[];
  details: {
    payment: string;
    rules: string;
  };
};

export type HotelGuest = {
  name: string;
  type: string;
};

export type HotelReservation = {
  id: string;
  hotelName: string;
  imageUrl?: string;
  location: string;
  address: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  guests: HotelGuest[];
  price: string;
  status: string;
  reservationNo: string;
  payment: string;
  rules: string;
  services: string[];
  checkInTime: string;
  checkOutTime: string;
  notes: string;
};

export type CarReservation = {
  id: string;
  car: string;
  imageUrl?: string;
  type: string;
  plate: string;
  pickupLocation: string;
  pickupCity: string;
  pickupDate: string;
  pickupTime: string;
  dropoffLocation: string;
  dropoffCity: string;
  dropoffDate: string;
  dropoffTime: string;
  price: string;
  status: string;
  reservationNo: string;
  payment: string;
  services: string[];
  renter: string;
  rules: string;
  officePhone: string;
  notes: string;
};

export type TabType = 'ucak' | 'otel' | 'arac' | 'esim'; 