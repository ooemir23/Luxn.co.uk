// LUXN — Compact home screen (magazine layout, minimal scroll)
// Uses Otelz API for live hotel data

function HomeScreen({ t, lang, category, setCategory, go }) {
  // Live hotel data from Otelz API (gracefully falls back to mock)
  const [liveStays, setLiveStays] = React.useState(null);
  const [apiState, setApiState] = React.useState("loading"); // loading | live | mock

  React.useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();

    // Fetch featured hotels from Otelz (default: Paris)
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 14); // 2 weeks from now
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 7); // 7-night stay

    if (window.otelz?.searchHotels) {
      window.otelz.searchHotels({
        destination: "Paris",
        checkIn: checkIn.toISOString().split('T')[0],
        checkOut: checkOut.toISOString().split('T')[0],
        guests: 2,
        rooms: 1,
        signal: ctrl.signal
      }).then(data => {
        if (cancelled) return;
        if (data && data.length > 0) {
          setLiveStays(data);
          setApiState("live");
        } else {
          setApiState("mock");
        }
      }).catch(err => {
        if (!cancelled) {
          console.warn('[LUXN] Home fetch error:', err.message);
          setApiState("mock");
        }
      });
    } else {
      setApiState("mock");
    }

    return () => { cancelled = true; ctrl.abort(); };
  }, []);

  const stays = liveStays || window.STAYS;

  // Active tab: 'stay' only (Otelz integration)
  const [tab, setTab] = React.useState("stay");

  // Display stays only
  const filteredItems = React.useMemo(() => {
    return stays.slice(0, 8).map(item => ({ item, cat: "stay" }));
  }, [stays]);

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

      {/* OTELZ FEATURED STAYS */}
      <section className="home-tabs">
        <div className="container tabs-inner">
          <div style={{ flex: 1 }}>
            <h2 className="detail-title" style={{ marginBottom: 0, fontSize: "1.5rem" }}>
              {t.home.stay_title}
            </h2>
            <p style={{ color: "var(--ink-2)", marginTop: 8 }}>{t.home.stay_sub}</p>
          </div>
          <button
            className="tabs-cta"
            onClick={() => go({ screen: "results", category: "stay" })}
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
                    <span className="amount">{window.formatPrice ? window.formatPrice(featured.item.price, featured.item.currency) : `${featured.item.currency}${featured.item.price.toLocaleString()}`}</span>
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
          <button className="btn btn-ghost btn-sm" onClick={() => go({ screen: "concierge" })}>{t.home.concierge_cta} →</button>
        </div>
        <div className="journal-tiles">
          <div className="eyebrow" style={{ marginBottom: 12 }}>{t.home.journal_title}</div>
          {window.JOURNAL.map(j => (
            <button key={j.id} className="journal-tile" onClick={() => go({ screen: "journal-detail", id: j.id })}>
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
        {window.RecentlyViewed && <window.RecentlyViewed t={t} lang={lang} go={go} />}
      </section>
    </main>
  );
}

window.HomeScreen = HomeScreen;
