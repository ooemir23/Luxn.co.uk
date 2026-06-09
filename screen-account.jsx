// LUXN — Account screen (Profile + Confirmed Bookings list)

const BOOKINGS_KEY = "luxn.bookings.v1";

function readBookings() {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

function AccountScreen({ t, lang, go }) {
  const { session, signOut } = window.useSession();
  const bookings = React.useMemo(() => readBookings(), []);

  // If not logged in, redirect home or prompt sign-in
  React.useEffect(() => {
    if (!session) {
      go({ screen: "home" });
      window.dispatchEvent(new CustomEvent("luxn:require-signin"));
    }
  }, [session, go]);

  if (!session) return null;

  const handleSignOut = () => {
    signOut();
    go({ screen: "home" });
  };

  return (
    <main className="account-screen">
      <section className="account-head">
        <div className="container">
          <div className="breadcrumb">
            <button onClick={() => go({ screen: "home" })}>Luxn</button>
            <span className="sep">/</span>
            <span className="here">{t.account.title}</span>
          </div>

          <div className="account-profile-header">
            <div className="account-avatar-large">{session.initials}</div>
            <div className="account-profile-info">
              <h1 className="display account-name">{session.name}</h1>
              <div className="account-email mono">{session.email}</div>
              <div className="account-tier-tag mono">{t.account.member_tier}</div>
            </div>
            <button className="btn btn-ghost btn-sm account-signout-btn" onClick={handleSignOut}>
              {t.auth.sign_out}
            </button>
          </div>
        </div>
      </section>

      <section className="container account-body-grid">
        {/* Left Side: Booking History */}
        <div className="account-trips-section">
          <h2 className="display section-heading">{t.account.trips}</h2>
          
          {bookings.length === 0 ? (
            <div className="account-trips-empty">
              <p>{t.account.no_trips}</p>
              <button className="btn btn-ghost btn-sm" onClick={() => go({ screen: "home" })}>
                {lang === "tr" ? "Keşfetmeye Başla" : "Start Exploring"} →
              </button>
            </div>
          ) : (
            <div className="account-trips-list">
              {bookings.map(b => {
                const itemImg = window.imageFor(b.item, b.category);
                const itemLabel = b.category === "sail" ? t.results.per_week : b.category === "drive" ? t.results.per_day : t.results.per_night;
                return (
                  <div key={b.code} className="account-trip-card">
                    <div className="trip-img" onClick={() => go({ screen: "detail", category: b.category, id: b.item.id })}>
                      <window.SmartImage src={itemImg} alt={b.item.name} tone={b.item.tone} />
                    </div>
                    
                    <div className="trip-details">
                      <div className="trip-meta-row">
                        <span className="trip-cat mono">{t.nav[b.category]}</span>
                        <span className="trip-code mono">{t.account.trip_code} {b.code}</span>
                      </div>
                      
                      <h3 className="trip-title display" onClick={() => go({ screen: "detail", category: b.category, id: b.item.id })}>
                        {b.item.name}
                      </h3>
                      <p className="trip-loc">{b.item.loc}</p>
                      
                      <div className="trip-info-table">
                        <div className="info-cell">
                          <span className="lbl mono">{t.account.dates}</span>
                          <span className="val">{b.dates}</span>
                        </div>
                        <div className="info-cell">
                          <span className="lbl mono">{t.account.total_price}</span>
                          <span className="val amount mono">
                            {b.item.currency}{b.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Account Info */}
        <aside className="account-details-sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-title mono">{t.account.settings}</h3>
            
            <div className="sidebar-info-row">
              <span className="lbl mono">{t.auth.name}</span>
              <span className="val">{session.name}</span>
            </div>
            
            <div className="sidebar-info-row">
              <span className="lbl mono">{t.auth.email}</span>
              <span className="val mono">{session.email}</span>
            </div>
            
            <div className="sidebar-info-row">
              <span className="lbl mono">{t.account.joined}</span>
              <span className="val">
                {new Date(session.signedInAt || Date.now()).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-GB", {
                  year: "numeric", month: "long"
                })}
              </span>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

window.AccountScreen = AccountScreen;
window.readBookings = readBookings;
