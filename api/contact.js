export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'All fields required' });

    let emailSent = false;

    // Method 1: Try Resend if API key exists
    const RESEND_KEY = process.env.RESEND_API_KEY;
    if (RESEND_KEY) {
      try {
        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'HardAssets.io <noreply@hardassets.io>',
            to: 'support@hardassets.io',
            subject: `Contact Form: ${name}`,
            html: `<h3>New Contact Form Submission</h3><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p><hr><p style="color:#888;font-size:12px">Sent from hardassets.io contact form</p>`
          })
        });
        if (r.ok) emailSent = true;
        else console.error('Resend error:', await r.text());
      } catch (e) { console.error('Resend failed:', e); }
    }

    // Method 2: Try SMTP env vars (GoDaddy/any SMTP)
    if (!emailSent && process.env.SMTP_HOST) {
      // Nodemailer not available in Vercel serverless by default
      // Skip — would need to add as dependency
    }

    // Method 3: Store in Supabase (always works as backup)
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/contact_messages`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            name, email, message,
            email_sent: emailSent,
            created_at: new Date().toISOString()
          })
        });
      } catch (e) { console.error('Supabase store failed:', e); }
    }

    return res.status(200).json({ success: true, emailSent });
  } catch (e) {
    console.error('Contact error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
