// Server-side proxy for metals.dev API — keeps API key private
// Returns current prices + 24h change calculated from yesterday's close
const rateLimit = {};
function checkRate(key, max) {
  const now = Date.now();
  if (!rateLimit[key]) rateLimit[key] = [];
  rateLimit[key] = rateLimit[key].filter(t => now - t < 60000);
  if (rateLimit[key].length >= max) return false;
  rateLimit[key].push(now);
  return true;
}

// Cache yesterday's prices to avoid extra API calls
let yesterdayCache = { prices: null, date: null };

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

    // Fetch current prices
    const r = await fetch(`https://api.metals.dev/v1/latest?api_key=${key}&currency=USD&unit=toz`);
    if (!r.ok) return res.status(502).json({ error: 'Upstream error' });
    const d = await r.json();

    // Fetch yesterday's prices for 24h change calculation
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let changes = {};
    if (d.metals) {
      // Check cache first
      if (yesterdayCache.date === yesterday && yesterdayCache.prices) {
        const yp = yesterdayCache.prices;
        for (const metal of ['gold', 'silver', 'platinum', 'palladium']) {
          if (d.metals[metal] && yp[metal] && yp[metal] > 0) {
            changes[metal] = ((d.metals[metal] - yp[metal]) / yp[metal]) * 100;
          }
        }
      } else {
        // Fetch yesterday's close from metals.dev historical endpoint
        try {
          const hr = await fetch(`https://api.metals.dev/v1/historical?api_key=${key}&date=${yesterday}&currency=USD&unit=toz`);
          if (hr.ok) {
            const hd = await hr.json();
            if (hd.metals) {
              yesterdayCache = { prices: hd.metals, date: yesterday };
              for (const metal of ['gold', 'silver', 'platinum', 'palladium']) {
                if (d.metals[metal] && hd.metals[metal] && hd.metals[metal] > 0) {
                  changes[metal] = ((d.metals[metal] - hd.metals[metal]) / hd.metals[metal]) * 100;
                }
              }
            }
          }
        } catch (e) {
          // Historical fetch failed — changes stay empty, that's ok
        }
      }
    }

    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(200).json({ ...d, changes });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
}
