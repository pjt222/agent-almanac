/**
 * build-terminal-glyphs.js — Generate terminal glyph data from agent WebP icons.
 *
 * Produces per agent:
 *   1. Pixel grid (NxN hex colors) for half-block rendering (fallback)
 *   2. Base64 PNG (128×128) for inline image rendering
 *
 * Produces per team:
 *   3. Horizontal strip PNG (members side by side) for single-image inline rendering
 *
 * Usage: node build-terminal-glyphs.js [--size 16] [--png-size 128] [--gap 32]
 */

import sharp from 'sharp';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, basename, resolve } from 'path';
import yaml from 'js-yaml';

const ICONS_DIR  = resolve('dist/icons/cyberpunk/agents');
const TEAMS_REG  = resolve('../teams/_registry.yml');
const OUTPUT     = resolve('../cli/lib/glyph-data.json');
const SIZE       = parseInt(process.argv.find((_, i, a) => a[i - 1] === '--size') || '16', 10);
const PNG_SIZE   = parseInt(process.argv.find((_, i, a) => a[i - 1] === '--png-size') || '128', 10);
const STRIP_GAP  = parseInt(process.argv.find((_, i, a) => a[i - 1] === '--gap') || '32', 10);
const ALPHA_THRESHOLD = 30;

async function main() {
  // ── Agent icons ──────────────────────────────────────────────────
  const files = readdirSync(ICONS_DIR).filter(f => f.endsWith('.webp')).sort();
  console.log(`Processing ${files.length} agent icons (grid: ${SIZE}×${SIZE}, png: ${PNG_SIZE}×${PNG_SIZE})...`);

  const agents = {};
  const agentPngBuffers = {}; // keep buffers for strip composition

  for (const file of files) {
    const agentId = basename(file, '.webp');
    const path = join(ICONS_DIR, file);

    // 1. Pixel grid for half-block fallback
    const { data, info } = await sharp(path)
      .resize(SIZE, SIZE, { kernel: sharp.kernel.nearest })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const grid = [];
    for (let y = 0; y < info.height; y++) {
      const row = [];
      for (let x = 0; x < info.width; x++) {
        const offset = (y * info.width + x) * info.channels;
        const r = data[offset];
        const g = data[offset + 1];
        const b = data[offset + 2];
        const a = data[offset + 3];
        if (a < ALPHA_THRESHOLD) {
          row.push(null);
        } else {
          row.push('#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join(''));
        }
      }
      grid.push(row);
    }

    // 2. Individual PNG for inline rendering
    const pngBuffer = await sharp(path)
      .resize(PNG_SIZE, PNG_SIZE)
      .png()
      .toBuffer();

    agents[agentId] = { grid, png: pngBuffer.toString('base64') };
    agentPngBuffers[agentId] = pngBuffer;
    process.stdout.write('.');
  }
  console.log();

  // ── Team strips ──────────────────────────────────────────────────
  let teams = {};
  try {
    const reg = yaml.load(readFileSync(TEAMS_REG, 'utf8'));
    const teamList = reg.teams || [];
    console.log(`Composing ${teamList.length} team strips...`);

    for (const team of teamList) {
      const memberIds = team.members || [];
      const memberBuffers = memberIds
        .map(id => agentPngBuffers[id])
        .filter(Boolean);

      if (memberBuffers.length === 0) {
        process.stdout.write('x');
        continue;
      }

      // Compose horizontal strip: icons side by side with gap
      const stripW = memberBuffers.length * PNG_SIZE + (memberBuffers.length - 1) * STRIP_GAP;
      const stripH = PNG_SIZE;

      const composites = memberBuffers.map((buf, i) => ({
        input: buf,
        left: i * (PNG_SIZE + STRIP_GAP),
        top: 0,
      }));

      const stripBuffer = await sharp({
        create: {
          width: stripW,
          height: stripH,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      })
        .composite(composites)
        .png()
        .toBuffer();

      teams[team.id] = stripBuffer.toString('base64');
      process.stdout.write('.');
    }
    console.log();
  } catch (err) {
    console.warn('Warning: could not generate team strips:', err.message);
  }

  // ── Campfire PNGs ─────────────────────────────────────────────────
  // Procedurally generated flames at 256×256 native resolution.
  console.log('Generating campfire PNGs...');
  const FIRE_W = 256;
  const FIRE_H = 320; // taller for dramatic flames

  const campfires = {};
  for (const state of ['burning', 'embers', 'cold']) {
    const buf = generateFire(FIRE_W, FIRE_H, state);
    const png = await sharp(buf, { raw: { width: FIRE_W, height: FIRE_H, channels: 4 } })
      .png()
      .toBuffer();
    campfires[state] = png.toString('base64');
    process.stdout.write('.');
  }
  console.log(' done');

  // ── Write output ─────────────────────────────────────────────────
  const output = { resolution: SIZE, pngSize: PNG_SIZE, agents, teams, campfires };
  const json = JSON.stringify(output);
  writeFileSync(OUTPUT, json);
  const sizeMB = (Buffer.byteLength(json) / 1024 / 1024).toFixed(2);
  console.log(`Wrote ${OUTPUT} (${files.length} agents, ${Object.keys(teams).length} team strips, 3 campfires, ${sizeMB} MB)`);
}

main().catch(err => { console.error(err); process.exit(1); });

// ── Procedural fire generator ─────────────────────────────────────

function generateFire(w, h, state) {
  const buf = Buffer.alloc(w * h * 4, 0);
  const cx = w / 2;

  function setPixel(x, y, r, g, b, a) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const off = (y * w + x) * 4;
    // Alpha blend onto existing.
    const srcA = a / 255;
    const dstA = buf[off + 3] / 255;
    const outA = srcA + dstA * (1 - srcA);
    if (outA === 0) return;
    buf[off]     = Math.round((r * srcA + buf[off]     * dstA * (1 - srcA)) / outA);
    buf[off + 1] = Math.round((g * srcA + buf[off + 1] * dstA * (1 - srcA)) / outA);
    buf[off + 2] = Math.round((b * srcA + buf[off + 2] * dstA * (1 - srcA)) / outA);
    buf[off + 3] = Math.round(outA * 255);
  }

  function fillEllipse(ex, ey, rx, ry, r, g, b, a) {
    for (let py = Math.floor(ey - ry); py <= Math.ceil(ey + ry); py++) {
      for (let px = Math.floor(ex - rx); px <= Math.ceil(ex + rx); px++) {
        const dx = (px - ex) / rx;
        const dy = (py - ey) / ry;
        const d = dx * dx + dy * dy;
        if (d <= 1.0) {
          // Soft edge: fade at boundary.
          const fade = d > 0.7 ? 1 - (d - 0.7) / 0.3 : 1;
          setPixel(px, py, r, g, b, Math.round(a * fade));
        }
      }
    }
  }

  // Stone ring (all states).
  const stoneY = h * 0.82;
  for (let angle = 0; angle < Math.PI * 2; angle += 0.15) {
    const sx = cx + Math.cos(angle) * w * 0.28;
    const sy = stoneY + Math.sin(angle) * h * 0.04;
    fillEllipse(sx, sy, 10, 8, 0x44, 0x44, 0x44, 200);
    fillEllipse(sx, sy, 7, 5, 0x55, 0x55, 0x55, 150);
  }

  // Logs (all states).
  const logY = h * 0.78;
  // Crossed logs.
  for (let t = -1; t <= 1; t += 0.02) {
    fillEllipse(cx + t * w * 0.2, logY + t * 6, 6, 5, 0x5C, 0x33, 0x17, 220);
    fillEllipse(cx - t * w * 0.2, logY + t * 6, 6, 5, 0x8B, 0x45, 0x13, 220);
  }

  if (state === 'cold') {
    // Ash mound.
    fillEllipse(cx, logY - 10, 45, 18, 0x66, 0x66, 0x66, 150);
    fillEllipse(cx, logY - 8, 35, 12, 0x77, 0x77, 0x77, 120);
    return buf;
  }

  // Ember bed.
  const emberY = h * 0.72;
  const emberIntensity = state === 'burning' ? 1.0 : 0.5;
  fillEllipse(cx, emberY, 55, 18, 0xCC, 0x33, 0x00, Math.round(200 * emberIntensity));
  fillEllipse(cx, emberY - 2, 40, 12, 0xFF, 0x6B, 0x35, Math.round(180 * emberIntensity));
  fillEllipse(cx + 8, emberY + 3, 20, 8, 0xFF, 0x99, 0x22, Math.round(150 * emberIntensity));

  if (state === 'embers') {
    // Small glow above embers.
    fillEllipse(cx, emberY - 20, 25, 20, 0xFF, 0x6B, 0x35, 60);
    fillEllipse(cx + 5, emberY - 15, 15, 12, 0xFF, 0x99, 0x22, 40);
    return buf;
  }

  // ── Burning: full flames ─────────────────────────────────────────
  const flameBase = h * 0.68;

  // Outer red glow.
  fillEllipse(cx, flameBase - 40, 70, 90, 0xCC, 0x33, 0x00, 50);

  // Flame tongues — multiple overlapping ellipses.
  const tongues = [
    { ox: -15, h: 0.55, w: 35, colors: [[0xFF,0x6B,0x35], [0xFF,0x99,0x22], [0xFF,0xCC,0x33]] },
    { ox:  10, h: 0.62, w: 30, colors: [[0xFF,0x6B,0x35], [0xFF,0x99,0x22], [0xFF,0xCC,0x33]] },
    { ox:   0, h: 0.70, w: 25, colors: [[0xFF,0x99,0x22], [0xFF,0xCC,0x33], [0xFF,0xEE,0x88]] },
    { ox:  -8, h: 0.50, w: 20, colors: [[0xCC,0x33,0x00], [0xFF,0x6B,0x35], [0xFF,0x99,0x22]] },
    { ox:  18, h: 0.45, w: 18, colors: [[0xCC,0x33,0x00], [0xFF,0x6B,0x35], [0xFF,0x99,0x22]] },
  ];

  for (const tongue of tongues) {
    const tx = cx + tongue.ox;
    const flameH = h * tongue.h;
    const topY = flameBase - flameH;

    // Outer layer.
    const [c0, c1, c2] = tongue.colors;
    fillEllipse(tx, flameBase - flameH * 0.4, tongue.w, flameH * 0.55, c0[0], c0[1], c0[2], 120);
    // Mid layer.
    fillEllipse(tx, flameBase - flameH * 0.45, tongue.w * 0.65, flameH * 0.45, c1[0], c1[1], c1[2], 150);
    // Core.
    fillEllipse(tx, flameBase - flameH * 0.4, tongue.w * 0.35, flameH * 0.35, c2[0], c2[1], c2[2], 180);
  }

  // Central white-hot core.
  fillEllipse(cx, flameBase - 30, 18, 35, 0xFF, 0xEE, 0x88, 200);
  fillEllipse(cx, flameBase - 40, 10, 25, 0xFF, 0xFF, 0xCC, 160);

  // Sparks — random bright dots above the flames.
  const seed = 42;
  function pseudoRandom(i) { return ((i * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff; }
  for (let i = 0; i < 30; i++) {
    const sx = cx + (pseudoRandom(seed + i) - 0.5) * w * 0.5;
    const sy = flameBase - h * 0.3 - pseudoRandom(seed + i + 100) * h * 0.35;
    const sparkSize = 2 + pseudoRandom(seed + i + 200) * 3;
    const sparkAlpha = 100 + pseudoRandom(seed + i + 300) * 155;
    fillEllipse(sx, sy, sparkSize, sparkSize, 0xFF, 0xCC, 0x33, Math.round(sparkAlpha));
  }

  return buf;
}
