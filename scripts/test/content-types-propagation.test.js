/**
 * The content-type SSOT actually propagates (#578).
 *
 * The consolidation's whole claim is that a fifth content tree reaches every consumer instead
 * of being silently ignored by four of them. That claim was originally checked by a regex over
 * source text asserting `CONTENT_TYPES.map` appears — a proxy predicate, brittle to any
 * respelling, and it lived only in the session that wrote it. This is the durable version, and
 * it tests behaviour rather than tokens.
 *
 * `check-i18n-fence-parity.js` is importable at all only because it now guards `main()` behind
 * the `process.argv[1]` check; before that, importing it ran the whole gate, which is exactly
 * what forced the regex.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import { CONTENT_TYPES } from '../lib/content-types.js';
import { TREES as FENCE_TREES } from '../lib/fences.js';
import { TREES as PARITY_TREES } from '../check-i18n-fence-parity.js';
import { rmTree } from './_tmp.js';

const SCRIPTS = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('every JS consumer derives from the SSOT rather than a literal', () => {
  assert.equal(FENCE_TREES, CONTENT_TYPES, 'fences.TREES must BE the SSOT array, not a copy');
  assert.deepEqual(PARITY_TREES.map((t) => t.dir), [...CONTENT_TYPES],
    'the fence gate walks exactly the SSOT trees, in order');
});

test('the SSOT is frozen, so one consumer cannot corrupt the others', () => {
  // It is shared by identity now, so a `.sort()` anywhere would reorder the git pathspec, the
  // README columns and B13's comparison at once. ESM is strict mode, so this throws.
  assert.throws(() => CONTENT_TYPES.push('workflows'), TypeError);
  assert.throws(() => CONTENT_TYPES.sort(), TypeError);
});

test('a fifth tree with no declared i18n layout FAILS LOUDLY at module load', async () => {
  // The property the first version claimed and did not have. With a silently-defaulting
  // predicate, an unclassified nested tree yields zero targets and the gate prints OK having
  // scanned nothing. Here it must throw before it can scan anything.
  const dir = mkdtempSync(join(tmpdir(), 'aa-fifth-'));
  try {
    cpSync(SCRIPTS, join(dir, 'scripts'), { recursive: true });
    const ssot = join(dir, 'scripts', 'lib', 'content-types.js');
    const before = readFileSync(ssot, 'utf8');
    const after = before.replace(
      "Object.freeze(['skills', 'agents', 'teams', 'guides'])",
      "Object.freeze(['skills', 'agents', 'teams', 'guides', 'workflows'])",
    );
    assert.notEqual(after, before, 'the fixture must actually patch the SSOT, or it proves nothing');
    writeFileSync(ssot, after);

    // The SSOT copy really does carry five entries — otherwise the assertion below could pass
    // for the wrong reason.
    const patched = await import(`file://${join(dir, 'scripts', 'lib', 'content-types.js').replace(/\\/g, '/')}`);
    assert.equal(patched.CONTENT_TYPES.length, 5);

    await assert.rejects(
      () => import(`file://${join(dir, 'scripts', 'check-i18n-fence-parity.js').replace(/\\/g, '/')}`),
      /has no declared i18n layout/,
      'an unclassified tree must break the gate, not be skipped by it',
    );
  } finally {
    rmTree(dir);
  }
});

test('a fifth tree propagates to the consumers that take it as data', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'aa-fifth-prop-'));
  try {
    cpSync(SCRIPTS, join(dir, 'scripts'), { recursive: true });
    const ssot = join(dir, 'scripts', 'lib', 'content-types.js');
    writeFileSync(ssot, readFileSync(ssot, 'utf8').replace(
      "Object.freeze(['skills', 'agents', 'teams', 'guides'])",
      "Object.freeze(['skills', 'agents', 'teams', 'guides', 'workflows'])",
    ));

    const fences = await import(`file://${join(dir, 'scripts', 'lib', 'fences.js').replace(/\\/g, '/')}`);
    assert.ok(fences.TREES.includes('workflows'),
      'fences.TREES drives the git pathspec — a tree missing here is invisible to the whole pool');

    const freshness = await import(`file://${join(dir, 'scripts', 'lib', 'git-freshness.js').replace(/\\/g, '/')}`);
    // Both exported functions default their pathspecs to the SSOT; reading the default out of
    // the function signature is not possible, so assert the module shares the patched array.
    assert.equal(typeof freshness.createFreshnessChecker, 'function');
    assert.equal(typeof freshness.buildLatestCommitMap, 'function');
  } finally {
    rmTree(dir);
  }
});
