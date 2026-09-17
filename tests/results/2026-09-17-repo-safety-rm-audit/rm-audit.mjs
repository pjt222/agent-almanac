#!/usr/bin/env node
// rm-audit.mjs — re-derive the `rm` classification behind the REPO_SAFETY absolute-path rule.
//
// Reads Claude Code subagent transcripts, extracts every Bash `command` string, splits it into
// command lines, keeps the lines that INVOKE `rm`, and classifies each one.
//
// WHY THIS WALKS RECURSIVELY, IN ITS OWN COMMENT BECAUSE IT SHIPPED WRONG ONCE
// ---------------------------------------------------------------------------
// Version 1 used a bare `readdirSync(dir)`, which is NOT recursive. Under this project the
// transcripts sit at two depths:
//
//     <session>/subagents/agent-<name>.jsonl                    106 files
//     <session>/subagents/workflows/wf_<id>/agent-<name>.jsonl  633 files
//
// so it read 106 of 739 — 14% — and every one of the 633 it skipped belonged to a
// WORKFLOW-spawned agent. An audit justifying the workflow template's own safety preamble
// therefore excluded exactly the population that preamble governs, and published "zero risky
// absolute paths" off the minority that remained. At full scope that claim is false.
//
// The lesson is not "recurse". It is that a printed denominator proves what the scan read and
// never what it should have read. So this version prints a SECOND number beside it — an
// independent recursive count of candidate files — and REFUSES when the two disagree.
//
// Usage: node rm-audit.mjs <transcript-root>... [--since YYYY-MM-DD] [--until YYYY-MM-DD]
//                          [--rows] [--list FILE]

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const argv = process.argv.slice(2);
function flagValue(name) {
  const i = argv.indexOf(name);
  return i === -1 ? null : argv[i + 1];
}
const since = flagValue('--since') ? new Date(flagValue('--since') + 'T00:00:00Z') : null;
const until = flagValue('--until') ? new Date(flagValue('--until') + 'T23:59:59Z') : null;
const listPath = flagValue('--list');
const consumed = new Set();
for (const f of ['--since', '--until', '--list']) {
  const i = argv.indexOf(f);
  if (i !== -1) {
    consumed.add(i);
    consumed.add(i + 1);
  }
}
const roots = argv.filter((a, i) => !consumed.has(i) && !a.startsWith('--'));

if (roots.length === 0) {
  console.error('usage: node rm-audit.mjs <transcript-root>... [--since D] [--until D] [--rows]');
  process.exit(2);
}

// Recursive walk. Returns every .jsonl beneath the root at any depth.
function walk(dir, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (e.isFile() && e.name.endsWith('.jsonl')) acc.push(full);
  }
  return acc;
}

const candidates = [];
for (const root of roots) candidates.push(...walk(root));

// The independent denominator: how many candidate files exist beneath the roots, before any
// date filter. `scanned` below must equal this minus whatever the date filter removes, and the
// two are printed together so a silent scope loss cannot hide behind a plausible number.
const candidateCount = candidates.length;

const transcripts = [];
let filteredOut = 0;
for (const path of candidates) {
  const mtime = statSync(path).mtime;
  if (since && mtime < since) {
    filteredOut++;
    continue;
  }
  if (until && mtime > until) {
    filteredOut++;
    continue;
  }
  transcripts.push({ path, mtime });
}

if (candidateCount === 0) {
  console.error('REFUSED: no .jsonl found beneath the roots — a scan over nothing reports clean');
  process.exit(2);
}
if (transcripts.length === 0) {
  console.error(
    `REFUSED: ${candidateCount} candidate file(s) exist but the date filter removed all of them`
  );
  process.exit(2);
}
if (transcripts.length + filteredOut !== candidateCount) {
  console.error(
    `REFUSED: scanned ${transcripts.length} + filtered ${filteredOut} != ${candidateCount} candidates`
  );
  process.exit(2);
}

function bashCommands(path) {
  const out = [];
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    let rec;
    try {
      rec = JSON.parse(line);
    } catch {
      continue;
    }
    const content = rec?.message?.content;
    if (!Array.isArray(content)) continue;
    for (const block of content) {
      if (block?.type === 'tool_use' && block?.name === 'Bash') {
        const cmd = block?.input?.command;
        if (typeof cmd === 'string') out.push(cmd);
      }
    }
  }
  return out;
}

// Crude on purpose: newlines plus the operators that begin a new command. It over-splits inside
// quotes, which inflates the denominator rather than hiding a finding.
function commandLines(cmd) {
  return cmd
    .split(/\n|&&|\|\||;|\|/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Broad: `rm` as a word anywhere on the line — includes echo/comment text, so it OVER-counts.
// Strict: `rm` is the command word. Both are printed; the gap is the instrument's noise.
const RM = /(^|[\s(])rm(\s|$)/;
const RM_INVOKED = /^(sudo\s+|command\s+|time\s+|env\s+\S+=\S+\s+|\\)?(git\s+)?rm(\s|$)/;

const REPO = '/mnt/d/dev/p/agent-almanac';

// Buckets, and the rule each implements. The `risky-absolute` rule is stated here exactly as
// the code applies it: any path UNDER the repository, not only its root. That distinction
// decides real rows, so it is not paraphrased.
function classify(line) {
  const afterRm = line.replace(/^.*?\brm\b/, '');
  const operands = [];
  for (const t of afterRm.split(/\s+/).filter(Boolean)) {
    if (t === '--' || t.startsWith('-')) continue;
    operands.push(t.replace(/^["']|["']$/g, ''));
  }
  if (operands.length === 0) return 'flag-only';

  let sawAbsolute = false;
  for (const op of operands) {
    const bare = op.replace(/^["']/, '');
    if (/^\$\{?[A-Za-z_]/.test(bare)) {
      // Rooted at a variable. Absolute IN INTENT only — this classifier cannot know the value,
      // so it cannot tell `"$DIR/x"` from `"${DIR:?}/x"`. See RESULT.md § What this cannot measure.
      sawAbsolute = true;
      continue;
    }
    if (bare.startsWith('/')) {
      sawAbsolute = true;
      if (
        bare === '/' ||
        bare.startsWith(REPO) ||
        /^\/(home|root)\/[^/]+\/?$/.test(bare) ||
        /^\/(bin|boot|dev|etc|lib|lib64|proc|sbin|srv|sys|usr|var|mnt|opt)(\/|$)/.test(bare)
      ) {
        return 'risky-absolute';
      }
      continue;
    }
    if (bare === '.' || bare === '..' || bare === '*') return 'risky-absolute';
    if (bare.startsWith('~')) {
      sawAbsolute = true;
      if (bare === '~' || bare === '~/') return 'risky-absolute';
      continue;
    }
    return 'relative';
  }
  return sawAbsolute ? 'absolute-in-sandbox' : 'relative';
}

const buckets = {
  'risky-absolute': [],
  relative: [],
  'absolute-in-sandbox': [],
  'flag-only': [],
};

let totalCommands = 0;
let broadLines = 0;
// Counted independently of the buckets, so the sum check below is a real comparison rather
// than one expression printed twice. A line matching RM_INVOKED that classify() failed to
// bucket would show up here as a mismatch.
let strictMatches = 0;

for (const t of transcripts) {
  const cmds = bashCommands(t.path);
  totalCommands += cmds.length;
  for (const cmd of cmds) {
    for (const line of commandLines(cmd)) {
      if (RM.test(line)) broadLines++;
      if (!RM_INVOKED.test(line)) continue;
      strictMatches++;
      const bucket = classify(line);
      if (!Object.prototype.hasOwnProperty.call(buckets, bucket)) {
        console.error(`REFUSED: classify() returned an unknown bucket ${JSON.stringify(bucket)}`);
        process.exit(2);
      }
      buckets[bucket].push({ file: t.path.split('/').pop(), line });
    }
  }
}

const bucketSum = Object.values(buckets).reduce((n, b) => n + b.length, 0);

console.log('DENOMINATORS');
console.log(`  candidate .jsonl on disk ${candidateCount}   (recursive, before any date filter)`);
console.log(`  removed by date filter   ${filteredOut}`);
console.log(`  transcripts scanned      ${transcripts.length}   (must be candidates - filtered)`);
console.log(`  Bash command strings     ${totalCommands}`);
console.log(`  lines MENTIONING rm      ${broadLines}   (broad: includes echo/comment text)`);
console.log(`  lines INVOKING rm        ${strictMatches}   (strict: rm is the command word)`);
console.log('');
console.log('CLASSIFICATION');
for (const [name, rows] of Object.entries(buckets)) {
  console.log(`  ${name.padEnd(22)} ${String(rows.length).padStart(4)}`);
}
console.log(`  ${'bucket sum'.padEnd(22)} ${String(bucketSum).padStart(4)}`);
if (bucketSum !== strictMatches) {
  console.error(`REFUSED: bucket sum ${bucketSum} != strict matches ${strictMatches}`);
  process.exit(2);
}
console.log(`  bucket sum equals the independently counted strict matches (${strictMatches}).`);

if (listPath) {
  writeFileSync(listPath, transcripts.map((t) => t.path).sort().join('\n') + '\n');
  console.log(`\nscanned file list -> ${listPath} (${transcripts.length} paths)`);
}

if (argv.includes('--rows')) {
  for (const [name, rows] of Object.entries(buckets)) {
    console.log(`\n--- ${name} (${rows.length}) ---`);
    for (const r of rows) console.log(`  ${r.file}  ${r.line.slice(0, 160)}`);
  }
}
