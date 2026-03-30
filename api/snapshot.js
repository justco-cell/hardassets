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
      if (payload.email) return { email: payload.email, name: payload.name || null };
    }
  } catch (e) {}
  try {
    if (token.includes(':')) {
      const [email] = token.split(':');
      if (email && email.includes('@') && email.includes('.')) return { email, name: null };
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
      if (!checkRate('snap_' + user.email, 10)) return res.status(429).json({ error: 'Rate limited' });

      const { total_value, metals_value, re_value, crypto_value, properties_value, notes_value, collectibles_value, cash_value, income_annual, risk_avg } = req.body;

      // Only save one snapshot per day per user
      const today = new Date().toISOString().split('T')[0];
      const checkRes = await fetch(
        `${SUPABASE_URL}/rest/v1/portfolio_snapshots?user_id=eq.${encodeURIComponent(user.email)}&snapshot_date=eq.${today}&select=id`,
        { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
      );
      const existing = await checkRes.json();

      if (existing && existing.length > 0) {
        // Update today's snapshot
        await fetch(
          `${SUPABASE_URL}/rest/v1/portfolio_snapshots?user_id=eq.${encodeURIComponent(user.email)}&snapshot_date=eq.${today}`,
          {
            method: 'PATCH',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
            body: JSON.stringify({ total_value, metals_value, re_value, crypto_value, properties_value, notes_value, collectibles_value, cash_value, income_annual, risk_avg, updated_at: new Date().toISOString() })
          }
        );
      } else {
        // Insert new snapshot
        await fetch(
          `${SUPABASE_URL}/rest/v1/portfolio_snapshots`,
          {
            method: 'POST',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
            body: JSON.stringify({ user_id: user.email, snapshot_date: today, total_value, metals_value, re_value, crypto_value, properties_value, notes_value, collectibles_value, cash_value, income_annual, risk_avg, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          }
        );
      }

      return res.status(200).json({ success: true });
    }

    if (req.method === 'GET') {
      if (!checkRate('snap_get_' + user.email, 30)) return res.status(429).json({ error: 'Rate limited' });

      const days = req.query.days || 365;
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/portfolio_snapshots?user_id=eq.${encodeURIComponent(user.email)}&order=snapshot_date.asc&limit=${days}`,
        { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' } }
      );
      const snapshots = await response.json();
      return res.status(200).json({ snapshots: snapshots || [] });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('Snapshot error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
