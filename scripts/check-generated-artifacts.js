#!/usr/bin/env node
/**
 * check-generated-artifacts.js — is `generated-artifacts.yml` still true? (#590)
 *
 * #590's ask is "a table nobody can add a row to without naming a reader". A table alone cannot
 * do that; a table plus a reverse sweep can. This is that sweep.
 *
 * ## Why it binds GENERATORS rather than artifacts
 *
 * The obvious design is "find every path a script writes, require each to be listed". Measured
 * on this tree that is impossible: 253 write sites across 171 source files, and ZERO whose
 * destination is a bare string literal — every one composes the path. Generators, by contrast,
 * are enumerable from three places, so those are what the reverse sweep binds.
 *
 * ## Globs are matched by GIT, not by a matcher written here
 *
 * `git ls-files -- <pattern>` is the ruler. Writing a fourth glob implementation in this
 * repository is precisely what #672 was filed about, and `content-paths.js` already documents
 * how easy it is to get `*`-crosses-`/` wrong in a pathspec. Delegating also means the check
 * agrees with `git` about what is tracked, which is the property that actually matters:
 * an UNTRACKED generated file is out of scope by definition.
 *
 * ## Exact comparison, everywhere, and why that sentence is here
 *
 * The first version matched exemptions with `blob.includes(generator)` over a concatenation of
 * every exemption's id and command. An adversarial review showed that is the #672 substring
 * class reintroduced — and REPRODUCED it: an exemption reading
 * `node legacy/scripts/build-dreams.js` silently exempted the discovered
 * `scripts/build-dreams.js`, so deleting a whole artifact row left the check reporting
 * `all accounted for`, exit 0. The unit test asserting "only for the generator it names" could
 * not catch it, because its two fixture paths shared no substring relation.
 *
 * Everything here therefore compares exact strings from a parsed token set. Any future
 * "does X mention Y" shortcut in this file is the same bug wearing a different hat.
 *
 * ## Comments are stripped before any haystack test
 *
 * Same review, same class one level over: the forward check asked whether a gate's command text
 * appears in the file that runs it, and `#`-prefixed lines counted. Reproduced by deleting the
 * real `run: npm run build-data` step from `deploy-pages.yml` — three surviving COMMENT mentions
 * kept the check green while the gate was unwired. "Prove the wiring, not the component" is this
 * repo's own rule and the first version failed it.
 *
 * ## Vacuity
 *
 * Every comparison here has an empty-set failure mode where it would pass while measuring
 * nothing, so each is floored explicitly. A check that compares two empty lists is green and
 * proves nothing.
 *
 * Exit 0 clean, 1 findings, 2 the check could not run.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as yaml from 'js-yaml';

/**
 * `--root` exists so a test can point this at a fixture repo. Without it the script runs only
 * against its own checkout, which is precisely the untestability `lib/english-history.js`
 * records having fixed — and the refusal paths below, which are the anti-vacuity guards, are
 * unreachable any other way.
 */
const rootArg = (() => {
  const index = process.argv.indexOf('--root');
  if (index === -1) return null;
  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) {
    console.error('ERROR: --root requires a directory');
    process.exit(2);
  }
  return value;
})();

const ROOT = rootArg
  ? resolve(rootArg)
  : resolve(dirname(fileURLToPath(import.meta.url)), '..');
const INVENTORY = resolve(ROOT, 'generated-artifacts.yml');
const WORKFLOW_DIR = resolve(ROOT, '.github/workflows');
/** THE healer: the one workflow whose whole job is committing regenerated output back. */
const HEALER = '.github/workflows/update-readmes.yml';

const findings = [];
const fail = (message) => findings.push(message);

/** Refuse rather than report a clean run the check could not have earned. */
function refuse(message) {
  console.error(`REFUSED: ${message}`);
  console.error('This check could not measure, so it exits 2 rather than reporting success.');
  process.exit(2);
}

function git(args) {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 })
      .split('\n').filter(Boolean);
  } catch (error) {
    refuse(`git ${args.join(' ')} failed: ${error.message}`);
    return [];
  }
}

/**
 * Tracked files matching one pathspec.
 *
 * A failure here REFUSES rather than returning empty. Returning `[]` would render a transient
 * git error — index.lock contention is real in this repo, where sessions share a checkout — as
 * a confident "matches no tracked file … the artifact moved, was deleted, or the pattern is
 * wrong". That is a wrong diagnosis stated with certainty, which is worse than no answer.
 */
function trackedMatching(pattern) {
  return git(['ls-files', '--', pattern]);
}

/** Drop `#` comments so a haystack test cannot be satisfied by prose about the thing. */
function withoutComments(text) {
  return text.split('\n')
    .map((line) => (line.trimStart().startsWith('#') ? '' : line))
    .join('\n');
}

/** A script path: anchored, so testing one token is linear. */
const SCRIPT_PATH = /^[\w./-]+\.(?:js|mjs|R)$/;

/**
 * Every `node`/`Rscript` script path in a command string.
 *
 * TOKENS, not one big regex. The first version used
 * `(?:node|Rscript)\s+(?:--?\S+\s+)*([\w./-]+\.(?:js|mjs|R))` and CodeQL flagged the
 * flag-skipping group as exponential backtracking: `--?` followed by `\S+`, which can itself
 * match a dash, is ambiguous, so `node -` plus many repetitions of `-! -` blows up. That group
 * was added to handle `node --flag path.js`; scanning tokens handles it without the ambiguity,
 * and states the rule plainly — after `node`, skip flags, take the first non-flag token.
 *
 * Every invocation in the string is found, so an `&&` chain is not truncated at its first —
 * true of sources 1 and 3, which pass whole commands here. Source 2 keeps its own line-oriented
 * regex because `viz/build.sh` dispatches through `$RSCRIPT`, so a `&&` chain written INSIDE
 * build.sh is still truncated at its first invocation. No line there uses one.
 */
function scriptPathsIn(command) {
  // Normalise shell punctuation to spaces FIRST. Splitting on whitespace alone lost two forms
  // the previous regex caught, found by attacking this function rather than by review:
  //
  //   node a/build-a.js&&node b/build-b.js   -> [] because `a/build-a.js&&node` is one token
  //   bash -c "node scripts/build-x.js"      -> [] because the quote sticks to `node`
  //
  // Neither shape occurs in this repo today, and both are SILENT misses — which in the reverse
  // sweep means a generator addable without naming its reader. Alternation with no nested
  // quantifier, so this stays linear and the ReDoS class does not return.
  const tokens = String(command).replace(/["'`]|&&|\|\||[;|()]/g, ' ').split(/\s+/);
  const found = [];
  for (let i = 0; i < tokens.length; i += 1) {
    if (tokens[i] !== 'node' && tokens[i] !== 'Rscript') continue;
    for (let j = i + 1; j < tokens.length; j += 1) {
      if (tokens[j].startsWith('-')) continue;
      if (SCRIPT_PATH.test(tokens[j])) found.push(tokens[j]);
      break;
    }
  }
  return found;
}

// ── Load ──────────────────────────────────────────────────────────────────────────────────────

if (!existsSync(INVENTORY)) refuse(`no inventory at ${INVENTORY}`);

let inventory;
try {
  inventory = yaml.load(readFileSync(INVENTORY, 'utf8'));
} catch (error) {
  refuse(`generated-artifacts.yml does not parse: ${error.message}`);
}

const artifacts = inventory?.artifacts;
if (!Array.isArray(artifacts) || artifacts.length === 0) {
  refuse('generated-artifacts.yml declares no `artifacts` — nothing to check');
}
const exempt = inventory?.generators_without_committed_output ?? [];

const allTracked = git(['ls-files']);
if (allTracked.length < 100) {
  refuse(`git reports only ${allTracked.length} tracked files — not a full checkout`);
}

// ── FORWARD: every declaration must still be true ─────────────────────────────────────────────

/** Does `file` actually invoke `command`, ignoring anything said about it in a comment? */
function invokes(relFile, command) {
  const abs = resolve(ROOT, relFile);
  if (!existsSync(abs)) return { ok: false, why: `${relFile} does not exist` };
  const needle = command.replace(/^(npm run |node |bash )/, '');
  if (!needle) return { ok: false, why: `command '${command}' has no distinguishing text` };
  return withoutComments(readFileSync(abs, 'utf8')).includes(needle)
    ? { ok: true }
    : { ok: false, why: `'${command}' does not appear in ${relFile} outside of comments` };
}

for (const entry of artifacts) {
  const id = entry.id ?? '(unnamed)';

  if (!Array.isArray(entry.paths) || entry.paths.length === 0) {
    fail(`${id}: declares no paths`);
  } else {
    for (const pattern of entry.paths) {
      if (trackedMatching(pattern).length === 0) {
        fail(`${id}: path pattern '${pattern}' matches no tracked file — `
          + 'the artifact moved, was deleted, or the pattern is wrong');
      }
    }
  }

  if (!entry.generator) {
    fail(`${id}: names no generator`);
  } else if (!existsSync(resolve(ROOT, entry.generator))) {
    fail(`${id}: generator '${entry.generator}' does not exist`);
  }

  const gate = entry.gate;
  if (!gate || !gate.kind) {
    fail(`${id}: declares no gate.kind — every row must name a reader or say there is none`);
    continue;
  }

  if (gate.kind === 'none') {
    if (!entry.unread_edge) {
      fail(`${id}: gate.kind is 'none' but no \`unread_edge\` explains what that costs`);
    }
    continue;
  }

  if (!gate.command) {
    fail(`${id}: gate.kind is '${gate.kind}' but names no command`);
    continue;
  }
  if (!gate.where) {
    fail(`${id}: gate '${gate.command}' names no file it lives in`);
    continue;
  }

  const primary = invokes(gate.where, gate.command);
  if (!primary.ok) {
    fail(`${id}: ${primary.why} — the gate was renamed or removed while this row still claims it`);
  }

  // `also:` is checked with the same logic. An unchecked field is documentation, and a row that
  // names its CI wiring only in prose can be unwired invisibly — which is what `where:
  // package.json` alone allows, since a package.json needle proves the npm alias exists and
  // nothing about whether any workflow runs it.
  if (entry.also) {
    const secondary = invokes(entry.also, gate.command);
    if (!secondary.ok) {
      fail(`${id}: \`also\` claims ${entry.also} runs '${gate.command}' — ${secondary.why}`);
    }
  }
}

// ── REVERSE: every generator must be accounted for ────────────────────────────────────────────
//
// THREE sources. The first version's header advertised three and the code implemented two, so
// four of the five exemptions were unreachable — written for a design the code did not have.
// An adversarial review caught the inventory making an unchecked claim about its own enforcement,
// in the file whose banner is "CHECKED, not merely written".

const discovered = new Map(); // generator path -> where it was found

/**
 * Record a discovered generator, keyed on its own FILENAME.
 *
 * The first version keyed on the npm ALIAS, which had two defects an adversarial review found.
 * Source 3 then swept every script a committing workflow ran, including checkers
 * (`check-readme-translation-parity.js` is not a generator). And the alias rule had a LIVE blind
 * spot: `translation:status` runs `scripts/generate-translation-status.js`, a real generator of a
 * committed artifact, invisible because the alias does not start with build/generate/update.
 *
 * Keying on the filename is one rule for all three sources, admits that generator, and excludes
 * `check-*`. The blind spot does not vanish — a generator named `postprocess-thing.js` is still
 * invisible — it moves from the alias to the filename, where it is at least the author's own
 * choice rather than an accident of how a script got aliased.
 */
function noteGenerator(file, source) {
  if (!file) return;
  const rel = file.replace(/^\.\//, '');
  const base = rel.slice(rel.lastIndexOf('/') + 1);
  if (!/^(build|generate|update)/.test(base)) return;
  if (!discovered.has(rel)) discovered.set(rel, source);
}

/** Script name -> command, for both manifests, so a workflow's `npm run X` can be resolved. */
const npmScripts = new Map();

// 1. npm scripts named build-/generate-/update-
for (const [manifest, prefix] of [['package.json', ''], ['viz/package.json', 'viz/']]) {
  const manifestPath = resolve(ROOT, manifest);
  if (!existsSync(manifestPath)) continue;
  let scripts;
  try {
    scripts = JSON.parse(readFileSync(manifestPath, 'utf8')).scripts ?? {};
  } catch (error) {
    refuse(`${manifest} does not parse: ${error.message}`);
  }
  for (const [name, command] of Object.entries(scripts)) {
    npmScripts.set(name, { command, prefix });
    for (const path of scriptPathsIn(command)) {
      noteGenerator(prefix + path, `${manifest} script '${name}'`);
    }
  }
}

// 2. commands invoked by viz/build.sh
const buildSh = resolve(ROOT, 'viz/build.sh');
if (existsSync(buildSh)) {
  for (const line of readFileSync(buildSh, 'utf8').split('\n')) {
    if (line.trimStart().startsWith('#')) continue;
    const match = line.match(/^\s*(?:node|\$RSCRIPT|Rscript)\s+([\w./-]+\.(?:js|mjs|R))/);
    // build.sh cd's into its own directory on line 3, so every invocation is viz-relative.
    if (match) noteGenerator(`viz/${match[1]}`, 'viz/build.sh');
  }
} else {
  refuse('viz/build.sh not found — source 2 of the reverse sweep cannot run, and a sweep '
    + 'missing a source would report a clean result it did not earn');
}

// 3. workflow steps that commit output back to the repository. Whatever such a workflow runs is
// generated-and-committed by definition, and this is the source the first version advertised and
// omitted.
if (!existsSync(WORKFLOW_DIR)) {
  refuse('.github/workflows not found — source 3 of the reverse sweep cannot run');
}
const committingWorkflows = new Set();
for (const name of readdirSync(WORKFLOW_DIR)) {
  if (!/\.ya?ml$/.test(name)) continue;
  const rel = `.github/workflows/${name}`;
  const body = withoutComments(readFileSync(resolve(WORKFLOW_DIR, name), 'utf8'));
  const commits = /git-auto-commit-action|git\s+commit|git\s+push/.test(body);
  if (!commits) continue;
  committingWorkflows.add(rel);
  for (const path of scriptPathsIn(body)) noteGenerator(path, `${rel} (commits back)`);
  for (const match of body.matchAll(/npm run ([\w:-]+)/g)) {
    const script = npmScripts.get(match[1]);
    if (!script) continue;
    for (const path of scriptPathsIn(script.command)) {
      noteGenerator(script.prefix + path, `${rel} (commits back, via '${match[1]}')`);
    }
  }
}
// Naming THE healer, rather than counting any match. `sawCommittingWorkflow` alone is satisfied
// by `validate-line-endings.yml`, whose line 38 ECHOES the string "git commit" as advice — a
// non-comment line the detector matches. So the anti-vacuity guard had a satisfier that is not
// an actor: if `update-readmes.yml` ever migrates to an action this regex does not name
// (`peter-evans/create-pull-request`, `EndBug/add-and-commit`, a `gh api` commit, or even
// `git -C . commit`, which `git\s+commit` does not match), the real healer would leave the sweep
// silently while that echo kept the guard quiet.
if (!committingWorkflows.has(HEALER)) {
  refuse(`${HEALER} was not detected as committing output back. It is THE healer, so its absence `
    + 'means this detector no longer recognises how work is committed here — not that the '
    + `repository stopped healing. Detected instead: ${[...committingWorkflows].join(', ') || 'nothing'}`);
}

if (discovered.size === 0) {
  refuse('the reverse sweep discovered zero generators — it is broken, not the corpus');
}

// EXACT comparison. `blob.includes(generator)` was the first version and it falsely exempted a
// different generator by containment — see this file's header.
const listed = new Set(artifacts.map((entry) => entry.generator).filter(Boolean));
const exemptPaths = new Set();
for (const entry of exempt) {
  if (entry.generator) exemptPaths.add(entry.generator);
  for (const path of scriptPathsIn(entry.command ?? '')) exemptPaths.add(path);
  // An exemption that names neither a resolvable script nor an explicit `generator:` cannot
  // exempt anything, and saying so is better than letting it look load-bearing.
  if (!entry.generator && scriptPathsIn(entry.command ?? '').length === 0) {
    if (!entry.matches_nothing_by_design) {
      fail(`exemption '${entry.id ?? '(unnamed)'}' names no generator the sweep could ever `
        + 'discover — give it a `generator:` field, or mark `matches_nothing_by_design: true` '
        + 'with the reason it is documentation rather than an exemption');
    }
  } else if (entry.matches_nothing_by_design) {
    // The flag was checked in one direction only: it suppressed the complaint above, and nothing
    // failed when it was set on an entry that DOES resolve. A flag whose claim is never tested is
    // the "docstring guarantee" class — worst when it is the thing licensing a suppression.
    fail(`exemption '${entry.id ?? '(unnamed)'}' is marked \`matches_nothing_by_design\` but `
      + 'names a generator the sweep can resolve — the flag is false, and it is exempting '
      + 'something while claiming to exempt nothing');
  }
}

for (const [generator, source] of discovered) {
  if (listed.has(generator) || exemptPaths.has(generator)) continue;
  fail(`UNLISTED GENERATOR: ${generator} (found in ${source}) — add it to `
    + 'generated-artifacts.yml with the gate that reads its output, or to '
    + '`generators_without_committed_output` with the reason it produces none');
}

// ── Report ────────────────────────────────────────────────────────────────────────────────────

if (findings.length) {
  for (const finding of findings) console.error(`FAIL: ${finding}`);
  console.error(`\n${findings.length} finding(s) in generated-artifacts.yml.`);
  process.exit(1);
}

const gated = artifacts.filter((entry) => entry.gate?.kind === 'regenerate-and-diff').length;
const unread = artifacts.filter((entry) => entry.gate?.kind === 'none').length;
console.log(
  `generated-artifacts: ${artifacts.length} artifact class(es), ${gated} regenerate-and-diff, `
  + `${unread} with no reader; ${discovered.size} generator(s) swept, all accounted for.`,
);
