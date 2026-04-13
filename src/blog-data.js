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
  },
  {
    slug: "how-much-gold-should-you-own",
    title: "How Much Gold Should You Own? A Portfolio Allocation Guide for 2026",
    date: "2026-04-12",
    excerpt: "Gold hit $5,595/oz in January 2026. Central banks bought 1,100+ tonnes for the third straight year. The question isn't whether to own gold — it's how much of your portfolio should be in it.",
    metaDescription: "How much gold should you own? Expert-backed allocation data for 2026 — from 5% starter to 25% conviction portfolios. Free tracking dashboard included.",
    thumbnail: "/blog-gold-allocation.svg",
    heroImage: "/blog-gold-allocation.svg",
    content: `
      <p><strong>How much gold should I own in my portfolio?</strong> It's the question every hard asset investor asks — and the answer has changed dramatically. Gold hit $5,595/oz in January 2026, up 65% in 2025 alone. Central banks bought over 1,100 tonnes for the third consecutive year. The dollar's purchasing power continues to erode. The question isn't <em>whether</em> to own gold — it's <em>how much</em>.</p>

      <p>This guide breaks down gold portfolio allocation percentage recommendations backed by data, historical portfolio models, and practical frameworks for different risk profiles. Whether you're a first-time buyer or a seasoned stacker, you'll walk away knowing exactly how much of your savings should be in gold.</p>

      <h2>What the Data Says: Historical Gold Allocations</h2>

      <p>The ideal gold allocation isn't a mystery — several well-known portfolio models have been tested over decades:</p>

      <p><strong>Ray Dalio's All-Weather Portfolio: 7.5% gold.</strong> Designed to perform in any economic environment — inflation, deflation, rising growth, falling growth. The 7.5% gold allocation acts as an inflation hedge and crisis buffer. This portfolio returned ~7.5% annualized over 30 years with significantly lower drawdowns than a 60/40 stock/bond mix.</p>

      <p><strong>Harry Browne's Permanent Portfolio: 25% gold.</strong> Equal parts stocks, long-term bonds, cash, and gold. The gold quarter isn't just a hedge — it's a core engine of the portfolio. Since 1972, this model returned ~8.5% annualized with a maximum drawdown under 13%. The 25% gold investment portfolio allocation is the most aggressive mainstream recommendation.</p>

      <p><strong>Typical financial advisor recommendation: 5-10%.</strong> Most traditional advisors suggest a modest gold allocation as "portfolio insurance." This is the floor, not the ceiling. It's enough to provide some protection but not enough to meaningfully benefit from a gold bull market.</p>

      <p><strong>Academic research: 10-20% is the sweet spot.</strong> Multiple peer-reviewed studies — including research from the World Gold Council — show that portfolios with 10-20% allocated to gold had better risk-adjusted returns (higher Sharpe ratios) over 20-year periods compared to portfolios with no gold or only 5%. The gold portfolio allocation percentage that optimizes for both return and reduced volatility consistently lands in this range.</p>

      <h2>How Much Gold Should I Own Based on My Risk Profile?</h2>

      <p>Most financial experts recommend allocating 5-15% of your portfolio to gold, though investors with strong conviction in the dollar debasement thesis may allocate up to 25%. The right percentage depends on your risk tolerance, investment timeline, and existing diversification across other hard assets like silver, real estate, and crypto.</p>

      <p>Here are three practical tiers:</p>

      <h3>Conservative: 5-10% Gold Allocation</h3>

      <p><strong>Best for:</strong> Investors who already have a diversified stock/bond portfolio and want basic inflation protection.</p>

      <p>At 5-10%, gold acts as portfolio insurance. You won't capture massive upside in a gold bull run, but you'll reduce overall portfolio volatility and have a crisis hedge. This is the "set it and forget it" tier — buy some gold coins or a gold ETF and rebalance annually.</p>

      <p>A 5-10% gold investment portfolio allocation is appropriate if you're primarily invested in equities, have a long time horizon (20+ years), and view gold as a defensive position rather than a growth driver.</p>

      <h3>Moderate: 10-15% Gold Allocation</h3>

      <p><strong>Best for:</strong> Investors who believe we're in a sustained precious metals bull market and want meaningful exposure.</p>

      <p>At 10-15%, gold becomes a significant portfolio driver. You'll see real impact on your returns during gold rallies and real protection during equity drawdowns. This is where the academic research shows optimal risk-adjusted returns.</p>

      <p>This tier makes sense if you're concerned about fiscal deficits, currency devaluation, or geopolitical risk — but still want most of your capital in growth assets.</p>

      <h3>Conviction / Macro: 15-25% Gold Allocation</h3>

      <p><strong>Best for:</strong> Investors with strong views on dollar debasement, de-dollarization, or monetary system restructuring.</p>

      <p>At 15-25%, you're making a macro bet. This is Harry Browne territory. You believe fiat currencies are structurally losing value, central bank gold buying signals a monetary shift, and gold will be re-priced significantly higher over the next decade.</p>

      <p>This is not fringe — Ray Dalio, Stanley Druckenmiller, and multiple sovereign wealth funds are positioned in this range. But it requires conviction and the ability to hold through periods when equities outperform.</p>

      <p>If you're asking "how much of my savings should be in gold" and your answer involves the words "sound money" or "monetary reset," you're probably in this tier.</p>

      <h2>Physical Gold vs Gold ETFs vs Gold Mining Stocks — Does It Matter for Allocation?</h2>

      <p>All three count toward your gold portfolio allocation percentage, but they behave differently:</p>

      <p><strong>Physical Gold (bars, coins, rounds):</strong> Zero counterparty risk. You hold it, you own it. No exchange, broker, or custodian can freeze or rehypothecate it. Downsides: storage costs, insurance, less liquid for rebalancing. Best for: long-term holders, privacy-focused investors, anyone who wants gold they can physically access.</p>

      <p><strong>Gold ETFs (GLD, IAU, SGOL):</strong> Convenient, liquid, easy to rebalance. You buy and sell like a stock. Downsides: counterparty risk (you own shares in a trust, not physical metal), management fees (0.25-0.40%), and the gold may be lent out. Best for: investors who want gold exposure in a brokerage account.</p>

      <p><strong>Gold Mining Stocks (GDX, individual miners):</strong> Leveraged exposure to gold prices — miners' profits expand faster than gold's price increases. Downsides: company-specific risk, operational risk, management risk. A gold miner can go bankrupt even if gold goes up. Best for: investors who want amplified returns and can stomach higher volatility.</p>

      <p>For most investors, the ideal gold allocation is a mix: physical gold as the foundation (50-70% of your gold allocation), ETFs for liquidity and rebalancing (20-40%), and optional mining stock exposure (0-20%) for leverage.</p>

      <h2>Don't Forget Silver, Crypto, and Real Estate</h2>

      <p>Gold allocation should be part of a broader <a href="/blog/why-track-hard-assets-separately">hard assets vs paper assets</a> strategy. Gold isn't the only hard asset worth owning:</p>

      <p><strong>Silver:</strong> The gold-silver ratio sat above 80:1 for most of 2025 — compared to a historical average of 15:1 and a modern average of ~60:1. Many precious metals investors see silver as significantly undervalued relative to gold and allocate 20-30% of their metals position to silver. If you're new to silver, check out our <a href="/blog/gold-silver-ratio-what-it-means">silver stacking guide</a>.</p>

      <p><strong>Crypto (BTC as digital gold):</strong> Bitcoin's "digital gold" narrative has strengthened since the ETF approvals. Some investors are replacing a portion of their gold allocation with BTC — typically 5-10% of their total portfolio. See our <a href="/blog/why-track-hard-assets-separately">gold vs bitcoin comparison</a> for a deeper dive.</p>

      <p><strong>Real estate syndications:</strong> For income-producing hard assets, LP positions in multifamily, self-storage, and BTR syndications offer 6-12% preferred returns plus projected IRRs of 13-20%. Unlike gold, these generate cash flow while you hold.</p>

      <p>A well-rounded hard asset portfolio might look like: 30-40% precious metals (gold + silver), 25-35% real estate, 10-20% crypto, and the remainder in collectibles, private notes, or cash equivalents.</p>

      <h2>How to Track Your Gold Allocation in Real Time</h2>

      <p>Knowing your ideal gold allocation is one thing. Actually tracking it across physical bars, coins, ETFs, and other hard assets is another.</p>

      <p>Most portfolio trackers (Mint, Personal Capital, Monarch) can't track physical gold at all. They're built for stocks and bank accounts. Try entering "25 American Gold Eagle 1oz coins at $1,850 cost basis" into Fidelity's portfolio tracker. It can't.</p>

      <p><a href="/">HardAssets.io</a> is the <a href="/">free hard asset portfolio tracker</a> built specifically for this. It tracks:</p>

      <ul>
        <li><strong>Physical precious metals</strong> — gold, silver, platinum, palladium with 8 unit types, automatic oz-per-unit conversion, and live spot prices from metals.dev</li>
        <li><strong>Crypto</strong> — 20+ coins with live CoinGecko prices</li>
        <li><strong>Real estate syndications</strong> — LP positions with sponsor, IRR, rate%, and income tracking</li>
        <li><strong>Physical properties</strong> — equity, cash flow, cap rate calculations</li>
        <li><strong>Collectibles, private notes</strong> — watches, wine, art, hard money loans</li>
      </ul>

      <p>The Portfolio tab shows your <strong>actual allocation vs target allocation</strong> — so you can see at a glance whether your gold portfolio allocation percentage is where you want it. If you're at 8% gold but targeting 15%, the dashboard shows the gap.</p>

      <p><strong>Try the free live demo at <a href="/?demo=1">HardAssets.io</a></strong> — no sign-up required. A pre-loaded sample portfolio shows you exactly how it works.</p>

      <h2>The Bottom Line</h2>

      <p>How much gold should you own? There's no single right answer, but the data consistently supports these ranges:</p>

      <ul>
        <li><strong>Minimum:</strong> 5% — basic portfolio insurance</li>
        <li><strong>Optimal:</strong> 10-15% — best risk-adjusted returns per academic research</li>
        <li><strong>Conviction:</strong> 15-25% — for macro-focused investors betting on monetary restructuring</li>
      </ul>

      <p>The most important thing is to actually <em>know</em> your current gold allocation. If you can't answer "what percentage of my total portfolio is in gold?" within 5 seconds, you need a better tracking system.</p>

      <p><em>This content is for informational purposes only and does not constitute financial advice. Past performance does not guarantee future results. Consult a qualified financial advisor before making investment decisions.</em></p>
    `
  },
  {
    slug: "hard-assets-vs-paper-assets",
    title: "Hard Assets vs. Paper Assets: Why Tangible Investments Are Outperforming in 2026",
    date: "2026-04-12",
    excerpt: "Gold +65%. Silver +138%. Dollar -11%. The hard assets vs paper assets divide became the most important distinction in investing during 2025-2026. Here's the data and what it means for your portfolio.",
    metaDescription: "Hard assets vs paper assets: gold, silver, and real estate are crushing stocks and bonds in 2026. See the data and track your tangible investments for free.",
    thumbnail: "/blog-hard-vs-paper.svg",
    heroImage: "/blog-hard-vs-paper.svg",
    content: `
      <p>The debate between <strong>hard assets vs paper assets</strong> used to be an academic exercise. In 2025-2026, it became the single most important distinction in investing. Gold surged 65% in 2025. Silver exploded 138%. Meanwhile, the S&P 500 whipsawed through volatile quarters, bonds delivered negative real returns, and the US dollar index fell 11% in the first half of 2025 alone.</p>

      <p>If your portfolio was heavy on tangible assets investing — gold, silver, real estate, crypto — you had a historic year. If you were concentrated in paper — stocks, bonds, dollars — you watched your purchasing power erode in real time. This guide explains why, and how to position going forward.</p>

      <h2>What Are Hard Assets? A Clear Definition</h2>

      <p>Hard assets are physical, tangible investments whose value derives from intrinsic properties rather than a counterparty's promise. Examples include gold, silver, real estate, commodities, collectibles, and cryptocurrency. Unlike stocks, bonds, or fiat currency, hard assets cannot be printed, diluted, or defaulted on by a third party.</p>

      <p>The hard assets definition covers a broad spectrum:</p>

      <ul>
        <li><strong>Precious metals:</strong> Gold, silver, platinum, palladium — thousands of years of monetary history, finite supply, cannot be created by central banks</li>
        <li><strong>Real estate:</strong> Land, rental properties, commercial buildings, farmland, timber — physical structures with utility value</li>
        <li><strong>Commodities:</strong> Oil, natural gas, agricultural products, industrial metals — essential inputs with intrinsic demand</li>
        <li><strong>Cryptocurrency:</strong> Bitcoin, Ethereum — digital scarcity with fixed supply schedules (21 million BTC cap), no central issuer</li>
        <li><strong>Collectibles:</strong> Art, wine, watches, rare coins, classic cars — scarce items with market-driven valuations</li>
        <li><strong>Private notes:</strong> Hard money loans, bridge loans secured by physical collateral (real estate, equipment)</li>
      </ul>

      <p><strong>Paper assets</strong>, by contrast, are financial promises: stocks (ownership claims on companies that can go bankrupt), bonds (IOUs from governments and corporations that can default), fiat currency (government-issued money that can be printed without limit), and derivatives (contracts whose value depends on other contracts).</p>

      <p>The key distinction in the <strong>real assets vs financial assets</strong> debate: when you hold a gold bar, its value exists independent of any institution. When you hold a stock certificate, its value depends on the company's management, the market's sentiment, and the integrity of the financial system. One is a thing. The other is a promise.</p>

      <h2>Hard Assets vs Paper Assets: The 2025-2026 Scorecard</h2>

      <p>The numbers tell a dramatic story about <strong>hard assets vs stocks</strong> and other paper instruments:</p>

      <p><strong>Hard Asset Performance (2025):</strong></p>
      <ul>
        <li>Gold: <strong>+65%</strong> — hit $5,595/oz in January 2026</li>
        <li>Silver: <strong>+138%</strong> — the best-performing major asset of 2025</li>
        <li>Platinum: <strong>+28%</strong></li>
        <li>Bitcoin: Held above $85,000, +15% from January 2025 lows</li>
        <li>Real estate syndications: 8-18% total returns (preferred + appreciation)</li>
        <li>Farmland: +12% average appreciation</li>
      </ul>

      <p><strong>Paper Asset Performance (2025):</strong></p>
      <ul>
        <li>S&P 500: Volatile, with two 10%+ corrections and a flat-to-negative real return after inflation</li>
        <li>US Treasury Bonds (10-year): Negative real return for the fourth consecutive year</li>
        <li>US Dollar Index (DXY): <strong>-11%</strong> in H1 2025</li>
        <li>Corporate bonds: Credit spreads widened, defaults rose in CRE sector</li>
      </ul>

      <p>The gap between <strong>tangible investments</strong> and paper investments was the widest since the 1970s. Investors who understood the hard assets vs paper assets distinction early captured generational returns.</p>

      <h2>Why Hard Assets Are Winning: The Dollar Debasement Thesis</h2>

      <p>Why are tangible assets outperforming? The answer is structural, not cyclical:</p>

      <p><strong>1. US national debt exceeded $36 trillion.</strong> Federal interest payments now exceed defense spending — over $1 trillion annually. The only way to service this debt is to print more dollars or inflate it away. Both scenarios favor hard assets.</p>

      <p><strong>2. Central banks are dumping Treasuries for gold.</strong> Global central banks bought over 1,100 tonnes of gold in 2023, 2024, AND 2025 — three consecutive years of record-level purchases. China, India, Poland, Turkey, and Singapore are leading the shift. They're trading paper promises (US Treasuries) for tangible assets (gold bars in their vaults).</p>

      <p><strong>3. BRICS is building gold-backed alternatives.</strong> The BRICS bloc (Brazil, Russia, India, China, South Africa + new members) launched gold-backed settlement mechanisms in 2025. This isn't de-dollarization as a theory — it's de-dollarization as trade infrastructure.</p>

      <p><strong>4. The dollar's reserve share hit a 26-year low.</strong> The USD's share of global reserves fell to 56.92% — down from 72% in 2000. Every percentage point lost represents billions in demand that previously supported the dollar's value.</p>

      <p><strong>5. Inflation stayed sticky.</strong> Despite rate hikes, real inflation (food, housing, insurance, education) remained well above the Fed's 2% target. Hard assets are the historical hedge against persistent inflation. Paper assets denominated in a depreciating currency are the victims.</p>

      <p>This isn't a temporary trade. The <strong>why invest in hard assets</strong> thesis is fundamentally about the long-term trajectory of fiat currencies. Every major fiat currency in history has eventually gone to zero. Gold has never gone to zero in 5,000 years.</p>

      <h2>The Counterparty Risk Problem with Paper Assets</h2>

      <p>Every paper asset carries counterparty risk — the risk that the entity on the other side of the promise fails to deliver:</p>

      <ul>
        <li><strong>Stocks can go to zero.</strong> Silicon Valley Bank, Enron, Lehman Brothers, FTX — shareholders lost everything. Your gold coins in a safe can't file for bankruptcy.</li>
        <li><strong>Bonds can default.</strong> Argentina has defaulted 9 times. Russia defaulted in 2022. US Treasury yields are negative after real inflation — you're guaranteed to lose purchasing power.</li>
        <li><strong>Dollars can be debased.</strong> The US dollar has lost 97% of its purchasing power since 1913. A $20 gold coin from 1913 is now worth over $5,000. The $20 bill from 1913 is still worth $20 (but buys what 60 cents bought then).</li>
        <li><strong>Bank accounts can be frozen.</strong> Canada froze truckers' bank accounts in 2022. Cyprus bailed in depositors in 2013. Cash in a bank is a loan to the bank — you are an unsecured creditor.</li>
      </ul>

      <p>Gold in your hand has zero counterparty risk. Silver in your safe has zero counterparty risk. A rental property generating cash flow doesn't depend on a corporation's quarterly earnings. This is why the stacker community gravitates toward <strong>tangible assets investing</strong> — it's not about conspiracy theories, it's about removing single points of failure.</p>

      <h2>How to Build a Hard Asset Portfolio</h2>

      <p>If you're convinced by the <strong>hard assets vs paper assets</strong> data, here's a practical framework:</p>

      <p><strong>Foundation (30-40%): Precious Metals</strong><br/>
      Gold is the anchor. Silver adds upside leverage. See our <a href="/blog/how-much-gold-should-you-own">gold allocation guide</a> for specific percentages by risk profile. Physical metals should be the core, with ETFs for liquidity.</p>

      <p><strong>Income (25-35%): Real Estate</strong><br/>
      Real estate syndications (LP positions) offer 6-12% preferred returns plus appreciation. Physical rental properties generate monthly cash flow. Both are tangible, income-producing hard assets.</p>

      <p><strong>Growth (10-20%): Crypto</strong><br/>
      Bitcoin's fixed supply (21 million cap) makes it a digital hard asset. ETH and SOL add ecosystem exposure. Keep this volatile allocation sized for your risk tolerance. Read our <a href="/blog/why-track-hard-assets-separately">gold vs bitcoin in 2026</a> comparison.</p>

      <p><strong>Alternative (5-15%): Collectibles, Notes, Commodities</strong><br/>
      Watches, wine, art — appreciating tangibles with zero correlation to markets. Private notes secured by real estate collateral — 8-12% yields. Commodity exposure through physical holdings or targeted ETFs.</p>

      <p>The exact percentages depend on your conviction level, timeline, and income needs. The key principle: reduce paper exposure, increase tangible exposure, and know exactly where you stand.</p>

      <h2>Track Your Hard Assets vs Paper Assets in One Dashboard</h2>

      <p>Here's the problem: most portfolio trackers were built for paper assets. Fidelity, Schwab, and Vanguard can show your stock and bond allocation beautifully. But they can't track the gold bars in your safe, the syndication LP you wired into, or the private note earning 12%.</p>

      <p>You end up with a spreadsheet, three apps, and no clear picture of your actual hard-to-paper ratio.</p>

      <p><a href="/">HardAssets.io</a> is the <a href="/">free hard asset dashboard</a> that solves this. It tracks:</p>

      <ul>
        <li>Physical precious metals with live spot prices and oz-per-unit conversion</li>
        <li>Real estate syndications with sponsor, IRR, and income tracking</li>
        <li>Physical properties with equity and cash flow calculations</li>
        <li>20+ crypto coins with live CoinGecko prices</li>
        <li>Collectibles, private notes, and alternative assets</li>
      </ul>

      <p>The Portfolio tab shows your <strong>actual allocation across all asset classes</strong> — so you can see at a glance what percentage of your wealth is in hard assets vs paper. If you're targeting 70% hard / 30% paper but you're actually at 40/60, the dashboard shows the gap.</p>

      <p><strong><a href="/?demo=1">Try the free live demo</a></strong> — no sign-up required. A pre-loaded sample portfolio shows exactly how it works. If you're ready to <a href="/blog/why-track-hard-assets-separately">start stacking silver</a>, track everything in one place.</p>

      <h2>The Bottom Line</h2>

      <p>The <strong>hard assets vs paper assets</strong> debate isn't theoretical anymore. The data from 2025-2026 is conclusive: tangible investments are outperforming. Gold, silver, and real estate are beating stocks, bonds, and cash on both an absolute and risk-adjusted basis.</p>

      <p>The structural forces — debt, debasement, de-dollarization — favor this trend continuing. You don't need to go to 100% hard assets. But if you're at 0% or 10%, you're leaving protection and performance on the table.</p>

      <p>Know your number. Track your allocation. Rebalance with intention.</p>

      <p><em>This content is for informational purposes only and does not constitute financial advice. Past performance does not guarantee future results. Consult a qualified financial advisor before making investment decisions.</em></p>
    `
  },
  {
    slug: "silver-stacking-for-beginners",
    title: "Silver Stacking for Beginners: How to Start, What to Buy, and How to Track Your Stack",
    date: "2026-04-12",
    excerpt: "Silver exploded 138% in 2025. London vault inventories collapsed 75%. If you've been thinking about stacking silver, you're not alone — and you're not too late. Here's everything a beginner needs to know.",
    metaDescription: "Silver stacking for beginners: what to buy first, bars vs coins, junk silver explained, and how to track your growing stack for free. Updated for 2026.",
    thumbnail: "/blog-silver-stacking.svg",
    heroImage: "/blog-silver-stacking.svg",
    content: `
      <p><strong>Silver stacking for beginners</strong> has never been more relevant. Silver exploded 138% in 2025 during what the community now calls the "Great Silver Squeeze." London vault inventories collapsed 75%. China imposed export controls on refined silver. The US government designated silver a critical mineral. Industrial demand from solar panels, EVs, and AI data centers hit record highs while mine supply stagnated.</p>

      <p>If you've been thinking about stacking silver, you're not alone — and you're not too late. This <strong>silver stacking guide</strong> covers everything a beginner needs to know: what to buy, where to buy, how to store, and how to track your growing stack.</p>

      <h2>What Is Silver Stacking? (And Why People Do It)</h2>

      <p>Silver stacking is the practice of systematically buying and accumulating physical silver over time as a long-term store of wealth. Unlike trading, stacking focuses on acquiring ounces at the best available premium regardless of short-term price movements. Stackers typically buy coins, bars, and constitutional silver from dealers or local coin shops.</p>

      <p>The stacking community — r/Silverbugs, r/WallStreetSilver, local coin shop regulars, precious metals forums — is one of the most passionate in investing. But why do people stack silver?</p>

      <ul>
        <li><strong>Inflation hedge:</strong> Silver has preserved purchasing power for thousands of years. The dollar has lost 97% of its value since 1913. An ounce of silver still buys roughly what it bought centuries ago.</li>
        <li><strong>Industrial demand:</strong> Silver is essential for solar panels, electronics, EVs, medical devices, and water purification. Unlike gold (which is mostly hoarded), silver gets consumed. Supply is shrinking while demand is growing.</li>
        <li><strong>Undervalued relative to gold:</strong> The gold-to-silver ratio sat above 80:1 for most of 2024-2025 — compared to a historical average around 15:1. Many stackers believe silver is dramatically underpriced relative to gold.</li>
        <li><strong>Outside the banking system:</strong> Silver in your safe isn't an entry on someone else's balance sheet. No bank can freeze it. No exchange can halt trading. No company can dilute it.</li>
        <li><strong>Accessible entry point:</strong> Unlike gold at $5,500+/oz, silver at ~$34/oz lets beginners start building a meaningful stack without a large upfront investment.</li>
      </ul>

      <p>If the <a href="/blog/hard-assets-vs-paper-assets">hard assets vs paper assets</a> thesis resonates with you, silver is one of the most accessible entry points.</p>

      <h2>What Silver Should Beginners Buy First?</h2>

      <p>This is the question every new stacker asks. Here's your <strong>how to start stacking silver</strong> roadmap:</p>

      <h3>American Silver Eagles (ASEs)</h3>
      <p>The most recognized silver coin in the world. 1 troy ounce of .999 fine silver, minted by the US Mint, legal tender ($1 face value). Premium: typically $5-8 over spot price. Every stacker should own some Eagles — they're the most liquid, most trusted, and easiest to sell anywhere in the world. Downsides: highest premium per ounce, and the premium doesn't always track spot price proportionally.</p>

      <h3>Generic 1oz Rounds</h3>
      <p>Private mint silver rounds — same 1oz of .999 silver, lower premium ($2-3 over spot). Brands like Buffalo, Sunshine Mint, Asahi. These are the <strong>best silver to stack</strong> for pure weight accumulation. No numismatic value, no collectibility — just silver. If your goal is "most ounces for my dollars," generic rounds are your friend.</p>

      <h3>10oz and 100oz Bars</h3>
      <p>The lowest cost per ounce. A 100oz bar might carry only $0.50-1.00/oz over spot. Brands: PAMP Suisse, Royal Canadian Mint, Johnson Matthey, Sunshine. Downsides: harder to sell in small quantities (you can't break a 100oz bar in half), and less portable. Best for investors making larger purchases ($3,000+).</p>

      <h3>Junk Silver / Constitutional Silver</h3>
      <p><strong>Junk silver for beginners</strong> is arguably the smartest first purchase. These are pre-1965 US coins (dimes, quarters, half dollars) that contain 90% silver. A $1 face value of junk silver contains approximately 0.715 troy ounces of silver.</p>

      <p>Why stackers love junk silver:</p>
      <ul>
        <li>No reporting requirements (unlike bars over 1,000oz)</li>
        <li>Infinitely divisible — you can spend a single dime</li>
        <li>Instantly recognizable — everyone knows what a quarter looks like</li>
        <li>Often available at or below spot price per ounce of silver content</li>
        <li>If silver ever becomes a medium of exchange again, these are the most practical form</li>
      </ul>

      <h3>Sovereign Coins (Maples, Britannias, Philharmonics)</h3>
      <p>Government-minted coins from Canada, UK, Austria, and others. Similar premiums to Eagles, recognized internationally. Canadian Silver Maple Leafs have .9999 purity (four nines) — the purest sovereign coin. Good for diversification beyond US Mint products.</p>

      <h3>The Beginner Starter Stack</h3>
      <p>If you're just getting started with your <strong>silver stacking strategy</strong>, here's what I'd recommend as a first purchase:</p>
      <ul>
        <li><strong>10× American Silver Eagles</strong> — your foundation, most liquid</li>
        <li><strong>$50 face value junk silver</strong> — approximately 35.75 oz of silver, divisible, practical</li>
        <li><strong>1× 10oz silver bar</strong> — lowest premium per ounce in your starter stack</li>
      </ul>
      <p>Total: approximately 55.75 troy ounces. At $34/oz spot, that's roughly $1,900 in silver content plus premiums. You can start smaller — even 5 Eagles and $20 face junk is a solid beginning.</p>

      <h2>Silver Bars vs Silver Coins: Which Is Better for Stacking?</h2>

      <p>The <strong>silver bars vs coins</strong> debate is one of the oldest in the stacking community. Here's the honest breakdown:</p>

      <p><strong>Silver Coins (Eagles, Maples, rounds):</strong></p>
      <ul>
        <li>Legal tender status (government-minted coins)</li>
        <li>Higher premiums ($2-8 over spot)</li>
        <li>Easier to sell in small quantities</li>
        <li>More recognizable to casual buyers</li>
        <li>Better for barter/emergency scenarios</li>
      </ul>

      <p><strong>Silver Bars (10oz, 100oz, kilo):</strong></p>
      <ul>
        <li>Lowest premium per ounce ($0.50-2 over spot)</li>
        <li>Most efficient for large purchases</li>
        <li>Easier to store (stackable, uniform)</li>
        <li>Harder to sell in small amounts</li>
        <li>Some bars require assay for resale</li>
      </ul>

      <p><strong>The answer:</strong> Both. Coins for liquidity and flexibility, bars for cost efficiency. Most experienced stackers use a mix — coins for the first $5,000-10,000 of their stack, then bars for scaling up.</p>

      <h2>Where to Buy Silver (Without Getting Ripped Off)</h2>

      <p><strong>Reputable online dealers:</strong></p>
      <ul>
        <li><strong>SD Bullion</strong> — consistently lowest premiums, fast shipping</li>
        <li><strong>JM Bullion</strong> — wide selection, good for beginners, frequent sales</li>
        <li><strong>APMEX</strong> — largest selection, higher premiums, good for rare/collectible pieces</li>
        <li><strong>Monument Metals</strong> — competitive pricing, solid reputation</li>
        <li><strong>Bold Precious Metals</strong> — low premiums, smaller but reliable</li>
      </ul>

      <p><strong>Local coin shops (LCS):</strong> Walk in, buy with cash, no paper trail. Build a relationship with your LCS — they'll call you when deals come in. Prices are negotiable, especially for larger purchases. This is the most private way to buy.</p>

      <p><strong>r/PMsForSale:</strong> Reddit's peer-to-peer precious metals marketplace. Experienced buyers and sellers, often below dealer prices. Use established sellers with feedback history. Ship via USPS Priority with tracking.</p>

      <p><strong>Avoid:</strong> eBay (high fake rate, high prices), pawn shops (massive markups), "collectible" silver from TV ads (absurd premiums for mediocre coins), and any dealer that won't show you their spot + premium breakdown.</p>

      <p>Always price-check against spot. If someone's charging $50/oz for a generic round when spot is $34, walk away.</p>

      <h2>How to Store Your Silver Safely</h2>

      <p><strong>Home safe:</strong> The most common choice. Get a fireproof, waterproof safe (UL-rated, minimum 1 hour fire protection). Bolt it to the floor or wall. Don't tell people about your stack. A $300-500 safe protects thousands in silver.</p>

      <p><strong>Bank safe deposit box:</strong> Accessible during business hours, relatively secure. Downsides: not FDIC insured (the box contents aren't covered), accessible only when the bank is open, and in extreme scenarios the government can seal safe deposit boxes (see: Executive Order 6102 in 1933).</p>

      <p><strong>Private vault storage:</strong> Companies like SD Bullion Vault, Brink's, and Delaware Depository offer fully insured, allocated storage. You own specific bars/coins, not a claim on a pool. Best for large stacks ($50K+) where home storage becomes impractical.</p>

      <p><strong>Insurance:</strong> Your homeowner's or renter's insurance may cover some precious metals, but limits are often $200-500 for "collectibles." For larger stacks, add a specific rider or use a separate precious metals insurance policy.</p>

      <h2>The Gold-to-Silver Ratio: When to Stack More Silver</h2>

      <p>The gold-to-silver ratio (GSR) is the number of silver ounces it takes to buy one ounce of gold. At $5,500 gold and $34 silver, the ratio is approximately 161:1.</p>

      <p>Historical context:</p>
      <ul>
        <li>Ancient Rome: 12:1 (fixed by law)</li>
        <li>US Coinage Act of 1792: 15:1</li>
        <li>20th century average: ~50-60:1</li>
        <li>2011 silver spike: 32:1</li>
        <li>March 2020 (COVID): 125:1</li>
        <li>2025 average: ~80:1</li>
      </ul>

      <p><strong>The stacker's playbook:</strong> When the GSR is above 80, silver is historically cheap relative to gold — stack silver aggressively. When the ratio contracts below 50, some stackers swap silver for gold, effectively increasing their total ounces over time through ratio trading.</p>

      <p>Read more in our <a href="/blog/gold-silver-ratio-what-it-means">gold-to-silver ratio deep dive</a>.</p>

      <h2>How to Track Your Silver Stack Value</h2>

      <p>Here's the dirty secret of silver stacking: most stackers have no idea what their stack is actually worth. They know how many ounces they have (roughly), but they don't track cost basis, current value, gain/loss, or how silver fits into their total portfolio allocation.</p>

      <p>Common approaches and their problems:</p>
      <ul>
        <li><strong>Spreadsheet:</strong> Works until you have 50+ purchases across different products at different prices. Then it's a maintenance nightmare.</li>
        <li><strong>Handwritten ledger:</strong> Charming but impractical. No live spot price updates.</li>
        <li><strong>Memory:</strong> "I think I have about 200 ounces." Not good enough when your stack represents real wealth.</li>
      </ul>

      <p>If you want to know <strong>how to track silver stack value</strong> properly, you need a tool built for physical metals — not a stock portfolio tracker.</p>

      <p><a href="/">HardAssets.io</a> is the <a href="/">free precious metals tracker</a> that solves this. It tracks your silver with:</p>

      <ul>
        <li><strong>8 unit types:</strong> 1oz, 1/2oz, 1/4oz, 1/10oz, 10oz, 100oz, 1kg, gram — proper oz-per-unit conversion</li>
        <li><strong>Live spot prices:</strong> Updated from metals.dev, showing real 24-hour change</li>
        <li><strong>Cost basis tracking:</strong> Enter what you paid, see your total gain/loss at current spot</li>
        <li><strong>Portfolio allocation:</strong> See silver as a percentage of your total hard asset portfolio (including gold, crypto, real estate, collectibles)</li>
        <li><strong>CSV import:</strong> Bulk import your entire stack from a spreadsheet</li>
      </ul>

      <p><strong><a href="/?demo=1">Try the free live demo</a></strong> — it takes 30 seconds to add your first silver position. No sign-up required. See our <a href="/blog/how-much-gold-should-you-own">portfolio allocation guide</a> for how silver fits into a broader hard asset strategy.</p>

      <h2>Start Small, Stack Consistently</h2>

      <p>You don't need $10,000 to start stacking silver. Buy 5 ounces this month. Buy 10 next month. Visit your local coin shop and pick up some junk silver dimes. Set up a monthly buy from SD Bullion or JM Bullion. The point isn't to go all-in on day one — it's to build the habit of converting depreciating dollars into appreciating silver, one ounce at a time.</p>

      <p>Welcome to the stack. 🥈</p>

      <p><em>This content is for informational purposes only and does not constitute financial advice. Past performance does not guarantee future results. Consult a qualified financial advisor before making investment decisions.</em></p>
    `
  }
];

export function getPost(slug) {
  return POSTS.find(p => p.slug === slug) || null;
}

export function getAllSlugs() {
  return POSTS.map(p => p.slug);
}
