#!/usr/bin/env node
/**
 * build-hermes-distribution.js — emit the Agent Almanac as a Hermes profile distribution.
 *
 * A Hermes *profile distribution* is a git repository with a `distribution.yaml` at its root;
 * `hermes profile install <git-url>` shallow-clones it and copies every top-level entry into a
 * new profile directory (`~/.hermes/profiles/<name>/`). This script is the ONLY thing allowed to
 * write the distribution repository `pjt222/agent-almanac-hermes-profile` — it is generated,
 * never hand-edited, so that `git push` is publish and the channel cannot go stale by neglect
 * (companion issue #78: the npm package sat 3.5 months stale because it was maintained by hand).
 *
 * The distribution is deliberately NOT this repository with a manifest dropped in: Hermes copies
 * every top-level entry of the cloned tree into the consumer's profile, which would put `cli/`,
 * `viz/`, `scripts/`, `package.json` and `skills/_template/` into every install. The output root
 * therefore holds exactly five entries, and nothing else can appear there:
 *
 *   distribution.yaml   the manifest (schema read off Hermes v0.13.0, `DistributionManifest`)
 *   SOUL.md             a byte copy of this repository's root SOUL.md (operator decision, 08-19)
 *   README.md           generated; states provenance, the install command, and the no-pinning rule
 *   LICENSE             a byte copy of this repository's LICENSE
 *   skills/<id>/        the FULL registry — one directory per `skills/_registry.yml` entry
 *
 * ## Why the build-gates run on the OUTPUT and not on the source
 *
 * Every gate below re-reads what was just written. A future edit to the copy step, the manifest
 * writer or the README template is then caught by the same check that guards the content — a gate
 * over the inputs would trust the generator it lives in. The build always goes to a temp directory
 * first and is gated there; `--out` receives a copy only when every gate passed, so a red build
 * writes nothing and never leaves a checkout half-replaced.
 *
 * ## The gates, and the Hermes behaviour each one answers
 *
 *   user-owned      Any path component, at ANY depth, named in Hermes's `USER_OWNED_EXCLUDE`
 *                   (37 names: `cache`, `bin`, `logs`, `memories`, `.env`, …). At v0.13.0
 *                   `_copy_dist_payload` passes that set as `shutil.copytree`'s `ignore` callback,
 *                   so a nested `skills/<id>/bin/` is silently dropped on install. Upstream main
 *                   (2026-09-02) filters only at the staged root; the companion's investigation
 *                   places the change at v0.17.0 — verified here at the two endpoints only.
 *   hermes-excluded Any component in upstream's `EXCLUDED_SKILL_DIRS` (`.git`, `node_modules`,
 *                   `__pycache__`, …): a SKILL.md under one is invisible to the skill scanner.
 *   hidden          Any `_`- or `.`-prefixed DIRECTORY. `_` is this repository's own convention
 *                   for scaffolding (`skills/_template/`) and a dot-directory is never content
 *                   here. Files are not gated by prefix — a `.gitkeep` inside a skill is a
 *                   repository matter, not a Hermes one — except where a name is already user-owned.
 *   symlink         Any symlink, anywhere in the emitted tree and among the root inputs (a
 *                   symlinked SOUL.md or LICENSE is refused at load, not dereferenced). Accepted
 *                   and dereferenced at v0.13.0; upstream main rejects the whole tree
 *                   (`_reject_distribution_symlinks`); the companion places the change at v0.15.0.
 *   skill-shape     Exactly one SKILL.md per skill, at `skills/<id>/SKILL.md`, and nowhere else
 *                   beneath it. v0.13.0's `_count_skills` is `rglob("SKILL.md")` — a preserved
 *                   package under `references/` would inflate the count it reports; upstream
 *                   excludes support paths. One SKILL.md at the root is the shape both agree on.
 *   count           Registry entries == `total_skills` == emitted skill directories == the number
 *                   stated in the manifest description, as a whole number and not a substring.
 *                   A registry listing no skills does not build at all, and a check that scanned
 *                   zero files is itself a finding — a vacuous run cannot read as clean.
 *   banned-literal  The four secret patterns from the companion's build-gate list and the
 *                   fabricated-constant string struck in companion #66, in EVERY emitted file
 *                   including the manifest and README this script writes. Pinned as literals,
 *                   not anchored: `almanac@` also matches the npm spelling `agent-almanac@1.9.1`,
 *                   which is why the generated README never uses `name@version`.
 *   manifest        Re-parsed from disk, every field: `name` matches Hermes's `_PROFILE_ID_RE`
 *                   and is not reserved; `version` equals package.json; `author` and `license`
 *                   equal package.json's (or are absent when it has none); `hermes_requires` is
 *                   the pinned floor; no `env_requires` (nothing here needs a credential); no
 *                   `distribution_owned` (parsed but never enforced at v0.13.0 — `owned_paths()`
 *                   has zero callers — so writing one would claim a control the manifest does not
 *                   have); no other key. A sequence or an unparseable file is one finding.
 *   root-set        The five entries above and nothing else (`.git` is tolerated in `--out`).
 *   soul            Byte equality with the source SOUL.md.
 *
 * ## Modes
 *
 *   --out <dir>               build, gate, and only then copy into <dir>. Refuses (exit 2) a <dir>
 *                             inside this repository's `skills/` tree or equal to its root, and a
 *                             non-empty <dir> whose ROOT holds anything other than the five owned
 *                             entries and `.git` — those it replaces, which is the
 *                             regenerate-in-place publish path. The refusal is root-level by
 *                             design: a file hand-added INSIDE `skills/` of a checkout is replaced
 *                             with the rest of that entry, because that repository is generated.
 *   --check                   build into a temp dir, run every gate, exit 1 on any finding. This is
 *                             the CI gate: it fails when THIS tree acquires something the
 *                             distribution cannot carry (a symlink, a `bin/`, a secret).
 *   --check --against <dir>   additionally diff the fresh build against <dir> (a checkout of the
 *                             distribution repository): any added, removed or changed file, or a
 *                             changed executable bit, is a finding. Output is deterministic on an
 *                             LF checkout — no timestamps, no commit shas in any emitted file, and
 *                             skill files are byte copies whose line endings are the checkout's,
 *                             which `validate-line-endings` keeps LF — so this diff needs no
 *                             content exclusions. Two things it cannot see, stated: mode bits
 *                             other than the executable bit, and empty directories, which git
 *                             cannot store and a git-sourced build therefore never emits.
 *   --root <dir>              repository root to build from (default: this checkout). Tests use
 *                             it, and so does the first publish, which runs THIS script against a
 *                             worktree of the release tag that predates it.
 *   --json                    print the summary as JSON on stdout.
 *
 * Needs `npm ci` first (js-yaml) — a fresh worktree without node_modules dies on the import,
 * which is how the companion session's first run of this file ended.
 *
 * Exit codes follow the repository contract: 0 clean, 1 a finding, 2 could not build or could
 * not measure — a registry entry with no directory or an id that is not its directory name, a
 * count the registry disagrees with itself about, an unsafe or foreign `--out`, a usage error,
 * or ANY unexpected exception (reported with its stack; a crash must never read as a finding).
 * Exit 2 is never a pass.
 *
 * ## Deviation from the 2026-08-19 thread, stated
 *
 * The thread decided the skill-count assertion would ship warn-only with a `debt-ratchet.yml`
 * slice. That decision was taken for an in-place layout, where a consumer's `_count_skills` could
 * not equal the registry until `skills/_template/` moved out of `skills/`. Under the separate
 * repository the payload is built from registry ids, scaffolding cannot enter it, and the count is
 * exact by construction — so the gate is blocking, and there is no slice because there is no
 * member. A ratchet over an empty class for a gate that cannot fail is what that file's own header
 * forbids.
 */

import {
  readFileSync, writeFileSync, mkdirSync, readdirSync, lstatSync, statSync, rmSync, existsSync,
  copyFileSync, cpSync, mkdtempSync, realpathSync,
} from 'node:fs';
import { resolve, dirname, join, basename, relative, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import * as yaml from 'js-yaml';
import { parseArgs, usageExit } from './lib/parse-args.js';

// ── Hermes constants, copied verbatim from the pin and re-checked against upstream ──────────
//
// `USER_OWNED_EXCLUDE`: hermes_cli/profile_distribution.py, identical at v0.13.0 (the pin the
// operator's VPS ran until 2026-09-02, 702 lines; it now runs v2026.8.31) and at upstream main
// on 2026-09-02 (782 lines) — 37 names. The test
// suite pins the full set, and tools/validate-hermes-distribution.py compares it against the
// module it is handed, so a substituted name cannot silently re-scope the gate.
export const USER_OWNED_EXCLUDE = Object.freeze([
  'auth.json', '.env',
  'state.db', 'state.db-shm', 'state.db-wal',
  'hermes_state.db', 'response_store.db',
  'response_store.db-shm', 'response_store.db-wal',
  'gateway.pid', 'gateway_state.json', 'processes.json',
  'auth.lock', 'active_profile', '.update_check',
  'errors.log', '.hermes_history',
  'memories', 'sessions', 'logs', 'plans', 'workspace', 'home',
  'image_cache', 'audio_cache', 'document_cache',
  'browser_screenshots', 'checkpoints', 'sandboxes',
  'backups', 'cache',
  'hermes-agent', '.worktrees', 'profiles', 'bin', 'node_modules',
  'local',
]);

// `EXCLUDED_SKILL_DIRS`: agent/skill_utils.py at upstream main, 2026-09-02 — 14 names. Not in the
// v0.13.0 pin (its `_count_skills` excluded nothing), so this gate is forward-looking: a skill
// under one of these would be counted by the pin and dropped by upstream.
export const EXCLUDED_SKILL_DIRS = Object.freeze([
  '.git', '.github', '.hub', '.archive', '.venv', 'venv', 'node_modules', 'site-packages',
  '__pycache__', '.tox', '.nox', '.pytest_cache', '.mypy_cache', '.ruff_cache',
]);

// hermes_cli/profiles.py: `_PROFILE_ID_RE` and `_RESERVED_NAMES`, upstream main 2026-09-02
// (fetched with `gh api repos/NousResearch/hermes-agent/contents/hermes_cli/profiles.py`).
export const PROFILE_ID_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/;
export const RESERVED_PROFILE_NAMES = Object.freeze(['hermes', 'default', 'test', 'tmp', 'root', 'sudo']);

// Companion #78's build-gate list (four secret patterns) plus the fabricated constant struck in
// companion #66. Literals, deliberately — see the header on `almanac@`.
export const BANNED_LITERALS = Object.freeze(['187.124.161.28', 'almanac@', 'moltbook_sk_', 'sk-ant-', '$0.55/day']);

/** A registry id is one path segment of this shape, and it IS the skill's directory name. */
export const SKILL_ID_RE = /^[a-z0-9][a-z0-9-]*$/;

export const MANIFEST_FILENAME = 'distribution.yaml';
export const DISTRIBUTION_NAME = 'agent-almanac';
export const HERMES_REQUIRES = '>=0.13.0';
export const DISTRIBUTION_REPO = 'github.com/pjt222/agent-almanac-hermes-profile';
export const SOURCE_REPO = 'github.com/pjt222/agent-almanac';

/** The root entries this generator owns. Anything else at the output root is a finding. */
export const OWNED_ROOT_ENTRIES = Object.freeze([MANIFEST_FILENAME, 'SOUL.md', 'README.md', 'LICENSE', 'skills']);

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = resolve(__dirname, '..');

// ── Errors ─────────────────────────────────────────────────────────────────────────────────

/** Could not build: the inputs are inconsistent or the target is unsafe. Exit 2. */
export class BuildError extends Error {}

/** Is `child` equal to `parent` or beneath it? Both absolute. */
function within(child, parent) {
  return child === parent || child.startsWith(parent + sep);
}

// ── Inputs ─────────────────────────────────────────────────────────────────────────────────

function readYaml(path) {
  try {
    return yaml.load(readFileSync(path, 'utf8'));
  } catch (err) {
    throw new BuildError(`cannot read ${path}: ${err.message}`);
  }
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    throw new BuildError(`cannot read ${path}: ${err.message}`);
  }
}

/**
 * Read the four inputs and derive everything the output depends on. Pure with respect to the
 * output directory: nothing here writes.
 */
export function loadInputs(root) {
  const pkg = readJson(join(root, 'package.json'));
  const skillsRegistry = readYaml(join(root, 'skills', '_registry.yml'));
  const agentsRegistry = readYaml(join(root, 'agents', '_registry.yml'));
  const teamsRegistry = readYaml(join(root, 'teams', '_registry.yml'));

  if (typeof pkg.version !== 'string' || !pkg.version) throw new BuildError('package.json has no version');

  const entries = [];
  for (const [domain, spec] of Object.entries(skillsRegistry?.domains ?? {})) {
    for (const skill of spec?.skills ?? []) {
      if (!skill?.id || typeof skill.path !== 'string') {
        throw new BuildError(`skills/_registry.yml: malformed entry in domain '${domain}': ${JSON.stringify(skill)}`);
      }
      const id = String(skill.id);
      if (basename(skill.path) !== 'SKILL.md') {
        throw new BuildError(`skills/_registry.yml: '${id}' path '${skill.path}' does not end in SKILL.md`);
      }
      // The id names the emitted directory and the path names the source; they must be the same
      // single segment, or a skill is renamed in the distribution — and an id with `/` or `..`
      // in it would write outside --out.
      if (!SKILL_ID_RE.test(id)) {
        throw new BuildError(`skills/_registry.yml: id '${id}' is not a single safe path segment (${SKILL_ID_RE})`);
      }
      if (dirname(skill.path) !== id) {
        throw new BuildError(`skills/_registry.yml: '${id}' has path '${skill.path}' — the directory must be named by the id`);
      }
      entries.push({ id, sourceDir: join(root, 'skills', id), domain });
    }
  }

  const ids = entries.map((e) => e.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) throw new BuildError(`skills/_registry.yml: duplicate ids ${[...new Set(dupes)].join(', ')}`);
  if (entries.length === 0) throw new BuildError('skills/_registry.yml lists no skills — refusing to build an empty distribution');

  const totalSkills = Number(skillsRegistry?.total_skills);
  if (!Number.isInteger(totalSkills)) throw new BuildError('skills/_registry.yml: total_skills is not an integer');
  if (totalSkills !== entries.length) {
    throw new BuildError(`skills/_registry.yml: total_skills says ${totalSkills} but ${entries.length} entries are listed — `
      + 'refusing to build a distribution whose description would state a count the registry disagrees with itself about');
  }
  for (const e of entries) {
    if (!existsSync(join(e.sourceDir, 'SKILL.md'))) {
      throw new BuildError(`skills/_registry.yml: '${e.id}' names ${relative(root, e.sourceDir)}/SKILL.md, which does not exist`);
    }
  }

  const totalAgents = Number(agentsRegistry?.total_agents);
  const totalTeams = Number(teamsRegistry?.total_teams);
  if (!Number.isInteger(totalAgents)) throw new BuildError('agents/_registry.yml: total_agents is not an integer');
  if (!Number.isInteger(totalTeams)) throw new BuildError('teams/_registry.yml: total_teams is not an integer');

  // lstat, not existsSync: a symlinked SOUL.md would be dereferenced by the copy and the soul gate
  // would compare two reads of the same link — "any symlink" has to include the root inputs.
  for (const name of ['SOUL.md', 'LICENSE']) {
    const path = join(root, name);
    if (!existsSync(path)) throw new BuildError(`${name} is missing at the repository root`);
    const st = lstatSync(path);
    if (st.isSymbolicLink() || !st.isFile()) throw new BuildError(`${name} at the repository root is a symlink or not a regular file`);
  }

  return {
    root,
    version: pkg.version,
    author: typeof pkg.author === 'string' ? pkg.author : '',
    license: typeof pkg.license === 'string' ? pkg.license : '',
    entries,
    totalSkills,
    totalAgents,
    totalTeams,
  };
}

// ── Emitted text ───────────────────────────────────────────────────────────────────────────

export function manifestDescription(inputs) {
  return `Agent Almanac skills library: ${inputs.totalSkills} skills bundled (agentskills.io SKILL.md format); `
    + `the source catalog also lists ${inputs.totalAgents} agents and ${inputs.totalTeams} teams. `
    + `Generated from ${SOURCE_REPO} by scripts/build-hermes-distribution.js; never edited by hand.`;
}

/** The manifest, in the key order Hermes's own `to_dict()` emits. */
export function manifestObject(inputs) {
  const out = {
    name: DISTRIBUTION_NAME,
    version: inputs.version,
    description: manifestDescription(inputs),
    hermes_requires: HERMES_REQUIRES,
  };
  if (inputs.author) out.author = inputs.author;
  if (inputs.license) out.license = inputs.license;
  return out;
}

export function renderManifest(inputs) {
  return '# Generated by scripts/build-hermes-distribution.js in ' + SOURCE_REPO + '. Do not edit.\n'
    + yaml.dump(manifestObject(inputs), { lineWidth: -1, noRefs: true, sortKeys: false });
}

export function renderReadme(inputs) {
  const n = inputs.totalSkills;
  return `# Agent Almanac — Hermes profile distribution

**Generated. Do not edit.** Every file in this repository is written by
\`scripts/build-hermes-distribution.js\` in [${SOURCE_REPO}](https://${SOURCE_REPO}) and is
overwritten on the next build. Report issues and send changes to the source repository; a change
made here is lost at the next release.

## Install

\`\`\`bash
hermes profile install ${DISTRIBUTION_REPO}
hermes -p ${DISTRIBUTION_NAME}
\`\`\`

\`hermes profile install\` creates the profile \`${DISTRIBUTION_NAME}\` under \`~/.hermes/profiles/\` and
does not switch your active profile; pass \`--name <other>\` to install under another name and
\`hermes profile update ${DISTRIBUTION_NAME}\` to re-pull. Installing never touches an existing
profile's memories, sessions, credentials or config. It DOES replace that profile's \`skills/\`
directory wholesale: \`hermes profile update\` and \`hermes profile install --force\` remove it
before copying, so do not keep hand-written skills inside this profile — put them in another
profile or in a directory Hermes's \`skills.external_dirs\` points at.

## What is in it

- \`skills/\` — ${n} skills, one directory per entry of the almanac's \`skills/_registry.yml\`, each
  holding a \`SKILL.md\` in the [agentskills.io](https://agentskills.io) format plus any
  \`references/\`, \`scripts/\` or \`examples/\` the skill ships with. The full registry, no curated subset.
- \`SOUL.md\` — a byte copy of the almanac's root \`SOUL.md\`.
- \`distribution.yaml\` — the Hermes manifest. Its \`version\` (${inputs.version}) mirrors the almanac's
  \`package.json\`, and its description carries the live counts — the source catalog also lists
  ${inputs.totalAgents} agents and ${inputs.totalTeams} teams, which are not part of a Hermes profile
  and are not shipped here.
- \`LICENSE\` — the almanac's MIT license.

Nothing else. Hermes copies every top-level entry of this repository into the profile directory,
which is why the almanac's CLI, visualisation, scripts and tests are not here.

## No ref pinning — read before depending on this

\`hermes profile install\` runs \`git clone --depth 1\` of this repository's default branch at the
moment of install, and \`hermes profile update\` re-pulls it. **Hermes does not pin a tag, branch
or commit** — the \`#<ref>\` syntax its module docstring mentions is not implemented, at the
operator's v0.13.0 pin nor at upstream main as of 2026-09-02. You get whatever HEAD is.

HEAD here only ever moves when the almanac cuts a release tag, and every build is made from that
tag's checkout, so HEAD always corresponds to an almanac release tag — the commit message names
the tag and the source commit. If you need a fixed set of bytes, fork this repository and install
from your fork, or export the commit you reviewed and install from the export:

\`\`\`bash
git -C /path/to/clone archive --format=tar <commit> | (mkdir -p /tmp/almanac-dist && tar -x -C /tmp/almanac-dist)
hermes profile install /tmp/almanac-dist
\`\`\`

Install from the export, not from the clone itself: a local-directory install copies the
directory as it is, \`.git/\` included.

## Hermes compatibility

- \`hermes_requires: ${HERMES_REQUIRES}\` — the earliest version the build was verified against;
  upstream main (2026-09-02) installs it too.
- No symlinks anywhere. v0.13.0 dereferences them; upstream main rejects a distribution that
  contains one.
- No directory at any depth named \`cache\`, \`bin\`, \`logs\`, \`memories\` or any other name in
  Hermes's user-owned list, which v0.13.0 filters at every depth on install.
- Exactly one \`SKILL.md\` per skill, at \`skills/<id>/SKILL.md\`, so the install preview's skill
  count equals the registry's at every Hermes version.

All of the above is enforced by the generator's build-gates before anything is written here.
`;
}

// ── Walking ────────────────────────────────────────────────────────────────────────────────

/**
 * Every path beneath `dir`, depth-first, with the lstat result — symlinks are reported as
 * themselves, never followed. `skipRoot` names root-level entries to leave alone (`.git`).
 */
export function walk(dir, { skipRoot = [] } = {}) {
  const out = [];
  const visit = (abs, relParts) => {
    for (const name of readdirSync(abs).sort()) {
      if (relParts.length === 0 && skipRoot.includes(name)) continue;
      const child = join(abs, name);
      const st = lstatSync(child);
      const parts = [...relParts, name];
      out.push({ abs: child, rel: parts.join('/'), parts, stat: st });
      if (st.isDirectory()) visit(child, parts);
    }
  };
  visit(dir, []);
  return out;
}

// ── Copy ───────────────────────────────────────────────────────────────────────────────────

/**
 * Copy `src` into `dest` recursively. Regular files and directories only; a symlink or anything
 * else is reported and NOT copied, so the output gates see its absence and the finding names the
 * source path. Returns the findings.
 */
function copyTree(src, dest, srcRoot, findings) {
  mkdirSync(dest, { recursive: true });
  for (const name of readdirSync(src).sort()) {
    const from = join(src, name);
    const to = join(dest, name);
    const st = lstatSync(from);
    if (st.isSymbolicLink()) {
      findings.push({ gate: 'symlink', path: relative(srcRoot, from).split(sep).join('/'), detail: 'symlink in the source tree; not copied' });
      continue;
    }
    if (st.isDirectory()) {
      copyTree(from, to, srcRoot, findings);
    } else if (st.isFile()) {
      copyFileSync(from, to);
    } else {
      findings.push({ gate: 'symlink', path: relative(srcRoot, from).split(sep).join('/'), detail: 'neither a regular file nor a directory; not copied' });
    }
  }
}

// ── Build ──────────────────────────────────────────────────────────────────────────────────

/**
 * Write the distribution into `outDir`, which must already be prepared (empty, or owned entries
 * removed). Returns copy-time findings (symlinks in the source).
 */
export function emit(inputs, outDir) {
  const findings = [];
  mkdirSync(join(outDir, 'skills'), { recursive: true });
  for (const e of inputs.entries) {
    copyTree(e.sourceDir, join(outDir, 'skills', e.id), inputs.root, findings);
  }
  copyFileSync(join(inputs.root, 'SOUL.md'), join(outDir, 'SOUL.md'));
  copyFileSync(join(inputs.root, 'LICENSE'), join(outDir, 'LICENSE'));
  writeFileSync(join(outDir, MANIFEST_FILENAME), renderManifest(inputs));
  writeFileSync(join(outDir, 'README.md'), renderReadme(inputs));
  return findings;
}

/**
 * Refuse an `--out` that would write into the source: the repository root itself, or anywhere
 * under its `skills/` tree (copying a skill into a directory beneath it is a self-feeding walk).
 */
export function assertOutDirSafe(outDir, inputs) {
  const skillsRoot = join(inputs.root, 'skills');
  if (outDir === inputs.root) throw new BuildError(`--out ${outDir} is the repository root`);
  if (within(outDir, skillsRoot)) throw new BuildError(`--out ${outDir} is inside the source skills tree ${skillsRoot}`);
  for (const e of inputs.entries) {
    if (within(e.sourceDir, outDir)) throw new BuildError(`--out ${outDir} contains the source skill ${e.sourceDir}`);
  }
}

/**
 * Make `outDir` safe to emit into: create it, or — if it exists and its ROOT holds only entries
 * this generator owns (plus `.git`) — remove those entries. Anything else at the root is a
 * BuildError, because deleting a stranger's files to make room is not this script's call. The
 * check is root-level by design; see the header.
 */
export function prepareOutDir(outDir) {
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
    return;
  }
  if (!lstatSync(outDir).isDirectory()) throw new BuildError(`--out ${outDir} exists and is not a directory`);
  const present = readdirSync(outDir);
  const foreign = present.filter((n) => n !== '.git' && !OWNED_ROOT_ENTRIES.includes(n));
  if (foreign.length) {
    throw new BuildError(`--out ${outDir} holds entries this generator does not own: ${foreign.join(', ')} — `
      + 'refusing to delete them. Use an empty directory or a checkout of the distribution repository.');
  }
  for (const n of present) {
    if (n !== '.git') rmSync(join(outDir, n), { recursive: true, force: true });
  }
}

// ── Gates ──────────────────────────────────────────────────────────────────────────────────

/**
 * Run every gate over the emitted tree. Returns `{ findings, measured }`. A run that scanned no
 * files is itself a finding, so `measured` is not merely reported: a vacuous run is red.
 */
export function checkOutput(outDir, inputs) {
  const findings = [];
  const add = (gate, path, detail) => findings.push({ gate, path, detail });

  // root-set: exactly the owned entries.
  const rootEntries = readdirSync(outDir).filter((n) => n !== '.git').sort();
  for (const n of rootEntries) if (!OWNED_ROOT_ENTRIES.includes(n)) add('root-set', n, 'not an entry this generator emits; Hermes would copy it into every profile');
  for (const n of OWNED_ROOT_ENTRIES) if (!rootEntries.includes(n)) add('root-set', n, 'expected at the distribution root and missing');

  // Path-component gates and symlinks, over everything.
  const paths = walk(outDir, { skipRoot: ['.git'] });
  for (const p of paths) {
    if (p.stat.isSymbolicLink()) add('symlink', p.rel, 'symlink in the emitted tree');
    for (const part of p.parts) {
      if (USER_OWNED_EXCLUDE.includes(part)) add('user-owned', p.rel, `component '${part}' is in Hermes USER_OWNED_EXCLUDE; dropped silently on install at v0.13.0`);
      if (EXCLUDED_SKILL_DIRS.includes(part)) add('hermes-excluded', p.rel, `component '${part}' is in Hermes EXCLUDED_SKILL_DIRS; invisible to the skill scanner`);
    }
    if (p.stat.isDirectory() && (basename(p.rel).startsWith('_') || basename(p.rel).startsWith('.'))) {
      add('hidden', p.rel, `directory '${basename(p.rel)}' is underscore- or dot-prefixed`);
    }
  }

  // skill-shape and count.
  const skillsDir = join(outDir, 'skills');
  const emittedIds = existsSync(skillsDir) ? readdirSync(skillsDir).sort() : [];
  const expectedIds = inputs.entries.map((e) => e.id).sort();
  for (const id of emittedIds) {
    if (!expectedIds.includes(id)) add('count', `skills/${id}`, 'emitted but not in the registry');
    const skillRoot = join(skillsDir, id);
    if (!lstatSync(skillRoot).isDirectory()) { add('skill-shape', `skills/${id}`, 'not a directory'); continue; }
    if (!existsSync(join(skillRoot, 'SKILL.md'))) add('skill-shape', `skills/${id}/SKILL.md`, 'missing at the skill root');
    for (const p of walk(skillRoot)) {
      if (p.parts.length > 1 && basename(p.rel) === 'SKILL.md') add('skill-shape', `skills/${id}/${p.rel}`, 'a nested SKILL.md inflates v0.13.0\'s _count_skills');
    }
  }
  for (const id of expectedIds) if (!emittedIds.includes(id)) add('count', `skills/${id}`, 'in the registry but not emitted');

  const skillMdCount = paths.filter((p) => p.parts[0] === 'skills' && basename(p.rel) === 'SKILL.md').length;
  if (skillMdCount !== inputs.totalSkills) add('count', 'skills', `${skillMdCount} SKILL.md files emitted, registry total_skills is ${inputs.totalSkills}`);

  // manifest: re-parsed from disk, never from memory, every field.
  let manifest = null;
  let manifestParsed = false;
  const manifestPath = join(outDir, MANIFEST_FILENAME);
  if (existsSync(manifestPath)) {
    try {
      manifest = yaml.load(readFileSync(manifestPath, 'utf8'));
      manifestParsed = true;
    } catch (err) {
      add('manifest', MANIFEST_FILENAME, `does not parse: ${err.message}`);
    }
  }
  if (manifestParsed && manifest && typeof manifest === 'object' && !Array.isArray(manifest)) {
    const keys = Object.keys(manifest);
    const allowed = ['name', 'version', 'description', 'hermes_requires', 'author', 'license'];
    for (const k of keys) if (!allowed.includes(k)) add('manifest', `${MANIFEST_FILENAME}:${k}`, `key '${k}' is not one this distribution may carry`);
    if ('env_requires' in manifest) add('manifest', `${MANIFEST_FILENAME}:env_requires`, 'must be absent — nothing in the bundle needs a credential');
    if ('distribution_owned' in manifest) add('manifest', `${MANIFEST_FILENAME}:distribution_owned`, 'must be absent — parsed but never enforced at v0.13.0');
    if (manifest.name !== DISTRIBUTION_NAME) add('manifest', `${MANIFEST_FILENAME}:name`, `'${manifest.name}' is not '${DISTRIBUTION_NAME}'`);
    if (typeof manifest.name !== 'string' || !PROFILE_ID_RE.test(manifest.name)) add('manifest', `${MANIFEST_FILENAME}:name`, 'does not match Hermes _PROFILE_ID_RE ^[a-z0-9][a-z0-9_-]{0,63}$');
    if (RESERVED_PROFILE_NAMES.includes(manifest.name)) add('manifest', `${MANIFEST_FILENAME}:name`, 'is a reserved Hermes profile name');
    if (String(manifest.version) !== inputs.version) add('manifest', `${MANIFEST_FILENAME}:version`, `'${manifest.version}' does not mirror package.json '${inputs.version}'`);
    // A whole number, not a substring: "1371 skills" must not satisfy "371 skills".
    const stated = new RegExp(`(?<![0-9])${inputs.totalSkills} skills(?![0-9])`);
    if (typeof manifest.description !== 'string' || !stated.test(manifest.description)) {
      add('manifest', `${MANIFEST_FILENAME}:description`, `does not state '${inputs.totalSkills} skills'`);
    }
    if (manifest.hermes_requires !== HERMES_REQUIRES) add('manifest', `${MANIFEST_FILENAME}:hermes_requires`, `'${manifest.hermes_requires}' is not '${HERMES_REQUIRES}'`);
    for (const field of ['author', 'license']) {
      const expected = inputs[field] || undefined;
      if (manifest[field] !== expected) add('manifest', `${MANIFEST_FILENAME}:${field}`, `'${manifest[field]}' does not mirror package.json ${expected === undefined ? '(absent)' : `'${expected}'`}`);
    }
  } else if (manifestParsed) {
    add('manifest', MANIFEST_FILENAME, 'is not a mapping');
  }

  // soul: bytes.
  const soulOut = join(outDir, 'SOUL.md');
  if (existsSync(soulOut) && !readFileSync(soulOut).equals(readFileSync(join(inputs.root, 'SOUL.md')))) {
    add('soul', 'SOUL.md', 'differs from the source SOUL.md');
  }

  // banned-literal: every regular file, including what this script wrote.
  let filesScanned = 0;
  for (const p of paths) {
    if (!p.stat.isFile()) continue;
    filesScanned += 1;
    const text = readFileSync(p.abs, 'latin1');
    for (const lit of BANNED_LITERALS) {
      if (text.includes(lit)) add('banned-literal', p.rel, `contains '${lit}'`);
    }
  }
  if (filesScanned === 0) add('count', '.', 'no files scanned — this run checked nothing');

  return {
    findings,
    measured: { pathsWalked: paths.length, filesScanned, skillDirs: emittedIds.length, skillMdCount },
  };
}

// ── Drift against a checkout ───────────────────────────────────────────────────────────────

/** Byte-compare two trees (ignoring root `.git`), executable bit included. */
export function diffTrees(freshDir, againstDir) {
  const findings = [];
  const index = (dir) => new Map(walk(dir, { skipRoot: ['.git'] }).map((p) => [p.rel, p]));
  const fresh = index(freshDir);
  const against = index(againstDir);
  for (const [rel, p] of fresh) {
    const q = against.get(rel);
    if (!q) { findings.push({ gate: 'drift', path: rel, detail: 'missing from the checkout' }); continue; }
    // lstat on both sides: a symlink in the checkout whose target holds the right bytes would
    // otherwise compare equal through readFileSync, and Hermes rejects the symlink regardless.
    if (q.stat.isSymbolicLink()) { findings.push({ gate: 'drift', path: rel, detail: 'symlink in the checkout' }); continue; }
    if (p.stat.isDirectory() !== q.stat.isDirectory()) { findings.push({ gate: 'drift', path: rel, detail: 'file/directory mismatch' }); continue; }
    if (p.stat.isFile()) {
      if (!readFileSync(p.abs).equals(readFileSync(q.abs))) findings.push({ gate: 'drift', path: rel, detail: 'content differs' });
      else if ((p.stat.mode & 0o111) !== (q.stat.mode & 0o111)) findings.push({ gate: 'drift', path: rel, detail: 'executable bit differs' });
    }
  }
  for (const rel of against.keys()) {
    if (!fresh.has(rel)) findings.push({ gate: 'drift', path: rel, detail: 'present in the checkout but not generated' });
  }
  return findings;
}

// ── Orchestration ──────────────────────────────────────────────────────────────────────────

/**
 * Build into a temp dir, gate there, and only on a clean build copy into `outDir` (if given).
 * Returns the summary a caller prints or JSON-encodes; never exits.
 */
export function build({ root, outDir = null, against = null }) {
  const inputs = loadInputs(root);
  if (outDir) assertOutDirSafe(outDir, inputs);
  const tempDir = mkdtempSync(join(tmpdir(), 'hermes-dist-'));
  try {
    const copyFindings = emit(inputs, tempDir);
    const { findings: gateFindings, measured } = checkOutput(tempDir, inputs);
    const driftFindings = against ? diffTrees(tempDir, against) : [];
    const findings = [...copyFindings, ...gateFindings, ...driftFindings];
    let written = false;
    if (outDir && findings.length === 0) {
      prepareOutDir(outDir);
      cpSync(tempDir, outDir, { recursive: true });
      written = true;
    }
    return {
      root,
      out: outDir,
      written,
      against,
      version: inputs.version,
      skills: inputs.totalSkills,
      agents: inputs.totalAgents,
      teams: inputs.totalTeams,
      measured,
      findings,
      ok: findings.length === 0,
    };
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

function main(argv) {
  const spec = { bool: ['--check', '--json', '--help'], value: ['--out', '--against', '--root'] };
  const args = parseArgs(argv, spec, usageExit(spec));
  if (args.help) {
    console.log('Usage: node scripts/build-hermes-distribution.js (--out <dir> | --check [--against <dir>]) [--root <dir>] [--json]');
    return 0;
  }
  if (!!args.out === !!args.check) {
    console.error('exactly one of --out <dir> or --check is required');
    return 2;
  }
  if (args.against && !args.check) {
    console.error('--against requires --check');
    return 2;
  }
  const root = resolve(args.root ?? DEFAULT_ROOT);
  const against = args.against ? resolve(args.against) : null;
  // statSync, not lstat: a checkout reached through a symlinked path is a directory to the walk
  // that diffs it, so it must be one to the guard — guard by the consumer's rule, not a proxy.
  if (against && !(existsSync(against) && statSync(against).isDirectory())) {
    console.error(`--against ${against} is not a directory`);
    return 2;
  }

  let summary;
  try {
    summary = build({ root, outDir: args.out ? resolve(args.out) : null, against });
  } catch (err) {
    if (err instanceof BuildError) {
      console.error(`build-hermes-distribution: cannot build — ${err.message}`);
    } else {
      // Anything else is a crash, and a crash is "could not measure" — never a finding.
      console.error(`build-hermes-distribution: unexpected failure — ${err?.stack ?? err}`);
    }
    return 2;
  }

  if (args.json) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    const where = summary.out ? (summary.written ? `written to ${summary.out}` : `NOT written to ${summary.out} (red build)`) : 'built in a temp dir';
    console.log(`hermes distribution ${summary.version}: ${summary.skills} skills (${summary.agents} agents, ${summary.teams} teams in the catalog), ${where}; `
      + `${summary.measured.pathsWalked} paths walked, ${summary.measured.filesScanned} files scanned`
      + (summary.against ? `, diffed against ${summary.against}` : ''));
    for (const f of summary.findings) console.log(`  [${f.gate}] ${f.path}: ${f.detail}`);
    console.log(summary.ok ? 'OK: every gate passed' : `FAIL: ${summary.findings.length} finding(s)`);
  }
  return summary.ok ? 0 : 1;
}

// realpath on both sides: a path-string identity would silently skip main() — and exit 0 —
// when the script is reached through a symlink or a differently spelled path. No try/catch: a
// realpath failure must throw (exit 1, with a stack), never fall through to a silent exit 0.
const invokedAs = process.argv[1] ? realpathSync(process.argv[1]) : null;
if (invokedAs && invokedAs === realpathSync(fileURLToPath(import.meta.url))) {
  process.exitCode = main(process.argv.slice(2));
}
