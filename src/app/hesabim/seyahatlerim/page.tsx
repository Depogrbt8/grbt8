'use client';

import { useState, useEffect } from 'react';
import { getOrderRouteTicketsBiletDukkaniDemo, getOrderRouteAirRulesBiletDukkaniReal } from '@/services/flightApi';
import { TabType, FlightReservation, HotelReservation, CarReservation } from '@/types/travel';
import TabSelector from '@/components/travel/TabSelector';
import FlightCard from '@/components/travel/FlightCard';
import HotelCard from '@/components/travel/HotelCard';
import CarCard from '@/components/travel/CarCard';
import EmptyState from '@/components/travel/EmptyState';
import Footer from '@/components/Footer';
import { logger } from '@/lib/logger';

export default function SeyahatlerimPage() {
  const [activeTab, setActiveTab] = useState<TabType>('ucak');
  const [flightReservations, setFlightReservations] = useState<FlightReservation[]>([]);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [openDetailId, setOpenDetailId] = useState<string | null>(null);
  const [airRules, setAirRules] = useState<{ [flightId: string]: any[] }>({});
  const [airRulesLoading, setAirRulesLoading] = useState<string | null>(null);
  const [airRulesError, setAirRulesError] = useState<string | null>(null);
  
  // Otel rezervasyonları - API'den çekilir
  const [hotelReservations, setHotelReservations] = useState<HotelReservation[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [openHotelDetailId, setOpenHotelDetailId] = useState<string | null>(null);
  
  // Araç rezervasyonları (DEMO veriler)
  const [carReservations, setCarReservations] = useState<CarReservation[]>([
    {
      id: 'c1',
      car: 'Volkswagen Golf',
      type: 'Ekonomi, Dizel, Otomatik',
      plate: '34 ABC 123',
      pickupLocation: 'Sabiha Gökçen Havalimanı',
      pickupCity: 'İstanbul',
      pickupDate: '2024-09-01',
      pickupTime: '10:00',
      dropoffLocation: 'Esenboğa Havalimanı',
      dropoffCity: 'Ankara',
      dropoffDate: '2024-09-05',
      dropoffTime: '14:00',
      price: '2.100 TL',
      status: 'Onaylandı',
      reservationNo: 'CAR456789',
      payment: 'Kredi Kartı',
      services: ['Ek Sürücü', 'Çocuk Koltuğu', 'Tam Sigorta'],
      renter: 'Ali İncesu',
      rules: 'Araç en az %25 yakıt ile teslim edilmelidir. İptal 24 saat öncesine kadar ücretsizdir.',
      officePhone: '+90 216 123 45 67',
      notes: 'Beyaz renk, navigasyon opsiyonel.'
    }
  ]);
  const [openCarDetailId, setOpenCarDetailId] = useState<string | null>(null);

  // Rezervasyonları veritabanından çek
  useEffect(() => {
    async function fetchTickets() {
      setLoadingFlights(true);
      try {
        // Önce veritabanından kullanıcının rezervasyonlarını al
        const reservationsResponse = await fetch('/api/reservations?type=flight');
        if (reservationsResponse.ok) {
          const reservations = await reservationsResponse.json();
          logger.debug('Veritabanından gelen rezervasyonlar', { count: reservations.length });
          
          if (reservations.length > 0) {
            // Veritabanından gelen rezervasyonları dönüştür
            const results = reservations.map((reservation: any) => ({
              id: reservation.id,
              pnr: reservation.pnr,
              airline: reservation.airline || 'Turkish Airlines',
              from: reservation.origin || 'IST',
              to: reservation.destination || 'AMS',
              date: reservation.departureTime,
              time: reservation.departureTime ? new Date(reservation.departureTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '',
              arrivalTime: reservation.arrivalTime ? new Date(reservation.arrivalTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '',
              price: reservation.amount + ' ' + reservation.currency,
              status: reservation.status === 'confirmed' ? 'Onaylandı' : 'Beklemede',
              passengers: reservation.passengers ? JSON.parse(reservation.passengers).map((p: any) => ({
                name: `${p.firstName} ${p.lastName}`,
                seat: '12A',
                baggage: '20kg',
                ticketType: 'Ekonomi',
              })) : [],
              details: {
                payment: 'Kredi Kartı',
                rules: 'İade edilemez, değiştirilemez.'
              }
            }));
            setFlightReservations(results);
          } else {
            // Eğer rezervasyon yoksa demo verileri göster
            const demoOrderIds = [
              { orderId: 'demo-order-id-12345', routeId: 'demo-route-id-67890' },
              { orderId: 'demo-order-id-54321', routeId: 'demo-route-id-09876' }
            ];
            const results = await Promise.all(
              demoOrderIds.map(async ({ orderId, routeId }) => {
                const data = await getOrderRouteTicketsBiletDukkaniDemo(orderId, routeId);
                return {
                  id: orderId,
                  pnr: data.tickets[0]?.pnr,
                  airline: data.tickets[0]?.flightNumber,
                  from: data.tickets[0]?.origin,
                  to: data.tickets[0]?.destination,
                  date: data.tickets[0]?.departureTime,
                  time: data.tickets[0]?.departureTime ? new Date(data.tickets[0].departureTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '',
                  arrivalTime: '',
                  price: data.tickets[0]?.price + ' ' + data.tickets[0]?.currency,
                  status: data.tickets[0]?.status === 'confirmed' ? 'Onaylandı' : data.tickets[0]?.status,
                  passengers: [
                    {
                      name: data.tickets[0]?.passengerName,
                      seat: data.tickets[0]?.seat,
                      baggage: '20kg',
                      ticketType: 'Ekonomi',
                    }
                  ],
                  details: {
                    payment: 'Kredi Kartı',
                    rules: 'İade edilemez, değiştirilemez.'
                  }
                };
              })
            );
            setFlightReservations(results);
          }
        } else {
          // Eğer API hatası varsa demo verileri göster
          const demoOrderIds = [
            { orderId: 'demo-order-id-12345', routeId: 'demo-route-id-67890' },
            { orderId: 'demo-order-id-54321', routeId: 'demo-route-id-09876' }
          ];
          const results = await Promise.all(
            demoOrderIds.map(async ({ orderId, routeId }) => {
              const data = await getOrderRouteTicketsBiletDukkaniDemo(orderId, routeId);
              return {
                id: orderId,
                pnr: data.tickets[0]?.pnr,
                airline: data.tickets[0]?.flightNumber,
                from: data.tickets[0]?.origin,
                to: data.tickets[0]?.destination,
                date: data.tickets[0]?.departureTime,
                time: data.tickets[0]?.departureTime ? new Date(data.tickets[0].departureTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '',
                arrivalTime: '',
                price: data.tickets[0]?.price + ' ' + data.tickets[0]?.currency,
                status: data.tickets[0]?.status === 'confirmed' ? 'Onaylandı' : data.tickets[0]?.status,
                passengers: [
                  {
                    name: data.tickets[0]?.passengerName,
                    seat: data.tickets[0]?.seat,
                    baggage: '20kg',
                    ticketType: 'Ekonomi',
                  }
                ],
                details: {
                  payment: 'Kredi Kartı',
                  rules: 'İade edilemez, değiştirilemez.'
                }
              };
            })
          );
          setFlightReservations(results);
        }
      } catch (error) {
        logger.error('Rezervasyonlar yüklenirken hata', { error });
        setFlightReservations([]);
      } finally {
        setLoadingFlights(false);
      }
    }
    fetchTickets();
  }, []);

  // Otel rezervasyonlarını API'den çek
  useEffect(() => {
    async function fetchHotelBookings() {
      setLoadingHotels(true);
      try {
        const res = await fetch('/api/hotels/bookings', { credentials: 'include' });
        if (res.ok) {
          const json = await res.json();
          const raw = json?.data;
          const bookings = Array.isArray(raw) ? raw : (raw?.bookings ?? []);
          const mapped: HotelReservation[] = bookings.map((b: any) => {
            let guestsList: { name: string; type: string }[] = [];
            if (b.guestDetails) {
              try {
                const details = typeof b.guestDetails === 'string' ? JSON.parse(b.guestDetails) : b.guestDetails;
                guestsList = details.map((g: any) => ({
                  name: `${g.firstName || ''} ${g.lastName || ''}`.trim(),
                  type: g.type === 'child' ? 'Çocuk' : 'Yetişkin'
                }));
              } catch {
                // fallback
              }
            }
            if (guestsList.length === 0 && b.guestInfo) {
              try {
                const gi = typeof b.guestInfo === 'string' ? JSON.parse(b.guestInfo) : b.guestInfo;
                if (gi?.firstName || gi?.lastName) {
                  guestsList = [{ name: `${gi.firstName || ''} ${gi.lastName || ''}`.trim(), type: 'Yetişkin' }];
                }
              } catch {
                // fallback
              }
            }
            const checkInDate = b.checkIn ? new Date(b.checkIn) : null;
            const checkOutDate = b.checkOut ? new Date(b.checkOut) : null;
            return {
              id: b.id,
              hotelName: b.hotelName || '',
              imageUrl: b.hotelImageUrl || undefined,
              location: b.hotelLocation || '',
              address: b.hotelLocation || '',
              phone: '',
              checkIn: checkInDate?.toISOString().slice(0, 10) || '',
              checkOut: checkOutDate?.toISOString().slice(0, 10) || '',
              roomType: b.roomName || b.roomType || '',
              guests: guestsList,
              price: `${b.totalPrice ?? 0} ${b.currency ?? 'EUR'}`,
              status: b.status === 'confirmed' ? 'Onaylandı' : b.status === 'pending' ? 'Beklemede' : b.status || '',
              reservationNo: b.confirmationNumber || b.id,
              payment: 'Kredi Kartı',
              rules: b.cancellationPolicy || 'İptal politikası otel tarafından belirlenir.',
              services: [],
              checkInTime: '14:00',
              checkOutTime: '12:00',
              notes: b.specialRequests || ''
            };
          });
          setHotelReservations(mapped);
        } else {
          setHotelReservations([]);
        }
      } catch (err) {
        logger.error('Otel rezervasyonları yüklenirken hata', { error: err });
        setHotelReservations([]);
      } finally {
        setLoadingHotels(false);
      }
    }
    fetchHotelBookings();
  }, []);

  const handleOpenDetail = async (flight: FlightReservation) => {
    if (openDetailId === flight.id) {
      setOpenDetailId(null);
      return;
    }
    setOpenDetailId(flight.id);
    setAirRulesError(null);
    setAirRulesLoading(flight.id);
    try {
      // Demo amaçlı sabit token ve id'ler, gerçek API'de dinamik alınacak
      const token = 'DEMO_TOKEN';
      const rules = await getOrderRouteAirRulesBiletDukkaniReal(flight.id, flight.id, token);
      setAirRules(prev => ({ ...prev, [flight.id]: rules }));
    } catch (e: any) {
      setAirRulesError('Kural bilgisi alınamadı.');
    } finally {
      setAirRulesLoading(null);
    }
  };

  // Uçak içeriği
  const renderUcakContent = () => (
    <div className="bg-white rounded-lg shadow-sm sm:p-6 p-2">
      <h2 className="sm:text-xl text-lg font-bold mb-4 text-gray-700">Uçak Rezervasyonlarım</h2>
      {loadingFlights ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Rezervasyonlarınız yükleniyor...</p>
        </div>
      ) : flightReservations.length === 0 ? (
        <EmptyState type="flight" />
      ) : (
        <div className="max-h-[70vh] overflow-y-auto overflow-x-hidden pr-1">
          <div className="sm:space-y-4 space-y-2">
            {flightReservations.map(flight => (
              <FlightCard
              key={flight.id}
              flight={flight}
              airRules={airRules}
              airRulesLoading={airRulesLoading}
              airRulesError={airRulesError}
              onOpenDetail={handleOpenDetail}
              openDetailId={openDetailId}
            />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Otel içeriği
  const renderOtelContent = () => (
    <div className="bg-white rounded-lg shadow-sm sm:p-6 p-4">
      <h2 className="sm:text-xl text-lg font-bold mb-4 text-gray-700">Otel Rezervasyonlarım</h2>
      {loadingHotels ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Rezervasyonlarınız yükleniyor...</p>
        </div>
      ) : hotelReservations.length === 0 ? (
        <EmptyState type="hotel" />
      ) : (
        <div className="max-h-[70vh] overflow-y-auto overflow-x-hidden pr-1">
          <div className="sm:space-y-4 space-y-3">
            {hotelReservations.map(hotel => (
              <HotelCard
              key={hotel.id}
              hotel={hotel}
              openDetailId={openHotelDetailId}
              onToggleDetail={(id) => setOpenHotelDetailId((prev) => (prev === id ? null : id))}
            />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Araç içeriği
  const renderAracContent = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-700">Araç Rezervasyonlarım (DEMO)</h2>
      {carReservations.length === 0 ? (
        <EmptyState type="car" />
      ) : (
        <div className="max-h-[70vh] overflow-y-auto overflow-x-hidden pr-1">
          <div className="space-y-4">
            {carReservations.map(car => (
              <CarCard
              key={car.id}
              car={car}
              openDetailId={openCarDetailId}
              onToggleDetail={setOpenCarDetailId}
            />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // İçerik seçici
  const renderContent = () => {
    switch (activeTab) {
      case 'ucak':
        return renderUcakContent();
      case 'otel':
        return renderOtelContent();
      case 'arac':
        return renderAracContent();
      case 'esim':
        return <EmptyState type="esim" />;
      default:
        return <EmptyState type="default" />;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="sm:container sm:mx-auto sm:px-4 sm:py-8 px-0 py-2 w-full">
        <div className="sm:flex sm:gap-8 flex flex-col gap-2">
          <div className="flex-1 sm:space-y-6 space-y-2">
            {/* Sekmeler */}
            <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
            
            {/* İçerik */}
            <div className="sm:block block">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
} 