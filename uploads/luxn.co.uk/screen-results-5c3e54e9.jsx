// LUXN — Results / search-list screen

function ResultsScreen({ t, lang, category, setCategory, go, searchParams }) {
  const dataByCat = { stay: window.STAYS, drive: window.CARS, sail: window.YACHTS };
  const amenByCat = { stay: window.AMENITIES_STAY, drive: window.AMENITIES_CAR, sail: window.AMENITIES_YACHT };

  // Live API results for "stay" if searchParams present, else fall back
  const [liveResults, setLiveResults] = React.useState(null);
  const [apiState, setApiState] = React.useState("idle"); // idle | loading | live | mock

  React.useEffect(() => {
    if (category !== "stay") {
      setLiveResults(null);
      setApiState("idle");
      return;
    }
    setApiState("loading");
    const ctrl = new AbortController();
    const params = searchParams && searchParams.dest
      ? {
          dest_id: searchParams.dest.dest_id,
          search_type: searchParams.dest.search_type,
          arrival_date: searchParams.checkIn,
          departure_date: searchParams.checkOut,
          adults: searchParams.adults,
          rooms: searchParams.rooms,
          signal: ctrl.signal,
        }
      : { dest_id: "-1456928", search_type: "city", signal: ctrl.signal };
    window.fetchHotelsByDest(params).then(data => {
      if (data && data.length) {
        setLiveResults(data);
        setApiState("live");
      } else {
        setApiState("mock");
      }
    });
    return () => ctrl.abort();
  }, [category, searchParams]);

  const baseItems = category === "stay" && liveResults ? liveResults : dataByCat[category];
  const allItems = baseItems;
  const [sort, setSort] = React.useState("curated");
  const [filterStyle, setFilterStyle] = React.useState(new Set());
  const [filterAmen, setFilterAmen] = React.useState(new Set());
  const [minPrice, setMinPrice] = React.useState("");
  const [maxPrice, setMaxPrice] = React.useState("");

  const toggle = (set, val, setter) => {
    const next = new Set(set);
    if (next.has(val)) next.delete(val); else next.add(val);
    setter(next);
  };

  let items = allItems.filter(i => {
    if (filterStyle.size && !filterStyle.has(i.style)) return false;
    if (minPrice && i.price < +minPrice) return false;
    if (maxPrice && i.price > +maxPrice) return false;
    return true;
  });

  if (sort === "low") items = [...items].sort((a, b) => a.price - b.price);
  else if (sort === "high") items = [...items].sort((a, b) => b.price - a.price);
  else if (sort === "rating") items = [...items].sort((a, b) => b.rating - a.rating);

  const styles = [...new Set(allItems.map(i => i.style).filter(Boolean))];

  const searchedLoc = searchParams?.whereLabel || null;
  const locText = searchedLoc || (
    category === "stay"
      ? (lang === "tr" ? "Avrupa & ötesi" : "Europe & beyond")
      : category === "drive"
      ? (lang === "tr" ? "Avrupa garajları" : "European garages")
      : (lang === "tr" ? "Akdeniz & Karayipler" : "Mediterranean & Caribbean")
  );

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
              <button onClick={() => go({ screen: "home" })}>LUXN</button>
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
            {styles.map(s => (
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
            <div className="range-row">
              <input
                type="number"
                className="range-input"
                placeholder="min"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
              />
              <span>—</span>
              <input
                type="number"
                className="range-input"
                placeholder="max"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
              />
            </div>
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

          <button
            className="btn-link"
            onClick={() => { setFilterStyle(new Set()); setFilterAmen(new Set()); setMinPrice(""); setMaxPrice(""); }}
          >
            {t.results.clear}
          </button>
        </aside>

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
      </section>
    </main>
  );
}

window.ResultsScreen = ResultsScreen;
