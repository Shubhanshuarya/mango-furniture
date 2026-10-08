#!/usr/bin/env node
// Downloads every `pending` row in design/images-manifest.csv to its local_file.
//
// Optimisation is done by the source Shopify CDN: we request `?width=<target_width>`
// with `Accept: image/webp`, which returns a resized, metadata-stripped WebP.
// No local image tooling is required.
//
// Usage: node scripts/fetch-images.mjs [--force]

import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { dirname } from 'node:path';

const MANIFEST = 'design/images-manifest.csv';
// Same-owner sources only. Askara is the reference store; mangofurnitureinc.com is this store.
const ALLOWED_HOSTS = new Set(['www.askara.in', 'askara.in', 'mangofurnitureinc.com', 'cdn.shopify.com']);
const force = process.argv.includes('--force');

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const toCsv = (rows) =>
  rows.map((r) => r.map((v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)).join(',')).join('\n') + '\n';

const rows = parseCsv(await readFile(MANIFEST, 'utf8'));
const header = rows[0];
const col = Object.fromEntries(header.map((h, i) => [h, i]));
let ok = 0, skipped = 0, failed = 0, bytes = 0;

for (const r of rows.slice(1)) {
  const status = r[col.status];
  const local = r[col.local_file];
  if (!local || status.startsWith('excluded')) { skipped++; continue; }
  if (status === 'downloaded' && !force) { skipped++; continue; }
  const base = local.replace(/\.jpg$/, '.webp');

  const src = new URL(r[col.source_url]);
  if (!ALLOWED_HOSTS.has(src.hostname)) {
    console.warn(`✗ host not allowed: ${src.hostname}`);
    r[col.status] = 'blocked-host'; failed++; continue;
  }
  src.searchParams.set('width', r[col.target_width] || '1200');

  try {
    const res = await fetch(src, { headers: { Accept: 'image/webp,image/*;q=0.8', 'User-Agent': 'Mozilla/5.0 (asset fetch)' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const type = res.headers.get('content-type') || '';
    // The CDN occasionally serves JPEG when it is smaller than WebP; keep it as the fallback.
    let out = base;
    if (type.includes('jpeg')) out = base.replace(/\.webp$/, '.jpg');
    else if (!type.includes('webp')) throw new Error(`unexpected content-type ${type}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, buf);
    r[col.local_file] = out;
    bytes += buf.length;
    r[col.status] = 'downloaded'; ok++;
    console.log(`✓ ${out} (${Math.round(buf.length / 1024)} KB)`);
  } catch (e) {
    r[col.status] = `failed: ${e.message}`; failed++;
    console.warn(`✗ ${local}: ${e.message}`);
  }
}

await writeFile(MANIFEST, toCsv(rows));
console.log(`\n${ok} downloaded (${(bytes / 1024 / 1024).toFixed(1)} MB), ${skipped} skipped, ${failed} failed`);
process.exit(failed ? 1 : 0);
