// LUXN — Redesigned Detail screen (premium, interactive tabs and booking fields)

function getRoomsForStay(id, lang) {
  const rooms = {
    s1: [
      { name: lang === "tr" ? "Ebeveyn Süiti" : "Master Suite", beds: "1 King Bed", desc: lang === "tr" ? "Özel teraslı, şömineli ve vadi manzaralı ebeveyn banyolu ana yatak odası." : "Main bedroom with private terrace, fireplace and ensuite bath with valley view." },
      { name: lang === "tr" ? "Bahçe Odası" : "Garden Room", beds: "1 Queen Bed", desc: lang === "tr" ? "200 yıllık zeytinlik manzarasına ve doğrudan bahçeye açılan verandaya sahip yatak odası." : "Bedroom with 200-year-old olive grove views and direct veranda garden access." },
      { name: lang === "tr" ? "Avlu Odası" : "Courtyard Suite", beds: "1 Queen Bed", desc: lang === "tr" ? "Tarihi iç avluya bakan, el dokuması keten döşemeli şık oda." : "Charming room looking into the historic internal courtyard, with hand-woven linens." },
      { name: lang === "tr" ? "Zeytin Kanadı" : "Olive Wing", beds: "2 Twin Beds", desc: lang === "tr" ? "Bahçe manzaralı, yan yana iki tek yataklı geniş oda." : "Spacious room with two side-by-side twin beds, overlooking the garden." }
    ],
    s2: [
      { name: lang === "tr" ? "Göl Manzaralı Grand Süit" : "Grand Lake Suite", beds: "1 King Bed", desc: lang === "tr" ? "Nefes kesici Como Gölü manzarasına, büyük bir terasa ve mermer şömineye sahip süit." : "Breathtaking Lake Como views, massive private terrace, and marble fireplace suite." },
      { name: lang === "tr" ? "Vista Yatak Odası" : "Vista Bedroom", beds: "1 King Bed", desc: lang === "tr" ? "Göl manzaralı özel balkon ve İtalyan mermer banyoya sahip geniş oda." : "Spacious bedroom with lakefront private balcony and Italian marble bath." },
      { name: lang === "tr" ? "Kütüphane Kanadı" : "Library Wing", beds: "1 Queen Bed", desc: lang === "tr" ? "Konağın kütüphanesine doğrudan erişimi olan, sessiz ve huzurlu süit." : "Quiet, historic suite with direct access to the mansion's private library." }
    ],
    default: [
      { name: lang === "tr" ? "Panoramik Süit" : "Panoramic Suite", beds: "1 King Bed", desc: lang === "tr" ? "Nefes kesici manzaraya sahip en üst kat süiti." : "Top floor suite with breathtaking panoramic views." },
      { name: lang === "tr" ? "Küratör Odası" : "Curator Room", beds: "1 Queen Bed", desc: lang === "tr" ? "Yerel sanatçıların eserleriyle bezenmiş şık konaklama." : "Charming room styled with art pieces from local creators." }
    ]
  };
  return rooms[id] || rooms.default;
}

function getSpecsForCar(item, lang) {
  return [
    { label: lang === "tr" ? "Model Yılı" : "Model Year", value: item.year || 2024 },
    { label: lang === "tr" ? "Sınıf" : "Class", value: item.type || "Sports" },
    { label: lang === "tr" ? "Motor / Güç" : "Engine / Power", value: item.spec || "V8 · 612 hp" },
    { label: lang === "tr" ? "Konum" : "Location", value: item.loc },
    { label: lang === "tr" ? "Sigorta" : "Insurance", value: lang === "tr" ? "Kasko Dahil" : "Full Cover Included" },
    { label: lang === "tr" ? "Şoför Seçeneği" : "Chauffeur", value: lang === "tr" ? "Mevcut (Ekstra)" : "Available (Optional)" }
  ];
}

function getSpecsForYacht(item, lang) {
  return [
    { label: lang === "tr" ? "Yapım Yılı" : "Year Built", value: item.year || 2023 },
    { label: lang === "tr" ? "Uzunluk" : "Length", value: `${item.length} m (${Math.round(item.length * 3.28)} ft)` },
    { label: lang === "tr" ? "Kabin Sayısı" : "Cabins", value: item.cabins || 5 },
    { label: lang === "tr" ? "Mürettebat" : "Crew", value: lang === "tr" ? "Kaptan + 3 Mürettebat" : "Captain + 3 Crew" },
    { label: lang === "tr" ? "Yat Tipi" : "Yacht Type", value: item.type },
    { label: lang === "tr" ? "Olanaklar" : "Water Toys", value: lang === "tr" ? "Tender, Jet-ski, Paddleboard" : "Tender, Jet-ski, Paddleboards" }
  ];
}

function getRatingsBreakdown(category, lang) {
  if (category === "drive") {
    return [
      { label: lang === "tr" ? "Araç Durumu" : "Vehicle Condition", score: 4.9 },
      { label: lang === "tr" ? "Temizlik" : "Cleanliness", score: 4.9 },
      { label: lang === "tr" ? "Teslimat Hızı" : "Delivery Promptness", score: 4.8 },
      { label: lang === "tr" ? "İletişim" : "Communication", score: 4.9 },
      { label: lang === "tr" ? "Fiyat/Performans" : "Value", score: 4.7 }
    ];
  } else if (category === "sail") {
    return [
      { label: lang === "tr" ? "Yat Kondisyonu" : "Yacht Condition", score: 4.9 },
      { label: lang === "tr" ? "Mürettebat Hizmeti" : "Crew Service", score: 5.0 },
      { label: lang === "tr" ? "Temizlik" : "Cleanliness", score: 4.9 },
      { label: lang === "tr" ? "Rota Çeşitliliği" : "Route Options", score: 4.9 },
      { label: lang === "tr" ? "Yemekler & İkramlar" : "Food & Beverage", score: 4.8 }
    ];
  } else {
    return [
      { label: lang === "tr" ? "Temizlik" : "Cleanliness", score: 4.9 },
      { label: lang === "tr" ? "Doğruluk" : "Accuracy", score: 4.9 },
      { label: lang === "tr" ? "İletişim" : "Communication", score: 4.9 },
      { label: lang === "tr" ? "Konum" : "Location", score: 4.9 },
      { label: lang === "tr" ? "Fiyat/Performans" : "Value", score: 4.8 }
    ];
  }
}

function getMockReviews(category, lang) {
  return [
    {
      author: "Charlotte M.",
      date: lang === "tr" ? "Haziran 2025" : "June 2025",
      avatar: "C",
      comment: lang === "tr"
        ? "Tam anlamıyla kusursuz bir deneyim. Her detay odaya yerleştirilen el dokuması nevresimlerden bahçedeki zeytinlik kokusuna kadar özenle düşünülmüş."
        : "An absolute dream. Every single detail, from the hand-woven linens in the room to the scent of the olive grove in the garden, was curated with care."
    },
    {
      author: "Maximilian K.",
      date: lang === "tr" ? "Nisan 2025" : "April 2025",
      avatar: "M",
      comment: lang === "tr"
        ? "Olağanüstü hizmet kalitesi. Concierge ekibi her an yanımızdaydı. Kesinlikle tekrar geleceğiz."
        : "Outstanding service. The concierge team went above and beyond to make our stay comfortable. Will definitely return."
    }
  ];
}

function getTodayISO(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function DetailScreen({ t, lang, category, id, go }) {
  const dataByCat = { stay: window.STAYS, drive: window.CARS, sail: window.YACHTS };
  const item = dataByCat[category].find(i => i.id === id) || dataByCat[category][0];
  const [tab, setTab] = React.useState("overview");

  // Otelz API data
  const [hotelDetails, setHotelDetails] = React.useState(null);
  const [hotelRates, setHotelRates] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  // Booking details state
  const [checkIn, setCheckIn] = React.useState("");
  const [checkOut, setCheckOut] = React.useState("");
  const [guests, setGuests] = React.useState(2);

  // Fetch hotel details & rates from Otelz
  React.useEffect(() => {
    if (category !== "stay" || !item.rawId) return;

    setLoading(true);
    const ctrl = new AbortController();

    // Get hotel details
    if (window.otelz?.getHotelDetails) {
      window.otelz.getHotelDetails({ hotelId: item.rawId, signal: ctrl.signal })
        .then(details => {
          if (details) setHotelDetails(details);
          setLoading(false);
        })
        .catch(err => {
          console.warn('[LUXN] Hotel details error:', err.message);
          setLoading(false);
        });
    }

    return () => ctrl.abort();
  }, [category, item.rawId]);

  // Fetch rates when dates are set
  React.useEffect(() => {
    if (category !== "stay" || !item.rawId || !checkIn || !checkOut) return;

    const ctrl = new AbortController();

    if (window.otelz?.getHotelRates) {
      window.otelz.getHotelRates({
        hotelId: item.rawId,
        checkIn,
        checkOut,
        guests,
        rooms: 1,
        signal: ctrl.signal
      })
        .then(rates => {
          if (rates) setHotelRates(rates);
        })
        .catch(err => {
          console.warn('[LUXN] Hotel rates error:', err.message);
        });
    }

    return () => ctrl.abort();
  }, [category, item.rawId, checkIn, checkOut, guests]);

  React.useEffect(() => {
    if (window.addRecentlyViewed) {
      window.addRecentlyViewed(category, item.id);
    }
  }, [category, item.id]);

  const nights = React.useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diffTime = d2 - d1;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [checkIn, checkOut]);

  const subtotal = item.price * nights;
  const fee = Math.round(subtotal * 0.04);
  const total = subtotal + fee;

  // Persist selections to localStorage for the booking screen
  React.useEffect(() => {
    localStorage.setItem("luxn.active_booking", JSON.stringify({
      checkIn,
      checkOut,
      guests,
      nights,
      subtotal,
      fee,
      total
    }));
  }, [checkIn, checkOut, guests, nights, subtotal, fee, total]);

  // Map view initialization
  React.useEffect(() => {
    if (tab === "location" && item.lat && item.lng) {
      const timer = setTimeout(() => {
        const mapEl = document.getElementById("detail-map");
        if (!mapEl) return;
        if (mapEl._leaflet_id) return; // Prevent double init
        
        const map = L.map("detail-map", {
          center: [item.lat, item.lng],
          zoom: 13,
          zoomControl: false
        });
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        
        L.circleMarker([item.lat, item.lng], {
          color: 'var(--accent)',
          fillColor: 'var(--accent)',
          fillOpacity: 0.2,
          radius: 20,
          weight: 2
        }).addTo(map);
        
        L.marker([item.lat, item.lng]).addTo(map);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [tab, item.lat, item.lng]);

  const desc = {
    stay: lang === "tr"
      ? [
          `${item.name}, ${item.loc.split(",")[0]} kıyısında yalnızca ${item.rooms} anahtarlı bir adres. Mimar ve ev sahibi, mevsime göre değişen sessiz bir tören kuruyor: sabah café, öğleden sonra havuz, akşam üzeri kütüphane, gece şarap mahzeni.`,
          "İçeride, beyazlatılmış meşe parke, el dokuması keten ve yerel sanatçılardan tek parça eserler. Dışarıda, bahçıvanın 14 yıldır birlikte çalıştığı 200 yıllık zeytinlik.",
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
    { id: category === "stay" ? "rooms" : category === "drive" ? "specs" : "cabins", lbl: category === "stay" ? t.detail.rooms : category === "drive" ? (lang === "tr" ? "Özellikler" : "Specs") : (lang === "tr" ? "Kabinler" : "Cabins") },
    { id: "amenities", lbl: t.detail.amenities },
    { id: "location", lbl: t.detail.location },
    { id: "reviews", lbl: t.detail.reviews },
  ];

  const perLabel = category === "sail" ? t.results.per_week : category === "drive" ? t.results.per_day : t.results.per_night;

  return (
    <main className="detail-screen-wrapper">
      <section className="container detail-hero">
        <div className="breadcrumb">
          <button onClick={() => go({ screen: "home" })}>Luxn</button>
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
            <span className="rating-val">{item.rating.toFixed(2)}</span>
            <span className="dot-sep">·</span>
            <span className="review-count">{Math.round(item.rating * 47)} {lang === "tr" ? "yorum" : "reviews"}</span>
          </div>
        </div>

        <div className="detail-gallery-new">
          <div className="gallery-main">
            <SmartImage src={window.imageFor(item, category)} alt={item.name} tone={item.tone} label={`${item.name.toUpperCase()} · 01`} />
          </div>
          <div className="gallery-sides">
            <div className="side-img"><SmartImage src={window.imageFor(item, category)} tone={(item.tone % 7) + 1} label="02" /></div>
            <div className="side-img"><SmartImage src={window.imageFor(item, category)} tone={((item.tone + 2) % 7) + 1} label="03" /></div>
            <div className="side-img"><SmartImage src={window.imageFor(item, category)} tone={((item.tone + 3) % 7) + 1} label="04" /></div>
            <div className="side-img"><SmartImage src={window.imageFor(item, category)} tone={((item.tone + 4) % 7) + 1} label="05" /></div>
          </div>
        </div>
      </section>

      <section className="container detail-body-new">
        <div className="detail-content-area">
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

          <div className="tab-panels">
            {tab === "overview" && (
              <div className="tab-panel fade-in">
                <div className="detail-section">
                  <h3 className="section-title mono">{t.detail.overview.toUpperCase()}</h3>
                  {desc[category].map((p, i) => <p key={i} className="detail-desc-paragraph">{p}</p>)}
                </div>

                <blockquote className="curator-quote">
                  <span className="quote-mark">“</span>
                  <p>{category === "stay"
                    ? (lang === "tr" ? "Yavaşlık zarafettir. Zamanın durduğu, doğayla ve mimariyle baş başa kalacağınız sakin bir sığınak." : "Deceleration is elegance. A quiet sanctuary where time stands still, allowing you to connect with nature and design.")
                    : category === "drive"
                    ? (lang === "tr" ? "Performans ve lüksün uyumu. Yolculuğun kendisini bir sanata dönüştüren eşsiz bir sürüş deneyimi." : "A harmony of performance and luxury. A driving experience that turns the journey itself into art.")
                    : (lang === "tr" ? "Denizin üzerinde sessiz bir lüks. Rüzgarın sesinden başka hiçbir şeyin sizi rahatsız etmeyeceği özel bir seyir." : "Quiet luxury on the water. A private voyage where nothing but the sound of the wind will disturb you.")}</p>
                </blockquote>

                <div className="detail-section">
                  <h3 className="section-title mono">{t.detail.hosted_by.toUpperCase()}</h3>
                  <div className="detail-host-card">
                    <div className="host-avatar-large">{item.name.charAt(0)}</div>
                    <div className="host-info">
                      <div className="name">{
                        category === "stay" ? "Élise & Marc"
                        : category === "drive" ? "Auto Curatore"
                        : "Aegean Charters"
                      }</div>
                      <div className="since">{t.detail.hosted_by} · {t.detail.since} 2019</div>
                      <div className="host-badges">
                        <span className="badge">★ Superhost</span>
                        <span className="badge">● {lang === "tr" ? "Hızlı Yanıt Verir" : "Quick Responder"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3 className="section-title mono">{t.detail.policies.toUpperCase()}</h3>
                  <p className="policy-text">
                    {lang === "tr"
                      ? `${t.detail.check_in} 16:00 · ${t.detail.check_out} 11:00. Esnek iptal: girişten 14 gün öncesine kadar tam iade.`
                      : `${t.detail.check_in} 4 pm · ${t.detail.check_out} 11 am. Flexible cancellation: full refund up to 14 days before arrival.`}
                  </p>
                </div>
              </div>
            )}

            {tab === (category === "stay" ? "rooms" : category === "drive" ? "specs" : "cabins") && (
              <div className="tab-panel fade-in">
                {category === "stay" ? (
                  <div className="detail-section">
                    <h3 className="section-title mono">{t.detail.rooms.toUpperCase()}</h3>
                    <div className="rooms-list-grid">
                      {getRoomsForStay(item.id, lang).map((r, idx) => (
                        <div key={idx} className="room-config-card">
                          <div className="room-header">
                            <span className="room-name">{r.name}</span>
                            <span className="room-beds mono">{r.beds}</span>
                          </div>
                          <p className="room-desc">{r.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : category === "drive" ? (
                  <div className="detail-section">
                    <h3 className="section-title mono">SPECIFICATIONS</h3>
                    <div className="specs-table-grid">
                      {getSpecsForCar(item, lang).map((s, idx) => (
                        <div key={idx} className="spec-table-row">
                          <span className="spec-label">{s.label}</span>
                          <span className="spec-value mono">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="detail-section">
                    <h3 className="section-title mono">CABIN DETAILS</h3>
                    <div className="specs-table-grid">
                      {getSpecsForYacht(item, lang).map((s, idx) => (
                        <div key={idx} className="spec-table-row">
                          <span className="spec-label">{s.label}</span>
                          <span className="spec-value mono">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "amenities" && (
              <div className="tab-panel fade-in">
                <div className="detail-section">
                  <h3 className="section-title mono">{t.detail.amenities.toUpperCase()}</h3>
                  <div className="amenities-categories-grid">
                    <div className="amen-category-block">
                      <h4 className="mono">{lang === "tr" ? "Konfor ve Olanaklar" : "Comfort & Conveniences"}</h4>
                      <ul className="amen-bullet-list">
                        {window.getItemAmenities(item.id, category).map(a => (
                          <li key={a}>{a}</li>
                        ))}
                        <li>High-speed Wi-Fi</li>
                        <li>Climate Control</li>
                      </ul>
                    </div>
                    <div className="amen-category-block">
                      <h4 className="mono">{lang === "tr" ? "Hizmet ve Ayrıcalıklar" : "Services & Exclusives"}</h4>
                      <ul className="amen-bullet-list">
                        <li>24/7 Concierge Support</li>
                        <li>Daily Housekeeping</li>
                        {category === "sail" && <li>Private Chef</li>}
                        {category === "drive" && <li>Airport Delivery</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "location" && (
              <div className="tab-panel fade-in">
                <div className="detail-section">
                  <h3 className="section-title mono">{t.detail.location.toUpperCase()}</h3>
                  <div className="location-info-bar">
                    <span className="loc-icon">📍</span>
                    <span>{item.loc}</span>
                  </div>
                  <div id="detail-map" style={{ height: "400px", borderRadius: "var(--radius-lg)", overflow: "hidden", marginTop: "20px", border: "1px solid var(--line)" }}></div>
                </div>
              </div>
            )}

            {tab === "reviews" && (
              <div className="tab-panel fade-in">
                <div className="detail-section">
                  <h3 className="section-title mono">{t.detail.reviews.toUpperCase()}</h3>
                  
                  <div className="reviews-summary-dashboard">
                    <div className="overall-score-panel">
                      <span className="score-number">{item.rating.toFixed(2)}</span>
                      <span className="score-stars">★★★★★</span>
                      <span className="reviews-total">{Math.round(item.rating * 47)} {lang === "tr" ? "yorum" : "reviews"}</span>
                    </div>
                    <div className="ratings-breakdown-panel">
                      {getRatingsBreakdown(category, lang).map((r, idx) => (
                        <div key={idx} className="breakdown-bar-row">
                          <span className="breakdown-label">{r.label}</span>
                          <div className="breakdown-track">
                            <div className="breakdown-fill" style={{ width: `${(r.score / 5) * 100}%` }}></div>
                          </div>
                          <span className="breakdown-val mono">{r.score.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="comments-list-section">
                    {getMockReviews(category, lang).map((rev, idx) => (
                      <div key={idx} className="guest-comment-card">
                        <div className="comment-header">
                          <div className="guest-avatar-mini">{rev.avatar}</div>
                          <div className="guest-meta">
                            <span className="guest-name">{rev.author}</span>
                            <span className="comment-date mono">{rev.date}</span>
                          </div>
                        </div>
                        <p className="guest-text">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="sticky-booking-aside">
          <div className="booking-card-inner">
            <div className="aside-price-header">
              <span className="price-val">{window.formatPrice ? window.formatPrice(item.price, item.currency) : `${item.currency}${item.price.toLocaleString()}`}</span>
              <span className="price-lbl">{perLabel}</span>
            </div>
            
            <div className="aside-rating-line">
              <span className="star">★</span>
              <span className="val">{item.rating.toFixed(2)}</span>
              <span className="dot-sep">·</span>
              <span className="lbl">{Math.round(item.rating * 47)} {lang === "tr" ? "yorum" : "reviews"}</span>
            </div>

            <div className="interactive-booking-fields">
              <div className="date-field">
                <label className="field-lbl mono">{t.detail.check_in.toUpperCase()}</label>
                <input
                  type="date"
                  className="interactive-date-input"
                  value={checkIn}
                  min={getTodayISO(0)}
                  onChange={(e) => {
                    setCheckIn(e.target.value);
                    if (e.target.value >= checkOut) {
                      const d = new Date(e.target.value);
                      d.setDate(d.getDate() + 7);
                      setCheckOut(d.toISOString().slice(0, 10));
                    }
                  }}
                />
              </div>
              <div className="date-field">
                <label className="field-lbl mono">{t.detail.check_out.toUpperCase()}</label>
                <input
                  type="date"
                  className="interactive-date-input"
                  value={checkOut}
                  min={checkIn}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
              <div className="guest-field">
                <label className="field-lbl mono">{t.search.guests.toUpperCase()}</label>
                <select
                  className="interactive-select-input"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                >
                  <option value="1">1 {lang === "tr" ? "Misafir" : "Guest"}</option>
                  <option value="2">2 {lang === "tr" ? "Misafir" : "Guests"}</option>
                  <option value="3">3 {lang === "tr" ? "Misafir" : "Guests"}</option>
                  <option value="4">4 {lang === "tr" ? "Misafir" : "Guests"}</option>
                  <option value="6">6 {lang === "tr" ? "Misafir" : "Guests"}</option>
                </select>
              </div>
            </div>

            <button
              className="btn btn-accent btn-block aside-book-btn"
              disabled={!checkIn || !checkOut}
              onClick={() => go({ screen: "booking", category, id: item.id })}
            >
              {t.detail.book}
            </button>
            <button className="btn btn-ghost btn-block aside-contact-btn" style={{ marginTop: 12 }} onClick={() => go({ screen: "concierge" })}>
              {t.detail.contact}
            </button>

            {nights > 0 ? (
              <div className="aside-price-summary-breakdown">
                <div className="summary-row">
                  <span>{window.formatPrice ? window.formatPrice(item.price, item.currency) : `${item.currency}${item.price.toLocaleString()}`} × {nights} {category === "sail" ? (lang === "tr" ? "hafta" : "weeks") : category === "drive" ? (lang === "tr" ? "gün" : "days") : (lang === "tr" ? "gece" : "nights")}</span>
                  <span className="mono">{window.formatPrice ? window.formatPrice(subtotal, item.currency) : `${item.currency}${subtotal.toLocaleString()}`}</span>
                </div>
                <div className="summary-row">
                  <span>{lang === "tr" ? "Concierge hizmet bedeli" : "Concierge fee"}</span>
                  <span className="mono">{window.formatPrice ? window.formatPrice(fee, item.currency) : `${item.currency}${fee.toLocaleString()}`}</span>
                </div>
                <div className="summary-row total-row">
                  <span>{t.detail.total}</span>
                  <span className="total-amount mono">{window.formatPrice ? window.formatPrice(total, item.currency) : `${item.currency}${total.toLocaleString()}`}</span>
                </div>
                <div className="taxes-notice">{t.detail.taxes}</div>
              </div>
            ) : (
              <div className="aside-price-summary-prompt" style={{ marginTop: 24, textAlign: "center", padding: "16px", border: "1px dashed var(--line)", borderRadius: "var(--radius)", color: "var(--ink-3)", fontSize: "13px" }}>
                {lang === "tr" ? "Fiyat detaylarını görmek için tarih seçin" : "Select dates to view pricing breakdown"}
              </div>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}

window.DetailScreen = DetailScreen;
