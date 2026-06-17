// LUXN — Otelz API Client
// Wraps Otelz Hotel Booking API (Search, Details, Rates, Reservations)

// Configuration
const OTELZ_URL = typeof window === 'undefined'
  ? process.env.OTELZ_URL
  : window.OTELZ_URL || 'https://api.otelz.com/v1';

const OTELZ_KEY = typeof window === 'undefined'
  ? process.env.OTELZ_KEY
  : window.OTELZ_KEY || '';

const OTELZ_ENABLED = typeof window === 'undefined'
  ? process.env.OTELZ_ENABLED !== 'false'
  : window.OTELZ_ENABLED !== false;

const PROXY_URL = `${typeof window !== 'undefined' ? window.location.protocol + '//' + window.location.host : ''}/proxy`;

// Helper: Format date to ISO string
function dateISO(date) {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

// Core fetch wrapper — calls /proxy endpoint which forwards to Otelz
async function otelzRequest(endpoint, body = {}, signal) {
  if (!OTELZ_ENABLED) {
    console.warn('[LUXN otelz] Otelz disabled, returning null');
    return null;
  }

  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint,
        ...body
      }),
      signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      const error = new Error(`Otelz API error: ${response.status}`);
      error.status = response.status;
      error.message = errorText;
      throw error;
    }

    return await response.json();
  } catch (err) {
    console.error(`[LUXN otelz] ${endpoint} failed:`, err.message || err);
    return null;
  }
}

// ============ SEARCH SERVICE ============
async function searchHotels({
  destination,
  checkIn,
  checkOut,
  guests = 2,
  rooms = 1,
  signal
} = {}) {
  if (!destination) return null;

  try {
    const response = await otelzRequest('/search', {
      destination,
      checkInDate: dateISO(checkIn),
      checkOutDate: dateISO(checkOut),
      adults: guests,
      rooms: rooms
    }, signal);

    if (!response || !response.properties) return null;

    return response.properties.map(prop => normalizeHotel(prop));
  } catch (err) {
    console.warn('[LUXN otelz] searchHotels error:', err.message || err);
    return null;
  }
}

// ============ DATA SERVICE ============
async function getHotelDetails({ hotelId, signal } = {}) {
  if (!hotelId) return null;

  try {
    const response = await otelzRequest(`/hotels/${hotelId}`, {}, signal);
    if (!response || !response.hotel) return null;

    const hotel = response.hotel;
    return {
      id: hotel.hotelId,
      name: hotel.name,
      description: hotel.description || '',
      address: hotel.address || {},
      rating: hotel.rating || {},
      rooms: hotel.rooms || [],
      amenities: hotel.amenities || [],
      photos: hotel.images || [],
      policies: hotel.policies || {
        checkIn: 'After 3 PM',
        checkOut: 'Before 11 AM',
        cancellation: 'Free cancellation up to 7 days before arrival'
      }
    };
  } catch (err) {
    console.warn('[LUXN otelz] getHotelDetails error:', err.message || err);
    return null;
  }
}

// ============ RATES SERVICE ============
async function getHotelRates({
  hotelId,
  checkIn,
  checkOut,
  guests = 2,
  rooms = 1,
  signal
} = {}) {
  if (!hotelId || !checkIn || !checkOut) return null;

  try {
    const response = await otelzRequest(`/hotels/${hotelId}/rates`, {
      checkInDate: dateISO(checkIn),
      checkOutDate: dateISO(checkOut),
      adults: guests,
      rooms: rooms
    }, signal);

    if (!response || !response.rates) return null;

    return {
      rates: response.rates.map(r => normalizeRate(r)),
      availability: response.availability || true,
      restrictions: response.restrictions || null
    };
  } catch (err) {
    console.warn('[LUXN otelz] getHotelRates error:', err.message || err);
    return null;
  }
}

// ============ RESERVATION SERVICE ============
async function createReservation({
  hotelId,
  roomTypeId,
  guestInfo = {},
  checkIn,
  checkOut,
  guests = 2,
  totalPrice,
  currency = 'EUR',
  signal
} = {}) {
  if (!hotelId || !guestInfo.email || !checkIn || !checkOut) {
    throw new Error('Missing required reservation data');
  }

  try {
    const nights = calculateNights(checkIn, checkOut);
    const response = await otelzRequest('/reservations', {
      hotelId,
      roomTypeId,
      guest: {
        firstName: guestInfo.firstName || '',
        lastName: guestInfo.lastName || '',
        email: guestInfo.email,
        phone: guestInfo.phone || '',
        specialRequests: guestInfo.notes || ''
      },
      dates: {
        checkIn: dateISO(checkIn),
        checkOut: dateISO(checkOut),
        nights
      },
      guests,
      totalPrice,
      currency
    }, signal);

    if (!response || !response.confirmationCode) {
      throw new Error('No confirmation code in response');
    }

    return formatReservationResponse(response);
  } catch (err) {
    const message = parseOtelzError(err);
    const error = new Error(message);
    error.code = err.code || 'RESERVATION_ERROR';
    throw error;
  }
}

async function getReservationDetails({ confirmationCode, signal } = {}) {
  if (!confirmationCode) return null;

  try {
    const response = await otelzRequest(`/reservations/${confirmationCode}`, {}, signal);
    if (!response) return null;
    return response;
  } catch (err) {
    console.warn('[LUXN otelz] getReservationDetails error:', err.message || err);
    return null;
  }
}

async function modifyReservation({ confirmationCode, changes = {}, signal } = {}) {
  if (!confirmationCode) return null;

  try {
    const response = await otelzRequest(`/reservations/${confirmationCode}`, {
      action: 'modify',
      changes
    }, signal);
    if (!response) return null;
    return formatReservationResponse(response);
  } catch (err) {
    console.warn('[LUXN otelz] modifyReservation error:', err.message || err);
    return null;
  }
}

async function cancelReservation({ confirmationCode, signal } = {}) {
  if (!confirmationCode) return null;

  try {
    const response = await otelzRequest(`/reservations/${confirmationCode}`, {
      action: 'cancel'
    }, signal);
    if (!response) return null;
    return response;
  } catch (err) {
    console.warn('[LUXN otelz] cancelReservation error:', err.message || err);
    return null;
  }
}

// ============ NORMALIZATION ============

// Transform Otelz hotel object to LUXN format
function normalizeHotel(otelzHotel) {
  if (!otelzHotel) return null;

  const rating = otelzHotel.rating?.overall || 4.5;
  const reviews = otelzHotel.rating?.count || 0;
  const image = otelzHotel.images?.[0]?.url || null;
  const price = otelzHotel.rates?.lowestPrice || 1200;
  const currency = otelzHotel.rates?.currency || 'EUR';

  return {
    id: otelzHotel.hotelId || otelzHotel.id,
    rawId: otelzHotel.hotelId || otelzHotel.id,
    name: otelzHotel.name || 'Unnamed Hotel',
    loc: otelzHotel.address?.city || otelzHotel.destination || 'Unknown',
    price: Math.round(price),
    currency: getCurrencySymbol(currency),
    image: image,
    rating: parseFloat(rating.toFixed(2)),
    reviewScore: rating,
    reviewCount: reviews,
    type: otelzHotel.hotelClass || otelzHotel.type || 'Hotel',
    rooms: otelzHotel.roomCount || 12,
    style: otelzHotel.hotelClass || 'Curated',
    neigh: otelzHotel.address?.area || otelzHotel.address?.city || 'Luxury',
    lat: otelzHotel.address?.latitude || 48.8566,
    lng: otelzHotel.address?.longitude || 2.3522,
    description: otelzHotel.description || '',
    link: otelzHotel.url || '',
    isLive: true
  };
}

// Transform Otelz rate object
function normalizeRate(otelzRate) {
  if (!otelzRate) return null;

  return {
    id: otelzRate.rateId,
    roomType: otelzRate.roomType || 'Standard Room',
    price: otelzRate.totalPrice || otelzRate.pricePerNight,
    currency: otelzRate.currency || 'EUR',
    pricePerNight: otelzRate.pricePerNight || otelzRate.totalPrice,
    cancellable: otelzRate.cancellable !== false,
    available: otelzRate.available !== false,
    beds: otelzRate.beds || 1,
    maxGuests: otelzRate.maxGuests || 2,
    amenities: otelzRate.roomAmenities || [],
    restrictions: otelzRate.restrictions || null
  };
}

// Format reservation response
function formatReservationResponse(otelzReserv) {
  return {
    confirmationCode: otelzReserv.confirmationCode || generateConfirmationCode(),
    reservationId: otelzReserv.reservationId,
    bookingReference: otelzReserv.bookingReference,
    status: otelzReserv.status || 'CONFIRMED',
    hotelName: otelzReserv.hotelName,
    checkIn: otelzReserv.checkInDate,
    checkOut: otelzReserv.checkOutDate,
    guestName: otelzReserv.guestName,
    totalPrice: otelzReserv.totalPrice,
    currency: otelzReserv.currency,
    createdAt: otelzReserv.createdAt || new Date().toISOString()
  };
}

// ============ UTILITIES ============

function getCurrencySymbol(code) {
  const symbols = {
    'EUR': '€',
    'USD': '$',
    'GBP': '£',
    'TRY': '₺',
    'JPY': '¥',
    'AUD': 'A$',
    'CAD': 'C$',
    'CHF': 'CHF',
    'CNY': '¥',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr'
  };
  return symbols[code] || code;
}

function calculateNights(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

function generateConfirmationCode() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `LUX-${timestamp}${random}`.slice(0, 12);
}

function parseOtelzError(err) {
  if (typeof err === 'string') return err;

  const message = err.message || err.toString();

  // Map common Otelz errors to user-friendly messages
  if (message.includes('ROOM_NOT_AVAILABLE')) {
    return 'This room is no longer available. Please select another.';
  }
  if (message.includes('INVALID_DATES')) {
    return 'Invalid check-in or check-out dates.';
  }
  if (message.includes('PAYMENT_FAILED')) {
    return 'Payment failed. Please check your card details.';
  }
  if (message.includes('INVALID_GUEST')) {
    return 'Please provide valid guest information.';
  }
  if (message.includes('RATE_CHANGED')) {
    return 'Room rate has changed. Please refresh and try again.';
  }
  if (message.includes('NETWORK') || message.includes('timeout')) {
    return 'Network error. Please check your connection and try again.';
  }

  return `Booking error: ${message.slice(0, 100)}`;
}

// ============ EXPORT ============

// Make functions available globally
window.otelz = {
  searchHotels,
  getHotelDetails,
  getHotelRates,
  createReservation,
  getReservationDetails,
  modifyReservation,
  cancelReservation,
  calculateNights,
  getCurrencySymbol,
  parseOtelzError
};

// Also export for server-side (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    searchHotels,
    getHotelDetails,
    getHotelRates,
    createReservation,
    getReservationDetails,
    modifyReservation,
    cancelReservation,
    normalizeHotel,
    normalizeRate,
    formatReservationResponse,
    calculateNights,
    getCurrencySymbol,
    parseOtelzError
  };
}
