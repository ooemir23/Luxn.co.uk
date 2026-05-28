// LUXN — main app: routing, theme, language, tweaks panel

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": false,
  "lang": "en",
  "radius": 2
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = React.useState({ screen: "home", category: "stay", id: null });
  const [category, setCategoryLocal] = React.useState("stay");

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

  const go = (r) => {
    if (r.category) setCategoryLocal(r.category);
    setRoute(prev => ({ ...prev, ...r }));
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const goSearch = (params) => {
    go({ screen: "results", category: params.category || category, searchParams: params });
  };

  // Active nav category by route
  const activeNav = route.screen === "results" || route.screen === "detail" || route.screen === "booking"
    ? route.category
    : null;

  let body;
  if (route.screen === "home") {
    body = <HomeScreen t={strings} lang={lang} category={category} setCategory={setCategoryLocal} go={go} />;
  } else if (route.screen === "results") {
    body = <ResultsScreen t={strings} lang={lang} category={route.category} searchParams={route.searchParams} setCategory={(c) => go({ screen: "results", category: c })} go={go} />;
  } else if (route.screen === "detail") {
    body = <DetailScreen t={strings} lang={lang} category={route.category} id={route.id} go={go} />;
  } else if (route.screen === "booking") {
    body = <BookingScreen t={strings} lang={lang} category={route.category} id={route.id} go={go} />;
  }

  return (
    <React.Fragment>
      <Nav t={strings} lang={lang} setLang={(l) => setTweak("lang", l)} active={activeNav} go={go} />
      {body}
      <Footer t={strings} />

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
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
