# LUXN ← Otelz API Integration Guide

## Overview

LUXN has been refactored to use **Otelz Hotel Booking API** instead of TalorData. This enables:
- ✅ Real hotel search & filtering
- ✅ Live availability & rates
- ✅ Actual reservation submission (not localStorage-only)
- ✅ Confirmation codes from Otelz backend

---

## Architecture

### Files

| File | Purpose |
|------|---------|
| `otelz-api.js` | **NEW** — Otelz client library (4 services: Search, Details, Rates, Reservations) |
| `server.js` | **UPDATED** — Proxy endpoint (`/proxy`) forwards to Otelz with auth |
| `.env.local` | **NEW** — Credentials (Otelz URL, API key) |
| `screen-home.jsx` | **UPDATED** — Uses `window.otelz.searchHotels()` |
| `screen-results.jsx` | **UPDATED** — Uses `window.otelz.searchHotels()` |
| `screen-booking.jsx` | **UPDATED** — Calls `window.otelz.createReservation()` |

### Deleted Files

- `api.js` — Old TalorData client (removed)
- `proxy.php` — Old PHP proxy (removed, replaced by server.js)

---

## Setup

### 1. Environment Variables

Create `.env.local` in the project root:

```bash
REACT_APP_OTELZ_URL=https://api.otelz.com/v1
REACT_APP_OTELZ_KEY=your_api_key_here
REACT_APP_OTELZ_ENABLED=true
```

Get your credentials from: https://connect.otelz.com/

### 2. Start Server

```bash
npm start
```

The server will:
- Load `.env.local` credentials
- Start proxy at `http://localhost:3000/proxy`
- Serve frontend at `http://localhost:3000`

### 3. Development Mode

To test with **mock data** (no API calls):

```bash
# Edit .env.local:
REACT_APP_OTELZ_ENABLED=false
```

App will fall back to mock data in `data.js` automatically.

---

## API Flow

### Search Hotels

**Frontend** → **Browser** → **Node.js Proxy** (`/proxy`) → **Otelz API** → **Response**

```javascript
// Frontend call (screen-home.jsx, screen-results.jsx)
await window.otelz.searchHotels({
  destination: "Paris",
  checkIn: "2026-06-24",
  checkOut: "2026-07-01",
  guests: 2,
  rooms: 1,
  signal: abortController.signal
});

// Returns normalized hotels array
[
  {
    id: "otelz_12345",
    name: "Hotel Name",
    loc: "Paris",
    price: 1240,
    currency: "€",
    image: "https://...",
    rating: 4.5,
    isLive: true
  },
  ...
]
```

### Create Reservation

**Frontend** → **POST to `/proxy`** → **Otelz Reservation API** → **Confirmation Code**

```javascript
// Frontend call (screen-booking.jsx)
const response = await window.otelz.createReservation({
  hotelId: "otelz_12345",
  roomTypeId: "standard",
  guestInfo: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+1234567890",
    notes: "Early check-in preferred"
  },
  checkIn: "2026-06-24",
  checkOut: "2026-07-01",
  guests: 2,
  totalPrice: 8680,  // subtotal + 4% fee
  currency: "EUR"
});

// Returns
{
  confirmationCode: "LUX-ABC123",
  reservationId: "otelz_res_12345",
  bookingReference: "REF-123456",
  status: "CONFIRMED",
  hotelName: "Hotel Name",
  checkIn: "2026-06-24",
  checkOut: "2026-07-01",
  guestName: "John Doe",
  totalPrice: 8680,
  currency: "EUR",
  createdAt: "2026-06-17T10:30:00Z"
}
```

---

## Proxy Endpoint

**URL:** `POST /proxy`

**Request Body:**
```json
{
  "endpoint": "/search",
  "destination": "Paris",
  "checkInDate": "2026-06-24",
  "checkOutDate": "2026-07-01",
  "adults": 2,
  "rooms": 1
}
```

**Response:**
```json
{
  "properties": [
    { "hotelId": "12345", "name": "Hotel", ... }
  ]
}
```

**Authentication:** Bearer token from `REACT_APP_OTELZ_KEY` (added by server.js)

---

## Error Handling

Errors are caught and displayed to users:

```javascript
try {
  await window.otelz.createReservation({...});
} catch (err) {
  // err.message → user-friendly text
  // "Room is no longer available"
  // "Payment failed"
  // "Network error - please try again"
}
```

Error messages are translated and mapped in `parseOtelzError()` (otelz-api.js:295-320).

---

## Data Normalization

### Otelz Format → LUXN Format

**Input** (from Otelz API):
```javascript
{
  hotelId: "12345",
  name: "Hotel Name",
  rating: { overall: 4.5, count: 287 },
  images: [{ url: "https://..." }],
  address: { city: "Paris", latitude: 48.8566, longitude: 2.3522 },
  rates: { lowestPrice: 1240, currency: "EUR" }
}
```

**Output** (normalized):
```javascript
{
  id: "12345",
  name: "Hotel Name",
  loc: "Paris",
  price: 1240,
  currency: "€",
  image: "https://...",
  rating: 4.5,
  reviewScore: 4.5,
  reviewCount: 287,
  lat: 48.8566,
  lng: 2.3522,
  isLive: true
  // ... other fields
}
```

The normalized format is **compatible with all UI components** that expect hotel objects.

---

## Testing Checklist

- [ ] **Home Page**
  - [ ] Loads without errors
  - [ ] Shows "● live data" when Otelz API succeeds
  - [ ] Shows "○ demo data" when Otelz API fails
  - [ ] Featured cards display hotel names, prices, ratings

- [ ] **Search**
  - [ ] Can search with destination, dates, guests
  - [ ] Results from Otelz API display correctly
  - [ ] Filters work (price, style, amenities)
  - [ ] Sorting works (low, high, rating)

- [ ] **Detail Page**
  - [ ] Hotel info displays correctly
  - [ ] Map shows coordinates from Otelz
  - [ ] Booking dates can be set

- [ ] **Booking**
  - [ ] All 4 steps complete without errors
  - [ ] Form validates (email required, etc.)
  - [ ] Clicking confirm POSTs to `/proxy`
  - [ ] Confirmation code received from Otelz
  - [ ] Code saves to localStorage as backup

- [ ] **Error Cases**
  - [ ] Missing email → "Email is required"
  - [ ] API timeout → "Network error - please try again"
  - [ ] Room unavailable → "This room is no longer available"
  - [ ] Network tab shows `/proxy` POST with correct body

---

## Fallback to Mock Data

If Otelz API is unavailable:

1. **Automatically**: `otelz.searchHotels()` returns `null` → UI falls back to `window.STAYS`
2. **Manually**: Set `REACT_APP_OTELZ_ENABLED=false` in `.env.local`

Mock data is in `data.js`:
- `window.STAYS` — 6 hotels (stays)
- `window.CARS` — 6 cars
- `window.YACHTS` — 6 yachts

---

## API Documentation

### `otelz.searchHotels(options)`

**Parameters:**
- `destination` (string) — City name or destination ID
- `checkIn` (string) — ISO date YYYY-MM-DD
- `checkOut` (string) — ISO date YYYY-MM-DD
- `guests` (number) — Number of guests (default: 2)
- `rooms` (number) — Number of rooms (default: 1)
- `signal` (AbortSignal) — For request cancellation

**Returns:** `Promise<Hotel[]>` or `null`

---

### `otelz.getHotelDetails(options)`

**Parameters:**
- `hotelId` (string) — Hotel ID from Otelz
- `signal` (AbortSignal) — For request cancellation

**Returns:** `Promise<HotelDetails>` or `null`

---

### `otelz.getHotelRates(options)`

**Parameters:**
- `hotelId` (string) — Hotel ID
- `checkIn` (string) — ISO date
- `checkOut` (string) — ISO date
- `guests` (number) — Number of guests
- `rooms` (number) — Number of rooms
- `signal` (AbortSignal) — For request cancellation

**Returns:** `Promise<{ rates[], availability, restrictions }>`

---

### `otelz.createReservation(options)`

**Parameters:**
- `hotelId` (string) — Hotel ID
- `roomTypeId` (string) — Room type ID from rates
- `guestInfo` (object) — Guest details
  - `firstName`, `lastName`, `email`, `phone`, `notes`
- `checkIn` (string) — ISO date
- `checkOut` (string) — ISO date
- `guests` (number) — Number of guests
- `totalPrice` (number) — Total amount in cents
- `currency` (string) — Currency code (EUR, USD, etc.)
- `signal` (AbortSignal) — For request cancellation

**Returns:** `Promise<Reservation>`

**Throws:** `Error` with user-friendly message

---

### `otelz.getReservationDetails(options)`

Retrieve reservation by confirmation code.

**Returns:** `Promise<Reservation>` or `null`

---

### `otelz.modifyReservation(options)`

Modify existing reservation (dates, guests, etc.).

**Returns:** `Promise<Reservation>` or `null`

---

### `otelz.cancelReservation(options)`

Cancel reservation.

**Returns:** `Promise<Object>` with cancellation details

---

## Performance Notes

- **Search** → ~1-2s (network + Otelz processing)
- **Reservation** → ~2-3s (payment processing)
- All requests are abortable via `AbortController`
- Timeout: 10 seconds (configurable in `otelz-api.js`)

---

## Debugging

### Enable Console Logs

All Otelz calls log to console with `[LUXN otelz]` prefix:

```javascript
[LUXN otelz] /search POST
[LUXN otelz] searchHotels error: Network timeout
[LUXN otelz] Otelz disabled, returning null
```

### Network Tab

Check browser DevTools → Network:

1. Search request → `POST /proxy`
   - Headers: `Content-Type: application/json`
   - Body: `{ endpoint: "/search", destination: "Paris", ... }`
   - Response: `{ properties: [...] }`

2. Reservation request → `POST /proxy`
   - Body: `{ endpoint: "/reservations", hotelId: "...", guestInfo: {...}, ... }`
   - Response: `{ confirmationCode: "LUX-...", ... }`

---

## Troubleshooting

### "Otelz disabled, returning null"

✓ **Fix:** Check `.env.local`
```bash
REACT_APP_OTELZ_ENABLED=true  # Should be true
REACT_APP_OTELZ_KEY=your_key  # Should not be empty
```

### "Network error"

✓ **Fix:** Check server logs
```bash
[LUXN proxy] Otelz error 401: Unauthorized
```
→ API key is invalid or expired

### "Room is no longer available"

✓ **Expected behavior** — User should refresh and select different room/dates

### Blank home page

✓ **Fix:** Check browser console for errors
- Is `otelz-api.js` loaded? (check Sources)
- Is `window.otelz` defined? (run `window.otelz` in console)

---

## Migration Notes

### What Changed

| Before | After |
|--------|-------|
| TalorData free-text search | Otelz structured API |
| Hardcoded `api.js` | `otelz-api.js` + env vars |
| Confirmation code: client-generated | Confirmation code: Otelz backend |
| localStorage-only bookings | POST to Otelz + localStorage backup |

### Backward Compatibility

- UI components **unchanged** (normalized data format identical)
- Mock data **still available** (fallback)
- localStorage bookings **still used** (for offline access)
- Same 4-step booking flow

---

## Support

For questions about Otelz API:
- https://connect.otelz.com/docs
- https://connect.otelz.com/support

For LUXN integration issues:
- Check `console.log` output
- Review browser Network tab
- Verify `.env.local` credentials
