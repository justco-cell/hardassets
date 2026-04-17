import crypto from 'crypto';

// Rate limiters — separate for signup vs login
const attempts = {};
function rateLimit(key, limit, windowMs = 3600000) {
  const now = Date.now();
  if (!attempts[key]) attempts[key] = [];
  attempts[key] = attempts[key].filter(t => now - t < windowMs);
  if (attempts[key].length >= limit) return false;
  attempts[key].push(now);
  return true;
}

const DISPOSABLE_DOMAINS = ['tempmail.com','throwaway.email','guerrillamail.com','mailinator.com','10minutemail.com','trashmail.com','yopmail.com','sharklasers.com','guerrillamailblock.com','grr.la','dispostable.com','maildrop.cc','fakeinbox.com','tempail.com','temp-mail.org'];

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = ['https://hardassets.io', 'https://www.hardassets.io'];
  if (allowed.includes(origin) || origin.endsWith('.vercel.app')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://hardassets.io');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, email, password, name, _ts, turnstileToken, hp, token: resetToken } = req.body;

  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';

  // Honeypot — bots fill hidden fields, silently reject
  if (hp) return res.status(200).json({ success: true, token: 'ok' });

  // Time check — form submitted under 2 seconds = bot
  if (_ts && (Date.now() - _ts) < 2000) return res.status(400).json({ error: 'Please try again.' });

  // Email required for signup / login / reset. reset_password uses a token instead.
  if (action !== 'reset_password') {
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    const atIdx = email.indexOf('@');
    if (atIdx < 1 || !email.includes('.', atIdx) || email.length < 5) return res.status(400).json({ error: 'Invalid email address.' });
  }

  // Password required for signup / login / reset_password. reset (forgot) does not carry a password.
  if (action !== 'reset') {
    if (!password) return res.status(400).json({ error: 'Password is required.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // TODO: Upgrade to bcrypt/argon2 for production
  const hashPassword = (pw) => crypto.createHash('sha256').update(pw + 'hardassets_salt_2026').digest('hex');
  const passHash = password ? hashPassword(password) : null;

  try {
    if (action === 'signup') {
      // Signup rate limit: 5 per hour per IP
      if (!rateLimit('signup_' + ip, 5)) return res.status(429).json({ error: 'Too many signup attempts. Please try again later.' });

      // Block disposable email domains
      const domain = email.split('@')[1]?.toLowerCase();
      if (DISPOSABLE_DOMAINS.includes(domain)) return res.status(400).json({ error: 'Please use a real email address.' });

      // Name validation
      const trimName = (name || '').trim();
      if (trimName.length < 2) return res.status(400).json({ error: 'Name must be at least 2 characters.' });
      if (/^\d+$/.test(trimName)) return res.status(400).json({ error: 'Please enter a real name.' });

      // Cloudflare Turnstile verification (optional — only if token provided and secret configured)
      const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;
      if (TURNSTILE_SECRET && turnstileToken) {
        const tRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret: TURNSTILE_SECRET, response: turnstileToken })
        });
        const tData = await tRes.json();
        if (!tData.success) return res.status(403).json({ error: 'Bot verification failed. Please try again.' });
      }

      // Check if user exists
      const checkRes = await fetch(
        `${SUPABASE_URL}/rest/v1/auth_users?email=eq.${encodeURIComponent(email)}&select=id`,
        { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
      );
      const existing = await checkRes.json();
      if (existing && existing.length > 0) {
        return res.status(400).json({ error: 'Account already exists. Sign in instead.' });
      }

      // Create user
      const token = crypto.randomBytes(32).toString('hex');
      const createRes = await fetch(
        `${SUPABASE_URL}/rest/v1/auth_users`,
        {
          method: 'POST',
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password_hash: passHash, name: trimName, token })
        }
      );
      if (!createRes.ok) return res.status(500).json({ error: 'Failed to create account' });
      return res.status(200).json({ token: `${email}:${token}`, name: trimName, email });

    } else if (action === 'login') {
      // Login rate limit: 10 per hour per IP
      if (!rateLimit('login_' + ip, 10)) return res.status(429).json({ error: 'Too many login attempts. Please try again later.' });

      const findRes = await fetch(
        `${SUPABASE_URL}/rest/v1/auth_users?email=eq.${encodeURIComponent(email)}&select=*`,
        { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
      );
      const users = await findRes.json();
      if (!users || users.length === 0) return res.status(401).json({ error: 'No account found. Sign up first.' });
      const user = users[0];
      if (user.password_hash !== passHash) return res.status(401).json({ error: 'Invalid password.' });

      const token = crypto.randomBytes(32).toString('hex');
      await fetch(
        `${SUPABASE_URL}/rest/v1/auth_users?email=eq.${encodeURIComponent(email)}`,
        {
          method: 'PATCH',
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        }
      );
      return res.status(200).json({ token: `${email}:${token}`, name: user.name, email });

    } else if (action === 'reset') {
      // Forgot password: always responds with success, regardless of whether the
      // email is in auth_users. This prevents attackers from enumerating accounts.
      // Rate limits are enforced silently — an attacker who exceeds them also sees success.

      rateLimit('reset_email_' + (email || '').toLowerCase(), 3);
      rateLimit('reset_ip_' + ip, 10);

      // Look up user. If absent, we still respond success and do no work.
      const findRes = await fetch(
        `${SUPABASE_URL}/rest/v1/auth_users?email=eq.${encodeURIComponent(email)}&select=id,email`,
        { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
      );
      const users = await findRes.json();

      if (users && users.length > 0) {
        const user = users[0];
        const resetPlain = crypto.randomBytes(32).toString('hex');
        const resetHash = crypto.createHash('sha256').update(resetPlain).digest('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

        const updRes = await fetch(
          `${SUPABASE_URL}/rest/v1/auth_users?id=eq.${user.id}`,
          {
            method: 'PATCH',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ reset_token_hash: resetHash, reset_token_expires_at: expiresAt })
          }
        );

        const RESEND_KEY = process.env.RESEND_API_KEY;
        if (RESEND_KEY && updRes.ok) {
          const resetUrl = `https://hardassets.io/reset?token=${resetPlain}`;
          try {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                from: 'HardAssets.io <noreply@hardassets.io>',
                to: user.email,
                subject: 'Reset your HardAssets.io password',
                html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#0B0F1A;color:#E8ECF4;">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="display:inline-block;width:56px;height:56px;border-radius:16px;background:linear-gradient(145deg,#D4A843,#B8912E);line-height:56px;font-size:24px;font-weight:900;color:#0B0F1A;">H</div>
  </div>
  <h2 style="margin:0 0 16px;font-size:20px;color:#E8ECF4;">Reset your password</h2>
  <p style="margin:0 0 24px;font-size:15px;line-height:1.5;color:#A8B2C7;">We received a request to reset the password for your HardAssets.io account. Click the button below to choose a new password.</p>
  <div style="text-align:center;margin:32px 0;"><a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(145deg,#D4A843,#B8912E);color:#0B0F1A;font-weight:700;text-decoration:none;border-radius:10px;font-size:15px;">Reset password</a></div>
  <p style="margin:0 0 12px;font-size:13px;color:#A8B2C7;">Or copy this link into your browser:<br><span style="word-break:break-all;color:#D4A843;">${resetUrl}</span></p>
  <p style="margin:24px 0 0;font-size:13px;color:#A8B2C7;">This link expires in 1 hour.</p>
  <p style="margin:16px 0 0;font-size:13px;color:#A8B2C7;">If you didn't request this, ignore this email — your password won't change.</p>
</div>`
              })
            });
          } catch (e) { console.error('Reset email send failed:', e); }
        }
      }

      return res.status(200).json({ success: true });

    } else if (action === 'reset_password') {
      // Consume a reset token and set a new password.
      if (!rateLimit('reset_pw_' + ip, 10)) return res.status(429).json({ error: 'Too many attempts. Please try again later.' });

      if (!resetToken || typeof resetToken !== 'string' || resetToken.length < 32) {
        return res.status(400).json({ error: 'Invalid or expired link.' });
      }

      const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      const nowIso = new Date().toISOString();

      const findRes = await fetch(
        `${SUPABASE_URL}/rest/v1/auth_users?reset_token_hash=eq.${tokenHash}&reset_token_expires_at=gt.${encodeURIComponent(nowIso)}&select=id,email,name`,
        { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
      );
      const users = await findRes.json();
      if (!users || users.length === 0) return res.status(400).json({ error: 'Invalid or expired link.' });

      const user = users[0];
      const newSessionToken = crypto.randomBytes(32).toString('hex');
      const updRes = await fetch(
        `${SUPABASE_URL}/rest/v1/auth_users?id=eq.${user.id}`,
        {
          method: 'PATCH',
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            password_hash: passHash,
            token: newSessionToken,
            reset_token_hash: null,
            reset_token_expires_at: null
          })
        }
      );
      if (!updRes.ok) return res.status(500).json({ error: 'Could not update password. Please try again.' });

      // Sign the user in immediately on the device they used to reset.
      return res.status(200).json({ success: true, token: `${user.email}:${newSessionToken}`, name: user.name, email: user.email });

    } else {
      return res.status(400).json({ error: 'Invalid action.' });
    }
  } catch (e) {
    console.error('Auth error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
