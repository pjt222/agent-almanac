/**
 * fence-propagation.test.js — `scripts/check-fence-propagation.js` (#551).
 *
 * The tool exists because the parity gate CANNOT answer the question it answers: parity
 * accepts a gated body from any English revision, so a mirror that never followed an
 * English fence edit stays green forever. That makes one test load-bearing above the
 * rest — `flags a mirror that lags current English` — and it is written the way the
 * failure actually occurs: English moves, the mirror does not.
 *
 * Fixtures are plain directories, not git repos. The tool reads the working tree only,
 * which is the whole point of it; giving it history would reintroduce the blind spot.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { rmTree } from './_tmp.js';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const TOOL = join(REPO, 'scripts', 'check-fence-propagation.js');

const skill = (fence, tag = 'yaml') => [
  '---', 'name: demo-skill', 'description: A demo skill.', '---', '',
  '# Demo Skill', '', '## Procedure', '',
  '```' + tag, fence, '```', '',
].join('\n');

/** Two fences: a localisable `text` one and a frozen `yaml` one, in that order. */
const mixedSkill = (prose, code) => [
  '---', 'name: demo-skill', 'description: A demo skill.', '---', '',
  '# Demo Skill', '', '## Procedure', '',
  '```text', prose, '```', '',
  '```yaml', code, '```', '',
].join('\n');

/**
 * A fixture root with one English skill and one mirror per entry in `mirrors`.
 * @param {{english: string, mirrors: Record<string, string|{body: string, tag: string}>}} spec
 */
function makeRoot(t, { english, mirrors, tree = 'skills', id = 'demo-skill' }) {
  const dir = mkdtempSync(join(tmpdir(), 'fence-prop-'));
  t.after(() => rmTree(dir));

  const englishFile = tree === 'skills'
    ? join(dir, 'skills', id, 'SKILL.md')
    : join(dir, tree, `${id}.md`);
  mkdirSync(dirname(englishFile), { recursive: true });
  writeFileSync(englishFile, english, 'utf8');

  for (const [locale, value] of Object.entries(mirrors)) {
    const file = tree === 'skills'
      ? join(dir, 'i18n', locale, 'skills', id, 'SKILL.md')
      : join(dir, 'i18n', locale, tree, `${id}.md`);
    mkdirSync(dirname(file), { recursive: true });
    // A string is a fence BODY wrapped in the one-fence skeleton; `{body, tag}` picks
    // the tag; `{raw}` is a whole file, for fixtures needing more than one fence.
    let text;
    if (typeof value === 'string') text = skill(value);
    else if (value.raw !== undefined) text = value.raw;
    else text = skill(value.body, value.tag ?? 'yaml');
    writeFileSync(file, text, 'utf8');
  }
  return dir;
}

function run(dir, extra = []) {
  const r = spawnSync(process.execPath, [TOOL, '--root', dir, '--json', ...extra], { encoding: 'utf8' });
  return { status: r.status, stderr: r.stderr, out: r.stdout.trim().startsWith('{') ? JSON.parse(r.stdout) : null };
}

const LIVE = 'replicas: {{ .Values.replicaCount }}';
const MOVED = '{{- if not .Values.autoscaling.enabled }}\nreplicas: {{ .Values.replicaCount }}\n{{- end }}';

describe('check-fence-propagation (#551)', () => {
  it('is clean when every mirror carries the English body verbatim', (t) => {
    const dir = makeRoot(t, { english: skill(LIVE), mirrors: { de: LIVE, ja: LIVE } });
    const { status, out } = run(dir, ['--id', 'demo-skill']);
    assert.equal(status, 0);
    assert.deepEqual(out.findings, []);
    assert.equal(out.mirrorsFound, 2);
    assert.equal(out.mirrorsAligned, 2);
    assert.equal(out.frozenFences, 1);
  });

  it('flags a mirror that lags current English — the case parity cannot see', (t) => {
    // English moved, the mirror did not. `check-i18n-fence-parity.js` accepts the
    // mirror because its body is in some English revision; this tool must not.
    const dir = makeRoot(t, { english: skill(MOVED), mirrors: { de: MOVED, ja: LIVE } });
    const { status, out } = run(dir, ['--id', 'demo-skill']);
    assert.equal(status, 1);
    assert.equal(out.findings.length, 1);
    assert.equal(out.findings[0].locale, 'ja');
    assert.equal(out.findings[0].kind, 'lags-english');
    assert.equal(out.findings[0].ordinal, 0);
    assert.equal(out.findings[0].tag, 'yaml');
  });

  it('compares WHOLE bodies, not the inserted lines', (t) => {
    // The trap the eleven-file propagation was verified against: a mirror can carry
    // the line you added and still differ elsewhere in the same fence, because it
    // matched a different historical revision to begin with. A substring check on
    // the insertion passes here; a body comparison must not.
    const english = skill(`${MOVED}\nimage: repo:{{ .Values.image.tag | default .Chart.AppVersion }}`);
    const stale = `${MOVED}\nimage: repo:{{ .Values.image.tag }}`;
    const dir = makeRoot(t, { english, mirrors: { de: stale } });
    const { status, out } = run(dir, ['--id', 'demo-skill']);
    assert.equal(status, 1, 'a mirror carrying the insertion but stale elsewhere must still be flagged');
    assert.equal(out.findings[0].kind, 'lags-english');
  });

  it('ignores a localisable fence while still checking the frozen one beside it', (t) => {
    // `text` is exempt by the closed exemption list, so a translated body there is
    // legitimate and must not be reported as a lag. The fixture is deliberately MIXED:
    // an all-`text` fixture would pass under a tool that ignores every fence, and the
    // zero-frozen refusal below now rejects that shape outright anyway.
    const dir = makeRoot(t, {
      english: mixedSkill('report template', LIVE),
      mirrors: { de: { raw: mixedSkill('Berichtsvorlage', LIVE) } },
    });
    const { status, out } = run(dir, ['--id', 'demo-skill']);
    assert.equal(status, 0);
    assert.equal(out.englishFences, 2);
    assert.equal(out.frozenFences, 1, 'only the yaml fence is frozen');
    assert.deepEqual(out.findings, []);
  });

  it('still flags the frozen fence when the localisable one is translated', (t) => {
    // The pair of the test above: translating the `text` fence must not mask a real
    // lag at the `yaml` ordinal beside it.
    const dir = makeRoot(t, {
      english: mixedSkill('report template', MOVED),
      mirrors: { de: { raw: mixedSkill('Berichtsvorlage', LIVE) } },
    });
    const { status, out } = run(dir, ['--id', 'demo-skill']);
    assert.equal(status, 1);
    assert.equal(out.findings.length, 1);
    assert.equal(out.findings[0].ordinal, 1, 'the second fence, not the first');
  });

  it('refuses an id whose English has no frozen fences rather than reporting it clean', (t) => {
    // The second vacuity refusal. "Every frozen fence agrees" over zero frozen fences
    // is the same clean-looking nothing the no-mirrors case refuses.
    const dir = makeRoot(t, {
      english: skill('report template', 'text'),
      mirrors: { de: { body: 'Berichtsvorlage', tag: 'text' } },
    });
    const { status, stderr } = run(dir, ['--id', 'demo-skill']);
    assert.equal(status, 2);
    assert.match(stderr, /no frozen fences in English/);
  });

  it('refuses to compare a mirror whose tag sequence differs', (t) => {
    // Ordinal mapping is unsound then — the same refusal normalize-i18n-fences.js
    // makes. Reporting it as a body lag would be a fabricated finding.
    const dir = makeRoot(t, {
      english: skill(LIVE),
      mirrors: { de: { body: LIVE, tag: 'bash' } },
    });
    const { status, out } = run(dir, ['--id', 'demo-skill']);
    assert.equal(status, 1);
    assert.equal(out.findings[0].kind, 'unalignable');
    assert.equal(out.findings[0].locale, 'de');
  });

  it('refuses an id with no mirrors rather than reporting it clean', (t) => {
    // The vacuity refusal. A typo'd id returning "0 findings" is the answer this
    // tool exists never to give, and it is the exact shape that made an earlier
    // scoped gate report a clean-looking zero over nothing.
    const dir = makeRoot(t, { english: skill(LIVE), mirrors: {} });
    const { status, stderr } = run(dir, ['--id', 'demo-skill']);
    assert.equal(status, 2);
    assert.match(stderr, /no translated mirrors/);
  });

  it('requires --id — it is not one keystroke from a corpus-wide run', (t) => {
    const dir = makeRoot(t, { english: skill(LIVE), mirrors: { de: LIVE } });
    const r = spawnSync(process.execPath, [TOOL, '--root', dir], { encoding: 'utf8' });
    assert.equal(r.status, 2);
    assert.match(r.stderr, /--id is required/);
  });

  it('rejects an unknown argument instead of ignoring it', (t) => {
    const dir = makeRoot(t, { english: skill(LIVE), mirrors: { de: LIVE } });
    const r = spawnSync(process.execPath, [TOOL, '--root', dir, '--id', 'demo-skill', '--wat'], { encoding: 'utf8' });
    assert.equal(r.status, 2);
    assert.match(r.stderr, /unrecognised argument/);
  });

  it('resolves the tree by finding the id, and reports where it looked', (t) => {
    const dir = makeRoot(t, { english: skill(LIVE), mirrors: { de: LIVE }, tree: 'guides', id: 'demo-guide' });
    const { status, out } = run(dir, ['--id', 'demo-guide']);
    assert.equal(status, 0);
    assert.equal(out.tree, 'guides');
  });

  it('rejects --tree naming a tree the id is not in', (t) => {
    const dir = makeRoot(t, { english: skill(LIVE), mirrors: { de: LIVE } });
    const r = spawnSync(process.execPath, [TOOL, '--root', dir, '--id', 'demo-skill', '--tree', 'guides'], { encoding: 'utf8' });
    assert.equal(r.status, 2);
    assert.match(r.stderr, /no English source at/);
  });

  it('rejects --tree naming something that is not a content tree at all', (t) => {
    const dir = makeRoot(t, { english: skill(LIVE), mirrors: { de: LIVE } });
    const r = spawnSync(process.execPath, [TOOL, '--root', dir, '--id', 'demo-skill', '--tree', '..'], { encoding: 'utf8' });
    assert.equal(r.status, 2);
    assert.match(r.stderr, /is not a content tree/);
  });

  it('does not treat a non-locale directory under i18n/ as a locale', (t) => {
    // `i18n/glossaries` is a real directory and is not a locale. A local
    // `readdirSync(i18n).filter(isDirectory)` admits it; the SSOT walk does not.
    // Without the SSOT this fixture reports a mirror that the parity corpus does
    // not have — the two tools disagreeing about what "the mirrors" are.
    const dir = makeRoot(t, { english: skill(LIVE), mirrors: { de: LIVE } });
    mkdirSync(join(dir, 'i18n', 'glossaries', 'skills', 'demo-skill'), { recursive: true });
    writeFileSync(join(dir, 'i18n', 'glossaries', 'skills', 'demo-skill', 'SKILL.md'), skill('drifted'), 'utf8');

    const { status, out } = run(dir, ['--id', 'demo-skill']);
    assert.equal(status, 0, 'the glossaries entry must not be compared');
    assert.equal(out.mirrorsFound, 1);
    assert.deepEqual(out.findings, []);
  });

  it('compares only the named tree when an id exists in two of them', (t) => {
    // Built to kill a surviving mutant: the mirror filter keyed on id ALONE, so its
    // correctness rested entirely on `onlyTrees`. Dropping that argument widened the
    // walk to every tree and no fixture noticed. Here the guide is clean and the
    // same-named skill lags — a run scoped to `guides` must report nothing.
    const dir = makeRoot(t, { english: skill(LIVE), mirrors: { de: LIVE }, tree: 'guides', id: 'twin' });
    mkdirSync(join(dir, 'skills', 'twin'), { recursive: true });
    writeFileSync(join(dir, 'skills', 'twin', 'SKILL.md'), skill(MOVED), 'utf8');
    mkdirSync(join(dir, 'i18n', 'de', 'skills', 'twin'), { recursive: true });
    writeFileSync(join(dir, 'i18n', 'de', 'skills', 'twin', 'SKILL.md'), skill(LIVE), 'utf8');

    const { status, out } = run(dir, ['--id', 'twin', '--tree', 'guides']);
    assert.equal(status, 0, 'the lagging skill mirror belongs to the other tree');
    assert.equal(out.mirrorsFound, 1);
    assert.deepEqual(out.findings, []);
  });

  it('counts alignable mirrors separately from mirrors found', (t) => {
    // Conflating the two overstates coverage: a run that refused every mirror
    // would otherwise report the full count as compared.
    const dir = makeRoot(t, {
      english: skill(LIVE),
      mirrors: { de: LIVE, ja: { body: LIVE, tag: 'bash' } },
    });
    const { status, out } = run(dir, ['--id', 'demo-skill']);
    assert.equal(status, 1);
    assert.equal(out.mirrorsFound, 2);
    assert.equal(out.mirrorsAligned, 1, 'the retagged mirror was refused, not compared');
  });
});

describe('check-fence-propagation argument parsing (#551)', () => {
  // The parser's comment names the hazards it prevents; without these the claims are
  // documentation. Every case below survives deletion of the guard it names.
  const fixture = (t) => makeRoot(t, { english: skill(LIVE), mirrors: { de: LIVE } });
  const call = (args) => spawnSync(process.execPath, [TOOL, ...args], { encoding: 'utf8' });

  it('accepts the --flag=value form', (t) => {
    const dir = fixture(t);
    const r = call([`--root=${dir}`, '--id=demo-skill', '--json']);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(JSON.parse(r.stdout).id, 'demo-skill');
  });

  it('rejects an empty --root= rather than falling back to the real repo', (t) => {
    // `--root=$FIXTURE` with FIXTURE unset. A falsy `opts.root ? … : DEFAULT_ROOT`
    // test read the production corpus here and could report OK about it.
    const r = call(['--root=', '--id', 'demo-skill']);
    assert.equal(r.status, 2);
    assert.match(r.stderr, /--root needs a value/);
  });

  it('rejects a value flag whose value was swallowed by the next flag', (t) => {
    const dir = fixture(t);
    const r = call(['--root', dir, '--id', '--json']);
    assert.equal(r.status, 2);
    assert.match(r.stderr, /--id needs a value/);
  });

  it('rejects a value flag at the end of argv with no value at all', (t) => {
    const dir = fixture(t);
    const r = call(['--root', dir, '--id']);
    assert.equal(r.status, 2);
    assert.match(r.stderr, /--id needs a value/);
  });

  it('rejects a value on a boolean flag instead of ignoring it', (t) => {
    const dir = fixture(t);
    const r = call(['--root', dir, '--id', 'demo-skill', '--json=1']);
    assert.equal(r.status, 2);
    assert.match(r.stderr, /--json takes no value/);
  });

  it('rejects a bare positional', (t) => {
    const dir = fixture(t);
    const r = call(['--root', dir, 'demo-skill']);
    assert.equal(r.status, 2);
    assert.match(r.stderr, /unrecognised argument 'demo-skill'/);
  });
});
