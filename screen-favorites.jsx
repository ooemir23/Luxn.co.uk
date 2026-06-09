// LUXN — Favorites screen

function FavoritesScreen({ t, lang, go }) {
  const { favs, clearFavs, count } = window.useFavorites();
  const grouped = window.resolveFavorites(favs);
  const sections = [
    { key: "stay", items: grouped.stay },
    { key: "drive", items: grouped.drive },
  ].filter(s => s.items.length > 0);

  return (
    <main className="favorites-screen">
      <section className="favorites-head">
        <div className="container">
          <div className="breadcrumb">
            <button onClick={() => go({ screen: "home" })}>Luxn</button>
            <span className="sep">/</span>
            <span className="here">{t.nav.favorites}</span>
          </div>
          <div className="favorites-head-row">
            <div>
              <h1 className="display favorites-title">{t.favs.title}</h1>
              <div className="favorites-sub">{t.favs.subtitle}</div>
            </div>
            {count > 0 ? (
              <div className="favorites-meta">
                <span className="mono">{count} {count === 1 ? t.favs.count_one : t.favs.count_other}</span>
                <button className="btn-link" onClick={clearFavs}>{t.results.clear}</button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="container favorites-body">
        {count === 0 ? (
          <div className="favorites-empty">
            <div className="favorites-empty-icon">
              <svg viewBox="0 0 24 24" width="48" height="48" aria-hidden="true">
                <path d="M12 21s-7.5-4.6-9.5-9.2C1 8.4 3.3 5 6.7 5c2 0 3.6 1 5.3 3 1.7-2 3.3-3 5.3-3 3.4 0 5.7 3.4 4.2 6.8C19.5 16.4 12 21 12 21z"
                  fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="favorites-empty-title display">{t.favs.empty_title}</div>
            <div className="favorites-empty-sub">{t.favs.empty_sub}</div>
            <button className="btn btn-ghost btn-sm" onClick={() => go({ screen: "home" })}>
              {t.favs.explore} →
            </button>
          </div>
        ) : (
          sections.map(section => (
            <div key={section.key} className="favorites-section">
              <div className="favorites-section-head">
                <h2 className="favorites-section-title display">{t.nav[section.key]}</h2>
                <div className="mono favorites-section-count">
                  {section.items.length} {section.items.length === 1 ? t.favs.count_one : t.favs.count_other}
                </div>
              </div>
              <div className="favorites-grid">
                {section.items.map(item => (
                  <window.PropertyCard
                    key={item.id}
                    item={item}
                    t={t}
                    category={section.key}
                    onClick={() => go({ screen: "detail", category: section.key, id: item.id })}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}

window.FavoritesScreen = FavoritesScreen;
