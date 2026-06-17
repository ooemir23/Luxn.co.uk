// LUXN — Results / search-list screen with price slider + map view

function ResultsScreen({ t, lang, category, setCategory, go, searchParams }) {
  const dataByCat = { stay: window.STAYS, drive: window.CARS, sail: window.YACHTS };
  const amenByCat = { stay: window.AMENITIES_STAY, drive: window.AMENITIES_CAR, sail: window.AMENITIES_YACHT };

  // Live API results for "stay" from Otelz if searchParams present, else fall back
  const [liveResults, setLiveResults] = React.useState(null);
  const [apiState, setApiState] = React.useState("idle");

  React.useEffect(() => {
    if (category !== "stay") {
      setLiveResults(null);
      setApiState("idle");
      return;
    }

    setApiState("loading");
    const ctrl = new AbortController();

    // Use searchParams if available, otherwise use defaults
    const destination = searchParams?.dest?.label || "Paris";
    const checkIn = searchParams?.checkIn || new Date().toISOString().split('T')[0];
    const checkOut = searchParams?.checkOut || new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0];
    const guests = searchParams?.adults || 2;
    const rooms = searchParams?.rooms || 1;

    if (window.otelz?.searchHotels) {
      window.otelz.searchHotels({
        destination,
        checkIn,
        checkOut,
        guests,
        rooms,
        signal: ctrl.signal
      }).then(data => {
        if (data && data.length > 0) {
          setLiveResults(data);
          setApiState("live");
        } else {
          setApiState("mock");
        }
      }).catch(err => {
        console.warn('[LUXN] Results fetch error:', err.message);
        setApiState("mock");
      });
    } else {
      setApiState("mock");
    }

    return () => ctrl.abort();
  }, [category, searchParams]);

  const baseItems = category === "stay" && liveResults ? liveResults : dataByCat[category];
  const allItems = baseItems;

  // Bounds for the price slider, derived from this category's data
  const priceBounds = React.useMemo(() => {
    if (!allItems.length) return [0, 1000];
    const prices = allItems.map(i => i.price);
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  }, [allItems]);

  const [sort, setSort] = React.useState("curated");
  const [view, setView] = React.useState("list"); // "list" | "map"
  const [filterStyle, setFilterStyle] = React.useState(new Set());
  const [filterAmen, setFilterAmen] = React.useState(new Set());
  const [priceRange, setPriceRange] = React.useState(priceBounds);

  // Reset price slider when bounds change (category swap or live data)
  React.useEffect(() => { setPriceRange(priceBounds); }, [priceBounds[0], priceBounds[1]]);

  const toggle = (set, val, setter) => {
    const next = new Set(set);
    if (next.has(val)) next.delete(val); else next.add(val);
    setter(next);
  };

  let items = allItems.filter(i => {
    if (filterStyle.size && !filterStyle.has(i.style)) return false;
    if (i.price < priceRange[0] || i.price > priceRange[1]) return false;
    if (filterAmen.size) {
      const itemAmens = window.getItemAmenities(i.id, category);
      for (const a of filterAmen) {
        if (!itemAmens.includes(a)) return false;
      }
    }
    return true;
  });

  if (sort === "low") items = [...items].sort((a, b) => a.price - b.price);
  else if (sort === "high") items = [...items].sort((a, b) => b.price - a.price);
  else if (sort === "rating") items = [...items].sort((a, b) => b.rating - a.rating);

  const styleList = [...new Set(allItems.map(i => i.style).filter(Boolean))];

  const searchedLoc = searchParams?.whereLabel || null;
  const locText = searchedLoc || (
    category === "stay"
      ? (lang === "tr" ? "Avrupa & ötesi" : "Europe & beyond")
      : category === "drive"
      ? (lang === "tr" ? "Avrupa garajları" : "European garages")
      : (lang === "tr" ? "Akdeniz & Karayipler" : "Mediterranean & Caribbean")
  );

  const clearAll = () => {
    setFilterStyle(new Set());
    setFilterAmen(new Set());
    setPriceRange(priceBounds);
  };

  return (
    <main>
      <div className="results-search-strip">
        <div className="container">
          <SearchBar
            t={t}
            lang={lang}
            category={category}
            setCategory={setCategory}
            initial={searchParams || {}}
            onSearch={(params) => go({ screen: "results", category: params.category, searchParams: params })}
            compact
          />
        </div>
      </div>

      <section className="results-head">
        <div className="container results-head-inner">
          <div>
            <div className="breadcrumb">
              <button onClick={() => go({ screen: "home" })}>Luxn</button>
              <span className="sep">/</span>
              <span className="here">{t.nav[category]}</span>
            </div>
            <h1 className="results-title">
              {t.nav[category]} <span className="loc">— {locText}</span>
            </h1>
            <div className="results-count">
              {apiState === "loading" ? (
                <span className="loading-dots">{lang === "tr" ? "aranıyor" : "searching"}…</span>
              ) : (
                <>
                  {items.length} {t.results.available}
                  {apiState === "live" ? <span style={{ color: "var(--accent)", marginLeft: 10 }}>● live</span> : null}
                </>
              )}
            </div>
          </div>
          <div className="results-tools">
            <div className="view-toggle" role="tablist" aria-label="View mode">
              <button
                role="tab"
                aria-selected={view === "list"}
                className={`view-toggle-btn ${view === "list" ? "active" : ""}`}
                onClick={() => setView("list")}
              >
                <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
                  <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <span>{t.results.view_list}</span>
              </button>
              <button
                role="tab"
                aria-selected={view === "map"}
                className={`view-toggle-btn ${view === "map" ? "active" : ""}`}
                onClick={() => setView("map")}
              >
                <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
                  <path d="M2 4l4-2 4 2 4-2v10l-4 2-4-2-4 2V4zM6 2v10M10 4v10" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none" />
                </svg>
                <span>{t.results.view_map}</span>
              </button>
            </div>
            <select
              className="tool-chip"
              value={sort}
              onChange={e => setSort(e.target.value)}
              style={{ appearance: "none", paddingRight: 28 }}
            >
              <option value="curated">{t.results.sort_curated}</option>
              <option value="low">{t.results.sort_low}</option>
              <option value="high">{t.results.sort_high}</option>
              <option value="rating">{t.results.sort_rating}</option>
            </select>
          </div>
        </div>
      </section>

      <section className="container results-body">
        <aside className="filters">
          <div className="filter-group">
            <div className="group-title">{t.results.filter_style}</div>
            {styleList.map(s => (
              <label key={s} className="filter-opt">
                <input
                  type="checkbox"
                  checked={filterStyle.has(s)}
                  onChange={() => toggle(filterStyle, s, setFilterStyle)}
                />
                <span>{s}</span>
              </label>
            ))}
          </div>

          <div className="filter-group">
            <div className="group-title">{t.results.filter_range}</div>
            <PriceRangeSlider
              min={priceBounds[0]}
              max={priceBounds[1]}
              value={priceRange}
              onChange={setPriceRange}
              currency={allItems[0]?.currency || "€"}
            />
          </div>

          <div className="filter-group">
            <div className="group-title">{t.results.filter_amen}</div>
            {amenByCat[category].slice(0, 6).map(a => (
              <label key={a} className="filter-opt">
                <input
                  type="checkbox"
                  checked={filterAmen.has(a)}
                  onChange={() => toggle(filterAmen, a, setFilterAmen)}
                />
                <span>{a}</span>
              </label>
            ))}
          </div>

          <button className="btn-link" onClick={clearAll}>{t.results.clear}</button>
        </aside>

        {view === "list" ? (
          items.length === 0 ? (
            <div className="results-empty">
              <div className="results-empty-title display">{t.results.no_results}</div>
              <button className="btn btn-ghost btn-sm" onClick={clearAll}>{t.results.clear}</button>
            </div>
          ) : (
            <div className="results-grid">
              {items.map(item => (
                <PropertyCard
                  key={item.id}
                  item={item}
                  t={t}
                  category={category}
                  onClick={() => go({ screen: "detail", category, id: item.id })}
                />
              ))}
            </div>
          )
        ) : (
          <div className="results-map-wrap">
            <ResultsMap
              items={items}
              category={category}
              t={t}
              onPick={(item) => go({ screen: "detail", category, id: item.id })}
            />
          </div>
        )}
      </section>
    </main>
  );
}

// ============ PRICE RANGE SLIDER ============
function PriceRangeSlider({ min, max, value, onChange, currency }) {
  const [lo, hi] = value;
  const trackRef = React.useRef(null);
  const range = Math.max(1, max - min);
  const loPct = ((lo - min) / range) * 100;
  const hiPct = ((hi - min) / range) * 100;

  const onLoChange = (e) => {
    const v = Math.min(+e.target.value, hi - 1);
    onChange([v, hi]);
  };
  const onHiChange = (e) => {
    const v = Math.max(+e.target.value, lo + 1);
    onChange([lo, v]);
  };

  return (
    <div className="price-slider">
      <div className="price-slider-track" ref={trackRef}>
        <div
          className="price-slider-fill"
          style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={lo}
          onChange={onLoChange}
          className="price-slider-input price-slider-lo"
          aria-label="Minimum price"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={hi}
          onChange={onHiChange}
          className="price-slider-input price-slider-hi"
          aria-label="Maximum price"
        />
      </div>
      <div className="price-slider-labels mono">
        <span>{currency}{lo.toLocaleString()}</span>
        <span>{currency}{hi.toLocaleString()}</span>
      </div>
    </div>
  );
}

// ============ RESULTS MAP (Leaflet, dark-mode tiles) ============
function ResultsMap({ items, category, t, onPick }) {
  const mapEl = React.useRef(null);
  const mapRef = React.useRef(null);
  const markersRef = React.useRef([]);

  // Detect current theme for tile choice
  const getTheme = () => document.documentElement.getAttribute("data-theme") || "light";
  const [theme, setTheme] = React.useState(getTheme());

  React.useEffect(() => {
    const observer = new MutationObserver(() => setTheme(getTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  // Init map once
  React.useEffect(() => {
    if (!mapEl.current || !window.L) return;
    const m = window.L.map(mapEl.current, {
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: false,
    }).setView([40, 15], 4);

    window.L.control.attribution({ prefix: false, position: "bottomright" })
      .addAttribution("© OpenStreetMap, CARTO").addTo(m);

    mapRef.current = m;
    return () => { m.remove(); mapRef.current = null; };
  }, []);

  // Tile layer follows theme
  React.useEffect(() => {
    const m = mapRef.current;
    if (!m) return;
    const dark = theme === "dark";
    const url = dark
      ? "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png";
    const labelsUrl = dark
      ? "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png";

    // remove previous tile layers
    m.eachLayer(layer => {
      if (layer instanceof window.L.TileLayer) m.removeLayer(layer);
    });
    window.L.tileLayer(url, { maxZoom: 19, subdomains: "abcd" }).addTo(m);
    window.L.tileLayer(labelsUrl, { maxZoom: 19, subdomains: "abcd", pane: "shadowPane" }).addTo(m);
  }, [theme]);

  // Markers
  React.useEffect(() => {
    const m = mapRef.current;
    if (!m || !window.L) return;

    // Clear old
    markersRef.current.forEach(mk => m.removeLayer(mk));
    markersRef.current = [];

    const withCoords = items.filter(i => typeof i.lat === "number" && typeof i.lng === "number");
    if (!withCoords.length) return;

    withCoords.forEach(item => {
      const html = `
        <div class="lx-pin">
          <span class="lx-pin-amount">${item.currency}${item.price.toLocaleString()}</span>
        </div>
      `;
      const icon = window.L.divIcon({
        className: "lx-pin-wrap",
        html,
        iconSize: [80, 28],
        iconAnchor: [40, 14],
      });
      const marker = window.L.marker([item.lat, item.lng], { icon }).addTo(m);

      const popupHtml = `
        <div class="lx-popup">
          <div class="lx-popup-loc mono">${item.loc}</div>
          <div class="lx-popup-title">${item.name}</div>
          <div class="lx-popup-foot">
            <span class="lx-popup-price">${item.currency}${item.price.toLocaleString()}</span>
            <span class="lx-popup-rating">★ ${item.rating?.toFixed(2) || ""}</span>
          </div>
          <button class="lx-popup-cta" data-id="${item.id}">${t.results.view} →</button>
        </div>
      `;
      marker.bindPopup(popupHtml, { closeButton: false, className: "lx-popup-wrap" });
      marker.on("popupopen", (e) => {
        const cta = e.popup._contentNode?.querySelector(".lx-popup-cta");
        if (cta) cta.addEventListener("click", () => onPick(item), { once: true });
      });
      markersRef.current.push(marker);
    });

    // Fit bounds
    const group = window.L.featureGroup(markersRef.current);
    const bounds = group.getBounds();
    if (bounds.isValid()) {
      m.fitBounds(bounds, { padding: [40, 40], maxZoom: 7 });
    }
  }, [items, category, onPick, t]);

  return <div className="results-map" ref={mapEl} aria-label="Map of results" />;
}

window.ResultsScreen = ResultsScreen;
