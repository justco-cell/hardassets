export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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

function verifyToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
      if (payload.email) return { email: payload.email, name: payload.name || payload.email };
    }
  } catch (e) {}
  try {
    if (token.includes(':')) {
      const [email] = token.split(':');
      if (email && email.includes('@')) return { email };
    }
  } catch (e) {}
  return null;
}
