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
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
      if (payload.exp && payload.exp * 1000 < Date.now()) return null;
      if (payload.email) return {
        email: payload.email,
        name: payload.name || null,
        picture: payload.picture || null
      };
    }
  } catch (e) {}
  try {
    if (token.includes(':')) {
      const [email] = token.split(':');
      if (email && email.includes('@') && email.includes('.')) return { email, name: null, picture: null };
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

    if (!checkRate('load_' + user.email, 60)) return res.status(429).json({ error: 'Rate limited' });

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/user_data?user_id=eq.${encodeURIComponent(user.email)}&select=data,name,picture`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const rows = await response.json();
    if (rows && rows.length > 0) {
      return res.status(200).json({
        data: rows[0].data || null,
        name: rows[0].name || user.name,
        picture: rows[0].picture || user.picture,
        email: user.email
      });
    }
    return res.status(200).json({ data: null, name: user.name, picture: user.picture, email: user.email });
  } catch (e) {
    console.error('Load error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
