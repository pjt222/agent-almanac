#!/usr/bin/env node
/**
 * enotempty-probe.mjs — does a concurrent writer make `rmSync` throw ENOTEMPTY, and what clears it?
 *
 * Usage: node enotempty-probe.mjs [trials=20] [writerMs=60]
 *
 * Each trial: a fresh temp directory with one subdirectory; a child `node -e` that creates files in
 * that subdirectory in a tight loop for `writerMs` ms; wait until the child's FIRST file is visible
 * (node's start-up is slower than any spin, and a probe that does not wait measures nothing); then
 * one removal with the arm's options. Four arms: the bare teardown, `maxRetries` as #791 proposed,
 * a longer `maxRetries`, and `rmTree` from `scripts/test/_tmp.js`. Counts per outcome are printed.
 *
 * The result that matters is in RESULT.md beside this file: on Node 22 `maxRetries` clears nothing.
 */
import { mkdtempSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { rmTree } from '../../../scripts/test/_tmp.js';

const N = Number(process.argv[2] ?? 20);
const WRITE_MS = Number(process.argv[3] ?? 60);
const writer = `
  const fs = require('node:fs'); const p = process.argv[1]; const until = Date.now() + ${WRITE_MS};
  let i = 0; while (Date.now() < until) { try { fs.writeFileSync(p + '/f' + (i++), 'x'); } catch {} }
`;

function trial(remove) {
  const dir = mkdtempSync(join(tmpdir(), 'enotempty-'));
  const sub = join(dir, 'sub');
  mkdirSync(sub);
  const child = spawn(process.execPath, ['-e', writer, sub], { stdio: 'ignore' });
  const deadline = Date.now() + 2000;
  let seen = 0;
  while (Date.now() < deadline) {
    try { seen = readdirSync(sub).length; } catch { /* the child may not have started */ }
    if (seen > 0) break;
  }
  const started = Date.now();
  let outcome;
  try { remove(dir); outcome = 'removed'; } catch (error) { outcome = error.code ?? String(error); }
  const elapsed = Date.now() - started;
  return new Promise((resolve) => child.on('exit', () => {
    try { rmTree(dir, { attempts: 20, delayMs: 20 }); } catch { /* best effort */ }
    resolve({ outcome, elapsed, seen });
  }));
}

async function arm(label, remove) {
  const counts = {};
  let maxElapsed = 0;
  let minSeen = Infinity;
  for (let i = 0; i < N; i++) {
    const r = await trial(remove);
    counts[r.outcome] = (counts[r.outcome] ?? 0) + 1;
    maxElapsed = Math.max(maxElapsed, r.elapsed);
    minSeen = Math.min(minSeen, r.seen);
  }
  console.log(`${label.padEnd(46)} ${JSON.stringify(counts)} max_elapsed_ms=${maxElapsed} min_files_seen_before_rm=${minSeen}`);
}

console.log(`node ${process.version}, trials=${N}, writer active ${WRITE_MS}ms after its first file`);
await arm('bare rmSync (the teardown as it was)', (d) => rmSync(d, { recursive: true, force: true }));
await arm('maxRetries:3 retryDelay:50 (the fix as proposed)', (d) => rmSync(d, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 }));
await arm('maxRetries:10 retryDelay:20', (d) => rmSync(d, { recursive: true, force: true, maxRetries: 10, retryDelay: 20 }));
await arm('rmTree (scripts/test/_tmp.js, defaults)', (d) => rmTree(d));
