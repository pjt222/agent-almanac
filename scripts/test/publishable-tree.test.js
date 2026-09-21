/**
 * publishable-tree.test.js — the `prepack` guard that refuses a divergent pack (#876).
 *
 * The property under test is not "git status works". It is that a path npm WOULD pack and the
 * release would NOT contain makes this check refuse. npm packs the working tree under a `files`
 * array — it does not honour `.gitignore` — so an ignored `__pycache__` or an untracked scratch
 * file under `skills/` ships from a local `npm publish` and does not ship from CI, which packs a
 * commit.
 *
 * Every fixture is a real git repository, because the subject is git's own classification.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { rmTree } from './_tmp.js';
import { initRepo, isolateGitEnv } from './_git-fixture.js';
import { shippedPaths, divergentPaths, report } from '../check-publishable-tree.js';

// The subject spawns git with `process.env`, so a developer's own global excludes could
// otherwise decide a verdict here (#874 review, S4).
isolateGitEnv();

function write(dir, files) {
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), content);
  }
}

/** A package whose `files` ships `skills/` and nothing else interesting. */
function pkg(t, extra = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'publishable-'));
  t.after(() => rmTree(dir));
  write(dir, {
    'package.json': JSON.stringify({ name: 'fixture', files: ['skills/', '!skills/_template/'] }),
    '.gitignore': '__pycache__/\n*.log\n',
    'skills/real/SKILL.md': '# real\n',
    'skills/real/references/helper.py': 'print(1)\n',
    ...extra,
  });
  initRepo(dir);
  return dir;
}

test('a clean tree passes, and the negation is not mistaken for a shipped path', async (t) => {
  const dir = pkg(t);

  assert.deepEqual(shippedPaths(dir), { included: ['skills/'], negations: ['skills/_template/'] },
    'both halves are needed: the negation is not a path to scan, and not a path to forget');
  assert.deepEqual(divergentPaths(dir), { ignored: [], untracked: [], modified: [] });
  assert.match(report(divergentPaths(dir))[0], /^OK: /);
});

test('an IGNORED artefact under a shipped directory is refused — the #876 case', async (t) => {
  const dir = pkg(t);
  // Exactly what importing a Python asset leaves behind, which is how #872 and #868 were both
  // produced. `git status` reads clean; `npm pack` ships it.
  write(dir, { 'skills/real/references/__pycache__/helper.cpython-312.pyc': 'x' });

  const found = divergentPaths(dir);

  assert.equal(found.ignored.length, 1, `expected one ignored path, got ${JSON.stringify(found)}`);
  assert.match(found.ignored[0], /__pycache__/);
  assert.deepEqual(found.untracked, []);
  const lines = report(found);
  assert.ok(lines.some((l) => l.startsWith('REFUSED: 1 IGNORED')), lines.join('\n'));
  assert.ok(lines.some((l) => l.includes('does not honour .gitignore')), 'the message must say WHY');
});

test('the reported path is the FILE, not a directory an operator would search in vain', async (t) => {
  // `-uall` is what buys this, and it is asserted rather than assumed — a surviving mutant
  // showed that swapping `--ignored=matching` for plain `--ignored` changed no test, because
  // with `-uall` the two agree. Without `-uall` an untracked file collapses to its directory,
  // which still refuses while naming the wrong thing to delete.
  const dir = pkg(t);
  write(dir, {
    'skills/real/debug.log': 'noise\n',
    'skills/fresh/new.md': 'x\n',
  });

  const found = divergentPaths(dir);

  assert.deepEqual(found.ignored, ['skills/real/debug.log'], 'an ignored file in a tracked directory');
  assert.deepEqual(found.untracked, ['skills/fresh/new.md'], 'the FILE, not `skills/fresh/`');
});

test('an UNTRACKED file under a shipped directory is refused, and named as its own class', async (t) => {
  const dir = pkg(t);
  write(dir, { 'skills/real/scratch.md': 'notes\n' });

  const found = divergentPaths(dir);

  // Same mechanism, different fix — commit it or remove it — so the report names the classes
  // separately rather than reporting a count.
  assert.deepEqual(found.ignored, []);
  assert.deepEqual(found.untracked, ['skills/real/scratch.md']);
  assert.ok(report(found).some((l) => l.startsWith('REFUSED: 1 UNTRACKED')));
});

test('divergence OUTSIDE the shipped paths is ignored — the check is scoped, not a tree gate', async (t) => {
  const dir = pkg(t);
  // `scripts/` is not in `files`, so nothing here reaches a pack. A check that refused this
  // would block every publish from a working checkout and be disabled within a week.
  write(dir, { 'scripts/local-probe.js': '1\n', 'scripts/debug.log': 'noise\n' });

  assert.deepEqual(divergentPaths(dir), { ignored: [], untracked: [], modified: [] });
});

test('a MODIFIED tracked file is refused — npm packs the working bytes, not the committed ones', async (t) => {
  const dir = pkg(t);
  // The OK line used to say "a pack here matches the commit" while this state packed 14 bytes
  // against 7 committed (#879 review, S1). Same divergence as the other two classes, different
  // remedy, so it gets its own list rather than a count.
  writeFileSync(join(dir, 'skills/real/SKILL.md'), '# real, edited after the commit\n');

  const found = divergentPaths(dir);

  assert.deepEqual(found.modified, ['skills/real/SKILL.md']);
  assert.deepEqual(found.ignored, []);
  assert.deepEqual(found.untracked, []);
  assert.ok(report(found).some((l) => l.startsWith('REFUSED: 1 MODIFIED')));
});

test('content under a NEGATED files entry is not refused — npm never packs it', async (t) => {
  const dir = pkg(t);
  // `files` carves `skills/_template/` back out, so nothing under it can reach the tarball.
  // Refusing here would block a publish over a file that cannot ship (#879 review, S2). A
  // pathspec cannot express this — `:(exclude)` does not drop the ignored-directory entry —
  // so the filtering happens on the results.
  write(dir, {
    'skills/_template/scratch.md': 'x\n',
    'skills/_template/__pycache__/a.pyc': 'x',
  });

  assert.deepEqual(divergentPaths(dir), { ignored: [], untracked: [], modified: [] });

  // …and the same shapes OUTSIDE the negation are still refused, so this is a carve-out and
  // not a hole.
  write(dir, { 'skills/real/scratch.md': 'x\n' });
  assert.deepEqual(divergentPaths(dir).untracked, ['skills/real/scratch.md']);
});

test('a git failure THROWS rather than reporting a clean tree', async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'publishable-bare-'));
  t.after(() => rmTree(dir));
  write(dir, { 'package.json': JSON.stringify({ name: 'x', files: ['skills/'] }), 'skills/a.md': 'x' });

  // Not a repository. An empty answer here would read as "nothing would be packed that should
  // not be", which is precisely the publish this check exists to refuse.
  assert.throws(() => divergentPaths(dir), /Refusing to report a clean tree/);
});

test('the report distinguishes both classes at once, and truncates a long list', async (t) => {
  const dir = pkg(t);
  const many = {};
  for (let i = 0; i < 25; i += 1) many[`skills/real/scratch-${i}.md`] = 'x';
  write(dir, { ...many, 'skills/real/__pycache__/a.pyc': 'x' });

  const lines = report(divergentPaths(dir));

  assert.ok(lines.some((l) => l.startsWith('REFUSED: 1 IGNORED')));
  assert.ok(lines.some((l) => l.startsWith('REFUSED: 25 UNTRACKED')));
  assert.ok(lines.some((l) => l.includes('and 5 more')), lines.join('\n'));
});

test('`prepack` is wired, and it is deliberately NOT an install hook', async () => {
  const { readFileSync } = await import('node:fs');
  const { resolve, dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const { INSTALL_HOOKS } = await import('../lib/skills-inventory.js');

  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
  const scripts = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).scripts ?? {};

  assert.equal(scripts.prepack, 'node scripts/check-publishable-tree.js', 'the guard must be wired to prepack');
  // The distinction SECURITY.md's sentence rests on: `prepack` runs in the publisher's tree when
  // packing, never in a consumer's on install. If it ever joined this list, that sentence would
  // become false and `assertInventoryClaims` would throw — which is the behaviour wanted, and is
  // why this asserts the membership rather than trusting the prose.
  assert.ok(!INSTALL_HOOKS.includes('prepack'), 'prepack is not an install-time hook');
  for (const hook of INSTALL_HOOKS) {
    assert.equal(scripts[hook], undefined, `package.json must declare no ${hook} script`);
  }
});

test('the main-module guard fires at a path npm percent-encodes — the #879 fail-open', async (t) => {
  const { execFileSync } = await import('node:child_process');
  const { copyFileSync } = await import('node:fs');
  const { resolve, dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');

  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
  const base = mkdtempSync(join(tmpdir(), 'publishable-url-'));
  t.after(() => rmTree(base));

  // A space is enough: `import.meta.url` percent-encodes it, `process.argv[1]` does not, and a
  // `file://${process.argv[1]}` comparison therefore never matches — the script would exit 0
  // having checked nothing, which is a guard failing OPEN. Measured before the fix: exit 0 with
  // a gitignored `.pyc` staged to ship.
  for (const name of ['plain', 'with space']) {
    const dir = join(base, name);
    mkdirSync(join(dir, 'skills/real/references/__pycache__'), { recursive: true });
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'x', version: '1.0.0', files: ['skills/'] }));
    writeFileSync(join(dir, '.gitignore'), '__pycache__/\n');
    writeFileSync(join(dir, 'skills/real/SKILL.md'), '# real\n');
    writeFileSync(join(dir, 'skills/real/references/__pycache__/contaminant.pyc'), 'x');
    copyFileSync(join(root, 'scripts/check-publishable-tree.js'), join(dir, 'check.mjs'));
    initRepo(dir);

    const run = () => {
      try {
        execFileSync(process.execPath, ['check.mjs'], { cwd: dir, encoding: 'utf8', stdio: 'pipe' });
        return 0;
      } catch (error) {
        return error.status;
      }
    };

    assert.equal(run(), 1, `the guard must refuse at "${name}" — exit 0 there is the fail-open`);
  }
});
