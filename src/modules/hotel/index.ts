// Otel Modülü - Ana Export Dosyası
// Tüm otel modülü bileşenleri buradan export edilir

// Types - HotelDetails interface'i HotelDetailsType olarak export
export type {
  Hotel,
  HotelLocation,
  HotelDetails as HotelDetailsType,
  HotelSearchParams,
  HotelSearchResult,
  HotelFilters,
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

// Components - HotelDetails component normal export
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

