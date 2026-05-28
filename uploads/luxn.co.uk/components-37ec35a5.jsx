// Shared components for LUXN
const { useState, useEffect, useRef, useMemo } = React;

// ============ PLACEHOLDER IMAGE ============
function Placeholder({ tone = 1, label, className = "", style }) {
  return (
    <div className={`placeholder-img tone-${tone} ${className}`} style={style}>
      {label ? <span className="ph-label">{label}</span> : null}
    </div>
  );
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
        style={{ opacity: loaded ? 1 : 0 }}
      />
    </div>
  );
}

// ============ LOGO ============
function Logo({ onClick }) {
  return (
    <div className="logo" onClick={onClick}>
      LUXN<span className="dot"></span>CO
    </div>
  );
}

// ============ NAV ============
function Nav({ t, lang, setLang, active, go, theme }) {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Logo onClick={() => go({ screen: "home" })} />
        <nav className="nav-links" aria-label="primary">
          <button className={`nav-link ${active === "stay" ? "active" : ""}`} onClick={() => go({ screen: "results", category: "stay" })}>{t.nav.stay}</button>
          <button className={`nav-link ${active === "drive" ? "active" : ""}`} onClick={() => go({ screen: "results", category: "drive" })}>{t.nav.drive}</button>
          <button className={`nav-link ${active === "sail" ? "active" : ""}`} onClick={() => go({ screen: "results", category: "sail" })}>{t.nav.sail}</button>
          <GlobalSearch t={t} lang={lang} go={go} />
          <button className="nav-link">{t.nav.journal}</button>
          <button className="nav-link">{t.nav.concierge}</button>
        </nav>
        <div className="nav-right">
          <button
            className="lang-pill"
            onClick={() => setLang(lang === "tr" ? "en" : "tr")}
            aria-label="Change language"
          >
            <span className={lang === "tr" ? "active-lang" : ""}>TR</span>
            <span className="sep">/</span>
            <span className={lang === "en" ? "active-lang" : ""}>EN</span>
          </button>
          <button className="nav-link">Sign in</button>
        </div>
      </div>
    </header>
  );
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
      const cars = (window.CARS || []).filter(c =>
        c.name.toLowerCase().includes(lower) ||
        c.loc.toLowerCase().includes(lower) ||
        c.type.toLowerCase().includes(lower) ||
        c.style.toLowerCase().includes(lower)
      ).slice(0, 4);
      const yachts = (window.YACHTS || []).filter(y =>
        y.name.toLowerCase().includes(lower) ||
        y.loc.toLowerCase().includes(lower) ||
        y.type.toLowerCase().includes(lower) ||
        y.style.toLowerCase().includes(lower)
      ).slice(0, 4);
      const destinations = await window.searchDestinations(q, { signal: ctrl.signal });
      setResults({ destinations: destinations.slice(0, 5), cars, yachts });
      setLoading(false);
    }, 250);
    return () => { clearTimeout(id); ctrl.abort(); };
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
        checkIn: nextDateISO(14),
        checkOut: nextDateISO(21),
        adults: 2,
        rooms: 1,
      },
    });
  };

  const pickItem = (item, cat) => {
    setOpen(false);
    setQuery("");
    go({ screen: "detail", category: cat, id: item.id });
  };

  const hasAny = results.destinations.length || results.cars.length || results.yachts.length;
  const showDropdown = open && (query.trim().length >= 2);

  return (
    <div className={`global-search ${open ? "open" : ""}`} ref={wrapRef}>
      <span className="gs-icon" aria-hidden="true">⌕</span>
      <input
        ref={inputRef}
        type="text"
        className="gs-input"
        placeholder={lang === "tr" ? "Otel, araba, yat ara…" : "Search hotels, cars, yachts…"}
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />
      {query ? (
        <button className="gs-clear" onClick={() => { setQuery(""); inputRef.current?.focus(); }} aria-label="Clear">×</button>
      ) : null}

      {showDropdown ? (
        <div className="gs-pop">
          {loading && !hasAny ? (
            <div className="gs-empty mono">{lang === "tr" ? "aranıyor…" : "searching…"}</div>
          ) : !hasAny ? (
            <div className="gs-empty mono">{lang === "tr" ? "sonuç yok" : "no matches"}</div>
          ) : (
            <>
              {results.destinations.length > 0 ? (
                <div className="gs-section">
                  <div className="gs-section-head mono">{t.nav.stay} · {lang === "tr" ? "destinasyonlar" : "destinations"}</div>
                  {results.destinations.map(d => (
                    <button key={d.dest_id} className="gs-row" onClick={() => pickDest(d)}>
                      <span className="gs-row-cat mono">stay</span>
                      <span className="gs-row-name">{d.label}</span>
                      <span className="gs-row-meta mono">
                        {d.country}{d.hotels ? ` · ${d.hotels.toLocaleString()} hotels` : ""}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
              {results.cars.length > 0 ? (
                <div className="gs-section">
                  <div className="gs-section-head mono">{t.nav.drive}</div>
                  {results.cars.map(c => (
                    <button key={c.id} className="gs-row" onClick={() => pickItem(c, "drive")}>
                      <span className="gs-row-cat mono">drive</span>
                      <span className="gs-row-name">{c.name}</span>
                      <span className="gs-row-meta mono">{c.loc}</span>
                    </button>
                  ))}
                </div>
              ) : null}
              {results.yachts.length > 0 ? (
                <div className="gs-section">
                  <div className="gs-section-head mono">{t.nav.sail}</div>
                  {results.yachts.map(y => (
                    <button key={y.id} className="gs-row" onClick={() => pickItem(y, "sail")}>
                      <span className="gs-row-cat mono">sail</span>
                      <span className="gs-row-name">{y.name}</span>
                      <span className="gs-row-meta mono">{y.loc}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

// ============ SEARCH BAR (functional) ============
function SearchBar({ t, lang, category, setCategory, onSearch, compact = false, initial = {} }) {
  const tabs = [
    { id: "stay", label: t.search.tabs.stay },
    { id: "drive", label: t.search.tabs.drive },
    { id: "sail", label: t.search.tabs.sail },
  ];

  const [where, setWhere] = useState(initial.whereLabel || "");
  const [dest, setDest] = useState(initial.dest || null);
  const [checkIn, setCheckIn] = useState(initial.checkIn || nextDateISO(14));
  const [checkOut, setCheckOut] = useState(initial.checkOut || nextDateISO(21));
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
      window.searchDestinations(q, { signal: ctrl.signal }).then(items => {
        setSuggestions(items);
        setDestLoading(false);
      });
    }, 250);
    return () => { clearTimeout(id); ctrl.abort(); };
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
    const adultStr = adults === 1
      ? (lang === "tr" ? "1 yetişkin" : "1 adult")
      : `${adults} ${lang === "tr" ? "yetişkin" : "adults"}`;
    const roomStr = rooms === 1
      ? (lang === "tr" ? "1 oda" : "1 room")
      : `${rooms} ${lang === "tr" ? "oda" : "rooms"}`;
    return `${adultStr} · ${roomStr}`;
  };

  const handleSearch = () => {
    onSearch && onSearch({
      category,
      dest,
      whereLabel: where,
      checkIn,
      checkOut,
      adults,
      rooms,
    });
    setOpenField(null);
  };

  const cityFieldLabel = category === "drive" ? t.search.pickup : t.search.destination;
  const cityFieldPh = category === "drive" ? t.search.pickup_ph : t.search.destination_ph;

  return (
    <div className={`search-bar ${compact ? "compact" : ""}`} ref={wrapRef}>
      <div className="search-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`search-tab ${category === tab.id ? "active" : ""}`}
            onClick={() => setCategory(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="search-fields">
        {/* WHERE */}
        <div className="search-field-wrap">
          <button
            className={`field ${openField === "where" ? "open" : ""}`}
            onClick={() => setOpenField(openField === "where" ? null : "where")}
            type="button"
          >
            <span className="field-label">{cityFieldLabel}</span>
            <span className={`field-value ${!where ? "placeholder" : ""}`}>
              {where || cityFieldPh}
            </span>
          </button>
          {openField === "where" ? (
            <div className="sb-pop sb-pop-where">
              <input
                type="text"
                className="sb-input"
                placeholder={cityFieldPh}
                value={destInput}
                onChange={e => setDestInput(e.target.value)}
                autoFocus
              />
              <div className="sb-suggestions">
                {destLoading ? (
                  <div className="sb-empty mono">{lang === "tr" ? "aranıyor…" : "searching…"}</div>
                ) : suggestions.length === 0 && destInput.length >= 2 ? (
                  <div className="sb-empty mono">{lang === "tr" ? "sonuç yok" : "no matches"}</div>
                ) : suggestions.length === 0 ? (
                  <>
                    <div className="sb-sugg-head mono">{lang === "tr" ? "Popüler" : "Popular"}</div>
                    {["Paris", "Rome", "Mykonos", "Marrakech", "Kyoto", "Bali", "Istanbul"].map(p => (
                      <button
                        key={p}
                        className="sb-sugg-item"
                        type="button"
                        onClick={() => setDestInput(p)}
                      >
                        <span className="sb-sugg-name">{p}</span>
                        <span className="sb-sugg-meta mono">{lang === "tr" ? "ara" : "search"} →</span>
                      </button>
                    ))}
                  </>
                ) : (
                  suggestions.map(s => (
                    <button
                      key={s.dest_id}
                      className="sb-sugg-item"
                      type="button"
                      onClick={() => pickDest(s)}
                    >
                      <span className="sb-sugg-name">{s.label}</span>
                      <span className="sb-sugg-meta mono">
                        {s.country}{s.hotels ? ` · ${s.hotels.toLocaleString()} hotels` : ""}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>
        <div className="search-divider" />

        {/* DATES */}
        <div className="search-field-wrap">
          <button
            className={`field ${openField === "dates" ? "open" : ""}`}
            onClick={() => setOpenField(openField === "dates" ? null : "dates")}
            type="button"
          >
            <span className="field-label">{t.search.dates}</span>
            <span className={`field-value ${!checkIn ? "placeholder" : ""}`}>
              {checkIn ? `${formatDate(checkIn)} → ${formatDate(checkOut)}` : t.search.dates_ph}
            </span>
          </button>
          {openField === "dates" ? (
            <div className="sb-pop sb-pop-dates">
              <div className="sb-date-row">
                <label className="sb-date-col">
                  <span className="mono sb-date-lbl">{t.detail.check_in}</span>
                  <input
                    type="date"
                    className="sb-date-input"
                    value={checkIn}
                    min={nextDateISO(0)}
                    onChange={e => {
                      setCheckIn(e.target.value);
                      if (e.target.value >= checkOut) {
                        const d = new Date(e.target.value);
                        d.setDate(d.getDate() + 7);
                        setCheckOut(d.toISOString().slice(0, 10));
                      }
                    }}
                  />
                </label>
                <label className="sb-date-col">
                  <span className="mono sb-date-lbl">{t.detail.check_out}</span>
                  <input
                    type="date"
                    className="sb-date-input"
                    value={checkOut}
                    min={checkIn}
                    onChange={e => setCheckOut(e.target.value)}
                  />
                </label>
              </div>
              <div className="sb-date-quick">
                {[
                  { lbl: lang === "tr" ? "Bu hafta sonu" : "This weekend", days: 2, from: nextWeekendStart() },
                  { lbl: lang === "tr" ? "7 gece" : "7 nights", days: 7, from: nextDateISO(14) },
                  { lbl: lang === "tr" ? "14 gece" : "14 nights", days: 14, from: nextDateISO(14) },
                ].map(q => (
                  <button
                    key={q.lbl}
                    type="button"
                    className="sb-date-pill mono"
                    onClick={() => {
                      setCheckIn(q.from);
                      const d = new Date(q.from);
                      d.setDate(d.getDate() + q.days);
                      setCheckOut(d.toISOString().slice(0, 10));
                    }}
                  >
                    {q.lbl}
                  </button>
                ))}
              </div>
              <button type="button" className="btn btn-sm btn-ghost sb-date-close" onClick={() => setOpenField("guests")}>
                {lang === "tr" ? "Devam et" : "Continue"} →
              </button>
            </div>
          ) : null}
        </div>
        <div className="search-divider" />

        {/* GUESTS */}
        <div className="search-field-wrap">
          <button
            className={`field ${openField === "guests" ? "open" : ""}`}
            onClick={() => setOpenField(openField === "guests" ? null : "guests")}
            type="button"
          >
            <span className="field-label">{t.search.guests}</span>
            <span className="field-value">{guestLabel()}</span>
          </button>
          {openField === "guests" ? (
            <div className="sb-pop sb-pop-guests">
              <Stepper
                label={lang === "tr" ? "Yetişkin" : "Adults"}
                sub={lang === "tr" ? "13 yaş ve üstü" : "Age 13+"}
                value={adults}
                min={1}
                max={12}
                onChange={setAdults}
              />
              <Stepper
                label={lang === "tr" ? "Oda" : "Rooms"}
                value={rooms}
                min={1}
                max={6}
                onChange={setRooms}
              />
              <button type="button" className="btn btn-sm btn-ghost sb-date-close" onClick={() => setOpenField(null)}>
                {lang === "tr" ? "Tamam" : "Done"}
              </button>
            </div>
          ) : null}
        </div>

        <button className="btn btn-accent search-go" onClick={handleSearch} type="button">
          {t.search.search}
        </button>
      </div>
    </div>
  );
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
          onClick={() => onChange(Math.max(min, value - 1))}
        >−</button>
        <span className="sb-step-val">{value}</span>
        <button
          type="button"
          className="sb-step-btn"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >+</button>
      </div>
    </div>
  );
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
      </div>
      <div className="card-meta">
        <div className="card-loc">{item.loc}</div>
        <div className="card-title">{item.name}</div>
        <div className="card-price">
          <span className="from">{t.detail.from}</span>
          <span className="amount">{item.currency}{item.price.toLocaleString()}</span>
          <span className="per">{perLabel}</span>
        </div>
      </div>
    </div>
  );
}

// ============ FOOTER ============
function Footer({ t }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo />
            <p className="footer-tag">
              The world's most considered places, vehicles and yachts —
              brought together in one calm flow.
            </p>
          </div>
          <div className="footer-col">
            <div className="eyebrow">Discover</div>
            <a>Stays</a><a>Drives</a><a>Yachts</a><a>The Journal</a>
          </div>
          <div className="footer-col">
            <div className="eyebrow">Company</div>
            <a>About</a><a>Curators</a><a>Press</a><a>Careers</a>
          </div>
          <div className="footer-col">
            <div className="eyebrow">Help</div>
            <a>Concierge</a><a>Contact</a><a>Terms</a><a>Privacy</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="mono">© 2026 · luxn.co.uk</span>
          <span className="mono">London · Istanbul · Tokyo</span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Placeholder, SmartImage, Logo, Nav, SearchBar, PropertyCard, Footer });
