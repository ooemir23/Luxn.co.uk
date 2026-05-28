// LUXN — main app: routing, theme, language, tweaks panel

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": false,
  "lang": "en",
  "radius": 10,
  "currency": "EUR"
}/*EDITMODE-END*/;

function routeToHash(r) {
  if (r.screen === "home" || !r.screen) return "#/";
  if (r.screen === "results") {
    if (r.searchParams) {
      const p = { ...r.searchParams };
      const params = new URLSearchParams();
      Object.keys(p).forEach(k => {
        if (p[k] !== undefined && p[k] !== null) {
          if (typeof p[k] === "object") {
            params.append(k, JSON.stringify(p[k]));
          } else {
            params.append(k, p[k]);
          }
        }
      });
      return `#/results/${r.category}?${params.toString()}`;
    }
    return `#/results/${r.category}`;
  }
  if (r.screen === "detail") return `#/detail/${r.category}/${r.id}`;
  if (r.screen === "booking") return `#/booking/${r.category}/${r.id}`;
  if (r.screen === "favorites") return "#/favorites";
  if (r.screen === "journal") return "#/journal";
  if (r.screen === "journal-detail") return `#/journal/${r.id}`;
  if (r.screen === "concierge") return "#/concierge";
  if (r.screen === "account") return "#/account";
  return "#/";
}

function hashToRoute(hash) {
  if (!hash || hash === "#" || hash === "#/") {
    return { screen: "home", category: "stay", id: null };
  }
  const parts = hash.split("?")[0].slice(2).split("/");
  const screen = parts[0];
  const category = parts[1] || "stay";
  const id = parts[2] || null;

  let searchParams = null;
  if (screen === "results" && hash.includes("?")) {
    const qStr = hash.split("?")[1];
    const searchObj = {};
    new URLSearchParams(qStr).forEach((val, key) => {
      if (key === "adults" || key === "rooms") {
        searchObj[key] = Number(val);
      } else if (key === "dest") {
        try {
          searchObj[key] = JSON.parse(val);
        } catch(e) {
          searchObj[key] = val;
        }
      } else {
        searchObj[key] = val;
      }
    });
    searchParams = searchObj;
  }

  if (screen === "journal" && category !== "stay" && category !== "drive" && category !== "sail") {
    return { screen: "journal-detail", category: "stay", id: category };
  }

  return { screen, category, id, searchParams };
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = React.useState(() => hashToRoute(window.location.hash));
  const [category, setCategoryLocal] = React.useState(() => {
    const initialRoute = hashToRoute(window.location.hash);
    return initialRoute.category || "stay";
  });
  const [signInOpen, setSignInOpen] = React.useState(false);

  const lang = t.lang;
  const strings = window.I18N[lang] || window.I18N.en;

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", t.dark ? "dark" : "light");
  }, [t.dark]);

  React.useEffect(() => {
    document.documentElement.style.setProperty("--radius", `${t.radius}px`);
    document.documentElement.style.setProperty("--radius-lg", `${t.radius * 2}px`);
  }, [t.radius]);

  React.useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  React.useEffect(() => {
    localStorage.setItem("luxn.tweaks.currency", t.currency || "EUR");
  }, [t.currency]);

  React.useEffect(() => {
    const handleHashChange = () => {
      const r = hashToRoute(window.location.hash);
      setRoute(r);
      if (r.category) setCategoryLocal(r.category);
    };
    window.addEventListener("hashchange", handleHashChange);
    // Initial sync
    if (window.location.hash && window.location.hash !== "#/") {
      handleHashChange();
    }
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  React.useEffect(() => {
    const h = () => setSignInOpen(true);
    window.addEventListener("luxn:require-signin", h);
    return () => window.removeEventListener("luxn:require-signin", h);
  }, []);

  const go = (r) => {
    const target = { ...route, ...r };
    if (r.screen && r.screen !== route.screen) {
      target.id = r.id || null;
      target.category = r.category || "stay";
      target.searchParams = r.searchParams || null;
    }
    const nextHash = routeToHash(target);
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  const goSearch = (params) => {
    go({ screen: "results", category: params.category || category, searchParams: params });
  };

  // Active nav category by route
  const activeNav = route.screen === "results" || route.screen === "detail" || route.screen === "booking"
    ? route.category
    : route.screen === "favorites" ? "favorites" : null;

  let body;
  if (route.screen === "home" || !route.screen) {
    body = <HomeScreen t={strings} lang={lang} category={category} setCategory={setCategoryLocal} go={go} />;
  } else if (route.screen === "results") {
    body = <ResultsScreen t={strings} lang={lang} category={route.category} searchParams={route.searchParams} setCategory={(c) => go({ screen: "results", category: c })} go={go} />;
  } else if (route.screen === "detail") {
    body = <DetailScreen t={strings} lang={lang} category={route.category} id={route.id} go={go} />;
  } else if (route.screen === "booking") {
    body = <BookingScreen t={strings} lang={lang} category={route.category} id={route.id} go={go} />;
  } else if (route.screen === "favorites") {
    body = <FavoritesScreen t={strings} lang={lang} go={go} />;
  } else if (route.screen === "journal") {
    body = <window.JournalScreen t={strings} lang={lang} go={go} />;
  } else if (route.screen === "journal-detail") {
    body = <window.JournalScreen t={strings} lang={lang} go={go} articleId={route.id} />;
  } else if (route.screen === "concierge") {
    body = <window.ConciergeScreen key={lang} t={strings} lang={lang} go={go} />;
  } else if (route.screen === "account") {
    body = <window.AccountScreen t={strings} lang={lang} go={go} />;
  } else {
    // Fallback: go home
    body = <HomeScreen t={strings} lang={lang} category={category} setCategory={setCategoryLocal} go={go} />;
  }

  return (
    <React.Fragment>
      <Nav t={strings} lang={lang} setLang={(l) => setTweak("lang", l)} active={activeNav} go={go} dark={t.dark} setDark={(v) => setTweak("dark", v)} onSignInClick={() => setSignInOpen(true)} />
      {body}
      <Footer t={strings} lang={lang} />
      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} t={strings} />

      <TweaksPanel title={strings.tweaks.title}>
        <TweakSection label={strings.tweaks.appearance} />
        <TweakRadio
          label={strings.tweaks.appearance}
          value={t.dark ? "dark" : "light"}
          options={["light", "dark"]}
          onChange={(v) => setTweak("dark", v === "dark")}
        />
        <TweakSection label={strings.tweaks.language} />
        <TweakRadio
          label={strings.tweaks.language}
          value={t.lang}
          options={["tr", "en"]}
          onChange={(v) => setTweak("lang", v)}
        />
        <TweakSection label={strings.tweaks.radius} />
        <TweakSlider
          label={strings.tweaks.radius}
          value={t.radius}
          min={0}
          max={20}
          step={1}
          unit="px"
          onChange={(v) => setTweak("radius", v)}
        />
        <TweakSection label={lang === "tr" ? "Para Birimi" : "Currency"} />
        <TweakRadio
          label={lang === "tr" ? "Para Birimi" : "Currency"}
          value={t.currency || "EUR"}
          options={["EUR", "USD", "GBP", "TRY"]}
          onChange={(v) => setTweak("currency", v)}
        />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
