// LUXN — Journal screen (List + Detail Magazine reading view)

function JournalScreen({ t, lang, go, articleId }) {
  const journals = window.JOURNAL || [];
  const journalDetails = window.JOURNAL_DETAILS || {};

  // If articleId is specified, show the detailed reading page
  if (articleId && journalDetails[articleId]) {
    const article = journals.find(j => j.id === articleId) || journals[0];
    const details = journalDetails[articleId][lang] || journalDetails[articleId].en;
    const related = journalDetails[articleId].related || {};

    const handleBack = () => {
      go({ screen: "journal", id: null });
    };

    // Hydrate related items
    const stays = (related.stay || []).map(sid => (window.STAYS || []).find(s => s.id === sid)).filter(Boolean);
    const cars = (related.drive || []).map(cid => (window.CARS || []).find(c => c.id === cid)).filter(Boolean);
    const yachts = (related.sail || []).map(yid => (window.YACHTS || []).find(y => y.id === yid)).filter(Boolean);

    return (
      <main className="journal-screen">
        <section className="container journal-detail-hero">
          <div className="breadcrumb">
            <button onClick={() => go({ screen: "home" })}>LUXN</button>
            <span className="sep">/</span>
            <button onClick={handleBack}>{t.journal.title}</button>
            <span className="sep">/</span>
            <span className="here">{article.title}</span>
          </div>

          <div className="journal-detail-header">
            <div className="journal-detail-tag mono">{article.cat} · {article.read}</div>
            <h1 className="journal-detail-title display">{article.title}</h1>
            {details.subtitle && <p className="journal-detail-subtitle">{details.subtitle}</p>}
          </div>

          <div className="journal-detail-main-img">
            <window.SmartImage src={window.imageFor(article, "journal")} alt={article.title} tone={article.tone} />
          </div>
        </section>

        <section className="container journal-detail-body">
          <div className="journal-content-flow">
            {details.content.map((p, idx) => (
              <p key={idx} className={idx === 0 ? "lead-paragraph" : ""}>{p}</p>
            ))}
          </div>

          {/* Related Experiences */}
          {(stays.length > 0 || cars.length > 0 || yachts.length > 0) && (
            <div className="journal-related-experiences">
              <h2 className="related-title display">{lang === "tr" ? "Kürasyonlu Öneriler" : "Curated Recommendations"}</h2>
              
              {stays.length > 0 && (
                <div className="related-cat-section">
                  <h3 className="mono">{t.journal.related_stays}</h3>
                  <div className="related-grid">
                    {stays.map(s => (
                      <window.PropertyCard
                        key={s.id}
                        item={s}
                        t={t}
                        category="stay"
                        onClick={() => go({ screen: "detail", category: "stay", id: s.id })}
                      />
                    ))}
                  </div>
                </div>
              )}

              {cars.length > 0 && (
                <div className="related-cat-section">
                  <h3 className="mono">{t.journal.related_drives}</h3>
                  <div className="related-grid">
                    {cars.map(c => (
                      <window.PropertyCard
                        key={c.id}
                        item={c}
                        t={t}
                        category="drive"
                        onClick={() => go({ screen: "detail", category: "drive", id: c.id })}
                      />
                    ))}
                  </div>
                </div>
              )}

              {yachts.length > 0 && (
                <div className="related-cat-section">
                  <h3 className="mono">{t.journal.related_sails}</h3>
                  <div className="related-grid">
                    {yachts.map(y => (
                      <window.PropertyCard
                        key={y.id}
                        item={y}
                        t={t}
                        category="sail"
                        onClick={() => go({ screen: "detail", category: "sail", id: y.id })}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="journal-back-action">
            <button className="btn btn-ghost" onClick={handleBack}>
              ← {t.journal.back}
            </button>
          </div>
        </section>
      </main>
    );
  }

  // Otherwise, show the list of journal articles
  return (
    <main className="journal-screen">
      <section className="journal-head">
        <div className="container">
          <div className="breadcrumb">
            <button onClick={() => go({ screen: "home" })}>LUXN</button>
            <span className="sep">/</span>
            <span className="here">{t.journal.title}</span>
          </div>
          <h1 className="display journal-title">{t.journal.title}</h1>
          <div className="journal-subtitle">{lang === "tr" ? "Editörlerimizden seyahat notları, özel rotalar ve küçük lüksler." : "Travel notes, bespoke routes, and small luxuries from our editors."}</div>
        </div>
      </section>

      <section className="container journal-body">
        <div className="journal-list-grid">
          {journals.map(j => (
            <div key={j.id} className="journal-list-card fade-in" onClick={() => go({ screen: "journal-detail", id: j.id })}>
              <div className="journal-card-img">
                <window.SmartImage src={window.imageFor(j, "journal")} alt={j.title} tone={j.tone} />
                <div className="journal-card-tag mono">{j.cat} · {j.read}</div>
              </div>
              <div className="journal-card-meta">
                <h2 className="journal-card-title display">{j.title}</h2>
                <span className="journal-card-link mono">{t.journal.read_more} →</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

window.JournalScreen = JournalScreen;
