/**
 * Unit tests for `contentKey()`, which since #559 is defined in `scripts/lib/content-paths.js`
 * and re-exported from `scripts/lib/fences.js`.
 *
 * The import below deliberately keeps going through `fences.js`. That is the path four modules
 * use, so testing it is what proves the re-export still resolves — importing from
 * `content-paths.js` directly would test the definition while leaving every real caller's route
 * unexercised.
 *
 * There was no test file for this module at all, and that is how #519 survived: every
 * skills path any fixture in `scripts/test/` constructs is the 3-segment
 * `skills/<id>/SKILL.md`, where `parts[1]` and `parts[parts.length - 2]` are the SAME
 * value. So the whole suite stayed green against `const id = parts[1]`, which would re-key
 * every pre-flatten `skills/<domain>/<id>/SKILL.md` blob to its *domain* — silently
 * emptying the historical basis for those skills and manufacturing violations across the
 * corpus.
 *
 * The pre-flatten case is therefore asserted here directly, because prose in the function
 * saying "second-to-last, never parts[1]" is an assertion nobody ran.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contentKey } from '../lib/fences.js';

test('a pre-flatten skills path keys to the same id as the flattened one', () => {
  // The whole reason the nested branch uses parts[parts.length - 2]. ~42% of the blobs in
  // this repo's history sit at the pre-flatten path.
  assert.equal(contentKey('skills/r-packages/create-r-package/SKILL.md'), 'skills/create-r-package');
  assert.equal(contentKey('skills/create-r-package/SKILL.md'), 'skills/create-r-package');
  // Deeper nesting still keys off the directory holding SKILL.md.
  assert.equal(contentKey('skills/a/b/c/demo/SKILL.md'), 'skills/demo');
});

test('flat trees key off the filename stem', () => {
  assert.equal(contentKey('guides/agent-best-practices.md'), 'guides/agent-best-practices');
  assert.equal(contentKey('agents/r-developer.md'), 'agents/r-developer');
  assert.equal(contentKey('teams/visual-pr-review.md'), 'teams/visual-pr-review');
});

test('templates and READMEs are not content, in EITHER branch', () => {
  // The #519 defect: the exclusion lived only in the flat branch.
  assert.equal(contentKey('skills/_template/SKILL.md'), null);
  assert.equal(contentKey('skills/_scratch/SKILL.md'), null);
  assert.equal(contentKey('agents/_template.md'), null);
  assert.equal(contentKey('guides/_template.md'), null);
  assert.equal(contentKey('skills/README.md'), null);
  assert.equal(contentKey('guides/README.md'), null);
  // And the residual asymmetry: a raw segment vs a stripped stem. `isExcludedId` now
  // strips `.md` itself so both branches can hand it the same kind of thing.
  assert.equal(contentKey('skills/README.md/SKILL.md'), null);
  assert.equal(contentKey('skills/_template.md/SKILL.md'), null);
});

test('non-content paths return null rather than a bogus key', () => {
  assert.equal(contentKey('i18n/de/skills/demo/SKILL.md'), null, 'mirror paths must not key');
  assert.equal(contentKey('scripts/lib/fences.js'), null);
  assert.equal(contentKey('README.md'), null);
  assert.equal(contentKey('skills'), null);
  assert.equal(contentKey('skills/'), null);
  assert.equal(contentKey('skills/SKILL.md'), null, 'a tree-level SKILL.md has no id');
  assert.equal(contentKey('guides/nested/dir/page.md'), null, 'flat trees are flat');
});
