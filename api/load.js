export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No auth token' });

    const token = authHeader.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user || !user.email) return res.status(401).json({ error: 'Invalid token' });

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/user_data?user_id=eq.${encodeURIComponent(user.email)}&select=data`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const rows = await response.json();
    if (rows && rows.length > 0 && rows[0].data) {
      return res.status(200).json({ data: rows[0].data });
    }
    return res.status(200).json({ data: null });
  } catch (e) {
    console.error('Load error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function verifyToken(token) {
  // Try Google ID token first
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const gRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
      if (gRes.ok) {
        const data = await gRes.json();
        if (data.email) return { email: data.email, name: data.name || data.email };
      }
    }
  } catch (e) {}

  // Try as app token (email:hash format)
  try {
    if (token.includes(':')) {
      const [email] = token.split(':');
      if (email && email.includes('@')) return { email };
    }
  } catch (e) {}

  return null;
}
