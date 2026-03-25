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
import { join, basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname  = dirname(fileURLToPath(import.meta.url));
const ICONS_DIR  = join(__dirname, 'public', 'icons', 'cyberpunk', 'agents');
const TEAMS_REG  = join(__dirname, '..', 'teams', '_registry.yml');
const OUTPUT     = join(__dirname, '..', 'cli', 'lib', 'glyph-data.json');
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
  const FIRE_W = 512;
  const FIRE_H = 640;
  const BURN_FRAMES = 6; // animation frames for burning state

  const campfires = {};

  // Burning: multiple frames for animation.
  const burningFrames = [];
  for (let f = 0; f < BURN_FRAMES; f++) {
    const buf = generateFire(FIRE_W, FIRE_H, 'burning', f);
    const png = await sharp(buf, { raw: { width: FIRE_W, height: FIRE_H, channels: 4 } })
      .png()
      .toBuffer();
    burningFrames.push(png.toString('base64'));
    process.stdout.write('.');
  }
  campfires.burning = burningFrames; // array of frames

  // Embers and cold: single frame each.
  for (const state of ['embers', 'cold']) {
    const buf = generateFire(FIRE_W, FIRE_H, state, 0);
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

function generateFire(w, h, state, frame = 0) {
  const buf = Buffer.alloc(w * h * 4, 0);
  const cx = w / 2;
  const t = frame * 0.4; // animation time parameter

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
  for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
    const sx = cx + Math.cos(angle) * w * 0.28;
    const sy = stoneY + Math.sin(angle) * h * 0.04;
    fillEllipse(sx, sy, 20, 16, 0x44, 0x44, 0x44, 200);
    fillEllipse(sx, sy, 14, 10, 0x55, 0x55, 0x55, 150);
    fillEllipse(sx, sy, 8, 6, 0x5A, 0x5A, 0x5A, 100);
  }

  // Logs (all states) — thicker crossed logs with wood grain.
  const logY = h * 0.78;
  for (let t = -1; t <= 1; t += 0.01) {
    const lx1 = cx + t * w * 0.22;
    const ly1 = logY + t * 12;
    fillEllipse(lx1, ly1, 14, 10, 0x5C, 0x33, 0x17, 230);
    fillEllipse(lx1, ly1, 10, 7, 0x6B, 0x3A, 0x1E, 180);
    const lx2 = cx - t * w * 0.22;
    const ly2 = logY + t * 12;
    fillEllipse(lx2, ly2, 14, 10, 0x8B, 0x45, 0x13, 230);
    fillEllipse(lx2, ly2, 10, 7, 0x9B, 0x55, 0x23, 180);
  }

  if (state === 'cold') {
    // Ash mound with layers.
    fillEllipse(cx, logY - 20, 90, 36, 0x55, 0x55, 0x55, 130);
    fillEllipse(cx, logY - 16, 70, 24, 0x66, 0x66, 0x66, 150);
    fillEllipse(cx, logY - 12, 50, 16, 0x77, 0x77, 0x77, 120);
    return buf;
  }

  // Ember bed — glowing coals.
  const emberY = h * 0.72;
  const emberIntensity = state === 'burning' ? 1.0 : 0.5;
  fillEllipse(cx, emberY, 110, 36, 0xCC, 0x33, 0x00, Math.round(180 * emberIntensity));
  fillEllipse(cx, emberY - 4, 80, 24, 0xFF, 0x6B, 0x35, Math.round(160 * emberIntensity));
  fillEllipse(cx + 16, emberY + 6, 40, 16, 0xFF, 0x99, 0x22, Math.round(140 * emberIntensity));
  fillEllipse(cx - 20, emberY + 2, 30, 12, 0xFF, 0x88, 0x22, Math.round(120 * emberIntensity));

  if (state === 'embers') {
    // Low glow above embers.
    fillEllipse(cx, emberY - 40, 50, 40, 0xFF, 0x6B, 0x35, 50);
    fillEllipse(cx + 10, emberY - 30, 30, 24, 0xFF, 0x99, 0x22, 35);
    fillEllipse(cx - 8, emberY - 35, 20, 18, 0xFF, 0xCC, 0x33, 20);
    return buf;
  }

  // ── Burning: full flames with per-frame animation ───────────────
  const flameBase = h * 0.68;

  // Outer red/orange glow halo — pulses subtly per frame.
  const glowPulse = 1 + Math.sin(t * 2.5) * 0.15;
  fillEllipse(cx, flameBase - 80, 140 * glowPulse, 180 * glowPulse, 0xCC, 0x33, 0x00, 35);
  fillEllipse(cx, flameBase - 60, 100 * glowPulse, 140 * glowPulse, 0xFF, 0x44, 0x00, 25);
  // Ground illumination — warm light on stones.
  fillEllipse(cx, h * 0.83, w * 0.35, 20, 0xFF, 0x66, 0x00, Math.round(20 * glowPulse));

  // Flame tongues — 9 overlapping ellipses, each sways and pulses per frame.
  const tongues = [
    { ox: -35, h: 0.46, w: 50, phase: 0.0, sway: 12, colors: [[0xCC,0x33,0x00], [0xFF,0x6B,0x35], [0xFF,0x99,0x22]] },
    { ox:  30, h: 0.40, w: 42, phase: 1.2, sway: 10, colors: [[0xCC,0x33,0x00], [0xFF,0x6B,0x35], [0xFF,0x99,0x22]] },
    { ox: -14, h: 0.60, w: 62, phase: 0.5, sway: 15, colors: [[0xFF,0x6B,0x35], [0xFF,0x99,0x22], [0xFF,0xCC,0x33]] },
    { ox:  20, h: 0.65, w: 52, phase: 1.8, sway: 13, colors: [[0xFF,0x6B,0x35], [0xFF,0x99,0x22], [0xFF,0xCC,0x33]] },
    { ox:   0, h: 0.74, w: 45, phase: 0.9, sway: 8,  colors: [[0xFF,0x99,0x22], [0xFF,0xCC,0x33], [0xFF,0xEE,0x88]] },
    { ox:  -8, h: 0.54, w: 38, phase: 2.3, sway: 11, colors: [[0xFF,0x6B,0x35], [0xFF,0x99,0x22], [0xFF,0xCC,0x33]] },
    { ox:  38, h: 0.36, w: 28, phase: 1.5, sway: 9,  colors: [[0xCC,0x33,0x00], [0xFF,0x55,0x22], [0xFF,0x6B,0x35]] },
    { ox: -42, h: 0.33, w: 25, phase: 0.3, sway: 8,  colors: [[0xAA,0x22,0x00], [0xCC,0x33,0x00], [0xFF,0x55,0x22]] },
    { ox:  12, h: 0.50, w: 32, phase: 2.8, sway: 10, colors: [[0xFF,0x55,0x22], [0xFF,0x6B,0x35], [0xFF,0x99,0x22]] },
  ];

  for (const tongue of tongues) {
    // Per-frame sway and height variation.
    const sway = Math.sin(t * 3.0 + tongue.phase) * tongue.sway;
    const hVar = 1 + Math.sin(t * 2.2 + tongue.phase * 1.3) * 0.12;
    const wVar = 1 + Math.sin(t * 1.8 + tongue.phase * 0.7) * 0.08;

    const tx = cx + tongue.ox + sway;
    const flameH = h * tongue.h * hVar;
    const flameW = tongue.w * wVar;

    const [c0, c1, c2] = tongue.colors;
    // 5-layer gradient: outer → deep → mid → inner → core.
    fillEllipse(tx, flameBase - flameH * 0.35, flameW * 1.1, flameH * 0.58, c0[0], c0[1], c0[2], 80);
    fillEllipse(tx, flameBase - flameH * 0.38, flameW, flameH * 0.52, c0[0], c0[1], c0[2], 110);
    fillEllipse(tx, flameBase - flameH * 0.42, flameW * 0.72, flameH * 0.46, c1[0], c1[1], c1[2], 140);
    fillEllipse(tx, flameBase - flameH * 0.45, flameW * 0.48, flameH * 0.38, c2[0], c2[1], c2[2], 170);
    fillEllipse(tx, flameBase - flameH * 0.42, flameW * 0.25, flameH * 0.30, c2[0], c2[1], c2[2], 200);
  }

  // Central white-hot core — pulses with frame.
  const corePulse = 1 + Math.sin(t * 3.5) * 0.1;
  fillEllipse(cx, flameBase - 50, 48 * corePulse, 80 * corePulse, 0xFF, 0xCC, 0x33, 140);
  fillEllipse(cx, flameBase - 60, 38 * corePulse, 68 * corePulse, 0xFF, 0xEE, 0x88, 175);
  fillEllipse(cx, flameBase - 72, 24 * corePulse, 52 * corePulse, 0xFF, 0xFF, 0xBB, 155);
  fillEllipse(cx, flameBase - 82, 14 * corePulse, 38 * corePulse, 0xFF, 0xFF, 0xDD, 135);

  // Smoke wisps — faint grey above the flame tips.
  for (let s = 0; s < 5; s++) {
    const smokeX = cx + Math.sin(t * 1.5 + s * 1.7) * 30;
    const smokeY = flameBase - h * 0.55 - s * 25 - Math.sin(t + s) * 10;
    const smokeA = Math.max(0, 30 - s * 5);
    fillEllipse(smokeX, smokeY, 20 + s * 8, 12 + s * 4, 0x88, 0x88, 0x99, smokeA);
  }

  // Sparks — 80 bright dots, positions drift upward per frame.
  const seed = 42;
  function pseudoRandom(i) { return ((i * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff; }
  for (let i = 0; i < 80; i++) {
    const baseX = cx + (pseudoRandom(seed + i) - 0.5) * w * 0.5;
    const baseY = flameBase - h * 0.2 - pseudoRandom(seed + i + 100) * h * 0.45;
    // Sparks drift upward and sway per frame.
    const drift = (t * 20 + pseudoRandom(seed + i + 500) * 60) % (h * 0.5);
    const swayX = Math.sin(t * 2 + pseudoRandom(seed + i + 600) * 6) * 8;
    const sx = baseX + swayX;
    const sy = baseY - drift;
    // Fade as they rise.
    const life = 1 - drift / (h * 0.5);
    if (life <= 0) continue;
    const sparkSize = (2 + pseudoRandom(seed + i + 200) * 4) * life;
    const sparkAlpha = (100 + pseudoRandom(seed + i + 300) * 155) * life;
    const colorChoice = pseudoRandom(seed + i + 400);
    const sr = 0xFF;
    const sg = colorChoice > 0.6 ? 0xEE : colorChoice > 0.3 ? 0xCC : 0x99;
    const sb = colorChoice > 0.6 ? 0x88 : colorChoice > 0.3 ? 0x33 : 0x22;
    fillEllipse(sx, sy, sparkSize, sparkSize, sr, sg, sb, Math.round(sparkAlpha));
  }

  // Heat shimmer — subtle distortion dots above flames.
  for (let i = 0; i < 20; i++) {
    const hx = cx + (pseudoRandom(seed + i + 700) - 0.5) * w * 0.4;
    const hy = flameBase - h * 0.5 - pseudoRandom(seed + i + 800) * h * 0.2;
    const shimmer = Math.sin(t * 4 + i * 0.8) * 0.5 + 0.5;
    fillEllipse(hx, hy + Math.sin(t * 3 + i) * 5, 6, 3, 0xFF, 0xDD, 0x88, Math.round(15 * shimmer));
  }

  return buf;
}
