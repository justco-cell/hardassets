const rateLimit = {};
function checkRate(key, max) {
  const now = Date.now();
  if (!rateLimit[key]) rateLimit[key] = [];
  rateLimit[key] = rateLimit[key].filter(t => now - t < 60000);
  if (rateLimit[key].length >= max) return false;
  rateLimit[key].push(now);
  return true;
}

function verifyToken(token) {
  try {
    // Google JWT (3-part token)
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
      // Check expiration
      if (payload.exp && payload.exp * 1000 < Date.now()) return null;
      if (payload.email) return { email: payload.email, name: payload.name || payload.email };
    }
  } catch (e) {}
  try {
    // Email:token format from our auth.js
    if (token.includes(':')) {
      const [email] = token.split(':');
      if (email && email.includes('@') && email.includes('.')) return { email };
    }
  } catch (e) {}
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://hardassets.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No auth token' });

    const token = authHeader.replace('Bearer ', '');
    const user = verifyToken(token);
    if (!user || !user.email) return res.status(401).json({ error: 'Invalid token' });

    if (!checkRate('save_' + user.email, 30)) return res.status(429).json({ error: 'Rate limited' });

    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'No data' });

    // Reject oversized payloads
    const size = JSON.stringify(data).length;
    if (size > 1048576) return res.status(413).json({ error: 'Payload too large' });

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/user_data?on_conflict=user_id`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify({
          user_id: user.email,
          email: user.email,
          data: data,
          updated_at: new Date().toISOString()
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Supabase save error:', response.status, err);
      return res.status(500).json({ error: 'Save failed' });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('Save error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
