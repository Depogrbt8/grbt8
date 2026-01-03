// Otel Modülü - Ana Export Dosyası
// Tüm otel modülü bileşenleri buradan export edilir

// Types - Çakışan isimler için alias kullanıyoruz
export type {
  Hotel,
  HotelLocation,
  HotelDetails as HotelDetailsType,
  HotelSearchParams,
  HotelSearchResult,
  HotelFilters as HotelFiltersType,
  HotelPolicies,
  RoomType,
  Rate,
  Review,
  BookingRequest,
  BookingResponse,
  CancelResponse,
  GuestInfo,
  LocationSuggestion
} from './types';

export {
  AMENITY_CATEGORIES,
  MEAL_PLAN_LABELS,
  CANCELLATION_LABELS
} from './types';

// Services
export * from './services';

// Hooks
export * from './hooks';

// Utils
export * from './utils';

// Components
export {
  HotelSearchForm,
  HotelCard,
  HotelList,
  HotelFilters,
  HotelDetails,
  RoomSelector,
  RoomCard,
  HotelBookingForm,
  GuestForm,
  HotelPriceSummary
} from './components';

