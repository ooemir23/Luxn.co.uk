// Shared components for LUXN
const { useState, useEffect, useRef, useMemo } = React;

// ============ PLACEHOLDER IMAGE ============
function Placeholder({ tone = 1, label, className = "", style }) {
  return (
    <div className={`placeholder-img tone-${tone} ${className}`} style={style}>
      {label ? <span className="ph-label">{label}</span> : null}
    </div>);

}

// Real image with graceful fade-in + fallback to tinted placeholder
function SmartImage({ src, alt, tone = 1, label, className = "", style }) {
  const [loaded, setLoaded] = React.useState(false);
  const [errored, setErrored] = React.useState(false);
  if (!src || errored) {
    return <Placeholder tone={tone} label={label} className={className} style={style} />;
  }
  return (
    <div className={`smart-img ${className}`} style={style}>
      {!loaded ? <div className={`placeholder-img tone-${tone}`} style={{ position: "absolute", inset: 0 }} /> : null}
      <img
        src={src}
        alt={alt || ""}
        loading="eager"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        style={{ opacity: loaded ? 1 : 0 }} />
      
    </div>);

}

// ============ LOGO ============
function Logo({ onClick }) {
  return (
    <div className="logo" onClick={onClick}>
      Luxn<span style={{ fontSize: "0.85em", opacity: 0.8, letterSpacing: "0.02em", fontWeight: 300 }}>.co.uk</span>
    </div>);

}

// ============ NAV ============
function Nav({ t, lang, setLang, active, go, theme, dark, setDark, onSignInClick }) {
  const { count: favCount } = window.useFavorites();
  const { session } = window.useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMenu = () => setMobileOpen(false);
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Logo onClick={() => { go({ screen: "home" }); closeMenu(); }} />
        <nav className="nav-links" aria-label="primary">
          <button className={`nav-link ${active === "stay" ? "active" : ""}`} onClick={() => go({ screen: "results", category: "stay" })}>{t.nav.stay}</button>
          <button className={`nav-link ${active === "drive" ? "active" : ""}`} onClick={() => go({ screen: "results", category: "drive" })}>{t.nav.drive}</button>
          <GlobalSearch t={t} lang={lang} go={go} />
          <button className={`nav-link ${active === "journal" ? "active" : ""}`} onClick={() => go({ screen: "journal" })}>{t.nav.journal}</button>
          <button className={`nav-link ${active === "concierge" ? "active" : ""}`} onClick={() => go({ screen: "concierge" })}>{t.nav.concierge}</button>
        </nav>
        <div className="nav-right">
          <button
            className={`nav-fav ${active === "favorites" ? "active" : ""}`}
            onClick={() => session ? go({ screen: "favorites" }) : window.dispatchEvent(new CustomEvent("luxn:require-signin"))}
            aria-label={t.nav.favorites}
            title={t.nav.favorites} style={{ borderWidth: "1px" }}>

            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M12 21s-7.5-4.6-9.5-9.2C1 8.4 3.3 5 6.7 5c2 0 3.6 1 5.3 3 1.7-2 3.3-3 5.3-3 3.4 0 5.7 3.4 4.2 6.8C19.5 16.4 12 21 12 21z"
              fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            {favCount > 0 ? <span className="nav-fav-count mono">{favCount}</span> : null}
          </button>
          <button
            className="theme-toggle"
            onClick={() => setDark(!dark)}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            title={dark ? "Light mode" : "Dark mode"}>

            {dark ?
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                <circle cx="12" cy="12" r="4" fill="currentColor" />
                <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </g>
              </svg> :

            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" />
              </svg>
            }
          </button>
          <button
            className="lang-pill nav-lang-desktop"
            onClick={() => setLang(lang === "tr" ? "en" : "tr")}
            aria-label="Change language">

            <span className={lang === "tr" ? "active-lang" : ""}>TR</span>
            <span className="sep">/</span>
            <span className={lang === "en" ? "active-lang" : ""}>EN</span>
          </button>
          {session ?
          <window.UserMenu t={t} go={go} /> :

          <button className="nav-link nav-signin nav-signin-desktop" onClick={onSignInClick}>{t.auth.sign_in}</button>
          }
          <button
            className="nav-hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
            aria-expanded={mobileOpen}>
            <span className={mobileOpen ? "ham-open" : ""}></span>
            <span className={mobileOpen ? "ham-open" : ""}></span>
            <span className={mobileOpen ? "ham-open" : ""}></span>
          </button>
        </div>
      </div>
      {mobileOpen && (
        <nav className="nav-mobile" aria-label="mobile navigation">
          <button className={`nav-link ${active === "stay" ? "active" : ""}`} onClick={() => { go({ screen: "results", category: "stay" }); closeMenu(); }}>{t.nav.stay}</button>
          <button className={`nav-link ${active === "drive" ? "active" : ""}`} onClick={() => { go({ screen: "results", category: "drive" }); closeMenu(); }}>{t.nav.drive}</button>
          <button className={`nav-link ${active === "journal" ? "active" : ""}`} onClick={() => { go({ screen: "journal" }); closeMenu(); }}>{t.nav.journal}</button>
          <button className={`nav-link ${active === "concierge" ? "active" : ""}`} onClick={() => { go({ screen: "concierge" }); closeMenu(); }}>{t.nav.concierge}</button>
          <div className="nav-mobile-bottom">
            <button
              className="lang-pill"
              onClick={() => setLang(lang === "tr" ? "en" : "tr")}
              aria-label="Change language">
              <span className={lang === "tr" ? "active-lang" : ""}>TR</span>
              <span className="sep">/</span>
              <span className={lang === "en" ? "active-lang" : ""}>EN</span>
            </button>
            {!session && <button className="btn btn-sm" onClick={() => { onSignInClick(); closeMenu(); }}>{t.auth.sign_in}</button>}
          </div>
        </nav>
      )}
    </header>);

}

// ============ GLOBAL SEARCH (in nav) ============
function GlobalSearch({ t, lang, go }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState({ destinations: [], cars: [], yachts: [] });
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  // Click outside closes
  useEffect(() => {
    const h = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Debounced search
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults({ destinations: [], cars: [], yachts: [] });
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const id = setTimeout(async () => {
      const lower = q.toLowerCase();
      const cars = (window.CARS || []).filter((c) =>
      c.name.toLowerCase().includes(lower) ||
      c.loc.toLowerCase().includes(lower) ||
      c.type.toLowerCase().includes(lower) ||
      c.style.toLowerCase().includes(lower)
      ).slice(0, 4);
      const yachts = [];
      const destinations = await window.searchDestinations(q, { signal: ctrl.signal });
      setResults({ destinations: destinations.slice(0, 5), cars, yachts });
      setLoading(false);
    }, 250);
    return () => {clearTimeout(id);ctrl.abort();};
  }, [query]);

  const pickDest = (s) => {
    setOpen(false);
    setQuery("");
    go({
      screen: "results",
      category: "stay",
      searchParams: {
        category: "stay",
        dest: s,
        whereLabel: s.label + (s.country ? ", " + s.country : ""),
        checkIn: "",
        checkOut: "",
        adults: 2,
        rooms: 1
      }
    });
  };

  const pickItem = (item, cat) => {
    setOpen(false);
    setQuery("");
    go({ screen: "detail", category: cat, id: item.id });
  };

  const hasAny = results.destinations.length || results.cars.length || results.yachts.length;
  const showDropdown = open && query.trim().length >= 2;

  return (
    <div className={`global-search ${open ? "open" : ""}`} ref={wrapRef}>
      <span className="gs-icon" aria-hidden="true">⌕</span>
      <input
        ref={inputRef}
        type="text"
        className="gs-input"
        placeholder={lang === "tr" ? "Otel veya araç ara…" : "Search hotels, cars…"}
        value={query}
        onChange={(e) => {setQuery(e.target.value);setOpen(true);}}
        onFocus={() => setOpen(true)} />
      
      {query ?
      <button className="gs-clear" onClick={() => {setQuery("");inputRef.current?.focus();}} aria-label="Clear">×</button> :
      null}

      {showDropdown ?
      <div className="gs-pop">
          {loading && !hasAny ?
        <div className="gs-empty mono">{lang === "tr" ? "aranıyor…" : "searching…"}</div> :
        !hasAny ?
        <div className="gs-empty mono">{lang === "tr" ? "sonuç yok" : "no matches"}</div> :

        <>
              {results.destinations.length > 0 ?
          <div className="gs-section">
                  <div className="gs-section-head mono">{t.nav.stay} · {lang === "tr" ? "destinasyonlar" : "destinations"}</div>
                  {results.destinations.map((d) =>
            <button key={d.dest_id} className="gs-row" onClick={() => pickDest(d)}>
                      <span className="gs-row-cat mono">stay</span>
                      <span className="gs-row-name">{d.label}</span>
                      <span className="gs-row-meta mono">
                        {d.country}{d.hotels ? ` · ${d.hotels.toLocaleString()} hotels` : ""}
                      </span>
                    </button>
            )}
                </div> :
          null}
              {results.cars.length > 0 ?
          <div className="gs-section">
                  <div className="gs-section-head mono">{t.nav.drive}</div>
                  {results.cars.map((c) =>
            <button key={c.id} className="gs-row" onClick={() => pickItem(c, "drive")}>
                      <span className="gs-row-cat mono">drive</span>
                      <span className="gs-row-name">{c.name}</span>
                      <span className="gs-row-meta mono">{c.loc}</span>
                    </button>
            )}
                </div> :
          null}
            </>
        }
        </div> :
      null}
    </div>);

}

// ============ SEARCH BAR (functional) ============
function SearchBar({ t, lang, category, setCategory, onSearch, compact = false, initial = {} }) {
  const tabs = [
  { id: "stay", label: t.search.tabs.stay },
  { id: "drive", label: t.search.tabs.drive }];


  const [where, setWhere] = useState(initial.whereLabel || "");
  const [dest, setDest] = useState(initial.dest || null);
  const [checkIn, setCheckIn] = useState(initial.checkIn || "");
  const [checkOut, setCheckOut] = useState(initial.checkOut || "");
  const [adults, setAdults] = useState(initial.adults || 2);
  const [rooms, setRooms] = useState(initial.rooms || 1);

  const [openField, setOpenField] = useState(null); // 'where' | 'dates' | 'guests'
  const wrapRef = useRef(null);

  // Click outside closes popover
  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpenField(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Destination suggestions
  const [destInput, setDestInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [destLoading, setDestLoading] = useState(false);

  useEffect(() => {
    if (openField !== "where") return;
    const q = destInput.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    setDestLoading(true);
    const ctrl = new AbortController();
    const id = setTimeout(() => {
      window.searchDestinations(q, { signal: ctrl.signal }).then((items) => {
        setSuggestions(items);
        setDestLoading(false);
      });
    }, 250);
    return () => {clearTimeout(id);ctrl.abort();};
  }, [destInput, openField]);

  const pickDest = (s) => {
    setDest(s);
    setWhere(s.label + (s.country ? ", " + s.country : ""));
    setDestInput("");
    setOpenField("dates");
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-GB", { day: "numeric", month: "short" });
  };

  const guestLabel = () => {
    const adultStr = adults === 1 ?
    lang === "tr" ? "1 yetişkin" : "1 adult" :
    `${adults} ${lang === "tr" ? "yetişkin" : "adults"}`;
    const roomStr = rooms === 1 ?
    lang === "tr" ? "1 oda" : "1 room" :
    `${rooms} ${lang === "tr" ? "oda" : "rooms"}`;
    return `${adultStr} · ${roomStr}`;
  };

  const handleSearch = () => {
    // Validate required fields
    if (!checkIn || !checkOut) {
      alert(lang === "tr" ? "Lütfen tarih seçin" : "Please select dates");
      return;
    }
    if (!where) {
      alert(lang === "tr" ? "Lütfen hedef seçin" : "Please select destination");
      return;
    }

    onSearch && onSearch({
      category,
      dest: dest || { label: where },  // Fallback to where if dest not fully resolved
      checkIn,
      checkOut,
      adults,
      rooms
    });
    setOpenField(null);
  };

  const cityFieldLabel = category === "drive" ? t.search.pickup : t.search.destination;
  const cityFieldPh = category === "drive" ? t.search.pickup_ph : t.search.destination_ph;

  return (
    <div className={`search-bar ${compact ? "compact" : ""}`} ref={wrapRef}>
      <div className="search-tabs">
        {tabs.map((tab) =>
        <button
          key={tab.id}
          className={`search-tab ${category === tab.id ? "active" : ""}`}
          onClick={() => setCategory(tab.id)}>
          
            {tab.label}
          </button>
        )}
      </div>
      <div className="search-fields">
        {/* WHERE */}
        <div className="search-field-wrap">
          <button
            className={`field ${openField === "where" ? "open" : ""}`}
            onClick={() => setOpenField(openField === "where" ? null : "where")}
            type="button">
            
            <span className="field-label">{cityFieldLabel}</span>
            <span className={`field-value ${!where ? "placeholder" : ""}`}>
              {where || cityFieldPh}
            </span>
          </button>
          {openField === "where" ?
          <div className="sb-pop sb-pop-where">
              <input
              type="text"
              className="sb-input"
              placeholder={cityFieldPh}
              value={destInput}
              onChange={(e) => setDestInput(e.target.value)}
              autoFocus />
            
              <div className="sb-suggestions">
                {destLoading ?
              <div className="sb-empty mono">{lang === "tr" ? "aranıyor…" : "searching…"}</div> :
              suggestions.length === 0 && destInput.length >= 2 ?
              <div className="sb-empty mono">{lang === "tr" ? "sonuç yok" : "no matches"}</div> :
              suggestions.length === 0 ?
              <>
                    <div className="sb-sugg-head mono">{lang === "tr" ? "Popüler" : "Popular"}</div>
                    {["Paris", "Rome", "Mykonos", "Marrakech", "Kyoto", "Bali", "Istanbul"].map((p) =>
                <button
                  key={p}
                  className="sb-sugg-item"
                  type="button"
                  onClick={() => setDestInput(p)}>
                  
                        <span className="sb-sugg-name">{p}</span>
                        <span className="sb-sugg-meta mono">{lang === "tr" ? "ara" : "search"} →</span>
                      </button>
                )}
                  </> :

              suggestions.map((s) =>
              <button
                key={s.dest_id}
                className="sb-sugg-item"
                type="button"
                onClick={() => pickDest(s)}>
                
                      <span className="sb-sugg-name">{s.label}</span>
                      <span className="sb-sugg-meta mono">
                        {s.country}{s.hotels ? ` · ${s.hotels.toLocaleString()} hotels` : ""}
                      </span>
                    </button>
              )
              }
              </div>
            </div> :
          null}
        </div>
        <div className="search-divider" />

        {/* DATES */}
        <div className="search-field-wrap">
          <button
            className={`field ${openField === "dates" ? "open" : ""}`}
            onClick={() => setOpenField(openField === "dates" ? null : "dates")}
            type="button">
            
            <span className="field-label">{t.search.dates}</span>
            <span className={`field-value ${!checkIn ? "placeholder" : ""}`}>
              {checkIn ? `${formatDate(checkIn)} → ${formatDate(checkOut)}` : t.search.dates_ph}
            </span>
          </button>
          {openField === "dates" ?
          <div className="sb-pop sb-pop-dates">
              <div className="sb-date-row">
                <label className="sb-date-col">
                  <span className="mono sb-date-lbl">{t.detail.check_in}</span>
                  <input
                  type="date"
                  className="sb-date-input"
                  value={checkIn}
                  min={nextDateISO(0)}
                  onChange={(e) => {
                    setCheckIn(e.target.value);
                    if (e.target.value >= checkOut) {
                      const d = new Date(e.target.value);
                      d.setDate(d.getDate() + 7);
                      setCheckOut(d.toISOString().slice(0, 10));
                    }
                  }} />
                
                </label>
                <label className="sb-date-col">
                  <span className="mono sb-date-lbl">{t.detail.check_out}</span>
                  <input
                  type="date"
                  className="sb-date-input"
                  value={checkOut}
                  min={checkIn}
                  onChange={(e) => setCheckOut(e.target.value)} />
                
                </label>
              </div>
              <div className="sb-date-quick">
                {[
              { lbl: lang === "tr" ? "Bu hafta sonu" : "This weekend", days: 2, from: nextWeekendStart() },
              { lbl: lang === "tr" ? "7 gece" : "7 nights", days: 7, from: nextDateISO(14) },
              { lbl: lang === "tr" ? "14 gece" : "14 nights", days: 14, from: nextDateISO(14) }].
              map((q) =>
              <button
                key={q.lbl}
                type="button"
                className="sb-date-pill mono"
                onClick={() => {
                  setCheckIn(q.from);
                  const d = new Date(q.from);
                  d.setDate(d.getDate() + q.days);
                  setCheckOut(d.toISOString().slice(0, 10));
                }}>
                
                    {q.lbl}
                  </button>
              )}
              </div>
              <button type="button" className="btn btn-sm btn-ghost sb-date-close" onClick={() => setOpenField("guests")}>
                {lang === "tr" ? "Devam et" : "Continue"} →
              </button>
            </div> :
          null}
        </div>
        <div className="search-divider" />

        {/* GUESTS */}
        <div className="search-field-wrap">
          <button
            className={`field ${openField === "guests" ? "open" : ""}`}
            onClick={() => setOpenField(openField === "guests" ? null : "guests")}
            type="button">
            
            <span className="field-label">{t.search.guests}</span>
            <span className="field-value">{guestLabel()}</span>
          </button>
          {openField === "guests" ?
          <div className="sb-pop sb-pop-guests">
              <Stepper
              label={lang === "tr" ? "Yetişkin" : "Adults"}
              sub={lang === "tr" ? "13 yaş ve üstü" : "Age 13+"}
              value={adults}
              min={1}
              max={12}
              onChange={setAdults} />
            
              <Stepper
              label={lang === "tr" ? "Oda" : "Rooms"}
              value={rooms}
              min={1}
              max={6}
              onChange={setRooms} />
            
              <button type="button" className="btn btn-sm btn-ghost sb-date-close" onClick={() => setOpenField(null)}>
                {lang === "tr" ? "Tamam" : "Done"}
              </button>
            </div> :
          null}
        </div>

        <button className="btn btn-accent search-go" onClick={handleSearch} type="button">
          {t.search.search}
        </button>
      </div>
    </div>);

}

function Stepper({ label, sub, value, min = 0, max = 99, onChange }) {
  return (
    <div className="sb-stepper">
      <div className="sb-stepper-meta">
        <div className="sb-stepper-lbl">{label}</div>
        {sub ? <div className="sb-stepper-sub mono">{sub}</div> : null}
      </div>
      <div className="sb-stepper-ctrl">
        <button
          type="button"
          className="sb-step-btn"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}>
          −</button>
        <span className="sb-step-val">{value}</span>
        <button
          type="button"
          className="sb-step-btn"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}>
          +</button>
      </div>
    </div>);

}

// Helper functions
function nextDateISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}
function nextWeekendStart() {
  const d = new Date();
  const day = d.getDay();
  const offset = day <= 5 ? 5 - day : 6;
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

// ============ CARD ============
function PropertyCard({ item, t, onClick, category, variant = "default" }) {
  const perLabel = category === "sail" ? t.results.per_week : category === "drive" ? t.results.per_day : t.results.per_night;
  const src = window.imageFor ? window.imageFor(item, category) : null;
  return (
    <div className={`card card-${variant} fade-in`} onClick={onClick}>
      <div className="card-img">
        <SmartImage src={src} alt={item.name} tone={item.tone} label={item.name?.toUpperCase()} />
        <div className="card-cat-tag">{t.nav[category]}</div>
        <window.HeartButton category={category} id={item.id} item={item} />
      </div>
      <div className="card-meta">
        <div className="card-loc">{item.loc}</div>
        <div className="card-title">{item.name}</div>
        <div className="card-price">
          <span className="from">{t.detail.from}</span>
          <span className="amount">{window.formatPrice ? window.formatPrice(item.price, item.currency) : `${item.currency}${item.price.toLocaleString()}`}</span>
          <span className="per">{perLabel}</span>
        </div>
      </div>
    </div>);

}

// ============ FOOTER ============
function Footer({ t, lang }) {
  const isEN = !lang || lang === "en";
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo />
            <p className="footer-tag">
              {isEN
                ? "The world's most considered places and vehicles — brought together in one calm flow."
                : "Dünyanın en özenli adresleri ve araçları — tek bir sezgisel akışta bir araya getirildi."}
            </p>
          </div>
          <div className="footer-col">
            <div className="eyebrow">{isEN ? "Discover" : "Keşfet"}</div>
            <a>{t.nav.stay}</a><a>{t.nav.drive}</a><a>{t.nav.journal}</a>
          </div>
          <div className="footer-col">
            <div className="eyebrow">{isEN ? "Company" : "Şirket"}</div>
            <a>{isEN ? "About" : "Hakkımızda"}</a>
            <a>{isEN ? "Curators" : "Küratörler"}</a>
            <a>{isEN ? "Press" : "Basın"}</a>
            <a>{isEN ? "Careers" : "Kariyer"}</a>
          </div>
          <div className="footer-col">
            <div className="eyebrow">{isEN ? "Help" : "Yardım"}</div>
            <a>{t.nav.concierge}</a>
            <a>{isEN ? "Contact" : "İletişim"}</a>
            <a>{isEN ? "Terms" : "Koşullar"}</a>
            <a>{isEN ? "Privacy" : "Gizlilik"}</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="mono">© 2026 · luxn.co.uk</span>
          <span className="mono">London · Istanbul · Tokyo</span>
        </div>
      </div>
    </footer>);

}

// ============ CURRENCY CONVERSION & FORMATTING ============
function formatPrice(amount, fromCurrency) {
  let targetCode = "EUR";
  try {
    const raw = localStorage.getItem("luxn.tweaks.currency") || "EUR";
    targetCode = raw;
  } catch (e) {}

  const rates = { EUR: 1.0, USD: 1.08, GBP: 0.86, TRY: 35.0, CHF: 0.95 };
  const symbols = { EUR: "€", USD: "$", GBP: "£", TRY: "₺", CHF: "CHF" };

  const fromSym = String(fromCurrency || "€").trim();
  const fromCode = fromSym === "€" ? "EUR" : fromSym === "$" ? "USD" : fromSym === "£" ? "GBP" : fromSym === "₺" ? "TRY" : fromSym === "CHF" ? "CHF" : "EUR";

  if (!rates[fromCode]) rates[fromCode] = 1.0;
  if (!symbols[fromCode]) symbols[fromCode] = fromSym;

  const baseAmount = amount / rates[fromCode];
  const converted = baseAmount * (rates[targetCode] || 1.0);

  return `${symbols[targetCode] || "€"}${Math.round(converted).toLocaleString()}`;
}
window.formatPrice = formatPrice;

// ============ RECENTLY VIEWED STORAGE ============
const RECENT_KEY = "luxn.recently-viewed.v1";
function getRecentlyViewed() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}
function addRecentlyViewed(category, id) {
  try {
    let current = getRecentlyViewed();
    current = current.filter(x => !(x.category === category && x.id === id));
    current.unshift({ category, id });
    if (current.length > 4) current.pop();
    localStorage.setItem(RECENT_KEY, JSON.stringify(current));
  } catch (e) {}
}
window.addRecentlyViewed = addRecentlyViewed;
window.getRecentlyViewed = getRecentlyViewed;

// ============ RECENTLY VIEWED COMPONENT ============
function RecentlyViewed({ t, lang, go }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const list = getRecentlyViewed();
    const lookup = {
      stay: window.STAYS || [],
      drive: window.CARS || [],
      sail: window.YACHTS || [],
    };
    const resolved = list.map(item => {
      const db = lookup[item.category] || [];
      const found = db.find(x => x.id === item.id);
      return found ? { item: found, category: item.category } : null;
    }).filter(Boolean);
    setItems(resolved);
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="recently-viewed-section" style={{ marginTop: 60, paddingTop: 40, borderTop: "1px solid var(--line)" }}>
      <div className="container">
        <h2 className="display" style={{ fontSize: 24, marginBottom: 24 }}>
          {t.recently_viewed}
        </h2>
      </div>
      <div
        className="recently-viewed-row"
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 20,
          overflowX: "auto",
          overflowY: "visible",
          paddingLeft: "max(24px, calc((100vw - 1280px) / 2))",
          paddingRight: "max(24px, calc((100vw - 1280px) / 2))",
          paddingBottom: 8,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {items.map(({ item, category }) => (
          <div key={item.id} style={{ flex: "0 0 260px", minWidth: 260, maxWidth: 260 }}>
            <window.PropertyCard
              item={item}
              t={t}
              category={category}
              onClick={() => go({ screen: "detail", category, id: item.id })}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

Object.assign(window, { Placeholder, SmartImage, Logo, Nav, SearchBar, PropertyCard, Footer, formatPrice, addRecentlyViewed, getRecentlyViewed, RecentlyViewed });