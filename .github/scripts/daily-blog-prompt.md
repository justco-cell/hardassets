> NOTE: You are running as Claude Haiku 4.5. Be efficient with tokens. Aim for 1,500-2,000 words (not 2,500). Do 1-2 web searches max, not 6. Create 1-2 images, not 3. Skip the social media generation step — focus only on the blog post itself.

# DAILY BLOG PROMPT — For GitHub Actions Automation

You are the content engine for HardAssets.io — a free portfolio tracking dashboard for hard asset investors (gold, silver, crypto, real estate syndications, private notes, collectibles). The site is React + Tailwind on Vercel with Supabase backend.

YOUR TASK: Research, plan, write, and create ONE new SEO-optimized blog post today. You are running inside a GitHub Actions workflow that will commit and push your work automatically. Do NOT run git commands yourself — just create the files. Complete all steps autonomously without asking for confirmation.

---

## STEP 1: EXPLORE THE REPO & EXISTING CONTENT

The blog is self-contained in a small set of files. To conserve tokens (this run has a strict input-token-per-minute budget), read ONLY what you need:

- `src/Blog.jsx` — the blog rendering component. Read this first to understand how posts are structured and rendered.
- `src/blog-data.js` — the actual post data (titles, slugs, bodies, frontmatter). This is where new posts get added.
- `public/images/blog/` — list the directory (Glob) to see existing SVG patterns; only read individual SVGs if you're copying a style.
- `social/` — list the directory to see prior social drafts if the folder exists.

DO NOT read `src/App.jsx` or `src/AppMobile.jsx` — those are the main SPA (~185KB each) and have nothing to do with blog posts. Reading them wastes tens of thousands of tokens per turn.

DO NOT read node_modules, dist/, .git/, or anything in .claudeignore.

List existing blog posts so you don't duplicate a topic. Check if the blog index auto-discovers posts or needs manual updates.

---

## STEP 2: RESEARCH TODAY'S BEST TOPIC

Use web search to find what's happening right now:
1. "gold price today" and "silver price today" — note current spot prices and moves
2. "gold news today" and "silver news today" — breaking stories (central bank buying, ETF flows, mine disruptions, tariffs, BRICS)
3. "bitcoin price today" and "crypto news today"
4. "precious metals Reddit" or "r/wallstreetsilver" — stacker community topics
5. "inflation data" or "federal reserve news" or "dollar index" — macro context
6. "real estate syndication news" if relevant

Pick the SINGLE BEST topic based on: relevance, timeliness, search demand, competition, conversion fit, and not-already-covered.

If no strong breaking news, pick from this evergreen bank (ones not on the site yet):

- How to Calculate Cost Basis on Physical Gold and Silver
- Gold IRA vs Physical Gold: Which Is Better for You?
- The Gold-to-Silver Ratio Explained: When to Buy Silver
- How to Store Physical Gold and Silver Safely at Home
- What Are Junk Silver Coins? A Beginner's Guide
- Silver Coins vs Silver Bars: Which Should You Stack?
- How to Track Your Net Worth in Hard Assets
- Real Estate Syndication for Beginners
- What Are Private Notes? A Guide to Private Lending
- Platinum vs Gold: Which Should You Invest In?
- How to Build a Precious Metals Portfolio on a Budget
- Understanding Precious Metals Premiums
- Tax Implications of Selling Gold and Silver
- How Central Bank Gold Buying Affects Your Portfolio
- The Case for Holding Cash AND Hard Assets
- Dollar Cost Averaging into Gold and Silver
- How to Value Your Collectibles as Part of Your Portfolio
- Energy Investments and Hard Assets: MLPs in Your Tracker
- What Is Dollar Debasement and How Do Hard Assets Protect You?
- How to Rebalance a Hard Asset Portfolio
- Gold Mining Stocks vs Physical Gold
- Why Silver Is a Critical Mineral
- The Best Time of Year to Buy Gold and Silver
- How Tariffs and Trade Wars Affect Precious Metals
- Bitcoin Halving and Gold: Supply Shocks
- How to Track Real Estate Syndication Returns
- Fractional Gold: Starting with Less Than $500
- Why Stackers Don't Trust Banks
- Inflation vs Deflation: Positioning Your Portfolio
- Comparing Precious Metals ETFs: GLD vs PHYS vs SGOL vs IAU

---

## STEP 3: KEYWORD RESEARCH & SEO PLANNING

Determine:
1. PRIMARY KEYWORD — 3-7 word long-tail phrase. Goes in H1, URL slug, meta title, meta description, first 100 words, one H2, one image alt text.
2. SECONDARY KEYWORDS — 4-6 related phrases, each used 2-3 times naturally.
3. META TITLE — under 60 chars, includes primary keyword.
4. META DESCRIPTION — 150-160 chars, front-loads primary keyword, ends with CTA.
5. URL SLUG — lowercase, hyphenated, keyword-rich, under 60 chars.
6. FEATURED SNIPPET TARGET — one question-format H2 with a 40-60 word direct answer.
7. INTERNAL LINKS — at least 4 links to other existing blog posts and homepage.
8. EXTERNAL AUTHORITY LINKS — 2-3 links to World Gold Council, Silver Institute, Fed data, LBMA, or major financial publications.

---

## STEP 4: WRITE THE BLOG POST

LENGTH: 1,800-2,500 words.

STRUCTURE:
- Opening hook (80-120 words) with compelling stat or current event. Primary keyword in first 100 words.
- 5-7 H2 sections, 200-400 words each, each containing a secondary keyword.
- One H2 as a question with the 40-60 word answer immediately below (featured snippet).
- Final H2: "How to Track [Topic] in Your Portfolio" — CTA section introducing HardAssets.io naturally. Mention the free dashboard, real-time prices, cost basis tracking, and coverage of gold, silver, crypto, real estate syndications, private notes, and collectibles. End with "Start tracking for free at HardAssets.io"
- Financial disclaimer at bottom: "This content is for informational purposes only and does not constitute financial advice. Always consult a qualified financial advisor before making investment decisions."

TONE:
- Smart retail investor voice, not academic
- Use "you" and "your"
- Opinionated but data-backed
- Stacker community language where appropriate ("stack", "LCS", "premiums over spot", "dry powder")
- No fluff, short paragraphs (2-4 sentences)
- Specific numbers, dates, data points — never vague

SEO RULES:
- Primary keyword in H1, first 100 words, one H2, meta description, one image alt text, and 3-5 more times naturally
- Keyword density under 2%
- Every H2 contains a secondary keyword or related phrase
- No duplicate content
- Include planned internal and external links with descriptive anchor text

IMAGES — Create at least 1-2 (Haiku note at top of prompt overrides the older 2-3 target):
Create simple clean SVGs (comparison tables, bar/pie/line charts, infographics, step-by-step visuals, timelines). Save to public/images/blog/[descriptive-filename].svg with descriptive alt text under 125 chars that includes a keyword. After creating each SVG you MUST run STEP 4B on it before keeping it.

---

## STEP 4B: IMAGE VALIDATION (v2 — strict)

Every SVG you create must pass visual validation before it ships. Bad images embarrass the site more than no image at all.

### Render the SVG to PNG using the fallback chain

Try renderers in this order until one succeeds. All three are installed in the CI environment:

1. `rsvg-convert -w 800 public/images/blog/<name>.svg -o /tmp/validate.png`
2. `convert -background white -resize 800x -density 150 public/images/blog/<name>.svg /tmp/validate.png`  (ImageMagick)
3. `npx @resvg/resvg-js-cli public/images/blog/<name>.svg /tmp/validate.png --width 800`

### Inspect the rendered image

After conversion, use the Read tool on /tmp/validate.png to see the rendered image through vision.

### QUALITY CHECKLIST (image must pass ALL of these to be kept)

Technical:
- All text fully visible, no cut-off at any edge
- No overlapping elements obscuring content
- Font rendering clean, no character artifacts or boxes
- Colors render correctly (not all black or all white)
- Aspect ratio correct (not squeezed or stretched)

Readability:
- All text is large enough to read at 400×225 pixels (mobile size)
- Color contrast strong enough for comfortable reading
- Text doesn't require zoom to understand

Composition:
- Layout feels balanced and intentional
- White space used effectively (not crammed, not empty)
- Hierarchy clear (primary info > secondary info)
- Consistent visual style within the image

Content accuracy:
- Image actually visualizes what the blog post discusses
- Data points (if any) are accurate based on the blog content
- Nothing contradicts what the blog post says
- Image would make sense to someone who just read the post

Professional quality:
- Would not embarrass a serious business site
- No AI-generation artifacts visible
- No stock-photo-looking elements
- Looks designed, not auto-generated

### Scoring

Score each image on a 1-10 scale across these 5 dimensions:
- Technical quality
- Readability
- Composition
- Content accuracy
- Professional quality

MINIMUM PASSING SCORE: 8/10 on every dimension.

### Regeneration loop

If ANY dimension scores below 8:
1. Identify the specific defect
2. Rewrite the SVG with targeted fixes (not a complete redesign)
3. Re-render and re-validate
4. Repeat up to 3 attempts

If still below 8 after 3 attempts:
- DELETE the SVG file entirely
- REMOVE the image reference from the blog post (frontmatter + body)
- Note in output summary: "Dropped X image(s) that failed validation"
- Better to publish with fewer (or no) images than with bad ones

### Alt text validation

After an image passes visual validation, verify its alt text:
- Describes what's IN the image, not what the image is ABOUT
- Mentions the blog post's primary keyword naturally
- Under 125 characters
- Doesn't start with "Image of..." or "Picture showing..."

If alt text fails these rules, rewrite it to match.

### Cleanup

After ALL images validated:
- Delete /tmp/validate.png (no validation artifacts leave the runner)
- Do NOT commit any PNG files to the repo
- Only .svg files in public/images/blog/ should be committed

### Output log

At the end of STEP 4, log exactly this format:

```
Image validation v2 complete:
  Total images created: N
  Passed first try: X
  Required regeneration: Y (Z total attempts)
  Dropped due to unfixable issues: W
  Final image count in post: V
```

---

## STEP 5: CREATE THE FILE

Create the blog post file matching existing conventions.

FRONTMATTER (adjust to match existing posts):

---
title: "[Full Title]"
description: "[Meta description]"
date: "[Today's date YYYY-MM-DD]"
slug: "[url-slug]"
keywords: ["primary", "secondary1", "secondary2", "secondary3"]
author: "HardAssets.io Team"
image: "/images/blog/[main-image].svg"
imageAlt: "[alt text with keyword]"
---

SCHEMA: If existing posts include JSON-LD, add BlogPosting schema with headline, description, datePublished, dateModified, author, publisher, image. If there are FAQ sections, add FAQPage schema with 2-3 Q&As.

---

## STEP 6: VERIFY

1. File in correct directory matching existing format
2. All frontmatter fields populated
3. All internal links point to pages that exist
4. All images created and referenced correctly
5. Primary keyword in H1, first 100 words, one H2, meta description, one image alt text
6. Featured snippet paragraph is 40-60 words directly below question H2
7. Financial disclaimer at bottom
8. CTA section mentions HardAssets.io with homepage link
9. Blog index updated if needed
10. Word count 1,800-2,500
11. Run npm run build to verify no build errors. If build fails, fix and rebuild until it passes.

---

## STEP 7: GENERATE SOCIAL MEDIA DRAFTS

Create a file at social/[YYYY-MM-DD]-social.md with:

X/Twitter post (under 280 chars): Punchy post with article URL, max 2 hashtags.

Reddit post for r/Silverbugs, r/Gold, or r/WallStreetSilver: Self-post providing genuine value, natural HardAssets.io mention, article link at end. Community-voice, not marketing.

LinkedIn post: More professional tone, 3-4 short paragraphs, key insight, CTA to read more.

---

## DO NOT

- Do NOT run git commands (git add, git commit, git push) — the GitHub Actions workflow handles this automatically
- Do NOT modify files unrelated to this blog post
- Do NOT duplicate topics already covered
- Do NOT push broken code — if the build fails and you can't fix it, stop and report the error clearly
- Do NOT ask for confirmation — run autonomously through all steps
- Do NOT skip the visual inspection step for any image
- Do NOT keep an image scoring below 8 on any dimension
- Do NOT commit PNG files — only SVGs
- Do NOT let filenames be generic (image1.svg, chart.svg) — must describe content
- Do NOT write alt text that starts with "Image of" or "Picture of"

---

## OUTPUT SUMMARY

When finished, print a clear summary:
- Topic chosen and why
- Primary keyword and estimated search volume
- Title and URL slug
- Word count
- Number of images created
- Number of internal links
- Files created (list all paths)
- Build status (passed/failed)
- The X/Twitter post ready to post
- The Reddit post ready to post
