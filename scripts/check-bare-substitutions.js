#!/usr/bin/env node
/**
 * check-bare-substitutions.js — find command-substitution assignments that can abort a
 * `set -e` shell script with no diagnostic (#647).
 *
 * The defect it exists to catch, in one line:
 *
 *   intent=$(grep -m1 '^intent:' "$f" | xargs)
 *
 * Under `set -euo pipefail` the assignment carries the pipeline's exit status. `grep` exits 1
 * when it matches nothing, so a file without `intent:` stopped the entire script HERE — one
 * line above the `-z` test written to report exactly that. Nothing printed. Every check below
 * was skipped, and the run looked like an ordinary early exit. That shipped in
 * `validate-integrity.sh` and made A6a's missing-field diagnostic unreachable code.
 *
 * `| wc -l` is not a rescue. `pipefail` returns the rightmost non-zero status, so
 * `grep(1) | wc -l(0)` still exits 1.
 *
 *   node scripts/check-bare-substitutions.js            # exit 1 on any unguarded site
 *   node scripts/check-bare-substitutions.js --warn     # report, always exit 0
 *   node scripts/check-bare-substitutions.js --list     # print every site and its verdict
 *
 * ## Why the safe list is the enumerated one
 *
 * The tempting design is a list of dangerous commands — grep, rg, sed — and a guard required
 * only for those. That is an allowlist wearing a deny-list's clothes: the first script to
 * pipe through `jq`, `yq`, `git diff --quiet` or a local function is unguarded by default, and
 * nobody notices, because the gate stays green. This repo has been bitten by that shape twice
 * (see CLAUDE.md § *Which code fences are frozen* for the same argument about fence tags).
 *
 * So the enumeration runs the other way. SAFE_COMMANDS lists commands whose non-zero exit
 * always means a genuine error rather than "found nothing" — a closed set, short, and every
 * addition has to be argued. Anything else needs a guard or an annotation. A pipeline built
 * from unknown commands fails closed.
 *
 * ## What counts as handled
 *
 * A site passes if EITHER:
 *
 *   - it carries a guard: `|| true`, `|| echo …`, `|| rc=$?`, `|| <name>_rc=$?`, `|| :`
 *   - or it carries `# abort-ok: <reason>` on the assignment's first or last line
 *
 * The annotation is not a suppression comment. It is where you record that the pipeline
 * cannot legitimately return empty — that a `find` over a directory guaranteed to exist, or
 * an `awk` with no exit statement, will only fail if something is genuinely broken, in which
 * case aborting is the correct behaviour.
 *
 * ## What this cannot check
 *
 * Whether a guard is *appropriate*. `|| true` belongs where the next lines explicitly handle
 * the empty result; where nothing checks the zero case it is worse than the abort, because it
 * converts a loud stop into a silent empty string and an empty haystack passes every
 * "is X missing" test. That judgement is not decidable by pattern-matching, which is why the
 * rule is also stated in prose at the top of `validate-integrity.sh`.
 *
 * It also deliberately ignores the ONE-WORD declaration `local x=$(…)` / `declare x=$(…)`,
 * which does not abort: the command's status becomes `local`'s, always 0. That is the inverse
 * hazard — a silent empty value where the author expected an abort — and it needs a different
 * check, not this one.
 *
 * The SPLIT form is a different statement and is scanned:
 *
 *   local x=$(grep -c zzz /dev/null)      # continues — status is `local`'s
 *   local x; x=$(grep -c zzz /dev/null)   # ABORTS — the assignment carries the status
 *
 * The split spelling is the recommended idiom precisely *because* the status propagates, so
 * exempting it along with the one-word form — which the first version did, by testing the line
 * for a leading `local` — hid a live site in `sync-discovery-symlinks.sh`.
 *
 * And two known false negatives, stated rather than left to be discovered:
 *
 *   x=$(grep foo bar || true | wc -l)
 *
 * The guard is INSIDE the pipeline, so it protects `grep` and not the pipeline's exit status.
 * `pipefail` still returns the rightmost non-zero, and the assignment can still abort. The
 * guard test is span-wide, so this reads as guarded. Fixing it needs the guard's position
 * relative to the last pipeline segment, which the span scanner does not track.
 *
 *   x=$(grep foo bar) ; other || true
 *
 * The guard test runs from the assignment to the end of the logical line, so a `|| true`
 * belonging to a LATER statement on the same line reads as this site's guard. The alternative
 * — ending the guard test at the substitution's closing paren — cuts off the real guard in
 * `x=$(f a b) || rc=$?`, which is the shape three live sites use, so this direction is the
 * deliberate one. Neither shape exists in this repo today; both are written down because a
 * limit nobody recorded looks like a limit nobody has.
 */

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.argv.includes('--root')
  ? process.argv[process.argv.indexOf('--root') + 1]
  : join(dirname(fileURLToPath(import.meta.url)), '..');

const WARN_ONLY = process.argv.includes('--warn');
const LIST = process.argv.includes('--list');

/**
 * Commands whose non-zero exit always signals a real error, never "matched nothing".
 *
 * Deliberately short and deliberately closed. `grep`, `rg`, `find`, `git`, `awk`, `sed` and
 * every custom shell function are absent on purpose — each of them has a legitimate
 * non-zero return in ordinary use, or can be given one.
 *
 * `wc` is here and it is the subtle entry: `wc` itself cannot fail on empty input, which is
 * exactly why `grep … | wc -l` reads as safe to a human and is not. The scan looks at every
 * command in the pipeline, so the `grep` upstream is what decides the verdict.
 */
const SAFE_COMMANDS = new Set([
  'printf', 'echo', 'basename', 'dirname', 'pwd', 'wc', 'tr', 'sort', 'uniq',
  'cut', 'rev', 'date', 'mktemp', 'tee', 'nl', 'seq', 'true', 'false', 'yes',
]);

// `|| return N` and `|| exit N` are guards too: control leaves the assignment rather than
// falling through, so `set -e` never sees an unhandled non-zero. `wf_event_paths` uses exactly
// that shape, and leaving it out of this pattern reported the repo's most carefully-guarded
// site as unguarded.
// `|| return N` and `|| exit N` are guards too: control leaves the assignment rather than
// falling through, so `set -e` never sees an unhandled non-zero. `wf_event_paths` uses exactly
// that shape, and leaving it out of this pattern reported the repo's most carefully-guarded
// site as unguarded.
//
// A bare `|| VAR=…` alternative used to be here and was REMOVED. It is only a guard when the
// right-hand side cannot fail, and the shape an author actually reaches for is a fallback
// extraction — `intent=$(grep -m1 '^intent:' "$f" || intent=$(grep -m1 '^description:' "$f"))`
// — where the assignment inherits the inner substitution's status and aborts anyway. That is
// #647 reintroduced through the remediation, with the lint calling the site handled. Removing
// it changes no verdict in this repo (measured: byte-identical output), because every real
// assignment-shaped guard here is the `|| …_rc=$?` form the dedicated alternative already
// matches.
const GUARD = /\|\|\s*(true|:|echo\b|return\b|exit\b|continue\b|break\b|\w+\s*=\s*\$\?)/;
const ANNOTATION = /#\s*abort-ok:/;

/**
 * One command-substitution assignment: `name=$(`, `name="$(`, optionally `export`-ed, and
 * anywhere on the line rather than only at its start.
 *
 * Three spellings were invisible to the line-anchored version, and all three are live here:
 *
 *   x="$(…)"                 the quoted form. `ROOT="$(cd "$(dirname "$0")/.." && pwd)"` in
 *                            two scripts, unscanned — and its UNQUOTED twin in a third file
 *                            carries an `# abort-ok:` annotation, so the blind spot shaped
 *                            this check's own remediation and not merely its reporting.
 *   a=1; b=$(…)              the mid-line form. `a8_vr_push=$(wf_event_paths …) || rc=$?` sits
 *                            after a `;`, and that function returns 1 and 2 by contract.
 *   local x; x=$(…)          the split declaration. The docblock's claim that `local` cannot
 *                            abort is true of `local x=$(…)` and FALSE of this, which is the
 *                            recommended idiom precisely BECAUSE the status propagates.
 *
 * `$((` is arithmetic expansion and cannot abort anything; the negative lookahead keeps every
 * `count=$((count + 1))` out of the findings, where they arrived with a "pipeline" consisting
 * of the variable's own name.
 */
// Plain whitespace is a separator too, because `stamp=$(date +%F) missing=$(grep -L …)` is two
// assignments and bash gives the statement the status of the LAST one. Without it the second
// substitution was never examined and the line scored `safe` off the first — an affirmative
// all-clear printed over a line containing `grep`, which is worse than silence.
const ASSIGNMENT_GLOBAL = /(?:^|[;&|\s]|\bthen\b|\bdo\b|\bin\b)\s*(?:export\s+)?([A-Za-z_][A-Za-z_0-9]*)=("?)\$\((?!\()/g;

/**
 * A declaration keyword immediately preceding the assignment, i.e. `local x=$(…)`.
 *
 * ONLY that one-word form is exempt. There the substitution's status is discarded — the
 * command's status becomes `local`'s, always 0 — so it cannot abort. The split form
 * `local x; x=$(…)` is a separate statement whose status DOES propagate, and treating the two
 * alike is what hid `sync-discovery-symlinks.sh:78`.
 */
const DECLARED_INLINE = /(?:^|[;&|]|\s)(?:local|declare|typeset|readonly)\s+(?:-\w+\s+)*$/;

/**
 * Every tracked `*.sh`, from git rather than from a filesystem walk.
 *
 * The walk was written first and measured at over 60 seconds without finishing. Two reasons,
 * both of which git sidesteps: `.claude/skills/<name>` and `.claude/agents` are symlinks that
 * `statSync` follows, so the discovery symlink farm gets re-walked once per entry; and
 * `viz/renv/library/` holds thousands of vendored files on an NTFS mount. Asking git returns
 * 6 paths and takes milliseconds — and, unlike a walk, cannot wander into an untracked
 * agent worktree or a build directory and start reporting findings against a copy.
 *
 * Six is the whole scope of this gate, which matters because shipping it blocking rather than
 * `--warn` rests on that corpus being clean. The summary line's "in 5 file(s)" is not a
 * contradiction: all six carry `set -euo pipefail`, and the summary counts files that produced
 * at least one substitution site — `viz/build.sh` has none.
 */
function shellScripts() {
  return execFileSync('git', ['ls-files', '-z', '*.sh'], { cwd: ROOT, encoding: 'utf8' })
    .split('\0')
    .filter(Boolean)
    .map((rel) => join(ROOT, rel));
}

/**
 * Collect the full text of a command substitution that starts on `lines[start]`.
 *
 * Substitutions here span up to a dozen lines, so a line-at-a-time scan would read the guard
 * off the wrong line — or miss a `grep` on a continuation entirely and call the site safe.
 *
 * The scanner is quote-aware, and that is not polish. The first version counted `$(` and `)`
 * on the raw text, which meant an embedded awk program containing `sub(/x/, "", line)` drove
 * the depth NEGATIVE on parens that were never openers. The span then ended mid-program, two
 * lines above the site's real `|| true`, and the checker reported a correctly-guarded
 * substitution as UNGUARDED. Measured: `validate-integrity.sh:98`, which is guarded and was
 * flagged. A truncating span is the dangerous direction in general — it can also cut a
 * pipeline before its `grep` and report a site as safe — so the scanner tracks quotes across
 * line boundaries (the awk and sed programs here open a single quote on one line and close it
 * several lines later) and only counts parens outside them.
 */
function substitutionSpan(lines, start, startColumn = 0) {
  let depth = 0;
  let seen = false;
  let quote = null;
  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    // Begin at the `$(` itself, not at column 0. Scanning from the start of the line means the
    // opening `"` of `label="$(` flips the quote state BEFORE the scanner reaches `$(`, so the
    // span never closes: it overruns the statement and swallows the next site, whose verdict
    // then comes back as the concatenation of both pipelines.
    for (let c = i === start ? startColumn : 0; c < line.length; c++) {
      const ch = line[c];
      if (quote) {
        if (ch === '\\' && quote === '"') { c++; continue; }
        if (ch === quote) quote = null;
        continue;
      }
      if (ch === "'" || ch === '"') { quote = ch; continue; }
      // An unquoted `#` starts a comment only at a word boundary; inside a substitution the
      // sites here never use one mid-line, and treating every `#` as a comment would swallow
      // `${x#prefix}`.
      if (ch === '#' && (c === 0 || /\s/.test(line[c - 1]))) break;
      if (ch === '$' && line[c + 1] === '(') { depth++; seen = true; c++; }
      else if (ch === '(') depth++;
      else if (ch === ')') {
        depth--;
        // Close AT the balancing paren, not at end of line. Waiting for the line to end meant
        // `label="$(printf … )${x:1}"` never closed: the substitution's own `)` brought depth
        // to 0, then the assignment's closing `"` re-opened the quote state and the end test
        // (which required `!quote`) failed — so the span ran on into the next statements and
        // harvested `run` out of a later `npm run update-readmes` in an echo.
        if (seen && depth <= 0) {
          const body = i === start
            ? [line.slice(startColumn, c + 1)]
            : [lines[start].slice(startColumn), ...lines.slice(start + 1, i), line.slice(0, c + 1)];
          return { text: body.join('\n'), end: i };
        }
      }
    }
  }
  return { text: [lines[start].slice(startColumn), ...lines.slice(start + 1)].join('\n'), end: lines.length - 1 };
}

/**
 * The CODE of a span: quoted runs blanked and any trailing comment removed.
 *
 * This is the single most important function here, and it exists because the first version
 * tested `GUARD` against the raw span. Five shapes then manufactured a guard that was not
 * there — a trailing comment saying `# nope, no || true here`, an awk program containing
 * `if (n==0 || seen==1)`, a `sed 's/$/ || true/'`, a heredoc body mentioning the idiom, and a
 * quoted inner substitution carrying its own guard.
 *
 * The self-defeating property is the reason it is HIGH rather than cosmetic: the comment a
 * careful author writes to explain *why there is no guard* is what manufactures one. Measured
 * on this check's own envelope — take the kill case that strips `|| true` from the A4 registry
 * total, append one house-style trailing comment, and the gate prints `UNGUARDED: 0` and exits
 * 0. The mutant the negative-evidence spec says must die survives.
 *
 * It was also live: `sync-discovery-symlinks.sh:133` scored `guarded` rather than `annotated`,
 * because `|| continue` appears inside its own `# abort-ok:` prose — which is why the summary
 * reported one fewer annotated site than `git grep abort-ok` finds on disk.
 *
 * `ANNOTATION` deliberately still reads the RAW line: an annotation IS a comment.
 */
function codeOf(span) {
  // Quote state carries ACROSS lines, exactly as in `substitutionSpan`. Resetting it per line
  // was wrong in the direction that matters: the closing line of a multi-line awk program is
  // `  ' "$file") || return 1`, and a per-line scanner reads that leading `'` as an OPENING
  // quote and swallows the `|| return 1` behind it. `wf_event_paths` — the most carefully
  // guarded site in the repo — went from `guarded` to UNGUARDED on that alone.
  let quote = null;
  const out = [];
  for (const line of span.split('\n')) {
    let kept = '';
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (quote) {
        if (ch === '\\' && quote === '"') { c++; continue; }
        if (ch === quote) quote = null;
        continue;
      }
      if (ch === "'" || ch === '"') { quote = ch; continue; }
      if (ch === '#' && (c === 0 || /\s/.test(line[c - 1]))) break;
      kept += ch;
    }
    out.push(kept);
  }
  return out.join('\n');
}

/**
 * Every command word in a substitution's pipeline.
 *
 * Splits on `|`, `&&`, `||` and `;`, then takes the first bare word of each segment, skipping
 * a leading `$(`, redirections and variable assignments. Quoted script bodies (the awk and
 * sed programs) contain pipes of their own, so the split is done after stripping single- and
 * double-quoted runs — otherwise an awk program mentioning `|` invents phantom commands and
 * the verdict becomes noise.
 */
function pipelineCommands(text) {
  // `codeOf` already blanked quoted runs and comments; this strips the assignment head so the
  // first segment is the first COMMAND rather than the variable name.
  const body = text.replace(/^\s*(?:export\s+)?[A-Za-z_][A-Za-z_0-9]*=\$\(/, '');
  return body
    .split(/\|\||&&|[|;]/)
    .map((segment) => {
      const word = segment
        .replace(/^[\s()]*/, '')
        .replace(/^(?:[A-Za-z_][A-Za-z_0-9]*=\S*\s+)*/, '')
        .split(/\s+/)[0] || '';
      return word.replace(/^\$?\(/, '').replace(/[)"'`]/g, '');
    })
    .filter((word) => word && /^[A-Za-z_./][A-Za-z_0-9./-]*$/.test(word));
}

const findings = [];
const sites = [];

for (const file of shellScripts()) {
  const text = readFileSync(file, 'utf8');
  // Only scripts that actually abort. A script without `set -e` has this hazard in a much
  // milder form (an empty value, not a vanished run), and flagging it would bury the real ones.
  if (!/^set\s+-[a-z]*e/m.test(text)) continue;

  const lines = text.split(/\r?\n/);
  const rel = relative(ROOT, file);
  for (let i = 0; i < lines.length; i++) {
    // EVERY substitution on the line, not the first. The anchored single-match version reported
    // `stamp=$(date +%F) missing=$(grep -L …)` as `safe`, because stripping only the first head
    // left the second assignment inside the first segment — an affirmative all-clear printed
    // over a line containing `grep`, which is worse than silence.
    ASSIGNMENT_GLOBAL.lastIndex = 0;
    let match;
    let lastEnd = i;
    while ((match = ASSIGNMENT_GLOBAL.exec(lines[i])) !== null) {
      const matchEnd = match.index + match[0].length;
      // Everything up to and including the assignment's `=`, used for two decisions: whether a
      // declaration keyword sits immediately before it, and where the `$(` starts.
      const beforeName = lines[i].slice(0, matchEnd - `${match[1]}=${match[2]}$(`.length);
      if (DECLARED_INLINE.test(beforeName)) continue;
      // A `#` earlier on the line means this assignment is inside a comment, not code.
      if (codeOf(beforeName).length < beforeName.replace(/\s+$/, '').length
          && /(?:^|\s)#/.test(beforeName)) continue;

      // Start at the `$(`, NOT at the `"` of the quoted form. Inside a substitution the quoting
      // context restarts, so including the opening quote makes `codeOf` treat the whole
      // pipeline as a quoted run and blank it — `ROOT="$(cd … && pwd)"` came back `safe` with
      // an empty command list, which is the affirmative all-clear this check must never print.
      const { text: rawSpan, end } = substitutionSpan(lines, i, matchEnd - 2);
      const span = codeOf(rawSpan);
      const commands = pipelineCommands(span);
      const unsafe = commands.filter((command) => !SAFE_COMMANDS.has(command));
      // TWO spans, because the two questions have different extents. The pipeline lives inside
      // `$(…)`; the guard lives AFTER the closing paren — `x=$(f a b) || rc=$?`. Testing GUARD
      // against the body alone reported the three `wf_event_paths` call sites as unguarded,
      // and those are the sites whose function returns 1 and 2 by contract.
      //
      // The residue, stated rather than hidden: a `|| true` belonging to a LATER statement on
      // the same line would read as this site's guard. No such line exists here, and the
      // alternative — cutting the guard off entirely — is the failure that fires today.
      const guardRaw = [lines[i].slice(matchEnd - 2), ...lines.slice(i + 1, end + 1)].join('\n');
      const guarded = GUARD.test(codeOf(guardRaw));
      const annotated = ANNOTATION.test(lines[i]) || ANNOTATION.test(lines[end]);

      const verdict = unsafe.length === 0 ? 'safe'
        : guarded ? 'guarded'
        : annotated ? 'annotated'
        : 'UNGUARDED';
      sites.push({ file: rel, line: i + 1, verdict, commands: unsafe });
      if (verdict === 'UNGUARDED') {
        findings.push({ file: rel, line: i + 1, commands: unsafe, source: lines[i].trim() });
      }
      if (end > lastEnd) lastEnd = end;
    }
    i = lastEnd;
  }
}

if (LIST) {
  for (const site of sites) {
    console.log(`  ${site.verdict.padEnd(10)} ${site.file}:${site.line}  ${site.commands.join(' ') || '-'}`);
  }
  console.log('');
}

const counts = sites.reduce((acc, s) => ({ ...acc, [s.verdict]: (acc[s.verdict] || 0) + 1 }), {});
console.log(`Command-substitution assignments scanned: ${sites.length} in ${new Set(sites.map((s) => s.file)).size} file(s)`);
console.log(`  safe (every command in the pipeline is on the closed safe list): ${counts.safe || 0}`);
console.log(`  guarded (|| true, || rc=$?, …):                                  ${counts.guarded || 0}`);
console.log(`  annotated (# abort-ok:):                                         ${counts.annotated || 0}`);
console.log(`  UNGUARDED:                                                       ${counts.UNGUARDED || 0}`);

if (findings.length > 0) {
  console.log('');
  for (const finding of findings) {
    console.log(`${WARN_ONLY ? 'WARN' : 'FAIL'}: ${finding.file}:${finding.line} can abort the script`);
    console.log(`  pipeline includes: ${finding.commands.join(', ')}`);
    console.log(`  ${finding.source}`);
  }
  console.log('');
  console.log('Each site needs one of: a guard whose empty result the next lines explicitly');
  console.log('check, or `# abort-ok: <why this pipeline cannot legitimately return empty>`.');
  console.log('A blanket `|| true` sweep is not a fix — see the rule at the top of');
  console.log('scripts/validate-integrity.sh.');
}

process.exitCode = findings.length > 0 && !WARN_ONLY ? 1 : 0;
