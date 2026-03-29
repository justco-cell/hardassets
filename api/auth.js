import crypto from 'crypto';

// Simple in-memory rate limiter (resets on cold start, good enough for serverless)
const attempts = {};
function rateLimit(ip, limit = 5, windowMs = 60000) {
  const now = Date.now();
  if (!attempts[ip]) attempts[ip] = [];
  attempts[ip] = attempts[ip].filter(t => now - t < windowMs);
  if (attempts[ip].length >= limit) return false;
  attempts[ip].push(now);
  return true;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, email, password, name, _ts } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  // Bot check 1: Rate limit — max 5 attempts per minute per IP
  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  if (!rateLimit(ip)) return res.status(429).json({ error: 'Too many attempts. Try again in a minute.' });

  // Bot check 2: Time check — form loaded less than 2 seconds ago = bot
  if (_ts && (Date.now() - _ts) < 2000) return res.status(400).json({ error: 'Please try again.' });

  // Bot check 3: Email format
  if (!email.includes('@') || !email.includes('.') || email.length < 5) return res.status(400).json({ error: 'Invalid email address.' });

  // Bot check 4: Password minimum length
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  // Bot check 5: Block disposable email domains
  const disposable = ['mailinator.com','tempmail.com','throwaway.email','guerrillamail.com','yopmail.com','10minutemail.com','trashmail.com','fakeinbox.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  if (disposable.includes(domain)) return res.status(400).json({ error: 'Please use a real email address.' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const passHash = crypto.createHash('sha256').update(password + 'hardassets_salt_2026').digest('hex');

  try {
    if (action === 'signup') {
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
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password_hash: passHash, name: name || email.split('@')[0], token })
        }
      );
      if (!createRes.ok) {
        return res.status(500).json({ error: 'Failed to create account' });
      }
      return res.status(200).json({ token: `${email}:${token}`, name: name || email.split('@')[0], email });

    } else if (action === 'login') {
      // Find user
      const findRes = await fetch(
        `${SUPABASE_URL}/rest/v1/auth_users?email=eq.${encodeURIComponent(email)}&select=*`,
        { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
      );
      const users = await findRes.json();
      if (!users || users.length === 0) {
        return res.status(401).json({ error: 'No account found. Sign up first.' });
      }
      const user = users[0];
      if (user.password_hash !== passHash) {
        return res.status(401).json({ error: 'Invalid password.' });
      }
      // Generate new session token
      const token = crypto.randomBytes(32).toString('hex');
      await fetch(
        `${SUPABASE_URL}/rest/v1/auth_users?email=eq.${encodeURIComponent(email)}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token })
        }
      );
      return res.status(200).json({ token: `${email}:${token}`, name: user.name, email });

    } else {
      return res.status(400).json({ error: 'Invalid action. Use signup or login.' });
    }
  } catch (e) {
    console.error('Auth error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
