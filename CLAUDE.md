# CLAUDE.md

This file is the project-level context for Claude Code working on HardAssets.io. Read it fully at the start of every session before taking any action.

## Product

**HardAssets.io** — a portfolio tracking dashboard for hard asset investors. Users track holdings across precious metals, real estate syndications, crypto, private equity, private debt, and collectibles in one place. Installs as a PWA on both Android (manifest.json) and iOS (Add to Home Screen via Safari).

The product is **live and in production**. This is not a greenfield build. Changes should preserve stability and existing user data above all else.

## Customer

Individual investors with macro-thesis-driven portfolios — the kind of people who hold physical gold, participate in real estate syndications, and want a dashboard that handles non-traditional assets mainstream portfolio trackers don't cover.

## Operator

Solo operator (Chaim, founder). No engineering team. All code changes are made via Claude Code working directly on the live GitHub repo.

## Repository

`github.com/justco-cell/hardassets` — the single source of truth. Do not work against local copies or older uploaded file versions. Always pull latest from main before making changes.

## Non-Negotiable Principles

These rules override any technical preference or "cleaner approach" that contradicts them.

1. **Never break existing user data.** Users have real portfolios stored in Supabase. Any schema change must preserve existing rows. Any JSONB structure change must be backward-compatible or include a migration.
2. **Never expose the service_role key to the client.** It bypasses all Row Level Security. It lives in Vercel environment variables and is used only in server-side API routes under `/api/*`. If you see `service_role` anywhere in frontend code, that's a critical bug.
3. **Never log or track portfolio dollar amounts in analytics.** PostHog events track *behavior* (holding_added, tab_viewed, csv_exported) — never values. No "portfolio_worth: $X" events. Ever.
4. **Row Level Security must be on for every table.** No exceptions.
5. **Mobile and desktop both matter.** The app is PWA-installed on phones. Any CSS change must work on both. The responsive CSS lives in a `GLOBAL_CSS` constant injected in both the HomePage and dashboard return statements — do not put responsive CSS inside component-specific JSX.
6. **Test on production domain, not just preview.** Vercel preview URLs sometimes behave differently than `hardassets.io` itself (OAuth, service workers, PWA behavior). Verify changes on the real domain.
7. **Small diffs, not rewrites.** The codebase is stable. Resist the urge to refactor structure while making feature changes. Separate concerns into separate PRs.

## Architecture

### Stack
- **Frontend:** React, single-file components (`hardassets_web.jsx` and `hardassets_app.jsx`). Vite-based build.
- **Hosting:** Vercel (auto-deploys from main branch on push).
- **Backend:** Vercel serverless functions under `/api/*`.
- **Database:** Supabase (Postgres).
- **Auth:** Google OAuth + email/password + guest mode. Custom auth using `auth_users` table (not Supabase Auth).
- **Bot protection:** Cloudflare Turnstile on signup, invisible mode.
- **Analytics:** PostHog (behavioral events, heatmaps, session replays with password fields masked).
- **Domain:** hardassets.io (registered via GoDaddy, DNS points to Vercel).

### Price Data Sources
- **Precious metals:** metals.dev API. Key is hardcoded in the frontend JSX (known tradeoff; the key has limited rate and no write access). If rotating, update in JSX and redeploy.
- **Crypto:** CoinGecko free API, no key required.
- If adding new price sources, prefer free APIs with CORS support. If no CORS, build a `/api/prices/*` proxy route rather than exposing the key in frontend.

### Environment Variables (Vercel)
Required in Vercel Settings → Environment Variables. Never commit values to git.

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- `TURNSTILE_SECRET_KEY`
- Google OAuth credentials (client ID in frontend, secret in env)

### Database Tables (Supabase)

Current known tables:
- `user_data` — portfolio data as JSONB per user. Columns include user_id, email, name, portfolio (JSONB containing metals/syndications/crypto/targets), created_at, updated_at.
- `auth_users` — email/password auth. Columns: id (UUID), email (unique), name, password_hash, created_at. RLS policy: no direct access (all reads/writes via service_role in API routes).

RLS is ON for every table. All writes from the client go through `/api/*` routes with the service_role key server-side. Frontend never writes directly to Supabase.

### PWA Setup
- `public/manifest.json` — Android install metadata.
- `public/sw.js` — service worker (minimal, can be extended for offline support).
- `public/icon-192.png`, `public/icon-512.png` — app icons.
- `<head>` contains apple-mobile-web-app meta tags so iOS Safari "Add to Home Screen" works.
- Service worker registered in a `<script>` tag before `</body>` in index.html.

## Coding Patterns to Preserve

### The GLOBAL_CSS pattern
Responsive CSS is defined once at the top of the JSX file as `const GLOBAL_CSS = \`...\``. It is injected via `<style>{GLOBAL_CSS}</style>` inside BOTH the HomePage return and the dashboard return. This is deliberate — if you put mobile CSS only inside HomePage, the dashboard loses mobile styling when HomePage unmounts on navigation. That bug has been fixed; do not reintroduce it.

### The dual-file pattern
`hardassets_web.jsx` and `hardassets_app.jsx` are the two entry components. They share most logic but differ in presentation. When adding features, update both unless the feature is intentionally web-only or app-only.

### PostHog tracking naming
Event names use snake_case verbs: `user_logged_in`, `holding_added`, `tab_viewed`, `csv_imported`, `deal_analyzed`, etc. Properties are lowercase. Never include dollar amounts.

### Vercel serverless API routes
Under `/api/`. Each route is a standalone function. Import Supabase client with the service_role key from env vars. Validate inputs. Return JSON.

## Session Workflow

When starting a Claude Code session:

1. Read this file fully.
2. `git pull origin main` to make sure you're working on the latest code. The repo is the source of truth, not uploaded files.
3. State the goal in one sentence.
4. Make the smallest change that accomplishes the goal.
5. Verify the change doesn't break mobile or desktop views.
6. If touching analytics, double-check no dollar amounts are being tracked.
7. If touching auth or database, double-check RLS is still enforced.
8. Commit with a clear message. Push. Vercel auto-deploys.
9. After deploy, verify on `hardassets.io` (not just preview URL).
10. Update this file if an architectural decision changes.

## What NOT to Build (Without Operator Confirmation)

- Paid/subscription tiers. Current monetization is affiliate links and IRA lead generation.
- Native mobile apps (iOS/Android). PWA is the mobile strategy.
- Migration off Supabase. The DB is stable.
- Migration off Vercel. Hosting is stable.
- Any feature that stores more sensitive data (SSN, bank account numbers, full tax IDs).
- AI/LLM features that send portfolio data to third-party APIs.
- Multi-user sharing / collaboration features.
- Trading execution or brokerage integration.

## Monetization Context (for feature decisions)

The business model is affiliate revenue from precious metals dealers and lead generation for Gold IRA providers. Feature ideas should be evaluated through this lens:

- Features that increase engagement with precious metals tracking = good.
- Features that surface dealer recommendations naturally = good.
- Features that capture user intent around IRA eligibility (age, retirement account holdings) = valuable for lead gen.
- Features that move users away from metals content toward unrelated asset classes = lower priority.

## Known Quirks & Debt

- The metals.dev API key is embedded in the frontend. Acceptable given its limited scope but worth proxying through `/api/prices/metals` eventually.
- Two separate JSX files (`web` and `app`) duplicate logic. Consolidation is tech debt for a future session.
- Service worker is minimal. Offline support could be deepened if users ask for it.
- Supabase Auth was not adopted; custom auth via `auth_users` is what's in production. Don't migrate without a plan for existing users.

## Glossary (domain terms)

- **Hard asset:** physical or scarce asset (gold, silver, real estate, collectibles, crypto) held as an inflation hedge.
- **Syndication:** real estate deal where multiple LP investors pool capital under a sponsor/GP.
- **Cap rate:** net operating income divided by property value; used in the Deal Analyzer.
- **Target allocation:** user's desired % mix across asset classes. Dashboard shows drift vs target.
- **PWA:** Progressive Web App — installable from browser, works offline where the service worker allows.

## Questions to Ask the Operator When Unsure

Stop and confirm rather than guess on:

- Anything that changes the database schema.
- Anything that changes auth flow.
- Anything that changes or adds a third-party SaaS dependency (cost, data sharing).
- Anything touching PostHog event taxonomy (changes break historical analytics).
- Any feature that would appear on the public landing page (affects marketing).
- Any change to the Turnstile bot-protection flow.
- Any change to pricing / monetization surfaces.

## Related Projects

The operator also runs a separate, unrelated cloud product for RefundsManager. That codebase is in a different repo with its own CLAUDE.md. **No code, data, or dependencies are shared between HardAssets.io and the RefundsManager cloud product.** Do not reference one from the other.
