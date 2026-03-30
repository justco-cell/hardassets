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
      if (payload.email) return { email: payload.email };
    }
  } catch (e) {}
  try {
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

    const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    if (!checkRate('delete_' + ip, 3)) return res.status(429).json({ error: 'Too many attempts' });

    const { confirmation } = req.body;
    if (confirmation !== 'DELETE') return res.status(400).json({ error: 'Invalid confirmation' });

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const email = encodeURIComponent(user.email);

    // Delete from all tables
    const tables = ['user_data', 'auth_users', 'user_activity_log', 'portfolio_snapshots', 'contact_messages'];
    const results = [];

    for (const table of tables) {
      try {
        const col = table === 'contact_messages' ? 'email' : 'user_id';
        const colVal = table === 'auth_users' ? 'email' : col;
        const r = await fetch(
          `${SUPABASE_URL}/rest/v1/${table}?${colVal}=eq.${email}`,
          {
            method: 'DELETE',
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        results.push({ table, status: r.ok ? 'deleted' : 'error' });
      } catch (e) {
        results.push({ table, status: 'error' });
      }
    }

    return res.status(200).json({ success: true, message: 'Account permanently deleted', results });
  } catch (e) {
    console.error('Delete account error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
