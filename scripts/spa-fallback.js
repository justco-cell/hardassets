// Post-build script: copy index.html to common SPA routes
// This ensures Vercel serves index.html for all SPA routes
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

const dist = 'dist';
const indexHtml = join(dist, 'index.html');

// All SPA routes that need to serve index.html
const routes = [
  'blog/index.html',
  'blog/how-much-gold-should-you-own/index.html',
  'blog/hard-assets-vs-paper-assets/index.html',
  'blog/why-track-hard-assets-separately/index.html',
  'blog/gold-silver-ratio-what-it-means/index.html',
  'blog/what-is-real-estate-syndication/index.html',
  'compare/index.html',
];

for (const route of routes) {
  const dest = join(dist, route);
  const dir = dirname(dest);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  copyFileSync(indexHtml, dest);
  console.log(`  SPA fallback: ${route}`);
}

console.log(`Created ${routes.length} SPA fallback routes.`);
