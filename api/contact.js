export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'All fields required' });

    // Send email via FormSubmit.co (free, no API key needed)
    const emailRes = await fetch('https://formsubmit.co/ajax/support@hardassets.io', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        message,
        _subject: `HardAssets.io Contact: ${name}`,
        _template: 'table'
      })
    });

    if (!emailRes.ok) {
      console.error('FormSubmit error:', await emailRes.text());
    }

    // Also store in Supabase as backup
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (SUPABASE_URL && SUPABASE_KEY) {
      await fetch(`${SUPABASE_URL}/rest/v1/contact_messages`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ name, email, message, created_at: new Date().toISOString() })
      }).catch(() => {});
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('Contact error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
