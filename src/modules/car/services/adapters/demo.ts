// Demo Araç Kiralama API Adapter
// Booking.com Cars API formatına uygun mock data

import type { CarRentalAPI } from '../api';
import type {
  CarSearchParams,
  CarSearchResult,
  CarDetails,
  CarBookingData,
  CarBooking,
  LocationSearchResult,
  Car,
  CarLocation,
  ExtraService,
  InsuranceOption
} from '../../types';

/**
 * Demo API Adapter
 * Gerçek API'ye geçişte bu adapter değiştirilecek
 */
export class DemoCarAPI implements CarRentalAPI {
  private mockBookings: Map<string, CarBooking> = new Map();
  
  /**
   * Araç ara
   */
  async searchCars(params: CarSearchParams): Promise<CarSearchResult> {
    // Simüle edilmiş gecikme
    await this.delay(800);
    
    const { route, driver, filters, maximumResults = 100 } = params;
    
    // Mock araçlar
    let cars = this.generateMockCars(route.pickup.location, route.dropoff.location);
    
    // Filtreleme
    if (filters) {
      cars = this.applyFilters(cars, filters);
    }
    
    // Sıralama
    if (params.sort) {
      cars = this.sortCars(cars, params.sort.by, params.sort.direction);
    }
    
    // Sayfalama
    const limit = Math.min(maximumResults, 500);
    const paginatedCars = cars.slice(0, limit);
    
    // Search token oluştur (90 dakika geçerli)
    const searchToken = this.generateSearchToken(params);
    
    return {
      requestId: this.generateRequestId(),
      data: paginatedCars,
      metadata: {
        totalResults: cars.length,
        nextPage: cars.length > limit ? this.generatePageToken(limit) : undefined,
        searchToken
      },
      searchParams: params
    };
  }
  
  /**
   * Araç detaylarını getir
   */
  async getCarDetails(carId: string, searchToken: string): Promise<CarDetails> {
    await this.delay(500);
    
    const car = this.getMockCarById(carId);
    if (!car) {
      throw new Error('Araç bulunamadı');
    }
    
    return {
      ...car,
      description: `${car.name} ile konforlu ve güvenli bir yolculuk deneyimi yaşayın. ${car.seats} kişilik, ${car.transmission === 'automatic' ? 'otomatik vites' : 'manuel vites'}, ${car.airConditioning ? 'klimalı' : 'klimasız'} bu araç, şehir içi ve şehirlerarası yolculuklarınız için idealdir.`,
      images: [
        car.imageUrl,
        '/images/cars/placeholder.svg',
        '/images/cars/placeholder.svg',
        '/images/cars/placeholder.svg'
      ],
      specifications: {
        make: car.name.split(' ')[0],
        model: car.name.split(' ')[1],
        year: 2023,
        engine: '1.6L',
        power: '110 HP',
        fuelConsumption: '6.5L/100km',
        co2Emission: '120g/km'
      },
      features: [
        'ABS Fren Sistemi',
        'ESP Elektronik Denge Kontrolü',
        'Hava Yastığı (Sürücü & Yolcu)',
        'Merkezi Kilit',
        'Elektrikli Camlar',
        'Bluetooth',
        'USB Girişi',
        car.airConditioning ? 'Klima' : '',
        'Ayarlanabilir Direksiyon'
      ].filter(Boolean),
      rentalConditions: {
        minimumAge: 21,
        minimumLicenseAge: 1,
        youngDriverFee: {
          ageRange: '21-25',
          amount: 15,
          currency: car.currency
        },
        additionalDriverFee: {
          amount: 10,
          currency: car.currency,
          perDriver: true
        },
        crossBorderAllowed: true,
        crossBorderFee: 50
      },
      insuranceOptions: this.getMockInsuranceOptions(car.currency),
      extraServices: this.getMockExtraServices(car.currency),
      policies: {
        cancellation: 'Alış tarihinden 48 saat öncesine kadar ücretsiz iptal. Sonrasında 1 günlük ücret kesilir.',
        amendment: 'Değişiklik ücreti: 25 EUR. Alış tarihinden 24 saat öncesine kadar yapılabilir.',
        lateReturn: 'Geç teslim: İlk 1 saat ücretsiz, sonrasında saatlik ücret uygulanır.',
        earlyReturn: 'Erken teslim: İade yapılmaz.',
        damage: `Hasar durumunda muafiyet: ${car.excessAmount} ${car.currency}. Tam kasko sigortası ile muafiyet sıfırlanabilir.`,
        theft: `Çalınma durumunda muafiyet: ${car.excessAmount} ${car.currency}.`
      },
      supplier: {
        id: car.supplierId,
        name: car.supplierName,
        logo: car.supplierLogo,
        rating: car.supplierRating || 4.5,
        reviewCount: Math.floor(Math.random() * 1000) + 100,
        phone: '+90 850 XXX XX XX',
        email: 'info@' + car.supplierName.toLowerCase() + '.com',
        workingHours: '08:00 - 22:00'
      }
    };
  }
  
  /**
   * Müsaitlik kontrolü
   */
  async checkAvailability(carId: string, searchToken: string) {
    await this.delay(300);
    
    // %95 müsait
    const available = Math.random() > 0.05;
    
    if (!available) {
      return {
        available: false,
        message: 'Bu araç seçtiğiniz tarihler için müsait değil. Lütfen başka bir araç seçin.'
      };
    }
    
    const car = this.getMockCarById(carId);
    return {
      available: true,
      price: car?.totalPrice,
      message: 'Araç müsait'
    };
  }
  
  /**
   * Rezervasyon oluştur
   */
  async createBooking(data: CarBookingData): Promise<CarBooking> {
    await this.delay(1000);
    
    const car = this.getMockCarById(data.carId);
    if (!car) {
      throw new Error('Araç bulunamadı');
    }
    
    const bookingNumber = this.generateBookingNumber();
    const pickupLocation = await this.getLocationById(data.route.pickup.depotId.toString());
    const dropoffLocation = await this.getLocationById(data.route.dropoff.depotId.toString());
    
    // Fiyat hesaplama
    const priceBreakdown = this.calculatePrice(car, data);
    
    const booking: CarBooking = {
      id: this.generateId(),
      bookingNumber,
      bookingReference: 'DEMO-' + bookingNumber,
      car,
      route: {
        pickup: {
          location: pickupLocation,
          depot: {
            id: data.route.pickup.depotId,
            name: pickupLocation.name + ' Ofisi',
            address: pickupLocation.address || pickupLocation.name,
            phone: '+90 850 XXX XX XX',
            workingHours: '08:00 - 22:00'
          },
          datetime: data.route.pickup.datetime
        },
        dropoff: {
          location: dropoffLocation,
          depot: {
            id: data.route.dropoff.depotId,
            name: dropoffLocation.name + ' Ofisi',
            address: dropoffLocation.address || dropoffLocation.name,
            phone: '+90 850 XXX XX XX',
            workingHours: '08:00 - 22:00'
          },
          datetime: data.route.dropoff.datetime
        }
      },
      driver: data.driver,
      additionalDrivers: data.additionalDrivers,
      extras: data.extras?.map(e => {
        const service = this.getMockExtraServices('EUR').find(s => s.id === e.serviceId);
        return service!;
      }).filter(Boolean) || [],
      insurance: data.insurance ? this.getMockInsuranceOptions('EUR').find(i => i.id === data.insurance!.optionId) : undefined,
      priceBreakdown,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      confirmationEmail: data.driver.email,
      confirmationSms: data.driver.countryCode + data.driver.phone,
      cancellationPolicy: 'Alış tarihinden 48 saat öncesine kadar ücretsiz iptal.',
      provider: 'demo',
      providerBookingId: 'DEMO-' + this.generateId()
    };
    
    this.mockBookings.set(booking.id, booking);
    
    return booking;
  }
  
  /**
   * Rezervasyon detayını getir
   */
  async getBooking(bookingId: string): Promise<CarBooking> {
    await this.delay(300);
    
    const booking = this.mockBookings.get(bookingId);
    if (!booking) {
      throw new Error('Rezervasyon bulunamadı');
    }
    
    return booking;
  }
  
  /**
   * Rezervasyonu iptal et
   */
  async cancelBooking(bookingId: string, reason?: string) {
    await this.delay(500);
    
    const booking = this.mockBookings.get(bookingId);
    if (!booking) {
      throw new Error('Rezervasyon bulunamadı');
    }
    
    // İptal politikasına göre iade hesapla
    const pickupDate = new Date(booking.route.pickup.datetime);
    const now = new Date();
    const hoursUntilPickup = (pickupDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    let refundPercentage = 0;
    if (hoursUntilPickup >= 48) {
      refundPercentage = 100; // Tam iade
    } else if (hoursUntilPickup >= 24) {
      refundPercentage = 50; // %50 iade
    }
    
    const refundAmount = (booking.priceBreakdown.total * refundPercentage) / 100;
    
    booking.status = 'cancelled';
    booking.cancelledAt = now.toISOString();
    
    return {
      success: true,
      refundAmount,
      message: refundPercentage === 100 
        ? 'Rezervasyonunuz iptal edildi. Tam iade yapılacaktır.'
        : refundPercentage > 0
        ? `Rezervasyonunuz iptal edildi. %${refundPercentage} iade yapılacaktır.`
        : 'Rezervasyonunuz iptal edildi. İade yapılmayacaktır.'
    };
  }
  
  /**
   * Lokasyon ara
   */
  async searchLocations(query: string, type: 'airport' | 'city' | 'all' = 'all'): Promise<LocationSearchResult[]> {
    await this.delay(200);
    
    const allLocations = this.getMockLocations();
    const lowerQuery = query.toLowerCase();
    
    return allLocations
      .filter(loc => {
        const matchesQuery = 
          loc.name.toLowerCase().includes(lowerQuery) ||
          loc.city.toLowerCase().includes(lowerQuery) ||
          (loc.airport && loc.airport.toLowerCase().includes(lowerQuery));
        
        const matchesType = type === 'all' || loc.type === type;
        
        return matchesQuery && matchesType;
      })
      .slice(0, 10)
      .map(loc => ({
        ...loc,
        highlight: this.highlightMatch(loc.name, query)
      }));
  }
  
  /**
   * Popüler lokasyonları getir
   */
  async getPopularLocations(country: string = 'TR'): Promise<LocationSearchResult[]> {
    await this.delay(200);
    
    const popularIds = [
      'IST-airport',
      'AYT-airport',
      'ADB-airport',
      'SAW-airport',
      'ESB-airport',
      'DLM-airport'
    ];
    
    return this.getMockLocations()
      .filter(loc => popularIds.includes(loc.id))
      .map(loc => ({ ...loc, highlight: loc.name }));
  }
  
  // ========== HELPER METHODS ==========
  
  private generateMockCars(pickup: CarLocation, dropoff: CarLocation): Car[] {
    const carImagePlaceholder = '/images/cars/placeholder.svg';
    const supplierLogoPlaceholder = '/images/suppliers/placeholder.svg';
    const suppliers = [
      { id: 7455, name: 'Garenta', logo: supplierLogoPlaceholder, rating: 4.5 },
      { id: 7456, name: 'Avis', logo: supplierLogoPlaceholder, rating: 4.3 },
      { id: 7457, name: 'Budget', logo: supplierLogoPlaceholder, rating: 4.2 },
      { id: 7458, name: 'Enterprise', logo: supplierLogoPlaceholder, rating: 4.4 },
      { id: 7459, name: 'Sixt', logo: supplierLogoPlaceholder, rating: 4.6 }
    ];
    
    const carTemplates = [
      { name: 'Fiat Egea', category: 'compact' as const, seats: 5, doors: 4, image: carImagePlaceholder },
      { name: 'Renault Clio', category: 'economy' as const, seats: 5, doors: 4, image: carImagePlaceholder },
      { name: 'Volkswagen Golf', category: 'compact' as const, seats: 5, doors: 4, image: carImagePlaceholder },
      { name: 'Toyota Corolla', category: 'intermediate' as const, seats: 5, doors: 4, image: carImagePlaceholder },
      { name: 'Hyundai i20', category: 'economy' as const, seats: 5, doors: 4, image: carImagePlaceholder },
      { name: 'Peugeot 301', category: 'compact' as const, seats: 5, doors: 4, image: carImagePlaceholder },
      { name: 'BMW 3 Serisi', category: 'premium' as const, seats: 5, doors: 4, image: carImagePlaceholder },
      { name: 'Mercedes C-Class', category: 'luxury' as const, seats: 5, doors: 4, image: carImagePlaceholder },
      { name: 'Dacia Duster', category: 'suv' as const, seats: 5, doors: 4, image: carImagePlaceholder },
      { name: 'Ford Transit', category: 'minivan' as const, seats: 9, doors: 4, image: carImagePlaceholder }
    ];
    
    const cars: Car[] = [];
    
    carTemplates.forEach((template, idx) => {
      suppliers.forEach((supplier, sidx) => {
        const basePrice = this.getBasePriceForCategory(template.category);
        const priceVariation = 1 + (Math.random() * 0.3 - 0.15); // ±15%
        const totalPrice = Math.round(basePrice * priceVariation);
        
        cars.push({
          id: `car-${idx}-${sidx}`,
          name: template.name + ' veya benzeri',
          category: template.category,
          imageUrl: template.image,
          transmission: Math.random() > 0.3 ? 'automatic' : 'manual',
          fuelType: Math.random() > 0.7 ? 'diesel' : 'petrol',
          airConditioning: Math.random() > 0.2,
          seats: template.seats,
          doors: template.doors,
          largeBags: template.category === 'minivan' ? 4 : template.category === 'suv' ? 3 : 2,
          smallBags: 2,
          pricePerDay: Math.round(totalPrice / 7),
          totalPrice,
          currency: 'EUR',
          supplierId: supplier.id,
          supplierName: supplier.name,
          supplierLogo: supplier.logo,
          supplierRating: supplier.rating,
          mileage: {
            type: Math.random() > 0.4 ? 'unlimited' : 'limited',
            distance: Math.random() > 0.4 ? undefined : 200,
            distanceUnit: 'kilometers',
            extraCostPerUnit: 0.15
          },
          fuelPolicy: 'full_to_full',
          cancellation: {
            type: Math.random() > 0.3 ? 'free_cancellation' : 'non_refundable',
            freeCancellationBefore: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
          },
          depositAmount: 500,
          excessAmount: template.category === 'luxury' || template.category === 'premium' ? 3000 : 1500,
          insuranceIncluded: true,
          pickupDepot: {
            id: 112314,
            locationType: pickup.type === 'airport' ? 'in_terminal' : 'downtown'
          },
          dropoffDepot: {
            id: 112315,
            locationType: dropoff.type === 'airport' ? 'in_terminal' : 'downtown'
          }
        });
      });
    });
    
    return cars;
  }
  
  private getBasePriceForCategory(category: string): number {
    const prices: Record<string, number> = {
      mini: 150,
      economy: 180,
      compact: 220,
      intermediate: 280,
      standard: 320,
      fullsize: 380,
      premium: 500,
      luxury: 800,
      suv: 450,
      minivan: 550,
      convertible: 600,
      estate: 350
    };
    return prices[category] || 250;
  }
  
  private applyFilters(cars: Car[], filters: any): Car[] {
    let filtered = [...cars];
    
    if (filters.carCategories?.length) {
      filtered = filtered.filter(c => filters.carCategories.includes(c.category));
    }
    
    if (filters.transmissionType) {
      filtered = filtered.filter(c => c.transmission === filters.transmissionType);
    }
    
    if (filters.mileageType) {
      filtered = filtered.filter(c => c.mileage.type === filters.mileageType);
    }
    
    if (filters.numberOfSeats) {
      filtered = filtered.filter(c => c.seats >= filters.numberOfSeats);
    }
    
    if (filters.airConditioning !== undefined) {
      filtered = filtered.filter(c => c.airConditioning === filters.airConditioning);
    }
    
    if (filters.supplierIds?.length) {
      filtered = filtered.filter(c => filters.supplierIds.includes(c.supplierId));
    }
    
    if (filters.priceRange) {
      filtered = filtered.filter(c => 
        c.totalPrice >= filters.priceRange.min && 
        c.totalPrice <= filters.priceRange.max
      );
    }
    
    return filtered;
  }
  
  private sortCars(cars: Car[], sortBy: string, direction: string = 'ascending'): Car[] {
    const sorted = [...cars];
    
    sorted.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'price':
          comparison = a.totalPrice - b.totalPrice;
          break;
        case 'review_score':
          comparison = (b.supplierRating || 0) - (a.supplierRating || 0);
          break;
        case 'distance':
          comparison = 0; // Mock: tüm araçlar aynı mesafede
          break;
        default:
          comparison = 0;
      }
      
      return direction === 'descending' ? -comparison : comparison;
    });
    
    return sorted;
  }
  
  private getMockCarById(carId: string): Car | undefined {
    // Basit mock: ID'den araç oluştur
    const [, idx, sidx] = carId.split('-').map(Number);
    const cars = this.generateMockCars(
      { id: 'IST', name: 'Istanbul', type: 'airport', country: 'Turkey', countryCode: 'TR' },
      { id: 'IST', name: 'Istanbul', type: 'airport', country: 'Turkey', countryCode: 'TR' }
    );
    return cars.find(c => c.id === carId) || cars[0];
  }
  
  private getMockInsuranceOptions(currency: string): InsuranceOption[] {
    return [
      {
        id: 'ins-basic',
        name: 'Temel Sigorta',
        description: 'Zorunlu trafik sigortası ve kasko dahildir',
        coverage: ['Zorunlu Trafik Sigortası', 'Kasko', 'Hasar Muafiyeti: 1500 EUR'],
        excessReduction: 0,
        price: 0,
        currency,
        included: true
      },
      {
        id: 'ins-standard',
        name: 'Standart Koruma',
        description: 'Hasar muafiyetini 500 EUR\'ya düşürür',
        coverage: ['Temel Sigorta', 'Hasar Muafiyeti: 500 EUR', 'Cam Kırılması', 'Lastik Hasarı'],
        excessReduction: 1000,
        price: 12,
        currency,
        included: false,
        recommended: true
      },
      {
        id: 'ins-premium',
        name: 'Tam Koruma',
        description: 'Hasar muafiyetini sıfırlar, tüm hasarları kapsar',
        coverage: ['Standart Koruma', 'Hasar Muafiyeti: 0 EUR', 'Çalınma', 'Üçüncü Şahıs Hasarı', 'Kişisel Eşya Sigortası'],
        excessReduction: 1500,
        price: 25,
        currency,
        included: false
      }
    ];
  }
  
  private getMockExtraServices(currency: string): ExtraService[] {
    return [
      {
        id: 'extra-gps',
        name: 'GPS Navigasyon',
        description: 'Güncel haritalar ile GPS cihazı',
        price: 5,
        currency,
        unit: 'per_day',
        icon: '🗺️',
        maxQuantity: 1
      },
      {
        id: 'extra-child-seat',
        name: 'Çocuk Koltuğu',
        description: '0-4 yaş arası çocuklar için güvenlik koltuğu',
        price: 8,
        currency,
        unit: 'per_day',
        icon: '👶',
        maxQuantity: 3
      },
      {
        id: 'extra-additional-driver',
        name: 'Ek Sürücü',
        description: 'İkinci bir sürücü ekleyin',
        price: 10,
        currency,
        unit: 'per_rental',
        icon: '👤',
        maxQuantity: 3
      },
      {
        id: 'extra-wifi',
        name: 'Mobil WiFi',
        description: 'Sınırsız internet (4G)',
        price: 7,
        currency,
        unit: 'per_day',
        icon: '📶',
        maxQuantity: 1
      },
      {
        id: 'extra-snow-chains',
        name: 'Kar Zinciri',
        description: 'Kış ayları için kar zinciri',
        price: 15,
        currency,
        unit: 'per_rental',
        icon: '❄️',
        maxQuantity: 1
      }
    ];
  }
  
  private calculatePrice(car: Car, data: CarBookingData): any {
    const pickupDate = new Date(data.route.pickup.datetime);
    const dropoffDate = new Date(data.route.dropoff.datetime);
    const days = Math.ceil((dropoffDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const basePrice = car.pricePerDay * days;
    
    // Ekstralar
    const extras = data.extras?.map(e => {
      const service = this.getMockExtraServices(car.currency).find(s => s.id === e.serviceId);
      if (!service) return { name: '', amount: 0 };
      const amount = service.unit === 'per_day' ? service.price * days : service.price;
      return { name: service.name, amount: amount * e.quantity };
    }) || [];
    const extrasTotal = extras.reduce((sum, e) => sum + e.amount, 0);
    
    // Sigorta
    const insurance = data.insurance 
      ? this.getMockInsuranceOptions(car.currency).find(i => i.id === data.insurance!.optionId)
      : undefined;
    const insuranceTotal = insurance && !insurance.included ? insurance.price * days : 0;
    
    // Özel ücretler
    const youngDriverFee = data.driver.age < 26 ? 15 * days : 0;
    const additionalDriverFee = (data.additionalDrivers?.length || 0) * 10;
    const oneWayFee = data.route.pickup.depotId !== data.route.dropoff.depotId ? 50 : 0;
    const airportFee = 25;
    
    const subtotal = basePrice + extrasTotal + insuranceTotal + youngDriverFee + additionalDriverFee + oneWayFee + airportFee;
    const taxRate = 18;
    const tax = Math.round((subtotal * taxRate) / 100);
    const total = subtotal + tax;
    
    return {
      basePrice,
      pricePerDay: car.pricePerDay,
      days,
      extras,
      extrasTotal,
      insurance: insuranceTotal,
      youngDriverFee,
      additionalDriverFee,
      oneWayFee,
      airportFee,
      subtotal,
      tax,
      taxRate,
      total,
      currency: car.currency,
      deposit: car.depositAmount,
      excess: insurance ? car.excessAmount! - insurance.excessReduction : car.excessAmount
    };
  }
  
  private getMockLocations(): LocationSearchResult[] {
    return [
      { id: 'IST-airport', name: 'İstanbul Havalimanı', type: 'airport', city: 'İstanbul', country: 'Türkiye', airport: 'IST' },
      { id: 'SAW-airport', name: 'Sabiha Gökçen Havalimanı', type: 'airport', city: 'İstanbul', country: 'Türkiye', airport: 'SAW' },
      { id: 'AYT-airport', name: 'Antalya Havalimanı', type: 'airport', city: 'Antalya', country: 'Türkiye', airport: 'AYT' },
      { id: 'ADB-airport', name: 'İzmir Adnan Menderes Havalimanı', type: 'airport', city: 'İzmir', country: 'Türkiye', airport: 'ADB' },
      { id: 'ESB-airport', name: 'Ankara Esenboğa Havalimanı', type: 'airport', city: 'Ankara', country: 'Türkiye', airport: 'ESB' },
      { id: 'DLM-airport', name: 'Dalaman Havalimanı', type: 'airport', city: 'Muğla', country: 'Türkiye', airport: 'DLM' },
      { id: 'BJV-airport', name: 'Bodrum Havalimanı', type: 'airport', city: 'Muğla', country: 'Türkiye', airport: 'BJV' },
      { id: 'GZT-airport', name: 'Gaziantep Havalimanı', type: 'airport', city: 'Gaziantep', country: 'Türkiye', airport: 'GZT' },
      { id: 'IST-city', name: 'İstanbul Merkez', type: 'city', city: 'İstanbul', country: 'Türkiye' },
      { id: 'AYT-city', name: 'Antalya Merkez', type: 'city', city: 'Antalya', country: 'Türkiye' }
    ];
  }
  
  private async getLocationById(id: string): Promise<CarLocation> {
    const locations = this.getMockLocations();
    const found = locations.find(l => l.id === id);
    
    if (!found) {
      return {
        id: 'IST-airport',
        name: 'İstanbul Havalimanı',
        type: 'airport',
        airport: 'IST',
        country: 'Türkiye',
        countryCode: 'TR',
        address: 'Tayakadın, Terminal Caddesi No:1, 34283 Arnavutköy/İstanbul'
      };
    }
    
    return {
      id: found.id,
      name: found.name,
      type: found.type,
      airport: found.airport,
      city: found.city,
      country: found.country,
      countryCode: 'TR',
      address: found.name
    };
  }
  
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
  
  private generateBookingNumber(): string {
    return 'GRB-CAR-' + Date.now().toString().slice(-8);
  }
  
  private generateRequestId(): string {
    return '01h' + Math.random().toString(36).substring(2, 25);
  }
  
  private generateSearchToken(params: CarSearchParams): string {
    // JWT benzeri token (90 dakika geçerli)
    const payload = btoa(JSON.stringify({
      p: params,
      exp: Date.now() + 90 * 60 * 1000
    }));
    return 'eyJhbGciOiJIUzI1NiJ9.' + payload + '.mock_signature';
  }
  
  private generatePageToken(offset: number): string {
    return btoa(JSON.stringify({ offset }));
  }
  
  private highlightMatch(text: string, query: string): string {
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;
    return text.substring(0, index) + '<mark>' + text.substring(index, index + query.length) + '</mark>' + text.substring(index + query.length);
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const demoCarAPI = new DemoCarAPI();
