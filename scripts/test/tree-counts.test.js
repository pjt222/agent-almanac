/**
 * tree-counts.test.js — the three counts `generate-readmes.js` publishes, tested by NUMBER.
 *
 * This suite exists because of a measured failure of its predecessor. The generator runs its
 * pipeline and `process.exit` at import time, so nothing inside it can be imported; what stood in
 * for a test was a scan of the generator's source asserting that `readdirSync` was absent from
 * one import's braces and that three `topLevelEntries(...)` call shapes appeared. The #874 review
 * broke it in both directions:
 *
 *   - **green with the defect back**: add `import { readdirSync } from 'node:fs';` as a SECOND
 *     import line, revert one call site, plant a gitignored `scripts/local-probe.js` — the scan
 *     passed while the published count was wrong again, and `check-readmes` cannot see it because
 *     it compares against a clean CI tree where a disk walk and a git listing agree.
 *   - **red on a harmless refactor**: change the specifier to `'node:fs'`, the form every other
 *     file in that change uses, and it failed with the fix intact.
 *
 * So the counts moved to `lib/tree-counts.js`, where a fixture can reach them, and the assertion
 * is the number itself. The source scan survives at the bottom as a tripwire, explicitly not the
 * coverage claim.
 *
 * #877 closed the other half: the generator's CALL SITE. `generateSecuritySurface({ root })` is
 * driven against a git fixture by `security-surface.test.js`, so the two counts this suite
 * covers as a library are now covered as a call too, and the tripwire below has shrunk to what
 * nothing else reaches.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rmTree } from './_tmp.js';
import { initRepo, isolateGitEnv } from './_git-fixture.js';
import { scriptFileCount, workflowFileCount, localeTranslationCounts } from '../lib/tree-counts.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

// See git-files.test.js: the modules under test spawn git with `process.env` (#874 review, S4).
isolateGitEnv();

function write(dir, files) {
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), content);
  }
}

function repo(t, files) {
  const dir = mkdtempSync(join(tmpdir(), 'tree-counts-'));
  t.after(() => rmTree(dir));
  write(dir, files);
  initRepo(dir);
  return dir;
}

test('scriptFileCount ignores what git ignores, counts what is merely untracked, stays non-recursive', async (t) => {
  const dir = repo(t, {
    '.gitignore': 'local-*.js\n__pycache__/\n',
    'scripts/real.js': '1\n',
    'scripts/real.sh': '1\n',
    'scripts/real.mjs': '1\n',
    'scripts/notes.md': 'not a script\n',
    'scripts/lib/inner.js': 'nested, not counted\n',
  });

  assert.equal(scriptFileCount(dir), 3, 'three top-level scripts, and lib/inner.js is not one of them');

  // The #872 defect, as a number: a gitignored .js beside the real ones.
  write(dir, { 'scripts/local-probe.js': '1\n' });
  assert.equal(scriptFileCount(dir), 3, 'a gitignored .js is not part of the artifact SECURITY.md describes');

  // And the direction that must NOT be lost: an untracked, non-ignored script still counts.
  write(dir, { 'scripts/brand-new.sh': '1\n' });
  assert.equal(scriptFileCount(dir), 4, 'untracked is not ignored — it is simply new');
});

test('workflowFileCount excludes the template by PREDICATE, not by an underscore', async (t) => {
  const dir = repo(t, {
    '.gitignore': 'scratch-*.mjs\n',
    'workflows/one.mjs': '1\n',
    'workflows/two.mjs': '1\n',
    'workflows/_template.mjs': '1\n',
    'workflows/README.md': '1\n',
  });

  assert.equal(workflowFileCount(dir), 2, '_template.mjs is scaffolding and README.md is not a workflow');

  write(dir, { 'workflows/scratch-draft.mjs': '1\n' });
  assert.equal(workflowFileCount(dir), 2, 'a gitignored .mjs is not a shipped-shaped workflow');
});

test('localeTranslationCounts: a skill is a DIRECTORY with SKILL.md, everything else a flat .md', async (t) => {
  const dir = repo(t, {
    '.gitignore': '__pycache__/\n*.bak\n',
    'i18n/de/skills/alpha/SKILL.md': '1\n',
    'i18n/de/skills/beta/SKILL.md': '1\n',
    'i18n/de/skills/not-a-skill/README.md': 'no SKILL.md here\n',
    'i18n/de/agents/one.md': '1\n',
    'i18n/de/agents/two.md': '1\n',
    'i18n/de/teams/team.md': '1\n',
  });

  const before = localeTranslationCounts(dir, 'i18n/de', ['skills', 'agents', 'teams', 'guides']);
  assert.deepEqual(before.counts, { skills: 2, agents: 2, teams: 1, guides: 0 });
  assert.equal(before.total, 5, 'an absent guides/ contributes zero rather than throwing');

  // A gitignored artefact under a locale tree must not inflate a published table.
  write(dir, {
    'i18n/de/skills/__pycache__/x.pyc': 'x',
    'i18n/de/agents/one.md.bak': 'editor leftover\n',
  });
  const after = localeTranslationCounts(dir, 'i18n/de', ['skills', 'agents', 'teams', 'guides']);
  assert.deepEqual(after.counts, before.counts, 'ignored paths change no count');
});

test('LIVE: the real tree still produces the numbers SECURITY.md publishes', () => {
  // The fixtures above could all agree with each other and with a broken rule. This one runs the
  // same functions against the repository and checks they are answering about something.
  const scripts = scriptFileCount(ROOT);
  const workflows = workflowFileCount(ROOT);
  assert.ok(scripts > 10, `scripts/ should hold more than ten top-level scripts, got ${scripts}`);
  assert.ok(workflows >= 1, `workflows/ should hold at least one non-template workflow, got ${workflows}`);

  // NO assertion against SECURITY.md here, deliberately, and the history is the argument.
  // The first form was vacuous — `includes(`${scripts} `)` matches any digit run followed by a
  // space in any version of that document. The correction pinned the published sentence, and
  // that over-corrected into a freshness gate inside `scripts-test`, a REQUIRED context: any PR
  // adding a top-level script would go red for not having regenerated SECURITY.md (#874 review,
  // S2). `validate-readmes.yml` refuses exactly that trade in its own comment — "a contract
  // change wearing a bug fix's clothes" — and `check-readmes` already owns the question in a job
  // that is not required. The bounds above are the non-vacuous part: `return 0` kills them.
});

test('TRIPWIRE (not the coverage claim): what no fixture yet drives in the generator', () => {
  // Still a denylist, still explicitly NOT the coverage claim, and now scoped to what is left
  // uncovered. Since #877, `scriptFileCount` and `workflowFileCount` are called from
  // `generateSecuritySurface({ root })`, which `security-surface.test.js` drives against a git
  // fixture carrying a gitignored `scripts/local-probe.js` — a walk there moves a number that
  // suite asserts, whichever `fs` name spells it. That is the coverage claim; the two call-shape
  // assertions this test used to make for those two counts are gone with it. They were the
  // "red on a harmless refactor" half the #874 review measured: renaming the parameter reddened
  // them with the fix intact, which is what a denylist does when the thing it pins is a spelling.
  //
  // `localeTranslationCounts` keeps its call-shape assertion because nothing else covers it:
  // `generateTranslationsSection` reads module-level registry totals, so no fixture reaches it.
  // When that call site becomes injectable, this line goes the way of the other two.
  const source = readFileSync(join(ROOT, 'scripts/generate-readmes.js'), 'utf8');
  assert.ok(!/\breaddirSync\b/.test(source), 'generate-readmes.js must not walk a directory itself (#872)');
  assert.ok(!/\bstatSync\b/.test(source), 'generate-readmes.js must not stat entries itself (#872)');
  assert.match(source, /localeTranslationCounts\(ROOT,/);
});
