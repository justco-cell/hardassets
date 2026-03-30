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
      if (payload.email) return { email: payload.email, name: payload.name || null, picture: payload.picture || null };
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No auth token' });

    const token = authHeader.replace('Bearer ', '');
    const user = verifyToken(token);
    if (!user || !user.email) return res.status(401).json({ error: 'Invalid token' });

    if (req.method === 'POST') {
      if (!checkRate('log_post_' + user.email, 30)) return res.status(429).json({ error: 'Rate limited' });

      const { action, asset_type, asset_id, asset_name, old_data, new_data } = req.body;
      if (!action || !asset_type) return res.status(400).json({ error: 'Missing fields' });

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/user_activity_log`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            user_id: user.email,
            user_name: user.name || user.email,
            action,
            asset_type,
            asset_id: asset_id || null,
            asset_name: asset_name || null,
            old_data: old_data || null,
            new_data: new_data || null,
            timestamp: new Date().toISOString()
          })
        }
      );

      if (!response.ok) {
        const err = await response.text();
        console.error('Supabase log error:', response.status, err);
        return res.status(500).json({ error: 'Log failed' });
      }

      return res.status(200).json({ success: true });
    }

    if (req.method === 'GET') {
      if (!checkRate('log_get_' + user.email, 60)) return res.status(429).json({ error: 'Rate limited' });

      const limit = req.query.limit || 200;
      const offset = req.query.offset || 0;
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/user_activity_log?user_id=eq.${encodeURIComponent(user.email)}&order=timestamp.desc&limit=${limit}&offset=${offset}`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const err = await response.text();
        console.error('Supabase log read error:', response.status, err);
        return res.status(500).json({ error: 'Failed to fetch logs' });
      }

      const logs = await response.json();
      return res.status(200).json({ logs });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('Log error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
