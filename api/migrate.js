// ONE-TIME migration route — DELETE THIS FILE after running it once
export default async function handler(req, res) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) return res.status(500).json({ error: 'Missing env vars' });

  const migrations = [
    "ALTER TABLE user_data ADD COLUMN IF NOT EXISTS name TEXT",
    "ALTER TABLE user_data ADD COLUMN IF NOT EXISTS picture TEXT",
    "ALTER TABLE user_data ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ",
    "ALTER TABLE user_data ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0",
    "ALTER TABLE user_data ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'google'",
    "ALTER TABLE user_activity_log ADD COLUMN IF NOT EXISTS user_name TEXT"
  ];

  const results = [];
  for (const sql of migrations) {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      // Supabase REST doesn't support raw SQL via rpc without a function
      // Use the SQL Editor approach instead — run via pg_net or direct SQL
      results.push({ sql, note: 'Run manually in Supabase SQL Editor' });
    } catch (e) {
      results.push({ sql, error: e.message });
    }
  }

  return res.status(200).json({
    message: 'Run these SQL statements in Supabase SQL Editor (Dashboard > SQL Editor > New Query):',
    sql: migrations.join(';\n') + ';',
    results
  });
}
