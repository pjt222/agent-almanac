/**
 * Unit tests for `scripts/check-bare-substitutions.js` (#647).
 *
 * The envelope (`scripts/envelopes/bare-substitution-lint.mjs`) proves the check goes red
 * against the real corpus. These cover the parsing decisions that envelope cannot reach,
 * because each of them was a bug that made the check report the WRONG verdict rather than no
 * verdict — and a wrong verdict on a lint is worse than none, since it is read as an all-clear.
 *
 * Each test names the specific misreading it exists to catch. Four of them are regressions found
 * by running the check against this repo and disbelieving its first output — the arithmetic
 * expansion, the multi-line span, `|| return`, and the helper's own assertion style.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rmTree } from './_tmp.js';

const CHECK = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'check-bare-substitutions.js');

/**
 * Run the check over a throwaway git repo containing one script.
 *
 * A real repo, not a bare directory, because the check asks `git ls-files` rather than walking
 * the filesystem — a walk over this repo followed the `.claude/skills` symlink farm and did not
 * finish in 60 seconds.
 */
function checkScript(body, name = 'probe.sh') {
  const dir = mkdtempSync(join(tmpdir(), 'bare-subs-'));
  try {
    execFileSync('git', ['init', '-q'], { cwd: dir });
    mkdirSync(join(dir, 'scripts'), { recursive: true });
    writeFileSync(join(dir, 'scripts', name), body);
    execFileSync('git', ['add', '-A'], { cwd: dir });
    const output = execFileSync('node', [CHECK, '--root', dir, '--warn', '--list'], {
      cwd: dir, encoding: 'utf8',
    });
    // Counts, not a substring search on the whole output. The first version of this helper
    // returned the raw text and every test asserted `doesNotMatch(/UNGUARDED/)` — which fails
    // against a clean run, because the SUMMARY line reads `UNGUARDED: 0`. Eight tests went red
    // on a check that was working. Asserting on the label instead of the finding is the same
    // instrument error the repo records elsewhere; the fix is to read the number.
    const count = (label) => Number((output.match(new RegExp(`${label}:\\s+(\\d+)`)) || [])[1] ?? -1);
    return {
      output,
      scanned: Number((output.match(/scanned: (\d+)/) || [])[1] ?? -1),
      unguarded: count('UNGUARDED'),
      safe: count('closed safe list\\)'),
      annotated: count('# abort-ok:\\)'),
    };
  } finally {
    rmTree(dir);
  }
}

const HEAD = '#!/usr/bin/env bash\nset -euo pipefail\n';

test('a bare grep assignment is reported', () => {
  const out = checkScript(`${HEAD}x=$(grep foo bar.txt)\n`);
  assert.equal(out.scanned, 1);
  assert.equal(out.unguarded, 1);
  assert.match(out.output, /can abort the script/);
});

test('a guarded one is not', () => {
  const out = checkScript(`${HEAD}x=$(grep foo bar.txt || true)\n`);
  assert.equal(out.unguarded, 0);
});

test('`|| return` counts as a guard', () => {
  // Not cosmetic: `wf_event_paths` in validate-integrity.sh is guarded exactly this way, and
  // the first version of the GUARD pattern reported the repo's most carefully-handled site as
  // unguarded. A checker whose first output is wrong about its own repo gets ignored.
  const out = checkScript(`${HEAD}f() {\n  local a\n  a=$(grep x y || return 1)\n  echo "$a"\n}\n`);
  assert.equal(out.unguarded, 0);
});

test('arithmetic expansion is not a command substitution', () => {
  // `$((` is not `$(`. The first pattern matched it, so every `count=$((count + 1))` in the
  // corpus was reported with a "pipeline" consisting of the variable's own name — 10 findings
  // indistinguishable at a glance from the real ones.
  const out = checkScript(`${HEAD}n=0\nn=$((n + 1))\n`);
  assert.equal(out.unguarded, 0);
});

test('a guard on the last line of a multi-line substitution is found', () => {
  // The span scanner counted parens on raw text, so an embedded awk program containing
  // `sub(/x/, "", line)` drove the depth negative on parens that were never openers. The span
  // ended mid-program, above the real `|| true`, and a guarded site was reported UNGUARDED.
  const body = `${HEAD}x=$(printf '%s\\n' "$y" \\
  | awk '
      /^a/ { sub(/^a/, "", $0); print }
    ' \\
  | sed 's/b/c/' || true)
`;
  const out = checkScript(body);
  assert.equal(out.unguarded, 0);
});

test('a pipeline of only safe commands needs no guard', () => {
  const out = checkScript(`${HEAD}x=$(printf 'a\\nb\\n' | sort | uniq | wc -l)\n`);
  assert.equal(out.safe, 1);
  assert.equal(out.unguarded, 0);
});

test('an unknown command is treated as unsafe — the safe list is the enumerated one', () => {
  // Default-deny. A dangerous-command list would wave `jq` through on the day someone first
  // uses it; enumerating the safe side means the unknown case fails closed.
  const out = checkScript(`${HEAD}x=$(printf 'a' | jq -R .)\n`);
  assert.equal(out.unguarded, 1);
});

test('`# abort-ok:` exempts a site and its text is not otherwise interpreted', () => {
  const out = checkScript(`${HEAD}x=$(grep foo bar.txt) # abort-ok: bar.txt is generated one line above\n`);
  assert.equal(out.annotated, 1);
  assert.equal(out.unguarded, 0);
});

test('a script without set -e is out of scope', () => {
  // The hazard there is a silently empty value, not a vanished run. Reporting it would bury
  // the findings that actually kill a gate.
  const out = checkScript('#!/usr/bin/env bash\nx=$(grep foo bar.txt)\n');
  assert.equal(out.unguarded, 0);
});

test('`local x=$(…)` is skipped, and that is the documented limit', () => {
  // It genuinely cannot abort — the status becomes `local`'s, always 0. Pinned as a test so
  // the exemption reads as a decision rather than as a gap someone should quietly close.
  const out = checkScript(`${HEAD}f() {\n  local x=$(grep foo bar.txt)\n  echo "$x"\n}\n`);
  assert.equal(out.unguarded, 0);
});

// ── the shapes the first version could not see (#647 review) ────────────────
//
// Every one of these was found by an adversarial review, and they share a cause worth naming:
// each fixture above uses the unquoted, line-start spelling, so the must-go-red exercise only
// ever presented the checker with shapes it already handled. The gate's own negative evidence
// was written against its own blind spot.

test('a trailing comment mentioning `|| true` does NOT manufacture a guard', () => {
  // THE DECISIVE ONE. The comment a careful author writes to explain why there is no guard was
  // what created one — and appending exactly this house-style comment to the envelope's own
  // kill case made the gate print `UNGUARDED: 0` and exit 0.
  const out = checkScript(`${HEAD}x=$(grep foo bar.txt) # deliberately no \`|| true\`: the -z test below is the reader\n`);
  assert.equal(out.unguarded, 1);
});

test('`|| true` inside a quoted program body does NOT guard', () => {
  const awk = checkScript(`${HEAD}x=$(grep nomatch /dev/null | awk '{ if (n==0 || seen==1) print }')\n`);
  assert.equal(awk.unguarded, 1);
  const sed = checkScript(`${HEAD}x=$(grep nomatch /dev/null | sed 's/$/ || true/')\n`);
  assert.equal(sed.unguarded, 1);
});

test('the quoted form `x="$(…)"` is scanned', () => {
  // Three live sites were invisible, including two `ROOT="$(cd … && pwd)"` whose UNQUOTED twin
  // in a third file already carried an annotation — so the blind spot shaped the remediation,
  // not merely the reporting.
  const out = checkScript(`${HEAD}x="$(grep foo bar.txt)"\n`);
  assert.equal(out.scanned, 1);
  assert.equal(out.unguarded, 1);
});

test('the quoted form is not swallowed as a quoted run', () => {
  // Starting the span at the `"` rather than the `$(` made `codeOf` blank the whole pipeline,
  // and an empty command list scores `safe` — an affirmative all-clear over a line with grep.
  const out = checkScript(`${HEAD}ROOT="$(cd "$(dirname "$0")/.." && pwd)"\n`);
  assert.equal(out.safe, 0);
  assert.equal(out.unguarded, 1);
});

test('a mid-line assignment after `;` is scanned', () => {
  // `rc=0; x=$(f) || rc=$?` — the shape three live sites use, and the `^` anchor meant deleting
  // the guard did not even move the scanned count.
  const bare = checkScript(`${HEAD}rc=0; x=$(grep foo bar.txt)\n`);
  assert.equal(bare.unguarded, 1);
  const guarded = checkScript(`${HEAD}rc=0; x=$(grep foo bar.txt) || rc=$?\n`);
  assert.equal(guarded.unguarded, 0);
});

test('the split declaration `local x; x=$(…)` is scanned', () => {
  // It DOES abort — unlike `local x=$(…)`, whose status is `local`'s. The split spelling is the
  // recommended idiom precisely because the status propagates.
  const out = checkScript(`${HEAD}f() {\n  local cur; cur=$(readlink "$1")\n  echo "$cur"\n}\n`);
  assert.equal(out.unguarded, 1);
});

test('a second assignment on the same line gets its own verdict', () => {
  // `stamp=$(date +%F) missing=$(grep -L …)` scored `safe` with an empty command list, because
  // only the first head was stripped and `i = end` then skipped the rest of the line.
  const out = checkScript(`${HEAD}stamp=$(date +%F) missing=$(grep -L '^x' /dev/null)\n`);
  assert.equal(out.scanned, 2);
  assert.equal(out.unguarded, 1);
});

test('`|| VAR=$(…)` is not accepted as a guard', () => {
  // A fallback extraction inherits the inner substitution's status, so it aborts anyway. This is
  // the shape an author reaches for when "fixing" a flagged site with a fallback rather than a
  // guard — #647 reintroduced through the remediation, with the lint calling it handled.
  const out = checkScript(`${HEAD}a=$(grep -m1 '^x:' f || a=$(grep -m1 '^y:' f))\n`);
  // Two sites, not one: the inner assignment is a substitution in its own right and is also
  // unguarded. What matters is that neither is waved through as `guarded`.
  assert.equal(out.scanned, 2);
  assert.equal(out.unguarded, 2);
});

test('a real corpus-style `# abort-ok:` containing `||` still reads as annotated', () => {
  // The annotation test reads the RAW line on purpose — an annotation IS a comment — while the
  // guard test reads code only. A live annotation whose prose contained `|| continue` was
  // scoring `guarded` instead of `annotated`, which is why the summary reported one fewer
  // annotated site than `git grep abort-ok` found on disk.
  const out = checkScript(`${HEAD}x=$(readlink "$1") # abort-ok: guarded by the \`[ -L "$1" ] || continue\` test one line up\n`);
  assert.equal(out.annotated, 1);
  assert.equal(out.unguarded, 0);
});

test('a multi-line span closes at its own paren, not at end of line', () => {
  // `label="$(printf … )${x:1}"` never closed: the substitution's `)` brought depth to 0, then
  // the assignment's closing `"` reopened the quote state and the end test failed — so the span
  // ran into later statements and harvested a command out of an unrelated echo.
  const out = checkScript(`${HEAD}label="$(printf '%s' "\${v:0:1}" | tr '[:lower:]' '[:upper:]')\${v:1}"\necho "run npm run something"\n`);
  assert.equal(out.safe, 1);
  assert.equal(out.unguarded, 0);
});

test('an assignment inside a shell FUNCTION body is still scanned', () => {
  // Sanity check that the scanner still sees sites inside a shell FUNCTION, which is where
  // `registry_entry_set` (#648) puts three of them. Regression guard for any future narrowing
  // of ASSIGNMENT_GLOBAL back toward a line-start anchor.
  const out = checkScript(`${HEAD}f() {\n  local a\n  a=$(grep x y)\n}\n`);
  assert.equal(out.unguarded, 1);
});
