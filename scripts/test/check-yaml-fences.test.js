/**
 * Tests for `scripts/check-yaml-fences.js` (#507).
 *
 * The gate's whole value is that it decides a question that used to need
 * judgement: a fence tagged `yaml` is frozen to English by #472, so a
 * MISLABELLED one silently freezes content that should have been translatable.
 * If it does not parse, it is either broken YAML or it is not YAML.
 *
 * Every fixture below is the shape of something the first corpus run actually
 * found, so the suite pins the classification rather than an invented one.
 *
 * Runs the real script with `--root` pointed at a throwaway tree. Copying the
 * script into the tree instead would not work: it imports `js-yaml`, which
 * resolves only from the repository that installed it.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { rmTree } from './_tmp.js';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPT = join(REPO, 'scripts', 'check-yaml-fences.js');

/** A corpus of one skill, whose SKILL.md is `body`. */
function corpus(t, body) {
  const dir = mkdtempSync(join(tmpdir(), 'yamlfence-'));
  t.after(() => rmTree(dir));
  mkdirSync(join(dir, 'skills', 'demo'), { recursive: true });
  writeFileSync(join(dir, 'skills', 'demo', 'SKILL.md'),
    ['---', 'name: demo', '---', '', '# Demo', '', body, ''].join('\n'), 'utf8');
  return dir;
}

function run(dir, args = []) {
  const r = spawnSync(process.execPath, [SCRIPT, '--root', dir, ...args], {
    cwd: REPO, encoding: 'utf8',
  });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}

const json = (dir) => JSON.parse(run(dir, ['--json']).stdout);

test('a valid yaml fence passes', async (t) => {
  const dir = corpus(t, ['```yaml', 'replicas: 3', 'image: nginx', '```'].join('\n'));

  const r = run(dir);

  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /yaml fences checked: 1/);
  assert.match(r.stdout, /OK: every yaml-tagged fence parses/);
});

test('prose in a yaml fence FAILS — the defect this gate exists for', async (t) => {
  // `skills/escalate-issues/SKILL.md` shape: a routing header, then a markdown
  // report that a human writes. The `---` is where js-yaml gives up.
  const dir = corpus(t, [
    '```yaml',
    '---',
    'type: escalation',
    'severity: high',
    '---',
    '',
    '# Security Concern',
    '',
    '**Request**: Please review whether this is a real secret.',
    '```',
  ].join('\n'));

  const r = run(dir);

  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stdout, /1 yaml-tagged fence\(s\) do not parse/);
  assert.match(r.stdout, /Retag only when/);
});

test('a human reference table in a yaml fence FAILS', async (t) => {
  // `troubleshoot-print-issues` shape: ranges, arrows and bullet lists. Reads
  // like config, is not config.
  const dir = corpus(t, [
    '```yaml',
    '# Direct drive extruder:',
    'retraction_distance: 1.0-2.0mm',
    '',
    '# If stringing persists:',
    '- Enable z-hop: 0.2-0.4mm (lifts nozzle during travel)',
    '- Reduce travel speed (paradoxically helps)',
    '```',
  ].join('\n'));

  assert.equal(run(dir).status, 1);
});

test('retagging that same body to text passes — the prescribed remedy', async (t) => {
  // The paired positive. Without it the test above passes on a build that
  // rejects everything, and the failure message tells the reader to retag.
  const dir = corpus(t, [
    '```text',
    '# Direct drive extruder:',
    'retraction_distance: 1.0-2.0mm',
    '',
    '- Enable z-hop: 0.2-0.4mm',
    '```',
  ].join('\n'));

  const r = run(dir);

  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /yaml fences checked: 0/);
});

// ── the two exempted classes ────────────────────────────────────────────────

test('a Go template is exempted, and reported rather than skipped', async (t) => {
  const dir = corpus(t, [
    '```yaml',
    '{{- if .Values.ingress.enabled -}}',
    'apiVersion: networking.k8s.io/v1',
    '{{- end }}',
    '```',
  ].join('\n'));

  const r = run(dir);
  const j = json(dir);

  assert.equal(r.status, 0, r.stdout);
  assert.equal(j.failures.length, 0);
  assert.equal(j.exempted.length, 1);
  assert.equal(j.exempted[0].exemption, 'go-template');
  assert.match(r.stdout, /go-template/, 'an exemption nobody can see is one nobody notices growing');
});

test('a duplicate-key illustration is exempted, and reported', async (t) => {
  const dir = corpus(t, [
    '```yaml',
    '# Good',
    'model: sonnet',
    '',
    '# Bad',
    'model: opus',
    '```',
  ].join('\n'));

  const j = json(dir);

  assert.equal(j.failures.length, 0);
  assert.equal(j.exempted[0].exemption, 'duplicate-key-illustration');
});

test('the exemptions are the only two, and neither swallows a broken fence', async (t) => {
  // Bad indentation is neither a template nor a duplicate key, so it must fail
  // even though it sits in a file that also holds exempted fences. This is the
  // shape the first corpus run found in `write-helm-chart`, where an elision
  // comment had been dropped into the middle of a mapping and orphaned its
  // children.
  const dir = corpus(t, [
    '```yaml',
    '{{- if .Values.enabled -}}',
    'kind: Deployment',
    '{{- end }}',
    '```',
    '',
    '```yaml',
    'autoscaling: {enabled: true}',
    '  tls:',
    '  - secretName: my-app-tls',
    '```',
  ].join('\n'));

  const r = run(dir);
  const j = json(dir);

  assert.equal(r.status, 1, r.stdout);
  assert.equal(j.exempted.length, 1, 'the template should still be exempted');
  assert.equal(j.failures.length, 1, 'the broken fence must not ride the exemption');
});

// ── parser details that would otherwise bite ────────────────────────────────

test('a multi-document fence is valid, not broken', async (t) => {
  // `loadAll`, not `load`. Two values-file excerpts separated by `---` is the
  // idiom that lets one fence show dev and prod without duplicate keys.
  const dir = corpus(t, [
    '```yaml',
    '# values-dev.yaml',
    'replicaCount: 1',
    '---',
    '# values-prod.yaml',
    'replicaCount: 5',
    '```',
  ].join('\n'));

  const r = run(dir);

  assert.equal(r.status, 0, r.stdout);
  assert.equal(json(dir).exempted.length, 0, 'it should PARSE, not be exempted');
});

test('yml is checked as well as yaml', async (t) => {
  const dir = corpus(t, ['```yml', 'a: [1, 2', '```'].join('\n'));

  assert.equal(run(dir).status, 1);
});

test('non-yaml tags are not checked', async (t) => {
  const dir = corpus(t, ['```bash', 'echo "a: [unclosed"', '```'].join('\n'));

  const r = run(dir);

  assert.equal(r.status, 0);
  assert.match(r.stdout, /yaml fences checked: 0/);
});

// ── arguments ───────────────────────────────────────────────────────────────

test('an unknown argument is an error, not a silently different run', async (t) => {
  const dir = corpus(t, ['```yaml', 'a: 1', '```'].join('\n'));

  const r = run(dir, ['--strict']);

  assert.equal(r.status, 2);
  assert.match(r.stderr, /unknown argument/);
});

test('--root pointing at nothing is an error, not an empty clean run', async (t) => {
  const r = spawnSync(process.execPath, [SCRIPT, '--root', join(tmpdir(), 'no-such-dir-xyz')], {
    cwd: REPO, encoding: 'utf8',
  });

  assert.equal(r.status, 2);
  assert.match(r.stderr, /not a directory/);
});

// ── the exemption's SCOPE, which is the design's headline invariant ─────────

test('a template expression elsewhere in the body does NOT exempt a broken fence', async (t) => {
  // The defect this replaces: testing the BODY for `{{ }}` anywhere matched 24
  // of 331 English fences where only 4 were Helm sources, and forgave every
  // parse error in twenty valid GitHub Actions and Prometheus documents — the
  // most machine-consumed fences in the corpus.
  //
  // This is a real workflow carrying the exact orphaned-`tls:` defect the gate
  // was built to catch. The error lands on `  tls:`, not on the `${{ }}` line.
  const dir = corpus(t, [
    '```yaml',
    'jobs:',
    '  build:',
    '    runs-on: ${{ matrix.config.os }}',
    '    steps:',
    '      - uses: actions/checkout@v4',
    '     - run: npm ci',
    '```',
  ].join('\n'));

  const r = run(dir);

  assert.equal(r.status, 1, `a fence with {{ }} anywhere was exempted:\n${r.stdout}`);
  assert.equal(json(dir).exempted.length, 0);
});

test('exemptions are decided by the error, not by the file path', async (t) => {
  // A location-keyed exemption would cover every exemption this corpus actually
  // has, and would be the thing the header says it refuses to do. Naming a file
  // `write-helm-chart` must not buy anything.
  const dir = mkdtempSync(join(tmpdir(), 'yamlfence-'));
  t.after(() => rmTree(dir));
  mkdirSync(join(dir, 'skills', 'write-helm-chart'), { recursive: true });
  writeFileSync(join(dir, 'skills', 'write-helm-chart', 'SKILL.md'),
    ['---', 'name: write-helm-chart', '---', '', '```yaml', 'a:', '  b: 1', ' c: 2', '```', ''].join('\n'), 'utf8');

  const r = run(dir);

  assert.equal(r.status, 1, 'the path bought an exemption');
});

test('a tag js-yaml 5 does not implement is exempted, not called broken', async (t) => {
  // CloudFormation shorthand is genuinely machine-consumed YAML. Telling its
  // author to retag it `text` would be the freeze-scope edit CLAUDE.md warns
  // about, which is why the failure message no longer offers that first.
  const dir = corpus(t, ['```yaml', 'BucketName: !Ref MyBucket', '```'].join('\n'));

  const r = run(dir);

  assert.equal(r.status, 0, r.stdout);
  assert.equal(json(dir).exempted[0].exemption, 'unsupported-tag-schema');
});

test('the failure message leads with fixing the YAML, not with retagging', async (t) => {
  const dir = corpus(t, ['```yaml', 'a:', '  b: 1', ' c: 2', '```'].join('\n'));

  const r = run(dir);

  assert.match(r.stdout, /If the fence IS machine-consumed, fix the YAML/);
  assert.match(r.stdout, /freeze-scope edit CLAUDE\.md warns against/);
});

// ── scope and the no-op guard ───────────────────────────────────────────────

test('locale mirrors are checked, not only English', async (t) => {
  // The first version was English-only, and the first corpus run proved that
  // wrong: a real fix reached English and none of its ten mirrors, and no other
  // gate could ever report them.
  const dir = corpus(t, ['```yaml', 'a: 1', '```'].join('\n'));
  mkdirSync(join(dir, 'i18n', 'de', 'skills', 'demo'), { recursive: true });
  writeFileSync(join(dir, 'i18n', 'de', 'skills', 'demo', 'SKILL.md'),
    ['---', 'name: demo', 'locale: de', '---', '', '```yaml', 'a:', '  b: 1', ' c: 2', '```', ''].join('\n'), 'utf8');

  const r = run(dir);

  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stdout, /i18n\/de\/skills\/demo\/SKILL\.md/);
  assert.match(r.stdout, /yaml fences checked: 2/);
});

test('a root with no content trees is an error, not an empty clean run', async (t) => {
  // `existsSync` + `isDirectory` answers a different question from "would this
  // scan anything" — the proxy-predicate shape CLAUDE.md documents twice.
  const dir = mkdtempSync(join(tmpdir(), 'yamlfence-empty-'));
  t.after(() => rmTree(dir));

  const r = run(dir);

  assert.equal(r.status, 2, r.stdout);
  assert.match(r.stderr, /no content trees/);
});

test('--json reports the failure in its exit code too', async (t) => {
  // Four tests read --json output and none asserted its status, so a fail-open
  // JSON mode was invisible.
  const dir = corpus(t, ['```yaml', 'a:', '  b: 1', ' c: 2', '```'].join('\n'));

  const r = run(dir, ['--json']);

  assert.equal(r.status, 1);
  assert.equal(JSON.parse(r.stdout).failures.length, 1);
});
