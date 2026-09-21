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
  assert.deepEqual(divergentPaths(dir), { ignored: [], untracked: [], modified: [], codes: {} });
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

  assert.deepEqual(divergentPaths(dir), { ignored: [], untracked: [], modified: [], codes: {} });
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

  assert.deepEqual(divergentPaths(dir), { ignored: [], untracked: [], modified: [], codes: {} });

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
  const { copyFileSync, cpSync } = await import('node:fs');
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
    // `scripts/`, not the fixture root: the module resolves ROOT as its own parent directory, so
    // a script at `<fixture>/check.mjs` makes ROOT the fixture's PARENT, which has no
    // package.json — `readFileSync` throws ENOENT and the process exits 1 having checked
    // nothing. Both arms then "pass" on a crash, and the plain arm passes with the OLD guard
    // too (#879 round 2, S2). The assertion on stderr is what makes the exit code mean refusal.
    mkdirSync(join(dir, 'scripts'), { recursive: true });
    cpSync(join(root, 'scripts/lib'), join(dir, 'scripts/lib'), { recursive: true });
    copyFileSync(join(root, 'scripts/check-publishable-tree.js'), join(dir, 'scripts/check.mjs'));
    initRepo(dir);

    const run = () => {
      try {
        const stdout = execFileSync(process.execPath, ['scripts/check.mjs'], { cwd: dir, encoding: 'utf8', stdio: 'pipe' });
        return { status: 0, stdout, stderr: '' };
      } catch (error) {
        return { status: error.status, stdout: String(error.stdout ?? ''), stderr: String(error.stderr ?? '') };
      }
    };

    const result = run();
    assert.equal(result.status, 1, `the guard must refuse at "${name}" — exit 0 there is the fail-open`);
    assert.match(result.stderr, /REFUSED: 1 IGNORED/,
      `exit 1 must be a refusal at "${name}", not a crash: ${result.stderr.slice(0, 200)}`);

    // The arm a crash can never produce: remove the contaminant and the same invocation must
    // exit 0 with the OK line on stdout. Without it, "exit 1" is the only thing observed and a
    // broken script satisfies the whole test.
    rmTree(join(dir, 'skills/real/references/__pycache__'));
    const clean = run();
    assert.equal(clean.status, 0, `a clean tree must pass at "${name}": ${clean.stderr.slice(0, 200)}`);
    assert.match(clean.stdout, /^OK: /);
  }
});

test('a negation without a trailing slash is an EXACT path, not a prefix', async (t) => {
  // npm's negations are root-anchored and this module models them the way
  // `skills-inventory.js` does: trailing slash means prefix, otherwise exact. A mutant that
  // made every pattern a prefix survived the suite, which means nothing distinguished the two
  // (#879 review, follow-up). Prefix-matching a file negation would carve out every sibling
  // whose name merely STARTS with it, and those do pack.
  const dir = mkdtempSync(join(tmpdir(), 'publishable-neg-'));
  t.after(() => rmTree(dir));
  write(dir, {
    'package.json': JSON.stringify({ name: 'fixture', files: ['skills/', '!skills/real/SKILL.md'] }),
    '.gitignore': '__pycache__/\n',
    'skills/real/SKILL.md': '# real\n',
  });
  initRepo(dir);
  // Shares the negated path as a prefix, and npm packs it.
  write(dir, { 'skills/real/SKILL.md.bak': 'x\n' });

  assert.deepEqual(divergentPaths(dir).untracked, ['skills/real/SKILL.md.bak'],
    'a `.bak` beside an exactly-negated file still ships, so it must still be refused');
});

test('an absent `files` array REFUSES — it is the configuration where only this check can see', async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'publishable-nofiles-'));
  t.after(() => rmTree(dir));
  write(dir, {
    'package.json': JSON.stringify({ name: 'fixture', version: '1.0.0' }),
    '.gitignore': '__pycache__/\n',
    'skills/real/SKILL.md': '# real\n',
  });
  initRepo(dir);
  write(dir, { 'skills/real/scratch.md': 'x\n' });

  // Measured in the #879 review (N7): with no `files` array npm honours the root .gitignore for
  // the IGNORED class but still packs UNTRACKED files — three of them, while this check returned
  // "OK … a pack here matches the commit". An empty inclusion list must not read as a clean tree.
  assert.throws(() => divergentPaths(dir), /declares no .files. array/);
});

test('npm’s own default excludes are not reported as "would be packed"', async (t) => {
  const dir = pkg(t);
  // Measured: with these present, `npm pack --dry-run --json` does not list them, so refusing
  // them is a false statement that blocks a publish over a Finder dropping (#879 review, N2).
  write(dir, {
    'skills/real/.DS_Store': 'x',
    'skills/real/.npmrc': 'x',
    'skills/real/notes.orig': 'x',
    // Nine further names the #879 re-grade measured refused-but-never-packed.
    'skills/real/.npmignore': 'x',
    'skills/real/._resourcefork': 'x',
    'skills/real/.SKILL.md.swp': 'x',
    'skills/real/npm-debug.log': 'x',
    'skills/real/.lock-wscript': 'x',
    'skills/real/.wafpickle-7': 'x',
    'skills/real/CVS/Root': 'x',
    'skills/real/.svn/entries': 'x',
    'skills/real/.hg/store': 'x',
  });

  assert.deepEqual(divergentPaths(dir), { ignored: [], untracked: [], modified: [], codes: {} });

  // …but the things npm DOES pack must still refuse. Measured packed, so correctly refused:
  // a nested lockfile, and a nested node_modules.
  write(dir, { 'skills/real/package-lock.json': '{}\n' });
  assert.deepEqual(divergentPaths(dir).untracked, ['skills/real/package-lock.json'],
    'a nested lockfile IS packed, so it is not a default exclude');

  // …and a nested node_modules under a shipped directory IS packed, so it must still refuse —
  // the same review measured `skills/real/node_modules/dep/index.js` in the listing, which is
  // why that name is deliberately NOT in the default-excludes set.
  write(dir, { 'skills/real/node_modules/dep/index.js': 'x' });
  assert.deepEqual(divergentPaths(dir).untracked, [
    'skills/real/node_modules/dep/index.js',
    'skills/real/package-lock.json',
  ]);
});

test('a path carrying a space or a non-ASCII byte is reported unquoted', async (t) => {
  const dir = pkg(t);
  // Porcelain quotes both, and the quoting reached the report verbatim before `-z`
  // (#879 review, N5): `"skills/real/umlaut-\303\244.md"`.
  write(dir, { 'skills/real/has space.md': 'x\n', 'skills/real/umlaut-ä.md': 'x\n' });

  assert.deepEqual(divergentPaths(dir).untracked,
    ['skills/real/has space.md', 'skills/real/umlaut-ä.md']);
});

test('a rename OUT of a negated directory refuses the new file', async (t) => {
  const dir = pkg(t);
  const { execFileSync } = await import('node:child_process');
  const run = (...args) => execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8' });

  // Reachable with this repository's OWN files array: `!skills/_template/` is a directory
  // negation, so seeding a skill from the template is a rename whose old side is carved out.
  // Tested against the old side, the whole record disappears and the new file ships unrefused
  // (#879 round 2, B1).
  run('mv', 'skills/real/SKILL.md', 'skills/real/renamed.md');

  const found = divergentPaths(dir);

  const all = [...found.ignored, ...found.untracked, ...found.modified];
  assert.ok(all.includes('skills/real/renamed.md'), `the new path must be reported, got ${JSON.stringify(found)}`);
});

test('the module can be IMPORTED where there is no script path', async () => {
  const { execFileSync } = await import('node:child_process');
  const { resolve, dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

  // `pathToFileURL(undefined)` THROWS rather than returning a non-match, so a main-module guard
  // without the `process.argv[1] &&` half turns an importable module into one that crashes on
  // import from `node -e`, a REPL or a loader. A commit here typed exactly that variant.
  const out = execFileSync(process.execPath, [
    '--input-type=module', '-e',
    `import { report } from ${JSON.stringify(`${root}/scripts/check-publishable-tree.js`)};`
    + 'console.log(report({ ignored: [], untracked: [], modified: [], codes: {} })[0]);',
  ], { encoding: 'utf8' });

  assert.match(out, /^OK: /);
});

test('the pack-hook sentence is DERIVED — a manifest without the hook yields nothing', async () => {
  const { packHookSentence } = await import('../lib/skills-inventory.js');

  // The point of extracting it. Its previous guard was `check-readmes`, a SNAPSHOT gate, and a
  // snapshot cannot tell a derivation from a literal rendering the same bytes: reverting the
  // derivation to a hardcoded `['prepack']` regenerated SECURITY.md byte-identically and the
  // mutant SURVIVED (#879 round 2, S3). Here the absent-hook manifest is an argument.
  assert.equal(packHookSentence({ scripts: {} }), '');
  assert.equal(packHookSentence({}), '');
  assert.equal(packHookSentence(undefined), '');
  assert.match(packHookSentence({ scripts: { prepack: 'node x.js' } }), /It does declare `prepack`/);

  // `postpack` alone is NOT described as refusing a pack — a cleanup step does not refuse
  // anything, and the sentence would be false of it (N9).
  assert.equal(packHookSentence({ scripts: { postpack: 'node x.js' } }), '');
});

test('assertInterpretable refuses the two `files` shapes npm and this matcher disagree about', async () => {
  const { shippedEntries } = await import('../lib/skills-inventory.js');
  const dir = mkdtempSync(join(tmpdir(), 'publishable-files-'));
  const manifest = (files) => {
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'x', files }));
    return () => shippedEntries(dir);
  };

  // Measured: npm ignores a DIRECTORY negation placed before the inclusion it carves from and
  // packs the whole directory, while this matcher goes on excluding it — the silent direction.
  assert.throws(manifest(['!skills/_template/', 'skills/']), /DIRECTORY negation placed before/);
  // Measured: npm packs a path re-included under a negated directory; this matcher carves it out.
  assert.throws(manifest(['skills/', '!skills/_template/', 'skills/_template/SKILL.md']), /re-includes a path under a negated directory/);

  // The real shape, and a FILE negation before its inclusion — measured honoured by npm, so
  // refusing it would refuse a correct array.
  assert.deepEqual(manifest(['skills/', '!skills/_template/'])(), { included: ['skills/'], negations: ['skills/_template/'] });
  assert.deepEqual(manifest(['!agents/_template.md', 'agents/'])(), { included: ['agents/'], negations: ['agents/_template.md'] });
});

test('a rename WITHIN a shipped directory reports both sides — what --no-renames buys', async (t) => {
  const dir = pkg(t);
  const { execFileSync } = await import('node:child_process');
  execFileSync('git', ['-C', dir, 'mv', 'skills/real/SKILL.md', 'skills/real/renamed.md'], { encoding: 'utf8' });

  const found = divergentPaths(dir);

  // With rename detection ON, git emits ONE record carrying only the new path, so the pack's
  // loss of the old file goes unreported. `--no-renames` emits `D old` + `A new`, and both are
  // real divergences: the pack lacks a file the commit has, and gains one it does not.
  assert.deepEqual(found.modified, ['skills/real/SKILL.md', 'skills/real/renamed.md']);
});

test('the remedy matches what git reported — a deletion is not "packed with its working bytes"', async (t) => {
  const dir = pkg(t);
  const { execFileSync } = await import('node:child_process');
  const git = (...args) => execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8' });

  writeFileSync(join(dir, 'skills/real/SKILL.md'), '# edited after the commit\n');
  git('rm', '-q', 'skills/real/references/helper.py');

  const found = divergentPaths(dir);
  const lines = report(found).join('\n');

  // The pack LACKS helper.py; it does not carry it with working-tree bytes. Stamping ` M` on it
  // and telling the reader to "commit or revert" described the wrong failure (#879 round 2, S5).
  assert.match(lines, /REFUSED: 1 ABSENT-OR-RETYPED path\(s\).*the pack LACKS a file the commit has/s);
  assert.match(lines, /REFUSED: 1 MODIFIED path\(s\).*WORKING-TREE bytes/s);
  assert.match(lines, /D {2}skills\/real\/references\/helper\.py/);
  assert.equal(found.codes['skills/real/SKILL.md'], ' M');
});

test('a rename INTO a negated directory reports the file the pack now LACKS', async (t) => {
  const dir = pkg(t);
  const { execFileSync } = await import('node:child_process');
  const git = (...args) => execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8' });

  write(dir, { 'skills/real/a.md': '# a\n', 'skills/_template/SKILL.md': '# tpl\n' });
  git('add', '-A');
  git('commit', '-qm', 'a file that will be moved out of the shipped set');
  git('mv', 'skills/real/a.md', 'skills/_template/a.md');

  // The direction that produces a WRONG ANSWER rather than a weaker one. Under `-z` alone git
  // emits `R  skills/_template/a.md\0skills/real/a.md\0`: the new path is carved out by the
  // negation, the origin record is dropped by the parser, and the guard reports OK while the
  // pack no longer carries a file the commit has. `--no-renames` splits it into `A ` + `D `, and
  // the `D ` side is a real divergence under a shipped path (#879 re-grade, SF1).
  const found = divergentPaths(dir);

  assert.deepEqual(found.modified, ['skills/real/a.md']);
  assert.equal(found.codes['skills/real/a.md'], 'D ');
  assert.match(report(found).join('\n'), /ABSENT-OR-RETYPED[\s\S]*the pack LACKS a file the commit has/);
});
