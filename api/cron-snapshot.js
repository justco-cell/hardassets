export default async function handler(req, res) {
  // Verify this is called by Vercel Cron (check authorization header)
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const METALS_KEY = process.env.METALS_API_KEY;

  try {
    // Get all users who logged in within the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const usersRes = await fetch(
      `${SUPABASE_URL}/rest/v1/user_data?last_login=gte.${thirtyDaysAgo}&select=user_id,data`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );
    const users = await usersRes.json();
    if (!users || !Array.isArray(users)) return res.status(200).json({ processed: 0 });

    // Fetch current prices once
    let metalPrices = { gold: 0, silver: 0, platinum: 0, palladium: 0 };
    try {
      const mr = await fetch(`https://api.metals.dev/v1/latest?api_key=${METALS_KEY}&currency=USD&unit=toz`);
      if (mr.ok) { const md = await mr.json(); if (md.metals) metalPrices = md.metals; }
    } catch (e) {}

    let cryptoPrices = {};
    try {
      const cr = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
      if (cr.ok) { const cd = await cr.json(); cryptoPrices = { BTC: cd.bitcoin?.usd || 0, ETH: cd.ethereum?.usd || 0, SOL: cd.solana?.usd || 0 }; }
    } catch (e) {}

    const ozMap = { "1 oz": 1, "1/2 oz": 0.5, "1/4 oz": 0.25, "1/10 oz": 0.1, "1 kg": 32.151, "10 oz": 10, "100 oz": 100, "Gram": 0.03215 };
    const spotMap = { Gold: metalPrices.gold, Silver: metalPrices.silver, Platinum: metalPrices.platinum, Palladium: metalPrices.palladium };

    const today = new Date().toISOString().split('T')[0];
    let processed = 0;

    for (const u of users.slice(0, 100)) { // Max 100 users per cron run
      if (!u.data) continue;
      const d = typeof u.data === 'string' ? JSON.parse(u.data) : u.data;

      const metals_value = (d.metals || []).reduce((s, m) => s + m.qty * (ozMap[m.unit] || 1) * (spotMap[m.metal] || m.spot || 0), 0);
      const re_value = (d.syndications || []).reduce((s, x) => s + (x.invested || 0), 0);
      const crypto_value = (d.crypto || []).reduce((s, c) => s + c.qty * (cryptoPrices[c.coin] || c.price || 0), 0);
      const properties_value = (d.properties || []).reduce((s, p) => s + ((p.currentValue || 0) - (p.mortgageBalance || 0)), 0);
      const notes_value = (d.notesLending || []).reduce((s, n) => s + (n.outstandingBalance || 0), 0);
      const collectibles_value = (d.collectibles || []).reduce((s, c) => s + (c.currentValue || 0), 0);
      const total_value = metals_value + re_value + crypto_value + properties_value + notes_value + collectibles_value;

      const income_annual = (d.syndications || []).reduce((s, x) => s + x.invested * (x.expectedRate || 0) / 100, 0)
        + (d.properties || []).reduce((s, p) => s + ((p.monthlyRent || 0) - (p.monthlyExpenses || 0) - (p.mortgagePayment || 0)) * 12, 0)
        + (d.notesLending || []).reduce((s, n) => s + (n.outstandingBalance || 0) * (n.interestRate || 0) / 100, 0);

      // Upsert snapshot
      await fetch(`${SUPABASE_URL}/rest/v1/portfolio_snapshots?on_conflict=user_id,snapshot_date`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ user_id: u.user_id, snapshot_date: today, total_value, metals_value, re_value, crypto_value, properties_value, notes_value, collectibles_value, income_annual, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      });
      processed++;
    }

    return res.status(200).json({ success: true, processed, date: today });
  } catch (e) {
    console.error('Cron snapshot error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
