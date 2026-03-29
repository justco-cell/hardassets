// Blog post data — add new posts here
// Content is HTML strings for zero-dependency rendering
export const POSTS = [
  {
    slug: "why-track-hard-assets-separately",
    title: "Why You Should Track Hard Assets Separately from Your Brokerage",
    date: "2026-03-29",
    excerpt: "Brokerage apps show stocks and ETFs, but they can't track the gold in your safe, the syndication LP you wired into, or the private note paying you 10%. Here's why a dedicated hard asset tracker matters.",
    metaDescription: "Brokerage apps miss physical gold, RE syndications, and private notes. Learn why serious investors need a dedicated hard asset portfolio tracker like HardAssets.io.",
    thumbnail: "/blog-hard-assets.svg",
    heroImage: "/blog-hard-assets.svg",
    content: `
      <p>If you're reading this, you probably own assets that don't show up in your Schwab, Fidelity, or Vanguard account. Physical gold coins in a safe. A $75,000 LP position in a multifamily syndication. A private note earning 10% secured by real estate. Maybe some Bitcoin in cold storage.</p>

      <p>These are <strong>hard assets</strong> — tangible, alternative investments that hold intrinsic value. And they're completely invisible to traditional portfolio trackers.</p>

      <h2>The Problem with Brokerage Apps</h2>

      <p>Brokerage platforms are designed for publicly traded securities. They're great at showing your stock positions, mutual fund balances, and ETF allocations. But they have zero concept of:</p>

      <ul>
        <li><strong>Physical precious metals</strong> — your 10 oz of gold coins aren't in any brokerage</li>
        <li><strong>Real estate syndication LPs</strong> — that $150K position in a multifamily deal with an 8% preferred return</li>
        <li><strong>Private notes and hard money loans</strong> — the 12% note secured by a property in Austin</li>
        <li><strong>Collectibles</strong> — the Rolex Daytona appreciating at 8% annually</li>
        <li><strong>Self-custody crypto</strong> — Bitcoin and ETH in your hardware wallet</li>
      </ul>

      <p>This means your "net worth" in any brokerage app is dramatically incomplete. And if you can't see your full picture, you can't make informed allocation decisions.</p>

      <h2>Why Allocation Visibility Matters</h2>

      <p>Most financial advisors recommend diversification across asset classes. But how do you know if you're 40% in real estate or 15% in precious metals if half your portfolio is tracked in spreadsheets and the other half in your head?</p>

      <p>A dedicated hard asset tracker like <strong>HardAssets.io</strong> lets you see your complete allocation across every asset class — with live spot prices for metals and crypto, risk scoring, and target allocation comparison.</p>

      <h2>What to Look For in a Hard Asset Tracker</h2>

      <p>Not all portfolio trackers are created equal. For hard asset investors, you need:</p>

      <ol>
        <li><strong>Oz-per-unit conversion</strong> — a 100oz silver bar isn't the same as a 1oz coin. Your tracker should know the difference.</li>
        <li><strong>Live spot prices</strong> — gold at $3,000/oz changes your portfolio value daily. Manual updates don't cut it.</li>
        <li><strong>Syndication tracking</strong> — preferred rate, projected IRR, sponsor tracking, and deal type classification.</li>
        <li><strong>Risk scoring</strong> — not all assets carry the same risk. A T-bill is not the same as a crypto position.</li>
        <li><strong>CSV import/export</strong> — you shouldn't have to re-enter 50 positions by hand.</li>
        <li><strong>Cloud sync</strong> — your data should be accessible from any device, securely.</li>
      </ol>

      <p>HardAssets.io was built specifically for this use case. It tracks precious metals (with live prices from metals.dev), real estate syndications, crypto (with live CoinGecko prices), physical properties, private notes, and collectibles — all in one dashboard.</p>

      <h2>The Bottom Line</h2>

      <p>If you own hard assets, you need a tracker built for hard assets. Your brokerage app was never designed to show the full picture. A purpose-built dashboard gives you the allocation visibility, risk awareness, and income tracking you need to make better investment decisions.</p>
    `
  },
  {
    slug: "gold-silver-ratio-what-it-means",
    title: "The Gold/Silver Ratio: What It Means and How Investors Use It",
    date: "2026-03-28",
    excerpt: "The gold/silver ratio has been used for centuries to gauge relative value between the two metals. Here's how to read it, what historical levels tell us, and how to use it in your stacking strategy.",
    metaDescription: "Learn what the gold/silver ratio means, historical ranges, and how precious metals investors use it to decide when to buy gold vs silver. Free tracking at HardAssets.io.",
    thumbnail: "/blog-gold-silver.svg",
    heroImage: "/blog-gold-silver.svg",
    content: `
      <p>The gold/silver ratio is one of the oldest and most-watched metrics in precious metals investing. It tells you how many ounces of silver it takes to buy one ounce of gold at current spot prices.</p>

      <p>For example, if gold is $3,000/oz and silver is $30/oz, the ratio is 100:1 — meaning it takes 100 ounces of silver to buy one ounce of gold.</p>

      <h2>Why the Ratio Matters</h2>

      <p>The gold/silver ratio helps investors gauge which metal is relatively cheap or expensive compared to the other. A high ratio (above 80) historically suggests silver is undervalued relative to gold. A low ratio (below 50) suggests gold is relatively cheaper.</p>

      <h2>Historical Context</h2>

      <ul>
        <li><strong>Ancient Rome:</strong> The ratio was fixed at 12:1 by law</li>
        <li><strong>US Coinage Act of 1792:</strong> Set at 15:1</li>
        <li><strong>20th century average:</strong> Around 50-60:1</li>
        <li><strong>2011 (silver spike):</strong> Dropped to 32:1</li>
        <li><strong>March 2020 (COVID crash):</strong> Spiked to 125:1</li>
        <li><strong>2024-2026 range:</strong> Hovering around 85-100:1</li>
      </ul>

      <h2>How Stackers Use the Ratio</h2>

      <p>Many precious metals investors use the ratio as a guide for when to swap between metals or adjust their buying:</p>

      <ol>
        <li><strong>High ratio (90+):</strong> Favor buying silver — it's historically cheap relative to gold</li>
        <li><strong>Low ratio (below 50):</strong> Favor buying gold — silver has likely run up</li>
        <li><strong>Ratio trading:</strong> Some investors swap gold for silver at high ratios, then swap back when the ratio contracts, effectively increasing their total ounces over time</li>
      </ol>

      <h2>Track It Live</h2>

      <p>The <strong>HardAssets.io Markets tab</strong> shows the live gold/silver ratio alongside real-time spot prices for gold, silver, platinum, and palladium. You can monitor the ratio daily and track your physical holdings with automatic oz-per-unit conversion.</p>

      <p>Whether you're a long-term stacker or an active ratio trader, having live data at your fingertips helps you make better decisions about when and what to buy.</p>
    `
  },
  {
    slug: "what-is-real-estate-syndication",
    title: "Real Estate Syndications Explained: A Guide for LP Investors",
    date: "2026-03-27",
    excerpt: "Real estate syndications let you invest passively in large deals alongside experienced operators. Here's how they work, what to look for, and how to track your LP positions effectively.",
    metaDescription: "Learn how real estate syndications work for passive LP investors. Understand preferred returns, projected IRR, sponsor vetting, and how to track syndication investments with HardAssets.io.",
    thumbnail: "/blog-syndication.svg",
    heroImage: "/blog-syndication.svg",
    content: `
      <p>A real estate syndication is a partnership where a sponsor (also called a general partner or GP) pools capital from multiple investors (limited partners or LPs) to acquire, manage, and eventually sell a property — typically a commercial asset like a multifamily apartment complex, self-storage facility, or industrial warehouse.</p>

      <h2>How Syndications Work</h2>

      <p>The basic structure is straightforward:</p>

      <ol>
        <li><strong>The sponsor finds a deal</strong> — they identify a property, negotiate the purchase, and create a business plan (value-add renovations, rent increases, operational improvements)</li>
        <li><strong>LPs invest capital</strong> — typically $25K-$100K+ minimums, though some deals go as low as $10K</li>
        <li><strong>The sponsor operates the property</strong> — managing renovations, tenant relations, and financial performance</li>
        <li><strong>Cash flow distributions</strong> — LPs receive quarterly or monthly distributions, often at a preferred rate (6-10% annualized)</li>
        <li><strong>Exit event</strong> — the property is sold or refinanced, and LPs receive their capital back plus a share of the profits</li>
      </ol>

      <h2>Key Terms Every LP Should Know</h2>

      <ul>
        <li><strong>Preferred Return (Pref):</strong> The minimum annual return LPs receive before the sponsor takes any profit split. Common range: 6-10%.</li>
        <li><strong>Projected IRR:</strong> The estimated total annualized return including cash flow and appreciation. Typical targets: 13-20%.</li>
        <li><strong>Hold Period:</strong> How long the sponsor plans to hold the property. Typically 3-7 years.</li>
        <li><strong>Equity Multiple:</strong> Total return as a multiple of your investment. A 2x multiple on $50K means you get back $100K total.</li>
        <li><strong>Cap Rate:</strong> Net operating income divided by property value. A key metric for valuation.</li>
      </ul>

      <h2>Tracking Your Syndication Portfolio</h2>

      <p>One of the biggest challenges for LP investors is tracking multiple syndication positions across different sponsors, deal types, and timelines. Spreadsheets get messy fast when you have 5-10+ positions.</p>

      <p><strong>HardAssets.io</strong> was built with a dedicated Syndications tab that tracks:</p>

      <ul>
        <li>Deal name, sponsor, and strategy type (16 categories)</li>
        <li>Capital invested and preferred rate</li>
        <li>Projected IRR and hold period</li>
        <li>Location (state/country)</li>
        <li>Status (Active, Pending, Exited, Default)</li>
        <li>Risk scoring and notes</li>
        <li>Annual income calculation (invested × rate)</li>
        <li>CSV import for bulk entry</li>
      </ul>

      <p>If you're building a portfolio of syndication LP positions, having all your deals in one place — alongside your metals, crypto, and other hard assets — gives you the complete allocation picture you need.</p>
    `
  }
];

export function getPost(slug) {
  return POSTS.find(p => p.slug === slug) || null;
}

export function getAllSlugs() {
  return POSTS.map(p => p.slug);
}
