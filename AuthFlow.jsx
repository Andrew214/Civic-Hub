import { useState } from 'react'

// ─── SHARED STYLES ────────────────────────────────────────────
const S = {
  page: {
    minHeight: '100vh', background: '#0E1117', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: "'DM Sans', sans-serif", padding: 20,
    backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.06) 0%, transparent 60%)',
  },
  card: {
    width: '100%', maxWidth: 420, animation: 'fadeUp 0.4s ease',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10,
    marginBottom: 40, justifyContent: 'center',
  },
  logoMark: {
    width: 36, height: 36, borderRadius: 9,
    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
    flexShrink: 0,
  },
  logoText: {
    fontFamily: "'Sora', sans-serif", fontWeight: 800,
    fontSize: 22, color: '#F0EDE8',
  },
  headline: {
    fontFamily: "'Sora', sans-serif", fontWeight: 800,
    fontSize: 30, color: '#F0EDE8', lineHeight: 1.2,
    marginBottom: 12, textAlign: 'center',
  },
  sub: {
    fontSize: 14, color: '#6B6B7B', textAlign: 'center',
    lineHeight: 1.6, marginBottom: 36,
  },
  divider: {
    height: 1, background: '#1E1E2E', margin: '24px 0',
    position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  dividerText: {
    fontSize: 11, color: '#4A4A5E', background: '#0E1117',
    padding: '0 12px', letterSpacing: '0.08em', textTransform: 'uppercase',
  },
  input: {
    width: '100%', padding: '13px 16px', background: '#16161E',
    border: '1.5px solid #2A2A3A', borderRadius: 10,
    color: '#F0EDE8', fontSize: 15, fontFamily: "'DM Sans', sans-serif",
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
    letterSpacing: '0.04em',
  },
  btnPrimary: {
    width: '100%', padding: '13px 0', background: '#3B82F6',
    color: '#fff', border: 'none', borderRadius: 10, fontSize: 15,
    fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
    transition: 'background 0.2s', marginTop: 8,
  },
  btnGoogle: {
    width: '100%', padding: '13px 0', background: '#16161E',
    color: '#F0EDE8', border: '1.5px solid #2A2A3A', borderRadius: 10,
    fontSize: 14, fontWeight: 500, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", display: 'flex',
    alignItems: 'center', justifyContent: 'center', gap: 10,
    transition: 'border-color 0.2s, background 0.2s',
  },
  label: {
    display: 'block', fontSize: 12, fontWeight: 600, color: '#8B8B9E',
    marginBottom: 7, letterSpacing: '0.05em', textTransform: 'uppercase',
  },
  error: {
    fontSize: 12, color: '#E05A2B', marginTop: 8, textAlign: 'center',
  },
  fine: {
    fontSize: 11, color: '#4A4A5E', textAlign: 'center',
    lineHeight: 1.6, marginTop: 20,
  },
}

// ─── GOOGLE ICON ─────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
  </svg>
)

// ─── LANDING SCREEN ───────────────────────────────────────────
export function LandingScreen({ onContinue }) {
  const features = [
    { icon: '📌', label: 'Browse opportunities near you' },
    { icon: '✋', label: 'One-tap RSVP, no downloads' },
    { icon: '🏘', label: 'Verified neighbors only' },
  ]
  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.logo}>
          <div style={S.logoMark} />
          <span style={S.logoText}>CivicHub</span>
        </div>

        <h1 style={S.headline}>Your neighborhood,<br />in action.</h1>
        <p style={S.sub}>Find volunteer opportunities, community events,<br />and neighbors who show up — all in one place.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
          {features.map(({ icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12,
              background: '#16161E', border: '1px solid #2A2A3A',
              borderRadius: 10, padding: '12px 16px' }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span style={{ fontSize: 14, color: '#C0BDB8' }}>{label}</span>
            </div>
          ))}
        </div>

        <button onClick={onContinue} style={S.btnPrimary}>
          Get started →
        </button>
        <p style={S.fine}>Free to join. No app download required.</p>
      </div>
    </div>
  )
}

// ─── SIGN IN SCREEN ───────────────────────────────────────────
export function SignInScreen({ onGoogleSignIn, onDemoMode, loading, error }) {
  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.logo}>
          <div style={S.logoMark} />
          <span style={S.logoText}>CivicHub</span>
        </div>

        <h1 style={{ ...S.headline, fontSize: 24 }}>Join your neighborhood</h1>
        <p style={{ ...S.sub, marginBottom: 28 }}>
          Sign in to see what's happening near you.<br />
          We use Google to verify you're a real person.
        </p>

        <button
          onClick={onGoogleSignIn}
          disabled={loading}
          style={{ ...S.btnGoogle, opacity: loading ? 0.6 : 1 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.background = '#1A1A2E'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A3A'; e.currentTarget.style.background = '#16161E'; }}
        >
          <GoogleIcon />
          {loading ? 'Signing in…' : 'Continue with Google'}
        </button>

        {error && <p style={S.error}>{error}</p>}

        <div style={S.divider}>
          <span style={S.dividerText}>or</span>
        </div>

        <button
          onClick={onDemoMode}
          style={{ ...S.btnGoogle, color: '#6B6B7B', fontSize: 13 }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#3A3A4A'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#2A2A3A'}
        >
          👀 Browse as guest (no account)
        </button>

        <p style={S.fine}>
          By continuing, you agree to our Terms of Service.<br />
          We never post to your Google account.
        </p>
      </div>
    </div>
  )
}

// ─── ZIP CAPTURE SCREEN ──────────────────────────────────────
export function ZipScreen({ user, onComplete, loading, error }) {
  const [zip, setZip] = useState('')
  const [focused, setFocused] = useState(false)

  const isValid = /^\d{5}$/.test(zip)

  const handleSubmit = () => {
    if (!isValid) return
    onComplete(zip)
  }

  const name = user?.user_metadata?.full_name?.split(' ')[0] || 'neighbor'
  const avatar = user?.user_metadata?.avatar_url

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.logo}>
          <div style={S.logoMark} />
          <span style={S.logoText}>CivicHub</span>
        </div>

        {/* User greeting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12,
          background: '#16161E', border: '1px solid #2A2A3A',
          borderRadius: 10, padding: '12px 16px', marginBottom: 28 }}>
          {avatar
            ? <img src={avatar} style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} alt="" />
            : <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#3B82F6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                {name[0]?.toUpperCase()}
              </div>
          }
          <div>
            <div style={{ fontSize: 13, color: '#F0EDE8', fontWeight: 500 }}>Hey, {name} 👋</div>
            <div style={{ fontSize: 11, color: '#4A4A5E' }}>Google account verified</div>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#4A9E5C',
            background: 'rgba(74,158,92,0.12)', padding: '3px 9px',
            borderRadius: 100, letterSpacing: '0.06em', textTransform: 'uppercase' }}>✓ Verified</span>
        </div>

        <h1 style={{ ...S.headline, fontSize: 24, marginBottom: 8 }}>What's your ZIP code?</h1>
        <p style={{ ...S.sub, marginBottom: 28 }}>
          We use this to show you opportunities<br />in your neighborhood only.
        </p>

        <div>
          <label style={S.label}>ZIP Code</label>
          <input
            value={zip}
            onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="e.g. 78750"
            maxLength={5}
            style={{ ...S.input, borderColor: focused ? '#3B82F6' : isValid ? '#4A9E5C' : '#2A2A3A',
              fontSize: 22, letterSpacing: '0.2em', textAlign: 'center', fontFamily: "'Sora', sans-serif", fontWeight: 700 }}
          />
        </div>

        {error && <p style={S.error}>{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          style={{ ...S.btnPrimary, opacity: isValid && !loading ? 1 : 0.4,
            cursor: isValid && !loading ? 'pointer' : 'not-allowed',
            background: isValid ? '#3B82F6' : '#2A2A3A' }}
        >
          {loading ? 'Finding your neighborhood…' : 'Show me what\'s near me →'}
        </button>

        {/* Neighborhood preview */}
        {isValid && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(59,130,246,0.06)',
            border: '1px solid rgba(59,130,246,0.15)', borderRadius: 10, animation: 'fadeUp 0.3s ease' }}>
            <div style={{ fontSize: 12, color: '#3B82F6', fontWeight: 500 }}>
              📍 Loading neighborhood for {zip}…
            </div>
          </div>
        )}

        <p style={S.fine}>
          Your exact address is never stored or shared.<br />
          We only use your ZIP to filter local content.
        </p>
      </div>
    </div>
  )
}
