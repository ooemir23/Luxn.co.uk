// LUXN — Detail screen

function DetailScreen({ t, lang, category, id, go }) {
  const dataByCat = { stay: window.STAYS, drive: window.CARS, sail: window.YACHTS };
  const amenByCat = { stay: window.AMENITIES_STAY, drive: window.AMENITIES_CAR, sail: window.AMENITIES_YACHT };
  const item = dataByCat[category].find(i => i.id === id) || dataByCat[category][0];
  const [tab, setTab] = React.useState("overview");

  // Description copy varies by category
  const desc = {
    stay: lang === "tr"
      ? [
          `${item.name}, ${item.loc.split(",")[0]} kıyısında yalnızca ${item.rooms} anahtarlı bir adres. Mimar ve ev sahibi, mevsime göre değişen sessiz bir tören kuruyor: sabah café, öğleden sonra havuz, akşam üzeri kütüphane, gece şarap mahzeni.`,
          "İçeride, beyazlatılmış meşe parke, el dokuması linen ve yerel sanatçılardan tek parça eserler. Dışarıda, bahçıvanın 14 yıldır birlikte çalıştığı 200 yıllık zeytinlik.",
        ]
      : [
          `${item.name} is a ${item.rooms}-key address overlooking ${item.loc.split(",")[0]}. The owner-architect choreographs a quiet seasonal ritual: café in the morning, pool through the afternoon, library at golden hour, the cellar after dinner.`,
          "Inside, washed oak floors, hand-woven linen, and one-off pieces from local artists. Outside, the 200-year-old olive grove the gardener has worked with for fourteen years.",
        ],
    drive: lang === "tr"
      ? [
          `${item.year} model ${item.name}. ${item.spec}. Saatlik ya da haftalık. Tam sigorta dahil; isteğe bağlı şoför Bentley-eğitimli ve İngilizce, Türkçe, Fransızca konuşur.`,
          `Otel kapısına teslim. ${item.loc} 50 km yarıçap içinde ücretsiz teslimat.`,
        ]
      : [
          `${item.year} ${item.name}. ${item.spec}. Hourly or weekly. Full insurance is included; an optional chauffeur is Bentley-trained and speaks English, Turkish, and French.`,
          `Delivered to your hotel door. Complimentary delivery within 50 km of ${item.loc}.`,
        ],
    sail: lang === "tr"
      ? [
          `${item.name}, ${item.length} metrelik ${item.type.toLowerCase()}. ${item.cabins} kabin, ${item.year} yapımı. Tam mürettebat: kaptan, şef, hostes, mühendis.`,
          `Rotanız kişisel. Mürettebat sabah cappuccino ile başlar, akşamı sizin seçtiğiniz koyda bitirir.`,
        ]
      : [
          `${item.name} is a ${item.length}-metre ${item.type.toLowerCase()}, ${item.cabins} cabins, built ${item.year}. Full crew: captain, chef, host, engineer.`,
          `Your route is yours. The crew starts the morning with a cappuccino and ends the evening in the cove of your choosing.`,
        ],
  };

  const tabs = [
    { id: "overview", lbl: t.detail.overview },
    { id: category === "stay" ? "rooms" : category === "drive" ? "specs" : "cabins", lbl: category === "stay" ? t.detail.rooms : category === "drive" ? "Specs" : "Cabins" },
    { id: "amenities", lbl: t.detail.amenities },
    { id: "location", lbl: t.detail.location },
    { id: "reviews", lbl: t.detail.reviews },
  ];

  const perLabel = category === "sail" ? t.results.per_week : category === "drive" ? t.results.per_day : t.results.per_night;

  return (
    <main>
      <section className="container detail-hero">
        <div className="breadcrumb">
          <button onClick={() => go({ screen: "home" })}>LUXN</button>
          <span className="sep">/</span>
          <button onClick={() => go({ screen: "results", category })}>{t.nav[category]}</button>
          <span className="sep">/</span>
          <span className="here">{item.name}</span>
        </div>

        <div className="detail-title-row">
          <div>
            <div className="detail-loc">{item.loc}</div>
            <h1 className="detail-title display">{item.name}</h1>
          </div>
          <div className="detail-rating">
            <span className="star">★</span>
            <span>{item.rating.toFixed(2)}</span>
            <span>·</span>
            <span>{Math.round(item.rating * 47)} {lang === "tr" ? "yorum" : "reviews"}</span>
          </div>
        </div>

        <div className="detail-gallery">
          <SmartImage src={window.imageFor(item, category)} alt={item.name} tone={item.tone} label={`${item.name.toUpperCase()} · 01`} />
          <SmartImage src={window.imageFor(item, category)} tone={(item.tone % 7) + 1} label="02" />
          <SmartImage src={window.imageFor(item, category)} tone={((item.tone + 2) % 7) + 1} label="03" />
          <SmartImage src={window.imageFor(item, category)} tone={((item.tone + 3) % 7) + 1} label="04" />
          <SmartImage src={window.imageFor(item, category)} tone={((item.tone + 4) % 7) + 1} label="05" />
        </div>
      </section>

      <section className="container detail-body">
        <div>
          <div className="detail-tabs">
            {tabs.map(tb => (
              <button
                key={tb.id}
                className={`detail-tab ${tab === tb.id ? "active" : ""}`}
                onClick={() => setTab(tb.id)}
              >
                {tb.lbl}
              </button>
            ))}
          </div>

          <div className="detail-section">
            <h3>{t.detail.overview}</h3>
            {desc[category].map((p, i) => <p key={i}>{p}</p>)}
          </div>

          <div className="detail-section">
            <h3>{t.detail.highlights}</h3>
            <div className="amen-grid">
              {amenByCat[category].map(a => (
                <div key={a} className="amen-item">{a}</div>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <h3>{t.detail.hosted_by}</h3>
            <div className="detail-host">
              <div className="host-avatar">{item.name.charAt(0)}</div>
              <div className="host-meta">
                <div className="name">{
                  category === "stay" ? (lang === "tr" ? "Élise & Marc" : "Élise & Marc")
                  : category === "drive" ? "Auto Curatore"
                  : "Aegean Charters"
                }</div>
                <div className="since">{t.detail.hosted_by} · {t.detail.since} 2019</div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>{t.detail.policies}</h3>
            <p>
              {lang === "tr"
                ? `${t.detail.check_in} 16:00 · ${t.detail.check_out} 11:00. Esnek iptal: girişten 14 gün öncesine kadar tam iade.`
                : `${t.detail.check_in} 4 pm · ${t.detail.check_out} 11 am. Flexible cancellation: full refund up to 14 days before arrival.`}
            </p>
          </div>
        </div>

        <aside className="book-card">
          <div className="book-price-row">
            <span className="amount">{item.currency}{item.price.toLocaleString()}</span>
            <span className="per">{perLabel}</span>
          </div>
          <div className="book-rating">
            <span className="star">★</span>
            <span>{item.rating.toFixed(2)}</span>
            <span>·</span>
            <span>{Math.round(item.rating * 47)} {lang === "tr" ? "yorum" : "reviews"}</span>
          </div>

          <div className="book-fields">
            <div className="field">
              <span className="field-label">{t.detail.check_in}</span>
              <span className="field-value">14 Jun</span>
            </div>
            <div className="field">
              <span className="field-label">{t.detail.check_out}</span>
              <span className="field-value">21 Jun</span>
            </div>
            <div className="field field-wide">
              <span className="field-label">{t.search.guests}</span>
              <span className="field-value">2 {lang === "tr" ? "yetişkin" : "adults"}</span>
            </div>
          </div>

          <button
            className="btn btn-block btn-accent"
            onClick={() => go({ screen: "booking", category, id: item.id })}
          >
            {t.detail.book}
          </button>
          <button className="btn btn-block btn-ghost" style={{ marginTop: 10 }}>
            {t.detail.contact}
          </button>

          <div className="book-summary">
            <div className="book-row">
              <span>{item.currency}{item.price.toLocaleString()} × 7 {lang === "tr" ? "gece" : "nights"}</span>
              <span>{item.currency}{(item.price * 7).toLocaleString()}</span>
            </div>
            <div className="book-row">
              <span>{lang === "tr" ? "Concierge ücreti" : "Concierge fee"}</span>
              <span>{item.currency}{Math.round(item.price * 0.04).toLocaleString()}</span>
            </div>
            <div className="book-row total">
              <span>{t.detail.total}</span>
              <span className="price">{item.currency}{(item.price * 7 + Math.round(item.price * 0.04)).toLocaleString()}</span>
            </div>
            <div className="book-taxes">{t.detail.taxes}</div>
          </div>
        </aside>
      </section>
    </main>
  );
}

window.DetailScreen = DetailScreen;
