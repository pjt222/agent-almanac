/**
 * backfill-fence-basis.test.js — the corpus writer for `fence_basis_commit` (#552).
 *
 * This tool writes one line into thousands of tracked files, so the properties worth pinning are
 * the ones whose failure is silent: stamping a file that cannot prove its claim, overwriting a
 * claim it did not establish, writing during a preview, and writing into a tree someone was
 * already editing by hand.
 *
 * Driven as a subprocess against throwaway git repos. A unit test of the predicate would pass
 * against a tool that never calls it.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, cpSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import { auditYaml } from '../lib/frontmatter-audit.js';
import { rmTree } from './_tmp.js';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPT = 'scripts/backfill-fence-basis.js';

function git(cwd, args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(r.status, 0, `git ${args.join(' ')} failed: ${r.stderr}`);
  return r.stdout.trim();
}

const english = (body) => [
  '---', 'name: demo-skill', 'description: A demo skill.', '---', '',
  '# Demo Skill', '', '```bash', body, '```', '',
].join('\n');

const mirror = (sourceCommit, body, extra = []) => [
  '---', 'name: demo-skill', 'description: Eine Demo.', 'locale: de', 'source_locale: en',
  `source_commit: ${sourceCommit}`, ...extra, '---', '',
  '# Demo', '', '```bash', body, '```', '',
].join('\n');

/**
 * @param {object} opts
 * @param {string} [opts.mirrorBody] defaults to the English body, i.e. a verifiable mirror
 * @param {string[]} [opts.extraFrontmatter]
 */
function makeFixture(t, { mirrorBody = 'echo "hello"', extraFrontmatter = [] } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'backfill-'));
  t.after(() => rmTree(dir));

  mkdirSync(join(dir, 'scripts'), { recursive: true });
  cpSync(join(REPO, SCRIPT), join(dir, SCRIPT));
  cpSync(join(REPO, 'scripts', 'check-i18n-fence-parity.js'), join(dir, 'scripts', 'check-i18n-fence-parity.js'));
  cpSync(join(REPO, 'scripts', 'lib'), join(dir, 'scripts', 'lib'), { recursive: true });
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ type: 'module' }), 'utf8');
  // The tool imports js-yaml for its independent placement audit, so the fixture needs a
  // resolvable node_modules. Symlinked rather than installed: the point is to exercise the
  // REAL import path, and an `npm i` per fixture would make the suite unusable.
  symlinkSync(join(REPO, 'node_modules'), join(dir, 'node_modules'), 'dir');

  git(dir, ['init', '-b', 'main']);
  git(dir, ['config', 'user.email', 'test@example.invalid']);
  git(dir, ['config', 'user.name', 'Fixture']);

  const skill = join(dir, 'skills', 'demo-skill', 'SKILL.md');
  mkdirSync(dirname(skill), { recursive: true });
  writeFileSync(skill, english('echo "hello"'), 'utf8');
  git(dir, ['add', 'skills']);
  git(dir, ['commit', '-m', 'english']);
  const head = git(dir, ['rev-parse', '--short', 'HEAD']);

  const translated = join(dir, 'i18n', 'de', 'skills', 'demo-skill', 'SKILL.md');
  mkdirSync(dirname(translated), { recursive: true });
  writeFileSync(translated, mirror(head, mirrorBody, extraFrontmatter), 'utf8');
  git(dir, ['add', 'i18n']);
  git(dir, ['commit', '-m', 'de mirror']);

  return { dir, translated, head };
}

const run = (dir, args = []) => spawnSync(process.execPath, [SCRIPT, ...args], { cwd: dir, encoding: 'utf8' });
const field = (text) => (text.match(/^\s*fence_basis_commit:\s*(\S+)/m) || [])[1];

describe('backfill-fence-basis (#552)', () => {
  it('stamps a file that mirrors its source_commit', (t) => {
    const { dir, translated, head } = makeFixture(t);
    const r = run(dir, ['--write']);
    assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}`);
    assert.equal(field(readFileSync(translated, 'utf8')), head);
  });

  it('withholds from a file whose gated body differs from its source_commit', (t) => {
    const { dir, translated } = makeFixture(t, { mirrorBody: 'echo "uebersetzt"' });
    const r = run(dir, ['--write']);
    assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}`);
    assert.equal(field(readFileSync(translated, 'utf8')), undefined,
      'a file that cannot prove a basis must be left without one');
    assert.match(r.stdout, /a gated fence body differs/);
  });

  it('PREVIEW writes nothing', (t) => {
    const { dir, translated } = makeFixture(t);
    const before = readFileSync(translated, 'utf8');
    const r = run(dir, []);
    assert.equal(r.status, 0);
    assert.match(r.stdout, /would stamp:\s+1/);
    assert.equal(readFileSync(translated, 'utf8'), before, 'preview must not touch the corpus');
  });

  it('never overwrites a field it did not write', (t) => {
    // The scaffolders stamp at birth. Silently rewriting their claim would make this tool a
    // second, invisible author of a fact it did not establish.
    const { dir, translated } = makeFixture(t, { extraFrontmatter: ['fence_basis_commit: deadbee'] });
    const r = run(dir, ['--write']);
    assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}`);
    assert.equal(field(readFileSync(translated, 'utf8')), 'deadbee');
    assert.match(r.stdout, /already carries the field/);
  });

  it('is idempotent — a second run stamps nothing', (t) => {
    const { dir } = makeFixture(t);
    assert.equal(run(dir, ['--write']).status, 0);
    // The commit is not incidental: the dirty-scope guard means a second run is only reachable
    // after the first is committed. Idempotence and that guard are the same property seen from
    // two sides — the tool will not write twice, and will not write over an unreviewed write.
    git(dir, ['add', 'i18n']);
    git(dir, ['commit', '-m', 'backfill']);
    const second = run(dir, ['--write']);
    assert.equal(second.status, 0, `${second.stdout}\n${second.stderr}`);
    assert.match(second.stdout, /stamped:\s+0/);
    assert.match(second.stdout, /already carries the field/);
  });

  it('refuses to write into a dirty scope', (t) => {
    const { dir, translated } = makeFixture(t);
    writeFileSync(translated, `${readFileSync(translated, 'utf8')}\nhand edit\n`, 'utf8');
    const r = run(dir, ['--write']);
    assert.equal(r.status, 2);
    assert.match(r.stderr, /uncommitted change/);
  });

  it('exits 2 on a scope that reaches nothing, rather than reporting a clean zero', (t) => {
    const { dir } = makeFixture(t);
    const badLocale = run(dir, ['--locale', 'nope']);
    assert.equal(badLocale.status, 2);
    assert.match(badLocale.stderr, /matched no translated content/);

    const badTree = run(dir, ['--tree', 'teams']);
    assert.equal(badTree.status, 2);
    assert.match(badTree.stderr, /matched no translated content/);

    const notATree = run(dir, ['--tree', 'nonsense']);
    assert.equal(notATree.status, 2);
    assert.match(notATree.stderr, /no such content tree/);
  });

  it('exits 2 when a COMBINED scope reaches nothing, not just when each flag is reachable alone', (t) => {
    // The composition bug, which each flag passing on its own cannot catch. Locale `de` carries
    // skills; locale `es` carries guides. Corpus-wide, both `de` and `guides` are "reached", so
    // a guard collecting reached-trees before the locale filter waves `--locale de --tree
    // guides` through and scans nothing at exit 0. That is the exact case
    // `normalize-i18n-fences.js` was fixed for, and the first version of the shared walk
    // reintroduced it — measured against the real corpus with `--locale wenyan --tree guides`.
    const { dir } = makeFixture(t);
    const guide = join(dir, 'guides', 'demo-guide.md');
    mkdirSync(dirname(guide), { recursive: true });
    writeFileSync(guide, ['---', 'title: Demo', 'description: A demo guide.', '---', '', '# Demo', ''].join('\n'), 'utf8');
    const esGuide = join(dir, 'i18n', 'es', 'guides', 'demo-guide.md');
    mkdirSync(dirname(esGuide), { recursive: true });
    writeFileSync(esGuide, ['---', 'title: Demo', 'locale: es', 'source_locale: en', 'source_commit: abc1234', '---', '', '# Demo', ''].join('\n'), 'utf8');
    git(dir, ['add', '-A']);
    git(dir, ['commit', '-m', 'add a guide, translated only into es']);

    // Each flag is individually reachable somewhere in the corpus.
    assert.equal(run(dir, ['--locale', 'de']).status, 0, 'de alone is fine');
    assert.equal(run(dir, ['--tree', 'guides']).status, 0, 'guides alone is fine');

    // Their composition is not.
    const combined = run(dir, ['--locale', 'de', '--tree', 'guides']);
    assert.equal(combined.status, 2, 'de has no guides — this must not report a clean zero');
    assert.match(combined.stderr, /matched no translated content in locale 'de'/);
  });

  it('--json emits parseable JSON and nothing else on stdout', (t) => {
    // A trailing status line used to print after the document, so `JSON.parse` threw
    // `Unexpected non-whitespace character after JSON`. A --json mode whose output is not JSON
    // is a feature that exists and does not work, discoverable only by a consumer.
    const { dir } = makeFixture(t);
    const r = run(dir, ['--json']);
    assert.equal(r.status, 0);
    const parsed = JSON.parse(r.stdout);
    assert.equal(parsed.scanned, 1);
    assert.equal(parsed.stamp, 1);
    assert.equal(parsed.leaked, 0);
  });

  it('rejects unknown and value-less flags', (t) => {
    const { dir } = makeFixture(t);
    assert.equal(run(dir, ['--wirte']).status, 2);
    assert.equal(run(dir, ['--locale']).status, 2);
    assert.equal(run(dir, ['--verify']).status, 2, '--verify needs --base');
  });

  // ── the two pool conjuncts ────────────────────────────────────────────────
  //
  // The fixtures above are single-commit repos where the basis IS head, so both pool checks are
  // unreachable and mutating either would survive the suite — the "pen that signs the corpus is
  // the one thing untested" gap, in the tool that signs the corpus. These reach them.
  //
  // Both need a basis the walk cannot see. `git log --name-only` is path-limited and therefore
  // history-simplified, and lists no paths for a merge, while `cat-file` resolves any object —
  // so a conflict resolution is visible to the basis lookup and invisible to the pool.

  /** Build a repo whose mirror names a MERGE as its source_commit. */
  function mergeFixture(t, { resolution, mirrorFences }) {
    const dir = mkdtempSync(join(tmpdir(), 'backfill-merge-'));
    t.after(() => rmTree(dir));

    mkdirSync(join(dir, 'scripts'), { recursive: true });
    cpSync(join(REPO, SCRIPT), join(dir, SCRIPT));
    cpSync(join(REPO, 'scripts', 'check-i18n-fence-parity.js'), join(dir, 'scripts', 'check-i18n-fence-parity.js'));
    cpSync(join(REPO, 'scripts', 'lib'), join(dir, 'scripts', 'lib'), { recursive: true });
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ type: 'module' }), 'utf8');
  // The tool imports js-yaml for its independent placement audit, so the fixture needs a
  // resolvable node_modules. Symlinked rather than installed: the point is to exercise the
  // REAL import path, and an `npm i` per fixture would make the suite unusable.
  symlinkSync(join(REPO, 'node_modules'), join(dir, 'node_modules'), 'dir');

    git(dir, ['init', '-b', 'main']);
    git(dir, ['config', 'user.email', 'test@example.invalid']);
    git(dir, ['config', 'user.name', 'Fixture']);

    const skill = join(dir, 'skills', 'demo-skill', 'SKILL.md');
    mkdirSync(dirname(skill), { recursive: true });
    const doc = (fences) => [
      '---', 'name: demo-skill', 'description: A demo skill.', '---', '', '# Demo Skill', '',
      ...fences.flatMap(([tag, body]) => ['```' + tag, body, '```', '']),
    ].join('\n');

    writeFileSync(skill, doc([['bash', 'echo "X"']]), 'utf8');
    git(dir, ['add', '-A']); git(dir, ['commit', '-m', 'A']);
    git(dir, ['checkout', '-b', 'side']);
    writeFileSync(skill, doc([['yaml', 'key: Y']]), 'utf8');
    git(dir, ['add', '-A']); git(dir, ['commit', '-m', 'B']);
    git(dir, ['checkout', 'main']);
    writeFileSync(skill, doc([['bash', 'echo "C"']]), 'utf8');
    git(dir, ['add', '-A']); git(dir, ['commit', '-m', 'C']);

    spawnSync('git', ['merge', 'side'], { cwd: dir, encoding: 'utf8' }); // conflicts
    writeFileSync(skill, doc(resolution), 'utf8');
    git(dir, ['add', '-A']); git(dir, ['commit', '--no-edit', '-m', 'merge']);
    const merge = git(dir, ['rev-parse', '--short', 'HEAD']);

    // A later commit, so the working-tree pass contributes D and not the resolution — without
    // it the resolution re-enters the pool through the worktree and the corner closes silently.
    writeFileSync(skill, doc([['bash', 'echo "D"']]), 'utf8');
    git(dir, ['add', '-A']); git(dir, ['commit', '-m', 'D']);

    const translated = join(dir, 'i18n', 'de', 'skills', 'demo-skill', 'SKILL.md');
    mkdirSync(dirname(translated), { recursive: true });
    writeFileSync(translated, [
      '---', 'name: demo-skill', 'description: Eine Demo.', 'locale: de', 'source_locale: en',
      `source_commit: ${merge}`, '---', '', '# Demo', '',
      ...mirrorFences.flatMap(([tag, body]) => ['```' + tag, body, '```', '']),
    ].join('\n'), 'utf8');
    git(dir, ['add', '-A']); git(dir, ['commit', '-m', 'de mirror']);

    return { dir, translated };
  }

  it('withholds when the basis BODY is in no walked revision', (t) => {
    // One fence throughout, so the folded sequence `bash` is pooled from A/C/D. The merge
    // resolves to a body present in neither parent, so `mirrorsBasis` holds against the merge
    // while that body is in no revision the walk can see.
    const { dir, translated } = mergeFixture(t, {
      resolution: [['bash', 'echo "R"']],
      mirrorFences: [['bash', 'echo "R"']],
    });
    const r = run(dir, ['--write']);
    assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}`);
    assert.equal(field(readFileSync(translated, 'utf8')), undefined);
    assert.match(r.stdout, /a gated body is in no walked revision/);
  });

  it('withholds when the basis SEQUENCE is in no walked revision', (t) => {
    // Bodies X and Y each exist in a parent, so every gated body IS pooled. The merge assembles
    // them into a two-fence document no single revision ever had, so only the sequence check
    // can refuse this one.
    const { dir, translated } = mergeFixture(t, {
      resolution: [['bash', 'echo "X"'], ['yaml', 'key: Y']],
      mirrorFences: [['bash', 'echo "X"'], ['yaml', 'key: Y']],
    });
    const r = run(dir, ['--write']);
    assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}`);
    assert.equal(field(readFileSync(translated, 'utf8')), undefined);
    assert.match(r.stdout, /fence sequence is in no walked revision/);
  });

  it('--verify reconstructs a landed diff, and rejects one carrying anything else', (t) => {
    const { dir, translated } = makeFixture(t);
    const base = git(dir, ['rev-parse', 'HEAD']);
    assert.equal(run(dir, ['--write']).status, 0);
    git(dir, ['add', 'i18n']);
    git(dir, ['commit', '-m', 'backfill']);

    const ok = run(dir, ['--verify', '--base', base]);
    assert.equal(ok.status, 0, `${ok.stdout}\n${ok.stderr}`);
    assert.match(ok.stdout, /every changed file is exactly its base content plus one/);

    // Now smuggle a body change into a second commit and confirm the reconstruction catches it.
    writeFileSync(translated, readFileSync(translated, 'utf8').replace('echo "hello"', 'echo "sneaky"'), 'utf8');
    git(dir, ['add', 'i18n']);
    git(dir, ['commit', '-m', 'sneaky body change']);
    const bad = run(dir, ['--verify', '--base', base]);
    assert.equal(bad.status, 1, 'a body change must not pass reconstruction');
    assert.match(bad.stderr, /not base\+stamp/);
  });
});

/**
 * `auditYaml` — the second, non-regex instrument.
 *
 * Tested as a function rather than through `--verify`, deliberately and for a reason worth
 * stating: inside `--verify` the reconstruction check runs first and compares against
 * `stampFrontmatterField`'s own output, so any diff the tool actually produced arrives here
 * already correct. This check exists for the case reconstruction is blind to — a defect in the
 * shared transform — which no fixture can produce without injecting a broken transform. Mutating
 * its call site consequently survives the suite, measured; that is a property of the design, not
 * a hole a better fixture would close.
 */
describe('auditYaml — placement, not just presence', () => {
  const nested = (extra = []) => [
    '---', 'name: demo', 'metadata:', '  locale: de', '  source_commit: abc1234',
    ...extra, '---', '', '# Body', '',
  ].join('\n');

  it('accepts a field beside its anchor, nested', () => {
    assert.equal(auditYaml(nested(['  fence_basis_commit: abc1234'])), null);
  });

  it('accepts a field beside its anchor, top level', () => {
    const flat = ['---', 'name: demo', 'source_commit: abc1234', 'fence_basis_commit: abc1234', '---', '', 'x', ''].join('\n');
    assert.equal(auditYaml(flat), null);
  });

  it('rejects a field that is valid YAML but in the WRONG mapping', () => {
    // The failure `readFrontmatterField` cannot see: it is indent-tolerant by design, so it
    // reads this back correctly while the field now means something else.
    const wrong = ['---', 'name: demo', 'metadata:', '  locale: de', '  source_commit: abc1234',
      'fence_basis_commit: abc1234', '---', '', 'x', ''].join('\n');
    assert.match(auditYaml(wrong), /landed in a different mapping/);
  });

  it('rejects a value that disagrees with its anchor', () => {
    assert.match(auditYaml(nested(['  fence_basis_commit: deadbee'])), /!==/);
  });

  it('rejects frontmatter that no longer parses', () => {
    const broken = ['---', 'name: demo', 'metadata:', '  source_commit: abc1234',
      '  fence_basis_commit: [unclosed', '---', '', 'x', ''].join('\n');
    assert.match(auditYaml(broken), /not valid YAML/);
  });

  it('rejects a file with no frontmatter at all', () => {
    assert.match(auditYaml('# just a body\n'), /no frontmatter/);
  });
});
