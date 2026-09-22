/**
 * security-surface.test.js — the SECURITY.md content inventory, driven against a FIXTURE tree.
 *
 * #877 is the issue this suite closes, and its subject is not a library. Every extraction out of
 * `generate-readmes.js` — `lib/readme-sections.js` (#566), `lib/skills-inventory.js` (#691),
 * `lib/tree-counts.js` (#874) — was made because that file ran its pipeline and `process.exit`
 * at import time, so nothing living in it could be imported and nothing that cannot be imported
 * can be driven against a fixture. Each extraction left the CALL SITE covered by nothing but
 * review, and what stood in for that coverage was a scan of the generator's source. The #874
 * review measured what the scan was worth:
 *
 *   add `import { readdirSync } from 'node:fs';` as a SECOND import line, revert one call site
 *   to a disk walk, plant a gitignored `scripts/local-probe.js` — the scan passes while the
 *   published count is wrong again. `opendirSync`, `globSync`, `fs/promises` or the same names
 *   through any other specifier all pass it too.
 *
 * So the generator gained a main-module guard and `generateSecuritySurface({ root })`, and this
 * suite calls it with a throwaway git repository whose `scripts/` holds a gitignored `.js`. The
 * assertion is the published NUMBER. A directory walk reintroduced anywhere inside that
 * function counts the ignored file and the number moves, whichever `fs` name it is spelled with
 * and whichever import line brings it in — the property no denylist over the source could have.
 *
 * Measured, not asserted (`tests/results/2026-09-22-generate-readmes-importable/`): the
 * `opendirSync` bypass SURVIVED `npm run test:scripts` at d6b9b9c72 and is KILLED here.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { rmTree } from './_tmp.js';
import { initRepo, commitAll, isolateGitEnv } from './_git-fixture.js';
import { scriptFileCount } from '../lib/tree-counts.js';
import { generateSecuritySurface } from '../generate-readmes.js';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const GENERATOR = join(REPO_ROOT, 'scripts', 'generate-readmes.js');

// See git-files.test.js: the modules under test spawn git with `process.env` (#874 review, S4).
isolateGitEnv();

const BASH_SKILL = '---\nname: alpha\nallowed-tools: Read, Bash, Grep\n---\n\n# Alpha\n';
const QUIET_SKILL = '---\nname: beta\nallowed-tools: Read, Grep\n---\n\n# Beta\n';

const SKILLS_REGISTRY = `total_skills: 2
domains:
  demo:
    skills:
      - id: alpha
      - id: beta
`;

// Four rows, because four ids are named in the generated sentence (`BEYOND_CHECKOUT`) and each
// one is checked against this registry. Two `verify_in_ci: true` and two false, so the
// "N run / M skipped" split is a measurement rather than a tautology.
const TOOLS_REGISTRY = `total_tools: 4
tools:
  - id: wirecap
    path: tools/wirecap.py
    language: python
    status: active
    description: "Capture a request body."
    need: "Capturing the literal request body a session sent."
    invoke: "python3 tools/wirecap.py"
    verify: "python3 tools/wirecap.py --verify"
    verify_in_ci: "true"
  - id: merge-dependabot
    path: tools/merge-dependabot.sh
    language: bash
    status: active
    description: "Merge the Dependabot queue."
    need: "Merging a queue of open Dependabot pull requests."
    invoke: "bash tools/merge-dependabot.sh"
    verify: "bash tools/merge-dependabot.sh --verify"
    verify_in_ci: "false"
    verify_skip_reason: "needs a GitHub token"
  - id: watch-checks
    path: tools/watch-checks.sh
    language: bash
    status: active
    description: "Wait for checks to settle."
    need: "Waiting for the checks on a pull request head to settle."
    invoke: "bash tools/watch-checks.sh"
    verify: "bash tools/watch-checks.sh --verify"
    verify_in_ci: "true"
  - id: merge-pr
    path: tools/merge-pr.sh
    language: bash
    status: active
    description: "Merge a reviewed pull request."
    need: "Merging a pull request whose head and checks are confirmed."
    invoke: "bash tools/merge-pr.sh"
    verify: "bash tools/merge-pr.sh --verify"
    verify_in_ci: "false"
    verify_skip_reason: "would merge a real pull request"
`;

function write(dir, files) {
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), content, 'utf8');
  }
}

/**
 * A tree `generateSecuritySurface` can answer about, and every guard in it can pass.
 *
 * That function carries six throws that exist to catch drift in THIS repository — three named
 * `scripts/` tools, four tool ids, the `files` array against `REPO_ONLY`, the install hooks, the
 * content-tree accounting. A fixture reaches the counts only by satisfying all of them, which is
 * why this is longer than a fixture for a library function: the guards are part of what the call
 * site is, and a fixture that stubbed them out would be testing a different function.
 */
function fixture(t, extra = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'security-surface-'));
  t.after(() => rmTree(dir));
  write(dir, {
    'package.json': `${JSON.stringify({
      name: 'fixture-almanac',
      version: '0.0.1',
      files: ['skills/', '!skills/_template/', 'cli/'],
      // `prepack` is here because production declares one, and without it the fixture takes a
      // branch production does not: `packHookSentence` returns `''` and the rendered paragraph
      // is missing a clause the real one carries (#888 round-1 N9). It is not an INSTALL_HOOK,
      // so `assertInventoryClaims` is untouched by it.
      scripts: { test: 'true', prepack: 'node scripts/check-publishable-tree.js' },
    }, null, 2)}\n`,
    // NOT the rule that hides `local-*` — that one lives in `.git/info/exclude`, written below.
    // See the comment there.
    '.gitignore': '__pycache__/\n',
    'skills/_registry.yml': SKILLS_REGISTRY,
    'skills/alpha/SKILL.md': BASH_SKILL,
    'skills/alpha/references/helper.py': 'print(1)\n',
    'skills/alpha/references/data.json': '{}\n',
    // #871, as the fixture's own trap: importing a skill asset leaves a `__pycache__`, and the
    // committed SECURITY.md went out claiming 19 non-Markdown files where a clean checkout
    // computed 18. Ignored, so it must not reach the content-tree bullet's count.
    'skills/alpha/references/__pycache__/helper.cpython-312.pyc': 'bytecode\n',
    'skills/beta/SKILL.md': QUIET_SKILL,
    // Declares Bash and is NOT a registry entry, exactly as the real one does: a directory walk
    // would report 2 of 3 where the registry says 1 of 2.
    'skills/_template/SKILL.md': BASH_SKILL,
    'cli/index.js': '#!/usr/bin/env node\n',
    'scripts/normalize-i18n-fences.js': '1\n',
    'scripts/mutation-check.js': '1\n',
    'scripts/gate-envelope.js': '1\n',
    'scripts/helper.sh': '1\n',
    'scripts/notes.md': 'not a script\n',
    'scripts/lib/inner.js': 'nested, not counted\n',
    'scripts/local-probe.js': 'gitignored, not part of the artifact\n',
    'workflows/one.mjs': '1\n',
    'workflows/two.mjs': '1\n',
    'workflows/_template.mjs': '1\n',
    // A gitignored file of the SHIPPED SHAPE — `.mjs`, not `_template` — so that a disk walk of
    // `workflows/` publishes 3 where git publishes 2. Without it the Workflows arm cannot fail.
    'workflows/local-draft.mjs': 'a scratch workflow, gitignored\n',
    'tools/_registry.yml': TOOLS_REGISTRY,
    'tools/wirecap.py': '1\n',
    'tools/merge-dependabot.sh': '1\n',
    'tools/watch-checks.sh': '1\n',
    'tools/merge-pr.sh': '1\n',
    ...extra,
  });
  // The ignore rule that matters lives in `.git/info/exclude`, where ONLY git reads it.
  //
  // In `.gitignore` it was a file on disk, and a walk that opens `.gitignore` and glob-matches
  // basenames returns the same numbers as asking git — so the suite could not tell "asks git"
  // from "re-implements git", which is the fourth-glob-implementation class `lib/git-files.js`
  // exists to prevent. Measured in the #888 round-1 review: a hand-rolled matcher at the
  // `scriptFileCount` call site SURVIVED the whole suite. `.git/info/exclude` is honoured by
  // git and by nothing a re-implementation is likely to read, so the two answers separate.
  //
  // It must be written BEFORE the first commit, or `local-probe.js` is tracked and the
  // unmutated suite goes red — correctly, because the enumerator counts tracked files.
  initRepo(dir, { commit: false });
  writeFileSync(join(dir, '.git', 'info', 'exclude'), 'local-*\n', 'utf8');
  commitAll(dir, 'fixture');
  return dir;
}

/** The integer a bullet publishes, refusing rather than returning NaN when the bullet moved. */
function bulletNumber(surface, pattern, label) {
  const match = surface.match(pattern);
  assert.ok(match, `the ${label} bullet did not render in the shape this test reads:\n${surface}`);
  return Number(match[1]);
}

const scriptsCount = (s) => bulletNumber(s, /\*\*Scripts\*\* \(`scripts\/`\): (\d+) top-level/, 'Scripts');
const workflowsCount = (s) => bulletNumber(s, /\*\*Workflows\*\* \(`workflows\/`\): (\d+) executable/, 'Workflows');

test('the Scripts count is git-enumerated at the CALL SITE, not just in the lib', async (t) => {
  const dir = fixture(t);
  const surface = generateSecuritySurface({ root: dir });

  // Four top-level scripts: three .js the function names by hand plus one .sh. `scripts/lib/`
  // is nested and `scripts/notes.md` is not a script; `scripts/local-probe.js` is gitignored.
  assert.equal(scriptsCount(surface), 4, 'a gitignored .js is not part of the artifact SECURITY.md describes');

  // THE bypass, as a number. A walk of `scripts/` — `readdirSync`, `opendirSync`, `globSync`,
  // `fs/promises`, a dynamic import, any of them — sees five entries ending in .js or .sh and
  // publishes 5. The #874 source scan could not see any of those but the first.
  write(dir, { 'scripts/local-second.js': 'also gitignored\n' });
  assert.equal(scriptsCount(generateSecuritySurface({ root: dir })), 4, 'a second ignored script changes no count');

  // And the direction that must not be lost with it: untracked is not ignored.
  write(dir, { 'scripts/brand-new.sh': '1\n' });
  assert.equal(scriptsCount(generateSecuritySurface({ root: dir })), 5, 'untracked is not ignored — it is simply new');
});

test('the Workflows count excludes the template and what git ignores', async (t) => {
  const dir = fixture(t);

  // Three `.mjs` are shipped-shaped on disk — `one`, `two` and the gitignored `local-draft` —
  // and `_template.mjs` is scaffolding. A disk walk publishes 3; git publishes 2.
  assert.equal(workflowsCount(generateSecuritySurface({ root: dir })), 2, '_template.mjs is scaffolding, local-draft.mjs is ignored');

  // And the direction that must not be lost with it.
  write(dir, { 'workflows/three.mjs': '1\n' });
  assert.equal(workflowsCount(generateSecuritySurface({ root: dir })), 3, 'untracked is not ignored — it is simply new');
});

test('the Bash share enumerates the REGISTRY; _template declares Bash and is not a skill', async (t) => {
  const dir = fixture(t);
  const surface = generateSecuritySurface({ root: dir });

  // A directory walk finds three SKILL.md, two of which declare Bash: it would publish 2 of 3
  // (~67%). The registry carries two ids, one of which declares Bash.
  assert.match(surface, /1 of 2 skills \(~50%\) declare `Bash`/);
});

test('the tools bullet derives its count, its languages, its CI split and its four ids', async (t) => {
  const dir = fixture(t);
  const surface = generateSecuritySurface({ root: dir });

  assert.match(surface, /\*\*Tools\*\* \(`tools\/`\): 4 operator utilities \(3 shell, 1 Python\)/);
  assert.match(surface, /2 run in the non-required `tools-verify` job, 2 skipped there/);
  assert.match(surface, /4 act beyond this checkout/);
  for (const name of ['wirecap.py', 'merge-dependabot.sh', 'watch-checks.sh', 'merge-pr.sh']) {
    assert.ok(surface.includes(`\`${name}\``), `the beyond-checkout list dropped ${name}`);
  }
});

test('the content-tree bullet names its non-documentation files and its executable one', async (t) => {
  const dir = fixture(t);
  const surface = generateSecuritySurface({ root: dir });

  assert.match(surface, /\*\*Skills\*\*: mostly Markdown and YAML, plus \*\*2 files that are not\*\* \(\.json, \.py\)/);
  // Two, not three: `references/__pycache__/…​.pyc` is ignored, and #871 is what happens when it
  // is not — a committed SECURITY.md claiming 19 non-Markdown files where a clean checkout
  // computed 18, with a `.py` in the executable list under a paragraph asserting "All of it ships".
  assert.ok(!surface.includes('.pyc'), 'an ignored bytecode file must not reach the inventory');
  // The `prepack` clause, which the fixture declares because production does.
  assert.match(surface, /It does declare `prepack`, which runs in the PUBLISHER's tree/);
  assert.ok(
    surface.includes('`skills/alpha/references/helper.py`'),
    'the executable exemplar is derived from the tree, and this one is in it',
  );
  // `skills/_template/` is negated in `files`, so its .md and the Bash it declares are outside
  // the shipped set entirely — the same exclusion the count above relies on.
  assert.ok(!surface.includes('_template'), 'a negated path must not be named as shipped content');
});

test('a guard that exists to catch drift in this repository fires on a fixture too', async (t) => {
  // The six throws are part of the call site. If a fixture could reach the counts without them,
  // this suite would be covering a function the generator does not call.
  const dir = fixture(t);
  unlinkSync(join(dir, 'scripts', 'mutation-check.js'));

  assert.throws(
    () => generateSecuritySurface({ root: dir }),
    /SECURITY.md names scripts\/mutation-check\.js, which does not exist/,
  );
});

test('LIVE: the default root is still this repository', () => {
  // The fixtures above could agree with each other and with a broken function. This one checks
  // the no-argument call — the shape `applySections` makes, which passes no arguments at all —
  // still answers about the tree the generator writes SECURITY.md from.
  const surface = generateSecuritySurface();
  assert.equal(
    scriptsCount(surface),
    scriptFileCount(REPO_ROOT),
    'the default root must be the repository, or the pipeline and this suite disagree',
  );
  assert.ok(scriptsCount(surface) > 10, 'and the repository has more than ten top-level scripts');
});

test('importing the generator runs no pipeline, reads no argv and exits nothing', async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'security-surface-import-'));
  t.after(() => rmTree(dir));
  const href = pathToFileURL(GENERATOR).href;

  // Two shapes, because they exercise different halves of the guard. `node -e` leaves
  // `process.argv[1]` undefined; an importer FILE gives it a real path that is not this module.
  writeFileSync(join(dir, 'importer.mjs'), `import ${JSON.stringify(href)};\n`, 'utf8');

  for (const [label, args] of [
    ['node -e', ['--input-type=module', '-e', `await import(${JSON.stringify(href)});`]],
    ['importer file', [join(dir, 'importer.mjs')]],
  ]) {
    const result = spawnSync(process.execPath, args, { encoding: 'utf8', cwd: REPO_ROOT });
    assert.equal(result.status, 0, `${label}: importing exited ${result.status}\n${result.stderr}`);
    assert.equal(result.stdout, '', `${label}: importing printed output, so it ran the pipeline`);
  }

  // THE CONTROL. Without it, a guard that never fires would pass both arms above and this suite
  // would be reporting that a broken generator is well behaved.
  const direct = spawnSync(process.execPath, [GENERATOR, '--list-outputs'], { encoding: 'utf8', cwd: REPO_ROOT });
  assert.equal(direct.status, 0, `--list-outputs exited ${direct.status}\n${direct.stderr}`);
  assert.ok(
    direct.stdout.trim().split('\n').includes('SECURITY.md'),
    `running the file directly must still produce the managed list, got:\n${direct.stdout}`,
  );
});
