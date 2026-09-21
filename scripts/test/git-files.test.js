/**
 * git-files.test.js — the git-backed enumerator, and proof that all three call sites use it
 * (#872 / #868 / #830).
 *
 * The component and the wiring are tested separately on purpose. One helper that asks git is
 * worth nothing if a consumer still walks disk, and "I extracted a helper" is exactly the claim
 * that reads as done while two of three call sites are unchanged (`CLAUDE.md` § Proving a Gate
 * Can Fail — prove the wiring, not the component).
 *
 * Every fixture is a REAL git repository, because the behaviour under test is git's own ignore
 * rule. A fixture that is merely a directory would take the disk fallback and assert nothing
 * about the thing that was fixed — the vacuous-arm failure mode this repository keeps finding in
 * its own review rounds.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, unlinkSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { rmTree } from './_tmp.js';
import { listNonIgnored, topLevelEntries, insideWorkTree } from '../lib/git-files.js';
import { checkParity } from '../lib/tools-registry.js';
import { nonDocumentationFiles } from '../lib/skills-inventory.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * An environment git cannot escape, copied from `continue-here-blocks.test.js` and load-bearing
 * for the same reason: neither `cwd` nor `-C` is isolation, because git honours an absolute
 * `GIT_DIR` over both. A suite that runs `git init` without this writes its fixture into the
 * caller's repository, silently, at exit 0. Every `GIT_*` key is dropped rather than a denylist
 * of the ones anyone thought of, and `HOME`/`XDG_CONFIG_HOME` move because
 * `$XDG_CONFIG_HOME/git/ignore` is reached through no variable at all.
 */
function cleanEnv(home) {
  const env = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith('GIT_')) env[key] = value;
  }
  env.HOME = home;
  env.XDG_CONFIG_HOME = join(home, '.config');
  env.GIT_CONFIG_NOSYSTEM = '1';
  return env;
}

/** A throwaway git repository. `files` maps repo-relative paths to contents; all are committed. */
function repo(t, files) {
  const dir = mkdtempSync(join(tmpdir(), 'git-files-'));
  t.after(() => rmTree(dir));
  const git = (...args) => {
    const r = spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8', env: cleanEnv(dir) });
    assert.equal(r.status, 0, `git ${args.join(' ')} failed: ${r.stderr}`);
    return r.stdout;
  };
  git('init', '-q', '-b', 'main', '.');
  git('config', 'user.email', 'test@example.invalid');
  git('config', 'user.name', 'Fixture');
  write(dir, files);
  git('add', '-A');
  git('commit', '-qm', 'fixture');
  return { dir, git };
}

function write(dir, files) {
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), content);
  }
}

// ── the component ─────────────────────────────────────────────────────────────────────────────

test('the accept rule is git ignore and nothing else: ignored out, untracked IN', async (t) => {
  const { dir } = repo(t, {
    '.gitignore': '__pycache__/\n*.log\n',
    'tools/kept.py': 'print(1)\n',
  });
  // The #868 / #872 artefact: written by importing a Python file rather than running it.
  write(dir, {
    'tools/__pycache__/kept.cpython-312.pyc': 'x',
    'tools/debug.log': 'noise\n',
    // Untracked and NOT ignored. #830's acceptance criteria refuse a fix that loses this: the
    // tools gate exists to catch a new tool file whose registry row is missing, and such a file
    // is untracked at the moment its author runs the gate. `--cached` alone would drop it.
    'tools/brand-new.sh': '#!/usr/bin/env bash\n',
  });

  const { paths, missing, source } = listNonIgnored(dir, 'tools');

  assert.equal(source, 'git', 'a real repository must take the git path, or this test asserts nothing');
  assert.deepEqual(paths, ['tools/brand-new.sh', 'tools/kept.py']);
  assert.deepEqual(missing, []);
});

test('an index entry that is not in the working tree lands in `missing`, never in `paths`', async (t) => {
  const { dir } = repo(t, { 'tools/gone.sh': 'x\n', 'tools/here.sh': 'y\n' });
  unlinkSync(join(dir, 'tools/gone.sh'));

  const { paths, missing } = listNonIgnored(dir, 'tools');

  // Merging the two would break one consumer or the other in the quiet direction: `checkParity`
  // must still report a row whose file was deleted locally, and a consumer that READS each file
  // cannot read one that is absent.
  assert.deepEqual(paths, ['tools/here.sh']);
  assert.deepEqual(missing, ['tools/gone.sh']);
});

test('a BROKEN symlink is present, not missing — `lstat`, not `exists`', async (t) => {
  const { dir, git } = repo(t, { 'tools/real.sh': 'x\n' });
  symlinkSync('nowhere.sh', join(dir, 'tools/dangling.sh'));
  git('add', '-A');
  git('commit', '-qm', 'dangling');

  const { paths, missing } = listNonIgnored(dir, 'tools');

  // `existsSync` follows the link and would sort this into `missing`, taking it away from
  // `checkParity`'s third arm — the one written to report exactly this entry.
  assert.deepEqual(paths, ['tools/dangling.sh', 'tools/real.sh']);
  assert.deepEqual(missing, []);
});

test('topLevelEntries: a directory with no listed path is reported unless git ignores it', async (t) => {
  const { dir } = repo(t, { '.gitignore': '__pycache__/\n', 'tools/flat.sh': 'x\n' });
  mkdirSync(join(dir, 'tools/empty'));
  write(dir, {
    'tools/nested/deep.sh': 'x\n',
    'tools/__pycache__/thing.pyc': 'x',
  });

  const { files, dirs, source } = topLevelEntries(dir, 'tools');

  assert.equal(source, 'git');
  assert.deepEqual(files, ['flat.sh']);
  // `empty` has no path git could list; `nested` is derived from its content; `__pycache__` is
  // ignored and must stay out — the defect this whole change exists to fix.
  assert.deepEqual(dirs, ['empty', 'nested']);
});

test('outside a checkout the disk walk answers, and SAYS so', async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'git-files-bare-'));
  t.after(() => rmTree(dir));
  write(dir, { 'tools/a.sh': 'x\n', 'tools/sub/b.sh': 'y\n' });

  assert.equal(insideWorkTree(dir), false, '/tmp must not be inside a repository, or this arm is vacuous');
  const { paths, source } = listNonIgnored(dir, 'tools');

  // The npm-shipped package has no `.git`, and `skills-inventory.js` is reachable from it, so
  // "no repository" is an answer rather than a fault.
  assert.equal(source, 'disk');
  assert.deepEqual(paths, ['tools/a.sh', 'tools/sub/b.sh']);
  assert.deepEqual(listNonIgnored(dir, 'absent').paths, [], 'a missing directory yields no paths');
});

// ── the wiring: one call site per test ────────────────────────────────────────────────────────

test('WIRING check-tools-registry: an ignored artefact is invisible, a real defect still fires', async (t) => {
  const row = {
    id: 'kept', path: 'tools/kept.py', language: 'python', status: 'active',
    description: 'd', need: 'Doing a thing.', invoke: 'i', verify: 'v', verify_in_ci: 'true',
  };
  const { dir } = repo(t, { '.gitignore': '__pycache__/\n', 'tools/kept.py': 'print(1)\n' });
  write(dir, { 'tools/__pycache__/kept.cpython-312.pyc': 'x' });

  const clean = checkParity(dir, [row]);
  assert.deepEqual(clean.notPlainFile, [], 'a gitignored __pycache__ must not red a REQUIRED context (#868/#830)');
  assert.deepEqual(clean.fileWithoutRow, []);
  assert.deepEqual(clean.rowWithoutFile, []);

  // Both directions, because skipping ignored paths must never become skipping everything.
  write(dir, { 'tools/sub/nested.sh': 'x\n', 'tools/stray.sh': 'x\n' });
  const dirty = checkParity(dir, [row]);
  assert.deepEqual(dirty.notPlainFile, ['tools/sub'], 'a non-ignored subdirectory is still representable by no row');
  assert.deepEqual(dirty.fileWithoutRow, ['tools/stray.sh'], 'an untracked new tool with no row is still a defect');
});

test('WIRING skills-inventory: the SECURITY.md inventory counts the artifact, not the working directory', async (t) => {
  const { dir } = repo(t, {
    '.gitignore': '__pycache__/\n',
    'package.json': JSON.stringify({ name: 'fixture', files: ['skills/', '!skills/_template/'] }),
    'skills/real/SKILL.md': '# real\n',
    'skills/real/references/helper.py': 'print(1)\n',
    'skills/_template/scaffold.py': 'print(2)\n',
  });
  write(dir, {
    'skills/real/references/__pycache__/helper.cpython-312.pyc': 'x',
    'skills/real/references/__pycache__/evil.py': '#!/usr/bin/env python3\n',
    'skills/real/references/fresh.py': 'print(3)\n',
  });

  const found = nonDocumentationFiles(dir, ['skills']);

  // The #872 defect in both of its forms: the `.pyc` inflated the published COUNT, and the `.py`
  // would have been NAMED in the executable-scripts sentence as a shipped script.
  assert.deepEqual(found, ['skills/real/references/fresh.py', 'skills/real/references/helper.py']);
  assert.ok(!found.some((p) => p.includes('__pycache__')), 'a gitignored file does not ship and must not be inventoried');
  // The npm-ships predicate is a SEPARATE rule and must survive the change of enumerator: the
  // recursive walk tested each directory before descending, so a flat listing has to test the
  // ancestor prefixes or `!skills/_template/` silently stops excluding anything.
  assert.ok(!found.some((p) => p.startsWith('skills/_template/')), 'the package negation still prunes the directory');
});

test('WIRING generate-readmes: it enumerates through git at every site and cannot walk disk', () => {
  const source = readFileSync(join(ROOT, 'scripts/generate-readmes.js'), 'utf8');

  // The generator runs its whole pipeline plus `process.exit` at import time, so nothing can
  // import it and call one of these functions. The honest wiring assertion available is over the
  // source: a call site reverted to a disk walk needs the import back, and this goes red.
  const fsImport = source.match(/import \{([^}]*)\} from 'fs';/);
  assert.ok(fsImport, 'the fs import must still be findable, or this test is asserting nothing');
  assert.ok(!/\breaddirSync\b/.test(fsImport[1]), 'generate-readmes.js must not import readdirSync (#872)');
  assert.ok(!/\bstatSync\b/.test(fsImport[1]), 'generate-readmes.js must not import statSync (#872)');

  // One assertion per enumeration site, so a single reverted site is one failing test.
  assert.match(source, /topLevelEntries\(ROOT, 'scripts'\)/, 'the scripts/ count feeds SECURITY.md');
  assert.match(source, /topLevelEntries\(ROOT, 'workflows'\)/, 'the workflows/ count feeds SECURITY.md');
  assert.match(source, /topLevelEntries\(ROOT, typeRel\)/, 'the per-locale translation counts feed both README tables');
});
