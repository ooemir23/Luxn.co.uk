// LUXN — favorites system: localStorage-backed, app-wide
// Stores ids as `${category}:${id}` so the same id across categories doesn't collide.

const FAV_KEY = "luxn.favorites.v1";

function readFavs() {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}
function writeFavs(arr) {
  try { localStorage.setItem(FAV_KEY, JSON.stringify(arr)); } catch (e) {}
}
function favKey(cat, id) { return `${cat}:${id}`; }

// Custom event bus so multiple useFavorites hooks stay in sync
const FAV_EVT = "luxn:favs-changed";
function emitFavsChanged() {
  window.dispatchEvent(new CustomEvent(FAV_EVT));
}

function useFavorites() {
  const [favs, setFavs] = React.useState(() => readFavs());

  React.useEffect(() => {
    const handler = () => setFavs(readFavs());
    window.addEventListener(FAV_EVT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(FAV_EVT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const isFav = React.useCallback((cat, id) => favs.includes(favKey(cat, id)), [favs]);

  const toggleFav = React.useCallback((cat, id) => {
    const k = favKey(cat, id);
    const current = readFavs();
    const next = current.includes(k) ? current.filter(x => x !== k) : [...current, k];
    writeFavs(next);
    setFavs(next);
    emitFavsChanged();
  }, []);

  const clearFavs = React.useCallback(() => {
    writeFavs([]);
    setFavs([]);
    emitFavsChanged();
  }, []);

  return { favs, isFav, toggleFav, clearFavs, count: favs.length };
}

// Lookup helper: resolve fav keys -> hydrated items grouped by category
function resolveFavorites(favs) {
  const lookup = {
    stay: window.STAYS || [],
    drive: window.CARS || [],
    sail: window.YACHTS || [],
  };
  const grouped = { stay: [], drive: [], sail: [] };
  for (const key of favs) {
    const [cat, id] = key.split(":");
    if (!lookup[cat]) continue;
    const item = lookup[cat].find(x => x.id === id);
    if (item) grouped[cat].push(item);
  }
  return grouped;
}

// Heart button — toggles favourite state on a single item
function HeartButton({ category, id, item }) {
  const { isFav, toggleFav } = useFavorites();
  const { session } = window.useSession();
  const active = isFav(category, id);
  const onClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!session) {
      window.dispatchEvent(new CustomEvent("luxn:require-signin"));
      return;
    }
    toggleFav(category, id);
  };
  return (
    <button
      type="button"
      className={`heart-btn ${active ? "active" : ""}`}
      aria-label={active ? "Remove from favourites" : "Add to favourites"}
      aria-pressed={active}
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path
          d="M12 21s-7.5-4.6-9.5-9.2C1 8.4 3.3 5 6.7 5c2 0 3.6 1 5.3 3 1.7-2 3.3-3 5.3-3 3.4 0 5.7 3.4 4.2 6.8C19.5 16.4 12 21 12 21z"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

Object.assign(window, { useFavorites, resolveFavorites, HeartButton });
