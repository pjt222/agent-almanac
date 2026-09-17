#!/usr/bin/env node
// rm-audit.mjs — re-derive the `rm` classification behind the REPO_SAFETY absolute-path rule.
//
// Reads Claude Code subagent transcripts, extracts every Bash `command` string, splits it into
// command lines, keeps the lines that invoke `rm`, and classifies each one. Prints the
// denominator at every stage, because a scan that reports a verdict without reporting what it
// scanned over is this repository's most-repeated instrument failure.
//
// Usage: node rm-audit.mjs <transcript-dir>... [--since YYYY-MM-DD]

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const sinceIdx = args.indexOf('--since');
const since = sinceIdx === -1 ? null : new Date(args[sinceIdx + 1] + 'T00:00:00Z');
const dirs = args.filter(
  (a, i) => a !== '--since' && a !== '--rows' && !(sinceIdx !== -1 && i === sinceIdx + 1)
);

if (dirs.length === 0) {
  console.error('usage: node rm-audit.mjs <transcript-dir>... [--since YYYY-MM-DD]');
  process.exit(2);
}

const transcripts = [];
for (const dir of dirs) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    continue;
  }
  for (const name of entries) {
    if (!name.endsWith('.jsonl')) continue;
    const full = join(dir, name);
    const mtime = statSync(full).mtime;
    if (since && mtime < since) continue;
    transcripts.push({ path: full, mtime });
  }
}

if (transcripts.length === 0) {
  console.error('REFUSED: no transcripts matched — a scan over nothing reports clean');
  process.exit(2);
}

// Pull every Bash command string out of a transcript.
function bashCommands(path) {
  const out = [];
  const text = readFileSync(path, 'utf8');
  for (const line of text.split('\n')) {
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

// Split a command string into individual command lines. Deliberately crude: newlines and the
// shell operators that start a new command. It over-splits inside quotes, which inflates the
// denominator rather than hiding a finding, so it fails in the safe direction.
function commandLines(cmd) {
  return cmd
    .split(/\n|&&|\|\||;|\|/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Broad: `rm` appears as a word anywhere on the line — includes `echo "... rm ..."` and
// comments, so it OVER-counts. Strict: the line INVOKES rm, i.e. `rm` is the command word
// (optionally behind sudo/git/time or a leading redirect-free prefix). Both are reported,
// because the gap between them is the instrument's noise and hiding it is the failure this
// audit is correcting.
const RM = /(^|[\s(])rm(\s|$)/;
const RM_INVOKED = /^(sudo\s+|command\s+|time\s+|\\)?(git\s+)?rm(\s|$)/;

const REPO = '/mnt/d/dev/p/agent-almanac';

function classify(line) {
  // Operands are everything after `rm` that is not a flag.
  const afterRm = line.replace(/^.*?\brm\b/, '');
  const tokens = afterRm.split(/\s+/).filter(Boolean);
  const operands = [];
  for (const t of tokens) {
    if (t === '--') continue;
    if (t.startsWith('-')) continue;
    operands.push(t.replace(/^["']|["']$/g, ''));
  }
  if (operands.length === 0) return 'flag-only';

  let sawAbsolute = false;
  for (const op of operands) {
    const bare = op.replace(/^["']/, '');
    // A $VAR-rooted path is absolute in intent; whether it is SAFE is the separate question
    // this audit exists to raise, so it is counted as absolute-in-sandbox unless it names the
    // repository, $HOME or / directly.
    if (/^\$\{?[A-Za-z_]/.test(bare)) {
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
    // Anything left is a relative operand.
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
for (const t of transcripts) {
  const cmds = bashCommands(t.path);
  totalCommands += cmds.length;
  for (const cmd of cmds) {
    for (const line of commandLines(cmd)) {
      if (RM.test(line)) broadLines++;
      if (!RM_INVOKED.test(line)) continue;
      buckets[classify(line)].push({ file: t.path.split('/').pop(), line });
    }
  }
}

const rmTotal = Object.values(buckets).reduce((n, b) => n + b.length, 0);

console.log('DENOMINATORS');
console.log(`  transcripts scanned      ${transcripts.length}`);
console.log(`  Bash command strings     ${totalCommands}`);
console.log(`  lines MENTIONING rm      ${broadLines}   (broad: includes echo/comment text)`);
console.log(`  lines INVOKING rm        ${rmTotal}   (strict: rm is the command word)`);
console.log('');
console.log('CLASSIFICATION');
for (const [name, rows] of Object.entries(buckets)) {
  console.log(`  ${name.padEnd(22)} ${String(rows.length).padStart(4)}`);
}
const sum = Object.values(buckets).reduce((n, b) => n + b.length, 0);
console.log(`  ${'sum'.padEnd(22)} ${String(sum).padStart(4)}   (must equal lines INVOKING rm)`);

if (process.argv.includes('--rows')) {
  for (const [name, rows] of Object.entries(buckets)) {
    console.log(`\n--- ${name} (${rows.length}) ---`);
    for (const r of rows) console.log(`  ${r.file}  ${r.line.slice(0, 160)}`);
  }
}
