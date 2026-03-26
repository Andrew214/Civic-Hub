import { useState, useEffect, useRef } from "react";
import { supabase, signInWithGoogle, signOut, upsertProfile, getProfile } from "./lib/supabase";
import { LandingScreen, SignInScreen, ZipScreen } from "./AuthFlow";

// ─── AUTH GATE ───────────────────────────────────────────────────────────────
function AuthGate({ children }) {
  // screen: 'landing' | 'signin' | 'zip' | 'app' | 'demo'
  const [screen, setScreen] = useState('landing');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [zip, setZip] = useState(null);

  // On mount — check if user is already signed in
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        const profile = await getProfile(session.user.id).catch(() => null);
        if (profile?.zip) {
          setZip(profile.zip);
          setScreen('app');
        } else {
          setScreen('zip');
        }
      }
    });

    // Listen for OAuth redirect callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        const profile = await getProfile(session.user.id).catch(() => null);
        if (profile?.zip) {
          setZip(profile.zip);
          setScreen('app');
        } else {
          setScreen('zip');
        }
        setAuthLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithGoogle(); // redirects to Google, comes back via onAuthStateChange
    } catch (e) {
      setAuthError('Something went wrong. Please try again.');
      setAuthLoading(false);
    }
  };

  const handleZipComplete = async (zipCode) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await upsertProfile({
        userId: user.id,
        email: user.email,
        name: user.user_metadata?.full_name,
        avatar: user.user_metadata?.avatar_url,
        zip: zipCode,
      });
      setZip(zipCode);
      setScreen('app');
    } catch (e) {
      setAuthError('Could not save your ZIP. Try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setZip(null);
    setScreen('landing');
  };

  if (screen === 'landing') return <LandingScreen onContinue={() => setScreen('signin')} />;
  if (screen === 'signin') return (
    <SignInScreen
      onGoogleSignIn={handleGoogleSignIn}
      onDemoMode={() => setScreen('demo')}
      loading={authLoading}
      error={authError}
    />
  );
  if (screen === 'zip') return (
    <ZipScreen
      user={user}
      onComplete={handleZipComplete}
      loading={authLoading}
      error={authError}
    />
  );

  // Pass auth context into the main app
  return children({ user: screen === 'demo' ? null : user, zip, onSignOut: handleSignOut });
}

// ─── AD REGISTRY ────────────────────────────────────────────────────────────
const ADS = {
  leaderboard: {
    id: "ad-leader-001",
    sponsor: "Austin FCU",
    headline: "Banking built for your block.",
    sub: "Free checking & community loans for local residents.",
    cta: "Open an Account",
    bg: "#0F2D52",
    accent: "#3B9EF0",
    type: "leaderboard",
  },
  sidebar: {
    id: "ad-side-001",
    sponsor: "HomeServe Austin",
    headline: "Neighbors trust us for home repairs.",
    sub: "Licensed, insured, and community-reviewed since 2008.",
    cta: "Get a Free Quote",
    bg: "#1A1A2E",
    accent: "#E94F37",
    type: "sidebar",
  },
  midroll: {
    id: "ad-mid-001",
    sponsor: "Central Market",
    headline: "Fuel your next volunteer day.",
    sub: "15% off bulk orders for community events. Just show your Hub card.",
    cta: "Learn More",
    bg: "#1D3526",
    accent: "#5CB85C",
    type: "midroll",
  },
  native: {
    id: "ad-native-001",
    sponsor: "Tito's Handmade Vodka",
    headline: "Sponsor a Community Cleanup",
    sub: "We'll match volunteer hours with donations to Keep Austin Beautiful.",
    cta: "Partner With Us",
    isSponsored: true,
    category: "civic",
    date: "Ongoing",
    bg: "#2A1F14",
    accent: "#D4A843",
    type: "native",
  },
};

// ─── SEED DATA ───────────────────────────────────────────────────────────────
const SEED_EVENTS = [
  { id: 1, title: "Barton Creek Trail Cleanup", category: "nature", status: "open", desc: "Early morning litter pickup along the lower trail. Gloves and bags provided. Dog-friendly.", date: "2026-04-05", spots: 12, filled: 4, joined: false, rsvps: ["AK","ML","DJ","SR"], organizer: "Tomás R.", featured: true, views: 142 },
  { id: 2, title: "Community Garden Work Day", category: "nature", status: "open", desc: "Spring planting at the Rundberg plot. All skill levels welcome, bring sunscreen and water.", date: "2026-04-12", spots: 8, filled: 2, joined: false, rsvps: ["CW","PH"], organizer: "Leah F.", featured: false, views: 87 },
  { id: 3, title: "Zoning Meeting — Spicewood Springs", category: "civic", status: "urgent", desc: "Council vote on the road expansion. Resident turnout directly influences the outcome.", date: "2026-03-30", spots: 50, filled: 5, joined: false, rsvps: ["BT","NR","GF","TL","AK"], organizer: "Marcus J.", featured: true, views: 310 },
  { id: 4, title: "Block Party Planning Committee", category: "social", status: "open", desc: "First meetup to plan the summer block party. Pizza provided. Kids welcome.", date: "2026-04-18", spots: 10, filled: 2, joined: false, rsvps: ["SR","DJ"], organizer: "Priya S.", featured: false, views: 56 },
  { id: 5, title: "Neighborhood Watch Orientation", category: "safety", status: "full", desc: "Overview of how to report and document incidents. Coordinating with APD liaison.", date: "2026-04-08", spots: 15, filled: 15, joined: false, rsvps: ["ML","CW","PH","NR","GF","TL","AK","BT","SR","DJ","TL","NR","PH","CW","ML"], organizer: "Dana K.", featured: false, views: 204 },
  { id: 6, title: "Senior Grocery Run — Weekly", category: "social", status: "open", desc: "Recurring volunteer driver rotation for neighbors 70+ who can't drive. ~2 hrs per shift.", date: "2026-04-02", spots: 4, filled: 1, joined: false, rsvps: ["GF"], organizer: "Annika T.", featured: false, views: 93 },
  { id: 7, title: "Mural Restoration — E. 6th", category: "civic", status: "open", desc: "Touch-up work on the 2019 community mural. Paint and supplies provided by the city arts fund.", date: "2026-04-22", spots: 6, filled: 0, joined: false, rsvps: [], organizer: "DeShawn M.", featured: false, views: 38 },
];

const CATS = ["all","nature","civic","social","safety"];
const CAT_META = {
  nature: { label: "🌿 Nature", color: "#4A9E5C", bg: "rgba(74,158,92,0.1)" },
  civic:  { label: "🏛 Civic",  color: "#C25A2A", bg: "rgba(194,90,42,0.1)" },
  social: { label: "🤝 Social", color: "#C8981F", bg: "rgba(200,152,31,0.1)" },
  safety: { label: "🛡 Safety", color: "#3A85C4", bg: "rgba(58,133,196,0.1)" },
};
const STATUS_META = {
  open:   { label: "Open",   color: "#4A9E5C" },
  urgent: { label: "Urgent", color: "#E05A2B", pulse: true },
  full:   { label: "Full",   color: "#8C8C9A" },
  done:   { label: "Done",   color: "#6B6B7B" },
};
const AVATAR_COLORS = ["#3B82F6","#EF4444","#F59E0B","#10B981","#8B5CF6","#EC4899","#14B8A6","#F97316"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d + "T12:00:00");
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};
const Avatar = ({ initials, i, size = 28 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: AVATAR_COLORS[i % AVATAR_COLORS.length],
    color: "#fff", fontSize: size * 0.36, fontWeight: 600,
    display: "flex", alignItems: "center", justifyContent: "center",
    border: "2px solid #0E1117", marginLeft: i === 0 ? 0 : -8,
    flexShrink: 0, zIndex: 10 - i, position: "relative",
    fontFamily: "'DM Sans', sans-serif",
  }}>{initials}</div>
);

// ─── AD COMPONENTS ───────────────────────────────────────────────────────────
const LeaderboardAd = ({ ad }) => (
  <div style={{
    width: "100%", background: ad.bg,
    border: `1px solid ${ad.accent}22`,
    borderRadius: 10, padding: "12px 20px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 20, position: "relative", overflow: "hidden",
    boxShadow: `0 0 40px ${ad.accent}18`,
  }}>
    <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: "100%",
      background: `radial-gradient(ellipse at right, ${ad.accent}22, transparent 70%)`, pointerEvents: "none" }} />
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <span style={{ fontSize: 10, color: "#ffffff55", fontWeight: 600, letterSpacing: "0.12em", 
        textTransform: "uppercase", border: "1px solid #ffffff22", padding: "2px 7px", borderRadius: 4 }}>Sponsored</span>
      <div>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "'Sora', sans-serif" }}>{ad.headline}</div>
        <div style={{ color: "#ffffff88", fontSize: 12, marginTop: 2 }}>{ad.sub}</div>
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
      <span style={{ color: "#ffffff66", fontSize: 11 }}>{ad.sponsor}</span>
      <button style={{ background: ad.accent, color: "#fff", border: "none", borderRadius: 6,
        padding: "7px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>{ad.cta} →</button>
    </div>
  </div>
);

const SidebarAd = ({ ad }) => (
  <div style={{
    background: ad.bg, border: `1px solid ${ad.accent}33`,
    borderRadius: 10, padding: "18px 16px", overflow: "hidden", position: "relative",
    boxShadow: `0 0 30px ${ad.accent}15`,
  }}>
    <div style={{ position: "absolute", bottom: -20, right: -20, width: 100, height: 100,
      borderRadius: "50%", background: `${ad.accent}18`, pointerEvents: "none" }} />
    <div style={{ fontSize: 9, color: "#ffffff44", fontWeight: 700, letterSpacing: "0.14em",
      textTransform: "uppercase", marginBottom: 10 }}>Sponsored · {ad.sponsor}</div>
    <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, lineHeight: 1.3,
      marginBottom: 8, fontFamily: "'Sora', sans-serif" }}>{ad.headline}</div>
    <div style={{ color: "#ffffff77", fontSize: 12, lineHeight: 1.5, marginBottom: 14 }}>{ad.sub}</div>
    <button style={{ width: "100%", background: ad.accent, color: "#fff", border: "none",
      borderRadius: 7, padding: "9px 0", fontSize: 12, fontWeight: 600, cursor: "pointer",
      fontFamily: "'DM Sans', sans-serif" }}>{ad.cta}</button>
  </div>
);

const MidrollAd = ({ ad }) => (
  <div style={{
    background: ad.bg, border: `1px solid ${ad.accent}33`,
    borderRadius: 10, padding: "16px 20px", margin: "4px 0",
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
    boxShadow: `0 0 24px ${ad.accent}12`,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 38, height: 38, borderRadius: 8, background: `${ad.accent}22`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 18 }}>🛒</span>
      </div>
      <div>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, fontFamily: "'Sora', sans-serif" }}>{ad.headline}</div>
        <div style={{ color: "#ffffff66", fontSize: 11, marginTop: 2 }}>{ad.sub}</div>
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
      <span style={{ fontSize: 9, color: "#ffffff44", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Ad · {ad.sponsor}</span>
      <button style={{ background: "transparent", color: ad.accent, border: `1.5px solid ${ad.accent}`,
        borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif" }}>{ad.cta}</button>
    </div>
  </div>
);

const NativeCard = ({ ad }) => (
  <div style={{
    background: "#16161E", border: "1px solid #2A2A3A",
    borderRadius: 12, overflow: "hidden", position: "relative",
    boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
  }}>
    <div style={{ height: 3, background: `linear-gradient(90deg, ${ad.accent}, ${ad.accent}88)` }} />
    <div style={{ padding: "14px 16px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
          color: ad.accent, background: `${ad.accent}18`, padding: "2px 8px", borderRadius: 100 }}>Sponsored</span>
        <span style={{ fontSize: 10, color: "#ffffff44" }}>{ad.sponsor}</span>
      </div>
      <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: "'Sora', sans-serif",
        marginBottom: 6, lineHeight: 1.3 }}>{ad.headline}</div>
      <div style={{ color: "#ffffff66", fontSize: 12, lineHeight: 1.5, marginBottom: 14 }}>{ad.sub}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "#ffffff44" }}>📅 {ad.date}</span>
        <button style={{ background: ad.accent, color: "#fff", border: "none", borderRadius: 6,
          padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif" }}>{ad.cta}</button>
      </div>
    </div>
  </div>
);

// ─── EVENT CARD ───────────────────────────────────────────────────────────────
const EventCard = ({ event, onJoin, onUnjoin, animDelay }) => {
  const cat = CAT_META[event.category] || {};
  const sta = STATUS_META[event.status] || {};
  const pct = Math.round((event.filled / event.spots) * 100);

  return (
    <div style={{
      background: "#16161E", border: event.featured ? "1px solid #3B82F655" : "1px solid #2A2A3A",
      borderRadius: 12, overflow: "hidden", position: "relative",
      boxShadow: event.featured ? "0 4px 20px rgba(59,130,246,0.12)" : "0 2px 10px rgba(0,0,0,0.25)",
      transition: "transform 0.2s, box-shadow 0.2s",
      animation: `fadeUp 0.35s ease ${animDelay}s both`,
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,0.4)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = event.featured ? "0 4px 20px rgba(59,130,246,0.12)" : "0 2px 10px rgba(0,0,0,0.25)"; }}
    >
      {event.featured && (
        <div style={{ position: "absolute", top: 12, right: 12, fontSize: 9, fontWeight: 700,
          letterSpacing: "0.1em", textTransform: "uppercase", color: "#3B82F6",
          background: "rgba(59,130,246,0.12)", padding: "2px 8px", borderRadius: 100 }}>Featured</div>
      )}
      <div style={{ height: 3, background: cat.color }} />
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em",
            textTransform: "uppercase", color: cat.color, background: cat.bg,
            padding: "3px 9px", borderRadius: 100 }}>{event.category}</span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            {sta.pulse && <span style={{ width: 6, height: 6, borderRadius: "50%", background: sta.color,
              display: "inline-block", animation: "pulse 1.5s infinite" }} />}
            <span style={{ fontSize: 11, color: sta.color, fontWeight: 500 }}>{sta.label}</span>
          </div>
        </div>

        <div style={{ color: "#F0EDE8", fontWeight: 700, fontSize: 15, fontFamily: "'Sora', sans-serif",
          marginBottom: 6, lineHeight: 1.35, paddingRight: event.featured ? 70 : 0 }}>{event.title}</div>
        <div style={{ color: "#8B8B9E", fontSize: 12, lineHeight: 1.6, marginBottom: 12 }}>{event.desc}</div>

        {/* Progress bar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: "#ffffff55" }}>{event.filled} of {event.spots} spots</span>
            <span style={{ fontSize: 11, color: pct >= 80 ? "#E05A2B" : "#ffffff44" }}>{pct}% filled</span>
          </div>
          <div style={{ height: 3, background: "#2A2A3A", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2,
              background: pct >= 80 ? "#E05A2B" : pct >= 50 ? "#C8981F" : "#4A9E5C",
              transition: "width 0.6s ease" }} />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 10, borderTop: "1px solid #2A2A3A" }}>
          <div>
            <div style={{ display: "flex" }}>
              {event.rsvps.slice(0, 4).map((r, i) => <Avatar key={i} initials={r} i={i} size={26} />)}
            </div>
            <div style={{ fontSize: 10, color: "#ffffff44", marginTop: 4 }}>
              📅 {fmtDate(event.date)} &nbsp;·&nbsp; {event.views} views
            </div>
          </div>
          {event.status === "full"
            ? <button style={{ ...btnStyle, background: "#2A2A3A", color: "#6B6B7B", cursor: "not-allowed" }}>Full</button>
            : event.joined
              ? <button onClick={() => onUnjoin(event.id)} style={{ ...btnStyle, background: "rgba(74,158,92,0.15)", color: "#4A9E5C", border: "1.5px solid #4A9E5C55" }}>✓ Joined</button>
              : <button onClick={() => onJoin(event.id)} style={{ ...btnStyle, background: "#3B82F6", color: "#fff", border: "none" }}>Join →</button>
          }
        </div>
      </div>
    </div>
  );
};

const btnStyle = {
  padding: "7px 16px", borderRadius: 7, fontSize: 12, fontWeight: 600,
  cursor: "pointer", fontFamily: "'DM Sans', sans-serif", border: "none",
  transition: "all 0.18s",
};

// ─── MODAL ────────────────────────────────────────────────────────────────────
const Modal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({ title: "", desc: "", category: "nature", status: "open", date: new Date().toISOString().split("T")[0], spots: "", name: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = () => {
    if (!form.title.trim()) return;
    onAdd(form);
    onClose();
  };
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 300,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      backdropFilter: "blur(4px)",
    }}>
      <div style={{ background: "#1A1A26", border: "1px solid #2A2A3A", borderRadius: 16,
        width: "100%", maxWidth: 500, boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
        animation: "slideUp 0.28s ease", overflow: "hidden" }}>
        <div style={{ background: "#0E1117", padding: "18px 22px", borderBottom: "1px solid #2A2A3A" }}>
          <div style={{ color: "#F0EDE8", fontWeight: 700, fontSize: 17, fontFamily: "'Sora', sans-serif" }}>Post an Opportunity</div>
          <div style={{ color: "#8B8B9E", fontSize: 12, marginTop: 3 }}>Share something your neighbors can jump in on</div>
        </div>
        <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "Title", id: "title", placeholder: "e.g. Shoreline Cleanup at Bull Creek" },
            { label: "Your Name", id: "name", placeholder: "First name or handle" },
          ].map(({ label, id, placeholder }) => (
            <div key={id}>
              <label style={labelStyle}>{label}</label>
              <input value={form[id]} onChange={e => set(id, e.target.value)} placeholder={placeholder} style={inputStyle} />
            </div>
          ))}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.desc} onChange={e => set("desc", e.target.value)} rows={3}
              placeholder="What needs doing? Any tools or details?" style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "Category", id: "category", options: ["nature","civic","social","safety"] },
              { label: "Status", id: "status", options: ["open","urgent","full"] },
            ].map(({ label, id, options }) => (
              <div key={id}>
                <label style={labelStyle}>{label}</label>
                <select value={form[id]} onChange={e => set(id, e.target.value)} style={inputStyle}>
                  {options.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Date</label>
              <input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Spots Available</label>
              <input type="number" value={form.spots} onChange={e => set("spots", e.target.value)} placeholder="e.g. 12" style={inputStyle} />
            </div>
          </div>
        </div>
        <div style={{ padding: "14px 22px 20px", display: "flex", gap: 10, justifyContent: "flex-end", borderTop: "1px solid #2A2A3A" }}>
          <button onClick={onClose} style={{ ...btnStyle, background: "transparent", color: "#8B8B9E", border: "1px solid #2A2A3A" }}>Cancel</button>
          <button onClick={submit} style={{ ...btnStyle, background: "#3B82F6", color: "#fff" }}>Post it →</button>
        </div>
      </div>
    </div>
  );
};
const labelStyle = { display: "block", fontSize: 11, fontWeight: 600, color: "#8B8B9E", marginBottom: 5, letterSpacing: "0.05em", textTransform: "uppercase" };
const inputStyle = { width: "100%", padding: "9px 12px", background: "#0E1117", border: "1px solid #2A2A3A",
  borderRadius: 8, color: "#F0EDE8", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
  outline: "none", boxSizing: "border-box" };

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
// ─── ROOT EXPORT ─────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthGate>
      {({ user, zip, onSignOut }) => <CivicHubApp user={user} zip={zip} onSignOut={onSignOut} />}
    </AuthGate>
  );
}

function CivicHubApp({ user, zip, onSignOut }) {
  const [events, setEvents] = useState(SEED_EVENTS);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("discover"); // discover | analytics | admin
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [nextId, setNextId] = useState(SEED_EVENTS.length + 1);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const join = (id) => {
    setEvents(ev => ev.map(e => e.id === id ? { ...e, joined: true, filled: e.filled + 1, rsvps: [...e.rsvps, "YOU"] } : e));
    showToast("You're in! 🎉");
  };
  const unjoin = (id) => {
    setEvents(ev => ev.map(e => e.id === id ? { ...e, joined: false, filled: Math.max(0, e.filled - 1), rsvps: e.rsvps.filter(r => r !== "YOU") } : e));
    showToast("RSVP removed");
  };
  const addEvent = (form) => {
    const newEv = {
      id: nextId, title: form.title, category: form.category, status: form.status,
      desc: form.desc || "No description provided.", date: form.date,
      spots: parseInt(form.spots) || 10, filled: 0, joined: false, rsvps: [],
      organizer: form.name || "Anonymous", featured: false, views: 1,
    };
    setEvents(ev => [newEv, ...ev]);
    setNextId(n => n + 1);
    showToast("Posted to the board! 📌");
  };

  const filtered = events.filter(e => {
    const matchCat = filter === "all" || e.category === filter;
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Insert native ad at position 3
  const feedItems = [];
  filtered.forEach((ev, i) => {
    feedItems.push({ type: "event", data: ev });
    if (i === 2) feedItems.push({ type: "native", data: ADS.native });
    if (i === 5) feedItems.push({ type: "midroll", data: ADS.midroll });
  });

  const stats = {
    open: events.filter(e => e.status === "open").length,
    urgent: events.filter(e => e.status === "urgent").length,
    people: [...new Set(events.flatMap(e => e.rsvps))].length,
    done: events.filter(e => e.status === "done").length,
    totalViews: events.reduce((a, e) => a + e.views, 0),
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0E1117; color: #F0EDE8; font-family: 'DM Sans', sans-serif; }
        @keyframes fadeUp { from { opacity:0; transform: translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(224,90,43,0.4); } 50% { box-shadow: 0 0 0 5px rgba(224,90,43,0); } }
        input::placeholder, textarea::placeholder { color: #4A4A5E; }
        select option { background: #1A1A26; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #0E1117; } ::-webkit-scrollbar-thumb { background: #2A2A3A; border-radius: 4px; }
      `}</style>

      {/* TOPNAV */}
      <div style={{ background: "#080B10", borderBottom: "1px solid #1E1E2E", padding: "0 24px",
        display: "flex", alignItems: "center", height: 58, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 17, color: "#F0EDE8",
          display: "flex", alignItems: "center", gap: 8, marginRight: 32 }}>
          <span style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
            display: "inline-block", flexShrink: 0 }} />
          CivicHub
          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
            color: "#3B82F6", background: "rgba(59,130,246,0.12)", padding: "2px 7px",
            borderRadius: 4, marginLeft: 4 }}>Enterprise</span>
        </div>

        {[
          { id: "discover", label: "Discover" },
          { id: "analytics", label: "Analytics" },
          { id: "admin", label: "Ad Manager" },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setView(id)} style={{
            background: "none", border: "none", cursor: "pointer", padding: "6px 14px",
            fontSize: 13, fontWeight: 500, color: view === id ? "#F0EDE8" : "#6B6B7B",
            borderBottom: view === id ? "2px solid #3B82F6" : "2px solid transparent",
            marginBottom: -1, transition: "color 0.2s", fontFamily: "'DM Sans', sans-serif",
          }}>{label}</button>
        ))}

        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ fontSize: 11, color: "#ffffff33", display: "flex", gap: 4 }}>
            <span style={{ color: "#4A9E5C" }}>●</span> Live
            {zip && <span style={{ color: "#ffffff22" }}>· {zip}</span>}
          </div>
          <button onClick={() => setShowModal(true)} style={{ background: "#3B82F6", color: "#fff",
            border: "none", borderRadius: 7, padding: "8px 16px", fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>+ Post Opportunity</button>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {user.user_metadata?.avatar_url
                ? <img src={user.user_metadata.avatar_url} style={{ width: 30, height: 30, borderRadius: "50%", cursor: "pointer" }} onClick={onSignOut} title="Sign out" alt="" />
                : <div onClick={onSignOut} title="Sign out" style={{ width: 30, height: 30, borderRadius: "50%", background: "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{user.email?.[0]?.toUpperCase()}</div>
              }
            </div>
          ) : (
            <span style={{ fontSize: 11, color: "#6B6B7B", background: "#1A1A26", padding: "4px 10px", borderRadius: 6 }}>Guest</span>
          )}
        </div>
      </div>

      {/* BODY */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px", display: "flex", gap: 24, alignItems: "flex-start" }}>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {view === "discover" && (
            <>
              {/* Leaderboard Ad */}
              <LeaderboardAd ad={ADS.leaderboard} />

              {/* Page header */}
              <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 22,
                  color: "#F0EDE8", marginBottom: 4 }}>What's happening nearby</h1>
                <p style={{ color: "#6B6B7B", fontSize: 13 }}>Volunteer, show up, and make your block better — one opportunity at a time.</p>
              </div>

              {/* Stats row */}
              <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
                {[
                  { label: "Open", val: stats.open, color: "#4A9E5C" },
                  { label: "Urgent", val: stats.urgent, color: "#E05A2B" },
                  { label: "Neighbors in", val: stats.people, color: "#3B82F6" },
                  { label: "Completed", val: stats.done, color: "#6B6B7B" },
                  { label: "Total views", val: stats.totalViews, color: "#8B5CF6" },
                ].map(({ label, val, color }, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 22, color, lineHeight: 1 }}>{val}</span>
                    <span style={{ fontSize: 11, color: "#6B6B7B", marginTop: 3 }}>{label}</span>
                  </div>
                ))}
              </div>

              {/* Filter bar */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
                {CATS.map(c => (
                  <button key={c} onClick={() => setFilter(c)} style={{
                    padding: "6px 14px", borderRadius: 100, fontSize: 12, fontWeight: 500,
                    cursor: "pointer", border: "1.5px solid",
                    borderColor: filter === c ? "#3B82F6" : "#2A2A3A",
                    background: filter === c ? "rgba(59,130,246,0.12)" : "transparent",
                    color: filter === c ? "#3B82F6" : "#8B8B9E",
                    fontFamily: "'DM Sans', sans-serif", transition: "all 0.18s",
                  }}>{c === "all" ? "All" : CAT_META[c]?.label}</button>
                ))}
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search…" style={{ ...inputStyle, marginLeft: "auto", width: 200, padding: "7px 12px" }} />
              </div>

              {/* Feed */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14 }}>
                {feedItems.length === 0
                  ? <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "4rem 0", color: "#4A4A5E" }}>
                      <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>📌</div>
                      <p style={{ fontSize: 13 }}>No opportunities found. Post one!</p>
                    </div>
                  : feedItems.map((item, i) => {
                    if (item.type === "event") return <EventCard key={item.data.id} event={item.data} onJoin={join} onUnjoin={unjoin} animDelay={i * 0.05} />;
                    if (item.type === "native") return <NativeCard key="native" ad={item.data} />;
                    if (item.type === "midroll") return <div key="midroll" style={{ gridColumn: "1/-1" }}><MidrollAd ad={item.data} /></div>;
                    return null;
                  })
                }
              </div>
            </>
          )}

          {view === "analytics" && <AnalyticsView events={events} stats={stats} />}
          {view === "admin" && <AdminView />}
        </div>

        {/* SIDEBAR */}
        <div style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 80 }}>
          <SidebarAd ad={ADS.sidebar} />

          <div style={{ background: "#16161E", border: "1px solid #2A2A3A", borderRadius: 10, padding: 16 }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 13, color: "#F0EDE8", marginBottom: 12 }}>Trending This Week</div>
            {[...events].sort((a, b) => b.views - a.views).slice(0, 4).map((e, i) => (
              <div key={e.id} style={{ display: "flex", gap: 10, marginBottom: i < 3 ? 12 : 0, paddingBottom: i < 3 ? 12 : 0, borderBottom: i < 3 ? "1px solid #2A2A3A" : "none" }}>
                <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 18, color: "#2A2A3A", lineHeight: 1, flexShrink: 0, width: 20 }}>{i + 1}</span>
                <div>
                  <div style={{ fontSize: 12, color: "#D0CCC5", fontWeight: 500, lineHeight: 1.3 }}>{e.title}</div>
                  <div style={{ fontSize: 10, color: "#4A4A5E", marginTop: 3 }}>{e.views} views</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "#16161E", border: "1px solid #2A2A3A", borderRadius: 10, padding: 16 }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 13, color: "#F0EDE8", marginBottom: 10 }}>Advertise Here</div>
            <div style={{ fontSize: 12, color: "#6B6B7B", lineHeight: 1.6, marginBottom: 12 }}>Reach engaged, action-oriented neighbors in your ZIP code.</div>
            <button style={{ width: "100%", background: "transparent", color: "#3B82F6", border: "1.5px solid #3B82F644",
              borderRadius: 7, padding: "8px 0", fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif" }}>Get Media Kit →</button>
          </div>
        </div>
      </div>

      {showModal && <Modal onClose={() => setShowModal(false)} onAdd={addEvent} />}

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          background: "#F0EDE8", color: "#0E1117", padding: "10px 22px", borderRadius: 100,
          fontSize: 13, fontWeight: 600, zIndex: 400, animation: "fadeUp 0.3s ease",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)", whiteSpace: "nowrap" }}>{toast}</div>
      )}
    </>
  );
}

// ─── ANALYTICS VIEW ──────────────────────────────────────────────────────────
function AnalyticsView({ events, stats }) {
  const byCategory = CATS.filter(c => c !== "all").map(c => ({
    cat: c, count: events.filter(e => e.category === c).length,
    filled: events.filter(e => e.category === c).reduce((a, e) => a + e.filled, 0),
  }));
  const adMetrics = [
    { placement: "Leaderboard", id: "AD-001", impressions: "12,430", clicks: 284, ctr: "2.29%", revenue: "$142.00", status: "active" },
    { placement: "Sidebar",     id: "AD-002", impressions: "11,980", clicks: 198, ctr: "1.65%", revenue: "$99.00",  status: "active" },
    { placement: "Mid-roll",    id: "AD-003", impressions: "8,210",  clicks: 311, ctr: "3.79%", revenue: "$155.50", status: "active" },
    { placement: "Native Card", id: "AD-004", impressions: "7,650",  clicks: 402, ctr: "5.25%", revenue: "$201.00", status: "active" },
  ];
  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 20, color: "#F0EDE8" }}>Analytics Dashboard</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total Impressions", val: "24,840", delta: "+12%", color: "#3B82F6" },
          { label: "Ad Revenue (MTD)", val: "$597.50", delta: "+8%", color: "#4A9E5C" },
          { label: "Avg. CTR", val: "3.24%", delta: "+0.4%", color: "#C8981F" },
          { label: "Active Campaigns", val: "4", delta: "this month", color: "#8B5CF6" },
        ].map(({ label, val, delta, color }, i) => (
          <div key={i} style={{ background: "#16161E", border: "1px solid #2A2A3A", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 11, color: "#6B6B7B", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 22, color }}>{val}</div>
            <div style={{ fontSize: 11, color: "#4A9E5C", marginTop: 4 }}>{delta}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#16161E", border: "1px solid #2A2A3A", borderRadius: 10, padding: 20, marginBottom: 20 }}>
        <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 16, color: "#F0EDE8" }}>Ad Placement Performance</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #2A2A3A" }}>
              {["Placement","ID","Impressions","Clicks","CTR","Revenue","Status"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, color: "#6B6B7B",
                  fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {adMetrics.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #1E1E2E" }}>
                <td style={{ padding: "12px 12px", color: "#F0EDE8", fontWeight: 500 }}>{row.placement}</td>
                <td style={{ padding: "12px 12px", color: "#4A4A5E", fontFamily: "monospace", fontSize: 11 }}>{row.id}</td>
                <td style={{ padding: "12px 12px", color: "#D0CCC5" }}>{row.impressions}</td>
                <td style={{ padding: "12px 12px", color: "#D0CCC5" }}>{row.clicks}</td>
                <td style={{ padding: "12px 12px", color: "#4A9E5C", fontWeight: 600 }}>{row.ctr}</td>
                <td style={{ padding: "12px 12px", color: "#C8981F", fontWeight: 600 }}>{row.revenue}</td>
                <td style={{ padding: "12px 12px" }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: "#4A9E5C", background: "rgba(74,158,92,0.12)",
                    padding: "3px 9px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.06em" }}>{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ background: "#16161E", border: "1px solid #2A2A3A", borderRadius: 10, padding: 20 }}>
        <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 16, color: "#F0EDE8" }}>Engagement by Category</div>
        {byCategory.map(({ cat, count, filled }) => {
          const meta = CAT_META[cat];
          const pct = Math.round((filled / Math.max(count * 10, 1)) * 100);
          return (
            <div key={cat} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: meta.color, fontWeight: 500 }}>{meta.label}</span>
                <span style={{ fontSize: 11, color: "#6B6B7B" }}>{count} events · {filled} RSVPs</span>
              </div>
              <div style={{ height: 6, background: "#2A2A3A", borderRadius: 3 }}>
                <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: meta.color, borderRadius: 3, transition: "width 0.8s ease" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ADMIN VIEW ───────────────────────────────────────────────────────────────
function AdminView() {
  const placements = [
    { id: "leaderboard", name: "Leaderboard Banner", desc: "Top of Discover feed. Highest visibility.", dims: "Full-width × 60px", cpm: "$11.50", fill: "100%", color: "#3B82F6" },
    { id: "sidebar",     name: "Sidebar Display",    desc: "Persistent right rail. Always in view.", dims: "240 × 260px",       cpm: "$8.25",  fill: "100%", color: "#8B5CF6" },
    { id: "midroll",     name: "Mid-Roll Banner",     desc: "Inserted between cards in the feed.", dims: "Full-width × 72px", cpm: "$9.75",  fill: "100%", color: "#C8981F" },
    { id: "native",      name: "Native Card",         desc: "Looks like content. Highest CTR.", dims: "290 × 160px",       cpm: "$14.00", fill: "100%", color: "#4A9E5C" },
  ];
  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 6, color: "#F0EDE8" }}>Ad Manager</h2>
      <p style={{ color: "#6B6B7B", fontSize: 13, marginBottom: 24 }}>Configure placements, review active campaigns, and manage advertisers.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 24 }}>
        {placements.map(p => (
          <div key={p.id} style={{ background: "#16161E", border: `1px solid ${p.color}33`, borderRadius: 12, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14, color: "#F0EDE8" }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "#6B6B7B", marginTop: 3 }}>{p.desc}</div>
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#4A9E5C", background: "rgba(74,158,92,0.1)",
                padding: "3px 9px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0, marginLeft: 8 }}>Live</span>
            </div>
            <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
              {[{ label: "Dimensions", val: p.dims }, { label: "CPM", val: p.cpm }, { label: "Fill Rate", val: p.fill }].map(({ label, val }) => (
                <div key={label}>
                  <div style={{ fontSize: 10, color: "#4A4A5E", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                  <div style={{ fontSize: 13, color: "#F0EDE8", fontWeight: 600, marginTop: 2 }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ flex: 1, background: `${p.color}18`, color: p.color, border: `1.5px solid ${p.color}44`,
                borderRadius: 7, padding: "7px 0", fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif" }}>Edit Creative</button>
              <button style={{ flex: 1, background: "transparent", color: "#6B6B7B", border: "1.5px solid #2A2A3A",
                borderRadius: 7, padding: "7px 0", fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif" }}>Pause</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "#16161E", border: "1px solid #2A2A3A", borderRadius: 10, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 15, color: "#F0EDE8" }}>Active Advertisers</div>
          <button style={{ background: "#3B82F6", color: "#fff", border: "none", borderRadius: 7, padding: "7px 14px",
            fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>+ New Advertiser</button>
        </div>
        {[
          { name: "Austin FCU",      placement: "Leaderboard", budget: "$2,400/mo", start: "Mar 1",  end: "May 31",  status: "active" },
          { name: "HomeServe Austin",placement: "Sidebar",     budget: "$1,100/mo", start: "Mar 15", end: "Apr 15",  status: "active" },
          { name: "Central Market",  placement: "Mid-Roll",    budget: "$800/mo",   start: "Apr 1",  end: "Apr 30",  status: "pending" },
          { name: "Tito's Vodka",    placement: "Native Card", budget: "$1,800/mo", start: "Mar 10", end: "Jun 30",  status: "active" },
        ].map((adv, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0",
            borderBottom: i < 3 ? "1px solid #1E1E2E" : "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#0E1117",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 13, color: "#3B82F6" }}>
              {adv.name[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: "#F0EDE8", fontWeight: 600 }}>{adv.name}</div>
              <div style={{ fontSize: 11, color: "#4A4A5E" }}>{adv.placement} · {adv.start} – {adv.end}</div>
            </div>
            <div style={{ fontSize: 13, color: "#C8981F", fontWeight: 600 }}>{adv.budget}</div>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
              color: adv.status === "active" ? "#4A9E5C" : "#C8981F",
              background: adv.status === "active" ? "rgba(74,158,92,0.1)" : "rgba(200,152,31,0.1)",
              padding: "3px 9px", borderRadius: 100 }}>{adv.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
