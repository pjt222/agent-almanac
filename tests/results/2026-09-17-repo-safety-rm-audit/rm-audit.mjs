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
//
// Two things it deliberately does NOT do quietly. A directory it cannot list is recorded in
// `walkErrors` and makes the run refuse, rather than being swallowed by a bare catch — a
// permission-denied subdirectory otherwise removes files from the corpus and reports clean. And
// `Dirent.isDirectory()` has lstat semantics, so a symlinked session directory is neither
// descended into nor reported; `statSync` (which follows) decides that here, and a symlink loop
// is bounded by `seen`.
const walkErrors = [];
const nonJsonlSeen = [];
function walk(dir, acc = [], seen = new Set()) {
  let real;
  try {
    real = statSync(dir).isDirectory() ? dir : null;
  } catch (err) {
    walkErrors.push(`${dir}: ${err.code || err.message}`);
    return acc;
  }
  if (real === null) return acc;
  const key = String(statSync(dir).ino);
  if (seen.has(key)) return acc;
  seen.add(key);

  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    walkErrors.push(`${dir}: ${err.code || err.message}`);
    return acc;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    let isDir;
    try {
      isDir = statSync(full).isDirectory();
    } catch (err) {
      walkErrors.push(`${full}: ${err.code || err.message}`);
      continue;
    }
    if (isDir) walk(full, acc, seen);
    else if (e.name.endsWith('.jsonl')) acc.push(full);
    // A rotated or oddly-suffixed transcript would be skipped in silence otherwise. `.meta.json`
    // is the known sidecar Claude Code writes beside every transcript and is not one.
    else if (/\.jsonl[._\d]/.test(e.name) && !e.name.endsWith('.meta.json')) {
      nonJsonlSeen.push(full);
    }
  }
  return acc;
}

// A SECOND, DIFFERENT TRAVERSAL — not the same one counted twice.
//
// Version 2 of this file printed `candidates` beside `scanned` and called it independent. It was
// not: both came from `walk()`, so any blindness in `walk` was invisible to the check. Proven by
// mutant — reintroducing version 1's exact defect (`if (e.isDirectory()) walk(...)` -> `continue`)
// left every guard intact and printed `106 / 106 / 0 risky-absolute`, exit 0. A self-check that
// compares a value with itself is not a check at all, at the level of a variable or of a function.
//
// `readdirSync(root, { recursive: true })` is Node's own implementation, available since 20.1 and
// inside this package's `engines.node` of >=22.12.0. It agrees with `find(1)` at 739. Using it
// here means the count and the scan share no code.
function nodeRecursiveCount(root) {
  try {
    return readdirSync(root, { recursive: true, withFileTypes: true }).filter(
      (e) => e.isFile() && e.name.endsWith('.jsonl')
    ).length;
  } catch {
    return null;
  }
}

const candidates = [];
let crossCount = 0;
const unreadableRoots = [];
const emptyRoots = [];
for (const root of roots) {
  const before = candidates.length;
  walk(root, candidates);
  const n = nodeRecursiveCount(root);
  if (n === null) {
    unreadableRoots.push(root);
    continue;
  }
  crossCount += n;
  if (candidates.length - before === 0) emptyRoots.push(root);
}
const candidateCount = candidates.length;

// Every refusal below exists because a scan that reports a plausible number while missing files
// is the failure this file documents. None of them can be satisfied by the scan agreeing with
// itself.
if (unreadableRoots.length > 0) {
  console.error(`REFUSED: root(s) could not be read: ${unreadableRoots.join(', ')}`);
  process.exit(2);
}
if (emptyRoots.length > 0) {
  console.error(
    `REFUSED: root(s) contributed no .jsonl — a mistyped root beside a good one reports clean: ${emptyRoots.join(', ')}`
  );
  process.exit(2);
}
if (walkErrors.length > 0) {
  console.error(
    `REFUSED: ${walkErrors.length} directory/ies could not be listed, so the corpus is unknown:\n  ${walkErrors.slice(0, 5).join('\n  ')}`
  );
  process.exit(2);
}
if (candidateCount !== crossCount) {
  console.error(
    `REFUSED: two independent traversals disagree — walk() found ${candidateCount}, ` +
      `node readdirSync({recursive:true}) found ${crossCount}. One of them is blind.`
  );
  process.exit(2);
}

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
console.log(
  `  candidate .jsonl on disk ${candidateCount}   (walk(), cross-checked against node readdirSync({recursive:true}) = ${crossCount})`
);
if (nonJsonlSeen.length > 0) {
  console.log(
    `  NOTE: ${nonJsonlSeen.length} file(s) beneath the roots look transcript-like but are not .jsonl and were NOT read:`
  );
  for (const p of nonJsonlSeen.slice(0, 5)) console.log(`    ${p}`);
}
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
