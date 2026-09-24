#!/usr/bin/env node
/**
 * check-debt-ratchet.js — give a warn-only gate teeth before its backlog reaches zero.
 *
 * #591, from `dreams/2026-08-12-aperiodic-tiles.md`: Penrose matching rules are aperiodic but not
 * *safe*. Every tile you lay can be locally legal and still walk the tiling into a finite patch no
 * legal tile completes. There is no local witness to the mistake, and it may have been forty tiles
 * ago. A warn-only gate is that shape exactly — every PR is legal by construction, because the
 * gate cannot fail — and CLAUDE.md's "warn is a temporary state with a named exit" names the exit
 * without forcing any move toward it.
 *
 * A ratchet does not certify from the hierarchy; it still measures the frontier. What it adds is
 * that the frontier may not retreat.
 *
 * ## Members, not a count
 *
 * The ratchet records a MEMBER LIST, and a run fails on any difference in either direction:
 *
 *   - a member the gate reports that the list does not name — added debt;
 *   - a member the list names that the gate no longer reports — paid down, and #591 requires the
 *     ratchet to move in the same commit.
 *
 * Exact-set, not `observed <= declared`. A `<=` ratchet is green when one member is repaired and
 * a different one is introduced, which is the swap a count cannot see; and "matches some past
 * state" is the shape that keeps deletions green forever.
 *
 * The key is `file` + `kind`, deliberately NOT `file` + `tag`. The tag in a tag-sequence finding
 * is rebuilt from the count-matched English revision that differs in the fewest positions, so an
 * English-only edit — one that never touches the translation — rewrites the tag and the member
 * would silently leave the list, taking its enforcement with it.
 *
 * ## What may be ratcheted at all
 *
 * Only a class whose members have each been READ. Otherwise "do not add debt" becomes "pay down
 * debt of unknown validity", which is worse than warn-only: the number now carries authority it
 * has not earned. That is why the body-divergence class of #477 is listed in `debt-ratchet.yml`
 * as unratcheted with its named exit, and only the tag-structure findings triaged in #598 are
 * enforced. Counts belong to the gate; this file names classes.
 *
 * ## Cost
 *
 * This runs the gate itself rather than reading a JSON file some earlier step left behind, so the
 * fence walk happens twice in `validate-skills.yml`. That is bought deliberately: a
 * `--from <file>` mode passes vacuously the moment the file is stale, and a stale-input vacuous
 * pass in the tool whose job is to stop silent drift is the worst possible place for one.
 *
 * The price of the second walk depends entirely on the filesystem, and the difference is large
 * enough to change the argument. Measured: under a second on the GitHub runner, about two minutes
 * on a WSL/NTFS checkout, for the identical 22,970 fences across 3,644 files — git object reads
 * cross a filesystem boundary there. So this is nearly free in CI and noticeable locally, which is
 * the opposite of how it was first written up here.
 *
 * Usage:
 *   node scripts/check-debt-ratchet.js
 *   node scripts/check-debt-ratchet.js --json
 *   node scripts/check-debt-ratchet.js --root <dir>          # check another tree (tests use this)
 *   node scripts/check-debt-ratchet.js --ratchet <file>      # default <root>/debt-ratchet.yml
 *
 * Exit codes: 0 ratchet holds, 1 the ratchet moved, 2 the run could not produce an honest verdict.
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
// Namespace import: js-yaml 5 is ESM and exports no `default`, so `import yaml from` fails at
// load with a SyntaxError. Every other consumer in `scripts/` uses this form.
import * as yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Fail closed. Never reachable from a ratchet verdict — this is "I cannot tell you". */
function refuse(message) {
  console.error(`ERROR: ${message}`);
  process.exit(2);
}

function flagValue(name, fallback) {
  const i = process.argv.indexOf(name);
  if (i < 0) return fallback;
  const v = process.argv[i + 1];
  if (v === undefined || v.startsWith('--')) refuse(`${name} requires a value`);
  return v;
}

const AS_JSON = process.argv.includes('--json');
const ROOT = resolve(flagValue('--root', resolve(__dirname, '..')));
const RATCHET_FILE = resolve(flagValue('--ratchet', join(ROOT, 'debt-ratchet.yml')));

/**
 * Member identity: `file` + `kind`, joined on NUL.
 *
 * NUL because a repo-relative path may contain a space and cannot contain NUL, so no filename can
 * forge a key boundary and make one member read as another. Written as a six-character escape
 * rather than as a literal byte: the first version embedded the byte itself, which made the whole
 * module BINARY to `rg` and `grep` — every search over `scripts/` silently skipped it, including
 * the sweeps this repo uses to find call sites.
 */
const SEP = '\u0000';
const KEY = (file, kind) => `${file}${SEP}${kind}`;
const unkey = (k) => { const [file, kind] = k.split(SEP); return { file, kind }; };

/**
 * Run a slice's gate and return its parsed report.
 *
 * The gate is spawned as a child process, never imported. `check-i18n-fence-parity.js` reads
 * `--root`, `--limit`, `--locale` and `--id` at MODULE SCOPE against the importer's argv, so an
 * import here would silently reinterpret this tool's own flags — its header records that hazard
 * as the reason `compareTagSequence` had to move to a library.
 */
function runGate(slice) {
  const argv = slice.gate_argv;
  if (!Array.isArray(argv) || argv.length === 0) {
    refuse(`slice '${slice.id}' must declare gate_argv as a non-empty argv array`);
  }
  // Resolved against THIS script's repo, not against --root: a fixture tree is a corpus to check,
  // not a source of the checker. Pointing --root at a tree that ships its own modified gate would
  // otherwise let the subject choose its own judge.
  const script = resolve(__dirname, '..', argv[0]);
  if (!existsSync(script)) refuse(`slice '${slice.id}' names a gate that does not exist: ${argv[0]}`);

  const r = spawnSync(process.execPath, [script, ...argv.slice(1), '--root', ROOT, '--json'],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.error) refuse(`slice '${slice.id}': could not run the gate — ${r.error.message}`);
  // Exit 1 is the gate finding violations, which is expected while it is warn-only in CI and is
  // NOT a reason to refuse. Anything above that is a crash or a refusal of its own.
  if (r.status !== 0 && r.status !== 1) {
    refuse(`slice '${slice.id}': gate exited ${r.status}\n${(r.stderr || '').trim().slice(0, 600)}`);
  }
  let report;
  try {
    report = JSON.parse(r.stdout);
  } catch {
    refuse(`slice '${slice.id}': gate produced no parseable JSON\n${(r.stdout || '').slice(0, 400)}`);
  }
  if (!Array.isArray(report.findings)) refuse(`slice '${slice.id}': gate report has no findings array`);
  return report;
}

/**
 * Everything that has to be true before a comparison means anything.
 *
 * Each of these has a matching vacuous-pass: a kind nobody emits selects nothing and compares
 * empty against empty; a walk that scanned nothing reports no findings for the same reason. Both
 * read as a held ratchet, and both are indistinguishable from success in the output.
 */
function assertNotVacuous(slice, report) {
  if (!Array.isArray(report.kinds) || report.kinds.length === 0) {
    refuse(`slice '${slice.id}': gate does not publish its finding-kind vocabulary, so '${slice.kinds}' cannot be validated`);
  }
  const unknown = slice.kinds.filter((k) => !report.kinds.includes(k));
  if (unknown.length) {
    refuse(`slice '${slice.id}': kind(s) ${JSON.stringify(unknown)} are not in the gate's vocabulary ${JSON.stringify(report.kinds)}`);
  }
  // Membership in the gate's OWN accept-list, not "is it a number". Every other numeric field in
  // the report is a finding count, which is near zero on a healthy corpus — so naming one as the
  // scanned field inverts the floor: healthy runs fail it and vacuous runs sail through.
  if (!Array.isArray(report.scannedFields) || report.scannedFields.length === 0) {
    refuse(`slice '${slice.id}': gate does not publish which fields measure corpus coverage, so '${slice.scanned_field}' cannot be validated`);
  }
  if (!report.scannedFields.includes(slice.scanned_field)) {
    refuse(`slice '${slice.id}': scanned_field '${slice.scanned_field}' is not one of the gate's coverage fields ${JSON.stringify(report.scannedFields)}`);
  }
  const scanned = Number(report[slice.scanned_field]);
  if (!Number.isFinite(scanned)) {
    refuse(`slice '${slice.id}': gate report has no numeric '${slice.scanned_field}'`);
  }
  if (scanned < slice.min_scanned) {
    refuse(`slice '${slice.id}': gate scanned ${scanned}, below the declared floor of ${slice.min_scanned} — a run this small cannot have seen the corpus`);
  }
  return scanned;
}

function loadRatchet() {
  if (!existsSync(RATCHET_FILE)) refuse(`no ratchet file at ${RATCHET_FILE}`);
  let doc;
  try {
    doc = yaml.load(readFileSync(RATCHET_FILE, 'utf8'));
  } catch (e) {
    refuse(`${RATCHET_FILE} is not parseable YAML — ${e.message}`);
  }
  if (!doc || !Array.isArray(doc.slices) || doc.slices.length === 0) {
    refuse(`${RATCHET_FILE} declares no slices; an empty ratchet passes vacuously`);
  }
  for (const slice of doc.slices) {
    for (const field of ['id', 'gate_argv', 'kinds', 'scanned_field', 'min_scanned']) {
      if (slice[field] === undefined) refuse(`${RATCHET_FILE}: slice '${slice.id ?? '(unnamed)'}' is missing '${field}'`);
    }
    if (!Array.isArray(slice.kinds) || slice.kinds.length === 0) {
      refuse(`${RATCHET_FILE}: slice '${slice.id}' ratchets no kinds`);
    }
    // `min_scanned` is only ever compared with `<`, and `x < null` is `x < 0` while `x < NaN` is
    // always false. So a bare `min_scanned:` (YAML null), a zero, a negative, or a typo like
    // `three-thousand` all DISABLE the floor while leaving the field visibly present — the
    // anti-vacuity mechanism defeated by the anti-vacuity mechanism's own configuration.
    if (typeof slice.min_scanned !== 'number' || !Number.isFinite(slice.min_scanned) || slice.min_scanned <= 0) {
      refuse(`${RATCHET_FILE}: slice '${slice.id}' has min_scanned ${JSON.stringify(slice.min_scanned)}; it must be a positive number or the floor does nothing`);
    }
    // `gate_argv` must not steer the gate's own corpus selection. `flagValue` in the gate takes
    // the FIRST occurrence of a flag, and `runGate` appends `--root` after these, so a `--root`
    // (or `--locale`/`--id`) here silently wins and the ratchet compares a subset while reporting
    // that it checked the tree it was pointed at.
    const STEERING = ['--root', '--locale', '--id', '--limit', '--json', '--warn'];
    const steering = slice.gate_argv.filter((a) => STEERING.includes(a));
    if (steering.length) {
      refuse(`${RATCHET_FILE}: slice '${slice.id}' gate_argv carries ${JSON.stringify(steering)}; the ratchet supplies those itself and a duplicate would win`);
    }
    slice.members = slice.members ?? [];
    for (const m of slice.members) {
      if (!m || typeof m.file !== 'string' || typeof m.kind !== 'string') {
        refuse(`${RATCHET_FILE}: slice '${slice.id}' has a member without both 'file' and 'kind'`);
      }
      if (!slice.kinds.includes(m.kind)) {
        refuse(`${RATCHET_FILE}: slice '${slice.id}' names member kind '${m.kind}', which the slice does not ratchet`);
      }
    }
    const seen = new Set();
    for (const m of slice.members) {
      const k = KEY(m.file, m.kind);
      if (seen.has(k)) refuse(`${RATCHET_FILE}: slice '${slice.id}' lists ${m.file} [${m.kind}] twice`);
      seen.add(k);
    }
  }
  return doc;
}

/**
 * The advisory-gate inventory, checked rather than merely written down.
 *
 * #591 asks for every warn-only gate to be listed. A list nothing reads is the documentation
 * drift this repo treats as a P1 bug, so two things are asserted here: each listed gate's command
 * still appears in the workflow it claims, and — the direction that actually matters — every
 * `--warn` invocation in `.github/workflows/` is listed. The second is what makes a NEW warn-only
 * gate impossible to add silently.
 *
 * Its blind spot is stated rather than papered over: a step that is advisory because it simply
 * never exits non-zero carries no token to sweep for. Those are listed by hand, with
 * `token: none`, and only the forward assertion covers them.
 */
function auditInventory(doc, problems) {
  const listed = doc.advisory_gates ?? [];
  if (listed.length === 0) refuse(`${RATCHET_FILE} lists no advisory_gates; the inventory #591 asks for is the point`);

  const wfDir = join(ROOT, '.github', 'workflows');
  if (!existsSync(wfDir)) return; // a fixture tree need not carry workflows
  const workflows = new Map();
  for (const name of readdirSync(wfDir).filter((n) => n.endsWith('.yml') || n.endsWith('.yaml'))) {
    workflows.set(`.github/workflows/${name}`, readFileSync(join(wfDir, name), 'utf8'));
  }

  for (const gate of listed) {
    if (!gate.id || !gate.workflow || !gate.command || !gate.exit) {
      problems.push(`FAIL debt-ratchet: advisory_gates entry '${gate.id ?? '(unnamed)'}' needs id, workflow, command and exit`);
      continue;
    }
    const text = workflows.get(gate.workflow);
    if (text === undefined) {
      problems.push(`FAIL debt-ratchet: advisory gate '${gate.id}' names ${gate.workflow}, which does not exist`);
    } else if (!text.includes(gate.command)) {
      problems.push(`FAIL debt-ratchet: advisory gate '${gate.id}' is listed but ${gate.workflow} no longer runs \`${gate.command}\` — update debt-ratchet.yml`);
    }
  }

  // The reverse sweep. `--warn` is the repo's spelling for "report, exit 0".
  //
  // Matched on BOTH the workflow and the command, never the command alone. Command-only matching
  // fails in both directions, and the second is live in this repo today: two entries share the
  // command `check-translation-freshness.js --warn` and differ only in workflow, so deleting
  // either one leaves the sweep green because the survivor "covers" the other file's line. In the
  // other direction, adding that same command to a brand-new workflow would be covered on
  // arrival — a new warn-only gate added silently, which is precisely what this sweep exists to
  // make impossible.
  //
  // COMMENT LINES ARE SKIPPED, and that is a repair rather than a loosening. Until #590 the sweep
  // read every line, so writing *about* `--warn` in a workflow comment reported the comment as an
  // unlisted warn-only step — which happened the moment someone documented, next to a warn step,
  // that `--warn` suppresses finding-exits but not refusals. The failure was loud rather than
  // silent, so nothing was ever missed by it; the cost was that the prose explaining a warn gate
  // could not sit beside the warn gate, and the cheap way out is to reword the comment, which
  // deletes the explanation to satisfy the tool.
  //
  // Skipping is safe in the direction that matters: a line whose first non-space character is `#`
  // is a YAML comment or a shell comment inside a `run: |` block, and neither executes. A real
  // invocation with a trailing comment (`node x.js --warn # note`) does not start with `#` and is
  // still swept.
  for (const [path, text] of workflows) {
    for (const line of text.split('\n')) {
      if (!line.includes('--warn')) continue;
      if (line.trim().startsWith('#')) continue;
      // Both prefixes, in order: a step is `- run: cmd` on one line and `run: cmd` under a
      // multi-line `run: |`. One alternation strips only the first and leaves `run:` glued to the
      // command, which does not break the containment test but does put a spurious token in the
      // message a human has to act on.
      const invocation = line.trim().replace(/^-\s*/, '').replace(/^run:\s*/, '');
      const covered = listed.some((g) => g.workflow === path && g.command && invocation.includes(g.command));
      if (!covered) {
        problems.push(`FAIL debt-ratchet: ${path} runs a warn-only step that debt-ratchet.yml does not list: ${invocation.slice(0, 120)}`);
      }
    }
  }
}

function main() {
  const doc = loadRatchet();
  const problems = [];
  const summary = [];

  auditInventory(doc, problems);

  for (const slice of doc.slices) {
    const report = runGate(slice);
    const scanned = assertNotVacuous(slice, report);

    const observed = new Set(
      report.findings.filter((f) => slice.kinds.includes(f.kind)).map((f) => KEY(f.file, f.kind)),
    );
    const declared = new Set(slice.members.map((m) => KEY(m.file, m.kind)));

    const added = [...observed].filter((k) => !declared.has(k)).sort();
    const stale = [...declared].filter((k) => !observed.has(k)).sort();

    for (const k of added) {
      const { file, kind } = unkey(k);
      problems.push(`FAIL debt-ratchet: added debt — ${file} [${kind}] is not on the '${slice.id}' member list`);
    }
    for (const k of stale) {
      const { file, kind } = unkey(k);
      problems.push(`FAIL debt-ratchet: stale member — ${file} [${kind}] no longer appears; remove it from debt-ratchet.yml in this commit`);
    }

    summary.push({
      id: slice.id, scanned, kinds: slice.kinds,
      declared: declared.size, observed: observed.size,
      added: added.map(unkey), stale: stale.map(unkey),
    });
  }

  if (AS_JSON) {
    console.log(JSON.stringify({ ratchet: RATCHET_FILE, slices: summary, problems }, null, 2));
    process.exitCode = problems.length ? 1 : 0;
    return;
  }
  for (const p of problems) console.log(p);
  console.log(`\ndebt ratchet: ${doc.slices.length} slice(s), ${(doc.advisory_gates ?? []).length} advisory gate(s) listed`);
  for (const s of summary) {
    console.log(`  ${s.id.padEnd(28)} ${s.observed} observed / ${s.declared} declared  [${s.kinds.join(', ')}]  scanned ${s.scanned}`);
  }
  if (problems.length === 0) {
    console.log('\nOK: every ratcheted finding is a known member, and every known member is still there.');
  } else {
    console.log(`\n${problems.length} ratchet problem(s). The gate itself may be warn-only; this step is not.`);
    console.log('Adding debt fails. Paying it down fails until debt-ratchet.yml moves in the same commit.');
  }
  process.exit(problems.length ? 1 : 0);
}

// Guarded so importing this module does not run a two-minute corpus walk and then call
// `process.exit`. Nothing imports it today; the guard is here because the last module in this
// repo that ran its body at load made every test that touched it cost 91 seconds, and the fix
// arrived after the cost. `check-i18n-fence-parity.js` carries the same guard for the same reason.
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main();
}
