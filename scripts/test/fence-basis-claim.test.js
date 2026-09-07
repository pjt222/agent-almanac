/**
 * fence-basis-claim.test.js — `fence_basis_commit` in the fence-parity gate (#552).
 *
 * The schema's whole risk is that the new field becomes either DECORATIVE (nothing reads it) or
 * a BYPASS (it suppresses a comparison). These drive the real checker as a subprocess against a
 * throwaway git repo, because both risks live in the wiring rather than in any pure function:
 * a unit test of "claim && diverged" would pass against a checker that never calls it.
 *
 * The load-bearing case is `keeps flagging the divergence when the field is present` — the
 * mutation #552's plan names, phrased as coverage: hand-edit a fence body, leave the field
 * alone, and the gate must still go red.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { rmTree } from './_tmp.js';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CHECKER = join(REPO, 'scripts', 'check-i18n-fence-parity.js');

const ENGLISH_FENCE = 'echo "hello"';
const DIVERGENT_FENCE = 'echo "hallo"';

function git(cwd, args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(r.status, 0, `git ${args.join(' ')} failed: ${r.stderr}`);
  return r.stdout.trim();
}

function englishSkill() {
  return [
    '---', 'name: demo-skill', 'description: A demo skill.', '---', '',
    '# Demo Skill', '', '## Procedure', '',
    '```bash', ENGLISH_FENCE, '```', '',
  ].join('\n');
}

/**
 * @param {{sourceCommit: string, basis?: string|null, fence?: string}} opts
 */
function translatedSkill({ sourceCommit, basis = null, fence = DIVERGENT_FENCE }) {
  const fm = [
    '---', 'name: demo-skill', 'description: Eine Demo-Fertigkeit.',
    'locale: de', 'source_locale: en', `source_commit: ${sourceCommit}`,
  ];
  if (basis) fm.push(`fence_basis_commit: ${basis}`);
  fm.push('---');
  return [...fm, '', '# Demo-Fertigkeit', '', '## Ablauf', '', '```bash', fence, '```', ''].join('\n');
}

/** A minimal repo with one English skill and one German mirror, driven via `--root`. */
function makeFixture(t, translatedOpts) {
  const dir = mkdtempSync(join(tmpdir(), 'fence-basis-'));
  t.after(() => rmTree(dir));

  git(dir, ['init', '-b', 'main']);
  git(dir, ['config', 'user.email', 'test@example.invalid']);
  git(dir, ['config', 'user.name', 'Fixture']);

  mkdirSync(join(dir, 'skills', 'demo-skill'), { recursive: true });
  writeFileSync(join(dir, 'skills', 'demo-skill', 'SKILL.md'), englishSkill(), 'utf8');
  git(dir, ['add', 'skills']);
  git(dir, ['commit', '-m', 'english source']);
  const sourceCommit = git(dir, ['rev-parse', 'HEAD']);

  const translated = join(dir, 'i18n', 'de', 'skills', 'demo-skill', 'SKILL.md');
  mkdirSync(dirname(translated), { recursive: true });
  writeFileSync(translated, translatedSkill({ sourceCommit, ...translatedOpts }), 'utf8');
  git(dir, ['add', 'i18n']);
  git(dir, ['commit', '-m', 'de mirror']);

  return { dir, sourceCommit };
}

function check(dir) {
  const r = spawnSync(process.execPath, [CHECKER, '--root', dir, '--json'], { encoding: 'utf8' });
  assert.ok(r.stdout.trim().startsWith('{'), `checker produced no JSON:\n${r.stderr}`);
  return JSON.parse(r.stdout);
}

const kinds = (out) => out.findings.map((f) => f.kind);

describe('fence_basis_commit in the parity gate (#552)', () => {
  it('absence is silent — an unverified file gets no claim finding', (t) => {
    const { dir } = makeFixture(t, {});
    const out = check(dir);
    assert.ok(kinds(out).includes('diverged'), 'the divergence itself must still be reported');
    assert.equal(out.staleBasisClaims, 0);
    assert.equal(kinds(out).includes('stale-basis-claim'), false);
  });

  it('flags a file whose claimed basis its fences contradict', (t) => {
    // The value is opaque to the gate — any non-empty string is a claim, and the point is that
    // the claim is contradicted by the bytes, not that the sha is wrong.
    const { dir } = makeFixture(t, { basis: 'deadbee' });
    const out = check(dir);
    assert.equal(out.staleBasisClaims, 1);
    const claim = out.findings.find((f) => f.kind === 'stale-basis-claim');
    assert.ok(claim, 'expected a stale-basis-claim finding');
    assert.match(claim.firstDivergentLine, /claims fence_basis_commit/);
    // Ungated: it must not be able to fail a run the divergence did not already fail.
    assert.equal(claim.gated, false);
  });

  it('keeps flagging the divergence when the field is present — the field is not a bypass', (t) => {
    // #552's named mutation, as coverage. If the field ever gates the byte comparison, the
    // gated violation disappears here and this goes red.
    const withField = makeFixture(t, { basis: 'deadbee' });
    const out = check(withField.dir);
    const gated = out.findings.filter((f) => f.gated);
    assert.equal(gated.length, 1, 'the divergent gated fence must still be a violation');
    assert.equal(gated[0].kind, 'diverged');
    assert.equal(out.violations, 1);
  });

  it('flags a claim contradicted by a RETAG, not just by a divergent body', (t) => {
    // The #481 escape: a frozen ```bash fence retagged to ```text leaves the body check
    // entirely, because gating is read off the translated file. The body divergence is then
    // UNGATED, so a body-only predicate sees nothing and the frontmatter's claim goes
    // unchallenged in exactly the case the escape exists to hide.
    const { dir } = makeFixture(t, { basis: 'deadbee' });
    const mirror = join(dir, 'i18n', 'de', 'skills', 'demo-skill', 'SKILL.md');
    writeFileSync(mirror, readFileSync(mirror, 'utf8').replace('```bash', '```text'), 'utf8');

    const out = check(dir);
    const claim = out.findings.find((f) => f.kind === 'stale-basis-claim');
    assert.ok(claim, 'a retag must contradict the claim too');
    assert.match(claim.firstDivergentLine, /tag sequence appears in no English revision/);
    // The structural finding is still what fails the run; the claim finding stays ungated.
    assert.equal(claim.gated, false);
    assert.ok(out.findings.some((f) => f.kind === 'tag-sequence' && f.gated));
  });

  it('flags a claim contradicted by DRIFT, which no longer blocks (#598)', (t) => {
    // The invariant most at risk in the #598 split. Drift stopped being a violation; it must not
    // stop falsifying a claim. `mirrorsBasis` requires the exact folded sequence, so a file whose
    // structure matches no revision cannot be carrying the fences of the one it names — true
    // whether or not the mismatch freed a fence from the gate. Narrowing `structureContradicts`
    // to escapes would un-flag exactly the partial-update files #598 catalogued, and every other
    // assertion in this file would stay green.
    const { dir } = makeFixture(t, { basis: 'deadbee', fence: ENGLISH_FENCE });
    const mirror = join(dir, 'i18n', 'de', 'skills', 'demo-skill', 'SKILL.md');
    // ```bash -> ```yaml. Both frozen, body untouched: drift, not an escape.
    writeFileSync(mirror, readFileSync(mirror, 'utf8').replace('```bash', '```yaml'), 'utf8');

    const out = check(dir);
    assert.equal(out.tagSequenceDrift, 1, 'the fixture must actually produce drift');
    assert.equal(out.violations, 0, 'and drift must not fail the run');

    const claim = out.findings.find((f) => f.kind === 'stale-basis-claim');
    assert.ok(claim, 'drift still contradicts the frontmatter claim');
    assert.match(claim.firstDivergentLine, /tag sequence appears in no English revision/);
    assert.equal(claim.gated, false);
    assert.equal(out.staleBasisClaims, 1);
  });

  it('flags a claim on a file no English revision has the fence count for', (t) => {
    // `unalignable` is not a violation — without a count match there is no position to compare.
    // It IS a contradicted claim: verified-against-X implies the count equals X's count, so an
    // unalignable file cannot be carrying X's fences.
    //
    // The duplicated fence must repeat a body English HAS, not a novel one. A novel body is a
    // gated divergence, which fires the body branch first and proves nothing about this path —
    // the first version of this test did exactly that and asserted the wrong message.
    const { dir } = makeFixture(t, { basis: 'deadbee', fence: ENGLISH_FENCE });
    const mirror = join(dir, 'i18n', 'de', 'skills', 'demo-skill', 'SKILL.md');
    writeFileSync(mirror, `${readFileSync(mirror, 'utf8')}\n\`\`\`bash\n${ENGLISH_FENCE}\n\`\`\`\n`, 'utf8');

    const out = check(dir);
    const claim = out.findings.find((f) => f.kind === 'stale-basis-claim');
    assert.ok(claim, 'an unalignable file carrying a claim must be flagged');
    assert.match(claim.firstDivergentLine, /no English revision has its fence count/);
    assert.equal(claim.gated, false);
    // Still not a violation: unalignable must not become one via this route.
    assert.equal(out.violations, 0);
    assert.equal(out.tagSequenceUnalignable, 1);
  });

  it('a verified file with matching fences carries its claim cleanly', (t) => {
    const { dir } = makeFixture(t, { basis: 'deadbee', fence: ENGLISH_FENCE });
    const out = check(dir);
    assert.equal(out.violations, 0, 'a byte-identical fence is not a violation');
    assert.equal(out.staleBasisClaims, 0, 'no divergence means no false claim');
  });
});
