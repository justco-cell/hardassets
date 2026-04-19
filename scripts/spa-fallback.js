// Post-build script: copy index.html to each SPA route so Vercel serves the
// right file for every in-app URL.
//
// Blog slugs are discovered dynamically from src/blog-data.js. That way the
// daily blog automation (which only edits blog-data.js) doesn't also have to
// edit this list — new posts are handled on the next build automatically.
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { POSTS } from '../src/blog-data.js';

const dist = 'dist';
const indexHtml = join(dist, 'index.html');

const routes = [
  'blog/index.html',
  'compare/index.html',
  'reset/index.html',
  ...POSTS.map(p => `blog/${p.slug}/index.html`),
];

for (const route of routes) {
  const dest = join(dist, route);
  const dir = dirname(dest);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  copyFileSync(indexHtml, dest);
  console.log(`  SPA fallback: ${route}`);
}

console.log(`Created ${routes.length} SPA fallback routes.`);
