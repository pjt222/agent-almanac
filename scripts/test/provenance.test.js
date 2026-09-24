/**
 * provenance.test.js — the two-field provenance schema (#552).
 *
 * These pin the three properties the schema rests on, each of which has a named failure the
 * repo has already paid for once:
 *
 *   - the reader is ANCHORED to frontmatter, because the reader it replaces in
 *     `generate-translation-status.js` is not, and an unanchored one reads a `source_commit:`
 *     written inside a body fence as metadata;
 *   - the stamper places the new field beside its SIBLING rather than at a fixed depth, because
 *     the corpus nests these fields differently per file and a fixed depth writes valid-looking
 *     YAML into the wrong block — the `sed '/^  tags:/a\'` scaffold bug;
 *   - the field NAME cannot contain `source_commit`, because that unanchored reader would
 *     capture it.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  SOURCE_COMMIT_FIELD,
  FENCE_BASIS_FIELD,
  readFrontmatterField,
  stampFrontmatterField,
  clearFrontmatterField,
} from '../lib/provenance.js';
import { frontmatterUnparsed } from '../lib/translation-status.js';

const flat = [
  '---',
  'name: commit-changes',
  'locale: de',
  'source_locale: en',
  'source_commit: abc1234',
  'translator: Claude plus human review',
  '---',
  '',
  '# Body',
  '',
].join('\n');

const nested = [
  '---',
  'name: commit-changes',
  'metadata:',
  '  locale: de',
  '  source_locale: en',
  '  source_commit: abc1234',
  '---',
  '',
  '# Body',
  '',
].join('\n');

describe('provenance: field names', () => {
  it('the new field name cannot contain the old one', () => {
    // `generate-translation-status.js` matches /source_commit:.../ with no `^` anchor, so a
    // name like `mirror_source_commit` would be read as the old field wherever it appeared.
    // This is the guard on that reasoning, not a style assertion.
    assert.equal(FENCE_BASIS_FIELD.includes(SOURCE_COMMIT_FIELD), false);
    assert.notEqual(FENCE_BASIS_FIELD, SOURCE_COMMIT_FIELD);
  });
});

describe('provenance: the frontmatter-mask tripwire covers the new field', () => {
  // A provenance field missing from `FRONTMATTER_KEYS` is not cosmetic. When `stripFrontmatter`
  // fails open — it returns the whole text when it cannot find two `---` lines — the field
  // becomes body. It is short, it clears the substantive filter, and it sits in no English
  // pool, so it reads as novel prose and pushes a scaffold toward TRANSLATED. That is the exact
  // measured failure recorded above `frontmatterUnparsed`, which went `no-novel-lines` to
  // `has-novel-lines` on four lines of a file's own metadata.
  it('detects fence_basis_commit surviving into the body', () => {
    assert.equal(frontmatterUnparsed(`${FENCE_BASIS_FIELD}: ff00ff0\n`), true);
  });

  it('still detects the field it was written for', () => {
    assert.equal(frontmatterUnparsed(`${SOURCE_COMMIT_FIELD}: abc1234\n`), true);
  });

  it('does not fire on ordinary prose', () => {
    assert.equal(frontmatterUnparsed('This paragraph mentions a commit.\n'), false);
  });
});

describe('provenance: readFrontmatterField', () => {
  it('reads a top-level field', () => {
    assert.equal(readFrontmatterField(flat, SOURCE_COMMIT_FIELD), 'abc1234');
  });

  it('reads an indented field, because nesting varies per file', () => {
    assert.equal(readFrontmatterField(nested, SOURCE_COMMIT_FIELD), 'abc1234');
  });

  it('is anchored to frontmatter and ignores a lookalike in the body', () => {
    const decoy = [
      '---',
      'name: x',
      'locale: de',
      '---',
      '',
      'Example frontmatter you might write:',
      '',
      '```yaml',
      'source_commit: deadbee',
      '```',
      '',
    ].join('\n');
    // The unanchored reader this replaces returns 'deadbee' here.
    assert.equal(readFrontmatterField(decoy, SOURCE_COMMIT_FIELD), null);
  });

  it('strips quotes and a trailing YAML comment', () => {
    const quoted = flat.replace('source_commit: abc1234', 'source_commit: "abc1234"  # scaffolded');
    assert.equal(readFrontmatterField(quoted, SOURCE_COMMIT_FIELD), 'abc1234');
  });

  it('returns null when the file has no frontmatter', () => {
    assert.equal(readFrontmatterField('# Just a body\n', SOURCE_COMMIT_FIELD), null);
  });

  it('returns null for an absent field', () => {
    assert.equal(readFrontmatterField(flat, FENCE_BASIS_FIELD), null);
  });
});

describe('provenance: stampFrontmatterField', () => {
  it('inserts beside source_commit at top level, and reads back', () => {
    const out = stampFrontmatterField(flat, FENCE_BASIS_FIELD, 'ff00ff0');
    assert.ok(out);
    assert.equal(readFrontmatterField(out, FENCE_BASIS_FIELD), 'ff00ff0');
    assert.equal(readFrontmatterField(out, SOURCE_COMMIT_FIELD), 'abc1234', 'must not disturb the old field');
    assert.match(out, /^source_commit: abc1234\nfence_basis_commit: ff00ff0$/m);
  });

  it('copies the anchor indentation when the block is nested', () => {
    const out = stampFrontmatterField(nested, FENCE_BASIS_FIELD, 'ff00ff0');
    assert.ok(out);
    // Two spaces, matching its sibling — not column 0, which would leave the `metadata:` block
    // and change the field's meaning while still parsing as YAML.
    assert.match(out, /^ {2}source_commit: abc1234\n {2}fence_basis_commit: ff00ff0$/m);
    assert.equal(readFrontmatterField(out, FENCE_BASIS_FIELD), 'ff00ff0');
  });

  it('replaces an existing value rather than adding a second line', () => {
    const once = stampFrontmatterField(flat, FENCE_BASIS_FIELD, 'aaaaaaa');
    const twice = stampFrontmatterField(once, FENCE_BASIS_FIELD, 'bbbbbbb');
    assert.equal(readFrontmatterField(twice, FENCE_BASIS_FIELD), 'bbbbbbb');
    assert.equal(twice.match(/fence_basis_commit:/g).length, 1);
  });

  it('preserves indentation when replacing a nested value', () => {
    const once = stampFrontmatterField(nested, FENCE_BASIS_FIELD, 'aaaaaaa');
    const twice = stampFrontmatterField(once, FENCE_BASIS_FIELD, 'bbbbbbb');
    assert.match(twice, /^ {2}fence_basis_commit: bbbbbbb$/m);
  });

  it('refuses when there is no anchor field, rather than guessing a depth', () => {
    const anchorless = ['---', 'name: x', 'locale: de', '---', '', 'body', ''].join('\n');
    assert.equal(stampFrontmatterField(anchorless, FENCE_BASIS_FIELD, 'ff00ff0'), null);
  });

  it('refuses when there is no frontmatter', () => {
    assert.equal(stampFrontmatterField('# body\n', FENCE_BASIS_FIELD, 'ff00ff0'), null);
  });

  it('leaves the body untouched', () => {
    const withBody = flat + '\n```yaml\nkey: value\n```\n';
    const out = stampFrontmatterField(withBody, FENCE_BASIS_FIELD, 'ff00ff0');
    assert.ok(out.endsWith('```yaml\nkey: value\n```\n'));
  });
});

describe('provenance: $-patterns in frontmatter are data, not substitutions', () => {
  // `String.prototype.replace` expands `$$`, `$&`, backtick-$ and `$'` in the replacement even
  // when the search argument is a plain STRING, and every replacement in this module is derived
  // from the file's own frontmatter. Before the fix, stamping this fixture spliced the whole
  // remainder of the file back in and duplicated the body — inside frontmatter, where the fence
  // gate is blind. Zero corpus files carry such a value today; this is the write path the
  // backfill runs over ~3,644 of them.
  const dollars = [
    '---',
    'name: demo',
    'source_commit: abc1234',
    "description: shell docs mentioning $' and $& and $$ and $`",
    '---',
    '',
    '# Body',
    '',
    'SENTINEL-BODY-LINE',
    '',
  ].join('\n');

  it('stamps without corrupting a $-bearing frontmatter', () => {
    const out = stampFrontmatterField(dollars, FENCE_BASIS_FIELD, 'ff00ff0');
    assert.ok(out);
    assert.equal(readFrontmatterField(out, FENCE_BASIS_FIELD), 'ff00ff0');
    assert.equal(readFrontmatterField(out, SOURCE_COMMIT_FIELD), 'abc1234');
    // The description survives verbatim, and the body appears exactly once.
    assert.ok(out.includes("description: shell docs mentioning $' and $& and $$ and $`"));
    assert.equal(out.match(/SENTINEL-BODY-LINE/g).length, 1);
    assert.equal(out.match(/^---$/gm).length, 2, 'exactly one frontmatter block');
  });

  it('clears without corrupting a $-bearing frontmatter', () => {
    const stamped = stampFrontmatterField(dollars, FENCE_BASIS_FIELD, 'ff00ff0');
    assert.equal(clearFrontmatterField(stamped, FENCE_BASIS_FIELD), dollars,
      'stamp then clear must round-trip to the original bytes');
  });

  it('a $-bearing VALUE is written literally', () => {
    const out = stampFrontmatterField(flat, FENCE_BASIS_FIELD, '$&evil');
    assert.equal(readFrontmatterField(out, FENCE_BASIS_FIELD), '$&evil');
    assert.equal(out.match(/SENTINEL/g), null);
  });
});

describe('provenance: clearFrontmatterField', () => {
  it('removes the field', () => {
    const stamped = stampFrontmatterField(flat, FENCE_BASIS_FIELD, 'ff00ff0');
    const cleared = clearFrontmatterField(stamped, FENCE_BASIS_FIELD);
    assert.equal(readFrontmatterField(cleared, FENCE_BASIS_FIELD), null);
    assert.equal(readFrontmatterField(cleared, SOURCE_COMMIT_FIELD), 'abc1234');
  });

  it('round-trips back to the original text', () => {
    const stamped = stampFrontmatterField(flat, FENCE_BASIS_FIELD, 'ff00ff0');
    assert.equal(clearFrontmatterField(stamped, FENCE_BASIS_FIELD), flat);
  });

  it('is a no-op when the field is absent', () => {
    assert.equal(clearFrontmatterField(flat, FENCE_BASIS_FIELD), flat);
  });

  it('removes a nested field without disturbing its siblings', () => {
    const stamped = stampFrontmatterField(nested, FENCE_BASIS_FIELD, 'ff00ff0');
    assert.equal(clearFrontmatterField(stamped, FENCE_BASIS_FIELD), nested);
  });
});
