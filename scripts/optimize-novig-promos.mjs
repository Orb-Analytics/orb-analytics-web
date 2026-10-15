// Builds the web-sized Novig promo images used by js/novig-promos.js.
//
// For every PNG in assets/novig_promos/ (the 1080x1080 originals, which stay
// in place), writes WebP + JPG copies at each width in WIDTHS to
// assets/novig_promos/optimized/<name>-<width>.<ext>. The promo displays at
// ~326-356px on phones and ~360-640px on desktop, so 360/720 cover 1x and 2x,
// and 1080 (the original size) covers retina desktop and tablets.
//
// Usage (sharp isn't a repo dependency):
//   npm install --no-save sharp
//   node scripts/optimize-novig-promos.mjs
//
// Adding a promo: drop the PNG in assets/novig_promos/, run this, then add its
// name to NOVIG_PROMOS in js/novig-promos.js.

import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC_DIR = 'assets/novig_promos';
const OUT_DIR = path.join(SRC_DIR, 'optimized');
const WIDTHS = [360, 720, 1080];

await mkdir(OUT_DIR, { recursive: true });
const files = (await readdir(SRC_DIR)).filter(f => f.toLowerCase().endsWith('.png'));
for (const file of files) {
  const name = path.basename(file, path.extname(file));
  for (const width of WIDTHS) {
    const base = sharp(path.join(SRC_DIR, file)).resize({ width, withoutEnlargement: true });
    await base.clone().webp({ quality: 80 }).toFile(path.join(OUT_DIR, `${name}-${width}.webp`));
    // The promos are fully opaque, so JPG is the lighter fallback for browsers without WebP.
    await base.clone().flatten({ background: '#ffffff' }).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(OUT_DIR, `${name}-${width}.jpg`));
  }
  console.log(`${name}: ${WIDTHS.join(', ')}px`);
}
