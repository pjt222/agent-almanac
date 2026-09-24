#!/usr/bin/env node
/**
 * check-workflow-generator-inputs.js — every module a healer workflow's generators import must
 * appear in that workflow's `paths:` filter (#618).
 *
 * `update-readmes.yml` regenerates committed output and auto-commits it. If a change to a
 * generator does not match the filter, the healer does not run at the causing commit, and the
 * drift sits until an unrelated push heals it or a release goes red (#362).
 *
 * That list has now been extended four separate times, once per omission, each after the
 * omission caused or nearly caused drift:
 *
 *   #553/#560  lib/translation-status.js   the stub verdict
 *   #566       lib/readme-sections.js      how a section renders
 *   —          lib/fences.js               the MIDDLE of the chain, with both endpoints listed
 *   #615/#552  lib/provenance.js           the frontmatter reader staleness is computed from
 *
 * A list maintained by memory is the failure mode, not the individual misses. This derives it
 * instead: resolve each `run:` step of the job to its entry script, walk the static import
 * graph, and require every reachable repo-local module to be matched by a `paths:` entry.
 *
 *   node scripts/check-workflow-generator-inputs.js          # exit 1 on any unlisted input
 *   node scripts/check-workflow-generator-inputs.js --warn   # report, exit 0
 *   node scripts/check-workflow-generator-inputs.js --list   # print the resolved graph
 *
 * ## Why the entry points are derived too
 *
 * Hardcoding "the generators are generate-readmes.js and generate-translation-status.js" would
 * rebuild the same defect one level up: add a fourth step to the job and its imports are
 * invisible again. The entry points come from the job's own `run:` steps, resolving
 * `npm run <name>` through `package.json`, so the check has no list of its own to maintain.
 *
 * One consequence, stated because it is a real scope decision rather than an accident: the
 * job's *validator* step (`npm run validate:readme-parity`) is an entry point too. Changing it
 * cannot move committed output — it can only fail the job — so requiring it in `paths:` is
 * stricter than #618 asked for. It is kept because "everything this job runs" is a rule a
 * reader can apply, and "everything this job runs that writes a file" is one that needs a
 * second list to answer.
 *
 * ## What it does not check
 *
 * That the `paths:` list is not too WIDE. Extra entries are legitimate and numerous here —
 * content globs, registries, the lockfile — so only the missing direction is enforced.
 *
 * Dynamic `import()` and `require()` are invisible to it. Neither appears in these scripts, and
 * a static-graph walk that silently mis-parsed would be the vacuous pass this repo keeps
 * finding, so an entry file it cannot read is an error rather than an empty graph.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, relative, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import { importGraph } from './lib/import-graph.js';

function flagValue(name) {
  const at = process.argv.indexOf(name);
  if (at === -1) return null;
  const value = process.argv[at + 1];
  // A bare trailing `--root` used to reach `join(undefined)` and crash with a TypeError.
  // `gate-envelope.js` guards its flags the same way; mirroring it costs three lines.
  if (!value || value.startsWith('--')) {
    console.error(`ERROR: ${name} needs a value.`);
    process.exit(2);
  }
  return value;
}

const ROOT = flagValue('--root') || join(dirname(fileURLToPath(import.meta.url)), '..');

const WARN_ONLY = process.argv.includes('--warn');
const LIST = process.argv.includes('--list');

/**
 * Healer workflows: those that regenerate committed output and push it back.
 *
 * Deliberately a short explicit list, unlike the input graph. "Which workflows heal" is a
 * property of intent that no file states mechanically — `git-auto-commit-action` is a strong
 * signal but a job could write output another way — so this is the one thing a human declares.
 * Everything downstream of it is derived.
 *
 * That reasoning holds and its consequence did not follow from it (#663): a future
 * auto-committing workflow was invisible here until a human remembered to add it, which is the
 * same list-maintained-by-memory failure the input derivation exists to close, one level up.
 *
 * So the declaration is now itself CHECKED, by `assertHealersDeclared` below. The list stays
 * authoritative — a human may still declare a healer no heuristic can see — and the heuristic
 * can no longer miss one it can see. Superset, not replacement.
 */
const HEALER_WORKFLOWS = ['.github/workflows/update-readmes.yml'];

/**
 * Workflows that push, but to ANOTHER repository — so they carry the healer signal and are not
 * healers: nothing they commit lands here, and there is no trigger coverage to check.
 *
 * Declared, then CHECKED, like the healer list: each entry must exist, must still carry a commit
 * signal (a stale declaration is a refusal, as a vanished healer is), must not also be a healer,
 * and must grant the workflow token `contents: read` at every `contents:` line and never leave
 * it unstated — so `github.token` cannot commit to this repository, and the only credential
 * that could is one a human put in a secret, which is the human decision this list records.
 * What that does NOT prove: that the secret is for the other repository. The declaration is the
 * claim; the permission is the part of it a check can hold to.
 */
const EXTERNAL_PUBLISHERS = ['.github/workflows/publish-hermes-profile.yml'];

/**
 * Actions that write back to the repository, matched anywhere in the (comment-stripped) file.
 *
 * Enumerated rather than pattern-matched, and scoped the way the rest of this file is scoped:
 * an unrecognised way of committing is a human decision, not an absence. The complement of
 * "ways to commit" is unenumerable — `gh api` PUT to `/contents`, `actions/github-script` with
 * `createOrUpdateFileContents`, a fork of any action below, a reusable workflow that commits —
 * so the honest claim is NOT that an undeclared healer cannot exist. It is that these forms
 * cannot be missed, and the highest-prior future failure here is someone copying
 * `update-readmes.yml`'s own pattern, which is the first entry.
 */
const COMMIT_ACTIONS = [
  { pattern: /stefanzweifel\/git-auto-commit-action/, name: 'git-auto-commit-action' },
  { pattern: /peter-evans\/create-pull-request/, name: 'create-pull-request' },
  { pattern: /EndBug\/add-and-commit/, name: 'add-and-commit' },
  { pattern: /ad-m\/github-push-action/, name: 'github-push-action' },
];

/** Shell commands that write back, tested against EXPANDED run steps rather than raw lines. */
const COMMIT_COMMANDS = [
  { pattern: /\bgit\s+push\b/, name: 'a bare `git push`' },
];

/**
 * Refuse a workflow that commits and is not declared a healer.
 *
 * The failure this closes is quiet: an undeclared healer's committed output has generator
 * inputs nobody is checking trigger coverage for, so drift lands at some later unrelated
 * commit — the exact outcome `update-readmes.yml`'s own header says it exists to prevent.
 */
function assertHealersDeclared(workflowDir, declared) {
  const undeclared = [];
  for (const name of readdirSync(workflowDir).sort()) {
    if (!/\.ya?ml$/.test(name)) continue;
    const workflowPath = `.github/workflows/${name}`;
    if (declared.includes(workflowPath)) continue;
    const text = readFileSync(join(workflowDir, name), 'utf8');
    // Comments are not commits. `validate-line-endings.yml` echoes `git add --renormalize`
    // as ADVICE, and a repo-wide grep for commit verbs finds it — which is why the signals
    // are anchored at `run:`/`uses:` rather than matched anywhere in the file.
    const stripped = text.split(/\r?\n/).filter((line) => !/^\s*#/.test(line)).join('\n');
    // Shell commands go through `runSteps`, which EXPANDS block scalars. Matching them against
    // raw lines instead made the `git push` signal dead for the form workflows actually use:
    //
    //     - run: |
    //         git add -A && git commit -m update
    //         git push
    //
    // The `run:` line carries no `git push`, the `git push` line carries no `run:`, and a
    // same-line pattern sees neither. A signal that cannot fire on its own named case is worse
    // than an absent one, because the next reader assumes it works — which is this file's own
    // argument about unreachable exemptions, one list further down.
    const hit = COMMIT_ACTIONS.find(({ pattern }) => pattern.test(stripped))
      ?? COMMIT_COMMANDS.find(({ pattern }) => runSteps(text).some((cmd) => pattern.test(cmd)));
    if (hit) undeclared.push({ workflowPath, signal: hit.name });
  }
  return undeclared;
}

/** Read the `paths:` entries of a workflow's `push:` trigger. */
function pushPaths(workflowText) {
  const lines = workflowText.split(/\r?\n/);
  const entries = [];
  let inPush = false;
  let inPaths = false;
  for (const line of lines) {
    if (/^  [A-Za-z_-]+:/.test(line)) {
      inPush = /^  push:/.test(line);
      inPaths = false;
      continue;
    }
    if (!inPush) continue;
    if (/^    paths:/.test(line)) { inPaths = true; continue; }
    if (/^    [A-Za-z_-]+:/.test(line)) { inPaths = false; continue; }
    if (!inPaths) continue;
    const match = line.match(/^      - ['"]?([^'"]+)['"]?\s*$/);
    if (match) entries.push(match[1]);
  }
  return entries;
}

/**
 * Every shell command in every `run:` step, block scalars expanded.
 *
 * `run: |` is the common form across this repo's workflows — five of them use it — and a reader
 * that treated the `|` as the command would throw "could not be resolved" on a perfectly ordinary
 * step. Worse, it would do so at the moment someone added a multi-line step to a healer, which
 * reads as the check being broken rather than as the step being unlisted.
 *
 * Each line of an expanded block is returned as its own command, since a block routinely holds
 * several: `npm ci` followed by `node scripts/x.js` must resolve to one non-entry and one entry.
 */
function runSteps(workflowText) {
  const lines = workflowText.split(/\r?\n/);
  const commands = [];
  for (let i = 0; i < lines.length; i++) {
    // `|2` (explicit indentation indicator) and a trailing `# comment` are legal YAML block
    // headers. Without them the INLINE regex captured `|2` as the command, `entryScript`
    // null-dropped it via the not-a-launcher pass, and the entire block body went unscanned --
    // silently, so long as the job had one other resolving entry.
    const block = lines[i].match(/^(\s*)-?\s*run:\s*[|>][-+]?\d*\s*(?:#.*)?$/);
    if (block) {
      const keyIndent = block[1].length;
      for (let j = i + 1; j < lines.length; j++) {
        const body = lines[j];
        if (body.trim() === '') continue;
        const indent = body.length - body.trimStart().length;
        if (indent <= keyIndent) { i = j - 1; break; }
        const command = body.trim();
        if (!command.startsWith('#')) commands.push(command);
        if (j === lines.length - 1) i = j;
      }
      continue;
    }
    const inline = lines[i].match(/^\s*-?\s*run:\s*(.+?)\s*$/);
    if (inline) commands.push(inline[1]);
  }
  return commands;
}

/**
 * Commands that run no repo JavaScript and are not entry points.
 *
 * Enumerated, so that an UNRECOGNISED command is an error rather than a silent skip. That
 * distinction is the whole difference between "this job has three entry points" and "this job
 * has three entry points that I happened to parse": a `run:` step whose form drifts would
 * otherwise shrink the graph, and the remaining modules would all still be listed, so the
 * check would report `0 unlisted` over a third of the job.
 */
// `/^npm run build\b/` was here and was DEAD: any command starting `npm run build` matches the
// `npm run <name>` branch of `entryScript` first, so the escape hatch could never engage. Removed
// rather than left as reassurance — an exemption nobody can reach is worse than none, because the
// next reader assumes it works.
const NON_ENTRY_COMMANDS = [/^npm ci\b/, /^npm install\b/];

/**
 * Commands that could launch repo code, and therefore must resolve or be declared.
 *
 * The complement is not "safe" — it is "not a launcher". Expanding a `run: |` block yields the
 * shell's own control flow line by line (`failed=0`, `for dir in skills/*\/; do`, `fi`), and
 * `validate-skills.yml` alone produces 67 such lines. Treating each as an unresolvable entry
 * point would bury the one real finding under sixty errors, which is how a check gets disabled.
 *
 * The list is what makes the refusal meaningful rather than noisy: `bash scripts/x.sh` IS on it,
 * because a shell script can run node, and skipping it is the silent-shrink hole this check
 * exists to close.
 */
// `yarn`, `pnpm`, `deno`, `bun`, `python` and `make` are here because without them a step using
// any of them fell through to the not-a-launcher pass, returned null, and vanished from the graph
// with no error — the silent shrink this whole classification exists to prevent, reachable the
// day someone adds a non-npm step.
const INVOKER_COMMANDS = [
  /^node\b/, /^npm\b/, /^npx\b/, /^yarn\b/, /^pnpm\b/, /^deno\b/, /^bun\b/,
  /^bash\b/, /^sh\b/, /^Rscript\b/, /^python3?\b/, /^make\b/, /^\.\//,
];

/**
 * Resolve one shell command to the script it runs.
 *
 * Returns the script path, or `null` for a command on the non-entry list. Throws for anything
 * else — including an `npm run` naming a package script that is not a `node <file>` invocation,
 * which is precisely how the graph would silently lose an entry point.
 */
function entryScript(command, packageScripts, viaNpmRun = false) {
  // A compound command is several commands. `node a.js && node b.js` resolved to `a.js` alone,
  // and a package script `"x && y"` to x's resolution alone -- with no error either way, which
  // directly contradicts this file's own stated doctrine that an unrecognised command is an
  // error rather than a silent skip. A HALF-recognised command was a silent partial skip.
  // Live shape in this repo: package.json's `test` is `npm run a && npm run b`.
  if (/&&|\|\||;/.test(command)) {
    return command
      .split(/&&|\|\||;/)
      .map((part) => part.trim())
      .filter(Boolean)
      .flatMap((part) => {
        const resolved = entryScript(part, packageScripts, viaNpmRun);
        return resolved === null ? [] : [resolved].flat();
      });
  }
  const npmRun = command.match(/^npm run ([A-Za-z0-9:_-]+)/);
  if (npmRun) {
    const script = packageScripts[npmRun[1]];
    if (!script) throw new Error(`run step names an undefined package script: npm run ${npmRun[1]}`);
    return entryScript(script, packageScripts, true);
  }
  const nodeRun = command.match(/^node\s+(?:--[^\s]+\s+)*([^\s]+\.js)/);
  if (nodeRun) return nodeRun[1];
  if (NON_ENTRY_COMMANDS.some((pattern) => pattern.test(command))) return null;
  // The "not a launcher" pass applies to the WORKFLOW's own lines only. A step that explicitly
  // says `npm run <name>` has declared an intent to run that package script, so the script must
  // resolve or be on the non-entry list — `echo skipped` there is the silent-shrink case, not a
  // shell fragment. Measured: without this flag, case 4 of the envelope stopped being killed.
  if (!viaNpmRun && !INVOKER_COMMANDS.some((pattern) => pattern.test(command))) return null;
  throw new Error(`run step could not be resolved to a script or recognised as a non-entry: ${command}`);
}

/**
 * Compile one GitHub path-filter entry to a regex.
 *
 * `**` crosses `/`, `*` and `?` do not — that is GitHub's rule, and the difference is what the
 * first version got wrong. It reduced any entry containing `**` to the prefix before it, so the
 * LIVE entry `i18n/**\/*.md` was read as "anything under `i18n/`" and would have reported a
 * future `i18n/<x>.js` as covered when GitHub's `*.md` suffix would not have triggered on it.
 * That is a false PASS, which on this gate means "the healer will run" when it will not.
 */
function entryToRegExp(entry) {
  let source = '^';
  for (let i = 0; i < entry.length; i++) {
    const ch = entry[i];
    if (ch === '*' && entry[i + 1] === '*') { source += '.*'; i++; }
    else if (ch === '*') source += '[^/]*';
    else if (ch === '?') source += '[^/]';
    else source += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`${source}$`);
}

/**
 * Is this file covered by the filter, reading the entries IN ORDER?
 *
 * GitHub applies a filter as a sequence: a later `!pattern` revokes what an earlier positive
 * granted. The first version returned `false` for every negation, which is the right half —
 * a negation never grants — and silently dropped the other: with `['scripts/**', '!scripts/lib/a.js']`
 * GitHub excludes `a.js` while `some()` granted it via the glob. False PASS again.
 */
function covered(file, entries) {
  let result = false;
  for (const entry of entries) {
    const negated = entry.startsWith('!');
    if (entryToRegExp(negated ? entry.slice(1) : entry).test(file)) result = !negated;
  }
  return result;
}

let findings = 0;
// Counted separately so the trailer, which describes UNLISTED MODULES, is not printed for a
// run whose only findings are undeclared healers — a different class entirely.
let undeclaredHealers = 0;
// Structural refusals: the check could not measure at all. Counted separately because
// `--warn` must not swallow them -- see the exit logic at the bottom.
let refusals = 0;

for (const { workflowPath, signal } of assertHealersDeclared(join(ROOT, '.github', 'workflows'), [...HEALER_WORKFLOWS, ...EXTERNAL_PUBLISHERS])) {
  console.error(`${WARN_ONLY ? 'WARN' : 'FAIL'}: ${workflowPath} uses ${signal} but is not in HEALER_WORKFLOWS.`);
  console.error('      Add it, or state why its committed output has no generator inputs — a workflow that');
  console.error('      pushes to ANOTHER repository belongs in EXTERNAL_PUBLISHERS with a read-only token.');
  undeclaredHealers++;
  findings++;
}

// An external publisher is skipped by the healer accusation above on the strength of its
// declaration, so the declaration is held to what a check can verify. Every failure here is a
// REFUSAL, not a finding: `--warn` must not turn "this workflow could write here" into a warning.
for (const workflow of EXTERNAL_PUBLISHERS) {
  const absolute = join(ROOT, workflow);
  if (HEALER_WORKFLOWS.includes(workflow)) {
    console.error(`FAIL: ${workflow} is listed as both a healer and an external publisher; it can be one.`);
    refusals++;
    continue;
  }
  if (!existsSync(absolute)) {
    console.error(`FAIL: external publisher workflow not found: ${workflow}`);
    refusals++;
    continue;
  }
  const text = readFileSync(absolute, 'utf8');
  const stripped = text.split(/\r?\n/).filter((line) => !/^\s*#/.test(line)).join('\n');
  const commits = COMMIT_ACTIONS.some(({ pattern }) => pattern.test(stripped))
    || COMMIT_COMMANDS.some(({ pattern }) => runSteps(text).some((cmd) => pattern.test(cmd)));
  if (!commits) {
    console.error(`FAIL: ${workflow} is declared an external publisher but carries no commit signal.`);
    console.error('      If it stopped pushing deliberately, remove it from EXTERNAL_PUBLISHERS as well.');
    refusals++;
    continue;
  }
  // Every `permissions:` block, at workflow or job level, read STRUCTURALLY: a line grep for
  // `contents:` would be satisfied by one inside a `run: |` block and blind to a job-level
  // `permissions: write-all` beside a workflow-level read. Unstated is not read-only: the
  // default token permission is a repository setting this check cannot see.
  const verdict = tokenGrants(stripped);
  if (!verdict.ok) {
    console.error(`FAIL: ${workflow} is declared an external publisher but ${verdict.why} — every permissions block `
      + 'must grant contents: read and nothing broader, so github.token cannot commit to this repository.');
    refusals++;
  }
}

/**
 * Read every `permissions:` block of a (comment-stripped) workflow and decide whether each grants
 * `contents: read`. A scalar value (`write-all`, `read-all`) or a flow mapping is refused rather
 * than parsed — an unrecognised form is a human decision, not a pass. No block at all is
 * "unstated", which is also a refusal.
 */
function tokenGrants(stripped) {
  const lines = stripped.split(/\r?\n/);
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    const head = lines[i].match(/^(\s*)permissions:\s*(.*?)\s*$/);
    if (!head) continue;
    const indent = head[1].length;
    const inlineValue = head[2];
    if (inlineValue !== '') return { ok: false, why: `its token permission is the scalar or flow form 'permissions: ${inlineValue}', which this check does not parse` };
    const grants = {};
    for (let j = i + 1; j < lines.length; j++) {
      const line = lines[j];
      if (line.trim() === '') continue;
      const lineIndent = line.match(/^\s*/)[0].length;
      if (lineIndent <= indent) break;
      const pair = line.match(/^\s*([A-Za-z_-]+):\s*(\S*)\s*$/);
      if (pair) grants[pair[1]] = pair[2];
    }
    blocks.push(grants);
  }
  if (blocks.length === 0) return { ok: false, why: 'its token permission is unstated' };
  for (const grants of blocks) {
    if (!('contents' in grants)) return { ok: false, why: 'a permissions block states no contents: grant' };
    if (grants.contents !== 'read') return { ok: false, why: `a permissions block grants contents: ${grants.contents}` };
  }
  return { ok: true, why: '' };
}

for (const workflow of HEALER_WORKFLOWS) {
  const absolute = join(ROOT, workflow);
  if (!existsSync(absolute)) {
    console.error(`FAIL: healer workflow not found: ${workflow}`);
    refusals++;
    continue;
  }
  const text = readFileSync(absolute, 'utf8');
  const entries = pushPaths(text);
  if (entries.length === 0) {
    // An absent or unparsed filter must not read as "everything is covered". A healer with no
    // filter is legitimate; a filter this function failed to parse is the vacuous pass.
    console.error(`FAIL: ${workflow} — no push paths: entries parsed. If the filter was removed`);
    console.error('      deliberately, remove this workflow from HEALER_WORKFLOWS as well.');
    refusals++;
    continue;
  }

  const packageScripts = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).scripts || {};
  const commands = runSteps(text);
  let scripts;
  try {
    // `flat()` because a compound command resolves to a LIST of scripts, not one.
    scripts = commands.flatMap((c) => entryScript(c, packageScripts) ?? []).flat().filter(Boolean);
  } catch (error) {
    // Reported rather than thrown, so one unparseable step does not hide the state of any
    // other healer workflow — and so the message names the command instead of a stack trace.
    console.error(`FAIL: ${workflow} — ${error.message}`);
    console.error('      Add it to NON_ENTRY_COMMANDS if it runs no repo JavaScript. Skipping it');
    console.error('      silently would shrink the import graph and report 0 unlisted over it.');
    refusals++;
    continue;
  }
  if (scripts.length === 0) {
    console.error(`FAIL: ${workflow} — no node entry point resolved from its run: steps.`);
    refusals++;
    continue;
  }

  const reachable = new Set();
  try {
    for (const script of scripts) {
      for (const module of importGraph(ROOT, script)) reachable.add(module);
    }
  } catch (error) {
    // Inside the try for the same reason the resolution is: `importGraph` throws on an import
    // it cannot resolve, and an uncaught throw here would skip every remaining healer while the
    // comment above promised the opposite.
    console.error(`FAIL: ${workflow} — ${error.message}`);
    refusals++;
    continue;
  }

  const missing = [...reachable].filter((module) => !covered(module, entries)).sort();

  if (LIST) {
    console.log(`${workflow}: ${scripts.length} entry point(s), ${reachable.size} module(s)`);
    for (const module of [...reachable].sort()) {
      console.log(`  ${covered(module, entries) ? 'listed  ' : 'MISSING '} ${module}`);
    }
    console.log('');
  }

  console.log(`${workflow}: ${reachable.size} module(s) reachable from ${scripts.length} entry point(s); ${missing.length} unlisted`);
  for (const module of missing) {
    console.log(`${WARN_ONLY ? 'WARN' : 'FAIL'}: ${module} is imported by this workflow's generators but matches no paths: entry`);
    findings++;
  }
}

if (findings - undeclaredHealers > 0 && !WARN_ONLY) {
  console.log('');
  console.log('A change to an unlisted module moves generated output without triggering the');
  console.log('healer, so the drift lands at some later unrelated commit instead.');
}
if (undeclaredHealers > 0 && !WARN_ONLY) {
  console.log('');
  console.log('An undeclared healer commits regenerated output that no trigger-coverage check');
  console.log('is watching, so its inputs can move without anything noticing.');
}

// `--warn` downgrades FINDINGS -- an unlisted module -- and never a REFUSAL. A refusal means the
// check could not read the filter, could not resolve a step, or could not walk the graph, and a
// warn-only run there would not warn less, it would lie. Same rule and same wording as
// `assertNotShallow` in scripts/lib/git-freshness.js; CLAUDE.md states it as "warn-only describes
// what a gate does with what it finds, never what it does when it cannot measure at all".
if (refusals > 0) {
  console.error('');
  console.error(`${refusals} structural refusal(s): the check could not measure, so this exits`);
  console.error('non-zero even under --warn.');
}

process.exitCode = refusals > 0 || (findings > 0 && !WARN_ONLY) ? 1 : 0;
