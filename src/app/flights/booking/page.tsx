'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Mail } from 'lucide-react';
import { useSession } from 'next-auth/react';
import LoginModal from '@/components/LoginModal';
import { useRouter } from 'next/navigation';
import { addExtraBaggageBiletDukkaniDemo, createOrderBiletDukkaniDemo } from '@/services/flightApi';

// Import booking components
import FlightDetailsCard from '@/components/booking/FlightDetailsCard';
import ContactForm from '@/components/booking/ContactForm';
import PassengerList from '@/components/booking/PassengerList';
import BaggageSelection from '@/components/booking/BaggageSelection';
import PriceSummary from '@/components/booking/PriceSummary';
import ReservationModal from '@/components/booking/ReservationModal';
import ValidationPopup from '@/components/ValidationPopup';
import Footer from '@/components/Footer';
import { logger } from '@/lib/logger';

const initialPassengerState = {
    id: null,
    firstName: '',
    lastName: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    gender: '',
    identityNumber: '',
    isForeigner: false,
    shouldSave: false
};

interface PassengerDetail {
    id: string | null;
    firstName: string;
    lastName: string;
    birthDay: string;
    birthMonth: string;
    birthYear: string;
    gender: string;
    identityNumber: string;
    isForeigner: boolean;
    shouldSave: boolean;
    type: 'Yetişkin' | 'Çocuk';
}

export default function BookingPage() {
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [flight, setFlight] = useState<any>(null);
    const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 });
    const [savedPassengers, setSavedPassengers] = useState<any[]>([]);
    const [passengerDetails, setPassengerDetails] = useState<PassengerDetail[]>([]);
    const [baggageSelections, setBaggageSelections] = useState<any[]>([]);
    const [totalBaggagePrice, setTotalBaggagePrice] = useState(0);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [countryCode, setCountryCode] = useState('+90');
    const [marketingConsent, setMarketingConsent] = useState(false);
    const [bookingType, setBookingType] = useState<'reserve' | 'book'>('book');
    const [reservationModalOpen, setReservationModalOpen] = useState(false);
    const [reservationInfo, setReservationInfo] = useState<any>(null);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [showValidationPopup, setShowValidationPopup] = useState(false);
    const [saveTimeouts, setSaveTimeouts] = useState<{ [key: number]: NodeJS.Timeout }>({});

    useEffect(() => {
        const fetchSavedPassengers = async () => {
            try {
                const response = await fetch('/api/passengers');
                if (response.ok) {
                    const data = await response.json();
                    setSavedPassengers(data);
                } else {
                    logger.debug('Kayıtlı yolcular getirilemedi, kullanıcı giriş yapmamış olabilir');
                }
            } catch (error) {
                logger.error('Yolcu listesi getirme hatası', { error });
            }
        };

        fetchSavedPassengers();
        
        const flightData = searchParams.get('flight');
        const adults = parseInt(searchParams.get('adults') || '1', 10);
        const children = parseInt(searchParams.get('children') || '0', 10);
        const infants = parseInt(searchParams.get('infants') || '0', 10);
        
        setPassengers({ adults, children, infants });
        const total = adults + children;
        
        // Passenger details'ı her zaman initialize et
        const newPassengerDetails: PassengerDetail[] = Array(total).fill(null).map((_, i) => ({ 
            ...initialPassengerState,
            type: i < adults ? 'Yetişkin' as const : 'Çocuk' as const,
            isForeigner: false // Açıkça false olarak set et
        }));
        setPassengerDetails(newPassengerDetails);
        setBaggageSelections(Array(total).fill(null).map(() => [{ weight: 20, label: '20 kg Bagaj (Standart)', price: 0 }]));

        // Flight data'yı client-side'da parse et
        if (flightData && typeof window !== 'undefined') {
            try {
                // HTML entities'leri decode et
                const decodedFlight = decodeURIComponent(flightData)
                    .replace(/&quot;/g, '"')
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>');
                const parsedFlight = JSON.parse(decodedFlight);
                setFlight(parsedFlight);
            } catch (error) {
                logger.error("Uçuş verisi parse edilemedi", { error });
                logger.debug("Ham uçuş verisi", { flightData });
            }
        }

        if (session?.user) {
            if (session.user.email) {
                setContactEmail(session.user.email);
            }
            if (session.user.phone) {
                setContactPhone(session.user.phone);
            }
        }
    }, [searchParams, session]);
    
    const handlePassengerFormChange = (passengerIndex: number, field: string, value: any) => {
        logger.debug('Yolcu form değişikliği', { passengerIndex, field, value });
        
        // isForeigner değişikliğini özel olarak handle et
        if (field === 'isForeigner') {
            logger.debug('isForeigner değişti', { value, passengerIndex });
        }
        
        const newDetails = [...passengerDetails];
        
        // isForeigner true ise identityNumber'ı temizle
        if (field === 'isForeigner' && value === true) {
            newDetails[passengerIndex] = { 
                ...newDetails[passengerIndex], 
                [field]: value,
                identityNumber: '' // TC kimlik numarasını temizle
            };
            logger.debug('identityNumber temizlendi', { passengerIndex });
        } else {
            newDetails[passengerIndex] = { ...newDetails[passengerIndex], [field]: value };
        }
        
        setPassengerDetails(newDetails);
        
        // Eğer yolcu kaydetme işaretliyse ve gerekli alanlar doluysa otomatik kaydet
        if (newDetails[passengerIndex].shouldSave && 
            newDetails[passengerIndex].firstName && 
            newDetails[passengerIndex].lastName &&
            newDetails[passengerIndex].birthDay &&
            newDetails[passengerIndex].birthMonth &&
            newDetails[passengerIndex].birthYear &&
            newDetails[passengerIndex].gender) {
            
            // Önceki timeout'u temizle
            if (saveTimeouts[passengerIndex]) {
                clearTimeout(saveTimeouts[passengerIndex]);
            }
            
            // Yeni timeout ayarla
            const timeoutId = setTimeout(() => {
                savePassengerImmediately(passengerIndex, newDetails[passengerIndex]);
            }, 1000); // 1 saniye bekle
            
            setSaveTimeouts(prev => ({ ...prev, [passengerIndex]: timeoutId }));
        }
    };

    const handleSelectSavedPassenger = (passengerIndex: number, passengerData: any | null) => {
        const newDetails = [...passengerDetails];
        if (passengerData) {
            // Kayıtlı yolcu seçildiğinde isForeigner değerini doğru şekilde set et
            newDetails[passengerIndex] = { 
                ...passengerData, 
                shouldSave: false, 
                type: newDetails[passengerIndex].type,
                isForeigner: Boolean(passengerData.isForeigner) // Boolean'a çevir
            };
            logger.debug('Kayıtlı yolcu seçildi', { passengerId: passengerData.id, isForeigner: passengerData.isForeigner });
        } else {
            newDetails[passengerIndex] = { ...initialPassengerState, type: newDetails[passengerIndex].type };
        }
        setPassengerDetails(newDetails);
    };

    const handleSaveToggle = (passengerIndex: number, checked: boolean) => {
        const newDetails = [...passengerDetails];
        newDetails[passengerIndex].shouldSave = checked;
        setPassengerDetails(newDetails);
        
        // Eğer kaydetme işaretlendiyse ve yolcu bilgileri doluysa hemen kaydet
        if (checked && newDetails[passengerIndex].firstName && newDetails[passengerIndex].lastName) {
            savePassengerImmediately(passengerIndex, newDetails[passengerIndex]);
        }
    };
    
    const savePassengerImmediately = async (passengerIndex: number, passengerData: any) => {
        try {
            const payload = {
                firstName: passengerData.firstName,
                lastName: passengerData.lastName,
                birthDay: passengerData.birthDay,
                birthMonth: passengerData.birthMonth,
                birthYear: passengerData.birthYear,
                gender: passengerData.gender,
                identityNumber: passengerData.identityNumber,
                isForeigner: passengerData.isForeigner || false,
            };

            if (passengerData.id) { // Update existing passenger
                const response = await fetch(`/api/passengers/${passengerData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                if (response.ok) {
                    const updatedPassenger = await response.json();
                    const newDetails = [...passengerDetails];
                    newDetails[passengerIndex] = { ...newDetails[passengerIndex], ...updatedPassenger };
                    setPassengerDetails(newDetails);
                    logger.debug('Yolcu güncellendi', { passengerId: updatedPassenger.id });
                }
            } else { // Create new passenger
                const response = await fetch('/api/passengers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                if (response.ok) {
                    const newPassenger = await response.json();
                    const newDetails = [...passengerDetails];
                    newDetails[passengerIndex] = { ...newDetails[passengerIndex], id: newPassenger.id };
                    setPassengerDetails(newDetails);
                    
                    // Kayıtlı yolcular listesini güncelle
                    setSavedPassengers(prev => [newPassenger, ...prev]);
                    logger.debug('Yeni yolcu eklendi', { passengerId: newPassenger.id });
                }
            }
        } catch (error) {
            logger.error('Yolcu kaydetme hatası', { error });
        }
    };
    
    const handleBaggageChange = async (passengerIndex: number, legIndex: number, baggage: any) => {
        const newSelections = [...baggageSelections];
        if (!newSelections[passengerIndex]) newSelections[passengerIndex] = [];
        newSelections[passengerIndex][legIndex] = baggage;
        setBaggageSelections(newSelections);

        // Recalculate total baggage price
        const total = newSelections.flat().reduce((acc, val) => acc + (val?.price || 0), 0);
        setTotalBaggagePrice(total);

        // Demo: Ekstra bagaj API çağrısı
        if (baggage && baggage.weight > (flight.baggage ? parseInt(flight.baggage) : 20)) {
            // Demo sabitleriyle örnek çağrı
            const result = await addExtraBaggageBiletDukkaniDemo({
                fareExtraBaggages: [
                    {
                        fareId: 'demo-fare-id-12345',
                        flightId: flight.id?.toString() || 'demo-flight-id',
                        extraBaggageId: 'demo-baggage-id-1',
                        passengerIndex,
                        passengerType: passengerDetails[passengerIndex]?.type === 'Çocuk' ? 'child' : 'adult'
                    }
                ]
            });
            logger.debug('DEMO Ekstra Bagaj API sonucu', { result });
        }
    };

        const handleProceedToPayment = async () => {
        // Form validasyonu
        const errors = [];
        
        // İletişim bilgileri validasyonu
        if (!contactEmail || !contactEmail.includes('@')) {
            errors.push('Geçerli bir e-posta adresi giriniz');
        }
        
        if (!contactPhone) {
            errors.push('Telefon numarası giriniz');
        }
        
        // Yolcu bilgileri validasyonu
        passengerDetails.forEach((passenger, index) => {
            logger.debug(`Yolcu ${index + 1} validasyonu`, { 
                isForeigner: passenger.isForeigner, 
                hasIdentityNumber: !!passenger.identityNumber,
                hasFirstName: !!passenger.firstName 
            });
            
            if (!passenger.firstName.trim()) {
                errors.push(`${index + 1}. yolcu için ad giriniz`);
            }
            if (!passenger.lastName.trim()) {
                errors.push(`${index + 1}. yolcu için soyad giriniz`);
            }
            if (!passenger.birthDay || !passenger.birthMonth || !passenger.birthYear) {
                errors.push(`${index + 1}. yolcu için doğum tarihi giriniz`);
            }
            if (!passenger.gender) {
                errors.push(`${index + 1}. yolcu için cinsiyet seçiniz`);
            }
            // TC kimlik numarası validasyonu - sadece T.C. vatandaşları için gerekli
            const isForeigner = Boolean(passenger.isForeigner);
            const hasIdentityNumber = passenger.identityNumber.trim().length > 0;
            
            if (!isForeigner && !hasIdentityNumber) {
                logger.warn(`Yolcu ${index + 1} TC validasyonu başarısız`, {
                    isForeigner,
                    hasIdentityNumber
                });
                errors.push(`${index + 1}. yolcu için TC kimlik numarası giriniz`);
            }
        });
        
        // Hata varsa göster ve işlemi durdur
        if (errors.length > 0) {
            setValidationErrors(errors);
            setShowValidationPopup(true);
            return;
        }
        

        // Hata yoksa devam et
        proceedWithPayment();
    };

    const proceedWithPayment = async () => {
        if (!termsAccepted) {
            alert('Devam etmek için lütfen kullanım koşullarını kabul edin.');
            return;
        }

        // Yolcu bilgilerini kaydet/güncelle
        const promises = passengerDetails.map(p => {
            if (!p.shouldSave) return Promise.resolve();
            
            const payload = {
                firstName: p.firstName,
                lastName: p.lastName,
                birthDay: p.birthDay,
                birthMonth: p.birthMonth,
                birthYear: p.birthYear,
                gender: p.gender,
                identityNumber: p.identityNumber,
                isForeigner: p.isForeigner || false,
            };

            if (p.id) { // Update existing passenger
                return fetch(`/api/passengers/${p.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else { // Create new passenger
                return fetch('/api/passengers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
        });

        try {
            const results = await Promise.all(promises);
            logger.debug("Yolcu kaydetme/güncelleme sonuçları", { count: results.length });
            
            // BiletDukkani POST /orders demo çağrısı
            try {
                const orderResult = await createOrderBiletDukkaniDemo({
                    fareIds: ['demo-fare-id-12345'], // Demo fare ID
                    passengers: passengerDetails.map((p, idx) => ({
                        firstName: p.firstName,
                        lastName: p.lastName,
                        birthDay: p.birthDay,
                        birthMonth: p.birthMonth,
                        birthYear: p.birthYear,
                        gender: p.gender,
                        identityNumber: p.identityNumber,
                        isForeigner: p.isForeigner || false,
                        passengerType: idx === 0 ? 'Yetişkin' : 'Yetişkin' // İlk yolcu yetişkin, diğerleri de yetişkin (demo)
                    })),
                    contactInfo: {
                        firstName: session?.user?.firstName || passengerDetails[0]?.firstName || '',
                        lastName: session?.user?.lastName || passengerDetails[0]?.lastName || '',
                        email: contactEmail,
                        phone: contactPhone
                    },
                    marketingConsent: marketingConsent,
                    bookingType: bookingType,
                    orderType: 'individual',
                });
                
                if (bookingType === 'reserve') {
                    setReservationInfo({
                        pnr: orderResult.pnr,
                        validUntil: orderResult.orderDetails?.validUntil || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                        totalPrice: orderResult.orderDetails?.totalPrice || 50,
                        currency: orderResult.orderDetails?.currency || 'TRY',
                    });
                    setReservationModalOpen(true);
                } else {
                    // Rezervasyonu veritabanına kaydet
                    try {
                        const reservationData = {
                            type: 'flight',
                            status: orderResult.orderDetails?.status === 'confirmed' ? 'confirmed' : 'pending',
                            amount: orderResult.orderDetails?.totalPrice || finalTotalPrice,
                            currency: orderResult.orderDetails?.currency || 'EUR',
                            biletDukkaniOrderId: orderResult.orderId,
                            biletDukkaniRouteId: 'demo-route-id',
                            pnr: orderResult.pnr,
                            validUntil: orderResult.orderDetails?.validUntil,
                            passengers: JSON.stringify(passengerDetails),
                            flightNumber: flight.flightNumber,
                            origin: flight.from,
                            destination: flight.to,
                            departureTime: flight.departureTime,
                            arrivalTime: flight.arrivalTime,
                            airline: flight.airline,
                        };

                        const reservationResponse = await fetch('/api/reservations', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(reservationData)
                        });
                        
                        if (reservationResponse.ok) {
                            const savedReservation = await reservationResponse.json();
                            logger.info('Rezervasyon veritabanına kaydedildi', { reservationId: savedReservation.id, pnr: orderResult.pnr });
                            alert(`Biletleme başarıyla tamamlandı! PNR: ${orderResult.pnr}`);
                        } else {
                            const errorData = await reservationResponse.json();
                            logger.error('Rezervasyon kaydetme hatası', { error: errorData, pnr: orderResult.pnr });
                            alert(`Biletleme başarılı ama rezervasyon kaydedilemedi. PNR: ${orderResult.pnr}`);
                        }
                    } catch (dbError) {
                        logger.error('Veritabanı kaydetme hatası', { error: dbError, pnr: orderResult.pnr });
                        alert(`Biletleme başarılı ama rezervasyon kaydedilemedi. PNR: ${orderResult.pnr}`);
                    }
                }
            } catch (orderError) {
                logger.error("Sipariş oluşturma hatası", { error: orderError });
                alert('Sipariş oluşturulurken bir hata oluştu.');
            }
            
            // TODO: Navigate to the actual payment page
        } catch (error) {
            logger.error('Yolcu bilgilerini kaydetme hatası', { error });
            alert('Yolcu bilgilerini kaydederken bir hata oluştu.');
        }
    };

    if (!flight) {
        return (
            <div>
                <Header />
                <main className="container mx-auto px-4 py-8 text-center">
                    <p>Uçuş bilgileri yükleniyor veya bulunamadı...</p>
                </main>
            </div>
        );
    }

    const totalPassengers = passengers.adults + passengers.children;
    const baseTotalPrice = flight.price * totalPassengers;
    const taxes = baseTotalPrice * 0.1;
    const finalTotalPrice = baseTotalPrice + taxes + totalBaggagePrice;

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-100 py-8">
                <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        <FlightDetailsCard flight={flight} />
                        
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-3">
                                    <Mail /> İletişim Bilgileri
                                </h2>
                                {status !== 'authenticated' && (
                                    <p className="text-sm text-gray-600">
                                        Hızlı rezervasyon için{' '}
                                        <button onClick={() => setShowLoginModal(true)} className="text-green-600 font-semibold underline hover:text-green-700 transition">
                                            giriş yap
                                        </button>
                                    </p>
                                )}
                            </div>
                            <ContactForm 
                                userEmail={contactEmail}
                                userPhone={contactPhone}
                                onEmailChange={setContactEmail}
                                onPhoneChange={setContactPhone}
                                onCountryCodeChange={setCountryCode}
                            />
                        </div>

                        <PassengerList 
                            passengers={passengers}
                            passengerDetails={passengerDetails}
                            savedPassengers={savedPassengers}
                            flight={flight}
                            onSelectSavedPassenger={handleSelectSavedPassenger}
                            onPassengerFormChange={handlePassengerFormChange}
                            onSaveToggle={handleSaveToggle}
                        />

                        <BaggageSelection 
                            passengers={passengerDetails} 
                            flight={flight} 
                            onBaggageChange={handleBaggageChange}
                            baggageSelections={baggageSelections}
                        />
                    </div>

                    {/* Right Column: Price Summary */}
                    <div className="lg:col-span-1">
                        <PriceSummary 
                            totalPassengers={totalPassengers}
                            baseTotalPrice={baseTotalPrice}
                            totalBaggagePrice={totalBaggagePrice}
                            taxes={taxes}
                            finalTotalPrice={finalTotalPrice}
                            termsAccepted={termsAccepted}
                            bookingType={bookingType}
                            onTermsChange={setTermsAccepted}
                            onBookingTypeChange={setBookingType}
                            onProceedToPayment={handleProceedToPayment}
                        />
                    </div>
                </div>
                <ReservationModal 
                    isOpen={reservationModalOpen}
                    reservationInfo={reservationInfo}
                    onClose={() => setReservationModalOpen(false)}
                />
                <ValidationPopup 
                    isOpen={showValidationPopup}
                    errors={validationErrors}
                    onClose={() => setShowValidationPopup(false)}
                />
            </main>
            <Footer />
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
        </>
    );
} 