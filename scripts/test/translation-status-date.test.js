/**
 * translation-status-date.test.js — `last_updated` moves with the counts, not the clock (#603).
 *
 * The behaviour is one ternary, and a pure-function test of it would be worthless: the failure
 * this guards is somebody "simplifying" `last_updated: unchanged ? previous.last_updated : today`
 * back to `last_updated: today`, which leaves any extracted helper present and merely unused.
 * Only a run of the real generator can see that, so these drive it as a subprocess against a
 * throwaway repo via `--root`.
 *
 * Both directions are asserted. A date that never moves is not a fix — it is a different lie
 * from the one #603 reported, and a test pinning only the preserve half would call it a pass.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { rmTree } from './_tmp.js';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPT = join(REPO, 'scripts', 'generate-translation-status.js');
const STALE_DATE = '2020-01-01';

function git(cwd, args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(r.status, 0, `git ${args.join(' ')} failed: ${r.stderr}`);
  return r.stdout.trim();
}

function makeFixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'status-date-'));
  t.after(() => rmTree(dir));

  git(dir, ['init', '-b', 'main']);
  git(dir, ['config', 'user.email', 'test@example.invalid']);
  git(dir, ['config', 'user.name', 'Fixture']);

  mkdirSync(join(dir, 'i18n'), { recursive: true });
  writeFileSync(join(dir, 'i18n', '_config.yml'),
    'supported_locales:\n  - code: de\n    name: German\n', 'utf8');

  // Source counts come from the registries, not from the disk, so the fixture needs them.
  // teams/ and guides/ are optional to the generator and deliberately left out.
  mkdirSync(join(dir, 'skills'), { recursive: true });
  mkdirSync(join(dir, 'agents'), { recursive: true });
  writeFileSync(join(dir, 'skills', '_registry.yml'), 'total_skills: 1\n', 'utf8');
  writeFileSync(join(dir, 'agents', '_registry.yml'), 'total_agents: 0\n', 'utf8');

  mkdirSync(join(dir, 'skills', 'demo-skill'), { recursive: true });
  writeFileSync(join(dir, 'skills', 'demo-skill', 'SKILL.md'),
    ['---', 'name: demo-skill', 'description: A demo.', '---', '', '# Demo', '',
      'A substantive English paragraph that a translation can differ from.', ''].join('\n'),
    'utf8');

  const translated = join(dir, 'i18n', 'de', 'skills', 'demo-skill', 'SKILL.md');
  mkdirSync(dirname(translated), { recursive: true });
  writeFileSync(translated,
    ['---', 'name: demo-skill', 'description: Eine Demo.', 'locale: de', 'source_locale: en',
      'source_commit: 0000000', '---', '', '# Demo', '',
      'Ein inhaltlicher deutscher Absatz, der sich vom Englischen unterscheidet.', ''].join('\n'),
    'utf8');

  git(dir, ['add', 'skills', 'i18n']);
  git(dir, ['commit', '-m', 'fixture']);

  return { dir, statusPath: join(dir, 'i18n', 'de', 'translation_status.yml') };
}

function generate(dir) {
  const r = spawnSync(process.execPath, [SCRIPT, '--root', dir], { encoding: 'utf8' });
  assert.equal(r.status, 0, `generator failed:\n${r.stdout}\n${r.stderr}`);
  return r.stdout;
}

const dateOf = (statusPath) =>
  (readFileSync(statusPath, 'utf8').match(/^last_updated:\s*'?([\d-]+)'?/m) || [])[1];

describe('translation_status last_updated (#603)', () => {
  it('generates a status file with a date on first run', (t) => {
    const { dir, statusPath } = makeFixture(t);
    generate(dir);
    assert.ok(existsSync(statusPath), 'expected a status file');
    assert.match(dateOf(statusPath), /^\d{4}-\d{2}-\d{2}$/);
  });

  it('PRESERVES a stale date when no count moved', (t) => {
    const { dir, statusPath } = makeFixture(t);
    generate(dir);

    // Backdate only the date. Every count stays exactly as generated.
    const backdated = readFileSync(statusPath, 'utf8')
      .replace(/^last_updated:.*$/m, `last_updated: '${STALE_DATE}'`);
    writeFileSync(statusPath, backdated, 'utf8');

    const out = generate(dir);
    assert.equal(dateOf(statusPath), STALE_DATE,
      'the date must not move when the counts did not — that is #603');
    assert.match(out, /UNCHANGED:/, 'a no-op regeneration should skip the write entirely');
  });

  it('BUMPS the date when a count moved', (t) => {
    const { dir, statusPath } = makeFixture(t);
    generate(dir);

    // Backdate AND corrupt a count, so the only thing distinguishing this from the case above
    // is that the coverage payload no longer matches what the generator computes.
    const tampered = readFileSync(statusPath, 'utf8')
      .replace(/^last_updated:.*$/m, `last_updated: '${STALE_DATE}'`)
      .replace(/(translated|total):\s*\d+/, (m, k) => `${k}: 999`);
    writeFileSync(statusPath, tampered, 'utf8');

    const out = generate(dir);
    assert.notEqual(dateOf(statusPath), STALE_DATE,
      'a frozen date is its own lie — the date must move when the counts do');
    assert.match(out, /GENERATED:/);
  });
});
