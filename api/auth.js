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
  res.setHeader('Access-Control-Allow-Origin', 'https://hardassets.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, email, password, name, _ts, turnstileToken, hp } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';

  // Honeypot — bots fill hidden fields, silently reject
  if (hp) return res.status(200).json({ success: true, token: 'ok' });

  // Time check — form submitted under 2 seconds = bot
  if (_ts && (Date.now() - _ts) < 2000) return res.status(400).json({ error: 'Please try again.' });

  // Email format
  const atIdx = email.indexOf('@');
  if (atIdx < 1 || !email.includes('.', atIdx) || email.length < 5) return res.status(400).json({ error: 'Invalid email address.' });

  // Password minimum 8 characters (server-side enforcement)
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // TODO: Upgrade to bcrypt/argon2 for production
  const passHash = crypto.createHash('sha256').update(password + 'hardassets_salt_2026').digest('hex');

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

    } else {
      return res.status(400).json({ error: 'Invalid action.' });
    }
  } catch (e) {
    console.error('Auth error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
