#!/usr/bin/env node
/**
 * gate-envelope.js — run a SUITE of mutations against one gate command and report which the
 * gate catches.
 *
 * `mutation-check.js` answers "does deleting this one line turn that one test red?". This
 * answers "of the N properties this gate claims to enforce, which does it actually enforce?",
 * and records the answer as a committed artifact rather than a paragraph in a commit message.
 *
 * It exists because the same harness was hand-written three times in one session while building
 * integrity check A10, and each rewrite re-derived guards the previous one had already learned:
 *
 *   - The first version had no SIGTERM handler. A harness timeout skipped Python's `finally` and
 *     left `check-i18n-fence-parity.js` mutated in the working tree. It was found by `git status`
 *     minutes later, not by the harness — and every measurement taken in between would have been
 *     a self-consistent lie.
 *   - The first version's expectations were guesses. Three cases "survived" and two of those were
 *     fixture errors, not gate defects. Requiring each case to name the FAIL substring it expects
 *     is what separated them: a run that goes red for an unrelated reason is not a kill.
 *   - Nothing recorded a KNOWN limit. A10 cannot detect partial co-deletion, by construction. An
 *     `expect: null` case pins that as a measured fact, so the day it starts being caught, or the
 *     day someone claims it always was, the artifact settles it.
 *
 * ## Differences from mutation-check.js, and when to use which
 *
 * Use `mutation-check` for a single line and a single test command — it is the sharper
 * instrument and its report is easier to quote. Use this when the subject is a gate with many
 * guarded properties, when a case must touch more than one file, when the subject is not
 * JavaScript, or when a documented non-guarantee deserves a measurement.
 *
 * ## What it refuses to do
 *
 * It fails closed, like its sibling. It refuses to run without a green baseline; it refuses a
 * mutation matching zero or several sites (silently matching nothing is how an envelope passes
 * vacuously while looking thorough); it refuses to start with a stale backup present; and it
 * reports INVALID rather than a kill when a mutant fails to parse, because "the file no longer
 * loads" is not evidence that the gate understood anything.
 *
 * Usage:
 *   node scripts/gate-envelope.js --spec scripts/envelopes/<name>.mjs
 *   node scripts/gate-envelope.js --spec <file> --only 'substring of a label'
 *   node scripts/gate-envelope.js --spec <file> --list
 *   node scripts/gate-envelope.js --spec <file> --root <dir>   # run against a fixture tree
 *
 * Spec shape (an ES module):
 *   export const gate = { command: ['bash', 'scripts/validate-integrity.sh'] };
 *   export const cases = [
 *     { label: '...', file: 'scripts/x.sh', find: '...', replace: '...', expect: 'FAIL substring' },
 *     { label: '...', file: '...', find: '...', replace: '...', expect: null, why: 'documented limit' },
 *     { label: '...', file: '...', find: '...', replace: '...', expect: '...', sites: 2 },
 *   ];
 */

import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdtempSync, rmSync } from 'fs';
import { resolve, dirname, extname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { spawnSync } from 'child_process';
import { tmpdir } from 'os';

const BACKUP_SUFFIX = '.gate-envelope.bak';

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(2);
}

function flagValue(name, fallback) {
  const i = process.argv.indexOf(name);
  if (i < 0) return fallback;
  const v = process.argv[i + 1];
  // A bare `--only` would otherwise become `undefined`, match nothing, and print a clean-looking
  // "0 cases, all passed" — the vacuous report this tool exists to make impossible.
  if (v === undefined || v.startsWith('--')) fail(`${name} requires a value`);
  return v;
}

/**
 * Syntax-check a mutant in the language it is actually written in.
 *
 * `node --check` on a `.sh` file is not a weaker check, it is a meaningless one — it would
 * either reject valid shell or accept anything, and either way the answer says nothing. Files
 * with no cheap dependency-free validator are reported as unchecked rather than silently
 * treated as valid, because "we did not verify this parses" and "this parses" must not look the
 * same in the output.
 *
 * @returns {{ok: boolean, checked: boolean, detail: string}}
 */
function syntaxCheck(absPath, text) {
  const ext = extname(absPath);
  if (ext === '.sh' || ext === '.bash') {
    const dir = mkdtempSync(join(tmpdir(), 'gate-env-'));
    try {
      const probe = join(dir, `probe${ext}`);
      writeFileSync(probe, text);
      const r = spawnSync('bash', ['-n', probe], { encoding: 'utf8' });
      return { ok: r.status === 0, checked: true, detail: (r.stderr || '').trim().slice(0, 300) };
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
  if (ext === '.js' || ext === '.mjs' || ext === '.cjs') {
    // Through a temp file whose extension matches, because `node --check` parses a bare `.js`
    // as CommonJS and would reject every ESM file in this package — the same trap
    // mutation-check.js documents.
    const dir = mkdtempSync(join(tmpdir(), 'gate-env-'));
    try {
      const probe = join(dir, `probe${ext === '.js' ? '.mjs' : ext}`);
      writeFileSync(probe, text);
      const r = spawnSync(process.execPath, ['--check', probe], { encoding: 'utf8' });
      return { ok: r.status === 0, checked: true, detail: (r.stderr || '').trim().slice(0, 300) };
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
  return { ok: true, checked: false, detail: `no dependency-free parser for ${ext || 'extensionless'}` };
}

/**
 * TRIAGED SECURITY FINDING, and it is triaged CONDITIONALLY — read the condition before moving
 * this tool.
 *
 * `semgrep`'s `javascript.lang.security.detect-child-process` fires here (PR #589, from an
 * external report, closed as not-applicable). The pattern match is correct: `spawnSync` does
 * receive its argv through a variable. Three facts make it not a vulnerability TODAY:
 *
 *   1. `command` is `spec.gate.command`, and `spec` is an ES module dynamically imported from
 *      the `--spec` path. Anyone who can set that field already ran arbitrary top-level code at
 *      import time. The spec is code by design — the trust model of an npm script or an ESLint
 *      config — so supplying `gate.command` is a strictly weaker capability than the one needed
 *      to supply it.
 *   2. `scripts/` is not in `package.json`'s `files` array, so nothing here ships to a consumer.
 *   3. Nothing in `.github/workflows/` runs this tool. It is maintainer-invoked, via
 *      `npm run gate-envelope`.
 *
 * FACT 3 IS THE ONE THAT CAN CHANGE, and the whole triage rests on it. This is negative-evidence
 * tooling of exactly the kind that gets wired into CI later, and `scripts/envelopes/*.mjs` are
 * committed files a pull request may add or edit. The day a workflow runs this on a fork PR,
 * a contributor-supplied spec executes arbitrary code in the runner with whatever token that job
 * holds — and the finding stops being a false positive without anyone editing this line.
 *
 * So: wiring `gate-envelope` into CI is a security change, not a convenience. If you do it,
 * pin the spec set rather than accepting `--spec` from the event, and say so here.
 *
 * The parameter is kept deliberately. #589 proposed reading `command` from the module scope
 * instead, which stops the rule matching without changing the flow the rule was watching, and
 * makes this function order-dependent: it would then be correct only because all three call
 * sites happen to run after `command` is assigned, and a call added earlier would throw on the
 * temporal dead zone.
 */
function runGate(command) {
  const [bin, ...args] = command;
  const r = spawnSync(bin, args, { cwd: ROOT, encoding: 'utf8' });
  return { status: r.status, output: `${r.stdout || ''}${r.stderr || ''}` };
}

/**
 * The tree the gate runs in and every `file` is resolved against. Defaults to this repo, which
 * is how every real invocation uses it.
 *
 * It exists as a flag because the tool is otherwise untestable — the exact defect #559 was
 * about, where `buildEnglishFenceHistory()` closed over its module's repo root so no fixture
 * could reach it, and so nothing tested it. A verification tool with no tests of its own is
 * worse than most code without tests: it is trusted precisely when it is wrong.
 */
const ROOT = resolve(flagValue('--root', dirname(fileURLToPath(import.meta.url)) + '/..'));

const specArg = flagValue('--spec', null);
if (!specArg) fail('--spec <file> is required');
const specPath = resolve(ROOT, specArg);
if (!existsSync(specPath)) fail(`spec not found: ${specPath}`);

const spec = await import(pathToFileURL(specPath).href);
const command = spec.gate?.command;
if (!Array.isArray(command) || command.length === 0) {
  fail(`${specArg} must export \`gate.command\` as a non-empty argv array`);
}
if (!Array.isArray(spec.cases) || spec.cases.length === 0) {
  fail(`${specArg} must export a non-empty \`cases\` array`);
}

const only = flagValue('--only', null);
const cases = only ? spec.cases.filter((c) => c.label.includes(only)) : spec.cases;
if (only && cases.length === 0) fail(`--only '${only}' matched no case label`);

if (process.argv.includes('--list')) {
  for (const c of spec.cases) {
    console.log(`${c.expect === null ? '[expected-survivor] ' : ''}${c.label}  (${c.file})`);
  }
  process.exit(0);
}

// Refuse to start with a stale backup: it means a previous run died hard, and the file on disk
// may already be a mutant. Restoring from THIS run's in-memory buffer would then bake that
// mutation in permanently while reporting success.
for (const c of spec.cases) {
  const bak = resolve(ROOT, c.file) + BACKUP_SUFFIX;
  if (existsSync(bak)) fail(`stale backup present: ${bak}\nA previous run died mid-mutation. Compare it with the file and remove it by hand.`);
}

console.log(`gate-envelope: ${specArg}`);
console.log(`  gate:  ${command.join(' ')}`);
console.log(`  cases: ${cases.length}${only ? ` (filtered from ${spec.cases.length})` : ''}\n`);

console.log('baseline (expect green) ...');
const baseline = runGate(command);
if (baseline.status !== 0) {
  fail(`baseline is not green (exit ${baseline.status}). Fix that before measuring anything.`);
}
console.log('      green.\n');

/** Files currently mutated, so a signal can put them all back. */
const inFlight = new Map();

function restoreAll() {
  for (const [abs, text] of inFlight) {
    writeFileSync(abs, text);
    const bak = abs + BACKUP_SUFFIX;
    if (existsSync(bak)) unlinkSync(bak);
  }
  inFlight.clear();
}

// The handler that the first hand-written version lacked. A harness timeout sends SIGTERM, which
// by default terminates without unwinding — leaving a mutated file in the working tree.
for (const sig of ['SIGTERM', 'SIGINT', 'SIGHUP']) {
  process.on(sig, () => {
    console.error(`\n${sig} received — restoring ${inFlight.size} mutated file(s) before exit.`);
    restoreAll();
    process.exit(130);
  });
}

let killed = 0;
let survived = 0;
let asDocumented = 0;
let problems = 0;

for (const c of cases) {
  const abs = resolve(ROOT, c.file);
  if (!existsSync(abs)) {
    console.log(`[MISSING]  ${c.label} — ${c.file} does not exist`);
    problems += 1;
    continue;
  }
  const before = readFileSync(abs, 'utf8');
  // `sites` defaults to 1 and is an explicit COUNT, not an `allowMultiple` boolean. A boolean
  // says "however many there are is fine", which is the same silence as no check: a find string
  // that starts matching a third site after an unrelated edit would still pass. Naming the
  // number turns that into a failure. Two real cases here match twice because A10's own comment
  // quotes the command it guards.
  const wanted = c.sites ?? 1;
  const sites = before.split(c.find).length - 1;
  if (sites !== wanted) {
    // Zero is the dangerous one: the case would "pass" having changed nothing.
    console.log(`[INCONCLUSIVE] ${c.label} — ${sites} match site(s) for the \`find\` text, expected exactly ${wanted}`);
    problems += 1;
    continue;
  }
  const mutant = before.split(c.find).join(c.replace);
  const syntax = syntaxCheck(abs, mutant);
  if (!syntax.ok) {
    console.log(`[INVALID]  ${c.label} — the mutant does not parse, so any red is meaningless\n           ${syntax.detail}`);
    problems += 1;
    continue;
  }

  writeFileSync(abs + BACKUP_SUFFIX, before);
  inFlight.set(abs, before);
  writeFileSync(abs, mutant);
  try {
    const { status, output } = runGate(command);
    if (c.expect === null) {
      if (status === 0) {
        console.log(`[SURVIVED as documented] ${c.label}${c.why ? `\n           ${c.why}` : ''}`);
        asDocumented += 1;
      } else {
        console.log(`[UNEXPECTED KILL] ${c.label} — the documented limit may be narrower than claimed; re-read it`);
        problems += 1;
      }
    } else {
      const hit = output.split('\n').find((l) => l.includes('FAIL') && l.includes(c.expect));
      if (status !== 0 && hit) {
        console.log(`[KILLED]   ${c.label}\n           ${hit.trim().slice(0, 160)}`);
        killed += 1;
      } else if (status !== 0) {
        // Red, but not for the reason claimed — the case proves nothing about this property.
        console.log(`[WRONG-RED] ${c.label} — gate failed but no FAIL line contained ${JSON.stringify(c.expect)}`);
        problems += 1;
      } else {
        console.log(`[SURVIVED] ${c.label} — gate stayed green; this property is NOT enforced`);
        survived += 1;
      }
    }
  } finally {
    restoreAll();
  }
}

console.log('\nverifying the tree is back where it started ...');
const after = runGate(command);
if (after.status !== 0) {
  fail('the gate is red after restore — the working tree was NOT restored cleanly. Inspect it before doing anything else.');
}
console.log('      green.\n');

const parts = [`${killed} killed`];
if (asDocumented) parts.push(`${asDocumented} survived as documented`);
if (survived) parts.push(`${survived} SURVIVED`);
if (problems) parts.push(`${problems} inconclusive/invalid`);
console.log(`gate-envelope: ${parts.join(', ')} of ${cases.length} case(s).`);

process.exit(survived > 0 || problems > 0 ? 1 : 0);
