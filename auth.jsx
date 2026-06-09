// LUXN — Auth (mock): session in localStorage + sign-in modal + user menu

const AUTH_KEY = "luxn.session.v1";
const AUTH_EVT = "luxn:session-changed";

function readSession() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
function writeSession(s) {
  try {
    if (s) localStorage.setItem(AUTH_KEY, JSON.stringify(s));
    else localStorage.removeItem(AUTH_KEY);
  } catch (e) {}
}
function emitSession() {
  window.dispatchEvent(new CustomEvent(AUTH_EVT));
}

function useSession() {
  const [session, setSession] = React.useState(() => readSession());
  React.useEffect(() => {
    const h = () => setSession(readSession());
    window.addEventListener(AUTH_EVT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(AUTH_EVT, h);
      window.removeEventListener("storage", h);
    };
  }, []);
  const signIn = React.useCallback((data) => {
    writeSession(data);
    setSession(data);
    emitSession();
  }, []);
  const signOut = React.useCallback(() => {
    writeSession(null);
    setSession(null);
    emitSession();
  }, []);
  return { session, signIn, signOut };
}

// ============ SIGN IN MODAL ============
function SignInModal({ open, onClose, t }) {
  const [mode, setMode] = React.useState("in"); // "in" | "up"
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const { signIn } = useSession();
  const overlayRef = React.useRef(null);

  // ESC closes
  React.useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  React.useEffect(() => {
    // Reset on close
    if (!open) {
      setEmail(""); setPassword(""); setName(""); setBusy(false);
    }
  }, [open]);

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setBusy(true);
    // Mock: short delay, then "sign in"
    setTimeout(() => {
      const display = mode === "up" && name.trim() ? name.trim() : email.split("@")[0];
      signIn({
        email: email.trim(),
        name: display.charAt(0).toUpperCase() + display.slice(1),
        initials: (display || "G").slice(0, 1).toUpperCase(),
        signedInAt: Date.now(),
      });
      setBusy(false);
      onClose();
    }, 600);
  };

  const social = (provider) => {
    setBusy(true);
    setTimeout(() => {
      signIn({
        email: `guest@${provider}.com`,
        name: provider === "apple" ? "Apple Guest" : "Google Guest",
        initials: provider === "apple" ? "A" : "G",
        signedInAt: Date.now(),
      });
      setBusy(false);
      onClose();
    }, 500);
  };

  return (
    <div
      className="auth-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="auth-modal fade-in" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="auth-close" onClick={onClose} aria-label="Close">×</button>

        <div className="auth-brand">
          <span className="auth-logo">Luxn<span style={{ fontSize: "0.8em", opacity: 0.8, letterSpacing: "0.02em" }}>.co.uk</span></span>
        </div>

        <h2 id="auth-title" className="auth-title display">
          {mode === "in" ? t.auth.welcome : t.auth.welcome_new}
        </h2>
        <p className="auth-sub">
          {mode === "in" ? t.auth.welcome_sub : t.auth.welcome_new_sub}
        </p>

        <div className="auth-social">
          <button type="button" className="auth-social-btn" onClick={() => social("apple")} disabled={busy}>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path fill="currentColor" d="M17.05 12.04c-.03-2.79 2.28-4.13 2.38-4.2-1.3-1.9-3.32-2.16-4.04-2.19-1.72-.17-3.36 1.01-4.24 1.01-.88 0-2.22-.99-3.66-.96-1.88.03-3.63 1.1-4.6 2.78-1.97 3.4-.5 8.43 1.41 11.18.94 1.35 2.04 2.86 3.48 2.8 1.4-.06 1.93-.9 3.62-.9 1.69 0 2.16.9 3.64.87 1.51-.03 2.46-1.37 3.37-2.73 1.07-1.56 1.5-3.1 1.52-3.18-.03-.01-2.91-1.12-2.94-4.43zm-2.77-8.13c.77-.94 1.3-2.24 1.15-3.54-1.12.05-2.47.74-3.27 1.68-.72.83-1.35 2.16-1.18 3.43 1.25.1 2.53-.63 3.3-1.57z" />
            </svg>
            <span>{t.auth.apple}</span>
          </button>
          <button type="button" className="auth-social-btn" onClick={() => social("google")} disabled={busy}>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path fill="#4285F4" d="M22.5 12.27c0-.78-.07-1.53-.2-2.27H12v4.5h5.91c-.26 1.4-1.04 2.59-2.21 3.39v2.77h3.57c2.08-1.92 3.23-4.74 3.23-8.39z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.27-2.65l-3.57-2.77c-.98.66-2.24 1.06-3.7 1.06-2.85 0-5.27-1.92-6.13-4.5H2.18v2.83C3.98 20.6 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.87 14.13c-.22-.66-.34-1.36-.34-2.13s.12-1.47.34-2.13V7.04H2.18C1.43 8.52 1 10.2 1 12s.43 3.48 1.18 4.96l3.69-2.83z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 2.1 14.97 1 12 1 7.7 1 3.98 3.4 2.18 7.04l3.69 2.83C6.73 7.3 9.15 5.38 12 5.38z"/>
            </svg>
            <span>{t.auth.google}</span>
          </button>
        </div>

        <div className="auth-divider"><span className="mono">{t.auth.or}</span></div>

        <form className="auth-form" onSubmit={submit}>
          {mode === "up" ? (
            <label className="auth-field">
              <span className="auth-field-lbl">{t.auth.name}</span>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </label>
          ) : null}
          <label className="auth-field">
            <span className="auth-field-lbl">{t.auth.email}</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
              autoFocus
            />
          </label>
          <label className="auth-field">
            <span className="auth-field-lbl">{t.auth.password}</span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={mode === "up" ? "new-password" : "current-password"}
              required
              minLength={6}
            />
          </label>
          {mode === "in" ? (
            <button type="button" className="auth-forgot btn-link">{t.auth.forgot}</button>
          ) : null}
          <button type="submit" className="btn auth-submit" disabled={busy}>
            {busy ? "…" : t.auth.continue}
          </button>
        </form>

        <div className="auth-switch">
          <span>{mode === "in" ? t.auth.no_account : t.auth.have_account}</span>
          <button
            type="button"
            className="btn-link"
            onClick={() => setMode(mode === "in" ? "up" : "in")}
          >
            {mode === "in" ? t.auth.switch_up : t.auth.switch_in}
          </button>
        </div>

        <p className="auth-terms">{t.auth.terms}</p>
      </div>
    </div>
  );
}

// ============ USER MENU (shown when signed in) ============
function UserMenu({ t, go }) {
  const { session, signOut } = useSession();
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef(null);

  React.useEffect(() => {
    const h = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  if (!session) return null;

  return (
    <div className="user-menu" ref={wrapRef}>
      <button
        className="user-avatar"
        onClick={() => setOpen(!open)}
        aria-label={session.name}
      >
        {session.initials}
      </button>
      {open ? (
        <div className="user-pop">
          <div className="user-pop-head">
            <div className="user-pop-name">{session.name}</div>
            <div className="user-pop-email mono">{session.email}</div>
          </div>
          <button className="user-pop-item" onClick={() => { setOpen(false); go({ screen: "favorites" }); }}>
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
              <path d="M12 21s-7.5-4.6-9.5-9.2C1 8.4 3.3 5 6.7 5c2 0 3.6 1 5.3 3 1.7-2 3.3-3 5.3-3 3.4 0 5.7 3.4 4.2 6.8C19.5 16.4 12 21 12 21z"
                fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <span>{t.auth.menu_favs}</span>
          </button>
          <button className="user-pop-item" onClick={() => { setOpen(false); go({ screen: "account" }); }}>
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>{t.auth.menu_trips}</span>
          </button>
          <button className="user-pop-item" onClick={() => { setOpen(false); window.postMessage({ type: '__activate_edit_mode' }, '*'); }}>
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.1-1.2L14 3h-4l-.5 2.7a7 7 0 0 0-2.1 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.1 1.2L10 21h4l.5-2.7a7 7 0 0 0 2.1-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z"
                fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            </svg>
            <span>{t.auth.menu_settings}</span>
          </button>

          <div className="user-pop-sep" />
          <button className="user-pop-item danger" onClick={() => { signOut(); setOpen(false); }}>
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
              <path d="M15 4h4v16h-4M3 12h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <span>{t.auth.sign_out}</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

Object.assign(window, { useSession, SignInModal, UserMenu });
