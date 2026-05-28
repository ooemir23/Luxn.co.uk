// LUXN — Compact home screen (magazine layout, minimal scroll)

function HomeScreen({ t, lang, category, setCategory, go }) {
  // Live hotel data from Booking.com API (gracefully falls back to mock)
  const [liveStays, setLiveStays] = React.useState(null);
  const [apiState, setApiState] = React.useState("loading"); // loading | live | mock

  React.useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();
    window.fetchHotels({ destIdx: 0, signal: ctrl.signal }).then(data => {
      if (cancelled) return;
      if (data && data.length) {
        setLiveStays(data);
        setApiState("live");
      } else {
        setApiState("mock");
      }
    });
    return () => { cancelled = true; ctrl.abort(); };
  }, []);

  const stays = liveStays || window.STAYS;

  // Active tab: 'edit' (curated mix) | 'stay' | 'drive' | 'sail'
  const [tab, setTab] = React.useState("edit");

  // Build display list for the grid: featured + 4 sides
  // Curated mix: 1 stay big + 1 drive + 1 sail + 1 stay + 1 drive
  const mix = React.useMemo(() => {
    return [
      { item: stays[0], cat: "stay" },
      { item: window.YACHTS[0], cat: "sail" },
      { item: window.CARS[0], cat: "drive" },
      { item: stays[1], cat: "stay" },
      { item: window.YACHTS[1], cat: "sail" },
      { item: window.CARS[1], cat: "drive" },
      { item: stays[2], cat: "stay" },
      { item: window.CARS[2], cat: "drive" },
    ];
  }, [stays]);

  const filteredItems = React.useMemo(() => {
    if (tab === "edit") return mix;
    const src = tab === "stay" ? stays : tab === "drive" ? window.CARS : window.YACHTS;
    return src.slice(0, 8).map(item => ({ item, cat: tab }));
  }, [tab, stays, mix]);

  const featured = filteredItems[0];
  const sides = filteredItems.slice(1, 5);
  const restCount = filteredItems.length - 5;

  return (
    <main className="home-compact">
      {/* HERO STRIP — compact, title + search inline */}
      <section className="home-hero-strip">
        <div className="container hero-strip-inner">
          <div className="hero-strip-left">
            <div className="eyebrow" style={{ marginBottom: 10 }}>{t.hero.eyebrow}</div>
            <h1 className="display hero-strip-title">
              {t.hero.title_a} <span style={{ fontStyle: "italic", color: "var(--ink-2)" }}>{t.hero.title_b}</span>
            </h1>
            <div className="hero-strip-meta">
              <span><strong>214</strong> {lang === "tr" ? "adres" : "addresses"}</span>
              <span className="dot-sep">·</span>
              <span><strong>38</strong> {lang === "tr" ? "ülke" : "countries"}</span>
              <span className="dot-sep">·</span>
              <span><strong>24/7</strong> concierge</span>
              {apiState === "live" ? (
                <>
                  <span className="dot-sep">·</span>
                  <span className="live-tag">● {lang === "tr" ? "canlı veri" : "live data"}</span>
                </>
              ) : apiState === "mock" ? (
                <>
                  <span className="dot-sep">·</span>
                  <span className="live-tag mock" title={lang === "tr" ? "API aboneliği bekleniyor" : "awaiting API subscription"}>○ {lang === "tr" ? "demo veri" : "demo data"}</span>
                </>
              ) : (
                <>
                  <span className="dot-sep">·</span>
                  <span className="live-tag loading">○ {lang === "tr" ? "yükleniyor" : "loading"}</span>
                </>
              )}
            </div>
          </div>
          <div className="hero-strip-right">
            <SearchBar
              t={t}
              lang={lang}
              category={category}
              setCategory={setCategory}
              onSearch={(params) => go({ screen: "results", category: params.category, searchParams: params })}
            />
          </div>
        </div>
      </section>

      {/* TAB STRIP */}
      <section className="home-tabs">
        <div className="container tabs-inner">
          <div className="tabs-list">
            <button className={`home-tab ${tab === "edit" ? "active" : ""}`} onClick={() => setTab("edit")}>
              <span className="tab-num mono">01</span>
              <span className="tab-lbl">{lang === "tr" ? "Bu haftanın seçkisi" : "This week's edit"}</span>
            </button>
            <button className={`home-tab ${tab === "stay" ? "active" : ""}`} onClick={() => setTab("stay")}>
              <span className="tab-num mono">02</span>
              <span className="tab-lbl">{t.nav.stay}</span>
            </button>
            <button className={`home-tab ${tab === "drive" ? "active" : ""}`} onClick={() => setTab("drive")}>
              <span className="tab-num mono">03</span>
              <span className="tab-lbl">{t.nav.drive}</span>
            </button>
            <button className={`home-tab ${tab === "sail" ? "active" : ""}`} onClick={() => setTab("sail")}>
              <span className="tab-num mono">04</span>
              <span className="tab-lbl">{t.nav.sail}</span>
            </button>
          </div>
          <button
            className="tabs-cta"
            onClick={() => go({ screen: "results", category: tab === "edit" ? "stay" : tab })}
          >
            {t.home.view_all} →
          </button>
        </div>
      </section>

      {/* EDITORIAL GRID — feature card + sides */}
      <section className="container editorial-grid" key={tab}>
        {featured ? (
          <div className="feature-card fade-in" onClick={() => go({ screen: "detail", category: featured.cat, id: featured.item.id })}>
            <div className="feature-img">
              <SmartImage
                src={window.imageFor(featured.item, featured.cat)}
                alt={featured.item.name}
                tone={featured.item.tone}
                label={featured.item.name?.toUpperCase()}
              />
              <div className="feature-overlay">
                <div className="feature-tag">{t.nav[featured.cat]} · {lang === "tr" ? "öne çıkan" : "featured"}</div>
                <h2 className="feature-title display">{featured.item.name}</h2>
                <div className="feature-loc">{featured.item.loc}</div>
                <div className="feature-foot">
                  <div className="feature-price">
                    <span className="from">{t.detail.from}</span>
                    <span className="amount">{featured.item.currency}{featured.item.price.toLocaleString()}</span>
                    <span className="per">{featured.cat === "sail" ? t.results.per_week : featured.cat === "drive" ? t.results.per_day : t.results.per_night}</span>
                  </div>
                  <div className="feature-rating">
                    <span className="star">★</span>
                    <span>{featured.item.rating?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="sides-grid">
          {sides.map(({ item, cat }, i) => (
            <PropertyCard
              key={item.id + "-" + i}
              item={item}
              t={t}
              category={cat}
              variant="compact"
              onClick={() => go({ screen: "detail", category: cat, id: item.id })}
            />
          ))}
        </div>
      </section>

      {/* INLINE STRIP — concierge + journal teaser (compact, one row) */}
      <section className="container inline-strip">
        <div className="concierge-tile">
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>concierge</div>
            <div className="concierge-tile-title display">{t.home.concierge_title}</div>
            <div className="concierge-tile-sub">{t.home.concierge_sub}</div>
          </div>
          <button className="btn btn-ghost btn-sm">{t.home.concierge_cta} →</button>
        </div>
        <div className="journal-tiles">
          <div className="eyebrow" style={{ marginBottom: 12 }}>{t.home.journal_title}</div>
          {window.JOURNAL.map(j => (
            <button key={j.id} className="journal-tile">
              <div className="journal-tile-img">
                <SmartImage src={window.imageFor(j, "journal")} tone={j.tone} alt={j.title} />
              </div>
              <div className="journal-tile-meta">
                <div className="journal-tile-cat mono">{j.cat} · {j.read}</div>
                <div className="journal-tile-title">{j.title}</div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

window.HomeScreen = HomeScreen;
