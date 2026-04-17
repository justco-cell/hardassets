import React, { useState, useEffect, useRef } from 'react';

const P = {
  bg: '#0B0F1A', surface: '#141826', elevated: '#1F2433', border: '#2A3041',
  text: '#E8ECF4', txM: '#A8B2C7', txS: '#7A8599',
  gold: '#D4A843', goldSoft: 'rgba(212,168,67,0.15)',
  red: '#EF4444', green: '#10B981'
};
const ff = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";

export default function ResetPassword() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token') || '';

  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [hp, setHp] = useState('');
  const formLoadedAt = useRef(Date.now()).current;

  useEffect(() => {
    if (!token) setErr('This reset link is invalid or has expired.');
  }, [token]);

  const submit = async () => {
    setErr('');
    if (!token) { setErr('This reset link is invalid or has expired.'); return; }
    if (pw.length < 8) { setErr('Password must be at least 8 characters.'); return; }
    if (pw !== confirm) { setErr('Passwords do not match.'); return; }
    if (hp) return;

    setLoading(true);
    try {
      const r = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_password', token, password: pw, _ts: formLoadedAt, hp })
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.success) {
        try {
          sessionStorage.setItem('ha_user', JSON.stringify({ name: d.name, email: d.email }));
          sessionStorage.setItem('ha_token', d.token);
        } catch (e) {}
        if (window.posthog) window.posthog.capture('password_reset_completed');
        setDone(true);
      } else {
        setErr(d.error || 'Could not update password.');
      }
    } catch (e) {
      setErr('Could not update password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ background: P.bg, minHeight: '100vh', color: P.text, fontFamily: ff, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420, background: P.surface, border: `1px solid ${P.border}`, borderRadius: 24, padding: '36px 28px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(145deg,${P.gold},#B8912E)`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: P.bg, marginBottom: 16, boxShadow: '0 8px 32px rgba(212,168,67,0.3)' }}>H</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{done ? 'Password updated' : 'Choose a new password'}</div>
        </div>

        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: P.txS, marginBottom: 20, lineHeight: 1.5 }}>
              Your password has been updated and you're signed in on this device. Other devices have been signed out.
            </div>
            <a href="/" style={{ display: 'inline-block', padding: '12px 28px', background: `linear-gradient(145deg,${P.gold},#B8912E)`, color: P.bg, fontWeight: 700, textDecoration: 'none', borderRadius: 10, fontSize: 14 }}>Go to HardAssets</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13, color: P.txS, marginBottom: 4 }}>
              Enter a new password for your account. Must be at least 8 characters.
            </div>

            <div>
              <div style={{ fontSize: 12, color: P.txM, marginBottom: 4 }}>New password</div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  style={{ width: '100%', padding: '12px 56px 12px 14px', background: P.elevated, border: `1px solid ${P.border}`, borderRadius: 10, color: P.text, fontSize: 14, fontFamily: ff, outline: 'none', boxSizing: 'border-box' }}
                />
                <button onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: P.txM, fontSize: 12, cursor: 'pointer', fontFamily: ff }}>{showPw ? 'Hide' : 'Show'}</button>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: P.txM, marginBottom: 4 }}>Confirm new password</div>
              <input
                type={showPw ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                autoComplete="new-password"
                style={{ width: '100%', padding: '12px 14px', background: P.elevated, border: `1px solid ${P.border}`, borderRadius: 10, color: P.text, fontSize: 14, fontFamily: ff, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Honeypot */}
            <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
              <input type="text" value={hp} onChange={e => setHp(e.target.value)} tabIndex={-1} autoComplete="off" />
            </div>

            {err && <div style={{ color: P.red, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}><span>⚠</span>{err}</div>}

            <button
              onClick={submit}
              disabled={loading || !token}
              style={{ marginTop: 4, padding: '13px 20px', background: `linear-gradient(145deg,${P.gold},#B8912E)`, color: P.bg, fontWeight: 700, border: 'none', borderRadius: 10, fontSize: 15, cursor: loading || !token ? 'not-allowed' : 'pointer', opacity: loading || !token ? 0.6 : 1, fontFamily: ff }}
            >
              {loading ? 'Updating...' : 'Update password'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 4 }}>
              <a href="/" style={{ color: P.txM, fontSize: 12, textDecoration: 'underline', fontFamily: ff }}>Back to sign in</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
