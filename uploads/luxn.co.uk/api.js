// LUXN — TalorData Google Hotels SERP API
// Browser → proxy.php (PHP server) → TalorData (CORS-safe)
// Deploy proxy.php to your server and set PROXY_URL accordingly.

// DEV:  node proxy.js  → http://localhost:8000
// PROD: https://luxn.co.uk/proxy.php  (PHP) or Node server
const PROXY_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:8000"
  : "https://luxn.co.uk/proxy.php";

const TALORDATA_KEY = "d3f0553493deb4ae2ad3d49f5d0eb4d3";
const TALORDATA_URL = "https://serpapi.talordata.net/serp/v1/request";

// Luxury destinations for the home page featured grid
const LUX_DESTINATIONS = [
  { q: "luxury hotels Paris France",     label: "Paris" },
  { q: "luxury hotels Rome Italy",       label: "Rome" },
  { q: "luxury hotels Mykonos Greece",   label: "Mykonos" },
  { q: "luxury hotels Marrakech Morocco",label: "Marrakech" },
  { q: "luxury hotels Kyoto Japan",      label: "Kyoto" },
];

function todayISO(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

// Core fetch wrapper — tries proxy first, then direct TalorData call
async function talorPost(extra, signal) {
  const params = {
    engine: "google_hotels",
    json: "2",
    hl: "en",
    gl: "us",
    currency: "EUR",
    ...extra,
  };
  const body = new URLSearchParams(params);

  // 1️⃣ Try proxy (luxn.co.uk/proxy.php)
  try {
    const r = await fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal,
    });
    if (r.ok) return r.json();
    console.warn(`[LUXN api] proxy returned ${r.status}, trying direct…`);
  } catch (err) {
    console.warn("[LUXN api] proxy unreachable, trying direct:", err.message);
  }

  // 2️⃣ Fallback: call TalorData directly with API key
  const r2 = await fetch(TALORDATA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Bearer ${TALORDATA_KEY}`,
    },
    body,
    signal,
  });
  if (!r2.ok) {
    const txt = await r2.text();
    throw new Error(`HTTP ${r2.status}: ${txt.slice(0, 200)}`);
  }
  return r2.json();
}

// ============ FEATURED HOME GRID ============
async function fetchHotels({ destIdx = 0, signal } = {}) {
  const dest = LUX_DESTINATIONS[destIdx % LUX_DESTINATIONS.length];
  try {
    const json = await talorPost({
      q: dest.q,
      check_in_date: todayISO(14),
      check_out_date: todayISO(21),
      adults: "2",
    }, signal);
    const props = json?.properties || [];
    if (!props.length) return null;
    return props.slice(0, 12).map(p => normaliseHotel(p, dest.label));
  } catch (err) {
    console.warn("[LUXN api] fetchHotels error:", err.message || err);
    return null;
  }
}

// ============ SEARCH RESULTS ============
async function fetchHotelsByDest({
  dest_id, search_type, label,
  arrival_date, departure_date,
  adults = 2, children_age = "", rooms = 1,
  signal,
} = {}) {
  // Build query: if caller passes a label use it, otherwise map old Booking dest_ids
  const cityName = label || DEST_ID_MAP[String(dest_id)] || "Paris";
  const q = `luxury hotels ${cityName}`;
  const arr = arrival_date || todayISO(14);
  const dep = departure_date || todayISO(21);

  try {
    const json = await talorPost({
      q,
      check_in_date: arr,
      check_out_date: dep,
      adults: String(adults),
    }, signal);
    const props = json?.properties || [];
    if (!props.length) return null;
    return props.slice(0, 24).map(p => normaliseHotel(p, cityName));
  } catch (err) {
    console.warn("[LUXN api] fetchHotelsByDest error:", err.message || err);
    return null;
  }
}

// Map old Booking.com dest_ids → city name (for backward compat)
const DEST_ID_MAP = {
  "-1456928": "Paris",
  "-126693":  "Rome",
  "-2601889": "Mykonos",
  "-755070":  "Marrakech",
  "-2092174": "Kyoto",
};

// ============ NORMALISE — Google Hotels → LUXN card format ============
function normaliseHotel(prop, destLabel) {
  const images  = prop.images || [];
  const img     = images[0]?.original_image || images[0]?.thumbnail || null;
  const price   = prop.rate_per_night?.extracted_lowest ?? null;
  // Currency symbol comes embedded in the price string e.g. "€347" or "$347"
  const rawSym  = (prop.rate_per_night?.lowest || "€").replace(/[\d,. ]/g, "").trim();
  const cur     = rawSym || "€";

  return {
    id:          `s-api-${prop.property_token || Math.random().toString(36).slice(2, 8)}`,
    rawId:       prop.property_token || null,
    name:        prop.name || "Unnamed property",
    loc:         destLabel || "",
    price:       price ? Math.round(price) : 600 + Math.floor(Math.random() * 1800),
    currency:    cur,
    image:       img,
    rating:      prop.overall_rating ? +prop.overall_rating.toFixed(2) : 4.85,
    reviewScore: prop.overall_rating || null,
    reviewWord:  null,
    reviewCount: prop.reviews || 0,
    type:        prop.type || "Hotel",
    rooms:       12,
    style:       prop.hotel_class || "Curated",
    neigh:       destLabel,
    lat:         prop.gps_coordinates?.latitude  || null,
    lng:         prop.gps_coordinates?.longitude || null,
    description: prop.description || null,
    link:        prop.link || null,
    isLive:      true,
  };
}

// ============ DESTINATION AUTOCOMPLETE ============
// Google Hotels SERP doesn't expose an autocomplete endpoint.
// We serve a curated static list of luxury destinations instead.
const STATIC_DESTINATIONS = [
  { dest_id: "paris",        search_type: "query", label: "Paris",        country: "France",      type: "city"   },
  { dest_id: "rome",         search_type: "query", label: "Rome",         country: "Italy",       type: "city"   },
  { dest_id: "mykonos",      search_type: "query", label: "Mykonos",      country: "Greece",      type: "city"   },
  { dest_id: "marrakech",    search_type: "query", label: "Marrakech",    country: "Morocco",     type: "city"   },
  { dest_id: "kyoto",        search_type: "query", label: "Kyoto",        country: "Japan",       type: "city"   },
  { dest_id: "dubai",        search_type: "query", label: "Dubai",        country: "UAE",         type: "city"   },
  { dest_id: "maldives",     search_type: "query", label: "Maldives",     country: "Maldives",    type: "region" },
  { dest_id: "santorini",    search_type: "query", label: "Santorini",    country: "Greece",      type: "city"   },
  { dest_id: "bali",         search_type: "query", label: "Bali",         country: "Indonesia",   type: "city"   },
  { dest_id: "amalfi",       search_type: "query", label: "Amalfi Coast", country: "Italy",       type: "region" },
  { dest_id: "london",       search_type: "query", label: "London",       country: "UK",          type: "city"   },
  { dest_id: "barcelona",    search_type: "query", label: "Barcelona",    country: "Spain",       type: "city"   },
  { dest_id: "istanbul",     search_type: "query", label: "Istanbul",     country: "Turkey",      type: "city"   },
  { dest_id: "tokyo",        search_type: "query", label: "Tokyo",        country: "Japan",       type: "city"   },
  { dest_id: "new-york",     search_type: "query", label: "New York",     country: "USA",         type: "city"   },
  { dest_id: "st-tropez",    search_type: "query", label: "Saint-Tropez", country: "France",      type: "city"   },
  { dest_id: "capri",        search_type: "query", label: "Capri",        country: "Italy",       type: "city"   },
  { dest_id: "positano",     search_type: "query", label: "Positano",     country: "Italy",       type: "city"   },
  { dest_id: "monaco",       search_type: "query", label: "Monaco",       country: "Monaco",      type: "city"   },
  { dest_id: "marbella",     search_type: "query", label: "Marbella",     country: "Spain",       type: "city"   },
  { dest_id: "portofino",    search_type: "query", label: "Portofino",    country: "Italy",       type: "city"   },
  { dest_id: "cannes",       search_type: "query", label: "Cannes",       country: "France",      type: "city"   },
  { dest_id: "zanzibar",     search_type: "query", label: "Zanzibar",     country: "Tanzania",    type: "city"   },
  { dest_id: "seychelles",   search_type: "query", label: "Seychelles",   country: "Seychelles",  type: "region" },
  { dest_id: "florence",     search_type: "query", label: "Florence",     country: "Italy",       type: "city"   },
  { dest_id: "venice",       search_type: "query", label: "Venice",       country: "Italy",       type: "city"   },
  { dest_id: "lisbon",       search_type: "query", label: "Lisbon",       country: "Portugal",    type: "city"   },
  { dest_id: "amsterdam",    search_type: "query", label: "Amsterdam",    country: "Netherlands", type: "city"   },
  { dest_id: "vienna",       search_type: "query", label: "Vienna",       country: "Austria",     type: "city"   },
  { dest_id: "prague",       search_type: "query", label: "Prague",       country: "Czech Rep.",  type: "city"   },
];

const _destCache = new Map();
async function searchDestinations(query, { signal } = {}) {
  const q = (query || "").trim().toLowerCase();
  if (q.length < 2) return [];
  if (_destCache.has(q)) return _destCache.get(q);
  const results = STATIC_DESTINATIONS.filter(d =>
    d.label.toLowerCase().includes(q) ||
    d.country.toLowerCase().includes(q)
  ).slice(0, 8);
  _destCache.set(q, results);
  return results;
}

// ============ CAR RENTAL ============
// Not available via Google Hotels SERP — caller falls back to mock data.
async function fetchCars({ label = "", signal } = {}) {
  console.info("[LUXN api] fetchCars: not available via TalorData Google Hotels → using mock");
  return null;
}

// ============ GEOCODING ============
// Not available via Google Hotels SERP — return null.
async function geocodeLocation(query, { signal } = {}) {
  console.info("[LUXN api] geocodeLocation: not available via TalorData → returning null");
  return null;
}

// ============ IMAGE HELPERS ============
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
  j2: pic("luxn-journal-bag",   600, 400),
  j3: pic("luxn-journal-tailor",600, 400),
};

function imageFor(item, category) {
  if (item.image) return item.image;
  if (category === "stay")    return CURATED_STAY_IMAGES[item.id];
  if (category === "drive")   return CURATED_CAR_IMAGES[item.id];
  if (category === "sail")    return CURATED_YACHT_IMAGES[item.id];
  if (category === "journal") return CURATED_JOURNAL_IMAGES[item.id];
  return null;
}

// ============ EXPORTS ============
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
