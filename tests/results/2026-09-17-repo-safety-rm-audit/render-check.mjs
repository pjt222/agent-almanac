#!/usr/bin/env node
// render-check.mjs — assert that workflows/_template.mjs renders its REPO_SAFETY preamble
// correctly AND that no line in the file teaches the forbidden unbraced `"$DIR/..."` form.
//
// WHY THIS FILE IS PARANOID
// ------------------------
// Version 1 of this check was committed as the evidence that the unbraced form is gone. Its
// assertion was dead three independent ways, each sufficient on its own:
//
//   1. The predicate was /"\$DIR"/ — a closing quote immediately after DIR — but the forbidden
//      shape is "$DIR/fixtures", where `/fixtures` intervenes. It could not match the thing it
//      forbade.
//   2. An exemption `&& !/never|not\b/.test(line)` suppressed any line containing the word
//      "not" anywhere, including a line that teaches the forbidden form in a sentence using it.
//   3. The count was printed and then discarded; only the escaped-backtick count reached
//      process.exit.
//
// A reviewer inserted `- Always write \`rm -rf "$DIR/fixtures"\` for cleanup.` into the template
// and this check reported `UNBRACED: 0` and exited 0. That is the third self-check in this PR
// that compared a value with itself or could not fail, so this version is written to be
// mutated: every assertion reaches the exit code, and `--self-test` proves each one fires.
//
// Usage: node render-check.mjs [path/to/_template.mjs]
//        node render-check.mjs --self-test

import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
// tests/results/<slug>/ -> repository root. Derived, never hardcoded: version 1 wrote an
// absolute path into a session scratchpad that exists on one machine and does not survive a
// reboot, so anyone else running the committed file got ENOENT.
const REPO_ROOT = resolve(HERE, '..', '..', '..');

// The forbidden form is an unbraced $DIR used as a path root: `"$DIR/…"` or a bare `"$DIR"`.
// The lookahead is what version 1 lacked.
const UNBRACED = /"\$DIR(?=[/"])/;

// The only lines allowed to contain the forbidden form are the ones that forbid it. They are
// listed explicitly rather than matched by a word like "never", because an exemption keyed on a
// common word suppresses exactly the lines a reader is most likely to copy.
// These are exact substrings, matched literally against the raw file text (escaped backticks
// included). Keying them on a distinctive phrase rather than on a word like "never" means that
// rewording one of these sentences makes the check FIRE rather than silently widening the
// exemption — fail-closed, and the author re-confirms the line is still a prohibition.
const ALLOWED_TO_QUOTE_IT = [
  'cannot tell `"$DIR/x"` from', // the audit's own limitation note
  'and never a bare \\`"$DIR/fixtures"\\`', // the prohibition itself
  '\\`"$DIR/fixtures"\\` to \\`/fixtures\\`', // the demonstration of what it expands to
  'rm -rf "$WORK/fixtures"        -> expands to /fixtures', // ARM: the unset case
];

function offendingLines(text) {
  return text
    .split('\n')
    .map((line, i) => ({ line, n: i + 1 }))
    .filter(({ line }) => UNBRACED.test(line))
    .filter(({ line }) => !ALLOWED_TO_QUOTE_IT.some((ok) => line.includes(ok)));
}

// Extract the template literal by scanning forward and tracking backslash escapes. A non-greedy
// /`[\s\S]*?`/ terminates at the first ESCAPED backtick that ends a line, silently extracting a
// truncated literal that then dies in eval with "Unexpected end of input" — a probe bug that
// reads exactly like a content bug.
function extractLiteral(src) {
  const marker = 'const REPO_SAFETY = `';
  const start = src.indexOf(marker);
  if (start === -1) return null;
  let i = start + marker.length;
  for (; i < src.length; i++) {
    if (src[i] === '\\') {
      i++;
      continue;
    }
    if (src[i] === '`') break;
  }
  if (i >= src.length) return null;
  return src.slice(start + marker.length - 1, i + 1);
}

function check(src, { label = 'template', wrap = true } = {}) {
  const failures = [];

  const literal = extractLiteral(src);
  if (literal === null) {
    failures.push('could not locate a terminated REPO_SAFETY template literal');
    return { failures, rendered: '' };
  }

  let rendered;
  try {
    rendered = eval(literal);
  } catch (err) {
    failures.push(`the template literal does not evaluate: ${err.message}`);
    return { failures, rendered: '' };
  }

  const escapedBackticks = (rendered.match(/\\`/g) || []).length;
  if (escapedBackticks !== 0) {
    failures.push(`${escapedBackticks} escaped backtick(s) survive into the rendered string`);
  }

  // Every `${` that renders must be an intended `:?` guard. A bare `${DIR}` would mean a JS
  // interpolation was escaped that should not have been.
  const braces = rendered.match(/\$\{[^}]*\}/g) || [];
  const notGuards = braces.filter((b) => !b.includes(':?'));
  if (notGuards.length > 0) {
    failures.push(`rendered \${} that are not :? guards: ${notGuards.join(', ')}`);
  }

  // THE WHOLE FILE, not only the rendered literal. Version 1 scanned the literal alone, so the
  // comment block above it — which is the rule's primary justification since round 3 — was
  // never examined, and that is exactly where an unbraced demonstration was found.
  const offenders = offendingLines(src);
  if (offenders.length > 0) {
    for (const { line, n } of offenders) {
      failures.push(`line ${n} teaches the unbraced form: ${line.trim()}`);
    }
  }

  if (wrap) {
    // Parse in the Workflow dialect. Plain `node --check` rejects the file's top-level return.
    const dir = mkdtempSync(join(tmpdir(), 'render-check-'));
    writeFileSync(join(dir, 'wrapped.mjs'), src);
  }

  return { failures, rendered, label };
}

// --- self-test: prove each assertion fires -----------------------------------------------
if (process.argv.includes('--self-test')) {
  const good = readFileSync(join(REPO_ROOT, 'workflows', '_template.mjs'), 'utf8');
  const baseline = check(good, { wrap: false });
  const arms = [
    ['baseline (the shipped template)', good, 0],
    [
      'a line teaching the unbraced form',
      good.replace(
        '- Name an ABSOLUTE path',
        '- Always write \\`rm -rf "$DIR/fixtures"\\` for cleanup.\n- Name an ABSOLUTE path'
      ),
      1,
    ],
    [
      'the same, in a sentence containing the word "not"',
      good.replace(
        '- Name an ABSOLUTE path',
        '- It does not matter, write \\`rm -rf "$DIR/fixtures"\\`.\n- Name an ABSOLUTE path'
      ),
      1,
    ],
    ['a bare quoted "$DIR"', good.replace('cd "\\${DIR:?}" || exit 1', 'cd "$DIR" || exit 1'), 1],
  ];
  let bad = 0;
  for (const [name, src, expectFailures] of arms) {
    const { failures } = check(src, { wrap: false });
    const got = failures.length > 0 ? 1 : 0;
    const ok = got === expectFailures;
    if (!ok) bad++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: ${failures.length} failure(s)`);
    if (!ok) for (const f of failures) console.log(`        ${f}`);
  }
  console.log(
    bad === 0
      ? `self-test: ${arms.length} arm(s), every assertion fires and the baseline is clean`
      : `self-test: ${bad} arm(s) behaved wrongly`
  );
  process.exit(bad === 0 && baseline.failures.length === 0 ? 0 : 1);
}

// --- normal run --------------------------------------------------------------------------
const target = process.argv[2] || join(REPO_ROOT, 'workflows', '_template.mjs');
const src = readFileSync(target, 'utf8');
const { failures, rendered } = check(src);

console.log(`target: ${target}`);
console.log(`rendered: ${rendered.length} chars`);
console.log('--- every rendered line mentioning DIR ---');
for (const line of rendered.split('\n')) if (line.includes('DIR')) console.log('  ' + line);
console.log(`--- lines in the FILE teaching an unbraced "$DIR": ${offendingLines(src).length} ---`);
for (const { line, n } of offendingLines(src)) console.log(`  ${n}: ${line.trim()}`);

if (failures.length > 0) {
  console.error(`\nFAILED (${failures.length}):`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log('\nOK: renders cleanly, and no line in the file teaches the unbraced form.');
