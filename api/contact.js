export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'All fields required' });

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Store in Supabase contact_messages table
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/contact_messages`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          name,
          email,
          message,
          created_at: new Date().toISOString()
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Supabase contact error:', response.status, err);
      // Don't fail — still return success so user isn't stuck
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('Contact error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
