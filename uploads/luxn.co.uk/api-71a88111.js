// LUXN — RapidAPI Booking.com hotels integration
// Uses the user-provided API key. CORS-friendly via direct fetch from browser.

const RAPIDAPI_KEY = "70bc502256msh14a2d784a2e3d7bp153134jsn77d3d9094537";
const RAPIDAPI_HOST = "booking-com15.p.rapidapi.com";
const API_BASE = `https://${RAPIDAPI_HOST}`;

const rapidHeaders = {
  "x-rapidapi-key": RAPIDAPI_KEY,
  "x-rapidapi-host": RAPIDAPI_HOST,
};

// Curated dest_ids for luxury destinations (from booking.com searchDestination)
const LUX_DESTINATIONS = [
  { dest_id: "-1456928", search_type: "city", label: "Paris" },
  { dest_id: "-126693",  search_type: "city", label: "Rome" },
  { dest_id: "-2601889", search_type: "city", label: "Mykonos" },
  { dest_id: "-755070",  search_type: "city", label: "Marrakech" },
  { dest_id: "-2092174", search_type: "city", label: "Kyoto" },
];

function todayISO(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

// Search hotels for a destination. Returns normalised cards.
async function fetchHotels({ destIdx = 0, signal } = {}) {
  const dest = LUX_DESTINATIONS[destIdx % LUX_DESTINATIONS.length];
  const params = new URLSearchParams({
    dest_id: dest.dest_id,
    search_type: dest.search_type,
    arrival_date: todayISO(14),
    departure_date: todayISO(21),
    adults: "2",
    children_age: "",
    room_qty: "1",
    page_number: "1",
    units: "metric",
    temperature_unit: "c",
    languagecode: "en-us",
    currency_code: "EUR",
  });
  const url = `${API_BASE}/api/v1/hotels/searchHotels?${params}`;
  try {
    const r = await fetch(url, { headers: rapidHeaders, signal });
    if (!r.ok) {
      const txt = await r.text();
      throw new Error(`HTTP ${r.status}: ${txt.slice(0, 200)}`);
    }
    const json = await r.json();
    const hotels = json?.data?.hotels || [];
    return hotels.slice(0, 12).map(h => normaliseHotel(h, dest.label));
  } catch (err) {
    console.warn("[LUXN api] fetchHotels error:", err.message || err);
    return null; // caller falls back to mock
  }
}

function normaliseHotel(h, destLabel) {
  const p = h.property || {};
  const photoUrls = p.photoUrls || [];
  // Booking.com returns ["square500", "square1024"] — prefer largest
  const photo = photoUrls[1] || photoUrls[0]
    ? (photoUrls[1] || photoUrls[0]).replace("square500", "max1280x900").replace("square60", "max1280x900")
    : null;
  const price = p?.priceBreakdown?.grossPrice?.value ?? null;
  const currency = p?.priceBreakdown?.grossPrice?.currency || "EUR";
  const review = p?.reviewScore;
  return {
    id: `s-api-${h.hotel_id || p.id || Math.random().toString(36).slice(2, 8)}`,
    rawId: h.hotel_id || p.id,
    name: p.name || "Unnamed property",
    loc: p.wishlistName || destLabel || (p.countryCode ? p.countryCode.toUpperCase() : ""),
    price: price ? Math.round(price) : 600 + Math.floor(Math.random() * 1800),
    currency: currencySymbol(currency),
    image: photo,
    rating: review ? +(review / 2).toFixed(2) : 4.85,
    reviewScore: review || null,
    reviewWord: p.reviewScoreWord || null,
    reviewCount: p.reviewCount || 0,
    type: p.accommodationType || "Hotel",
    rooms: 12,
    style: p.qualityClass ? `${p.qualityClass}★` : "Curated",
    neigh: destLabel,
    lat: p.latitude,
    lng: p.longitude,
    isLive: true,
  };
}

function currencySymbol(code) {
  return { EUR: "€", USD: "$", GBP: "£", TRY: "₺", CHF: "CHF " }[code] || (code + " ");
}

// ============ DESTINATION AUTOCOMPLETE ============
// Debounce wrapper for API calls.
const _destCache = new Map();
async function searchDestinations(query, { signal } = {}) {
  const q = (query || "").trim();
  if (q.length < 2) return [];
  if (_destCache.has(q)) return _destCache.get(q);
  const url = `${API_BASE}/api/v1/hotels/searchDestination?query=${encodeURIComponent(q)}`;
  try {
    const r = await fetch(url, { headers: rapidHeaders, signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const json = await r.json();
    const items = (json?.data || []).slice(0, 8).map(d => ({
      dest_id: String(d.dest_id),
      search_type: (d.search_type || d.type || "city").toLowerCase().replace("ci", "city"),
      label: d.name || d.label || "",
      country: d.country || "",
      region: d.region || "",
      type: d.dest_type || d.type || "",
      image: d.image_url || null,
      hotels: d.hotels || 0,
    }));
    _destCache.set(q, items);
    return items;
  } catch (err) {
    console.warn("[LUXN api] searchDestinations error:", err.message || err);
    return [];
  }
}

// Search hotels for an explicit destination (from searchDestinations result)
async function fetchHotelsByDest({ dest_id, search_type, arrival_date, departure_date, adults = 2, children_age = "", rooms = 1, signal } = {}) {
  const arr = arrival_date || todayISO(14);
  const dep = departure_date || todayISO(21);
  const params = new URLSearchParams({
    dest_id: String(dest_id),
    search_type: (search_type || "city").toLowerCase(),
    arrival_date: arr,
    departure_date: dep,
    adults: String(adults),
    children_age,
    room_qty: String(rooms),
    page_number: "1",
    units: "metric",
    temperature_unit: "c",
    languagecode: "en-us",
    currency_code: "EUR",
  });
  const url = `${API_BASE}/api/v1/hotels/searchHotels?${params}`;
  try {
    const r = await fetch(url, { headers: rapidHeaders, signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const json = await r.json();
    const hotels = json?.data?.hotels || [];
    return hotels.slice(0, 24).map(h => normaliseHotel(h, ""));
  } catch (err) {
    console.warn("[LUXN api] fetchHotelsByDest error:", err.message || err);
    return null;
  }
}

// ============ CAR RENTAL ============
async function fetchCars({ pick_up_latitude = 41.0082, pick_up_longitude = 28.9784, label = "Istanbul", signal } = {}) {
  // Pickup = drop-off (same location). Use 9:00 next-week → 16:00 the day after.
  const arr = todayISO(14);
  const dep = todayISO(17);
  const params = new URLSearchParams({
    pick_up_latitude: String(pick_up_latitude),
    pick_up_longitude: String(pick_up_longitude),
    drop_off_latitude: String(pick_up_latitude),
    drop_off_longitude: String(pick_up_longitude),
    pick_up_date: arr,
    drop_off_date: dep,
    pick_up_time: "10:00",
    drop_off_time: "10:00",
    driver_age: "30",
    currency_code: "EUR",
    location: "TR",
  });
  const url = `${API_BASE}/api/v1/cars/searchCarRentals?${params}`;
  try {
    const r = await fetch(url, { headers: rapidHeaders, signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const json = await r.json();
    const offers = json?.data?.search_results || [];
    return offers.slice(0, 24).map(o => normaliseCar(o, label));
  } catch (err) {
    console.warn("[LUXN api] fetchCars error:", err.message || err);
    return null;
  }
}

function normaliseCar(o, label) {
  const v = o.vehicle_info || {};
  const price = o.pricing_info?.price ?? null;
  const currency = o.pricing_info?.base_currency || "EUR";
  return {
    id: `c-api-${o.vehicle_id || Math.random().toString(36).slice(2, 8)}`,
    rawId: o.vehicle_id,
    name: v.v_name || v.v_label || v.label || "Vehicle",
    loc: o.route_info?.pickup?.name || label,
    price: price ? Math.round(price / 3) : 200, // per day approx (Booking shows total)
    currency: currencySymbol(currency),
    image: v.image_url || v.image_thumbnail_url || null,
    rating: o.rating_info?.average ? +(o.rating_info.average / 2).toFixed(2) : 4.7,
    reviewWord: o.rating_info?.average_text || null,
    reviewCount: o.rating_info?.no_of_ratings || 0,
    spec: `${v.transmission || ""} · ${v.fuel_type || ""}`.trim(),
    type: v.group || "Car",
    year: 2024,
    style: v.group || "Sports",
    neigh: label,
    supplier: o.supplier_info?.name || "",
    isLive: true,
  };
}

// Location → lat/lng via Booking.com
async function geocodeLocation(query, { signal } = {}) {
  if (!query) return null;
  const url = `${API_BASE}/api/v1/cars/locationToLatLong?location=${encodeURIComponent(query)}`;
  try {
    const r = await fetch(url, { headers: rapidHeaders, signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const json = await r.json();
    const first = (json?.data || [])[0];
    if (!first) return null;
    return { lat: first.latitude, lng: first.longitude, label: first.address || first.name || query };
  } catch (err) {
    console.warn("[LUXN api] geocodeLocation error:", err.message || err);
    return null;
  }
}
// Picsum is fast, CORS-friendly, and always returns a high-quality photo for a given seed.
function pic(seed, w = 1200, h = 900) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

const CURATED_CAR_IMAGES = {
  c1: pic("luxn-bentley"),
  c2: pic("luxn-porsche"),
  c3: pic("luxn-defender"),
  c4: pic("luxn-maybach"),
  c5: pic("luxn-ferrari"),
  c6: pic("luxn-rangerover"),
};

const CURATED_YACHT_IMAGES = {
  y1: pic("luxn-yacht-solstice"),
  y2: pic("luxn-yacht-marisol"),
  y3: pic("luxn-yacht-aletheia"),
  y4: pic("luxn-yacht-halcyon"),
  y5: pic("luxn-yacht-nokomis"),
  y6: pic("luxn-yacht-velanorte"),
};

const CURATED_STAY_IMAGES = {
  s1: pic("luxn-stay-provence"),
  s2: pic("luxn-stay-como"),
  s3: pic("luxn-stay-riad"),
  s4: pic("luxn-stay-iledere"),
  s5: pic("luxn-stay-bali"),
  s6: pic("luxn-stay-kyoto"),
};

const CURATED_JOURNAL_IMAGES = {
  j1: pic("luxn-journal-train", 600, 400),
  j2: pic("luxn-journal-bag", 600, 400),
  j3: pic("luxn-journal-tailor", 600, 400),
};

function imageFor(item, category) {
  if (item.image) return item.image;
  if (category === "stay") return CURATED_STAY_IMAGES[item.id];
  if (category === "drive") return CURATED_CAR_IMAGES[item.id];
  if (category === "sail") return CURATED_YACHT_IMAGES[item.id];
  if (category === "journal") return CURATED_JOURNAL_IMAGES[item.id];
  return null;
}

Object.assign(window, {
  fetchHotels,
  searchDestinations,
  fetchHotelsByDest,
  fetchCars,
  geocodeLocation,
  imageFor,
  CURATED_CAR_IMAGES, CURATED_YACHT_IMAGES, CURATED_STAY_IMAGES, CURATED_JOURNAL_IMAGES,
  LUX_DESTINATIONS,
});
