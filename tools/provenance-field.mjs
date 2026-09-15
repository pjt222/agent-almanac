#!/usr/bin/env node
/**
 * provenance-field.mjs — read, stamp or clear a translation's provenance field, indent-aware.
 *
 *   node tools/provenance-field.mjs --field fence_basis_commit --get   'i18n/de/skills/x/SKILL.md'
 *   node tools/provenance-field.mjs --field fence_basis_commit --set 854ad675f  <paths...>
 *   node tools/provenance-field.mjs --field fence_basis_commit --clear          <paths...>
 *   node tools/provenance-field.mjs --verify
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * `scripts/lib/provenance.js` is a library. The three `evolve-*` skills prescribe it as the
 * only route for a bulk provenance edit -- because a `sed` anchored at column 0 silently
 * no-ops on the mirrors that nest provenance under `metadata:` -- and a prescription the
 * reader cannot run is not a prescription. This is the runnable form, and it is the second
 * typing of the same loop (the first cleared 20 `fence_basis_commit` values by hand), which
 * is where this repository's standing rule says a snippet becomes a file.
 *
 * WHICH FIELD MAY MOVE, AND WHEN
 * ------------------------------
 * This tool enforces nothing about that; it is the mechanism, not the policy. The policy
 * lives in `scripts/lib/provenance.js` and in the evolve-* skills:
 *
 *   * `source_commit` is what a HUMAN translated against. A tool must never move it --
 *     bumping it asserts a translation event that did not happen (#405, #552). Passing
 *     `--field source_commit` therefore requires `--i-am-a-human-retranslating`, which
 *     exists to make the claim explicit rather than incidental.
 *   * `fence_basis_commit` is which English revision a file's frozen fences mirror. It may
 *     move whenever those bytes are verified -- by `normalize-i18n-fences.js` when it does
 *     the propagating, or by this tool after `npm run check:fence-propagation` passes on a
 *     hand propagation. Absence means "unverified", which is honest; a wrong value is not.
 *
 * NOT FOR repairing a frontmatter field with `sed` (indent-blind), and not for deciding
 * whether the field SHOULD move -- read the skill for that.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  SOURCE_COMMIT_FIELD, FENCE_BASIS_FIELD,
  readFrontmatterField, stampFrontmatterField, clearFrontmatterField,
} from '../scripts/lib/provenance.js';

const FIELDS = new Set([SOURCE_COMMIT_FIELD, FENCE_BASIS_FIELD]);

function parse(argv) {
  const opts = { mode: null, field: null, value: null, paths: [], human: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--get' || a === '--clear') opts.mode = a.slice(2);
    else if (a === '--set') { opts.mode = 'set'; opts.value = argv[++i]; }
    else if (a === '--field') opts.field = argv[++i];
    else if (a === '--i-am-a-human-retranslating') opts.human = true;
    else if (a === '--verify') opts.mode = 'verify';
    else if (a.startsWith('--')) throw new Error(`unknown option ${a}`);
    else opts.paths.push(a);
  }
  return opts;
}

function apply(opts) {
  if (!opts.field || !FIELDS.has(opts.field)) {
    throw new Error(`--field must be one of: ${[...FIELDS].join(', ')}`);
  }
  if (opts.field === SOURCE_COMMIT_FIELD && opts.mode !== 'get' && !opts.human) {
    throw new Error(
      `refusing to ${opts.mode} ${SOURCE_COMMIT_FIELD}: it records what a HUMAN translated\n` +
      'against, so a tool moving it asserts a translation event that did not happen (#405,\n' +
      '#552). Pass --i-am-a-human-retranslating if you are, in the commit carrying the prose.');
  }
  if (opts.mode === 'set' && !opts.value) throw new Error('--set needs a value');
  if (!opts.paths.length) throw new Error('name at least one file');

  let changed = 0;
  for (const p of opts.paths) {
    const before = readFileSync(p, 'utf8');
    if (opts.mode === 'get') {
      console.log(`${readFrontmatterField(before, opts.field) ?? '(absent)'}\t${p}`);
      continue;
    }
    const after = opts.mode === 'set'
      ? stampFrontmatterField(before, opts.field, opts.value)
      : clearFrontmatterField(before, opts.field);
    if (after === null || after === before) {
      console.log(`unchanged\t${p}`);
      continue;
    }
    writeFileSync(p, after);
    changed += 1;
    console.log(`${opts.mode}\t${p}`);
  }
  if (opts.mode !== 'get') console.log(`${opts.mode}: ${changed} of ${opts.paths.length} file(s)`);
  return 0;
}

/** Re-derive this file's claims. Non-zero when one stops holding. */
function verify() {
  const flat = ['---', 'locale: de', `${FENCE_BASIS_FIELD}: abc1234`, '---', '', 'body', ''].join('\n');
  const nested = ['---', 'metadata:', '  locale: de', `  ${FENCE_BASIS_FIELD}: abc1234`, '---', '', 'body', ''].join('\n');
  const failures = [];
  const check = (label, ok) => {
    console.log(`  [${ok ? 'ok' : '**FAIL**'}] ${label}`);
    if (!ok) failures.push(label);
  };

  console.log('=== the indent case a column-0 sed cannot reach ===\n');
  check('reads a nested field', readFrontmatterField(nested, FENCE_BASIS_FIELD) === 'abc1234');
  check('clears a nested field',
    readFrontmatterField(clearFrontmatterField(nested, FENCE_BASIS_FIELD), FENCE_BASIS_FIELD) === null);
  check('stamps a nested field, preserving indent',
    stampFrontmatterField(nested, FENCE_BASIS_FIELD, 'def5678').includes(`  ${FENCE_BASIS_FIELD}: def5678`));
  check('clears a flat field',
    readFrontmatterField(clearFrontmatterField(flat, FENCE_BASIS_FIELD), FENCE_BASIS_FIELD) === null);

  console.log('\n=== the refusal that keeps a tool from asserting a human act ===\n');
  let refused = false;
  try {
    apply({ mode: 'clear', field: SOURCE_COMMIT_FIELD, paths: ['/dev/null'], human: false });
  } catch (e) {
    refused = /refusing to clear source_commit/.test(e.message);
  }
  check('clearing source_commit without the human flag is refused', refused);

  let allowed = true;
  try {
    apply({ mode: 'get', field: SOURCE_COMMIT_FIELD, paths: ['/dev/null'], human: false });
  } catch {
    allowed = false;
  }
  check('reading source_commit is always allowed', allowed);

  if (failures.length) {
    console.log(`\nFAILED: ${failures.length} claim(s)`);
    return 1;
  }
  console.log('\nOK: 6 claims, including the nested-indent case and the source_commit refusal');
  return 0;
}

function main(argv) {
  const opts = parse(argv);
  if (!opts.mode) { console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0]); return 2; }
  return opts.mode === 'verify' ? verify() : apply(opts);
}

try {
  process.exit(main(process.argv.slice(2)));
} catch (e) {
  console.error(`provenance-field: ${e.message}`);
  process.exit(2);
}
