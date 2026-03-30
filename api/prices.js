// Server-side proxy for metals.dev API — keeps API key private
const rateLimit = {};
function checkRate(key, max) {
  const now = Date.now();
  if (!rateLimit[key]) rateLimit[key] = [];
  rateLimit[key] = rateLimit[key].filter(t => now - t < 60000);
  if (rateLimit[key].length >= max) return false;
  rateLimit[key].push(now);
  return true;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://hardassets.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  if (!checkRate('prices_' + ip, 30)) return res.status(429).json({ error: 'Rate limited' });

  try {
    const key = process.env.METALS_API_KEY;
    if (!key) return res.status(500).json({ error: 'API key not configured' });

    const r = await fetch(`https://api.metals.dev/v1/latest?api_key=${key}&currency=USD&unit=toz`);
    if (!r.ok) return res.status(502).json({ error: 'Upstream error' });
    const d = await r.json();

    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(200).json(d);
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
}
