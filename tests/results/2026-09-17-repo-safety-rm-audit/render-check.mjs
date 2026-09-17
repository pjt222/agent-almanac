#!/usr/bin/env node
// render-check.mjs — assert that workflows/_template.mjs renders its REPO_SAFETY preamble
// correctly, that it parses in the Workflow dialect, and that no line in the file teaches an
// unguarded variable used as a path root.
//
// WHY THIS FILE IS PARANOID
// ------------------------
// Five adversarial rounds on PR #859 found five instances of one class, three of them in this
// file's own ancestors:
//
//   v1  the unbraced predicate was /"\$DIR"/ — a closing quote right after DIR — while the
//       forbidden shape is "$DIR/fixtures". It could not match what it forbade. An exemption on
//       the word "not" suppressed offending lines, and the count never reached the exit code.
//   v2  a `wrap` block wrote UNWRAPPED source to a file named `wrapped.mjs`, never read it back,
//       never parsed it, and never deleted the temp directory — under a comment saying "Parse in
//       the Workflow dialect". A mutant inserting a top-level `export` (the exact break the
//       template's own header warns about) passed at exit 0.
//   v2  the predicate was hardcoded to DIR, so the template's own demonstration — which uses
//       $WORK — could be unbraced without detection, regressing an earlier round's finding
//       inside the very block this check was extended to cover.
//
// The rule those cost: a self-check must compare two values produced by DIFFERENT code, every
// assertion must reach the exit code, and the self-test must show each arm firing for ITS OWN
// reason rather than a collateral one. `--self-test` prints the reason, not just the count.
//
// Usage: node render-check.mjs [path/to/_template.mjs]
//        node render-check.mjs --self-test

import { readFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
// tests/results/<slug>/ -> repository root. Derived, never hardcoded: an ancestor wrote an
// absolute path into a session scratchpad, which is ENOENT for anyone else after a reboot.
const REPO_ROOT = resolve(HERE, '..', '..', '..');
const DEFAULT_TARGET = join(REPO_ROOT, 'workflows', '_template.mjs');

// A variable used as a PATH ROOT: `$VAR/`, `${VAR}/`, `"$VAR"`, `"${VAR}"`. Any such use without
// a `:?` guard is forbidden. Generalised from a hardcoded DIR after a mutant unbraced the
// mechanism block's $WORK and went undetected — the template demonstrates with $WORK, so a
// DIR-only predicate covered the block's location and not its content.
// Two shapes, because SHELL and JS both spell a variable `${…}` and only one of them is in
// scope. In this file's source, an UNESCAPED `${x}` is JavaScript interpolation — the workflow
// body's `${item}` and `${REPO_SAFETY}` are ordinary code and must not be flagged. Shell text
// lives either in a comment or inside the template literal, where a brace is written `\${`.
// So: a backslash-escaped brace is shell, a bare `$VAR` is shell, and a bare `${` is JS.
const SHELL_BRACED = /\\\$\{([A-Za-z_][A-Za-z0-9_]*)(:\?)?\}(?=[/"])/g;
const SHELL_BARE = /(?<![\\$}\w])\$([A-Za-z_][A-Za-z0-9_]*)(?=[/"])/g;

// Only these sentences may quote an unguarded form, and they are matched as exact substrings
// against the raw file text. Keying on a distinctive phrase rather than a word like "never"
// means rewording one makes the check FIRE rather than silently widening the exemption.
const ALLOWED_TO_QUOTE_IT = [
  'cannot tell `"$DIR/x"` from', // the audit's own limitation note
  'and never a bare \\`"$DIR/fixtures"\\`', // the prohibition itself
  '\\`"$DIR/fixtures"\\` to \\`/fixtures\\`', // what it expands to
  'rm -rf "$WORK/fixtures"        -> expands to /fixtures', // the mechanism block's unset arm
  '`rm -- "$CONTINUE_FILE"`, already absolute and guarded', // quotes a shipped block that IS guarded
];

function offendingLines(text) {
  const out = [];
  text.split('\n').forEach((line, i) => {
    if (ALLOWED_TO_QUOTE_IT.some((ok) => line.includes(ok))) return;
    for (const m of line.matchAll(SHELL_BRACED)) {
      const [, name, guard] = m;
      if (guard) continue; // `:?` present — this is the required form
      out.push({ n: i + 1, line, varName: name });
    }
    for (const m of line.matchAll(SHELL_BARE)) {
      out.push({ n: i + 1, line, varName: m[1] });
    }
  });
  return out;
}

// Extract the template literal by scanning forward and tracking backslash escapes. A non-greedy
// /`[\s\S]*?`/ terminates at the first ESCAPED backtick that ends a line, silently extracting a
// truncated literal that then dies in eval — a probe bug that reads exactly like a content bug.
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

// The Workflow dialect wrapper, reimplemented here rather than imported, so this check and the
// repository's own `scripts/lib/mutation-parse.js` are two independent statements of it. If they
// ever disagree, that is itself worth knowing.
function wrapWorkflowDialect(src) {
  const body = src.replace(/^export\s+const\s+meta\s*=/m, 'const meta =');
  return `(async () => {\n${body}\n})()`;
}

function parsesInWorkflowDialect(src) {
  const wrapped = wrapWorkflowDialect(src);
  const dir = mkdtempSync(join(tmpdir(), 'render-check-'));
  try {
    execFileSync(process.execPath, ['--input-type=module', '--check'], {
      input: wrapped,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { ok: true, bytes: wrapped.length };
  } catch (err) {
    return { ok: false, message: String(err.stderr || err.message).split('\n').slice(0, 3).join(' ') };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function check(src, { parse = true } = {}) {
  const failures = [];
  let rendered = '';

  const literal = extractLiteral(src);
  if (literal === null) {
    failures.push('could not locate a terminated REPO_SAFETY template literal');
  } else {
    try {
      rendered = eval(literal);
    } catch (err) {
      failures.push(`the template literal does not evaluate: ${err.message}`);
    }
  }

  if (rendered) {
    const escapedBackticks = (rendered.match(/\\`/g) || []).length;
    if (escapedBackticks !== 0) {
      failures.push(`${escapedBackticks} escaped backtick(s) survive into the rendered string`);
    }
    const braces = rendered.match(/\$\{[^}]*\}/g) || [];
    const notGuards = braces.filter((b) => !b.includes(':?'));
    if (notGuards.length > 0) {
      failures.push(`rendered \${} that are not :? guards: ${notGuards.join(', ')}`);
    }
  }

  // THE WHOLE FILE, not only the rendered literal — the comment block above the literal is the
  // rule's primary justification and an ancestor of this check never looked at it.
  // Deliberately NOT inside an else: a file that both breaks the literal and teaches the
  // unguarded form must report both, which an early return hid.
  for (const { line, n, varName } of offendingLines(src)) {
    failures.push(`line ${n} uses $${varName} as an unguarded path root: ${line.trim()}`);
  }

  if (parse) {
    const p = parsesInWorkflowDialect(src);
    if (!p.ok) failures.push(`does not parse in the Workflow dialect: ${p.message}`);
  }

  return { failures, rendered };
}

// --- self-test: every arm must fire for ITS OWN reason ------------------------------------
if (process.argv.includes('--self-test')) {
  if (!existsSync(DEFAULT_TARGET)) {
    console.error(`REFUSED: no template at ${DEFAULT_TARGET} — run this from its own directory`);
    process.exit(2);
  }
  const good = readFileSync(DEFAULT_TARGET, 'utf8');
  const arms = [
    ['baseline (the shipped template)', good, null],
    [
      'a line teaching the unguarded form',
      good.replace(
        '- Name an ABSOLUTE path',
        '- Always write \\`rm -rf "$DIR/fixtures"\\` for cleanup.\n- Name an ABSOLUTE path'
      ),
      /uses \$DIR as an unguarded path root/,
    ],
    [
      'the same, in a sentence containing the word "not"',
      good.replace(
        '- Name an ABSOLUTE path',
        '- It does not matter, write \\`rm -rf "$DIR/fixtures"\\`.\n- Name an ABSOLUTE path'
      ),
      /uses \$DIR as an unguarded path root/,
    ],
    [
      'a DIFFERENT variable unbraced in the mechanism block',
      good.replace(
        'rm -rf "${WORK:?}/fixtures"    -> resolved against $WORK',
        'rm -rf "$WORK/fixtures"        -> resolved against $WORK'
      ),
      /uses \$WORK as an unguarded path root/,
    ],
    [
      'an unquoted path root',
      good.replace('- Name an ABSOLUTE path', '- Write \\`rm -rf $DIR/fixtures\\`.\n- Name an ABSOLUTE path'),
      /uses \$DIR as an unguarded path root/,
    ],
    [
      'braced but not guarded',
      good.replace(
        '- Name an ABSOLUTE path',
        '- Write \\`rm -rf "\\${DIR}/fixtures"\\`.\n- Name an ABSOLUTE path'
      ),
      /uses \$DIR as an unguarded path root/,
    ],
    [
      'a stray top-level export (breaks the Workflow dialect)',
      good + '\nexport const STRAY = 1;\n',
      /does not parse in the Workflow dialect/,
    ],
  ];

  let bad = 0;
  for (const [name, src, expected] of arms) {
    const { failures } = check(src);
    if (expected === null) {
      const ok = failures.length === 0;
      if (!ok) bad++;
      console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: ${failures.length} failure(s)`);
      for (const f of failures) console.log(`        ${f}`);
    } else {
      const hit = failures.find((f) => expected.test(f));
      if (!hit) bad++;
      console.log(
        `${hit ? 'PASS' : 'FAIL'}  ${name}: ${hit ? `fired for its own reason: ${hit}` : `expected ${expected}, got ${JSON.stringify(failures)}`}`
      );
    }
  }
  console.log(
    bad === 0
      ? `self-test: ${arms.length} arm(s); the baseline is clean and every other arm fires for its named reason`
      : `self-test: ${bad} arm(s) behaved wrongly`
  );
  process.exit(bad === 0 ? 0 : 1);
}

// --- normal run ---------------------------------------------------------------------------
const target = process.argv[2] || DEFAULT_TARGET;
if (!existsSync(target)) {
  console.error(`REFUSED: no such file: ${target}`);
  console.error('  (this script derives the repository root from its own location; a copy placed');
  console.error('   elsewhere must be given the template path as an argument)');
  process.exit(2);
}
const src = readFileSync(target, 'utf8');
const { failures, rendered } = check(src);
const offenders = offendingLines(src);

console.log(`target: ${target}`);
console.log(`rendered: ${rendered.length} chars`);
console.log('--- every rendered line mentioning a path-root variable ---');
for (const line of rendered.split('\n')) if (/\$\{?[A-Za-z_]/.test(line)) console.log('  ' + line);
console.log(`--- lines in the FILE using an unguarded variable as a path root: ${offenders.length} ---`);
for (const { line, n, varName } of offenders) console.log(`  ${n} ($${varName}): ${line.trim()}`);

if (failures.length > 0) {
  console.error(`\nFAILED (${failures.length}):`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log('\nOK: renders cleanly, parses in the Workflow dialect, no unguarded path root.');
