// LUXN — Booking flow (4 steps)
// Submits reservation to Otelz API

function BookingScreen({ t, lang, category, id, go }) {
  const dataByCat = { stay: window.STAYS, drive: window.CARS, sail: window.YACHTS };
  const item = dataByCat[category].find(i => i.id === id) || dataByCat[category][0];
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState({
    first: "", last: "", email: "", phone: "",
    notes: "",
    cardName: "", cardNum: "", exp: "", cvc: "",
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState(null);
  const [confirmCode, setConfirmCode] = React.useState(null);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const perLabel = category === "sail" ? t.results.per_week : category === "drive" ? t.results.per_day : t.results.per_night;

  // Read active booking details from localStorage
  const activeBooking = React.useMemo(() => {
    try {
      const raw = localStorage.getItem("luxn.active_booking");
      return raw ? JSON.parse(raw) : null;
    } catch(e) { return null; }
  }, []);

  const nights = activeBooking ? activeBooking.nights : 7;
  const guests = activeBooking ? activeBooking.guests : 2;
  const checkInISO = activeBooking ? activeBooking.checkIn : null;
  const checkOutISO = activeBooking ? activeBooking.checkOut : null;

  const formatBookingDate = (iso, def) => {
    if (!iso) return def;
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
    } catch(e) { return def; }
  };

  const subtotal = item.price * nights;
  const fee = Math.round(subtotal * 0.04);
  const total = subtotal + fee;

  return (
    <main>
      <section className="container detail-hero">
        <div className="breadcrumb">
          <button onClick={() => go({ screen: "home" })}>Luxn</button>
          <span className="sep">/</span>
          <button onClick={() => go({ screen: "results", category })}>{t.nav[category]}</button>
          <span className="sep">/</span>
          <button onClick={() => go({ screen: "detail", category, id: item.id })}>{item.name}</button>
          <span className="sep">/</span>
          <span className="here">{t.booking.title}</span>
        </div>
        <h1 className="detail-title display">{t.booking.review}</h1>

        <div className="booking-steps" style={{ marginTop: 32 }}>
          {t.booking.steps.map((label, i) => (
            <div key={i} className={`book-step ${i === step ? "active" : i < step ? "done" : ""}`}>
              <span className="step-num">{t.booking.step} {i + 1}{t.booking.of}{t.booking.steps.length}</span>
              <span className="step-label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="container booking-wrap">
        <div>
          {step === 0 ? (
            <div className="fade-in">
              <h2 className="book-step-title">{t.booking.steps[0]}</h2>
              <div className="form-grid">
                <div className="form-row wide">
                  <span className="form-label">{t.search.destination}</span>
                  <input className="text-input" value={item.loc} readOnly />
                </div>
                <div className="form-row">
                  <span className="form-label">{t.detail.check_in}</span>
                  <input className="text-input" defaultValue={formatBookingDate(checkInISO, "")} />
                </div>
                <div className="form-row">
                  <span className="form-label">{t.detail.check_out}</span>
                  <input className="text-input" defaultValue={formatBookingDate(checkOutISO, "")} />
                </div>
                <div className="form-row">
                  <span className="form-label">{t.search.guests}</span>
                  <select className="text-input" defaultValue={guests}>
                    <option value="1">1 {lang === "tr" ? "kişi" : "guest"}</option>
                    <option value="2">2 {lang === "tr" ? "yetişkin" : "adults"}</option>
                    <option value="3">3 {lang === "tr" ? "yetişkin" : "adults"}</option>
                    <option value="4">4 {lang === "tr" ? "yetişkin" : "adults"}</option>
                    <option value="6">6 {lang === "tr" ? "yetişkin" : "adults"}</option>
                  </select>
                </div>
                <div className="form-row">
                  <span className="form-label">{lang === "tr" ? "Tercih" : "Preference"}</span>
                  <select className="text-input" defaultValue="quiet">
                    <option value="quiet">{lang === "tr" ? "Sessiz oda" : "Quiet room"}</option>
                    <option value="view">{lang === "tr" ? "Manzaralı" : "With a view"}</option>
                    <option value="ground">{lang === "tr" ? "Zemin kat" : "Ground floor"}</option>
                  </select>
                </div>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="fade-in">
              <h2 className="book-step-title">{t.booking.guest_info}</h2>
              <div className="form-grid">
                <div className="form-row">
                  <span className="form-label">{t.booking.first}</span>
                  <input className="text-input" value={form.first} onChange={e => set("first", e.target.value)} />
                </div>
                <div className="form-row">
                  <span className="form-label">{t.booking.last}</span>
                  <input className="text-input" value={form.last} onChange={e => set("last", e.target.value)} />
                </div>
                <div className="form-row">
                  <span className="form-label">{t.booking.email}</span>
                  <input type="email" className="text-input" value={form.email} onChange={e => set("email", e.target.value)} />
                </div>
                <div className="form-row">
                  <span className="form-label">{t.booking.phone}</span>
                  <input className="text-input" value={form.phone} onChange={e => set("phone", e.target.value)} />
                </div>
                <div className="form-row wide">
                  <span className="form-label">{t.booking.notes}</span>
                  <textarea
                    className="text-input"
                    placeholder={t.booking.notes_ph}
                    value={form.notes}
                    onChange={e => set("notes", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="fade-in">
              <h2 className="book-step-title">{t.booking.payment}</h2>
              <div className="form-grid">
                <div className="form-row wide">
                  <span className="form-label">{t.booking.card_name}</span>
                  <input className="text-input" value={form.cardName} onChange={e => set("cardName", e.target.value)} />
                </div>
                <div className="form-row wide">
                  <span className="form-label">{t.booking.card_num}</span>
                  <input
                    className="text-input mono"
                    placeholder="•••• •••• •••• ••••"
                    value={form.cardNum}
                    onChange={e => set("cardNum", e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <span className="form-label">{t.booking.exp}</span>
                  <input className="text-input mono" placeholder="MM / YY" value={form.exp} onChange={e => set("exp", e.target.value)} />
                </div>
                <div className="form-row">
                  <span className="form-label">{t.booking.cvc}</span>
                  <input className="text-input mono" placeholder="•••" value={form.cvc} onChange={e => set("cvc", e.target.value)} />
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="fade-in confirm-wrap">
              <div className="confirm-mark">✓</div>
              <h2 className="confirm-title">{t.booking.confirmed_title}</h2>
              <p className="confirm-sub">{t.booking.confirmed_sub}</p>
              {confirmCode && (
                <div className="confirm-code">
                  <span className="label">{t.booking.confirmation}</span>
                  {confirmCode}
                </div>
              )}
              {errorMsg && (
                <div style={{ marginTop: 20, padding: 16, background: "var(--error-bg, #fee)", borderRadius: "var(--radius)", color: "var(--error, #c00)", fontSize: 14 }}>
                  {errorMsg}
                </div>
              )}
              <div style={{ marginTop: 40 }}>
                <button className="btn" onClick={() => go({ screen: "home" })}>{t.booking.done}</button>
              </div>
            </div>
          ) : null}

          {step < 3 ? (
            <div className="book-actions">
              {step > 0 ? (
                <button className="btn-link" onClick={() => setStep(step - 1)}>← {t.booking.back}</button>
              ) : (
                <button className="btn-link" onClick={() => go({ screen: "detail", category, id })}>← {t.booking.back}</button>
              )}
              <button
                className="btn btn-accent"
                disabled={submitting}
                onClick={async () => {
                  if (step === 2) {
                    // Validate required fields
                    if (!form.email) {
                      setErrorMsg(lang === "tr" ? "E-posta adresi gerekli" : "Email is required");
                      return;
                    }
                    if (!form.first || !form.last) {
                      setErrorMsg(lang === "tr" ? "Ad ve soyad gerekli" : "First and last name are required");
                      return;
                    }

                    setSubmitting(true);
                    setErrorMsg(null);

                    try {
                      // Call Otelz API
                      const response = await window.otelz?.createReservation({
                        hotelId: item.rawId || item.id,
                        roomTypeId: "standard",
                        guestInfo: {
                          firstName: form.first,
                          lastName: form.last,
                          email: form.email,
                          phone: form.phone,
                          notes: form.notes
                        },
                        checkIn: checkInISO,
                        checkOut: checkOutISO,
                        guests,
                        totalPrice: total,
                        currency: item.currency || "EUR"
                      });

                      if (response?.confirmationCode) {
                        setConfirmCode(response.confirmationCode);

                        // Also save to localStorage for backup
                        const currentBookings = [];
                        try {
                          const raw = localStorage.getItem("luxn.bookings.v1");
                          if (raw) currentBookings.push(...JSON.parse(raw));
                        } catch (e) {}

                        const newBooking = {
                          code: response.confirmationCode,
                          item: { id: item.id, name: item.name, loc: item.loc, price: item.price, currency: item.currency, tone: item.tone },
                          category,
                          dates: `${formatBookingDate(checkInISO, "-")} – ${formatBookingDate(checkOutISO, "-")}`,
                          total,
                          reservationId: response.reservationId,
                          createdAt: new Date(response.createdAt || Date.now()).getTime()
                        };

                        currentBookings.unshift(newBooking);
                        localStorage.setItem("luxn.bookings.v1", JSON.stringify(currentBookings));
                      } else {
                        throw new Error(lang === "tr" ? "Onay kodu alınamadı" : "No confirmation code received");
                      }

                      setStep(step + 1);
                    } catch (err) {
                      const msg = err.message || (lang === "tr" ? "Rezervasyon başarısız oldu" : "Reservation failed");
                      setErrorMsg(msg);
                      console.error('[LUXN booking] Error:', err);
                    } finally {
                      setSubmitting(false);
                    }
                  } else {
                    setStep(step + 1);
                  }
                }}
              >
                {submitting ? "..." : (step === 2 ? t.booking.confirm : t.booking.continue)} →
              </button>
            </div>
          ) : null}
        </div>

        {step < 3 ? (
          <aside className="book-card">
            <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid var(--line)" }}>
              <div className="placeholder-img" style={{ aspectRatio: "5/3", borderRadius: "var(--radius)", overflow: "hidden", position: "relative" }}>
                <SmartImage src={window.imageFor(item, category)} alt={item.name} tone={item.tone} label={item.name.toUpperCase()} />
              </div>
              <div style={{ marginTop: 16 }}>
                <div className="card-loc" style={{ marginBottom: 4 }}>{item.loc}</div>
                <div className="card-title">{item.name}</div>
              </div>
            </div>

            <div className="book-row">
              <span>{window.formatPrice ? window.formatPrice(item.price, item.currency) : `${item.currency}${item.price.toLocaleString()}`} × {nights} {category === "sail" ? (lang === "tr" ? "hafta" : "weeks") : category === "drive" ? (lang === "tr" ? "gün" : "days") : (lang === "tr" ? "gece" : "nights")}</span>
              <span>{window.formatPrice ? window.formatPrice(subtotal, item.currency) : `${item.currency}${subtotal.toLocaleString()}`}</span>
            </div>
            <div className="book-row">
              <span>{lang === "tr" ? "Concierge ücreti" : "Concierge fee"}</span>
              <span>{window.formatPrice ? window.formatPrice(fee, item.currency) : `${item.currency}${fee.toLocaleString()}`}</span>
            </div>
            <div className="book-row total">
              <span>{t.detail.total}</span>
              <span className="price">{window.formatPrice ? window.formatPrice(total, item.currency) : `${item.currency}${total.toLocaleString()}`}</span>
            </div>
            <div className="book-taxes">{t.detail.taxes}</div>
          </aside>
        ) : null}
      </section>
    </main>
  );
}

window.BookingScreen = BookingScreen;
